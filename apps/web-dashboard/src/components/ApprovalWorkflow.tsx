import React, { useState, useEffect, useRef } from 'react';

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
const Textarea = ({ placeholder, value, onChange, className = '' }: { 
  placeholder?: string, 
  value: string, 
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
  className?: string 
}) => (
  <textarea 
    placeholder={placeholder} 
    value={value} 
    onChange={onChange}
    className={`w-full p-2 border border-gray-300 rounded ${className}`}
  />
);

interface VideoProject {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  createdAt: Date;
  status: 'processing' | 'ready_for_approval' | 'approved' | 'needs_changes' | 'rejected';
  metrics: ProjectMetrics;
  testAudienceResults: TestAudienceResult;
  aegnt27Results: Aegnt27Result;
}

interface ProjectMetrics {
  captureQuality: number;
  processingTime: number;
  fileSize: number;
  resolution: string;
  framerate: number;
}

interface TestAudienceResult {
  overallScore: number;
  engagementPrediction: EngagementPrediction;
  ctrPrediction: CTRPrediction;
  retentionCurve: RetentionPoint[];
  suggestions: string[];
  audienceInsights: AudienceInsight[];
}

interface EngagementPrediction {
  score: number;
  confidence: number;
  peakMoments: TimePoint[];
  dropoffRisks: TimePoint[];
}

interface CTRPrediction {
  score: number;
  titleScore: number;
  thumbnailScore: number;
  competitorAnalysis: string;
}

interface RetentionPoint {
  timestamp: number;
  retentionRate: number;
  confidence: number;
}

interface TimePoint {
  timestamp: number;
  score: number;
  reason: string;
}

interface AudienceInsight {
  segment: string;
  percentage: number;
  feedback: string;
  engagement: number;
}

interface Aegnt27Result {
  authenticityScore: number;
  humanizationApplied: HumanizationFeature[];
  detectionResistance: DetectionResistance;
  naturalness: NaturalnessMetrics;
}

interface HumanizationFeature {
  feature: string;
  applied: boolean;
  effectiveness: number;
  description: string;
}

interface DetectionResistance {
  overallScore: number;
  detectorResults: DetectorResult[];
  vulnerabilities: string[];
  improvements: string[];
}

interface DetectorResult {
  detector: string;
  score: number;
  status: 'passed' | 'warning' | 'failed';
}

interface NaturalnessMetrics {
  audioNaturalness: number;
  visualNaturalness: number;
  behavioralNaturalness: number;
  overallNaturalness: number;
}

interface ChangeRequest {
  type: 'content' | 'quality' | 'timing' | 'effects' | 'aegnt27';
  description: string;
  priority: 'low' | 'medium' | 'high';
  timestamp?: number;
}

interface RegenerateOptions {
  regenerateNarration: boolean;
  adjustTiming: boolean;
  enhanceQuality: boolean;
  reapplyAegnt27: boolean;
  targetAudienceAdjustment: string;
}

