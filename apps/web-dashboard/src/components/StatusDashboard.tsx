import React, { useState, useEffect } from 'react';

// Mock UI components for standalone compilation
const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>
);
const CardHeader = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-4 border-b ${className}`}>{children}</div>
);
const CardTitle = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);
const CardContent = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);
const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: string }) => (
  <span className={`px-2 py-1 text-xs rounded ${variant === 'destructive' ? 'bg-red-100 text-red-800' : variant === 'secondary' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>
    {children}
  </span>
);
const Progress = ({ value, className = '' }: { value: number, className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${value}%` }} />
  </div>
);

interface SystemMetrics {
  capture: {
    isActive: boolean;
    fps: number;
    resolution: string;
    cpuUsage: number;
    memoryUsage: number;
  };
  processing: {
    queueLength: number;
    currentJob?: string;
    completedToday: number;
    averageProcessingTime: number;
  };
  ai: {
    modelsLoaded: string[];
    availableCapacity: number;
    currentTasks: number;
  };
  system: {
    diskSpace: number;
    temperature: number;
    networkStatus: 'online' | 'offline' | 'limited';
    batteryLevel?: number;
  };
}

const StatusDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // WebSocket connection for real-time updates
    const ws = new WebSocket('ws://localhost:8080/status');
    
    ws.onopen = () => {
      setConnected(true);
      console.log('Connected to DailyDoco status stream');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMetrics(data);
    };
    
    ws.onclose = () => {
      setConnected(false);
      console.log('Disconnected from status stream');
    };
    
    return () => ws.close();
  }, []);

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500' : 'bg-gray-400';
  };

  const getProcessingStatus = () => {
    if (!metrics) return 'unknown';
    if (metrics.processing.currentJob) return 'processing';
    if (metrics.capture.isActive) return 'capturing';
    return 'idle';
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {connected ? 'Loading system metrics...' : 'Connecting to DailyDoco...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">DailyDoco Pro Status</h1>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {connected ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Capture Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Capture Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(metrics.capture.isActive)}`}></div>
              <Badge variant={metrics.capture.isActive ? "default" : "secondary"}>
                {metrics.capture.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div>FPS: {metrics.capture.fps}</div>
              <div>Resolution: {metrics.capture.resolution}</div>
              <div>CPU: {metrics.capture.cpuUsage}%</div>
              <div>Memory: {metrics.capture.memoryUsage}MB</div>
            </div>
          </CardContent>
        </Card>

        {/* Processing Queue */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-3">
              <Badge variant={getProcessingStatus() === 'processing' ? "default" : "secondary"}>
                {getProcessingStatus()}
              </Badge>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Queue: {metrics.processing.queueLength} jobs</div>
              <div>Completed Today: {metrics.processing.completedToday}</div>
              <div>Avg Time: {metrics.processing.averageProcessingTime}s</div>
              {metrics.processing.currentJob && (
                <div className="text-blue-600 truncate">
                  Current: {metrics.processing.currentJob}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Models */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AI Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Capacity</span>
                <span>{metrics.ai.availableCapacity}%</span>
              </div>
              <Progress value={metrics.ai.availableCapacity} className="h-2" />
              <div className="space-y-1 text-sm text-gray-600">
                <div>Models: {metrics.ai.modelsLoaded.length}</div>
                <div>Active Tasks: {metrics.ai.currentTasks}</div>
                <div className="text-xs">
                  {metrics.ai.modelsLoaded.slice(0, 2).join(', ')}
                  {metrics.ai.modelsLoaded.length > 2 && '...'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Disk Space</span>
                <span>{100 - metrics.system.diskSpace}% free</span>
              </div>
              <Progress value={metrics.system.diskSpace} className="h-2" />
              <div className="space-y-1 text-sm text-gray-600">
                <div>Temp: {metrics.system.temperature}°C</div>
                <div>Network: {metrics.system.networkStatus}</div>
                {metrics.system.batteryLevel && (
                  <div>Battery: {metrics.system.batteryLevel}%</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Live Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="animate-pulse">📊</div>
              <p className="mt-2">Real-time charts loading...</p>
              <p className="text-sm">CPU, Memory, FPS, and Processing Time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">Project "aegnt-27-demo" captured</span>
              <span className="text-xs text-gray-500">2 minutes ago</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">Video processing completed</span>
              <span className="text-xs text-gray-500">5 minutes ago</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">AI analysis: 94% authenticity score</span>
              <span className="text-xs text-gray-500">7 minutes ago</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm">aegnt-27 humanization applied</span>
              <span className="text-xs text-gray-500">10 minutes ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusDashboard;