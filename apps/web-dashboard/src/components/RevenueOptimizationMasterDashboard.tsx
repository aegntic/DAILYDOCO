import React, { useState, useEffect } from 'react';
import { REVENUE_TARGETS } from '../../../../libs/shared-types/src/pricing';
import PricingPage from './PricingPage';
import RevenueAnalyticsDashboard from './RevenueAnalyticsDashboard';

/**
 * Master Revenue Optimization Dashboard
 * Unified interface for managing the complete revenue model
 * Target: $15M MRR in 18 months through integrated optimization
 */
const RevenueOptimizationMasterDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pricing' | 'analytics' | 'optimization' | 'campaigns'>('overview');
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null);
  const [optimizationAlerts, setOptimizationAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRealTimeData();
    const interval = setInterval(fetchRealTimeData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchRealTimeData = async () => {
    try {
      // Simulate real-time revenue optimization data
      const mockData = {
        currentMRR: 125000,
        targetMRR: REVENUE_TARGETS.MRR_18_MONTHS,
        growthRate: 15.2, // Monthly growth rate
        progressToTarget: 0.83, // 83% to monthly milestone
        
        // Key performance indicators
        kpis: {
          customerAcquisitionCost: {
            current: 125,
            target: 38,
            optimization: 70 // 70% reduction target
          },
          lifetimeValue: {
            current: 450,
            target: 1800,
            optimization: 300 // 300% increase target
          },
          netRevenueRetention: {
            current: 105,
            target: 130,
            optimization: 25 // 25 point improvement
          },
          viralCoefficient: {
            current: 0.1,
            target: 0.5,
            optimization: 400 // 400% improvement
          }
        },
        
        // Revenue stream performance
        revenueStreams: {
          saasSubscriptions: {
            current: 100000,
            target: 12000000,
            progress: 0.83,
            monthlyGrowth: 15
          },
          youtubeAdShare: {
            current: 15000,
            target: 1500000,
            progress: 1.0,
            monthlyGrowth: 25
          },
          enterpriseContracts: {
            current: 8000,
            target: 800000,
            progress: 1.0,
            monthlyGrowth: 8
          },
          affiliateCommissions: {
            current: 1500,
            target: 400000,
            progress: 0.38,
            monthlyGrowth: 20
          },
          premiumCourses: {
            current: 500,
            target: 300000,
            progress: 0.17,
            monthlyGrowth: 12
          }
        },
        
        // Active optimizations
        activeOptimizations: [
          {
            id: 'viral_loop_implementation',
            name: 'Viral Loop Implementation',
            status: 'in_progress',
            progress: 65,
            expectedImpact: '+$800K MRR',
            timeline: '2 weeks remaining',
            risk: 'low'
          },
          {
            id: 'pricing_psychology_ab_test',
            name: 'Pricing Psychology A/B Test',
            status: 'testing',
            progress: 85,
            expectedImpact: '+$400K MRR',
            timeline: '1 week remaining',
            risk: 'low'
          },
          {
            id: 'sticky_features_rollout',
            name: 'Sticky Features Rollout',
            status: 'planning',
            progress: 25,
            expectedImpact: '+$2.4M MRR',
            timeline: '8 weeks to start',
            risk: 'medium'
          }
        ],
        
        // Recent achievements
        achievements: [
          {
            title: 'Exceeded Monthly Growth Target',
            description: '18.2% growth vs 15% target',
            impact: '+$18.7K MRR',
            date: '2 days ago',
            type: 'growth'
          },
          {
            title: 'Enterprise Deal Closed',
            description: 'Fortune 500 company signed 3-year contract',
            impact: '+$215K ARR',
            date: '5 days ago',
            type: 'enterprise'
          },
          {
            title: 'Viral Coefficient Improved',
            description: 'Content collaboration feature driving referrals',
            impact: '+0.15 viral coefficient',
            date: '1 week ago',
            type: 'viral'
          }
        ]
      };
      
      setRealTimeMetrics(mockData);
      
      // Generate optimization alerts
      const alerts = [
        {
          level: 'success',
          title: 'Creator Tier Conversion Optimized',
          description: 'Decoy effect increased Creator tier selection by 28%',
          action: 'View detailed analytics',
          impact: '+$47K MRR',
          urgency: 'info'
        },
        {
          level: 'warning',
          title: 'Enterprise Pipeline Needs Attention',
          description: '3 enterprise prospects stalled in evaluation phase',
          action: 'Schedule success calls',
          impact: 'Potential +$180K MRR',
          urgency: 'medium'
        },
        {
          level: 'opportunity',
          title: 'Expansion Revenue Opportunity',
          description: '127 users hit usage limits this week',
          action: 'Trigger upgrade campaigns',
          impact: 'Potential +$23K MRR',
          urgency: 'high'
        }
      ];
      
      setOptimizationAlerts(alerts);
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      'in_progress': 'bg-blue-100 text-blue-800',
      'testing': 'bg-yellow-100 text-yellow-800',
      'planning': 'bg-gray-100 text-gray-800',
      'completed': 'bg-green-100 text-green-800',
      'blocked': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getAlertColor = (level: string): string => {
    const colors = {
      'success': 'border-green-200 bg-green-50 text-green-800',
      'warning': 'border-yellow-200 bg-yellow-50 text-yellow-800',
      'opportunity': 'border-blue-200 bg-blue-50 text-blue-800',
      'critical': 'border-red-200 bg-red-50 text-red-800'
    };
    return colors[level as keyof typeof colors] || 'border-gray-200 bg-gray-50 text-gray-800';
  };

  const TabButton: React.FC<{ id: string; label: string; count?: number }> = ({ id, label, count }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`px-6 py-3 font-medium text-sm transition-all duration-200 border-b-2 ${
        activeTab === id
          ? 'border-blue-600 text-blue-600 bg-blue-50'
          : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
          activeTab === id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-300 rounded mb-8 w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!realTimeMetrics) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Revenue Optimization Command Center
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  Strategic revenue growth toward $15M MRR in 18 months
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(realTimeMetrics.currentMRR)}
                  </div>
                  <div className="text-sm text-gray-600">Current MRR</div>
                </div>
                
                <div className="w-16 h-16 relative">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      strokeDasharray={`${realTimeMetrics.progressToTarget * 100}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">
                      {Math.round(realTimeMetrics.progressToTarget * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex space-x-0 -mb-px">
            <TabButton id="overview" label="Overview" />
            <TabButton id="pricing" label="Pricing Strategy" />
            <TabButton id="analytics" label="Revenue Analytics" />
            <TabButton id="optimization" label="Active Optimizations" count={realTimeMetrics.activeOptimizations.length} />
            <TabButton id="campaigns" label="Growth Campaigns" count={optimizationAlerts.length} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(realTimeMetrics.kpis).map(([key, kpi]: [string, any]) => (
                <div key={key} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <div className={`w-3 h-3 rounded-full ${
                      kpi.current >= kpi.target * 0.8 ? 'bg-green-500' :
                      kpi.current >= kpi.target * 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current:</span>
                      <span className="font-medium">
                        {key === 'customerAcquisitionCost' || key === 'lifetimeValue' 
                          ? formatCurrency(kpi.current)
                          : kpi.current.toFixed(key === 'viralCoefficient' ? 1 : 0)
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Target:</span>
                      <span className="font-medium text-blue-600">
                        {key === 'customerAcquisitionCost' || key === 'lifetimeValue'
                          ? formatCurrency(kpi.target)
                          : kpi.target.toFixed(key === 'viralCoefficient' ? 1 : 0)
                        }
                      </span>
                    </div>
                    <div className="pt-2">
                      <div className="text-xs text-gray-600 mb-1">
                        Optimization: +{kpi.optimization}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (kpi.current / kpi.target) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Revenue Streams Performance */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Revenue Stream Performance</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {Object.entries(realTimeMetrics.revenueStreams).map(([key, stream]: [string, any]) => {
                  const progressPercentage = (stream.current / stream.target) * 100;
                  
                  return (
                    <div key={key} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h3>
                        <div className="text-right">
                          <div className="text-sm text-green-600 font-medium">
                            +{stream.monthlyGrowth}%/mo
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Current:</span>
                          <span className="font-bold">{formatCurrency(stream.current)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Target:</span>
                          <span className="font-medium">{formatCurrency(stream.target)}</span>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, progressPercentage)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Active Optimizations */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Revenue Optimizations</h2>
              
              <div className="space-y-4">
                {realTimeMetrics.activeOptimizations.map((optimization: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          getStatusColor(optimization.status)
                        }`}>
                          {optimization.status.replace('_', ' ').toUpperCase()}
                        </div>
                        <h3 className="font-semibold text-gray-900">{optimization.name}</h3>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {optimization.expectedImpact}
                        </div>
                        <div className="text-sm text-gray-600">{optimization.timeline}</div>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{optimization.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${optimization.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        optimization.risk === 'low' ? 'bg-green-100 text-green-700' :
                        optimization.risk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {optimization.risk.toUpperCase()} RISK
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        View Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recent Achievements */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Achievements</h2>
              
              <div className="space-y-4">
                {realTimeMetrics.achievements.map((achievement: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-900">{achievement.title}</h3>
                        <p className="text-green-700">{achievement.description}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{achievement.impact}</div>
                      <div className="text-sm text-green-600">{achievement.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'pricing' && (
          <PricingPage showTrialBanner={false} />
        )}
        
        {activeTab === 'analytics' && (
          <RevenueAnalyticsDashboard />
        )}
        
        {activeTab === 'optimization' && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Revenue Optimization Center</h2>
            <p className="text-gray-600 mb-8">
              Monitor and manage all active revenue optimization initiatives in real-time.
            </p>
            
            {/* Detailed optimization view would go here */}
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">
                🚧 Advanced Optimization Dashboard
              </div>
              <p className="text-gray-600">
                Real-time optimization monitoring, A/B test management, and performance analytics.
              </p>
            </div>
          </div>
        )}
        
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Growth Campaign Alerts</h2>
              
              <div className="space-y-4">
                {optimizationAlerts.map((alert, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${getAlertColor(alert.level)}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          alert.level === 'success' ? 'bg-green-500' :
                          alert.level === 'warning' ? 'bg-yellow-500' :
                          alert.level === 'opportunity' ? 'bg-blue-500' : 'bg-red-500'
                        }`}></div>
                        <h3 className="font-semibold">{alert.title}</h3>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold">{alert.impact}</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          alert.urgency === 'high' ? 'bg-red-100 text-red-700' :
                          alert.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {alert.urgency.toUpperCase()} PRIORITY
                        </div>
                      </div>
                    </div>
                    
                    <p className="mb-3">{alert.description}</p>
                    
                    <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-300">
                      {alert.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueOptimizationMasterDashboard;