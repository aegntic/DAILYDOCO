import axios from 'axios'

// API client configuration
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 120000, // Increased to 2 minutes for analysis
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('❌ API Response Error:', error)
    return Promise.reject(error)
  }
)

// Types
export interface YouTubeAnalysisRequest {
  url: string
  options?: {
    include_transcript?: boolean
    include_metadata?: boolean
    generate_suggestions?: boolean
  }
}

export interface YouTubeAnalysisResponse {
  analysis_id: string
  url: string
  status: string
  actionable_insights: Record<string, any>
  selectable_actions: Array<{
    action_id: string
    action_type: string
    title: string
    description: string
    priority: string
    context: Record<string, any>
    rating: {
      feasibility_score: number
      value_score: number
      integration_score: number
      overall_recommendation: string
    }
    suggestions: {
      implementation_tips: string[]
      potential_improvements: string[]
      risk_mitigation: string[]
    }
    dailydoco_notes: Record<string, any>
  }>
  ratings: {
    rating_id: string
    overall_rating: {
      score: number
      grade: string
      tier: string
      priority_score: number
    }
    detailed_ratings: Record<string, any>
    rating_insights: Record<string, any>
    recommendations: string[]
    confidence_level: number
    rating_metadata: Record<string, any>
  }
  enhancement_suggestions: {
    quick_wins: Array<{
      type: string
      priority: string
      title: string
      description: string
      specific_actions: string[]
      estimated_effort: string
      expected_impact: string
      implementation_notes: string
      category: string
      priority_score: number
      feasibility_assessment: string
    }>
    long_term_strategies: Array<Record<string, any>>
    implementation_roadmap: Record<string, any>
    priority_recommendations: Array<Record<string, any>>
  }
  metadata: Record<string, any>
  technical_concepts?: string[]
}

export interface SystemHealth {
  health_score: number
  active_analyses: number
  total_concepts: number
  total_relationships: number
  recent_errors: number
  uptime: number
}

export interface GraphittSnapshot {
  id: string
  version: string
  snapshot_type: string
  timestamp: string
  concepts_count: number
  relationships_count: number
  size_bytes: number
  tags: string[]
}

export interface GraphittiIteration {
  id: string
  version: string
  name: string
  description: string
  created_at: string
  changes_since_parent: number
  stability_rating: number
  major_features: string[]
}

// API methods
export const api = {
  // YouTube Analysis
  async analyzeYouTubeUrl(request: YouTubeAnalysisRequest): Promise<YouTubeAnalysisResponse> {
    const response = await apiClient.post('/analyze', request)
    return response.data
  },

  async getAnalysisHistory(limit: number = 20): Promise<YouTubeAnalysisResponse[]> {
    const response = await apiClient.get(`/intelligence/history?limit=${limit}`)
    // Backend returns { analyses: [], total_count: number }
    return response.data.analyses || []
  },

  async getAnalysisById(analysisId: string): Promise<YouTubeAnalysisResponse> {
    const response = await apiClient.get(`/intelligence/analysis/${analysisId}`)
    return response.data
  },

  // System Health
  async getSystemHealth(): Promise<SystemHealth> {
    const response = await apiClient.get('/health')
    return response.data
  },

  // Knowledge Graph
  async getKnowledgeGraphStats(): Promise<{
    total_concepts: number
    total_relationships: number
    top_concepts: Array<{ name: string; count: number; relevance: number }>
    recent_additions: Array<{ concept: string; timestamp: string }>
  }> {
    const response = await apiClient.get('/graph/stats')
    return response.data
  },

  async searchConcepts(query: string, limit: number = 10): Promise<Array<{
    id: string
    concept_name: string
    concept_type: string
    relevance_score: number
    occurrence_count: number
    relationships: string[]
  }>> {
    const response = await apiClient.get(`/graph/search?q=${encodeURIComponent(query)}&limit=${limit}`)
    return response.data
  },

  // Graphitti Version Management
  async getGraphittiSnapshots(): Promise<GraphittSnapshot[]> {
    const response = await apiClient.get('/graphitti/snapshots')
    return response.data
  },

  async createSnapshot(type: string = 'incremental', name?: string): Promise<{ snapshot_id: string }> {
    const response = await apiClient.post('/graphitti/snapshots', { type, name })
    return response.data
  },

  async getGraphittiIterations(): Promise<GraphittiIteration[]> {
    const response = await apiClient.get('/graphitti/iterations')
    return response.data
  },

  async getGraphittiHealth(): Promise<{
    overall_health_score: number
    health_grade: string
    statistics: Record<string, number>
    recommendations: string[]
  }> {
    const response = await apiClient.get('/graphitti/health')
    return response.data
  },

  // Configuration
  async getConfig(): Promise<{
    openrouter_configured: boolean
    models: Record<string, string>
    version: string
  }> {
    const response = await apiClient.get('/config')
    return response.data
  },

  async updateOpenRouterKey(apiKey: string): Promise<{ success: boolean }> {
    const response = await apiClient.post('/config/openrouter-key', { api_key: apiKey })
    return response.data
  },

  // Real-time analysis status
  async getAnalysisStatus(analysisId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed'
    progress: number
    current_step: string
    estimated_completion: string
  }> {
    const response = await apiClient.get(`/intelligence/status/${analysisId}`)
    return response.data
  }
}

export default api