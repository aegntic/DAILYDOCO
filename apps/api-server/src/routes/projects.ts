import express from 'express';
import { z } from 'zod';
import { validateRequest, validateQuery, validateParams } from '../middleware/validation.js';
import { requireSubscription } from '../middleware/auth.js';
import { logger } from '../config/logger.js';

const router = express.Router();

// Validation schemas
const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  gitRepository: z.string().url('Valid Git URL required').optional(),
  framework: z.enum(['react', 'vue', 'angular', 'node', 'python', 'rust', 'other']).optional(),
  captureSettings: z.object({
    quality: z.enum(['720p', '1080p', '1440p', '4k']).default('1080p'),
    fps: z.number().min(15).max(60).default(30),
    includeAudio: z.boolean().default(true),
    enablePrivacyFilter: z.boolean().default(true),
  }).default({})
});

const UpdateProjectSchema = CreateProjectSchema.partial();

const ProjectQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  search: z.string().optional(),
  framework: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

const ProjectParamsSchema = z.object({
  projectId: z.string().uuid('Valid project ID required')
});

// Temporary in-memory project store
interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  gitRepository?: string;
  framework?: string;
  captureSettings: {
    quality: string;
    fps: number;
    includeAudio: boolean;
    enablePrivacyFilter: boolean;
  };
  status: 'active' | 'archived' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
  lastCaptureAt?: Date;
  totalVideos: number;
  totalDuration: number; // seconds
}

const projects: Map<string, Project> = new Map();

/**
 * GET /api/projects
 * List user's projects with pagination and filtering
 */
router.get('/', validateQuery(ProjectQuerySchema), async (req, res) => {
  try {
    const { page, limit, search, framework, sortBy, sortOrder } = req.query as any;
    const userId = req.user!.userId;

    // Filter projects by user
    let userProjects = Array.from(projects.values())
      .filter(p => p.userId === userId && p.status !== 'deleted');

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      userProjects = userProjects.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply framework filter
    if (framework) {
      userProjects = userProjects.filter(p => p.framework === framework);
    }

    // Apply sorting
    userProjects.sort((a, b) => {
      const aValue = a[sortBy as keyof Project];
      const bValue = b[sortBy as keyof Project];
      
      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : 1;
      } else {
        return aValue < bValue ? -1 : 1;
      }
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProjects = userProjects.slice(startIndex, endIndex);

    // Calculate pagination metadata
    const totalProjects = userProjects.length;
    const totalPages = Math.ceil(totalProjects / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    logger.info('Projects listed', {
      userId,
      totalProjects,
      page,
      limit,
      search,
      framework
    });

    res.json({
      projects: paginatedProjects,
      pagination: {
        currentPage: page,
        totalPages,
        totalProjects,
        hasNextPage,
        hasPrevPage,
        limit
      },
      filters: {
        search,
        framework,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    logger.error('Failed to list projects', { error, userId: req.user?.userId });
    res.status(500).json({
      error: 'Failed to fetch projects',
      message: 'Unable to retrieve your projects at this time'
    });
  }
});

/**
 * POST /api/projects
 * Create a new project
 */
router.post('/', 
  requireSubscription(['free', 'pro', 'team', 'enterprise']),
  validateRequest(CreateProjectSchema), 
  async (req, res) => {
    try {
      const userId = req.user!.userId;
      const projectData = req.body;

      // Check project limits based on subscription
      const userProjects = Array.from(projects.values())
        .filter(p => p.userId === userId && p.status !== 'deleted');

      const subscription = req.user!.subscription;
      const projectLimits = {
        free: 3,
        pro: 50,
        team: 200,
        enterprise: Infinity
      };

      if (userProjects.length >= projectLimits[subscription]) {
        return res.status(402).json({
          error: 'Project limit reached',
          message: `Your ${subscription} subscription allows up to ${projectLimits[subscription]} projects`,
          currentProjects: userProjects.length,
          maxProjects: projectLimits[subscription],
          upgradeUrl: '/upgrade'
        });
      }

      // Create project
      const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const project: Project = {
        id: projectId,
        userId,
        name: projectData.name,
        description: projectData.description,
        gitRepository: projectData.gitRepository,
        framework: projectData.framework,
        captureSettings: projectData.captureSettings,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        totalVideos: 0,
        totalDuration: 0
      };

      projects.set(projectId, project);

      logger.info('Project created', {
        projectId,
        userId,
        name: project.name,
        subscription
      });

      res.status(201).json({
        message: 'Project created successfully',
        project
      });

    } catch (error) {
      logger.error('Failed to create project', { error, userId: req.user?.userId });
      res.status(500).json({
        error: 'Failed to create project',
        message: 'Unable to create project at this time'
      });
    }
  }
);

/**
 * GET /api/projects/:projectId
 * Get project details
 */
router.get('/:projectId', 
  validateParams(ProjectParamsSchema), 
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.user!.userId;

      const project = projects.get(projectId);
      if (!project || project.userId !== userId || project.status === 'deleted') {
        return res.status(404).json({
          error: 'Project not found',
          message: 'The requested project does not exist or you do not have access to it'
        });
      }

      res.json({
        project
      });

    } catch (error) {
      logger.error('Failed to get project', { error, projectId: req.params.projectId });
      res.status(500).json({
        error: 'Failed to fetch project',
        message: 'Unable to retrieve project details at this time'
      });
    }
  }
);

/**
 * PUT /api/projects/:projectId
 * Update project
 */
router.put('/:projectId',
  validateParams(ProjectParamsSchema),
  validateRequest(UpdateProjectSchema),
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.user!.userId;
      const updates = req.body;

      const project = projects.get(projectId);
      if (!project || project.userId !== userId || project.status === 'deleted') {
        return res.status(404).json({
          error: 'Project not found',
          message: 'The requested project does not exist or you do not have access to it'
        });
      }

      // Update project
      const updatedProject = {
        ...project,
        ...updates,
        updatedAt: new Date()
      };

      projects.set(projectId, updatedProject);

      logger.info('Project updated', {
        projectId,
        userId,
        updates: Object.keys(updates)
      });

      res.json({
        message: 'Project updated successfully',
        project: updatedProject
      });

    } catch (error) {
      logger.error('Failed to update project', { error, projectId: req.params.projectId });
      res.status(500).json({
        error: 'Failed to update project',
        message: 'Unable to update project at this time'
      });
    }
  }
);

/**
 * DELETE /api/projects/:projectId
 * Delete (archive) project
 */
router.delete('/:projectId',
  validateParams(ProjectParamsSchema),
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.user!.userId;

      const project = projects.get(projectId);
      if (!project || project.userId !== userId || project.status === 'deleted') {
        return res.status(404).json({
          error: 'Project not found',
          message: 'The requested project does not exist or you do not have access to it'
        });
      }

      // Soft delete (archive) the project
      project.status = 'deleted';
      project.updatedAt = new Date();
      projects.set(projectId, project);

      logger.info('Project deleted', { projectId, userId });

      res.json({
        message: 'Project deleted successfully'
      });

    } catch (error) {
      logger.error('Failed to delete project', { error, projectId: req.params.projectId });
      res.status(500).json({
        error: 'Failed to delete project',
        message: 'Unable to delete project at this time'
      });
    }
  }
);

export { router as projectRouter };