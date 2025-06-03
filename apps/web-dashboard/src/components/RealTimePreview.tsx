// SPRINT 6: Real-time Preview with Test Audience Results
// TASK-033: Ultra-tier preview system with AI insights

import React, { useState, useEffect, useRef, useCallback } from 'react';

// Mock UI components for standalone compilation
const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>
);
const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 border-b">{children}</div>
);
const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold">{children}</h3>
);
const CardContent = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);
const Badge = ({ children, variant = 'default', className = '' }: { children: React.ReactNode, variant?: string, className?: string }) => (
  <span className={`px-2 py-1 text-xs rounded ${variant === 'destructive' ? 'bg-red-100 text-red-800' : variant === 'secondary' ? 'bg-gray-100 text-gray-800' : variant === 'outline' ? 'border border-gray-300' : 'bg-blue-100 text-blue-800'} ${className}`}>
    {children}
  </span>
);
const Button = ({ children, onClick, variant = 'default', size = 'default', disabled = false, className = '' }: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  variant?: string, 
  size?: string, 
  disabled?: boolean,
  className?: string 
}) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`px-4 py-2 rounded font-medium ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'} ${variant === 'outline' ? 'border border-gray-300 bg-white' : 'bg-blue-600 text-white'} ${size === 'lg' ? 'px-6 py-3' : size === 'sm' ? 'px-2 py-1 text-sm' : ''} ${className}`}
  >
    {children}
  </button>
);
const Progress = ({ value, className = '' }: { value: number, className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${value}%` }} />
  </div>
);

interface RealTimeMetrics {
  timestamp: number;
  engagement: number;
  retention: number;
  attention: number;
  interactionLikelihood: number;
}

interface TestAudienceViewer {
  id: string;
  persona: string;
  currentAttention: number;
  retentionPrediction: number;
  interactionLikelihood: number;
  dropOffRisk: number;
  feedback: string[];
}

interface VideoPreviewState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  volume: number;
  playbackRate: number;
}

interface SegmentInsight {
  startTime: number;
  endTime: number;
  importanceScore: number;
  engagementPrediction: number;
  viewerFeedback: string[];
  suggestedImprovements: string[];
  retentionCurve: number[];
}

interface RealTimePreviewProps {
  videoUrl?: string;
  isLive?: boolean;
  onInsightUpdate?: (insights: SegmentInsight[]) => void;
}

const RealTimePreview: React.FC<RealTimePreviewProps> = ({
  videoUrl = '/demo-video.mp4',
  isLive = true,
  onInsightUpdate
}) => {
  // State management
  const [videoState, setVideoState] = useState<VideoPreviewState>({
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    volume: 1,
    playbackRate: 1
  });

  const [metrics, setMetrics] = useState<RealTimeMetrics[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<RealTimeMetrics | null>(null);
  const [testAudience, setTestAudience] = useState<TestAudienceViewer[]>([]);
  const [segmentInsights, setSegmentInsights] = useState<SegmentInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize real-time analysis
  useEffect(() => {
    initializeAnalysis();
    return () => cleanup();
  }, []);

  // Video time updates
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      const updateTime = () => {
        setVideoState(prev => ({
          ...prev,
          currentTime: video.currentTime,
          duration: video.duration || 0
        }));
      };

      video.addEventListener('timeupdate', updateTime);
      video.addEventListener('loadedmetadata', updateTime);
      
      return () => {
        video.removeEventListener('timeupdate', updateTime);
        video.removeEventListener('loadedmetadata', updateTime);
      };
    }
  }, []);

  // Real-time metrics collection
  useEffect(() => {
    if (isLive && videoState.isPlaying) {
      startMetricsCollection();
    } else {
      stopMetricsCollection();
    }
  }, [isLive, videoState.isPlaying]);

  const initializeAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Initialize WebSocket for real-time updates
    if (isLive) {
      wsRef.current = new WebSocket('ws://localhost:8080/real-time-analysis');
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleRealTimeUpdate(data);
      };
      
      wsRef.current.onopen = () => {
        console.log('Real-time analysis connected');
      };
    }

    // Generate initial test audience
    const audience = generateTestAudience();
    setTestAudience(audience);
    
    setIsAnalyzing(false);
  };

  const cleanup = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current);
    }
  };

  const generateTestAudience = (): TestAudienceViewer[] => {
    const personas = [
      'Senior Developer', 'Junior Developer', 'DevOps Engineer', 'Product Manager',
      'QA Tester', 'Tech Lead', 'Student', 'Freelancer', 'Startup Founder', 'Enterprise Architect'
    ];

    return personas.slice(0, 6).map((persona, index) => ({
      id: `viewer-${index}`,
      persona,
      currentAttention: Math.random() * 0.4 + 0.6, // 60-100%
      retentionPrediction: Math.random() * 0.3 + 0.7, // 70-100%
      interactionLikelihood: Math.random() * 0.5 + 0.3, // 30-80%
      dropOffRisk: Math.random() * 0.3, // 0-30%
      feedback: generateViewerFeedback(persona)
    }));
  };

  const generateViewerFeedback = (persona: string): string[] => {
    const feedbackMap: Record<string, string[]> = {
      'Senior Developer': [
        'Good code structure demonstration',
        'Could explain architectural decisions more',
        'Appreciate the debugging approach'
      ],
      'Junior Developer': [
        'Great explanation of concepts',
        'Would like more step-by-step details',
        'Very helpful for learning'
      ],
      'DevOps Engineer': [
        'Deployment process is clear',
        'Security considerations noted',
        'CI/CD integration looks solid'
      ],
      'Product Manager': [
        'Business value is evident',
        'User impact well demonstrated',
        'Timeline seems reasonable'
      ]
    };

    return feedbackMap[persona] || ['Interesting content', 'Well presented', 'Good pacing'];
  };

  const startMetricsCollection = () => {
    metricsIntervalRef.current = setInterval(() => {
      const newMetric = generateRealTimeMetric();
      
      setMetrics(prev => [...prev.slice(-100), newMetric]); // Keep last 100 points
      setCurrentMetrics(newMetric);
      
      // Update test audience based on current content
      updateTestAudienceReactions(newMetric);
      
      // Analyze segment if needed
      analyzeCurrentSegment(newMetric);
      
    }, 1000); // Update every second
  };

  const stopMetricsCollection = () => {
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current);
      metricsIntervalRef.current = null;
    }
  };

  const generateRealTimeMetric = (): RealTimeMetrics => {
    const currentTime = videoState.currentTime;
    
    // Simulate ML-based analysis
    const engagement = simulateEngagementAnalysis(currentTime);
    const retention = simulateRetentionPrediction(currentTime);
    const attention = simulateAttentionTracking(currentTime);
    const interaction = simulateInteractionLikelihood(currentTime);

    return {
      timestamp: currentTime,
      engagement,
      retention,
      attention,
      interactionLikelihood: interaction
    };
  };

  const simulateEngagementAnalysis = (time: number): number => {
    // Simulate varying engagement based on content type
    const baseEngagement = 0.7;
    const variation = Math.sin(time / 30) * 0.2; // 30-second cycles
    const noise = (Math.random() - 0.5) * 0.1;
    
    return Math.max(0, Math.min(1, baseEngagement + variation + noise));
  };

  const simulateRetentionPrediction = (time: number): number => {
    // Retention typically decreases over time with some variations
    const baseRetention = Math.exp(-time / 300) * 0.3 + 0.7; // Exponential decay
    const contentBoost = Math.sin(time / 45) * 0.1; // Content-based boosts
    const noise = (Math.random() - 0.5) * 0.05;
    
    return Math.max(0, Math.min(1, baseRetention + contentBoost + noise));
  };

  const simulateAttentionTracking = (time: number): number => {
    // Attention fluctuates based on visual and audio analysis
    const baseAttention = 0.8;
    const variation = Math.cos(time / 20) * 0.15; // 20-second attention cycles
    const randomSpikes = Math.random() > 0.9 ? 0.2 : 0; // Occasional attention spikes
    const noise = (Math.random() - 0.5) * 0.08;
    
    return Math.max(0, Math.min(1, baseAttention + variation + randomSpikes + noise));
  };

  const simulateInteractionLikelihood = (time: number): number => {
    // Interaction likelihood based on content analysis
    const baseInteraction = 0.4;
    const codeSegmentBoost = Math.sin(time / 60) > 0.5 ? 0.3 : 0; // Code segments increase interaction
    const noise = (Math.random() - 0.5) * 0.1;
    
    return Math.max(0, Math.min(1, baseInteraction + codeSegmentBoost + noise));
  };

  const updateTestAudienceReactions = (metric: RealTimeMetrics) => {
    setTestAudience(prev => prev.map(viewer => ({
      ...viewer,
      currentAttention: Math.max(0, Math.min(1, 
        viewer.currentAttention * 0.9 + metric.attention * 0.1 + (Math.random() - 0.5) * 0.1
      )),
      retentionPrediction: Math.max(0, Math.min(1,
        viewer.retentionPrediction * 0.95 + metric.retention * 0.05
      )),
      interactionLikelihood: Math.max(0, Math.min(1,
        viewer.interactionLikelihood * 0.9 + metric.interactionLikelihood * 0.1
      )),
      dropOffRisk: Math.max(0, Math.min(0.5,
        viewer.dropOffRisk * 0.9 + (1 - metric.retention) * 0.1
      ))
    })));
  };

  const analyzeCurrentSegment = (metric: RealTimeMetrics) => {
    // Create segment insights every 30 seconds
    if (Math.floor(metric.timestamp) % 30 === 0 && metric.timestamp > 0) {
      const newInsight: SegmentInsight = {
        startTime: Math.floor(metric.timestamp / 30) * 30,
        endTime: Math.floor(metric.timestamp / 30) * 30 + 30,
        importanceScore: (metric.engagement + metric.attention) / 2,
        engagementPrediction: metric.engagement,
        viewerFeedback: generateSegmentFeedback(metric),
        suggestedImprovements: generateImprovementSuggestions(metric),
        retentionCurve: metrics.slice(-30).map(m => m.retention)
      };

      setSegmentInsights(prev => [...prev, newInsight]);
      
      if (onInsightUpdate) {
        onInsightUpdate([...segmentInsights, newInsight]);
      }
    }
  };

  const generateSegmentFeedback = (metric: RealTimeMetrics): string[] => {
    const feedback = [];
    
    if (metric.engagement > 0.8) {
      feedback.push('High engagement detected - viewers are actively following');
    }
    if (metric.attention < 0.6) {
      feedback.push('Attention dipping - consider adding visual elements');
    }
    if (metric.interactionLikelihood > 0.7) {
      feedback.push('Good interaction potential - this is a teachable moment');
    }
    if (metric.retention < 0.7) {
      feedback.push('Retention risk - content may be moving too fast');
    }
    
    return feedback.length > 0 ? feedback : ['Content performing within normal range'];
  };

  const generateImprovementSuggestions = (metric: RealTimeMetrics): string[] => {
    const suggestions = [];
    
    if (metric.attention < 0.6) {
      suggestions.push('Add code highlighting or zoom effects');
      suggestions.push('Include more visual demonstrations');
    }
    if (metric.engagement < 0.7) {
      suggestions.push('Explain the "why" behind technical decisions');
      suggestions.push('Add more context about practical applications');
    }
    if (metric.retention < 0.7) {
      suggestions.push('Slow down the pace for complex concepts');
      suggestions.push('Add summary checkpoints');
    }
    
    return suggestions;
  };

  const handleRealTimeUpdate = (data: any) => {
    // Handle WebSocket updates from backend ML analysis
    if (data.type === 'metrics') {
      setCurrentMetrics(data.metrics);
    } else if (data.type === 'segment_analysis') {
      setSegmentInsights(prev => [...prev, data.segment]);
    }
  };

  const getMetricColor = (value: number, inverse = false): string => {
    if (inverse) value = 1 - value;
    if (value >= 0.8) return 'text-green-600';
    if (value >= 0.6) return 'text-yellow-600';
    if (value >= 0.4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getMetricBadgeVariant = (value: number, inverse = false): string => {
    if (inverse) value = 1 - value;
    if (value >= 0.8) return 'default';
    if (value >= 0.6) return 'secondary';
    if (value >= 0.4) return 'outline';
    return 'destructive';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Video Player with Overlay */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Real-time Preview & Analysis
              {isAnalyzing && (
                <Badge variant="secondary" className="animate-pulse">
                  🤖 AI Analyzing
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="w-full rounded-lg"
                onPlay={() => setVideoState(prev => ({ ...prev, isPlaying: true }))}
                onPause={() => setVideoState(prev => ({ ...prev, isPlaying: false }))}
              />
              
              {/* Real-time Metrics Overlay */}
              {currentMetrics && isLive && (
                <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg">
                  <div className="text-xs space-y-1">
                    <div className={`flex justify-between ${getMetricColor(currentMetrics.engagement)}`}>
                      <span>Engagement:</span>
                      <span>{Math.round(currentMetrics.engagement * 100)}%</span>
                    </div>
                    <div className={`flex justify-between ${getMetricColor(currentMetrics.retention)}`}>
                      <span>Retention:</span>
                      <span>{Math.round(currentMetrics.retention * 100)}%</span>
                    </div>
                    <div className={`flex justify-between ${getMetricColor(currentMetrics.attention)}`}>
                      <span>Attention:</span>
                      <span>{Math.round(currentMetrics.attention * 100)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Real-time Charts */}
            {metrics.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Live Performance Metrics</h4>
                <div className="h-32 bg-gray-100 rounded relative overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                    style={{ background: 'linear-gradient(to right, #f8f9fa, #e9ecef)' }}
                  />
                  
                  {/* Simple metric visualization */}
                  <div className="absolute inset-0 flex items-end justify-between p-2">
                    {metrics.slice(-20).map((metric, index) => (
                      <div key={index} className="flex flex-col items-center space-y-1">
                        <div 
                          className="w-2 bg-blue-500 rounded-t"
                          style={{ height: `${metric.engagement * 100}%` }}
                        />
                        <div 
                          className="w-2 bg-green-500 rounded-t"
                          style={{ height: `${metric.retention * 100}%` }}
                        />
                        <div 
                          className="w-2 bg-yellow-500 rounded-t"
                          style={{ height: `${metric.attention * 100}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
                    Engagement
                  </span>
                  <span className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                    Retention
                  </span>
                  <span className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div>
                    Attention
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Test Audience Panel */}
      <div className="space-y-6">
        {/* Live Test Audience */}
        <Card>
          <CardHeader>
            <CardTitle>AI Test Audience (Live)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {testAudience.map((viewer) => (
              <div key={viewer.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-sm">{viewer.persona}</span>
                  <Badge variant={getMetricBadgeVariant(viewer.currentAttention)} className="text-xs">
                    {Math.round(viewer.currentAttention * 100)}%
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs">
                      <span>Attention</span>
                      <span>{Math.round(viewer.currentAttention * 100)}%</span>
                    </div>
                    <Progress value={viewer.currentAttention * 100} className="h-1" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs">
                      <span>Retention</span>
                      <span>{Math.round(viewer.retentionPrediction * 100)}%</span>
                    </div>
                    <Progress value={viewer.retentionPrediction * 100} className="h-1" />
                  </div>
                  
                  {viewer.dropOffRisk > 0.2 && (
                    <div className="text-xs text-red-600">
                      ⚠️ High drop-off risk
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Segment Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Segment Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {segmentInsights.slice(-3).map((insight, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    {Math.floor(insight.startTime)}s - {Math.floor(insight.endTime)}s
                  </span>
                  <Badge variant={getMetricBadgeVariant(insight.importanceScore)}>
                    {Math.round(insight.importanceScore * 100)}%
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {insight.viewerFeedback.slice(0, 2).map((feedback, i) => (
                    <div key={i} className="text-xs text-gray-600">
                      💭 {feedback}
                    </div>
                  ))}
                  
                  {insight.suggestedImprovements.length > 0 && (
                    <div className="text-xs text-blue-600">
                      💡 {insight.suggestedImprovements[0]}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {segmentInsights.length === 0 && (
              <div className="text-center text-gray-500 text-sm">
                Segment analysis will appear as video plays...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Real-time Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Real-time Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => setIsAnalyzing(!isAnalyzing)}
              variant={isAnalyzing ? "outline" : "default"}
              className="w-full"
            >
              {isAnalyzing ? '⏸️ Pause Analysis' : '▶️ Start Analysis'}
            </Button>
            
            <Button variant="outline" className="w-full">
              📊 Export Insights
            </Button>
            
            <Button variant="outline" className="w-full">
              🎯 Adjust AI Focus
            </Button>
            
            {currentMetrics && (
              <div className="text-xs text-gray-600 space-y-1">
                <div>Last update: {new Date().toLocaleTimeString()}</div>
                <div>Processing: {Math.round(videoState.currentTime)}s / {Math.round(videoState.duration)}s</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimePreview;