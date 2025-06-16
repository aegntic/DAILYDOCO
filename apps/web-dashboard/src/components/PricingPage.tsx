import React, { useState, useEffect } from 'react';
import { PRICING_TIERS, REVENUE_TARGETS, PricingTier, PsychologyTrigger } from '../../../../libs/shared-types/src/pricing';

interface PricingPageProps {
  onTierSelected?: (tierId: string) => void;
  currentTier?: string;
  showTrialBanner?: boolean;
}

const PricingPage: React.FC<PricingPageProps> = ({ 
  onTierSelected, 
  currentTier, 
  showTrialBanner = true 
}) => {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [animateValue, setAnimateValue] = useState(false);

  useEffect(() => {
    // Animate value propositions on load
    setAnimateValue(true);
  }, []);

  const handleTierSelect = (tierId: string) => {
    setSelectedTier(tierId);
    onTierSelected?.(tierId);
  };

  const formatPrice = (monthly: number, yearly: number) => {
    const price = isYearly ? Math.round(yearly / 12) : monthly;
    return price;
  };

  const getSavingsAmount = (tier: PricingTier) => {
    if (!isYearly) return 0;
    const monthlyTotal = tier.priceMonthly * 12;
    const savings = monthlyTotal - tier.priceYearly;
    return savings;
  };

  const PsychologyTriggerComponent: React.FC<{ trigger: PsychologyTrigger, tierId: string }> = ({ trigger, tierId }) => {
    const getTriggerStyles = () => {
      switch (trigger.type) {
        case 'decoy':
          return 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1 rounded-full text-sm font-semibold';
        case 'social_proof':
          return 'bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm border border-blue-200';
        case 'loss_aversion':
          return 'bg-red-50 text-red-700 px-3 py-1 rounded-lg text-sm border border-red-200';
        case 'anchor':
          return 'bg-yellow-50 text-yellow-800 px-3 py-1 rounded-lg text-sm border border-yellow-200';
        case 'urgency':
          return 'bg-orange-50 text-orange-700 px-3 py-1 rounded-lg text-sm border border-orange-200 animate-pulse';
        case 'authority':
          return 'bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-sm border border-purple-200';
        case 'reciprocity':
          return 'bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-sm border border-indigo-200';
        default:
          return 'bg-gray-50 text-gray-700 px-3 py-1 rounded-lg text-sm border border-gray-200';
      }
    };

    return (
      <div className={getTriggerStyles()}>
        {trigger.message}
      </div>
    );
  };

  const ROICalculator: React.FC<{ tier: PricingTier }> = ({ tier }) => {
    const calculateROI = () => {
      switch (tier.id) {
        case 'hobby':
          return {
            timeSaved: '2 hours/week',
            valueSaved: '$400/month',
            roiMultiple: '21x'
          };
        case 'creator':
          return {
            timeSaved: '15 hours/week',
            valueSaved: '$3,000/month',
            roiMultiple: '38x'
          };
        case 'studio':
          return {
            timeSaved: '40 hours/week',
            valueSaved: '$8,000/month',
            roiMultiple: '27x'
          };
        case 'enterprise':
          return {
            timeSaved: '200 hours/week',
            valueSaved: '$40,000/month',
            roiMultiple: '20x'
          };
        default:
          return { timeSaved: '0', valueSaved: '$0', roiMultiple: '0x' };
      }
    };

    const roi = calculateROI();

    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 mt-4">
        <h4 className="font-semibold text-green-800 mb-2">💰 ROI Calculator</h4>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <div className="text-green-600 font-medium">{roi.timeSaved}</div>
            <div className="text-gray-600">Time Saved</div>
          </div>
          <div>
            <div className="text-green-600 font-medium">{roi.valueSaved}</div>
            <div className="text-gray-600">Value Created</div>
          </div>
          <div>
            <div className="text-green-600 font-medium text-lg">{roi.roiMultiple}</div>
            <div className="text-gray-600">ROI</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section with Psychology Triggers */}
      <div className="relative overflow-hidden pt-16 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        
        {showTrialBanner && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <span className="font-semibold">🚀 Limited Time: Start your 14-day free trial - No credit card required</span>
              <span className="ml-4 bg-white/20 px-3 py-1 rounded-full text-sm">⏰ Join 50,000+ developers already saving 10+ hours/week</span>
            </div>
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`transition-all duration-1000 ${animateValue ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Stop Losing <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">$10,000+ Monthly</span> on Manual Documentation
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              While you're manually creating documentation, your competitors are scaling 10x faster with AI-powered automation. 
              Choose your transformation tier below.
            </p>
            
            {/* Social Proof Bar */}
            <div className="flex justify-center items-center space-x-8 mb-12 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>50,000+ developers trust DailyDoco</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span>2M+ videos created automatically</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span>Average 27x ROI in first 90 days</span>
              </div>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-full p-1 border border-gray-200 shadow-sm">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2 rounded-full transition-all ${
                  !isYearly ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2 rounded-full transition-all ${
                  isYearly ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Save 20%</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="relative -mt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Object.values(PRICING_TIERS).map((tier, index) => {
              const isPopular = tier.id === 'creator'; // Decoy effect
              const isEnterprise = tier.id === 'enterprise';
              const price = formatPrice(tier.priceMonthly, tier.priceYearly);
              const savings = getSavingsAmount(tier);

              return (
                <div
                  key={tier.id}
                  className={`relative bg-white rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                    isPopular ? 'ring-4 ring-emerald-500 ring-opacity-50 scale-105' : ''
                  } ${selectedTier === tier.id ? 'ring-4 ring-blue-500' : ''}`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                        🔥 Most Popular - 73% Choose This
                      </span>
                    </div>
                  )}

                  <div className="p-8">
                    {/* Tier Header */}
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.displayName}</h3>
                      <div className="flex items-baseline justify-center">
                        <span className="text-5xl font-bold text-gray-900">${price}</span>
                        <span className="text-gray-600 ml-2">/month</span>
                      </div>
                      {isYearly && savings > 0 && (
                        <div className="mt-2 text-green-600 font-medium">
                          Save ${savings} annually
                        </div>
                      )}
                      
                      {/* Targeting Description */}
                      <p className="text-gray-600 mt-3 text-sm">{tier.targeting.primary}</p>
                    </div>

                    {/* Psychology Triggers */}
                    <div className="mb-6 space-y-2">
                      {tier.psychologyTriggers.map((trigger, idx) => (
                        <PsychologyTriggerComponent key={idx} trigger={trigger} tierId={tier.id} />
                      ))}
                    </div>

                    {/* ROI Calculator */}
                    <ROICalculator tier={tier} />

                    {/* Features List */}
                    <div className="mt-8 space-y-4">
                      <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        Everything included:
                      </h4>
                      {tier.features.slice(0, 5).map((feature, idx) => (
                        <div key={idx} className="flex items-start">
                          <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <div className="font-medium text-gray-900">{feature.name}</div>
                            <div className="text-sm text-gray-600">{feature.description}</div>
                            {feature.valueProposition && (
                              <div className="text-xs text-blue-600 font-medium mt-1">
                                💡 {feature.valueProposition}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {tier.features.length > 5 && (
                        <div className="text-sm text-gray-600 italic">
                          + {tier.features.length - 5} more advanced features
                        </div>
                      )}
                    </div>

                    {/* Usage Limits */}
                    <div className="mt-6 bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Usage Limits:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Videos:</span>
                          <span className="ml-1 font-medium">
                            {tier.limits.videosPerMonth === 'unlimited' ? '∞' : tier.limits.videosPerMonth}/mo
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Storage:</span>
                          <span className="ml-1 font-medium">
                            {tier.limits.storageGB === 'unlimited' ? '∞' : `${tier.limits.storageGB}GB`}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Team:</span>
                          <span className="ml-1 font-medium">
                            {tier.limits.teamMembers === 'unlimited' ? '∞' : `${tier.limits.teamMembers} users`}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">API:</span>
                          <span className="ml-1 font-medium">
                            {tier.limits.apiCallsPerMonth === 'unlimited' ? '∞' : `${tier.limits.apiCallsPerMonth.toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleTierSelect(tier.id)}
                      className={`w-full mt-8 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                        isPopular
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                          : isEnterprise
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                          : 'bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl hover:scale-105'
                      }`}
                    >
                      {tier.id === 'enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                    </button>

                    {/* Conversion Optimizers */}
                    <div className="mt-4 space-y-2">
                      {tier.conversionOptimizers.map((optimizer, idx) => (
                        <div key={idx} className="text-xs text-center text-gray-600">
                          {optimizer.type === 'free_trial' && '✅ 14-day free trial - No credit card required'}
                          {optimizer.type === 'money_back_guarantee' && '💰 30-day money-back guarantee'}
                          {optimizer.type === 'setup_assistance' && '🚀 Free 1-hour setup session included'}
                          {optimizer.type === 'migration_support' && '📦 Free migration from existing tools'}
                          {optimizer.type === 'success_guarantee' && '🎯 Success guarantee or money back'}
                        </div>
                      ))}
                    </div>

                    {/* Pain Point Addressing */}
                    <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-3">
                      <h5 className="font-medium text-red-800 mb-2">❌ Without DailyDoco:</h5>
                      <ul className="text-xs text-red-700 space-y-1">
                        {tier.targeting.painPoints.map((pain, idx) => (
                          <li key={idx}>• {pain}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Revenue Stream Indicators (for internal tracking) */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">Join the Documentation Revolution</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-emerald-400">$15M</div>
              <div className="text-gray-300">MRR Target in 18 months</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400">122,100</div>
              <div className="text-gray-300">Total customers needed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400">27x</div>
              <div className="text-gray-300">Average ROI for customers</div>
            </div>
          </div>
          
          {/* Call-to-Action */}
          <div className="mt-12">
            <button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-12 py-4 rounded-xl text-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              Start Your 14-Day Free Trial Now
            </button>
            <p className="mt-4 text-gray-400">Join 50,000+ developers already saving 10+ hours per week</p>
          </div>
        </div>
      </div>

      {/* FAQ Section with Objection Handling */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                How is this different from Loom or other screen recorders?
              </h3>
              <p className="text-gray-600">
                DailyDoco is built specifically for developers and understands code. While Loom records generic screens, 
                we provide intelligent capture that knows when you're debugging, writing code, or solving problems. Our AI 
                automatically generates technical narration, creates meaningful timestamps, and optimizes for developer workflows.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What if I don't create enough videos to justify the cost?
              </h3>
              <p className="text-gray-600">
                Our average user creates 3x more content after switching to DailyDoco because the process becomes effortless. 
                Even if you only create 2 videos per month, you're saving 6+ hours of manual work, which is worth $300+ at developer rates. 
                Plus, your content quality improves dramatically, leading to better engagement and career opportunities.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Is my code and data secure?
              </h3>
              <p className="text-gray-600">
                Yes. All processing happens locally by default. Your code never leaves your machine unless you explicitly 
                choose cloud features. We're SOC2 compliant and offer enterprise-grade security for teams that need it.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Can I upgrade or downgrade my plan anytime?
              </h3>
              <p className="text-gray-600">
                Absolutely. You can change plans anytime, and we'll prorate the difference. Most users start with Creator 
                and upgrade to Studio as their content production scales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;