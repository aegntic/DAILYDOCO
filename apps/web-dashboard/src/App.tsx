import { useState, useEffect } from 'react';
import SimpleDashboard from './components/SimpleDashboard';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Show simple dashboard if selected
  if (currentView === 'dashboard') {
    return <SimpleDashboard />;
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Dynamic gradient background that responds to mouse */}
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(circle 500px at ${mousePosition.x}px ${mousePosition.y}px, rgba(245, 158, 11, 0.15), rgba(168, 85, 247, 0.15), rgba(59, 130, 246, 0.15), transparent 70%)`
        }}
      />
      
      {/* Grid pattern overlay */}
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -right-[20%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-transparent blur-3xl animate-float" />
        <div className="absolute -bottom-[40%] -left-[20%] w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-amber-600/20 via-purple-600/20 to-transparent blur-3xl animate-pulse-glow" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer hover:scale-105 transition-transform">
              {/* Code brackets with play button logo */}
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg viewBox="0 0 48 48" className="w-full h-full">
                  <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  
                  <text x="6" y="32" className="fill-white/80 font-mono text-2xl font-bold">{'<'}</text>
                  <text x="36" y="32" className="fill-white/80 font-mono text-2xl font-bold">{'>'}</text>
                  
                  <path
                    d="M 18 14 L 18 34 L 34 24 Z"
                    fill="url(#logoGradient)"
                    className="drop-shadow-lg"
                  />
                </svg>
              </div>
              <div>
                <div className="text-white font-semibold text-lg tracking-tight">DailyDoco Pro</div>
                <div className="text-white/60 text-xs tracking-wider uppercase">by aegntic</div>
              </div>
            </div>

            {/* Navigation items */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-white/70 hover:text-white transition-colors font-medium">Product</a>
              <button 
                onClick={() => setCurrentView('dashboard')}
                className="text-white/70 hover:text-white transition-colors font-medium"
              >
                Revenue Dashboard
              </button>
              <a href="#" className="text-white/70 hover:text-white transition-colors font-medium">Pricing</a>
              <a href="#" className="text-white/70 hover:text-white transition-colors font-medium">Docs</a>
              <a href="#" className="text-white/70 hover:text-white transition-colors font-medium">Community</a>
            </div>

            {/* CTA */}
            <button className="relative px-6 py-2.5 rounded-lg font-medium text-white overflow-hidden group hover:scale-105 transition-transform">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-purple-600 to-blue-600 opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
              <span className="relative">Get Started</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-6xl mx-auto text-center">
          {/* Tagline */}
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
            <span className="text-gradient font-medium text-sm">
              AI-Powered Documentation
            </span>
            <span className="mx-2 text-white/40">•</span>
            <span className="text-white/70 text-sm">Trusted by 10,000+ developers</span>
          </div>

          {/* Main headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            <span className="block text-white mb-4">
              Documentation
            </span>
            <span className="block text-gradient">
              That Writes Itself
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your development workflow into professional video tutorials with AI that understands code, 
            predicts important moments, and generates human-like narration.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <button className="group relative px-8 py-4 rounded-xl font-semibold text-white overflow-hidden hover:scale-105 transition-transform">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-purple-600 to-blue-600" />
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-300" />
              <span className="relative flex items-center">
                Start Free Trial
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
            
            <button className="group px-8 py-4 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/10 transition-all hover:scale-105">
              Watch Demo
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          {/* Floating metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 opacity-20 group-hover:opacity-30 transition-opacity rounded-2xl blur-xl" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center glass-card">
                <div className="text-3xl font-bold text-gradient-amber">
                  &lt;2x
                </div>
                <div className="text-sm text-white/60 mt-1">Realtime Processing</div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 opacity-20 group-hover:opacity-30 transition-opacity rounded-2xl blur-xl" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center glass-card">
                <div className="text-3xl font-bold text-gradient-purple">
                  95%
                </div>
                <div className="text-sm text-white/60 mt-1">AI Authenticity</div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 opacity-20 group-hover:opacity-30 transition-opacity rounded-2xl blur-xl" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center glass-card">
                <div className="text-3xl font-bold text-gradient-blue">
                  &lt;5%
                </div>
                <div className="text-sm text-white/60 mt-1">CPU Usage</div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-20 group-hover:opacity-30 transition-opacity rounded-2xl blur-xl" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center glass-card">
                <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-transparent bg-clip-text">
                  98%
                </div>
                <div className="text-sm text-white/60 mt-1">Detection Resistance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2 animate-pulse">
            <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white">Built for </span>
              <span className="text-gradient">
                Elite Performance
              </span>
            </h2>
            <p className="text-xl text-white/60 max-w-3xl mx-auto">
              Every feature engineered to deliver professional results with zero friction.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <div className="relative group hover:scale-102 transition-transform">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl blur-xl" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 h-full glass-card">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 p-2.5 mb-6">
                  <svg className="w-full h-full" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">AI Test Audience</h3>
                <p className="text-white/60 leading-relaxed">50-100 synthetic viewers analyze your content with 90%+ prediction accuracy</p>
              </div>
            </div>

            <div className="relative group hover:scale-102 transition-transform">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl blur-xl" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 h-full glass-card">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 p-2.5 mb-6">
                  <svg className="w-full h-full" fill="white" viewBox="0 0 24 24">
                    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Intelligent Capture</h3>
                <p className="text-white/60 leading-relaxed">Predictive moment detection with 99%+ project identification accuracy</p>
              </div>
            </div>

            <div className="relative group hover:scale-102 transition-transform">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl blur-xl" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 h-full glass-card">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 p-2.5 mb-6">
                  <svg className="w-full h-full" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5c0 .83-.67 1.5-1.5 1.5S12 3.33 12 2.5zm8.5 3c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S22.83 7 22 7s-1.5-.67-1.5-1.5z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Lightning Fast</h3>
                <p className="text-white/60 leading-relaxed">Sub-2x realtime processing with GPU acceleration and smart compression</p>
              </div>
            </div>

            <div className="relative group hover:scale-102 transition-transform">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl blur-xl" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 h-full glass-card">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 p-2.5 mb-6">
                  <svg className="w-full h-full" fill="white" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Human Authenticity</h3>
                <p className="text-white/60 leading-relaxed">95%+ authenticity score - undetectable as AI-generated content</p>
              </div>
            </div>

            <div className="relative group hover:scale-102 transition-transform">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-600 opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl blur-xl" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 h-full glass-card">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 p-2.5 mb-6">
                  <svg className="w-full h-full" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 13v1c0 1.1.9 2 2 2v4.93z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Modular AI Engine</h3>
                <p className="text-white/60 leading-relaxed">Hot-swappable DeepSeek R1 + Gemma 3 models for optimal performance</p>
              </div>
            </div>

            <div className="relative group hover:scale-102 transition-transform">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl blur-xl" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 h-full glass-card">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 p-2.5 mb-6">
                  <svg className="w-full h-full" fill="white" viewBox="0 0 24 24">
                    <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Performance Analytics</h3>
                <p className="text-white/60 leading-relaxed">Real-time insights into engagement, retention, and optimization</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 via-purple-600/20 to-blue-600/20 blur-3xl" />
            
            <div className="relative bg-black/50 backdrop-blur-xl rounded-3xl p-12 md:p-16 border border-white/10 glass-card">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="text-white">Ready to </span>
                <span className="text-gradient">
                  10x Your Documentation?
                </span>
              </h2>
              
              <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                Join thousands of developers who've automated their documentation workflow with AI that actually understands code.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="group relative px-8 py-4 rounded-xl font-semibold text-white overflow-hidden hover:scale-105 transition-transform">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-purple-600 to-blue-600" />
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-300" />
                  <span className="relative">Start Free - 3 Projects</span>
                </button>
                
                <button className="px-8 py-4 rounded-xl font-semibold text-white/80 hover:text-white transition-colors hover:scale-105">
                  Schedule Demo →
                </button>
              </div>
              
              <p className="mt-6 text-sm text-white/50">
                No credit card required • Setup in 60 seconds • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8">
                <svg viewBox="0 0 48 48" className="w-full h-full">
                  <defs>
                    <linearGradient id="footerLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <text x="6" y="32" className="fill-white/60 font-mono text-2xl font-bold">{'<'}</text>
                  <text x="36" y="32" className="fill-white/60 font-mono text-2xl font-bold">{'>'}</text>
                  <path d="M 18 14 L 18 34 L 34 24 Z" fill="url(#footerLogoGradient)" />
                </svg>
              </div>
              <span className="text-white/80 font-semibold">DailyDoco Pro</span>
            </div>
            
            <div className="flex space-x-6 text-sm text-white/50">
              <a href="#" className="hover:text-white/80 transition-colors">Privacy</a>
              <a href="#" className="hover:text-white/80 transition-colors">Terms</a>
              <a href="#" className="hover:text-white/80 transition-colors">GitHub</a>
              <a href="#" className="hover:text-white/80 transition-colors">Discord</a>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-white/30">
            © 2025 aegntic. Transforming development workflows with elite-tier AI.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;