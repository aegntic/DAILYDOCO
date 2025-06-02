import express from 'express';
import { z } from 'zod';
import { validateRequest, validateParams } from '../middleware/validation.js';
import { requireSubscription } from '../middleware/auth.js';
import { logger } from '../config/logger.js';

const router = express.Router();

// Validation schemas
const StartCaptureSchema = z.object({
  projectId: z.string().uuid('Valid project ID required'),
  quality: z.enum(['720p', '1080p', '1440p', '4k']).default('1080p'),
  fps: z.number().min(15).max(60).default(30),
  includeAudio: z.boolean().default(true),
  enablePrivacyFilter: z.boolean().default(true),
  captureRegion: z.object({
    x: z.number().min(0),
    y: z.number().min(0),
    width: z.number().min(100),
    height: z.number().min(100)
  }).optional()
});

const SessionParamsSchema = z.object({
  sessionId: z.string().uuid('Valid session ID required')
});

// Temporary in-memory session store
interface CaptureSession {
  id: string;
  userId: string;
  projectId: string;
  status: 'starting' | 'recording' | 'paused' | 'stopped' | 'processing' | 'completed' | 'failed';
  settings: {
    quality: string;
    fps: number;
    includeAudio: boolean;
    enablePrivacyFilter: boolean;
    captureRegion?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
  startedAt: Date;
  endedAt?: Date;
  duration: number; // seconds
  framesCaptured: number;
  framesDropped: number;
  fileSize: number; // bytes
  outputPath?: string;
  errorMessage?: string;
  performance: {
    avgCpuUsage: number;
    avgMemoryUsage: number;
    avgFps: number;
  };
}

const captureSessions: Map<string, CaptureSession> = new Map();

/**
 * POST /api/capture/start
 * Start a new capture session
 */
router.post('/start',
  requireSubscription(['free', 'pro', 'team', 'enterprise']),
  validateRequest(StartCaptureSchema),
  async (req, res) => {
    try {
      const userId = req.user!.userId;
      const { projectId, quality, fps, includeAudio, enablePrivacyFilter, captureRegion } = req.body;

      // Check if there's already an active session for this user
      const existingSession = Array.from(captureSessions.values())
        .find(s => s.userId === userId && ['starting', 'recording', 'paused'].includes(s.status));

      if (existingSession) {
        return res.status(409).json({
          error: 'Capture already in progress',
          message: 'You already have an active capture session. Please stop it before starting a new one.',
          activeSession: {
            id: existingSession.id,
            projectId: existingSession.projectId,
            status: existingSession.status,
            startedAt: existingSession.startedAt
          }
        });
      }

      // Check subscription limits
      const subscription = req.user!.subscription;
      const qualityLimits = {
        free: ['720p'],
        pro: ['720p', '1080p', '1440p'],
        team: ['720p', '1080p', '1440p', '4k'],
        enterprise: ['720p', '1080p', '1440p', '4k']
      };

      if (!qualityLimits[subscription].includes(quality)) {
        return res.status(402).json({
          error: 'Quality not available',
          message: `${quality} recording requires ${quality === '4k' ? 'Team or Enterprise' : 'Pro or higher'} subscription`,
          availableQualities: qualityLimits[subscription],
          upgradeUrl: '/upgrade'
        });
      }

      // Create capture session
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const session: CaptureSession = {
        id: sessionId,
        userId,
        projectId,
        status: 'starting',
        settings: {
          quality,
          fps,
          includeAudio,
          enablePrivacyFilter,
          captureRegion
        },
        startedAt: new Date(),
        duration: 0,
        framesCaptured: 0,
        framesDropped: 0,
        fileSize: 0,
        performance: {
          avgCpuUsage: 0,
          avgMemoryUsage: 0,
          avgFps: 0
        }
      };

      captureSessions.set(sessionId, session);

      // Simulate starting capture process
      setTimeout(() => {
        const updatedSession = captureSessions.get(sessionId);
        if (updatedSession && updatedSession.status === 'starting') {
          updatedSession.status = 'recording';
          captureSessions.set(sessionId, updatedSession);
        }
      }, 2000);

      logger.info('Capture session started', {
        sessionId,
        userId,
        projectId,
        quality,
        fps
      });

      res.status(201).json({
        message: 'Capture session started successfully',
        session: {
          id: session.id,
          projectId: session.projectId,
          status: session.status,
          settings: session.settings,
          startedAt: session.startedAt
        }
      });

    } catch (error) {
      logger.error('Failed to start capture', { error, userId: req.user?.userId });
      res.status(500).json({
        error: 'Failed to start capture',
        message: 'Unable to start capture session at this time'
      });
    }
  }
);

/**
 * POST /api/capture/:sessionId/stop
 * Stop capture session
 */
router.post('/:sessionId/stop',
  validateParams(SessionParamsSchema),
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user!.userId;

      const session = captureSessions.get(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({
          error: 'Session not found',
          message: 'The requested capture session does not exist or you do not have access to it'
        });
      }

      if (!['recording', 'paused'].includes(session.status)) {
        return res.status(400).json({
          error: 'Invalid session state',
          message: `Cannot stop session in ${session.status} state`
        });
      }

      // Update session
      session.status = 'stopped';
      session.endedAt = new Date();
      session.duration = Math.floor((session.endedAt.getTime() - session.startedAt.getTime()) / 1000);
      
      // Simulate processing
      setTimeout(() => {
        const updatedSession = captureSessions.get(sessionId);
        if (updatedSession && updatedSession.status === 'stopped') {
          updatedSession.status = 'processing';
          captureSessions.set(sessionId, updatedSession);
          
          // Simulate completion
          setTimeout(() => {
            const finalSession = captureSessions.get(sessionId);
            if (finalSession && finalSession.status === 'processing') {
              finalSession.status = 'completed';
              finalSession.outputPath = `/videos/${sessionId}.mp4`;
              finalSession.fileSize = Math.floor(Math.random() * 1000000000); // Random file size
              captureSessions.set(sessionId, finalSession);
            }
          }, 5000);
        }
      }, 1000);

      captureSessions.set(sessionId, session);

      logger.info('Capture session stopped', {
        sessionId,
        userId,
        duration: session.duration
      });

      res.json({
        message: 'Capture session stopped successfully',
        session: {
          id: session.id,
          status: session.status,
          duration: session.duration,
          endedAt: session.endedAt
        }
      });

    } catch (error) {
      logger.error('Failed to stop capture', { error, sessionId: req.params.sessionId });
      res.status(500).json({
        error: 'Failed to stop capture',
        message: 'Unable to stop capture session at this time'
      });
    }
  }
);

/**
 * POST /api/capture/:sessionId/pause
 * Pause capture session
 */
router.post('/:sessionId/pause',
  validateParams(SessionParamsSchema),
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user!.userId;

      const session = captureSessions.get(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({
          error: 'Session not found',
          message: 'The requested capture session does not exist or you do not have access to it'
        });
      }

      if (session.status !== 'recording') {
        return res.status(400).json({
          error: 'Invalid session state',
          message: `Cannot pause session in ${session.status} state`
        });
      }

      session.status = 'paused';
      captureSessions.set(sessionId, session);

      logger.info('Capture session paused', { sessionId, userId });

      res.json({
        message: 'Capture session paused successfully',
        session: {
          id: session.id,
          status: session.status
        }
      });

    } catch (error) {
      logger.error('Failed to pause capture', { error, sessionId: req.params.sessionId });
      res.status(500).json({
        error: 'Failed to pause capture',
        message: 'Unable to pause capture session at this time'
      });
    }
  }
);

/**
 * POST /api/capture/:sessionId/resume
 * Resume capture session
 */
router.post('/:sessionId/resume',
  validateParams(SessionParamsSchema),
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user!.userId;

      const session = captureSessions.get(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({
          error: 'Session not found',
          message: 'The requested capture session does not exist or you do not have access to it'
        });
      }

      if (session.status !== 'paused') {
        return res.status(400).json({
          error: 'Invalid session state',
          message: `Cannot resume session in ${session.status} state`
        });
      }

      session.status = 'recording';
      captureSessions.set(sessionId, session);

      logger.info('Capture session resumed', { sessionId, userId });

      res.json({
        message: 'Capture session resumed successfully',
        session: {
          id: session.id,
          status: session.status
        }
      });

    } catch (error) {
      logger.error('Failed to resume capture', { error, sessionId: req.params.sessionId });
      res.status(500).json({
        error: 'Failed to resume capture',
        message: 'Unable to resume capture session at this time'
      });
    }
  }
);

/**
 * GET /api/capture/:sessionId
 * Get capture session details and status
 */
router.get('/:sessionId',
  validateParams(SessionParamsSchema),
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user!.userId;

      const session = captureSessions.get(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({
          error: 'Session not found',
          message: 'The requested capture session does not exist or you do not have access to it'
        });
      }

      // Calculate current duration for active sessions
      if (['recording', 'paused'].includes(session.status)) {
        session.duration = Math.floor((new Date().getTime() - session.startedAt.getTime()) / 1000);
      }

      res.json({
        session
      });

    } catch (error) {
      logger.error('Failed to get capture session', { error, sessionId: req.params.sessionId });
      res.status(500).json({
        error: 'Failed to fetch session',
        message: 'Unable to retrieve capture session details at this time'
      });
    }
  }
);

/**
 * GET /api/capture/sessions
 * List user's capture sessions
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.userId;

    const userSessions = Array.from(captureSessions.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

    res.json({
      sessions: userSessions,
      total: userSessions.length
    });

  } catch (error) {
    logger.error('Failed to list capture sessions', { error, userId: req.user?.userId });
    res.status(500).json({
      error: 'Failed to fetch sessions',
      message: 'Unable to retrieve your capture sessions at this time'
    });
  }
});

export { router as captureRouter };