const ApprovalWorkflow: React.FC = () => {
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<VideoProject | null>(null);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [newChangeRequest, setNewChangeRequest] = useState('');
  const [regenerateOptions, setRegenerateOptions] = useState<RegenerateOptions>({
    regenerateNarration: false,
    adjustTiming: false,
    enhanceQuality: false,
    reapplyAegnt27: false,
    targetAudienceAdjustment: ''
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects/pending-approval');
      const data = await response.json();
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const handleApprove = async () => {
    if (!selectedProject) return;

    try {
      await fetch(`/api/projects/${selectedProject.id}/approve`, {
        method: 'POST'
      });
      
      await fetchProjects();
      setSelectedProject(null);
    } catch (error) {
      console.error('Failed to approve project:', error);
    }
  };

  const handleRequestChanges = async () => {
    if (!selectedProject || changeRequests.length === 0) return;

    try {
      await fetch(`/api/projects/${selectedProject.id}/request-changes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes: changeRequests })
      });
      
      setChangeRequests([]);
      await fetchProjects();
    } catch (error) {
      console.error('Failed to request changes:', error);
    }
  };

  const handleRegenerate = async () => {
    if (!selectedProject) return;

    try {
      await fetch(`/api/projects/${selectedProject.id}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regenerateOptions)
      });
      
      await fetchProjects();
    } catch (error) {
      console.error('Failed to regenerate project:', error);
    }
  };

  const addChangeRequest = (type: ChangeRequest['type']) => {
    if (!newChangeRequest.trim()) return;

    const request: ChangeRequest = {
      type,
      description: newChangeRequest,
      priority: 'medium',
      timestamp: playbackTime
    };

    setChangeRequests([...changeRequests, request]);
    setNewChangeRequest('');
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 80) return 'secondary';
    if (score >= 70) return 'outline';
    return 'destructive';
  };

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Projects Pending Approval</h2>
          <p className="text-gray-600">All videos have been processed and approved!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Video Approval Workflow</h1>
        <p className="text-gray-600 mt-2">Review and approve AI-generated documentation videos</p>
      </div>

      {/* Project Selector */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Projects ({projects.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 overflow-x-auto">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`flex-shrink-0 p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedProject?.id === project.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedProject(project)}
                >
                  <img
                    src={project.thumbnailUrl}
                    alt={project.title}
                    className="w-32 h-18 object-cover rounded mb-2"
                  />
                  <h3 className="font-medium text-sm">{project.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.floor(project.duration / 60)}:{(project.duration % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{selectedProject.title}</CardTitle>
              <p className="text-gray-600">{selectedProject.description}</p>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <video
                  ref={videoRef}
                  src={selectedProject.videoUrl}
                  className="w-full rounded-lg"
                  controls
                  onTimeUpdate={(e) => setPlaybackTime(e.currentTarget.currentTime)}
                />
                
                {/* Playback Timeline with Insights */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Engagement Prediction</span>
                    <span>{Math.floor(playbackTime)}s / {Math.floor(selectedProject.duration)}s</span>
                  </div>
                  
                  {/* Retention Curve Visualization */}
                  <div className="h-16 bg-gray-100 rounded relative overflow-hidden">
                    {selectedProject.testAudienceResults.retentionCurve.map((point, index) => (
                      <div
                        key={index}
                        className="absolute bottom-0 bg-blue-500 opacity-70"
                        style={{
                          left: `${(point.timestamp / selectedProject.duration) * 100}%`,
                          height: `${point.retentionRate}%`,
                          width: '2px'
                        }}
                      />
                    ))}
                    
                    {/* Current Position */}
                    <div
                      className="absolute top-0 bottom-0 bg-black w-0.5"
                      style={{
                        left: `${(playbackTime / selectedProject.duration) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="mt-6 flex space-x-4">
            <Button
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700"
              size="lg"
            >
              ✅ Approve & Publish
            </Button>
            
            <Button
              onClick={handleRequestChanges}
              variant="outline"
              size="lg"
              disabled={changeRequests.length === 0}
            >
              📝 Request Changes ({changeRequests.length})
            </Button>
            
            <Button
              onClick={handleRegenerate}
              variant="outline"
              size="lg"
            >
              🔄 Regenerate
            </Button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* AI Test Audience Results */}
          <Card>
            <CardHeader>
              <CardTitle>AI Test Audience Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Overall Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Overall Score</span>
                  <Badge variant={getScoreBadgeVariant(selectedProject.testAudienceResults.overallScore)}>
                    {selectedProject.testAudienceResults.overallScore}%
                  </Badge>
                </div>
                <Progress value={selectedProject.testAudienceResults.overallScore} className="h-2" />
              </div>

              {/* Engagement Prediction */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Engagement</span>
                  <span className={`text-sm font-bold ${getScoreColor(selectedProject.testAudienceResults.engagementPrediction.score)}`}>
                    {selectedProject.testAudienceResults.engagementPrediction.score}%
                  </span>
                </div>
                <Progress value={selectedProject.testAudienceResults.engagementPrediction.score} className="h-2" />
                <p className="text-xs text-gray-600 mt-1">
                  Confidence: {selectedProject.testAudienceResults.engagementPrediction.confidence}%
                </p>
              </div>

              {/* CTR Prediction */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Click-through Rate</span>
                  <span className={`text-sm font-bold ${getScoreColor(selectedProject.testAudienceResults.ctrPrediction.score)}`}>
                    {selectedProject.testAudienceResults.ctrPrediction.score}%
                  </span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Title: {selectedProject.testAudienceResults.ctrPrediction.titleScore}%</div>
                  <div>Thumbnail: {selectedProject.testAudienceResults.ctrPrediction.thumbnailScore}%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* aegnt-27 Results */}
          <Card>
            <CardHeader>
              <CardTitle>aegnt-27 Authenticity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Authenticity Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Authenticity Score</span>
                  <Badge variant={getScoreBadgeVariant(selectedProject.aegnt27Results.authenticityScore)}>
                    {selectedProject.aegnt27Results.authenticityScore}%
                  </Badge>
                </div>
                <Progress value={selectedProject.aegnt27Results.authenticityScore} className="h-2" />
              </div>

              {/* Detection Resistance */}
              <div>
                <h4 className="text-sm font-medium mb-2">AI Detection Resistance</h4>
                <div className="space-y-1">
                  {selectedProject.aegnt27Results.detectionResistance.detectorResults.map((result, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span>{result.detector}</span>
                      <Badge
                        variant={result.status === 'passed' ? 'default' : result.status === 'warning' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {result.score}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Humanization Features */}
              <div>
                <h4 className="text-sm font-medium mb-2">Applied Features</h4>
                <div className="space-y-1">
                  {selectedProject.aegnt27Results.humanizationApplied.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span>{feature.feature}</span>
                      <span className={feature.applied ? 'text-green-600' : 'text-gray-400'}>
                        {feature.applied ? '✓' : '✗'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Change Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe the changes needed..."
                value={newChangeRequest}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewChangeRequest(e.target.value)}
                className="min-h-[80px]"
              />
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addChangeRequest('content')}
                >
                  Content
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addChangeRequest('timing')}
                >
                  Timing
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addChangeRequest('quality')}
                >
                  Quality
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addChangeRequest('aegnt27')}
                >
                  aegnt-27
                </Button>
              </div>

              {changeRequests.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Pending Changes:</h4>
                  {changeRequests.map((request, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="text-xs">
                          {request.type}
                        </Badge>
                        <button
                          onClick={() => setChangeRequests(changeRequests.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                      <p className="mt-1">{request.description}</p>
                      {request.timestamp && (
                        <p className="text-gray-500 mt-1">
                          At {Math.floor(request.timestamp)}s
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Regeneration Options */}
          <Card>
            <CardHeader>
              <CardTitle>Regeneration Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={regenerateOptions.regenerateNarration}
                    onChange={(e) => setRegenerateOptions({
                      ...regenerateOptions,
                      regenerateNarration: e.target.checked
                    })}
                  />
                  <span className="text-sm">Regenerate Narration</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={regenerateOptions.adjustTiming}
                    onChange={(e) => setRegenerateOptions({
                      ...regenerateOptions,
                      adjustTiming: e.target.checked
                    })}
                  />
                  <span className="text-sm">Adjust Timing</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={regenerateOptions.enhanceQuality}
                    onChange={(e) => setRegenerateOptions({
                      ...regenerateOptions,
                      enhanceQuality: e.target.checked
                    })}
                  />
                  <span className="text-sm">Enhance Quality</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={regenerateOptions.reapplyAegnt27}
                    onChange={(e) => setRegenerateOptions({
                      ...regenerateOptions,
                      reapplyAegnt27: e.target.checked
                    })}
                  />
                  <span className="text-sm">Reapply aegnt-27</span>
                </label>
              </div>
              
              <Textarea
                placeholder="Target audience adjustment..."
                value={regenerateOptions.targetAudienceAdjustment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRegenerateOptions({
                  ...regenerateOptions,
                  targetAudienceAdjustment: e.target.value
                })}
                className="min-h-[60px]"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApprovalWorkflow;