import React from 'react';
import { motion } from 'framer-motion';
import { 
  PlayIcon, 
  SparklesIcon, 
  ChartBarIcon, 
  CpuChipIcon,
  ShieldCheckIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'AI Test Audience',
    description: '50-100 synthetic viewers evaluate your content pre-publication with 90%+ accuracy',
    icon: SparklesIcon,
    stats: '90% accuracy'
  },
  {
    name: 'Modular AI Engine',
    description: 'Hot-swappable DeepSeek R1 + Gemma 3 architecture for optimal performance',
    icon: CpuChipIcon,
    stats: 'Sub-100ms'
  },
  {
    name: 'Intelligent Capture',
    description: 'Predictive moment detection with 99%+ project identification accuracy',
    icon: ChartBarIcon,
    stats: '99% accuracy'
  },
  {
    name: 'Human Authenticity',
    description: '95%+ authenticity score - undetectable as AI-generated content',
    icon: ShieldCheckIcon,
    stats: '95% authentic'
  }
];

const stats = [
  { label: 'Processing Speed', value: '< 2x realtime', subtext: 'Ultra-fast compilation' },
  { label: 'Memory Usage', value: '< 200MB', subtext: 'Efficient monitoring' },
  { label: 'CPU Impact', value: '< 5%', subtext: 'Invisible operation' },
  { label: 'Authenticity', value: '95%+', subtext: 'Human-like quality' }
];

function App() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 bg-400% animate-gradient" />
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      
      <div className="relative min-h-screen">
        {/* Header */}
        <header className="px-6 py-8">
          <nav className="max-w-7xl mx-auto flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <PlayIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient">DailyDoco Pro</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:flex items-center space-x-8"
            >
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              <a href="#docs" className="text-gray-300 hover:text-white transition-colors">Docs</a>
              <button className="btn-primary">Start Free Trial</button>
            </motion.div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="px-6 py-20">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-6xl md:text-8xl font-bold mb-8">
                <span className="text-gradient">Elite-Tier</span>
                <br />
                Documentation Platform
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                Transform your development workflow into professional video tutorials with 
                AI test audience validation, personal brand learning, and undetectable authenticity.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary text-lg px-12 py-4"
                >
                  <RocketLaunchIcon className="w-5 h-5 mr-2 inline" />
                  Start Creating Videos
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary text-lg px-12 py-4"
                >
                  Watch Demo
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="glass-card text-center"
                >
                  <div className="text-3xl font-bold text-gradient mb-2">{stat.value}</div>
                  <div className="text-lg font-semibold text-white mb-1">{stat.label}</div>
                  <div className="text-sm text-gray-400">{stat.subtext}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl font-bold mb-6">
                <span className="text-gradient">Revolutionary Features</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Powered by cutting-edge AI models and performance-first architecture
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="glass-card hover:bg-white/15 transition-all duration-300"
                >
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-white">{feature.name}</h3>
                        <span className="text-sm font-medium text-accent-400">{feature.stats}</span>
                      </div>
                      <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="glass-card"
            >
              <h2 className="text-4xl font-bold mb-6">
                Ready to Transform Your <span className="text-gradient">Documentation Workflow?</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join the elite tier of developers creating professional video tutorials with AI-powered optimization.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-primary text-lg px-10 py-4">
                  Start Free Trial - 3 Projects
                </button>
                <button className="btn-secondary text-lg px-10 py-4">
                  View Pricing Plans
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12 border-t border-white/10">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <PlayIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">DailyDoco Pro</span>
            </div>
            <p className="text-gray-400">
              © 2025 DailyDoco Pro Team. Transforming development workflows with elite-tier AI.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;