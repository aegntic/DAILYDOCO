//! DailyDoco Pro - Elite-Tier Native Screen Capture Engine
//! 
//! Cross-platform screen capture with hardware acceleration, privacy controls,
//! and sub-2x realtime processing for professional video documentation.
//!
//! ## Performance Targets
//! - 4K@30fps with <5% CPU usage
//! - <200MB memory baseline
//! - GPU acceleration where available
//! - Real-time privacy filtering

pub mod screen;
pub mod native;   // Platform-specific native capture implementations
pub mod monitors; // Multi-monitor detection and coordination
pub mod activity; // Activity detection and ML scoring
pub mod privacy;  // Privacy filtering and content sanitization
// pub mod audio;     // TODO: Re-enable when audio dependencies are available

// Re-export both legacy and new interfaces for compatibility
pub use screen::{
    ScreenCaptureEngine,
    CaptureConfig as LegacyCaptureConfig,
    CaptureFrame as LegacyCaptureFrame,
    CaptureRegion,
    CaptureEvent,
    CaptureStats,
    FrameFormat as LegacyFrameFormat,
};

// New elite-tier capture interface
pub use native::{
    ScreenCapture,
    CaptureFrame,
    CaptureConfig,
    FrameFormat,
    CaptureError,
    CaptureResult,
    CaptureSession,
    MonitorInfo,
    CaptureCapabilities,
    PerformanceReport,
    CaptureEngineFactory,
    MockCaptureEngine,
    Resolution,
    MonitorSelection,
    QualityPreset,
};

use anyhow::Result;
use serde::{Serialize, Deserialize};
use std::sync::Arc;
use async_trait::async_trait;

/// Elite-tier capture controller with native platform optimizations
pub struct CaptureController {
    legacy_screen_engine: Option<ScreenCaptureEngine>,
    native_capture_engine: Option<Box<dyn ScreenCapture>>,
    capture_session: Option<CaptureSession>,
    performance_monitor: Arc<crate::performance::PerformanceMonitor>,
    // audio_engine: Option<AudioCaptureEngine>,    // TODO: Add when audio is ready
    // activity_detector: Option<ActivityDetector>,  // TODO: Add activity detection
    // privacy_filter: Option<PrivacyFilter>,       // TODO: Add privacy filtering
}

/// Elite-tier master capture configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MasterCaptureConfig {
    pub screen: LegacyCaptureConfig,      // Legacy compatibility
    pub native: Option<CaptureConfig>,    // New native capture config
    pub use_native_engine: bool,          // Switch between legacy and native
    pub enable_audio: bool,
    pub enable_activity_detection: bool,
    pub enable_privacy_filtering: bool,
    pub output_directory: String,
    pub performance_targets: PerformanceTargets,
}

/// Performance targets for validation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceTargets {
    pub max_cpu_usage_percent: f32,
    pub max_memory_mb: u64,
    pub target_fps: u32,
    pub max_capture_latency_ms: f64,
}

/// Events from the master capture controller
#[derive(Debug, Clone)]
pub enum MasterCaptureEvent {
    ScreenEvent(CaptureEvent),
    // AudioEvent(AudioEvent),     // TODO: Add when audio is ready
    // ActivityEvent(ActivityEvent), // TODO: Add when activity detection is ready
    SystemEvent(SystemEvent),
}

#[derive(Debug, Clone)]
pub enum SystemEvent {
    CaptureSystemInitialized,
    CaptureSystemError(String),
    PerformanceAlert(String),
}

impl CaptureController {
    /// Create a new elite-tier capture controller
    pub fn new() -> Self {
        Self {
            legacy_screen_engine: None,
            native_capture_engine: None,
            capture_session: None,
            performance_monitor: Arc::new(crate::performance::PerformanceMonitor::new()),
        }
    }
    
    /// Initialize capture systems with native engine support
    pub async fn initialize(&mut self, config: MasterCaptureConfig) -> Result<()> {
        if config.use_native_engine && config.native.is_some() {
            // Initialize elite-tier native capture engine
            let mut engine = CaptureEngineFactory::create_engine()
                .map_err(|e| anyhow::anyhow!("Failed to create native engine: {}", e))?;
            
            let native_config = config.native.unwrap();
            
            // Validate performance targets before proceeding
            let performance_report = engine.validate_performance(&native_config).await
                .map_err(|e| anyhow::anyhow!("Performance validation failed: {}", e))?;
            
            self.validate_performance_targets(&performance_report, &config.performance_targets)?;
            
            engine.initialize(native_config.clone()).await
                .map_err(|e| anyhow::anyhow!("Native engine initialization failed: {}", e))?;
            
            let session = engine.start_capture_session().await
                .map_err(|e| anyhow::anyhow!("Failed to start capture session: {}", e))?;
            
            self.native_capture_engine = Some(engine);
            self.capture_session = Some(session);
            
            log::info!("Native capture engine initialized with elite performance targets");
        } else {
            // Fall back to legacy screen capture
            let (screen_engine, _screen_receiver) = ScreenCaptureEngine::new(config.screen)?;
            self.legacy_screen_engine = Some(screen_engine);
            log::info!("Legacy capture engine initialized");
        }
        
        // TODO: Initialize other capture systems when ready
        // if config.enable_audio {
        //     self.audio_engine = Some(AudioCaptureEngine::new(config.audio)?);
        // }
        
        Ok(())
    }
    
    /// Validate that performance targets are achievable
    fn validate_performance_targets(
        &self,
        report: &PerformanceReport,
        targets: &PerformanceTargets,
    ) -> Result<()> {
        if report.estimated_cpu_usage > targets.max_cpu_usage_percent {
            return Err(anyhow::anyhow!(
                "CPU usage {} exceeds target {}",
                report.estimated_cpu_usage,
                targets.max_cpu_usage_percent
            ));
        }
        
        if report.estimated_memory_mb > targets.max_memory_mb {
            return Err(anyhow::anyhow!(
                "Memory usage {} MB exceeds target {} MB",
                report.estimated_memory_mb,
                targets.max_memory_mb
            ));
        }
        
        if report.estimated_fps < targets.target_fps as f32 {
            return Err(anyhow::anyhow!(
                "FPS {} below target {}",
                report.estimated_fps,
                targets.target_fps
            ));
        }
        
        Ok(())
    }
    
    /// Start capture with native or legacy engine
    pub async fn start_capture(&self) -> Result<()> {
        if let Some(ref _session) = self.capture_session {
            log::info!("Native capture session already active");
        } else if let Some(ref engine) = self.legacy_screen_engine {
            engine.start_capture().await?;
            log::info!("Legacy screen capture started");
        } else {
            return Err(anyhow::anyhow!("No capture engine initialized"));
        }
        
        // TODO: Start other capture systems
        
        Ok(())
    }
    
    /// Capture a single frame using the active engine
    pub async fn capture_frame(&self) -> Result<Option<CaptureFrame>> {
        if let Some(ref session) = self.capture_session {
            match session.capture_frame().await {
                Ok(frame) => {
                    self.performance_monitor.record_capture_latency(
                        frame.metadata.capture_latency_ms
                    );
                    Ok(Some(frame))
                }
                Err(e) => {
                    log::error!("Native frame capture failed: {}", e);
                    Err(anyhow::anyhow!("Frame capture failed: {}", e))
                }
            }
        } else {
            // Legacy engine doesn't expose frame capture directly
            log::warn!("Frame capture not available with legacy engine");
            Ok(None)
        }
    }
    
    /// Stop all capture systems
    pub async fn stop_capture(&self) -> Result<()> {
        if let Some(ref _session) = self.capture_session {
            log::info!("Native capture session stopped");
            // Native session stops automatically when dropped
        } else if let Some(ref engine) = self.legacy_screen_engine {
            engine.stop_capture().await?;
            log::info!("Legacy screen capture stopped");
        }
        
        // TODO: Stop other capture systems
        
        Ok(())
    }
    
    /// Get comprehensive performance statistics
    pub async fn get_performance_stats(&self) -> Result<PerformanceStats> {
        let mut stats = PerformanceStats::default();
        
        if let Some(ref engine) = self.native_capture_engine {
            // Get native engine capabilities and performance
            let capabilities = engine.get_capabilities();
            stats.native_engine_active = true;
            stats.gpu_acceleration_available = capabilities.hardware_acceleration;
            stats.max_supported_resolution = capabilities.max_resolution;
        } else if let Some(ref engine) = self.legacy_screen_engine {
            stats.screen = Some(engine.get_stats().await);
            stats.native_engine_active = false;
        }
        
        // Get performance monitor stats
        stats.performance_metrics = Some(self.performance_monitor.get_current_metrics());
        
        // TODO: Collect stats from other systems
        
        Ok(stats)
    }
    
    /// Check if any capture system is active
    pub async fn is_capturing(&self) -> bool {
        if self.capture_session.is_some() {
            return true;
        }
        
        if let Some(ref engine) = self.legacy_screen_engine {
            if engine.is_capturing().await {
                return true;
            }
        }
        
        // TODO: Check other capture systems
        
        false
    }
    
    /// Get available monitors from native engine
    pub async fn get_available_monitors(&self) -> Result<Vec<MonitorInfo>> {
        if let Some(ref engine) = self.native_capture_engine {
            engine.get_monitors().await
                .map_err(|e| anyhow::anyhow!("Failed to get monitors: {}", e))
        } else {
            Err(anyhow::anyhow!("Native engine not available"))
        }
    }
    
    /// Switch between capture engines at runtime
    pub async fn switch_to_native_engine(&mut self, config: CaptureConfig) -> Result<()> {
        // Stop legacy engine if running
        if let Some(ref engine) = self.legacy_screen_engine {
            if engine.is_capturing().await {
                engine.stop_capture().await?;
            }
        }
        self.legacy_screen_engine = None;
        
        // Initialize native engine
        let mut engine = CaptureEngineFactory::create_engine()
            .map_err(|e| anyhow::anyhow!("Failed to create native engine: {}", e))?;
        
        engine.initialize(config.clone()).await
            .map_err(|e| anyhow::anyhow!("Native engine initialization failed: {}", e))?;
        
        let session = engine.start_capture_session().await
            .map_err(|e| anyhow::anyhow!("Failed to start capture session: {}", e))?;
        
        self.native_capture_engine = Some(engine);
        self.capture_session = Some(session);
        
        log::info!("Switched to native capture engine");
        Ok(())
    }
}

/// Elite-tier performance statistics
#[derive(Debug, Clone, Serialize)]
pub struct PerformanceStats {
    pub screen: Option<CaptureStats>,      // Legacy engine stats
    pub native_engine_active: bool,       // Whether native engine is being used
    pub gpu_acceleration_available: bool,  // Hardware acceleration status
    pub max_supported_resolution: (u32, u32), // Maximum capture resolution
    pub performance_metrics: Option<crate::performance::Metrics>, // Detailed performance data
    // pub audio: Option<AudioStats>,     // TODO: Add when audio is ready
    // pub activity: Option<ActivityStats>, // TODO: Add when activity detection is ready
    pub system_cpu_usage: f64,
    pub system_memory_usage: f64,
    pub total_frames_captured: u64,
}

impl Default for PerformanceStats {
    fn default() -> Self {
        Self {
            screen: None,
            native_engine_active: false,
            gpu_acceleration_available: false,
            max_supported_resolution: (1920, 1080),
            performance_metrics: None,
            system_cpu_usage: 0.0,
            system_memory_usage: 0.0,
            total_frames_captured: 0,
        }
    }
}

impl Default for MasterCaptureConfig {
    fn default() -> Self {
        Self {
            screen: LegacyCaptureConfig::default(),
            native: Some(CaptureConfig {
                target_fps: 30,
                resolution: Resolution::FHD,
                format: FrameFormat::RGBA8,
                enable_gpu_acceleration: true,
                enable_privacy_filter: true,
                monitor_selection: MonitorSelection::Primary,
                quality_preset: QualityPreset::Balanced,
            }),
            use_native_engine: true,  // Prefer native engine by default
            enable_audio: false,  // Disabled until audio dependencies are ready
            enable_activity_detection: false,  // TODO: Enable when implemented
            enable_privacy_filtering: true,
            output_directory: "./captures".to_string(),
            performance_targets: PerformanceTargets::default(),
        }
    }
}

impl Default for PerformanceTargets {
    fn default() -> Self {
        Self {
            max_cpu_usage_percent: 5.0,    // Elite-tier target: <5% CPU
            max_memory_mb: 200,             // Elite-tier target: <200MB
            target_fps: 30,                 // Standard 30fps for documentation
            max_capture_latency_ms: 33.0,   // ~1 frame at 30fps
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_capture_controller_creation() {
        let controller = CaptureController::new();
        assert!(!controller.is_capturing().await);
        
        let stats = controller.get_performance_stats().await.unwrap();
        assert!(!stats.native_engine_active);
        assert!(!stats.gpu_acceleration_available);
    }
    
    #[tokio::test]
    async fn test_capture_controller_initialization_legacy() {
        let mut controller = CaptureController::new();
        let mut config = MasterCaptureConfig::default();
        config.use_native_engine = false;  // Force legacy for this test
        
        let result = controller.initialize(config).await;
        assert!(result.is_ok());
    }
    
    #[tokio::test]
    async fn test_capture_controller_initialization_native() {
        let mut controller = CaptureController::new();
        let config = MasterCaptureConfig::default(); // Uses native by default
        
        // This test may fail if native engine isn't available, which is expected
        let _result = controller.initialize(config).await;
        // Don't assert on result as it depends on platform support
    }
    
    #[tokio::test]
    async fn test_performance_targets_validation() {
        let controller = CaptureController::new();
        let targets = PerformanceTargets::default();
        
        let good_report = PerformanceReport {
            estimated_fps: 30.0,
            estimated_cpu_usage: 3.0,
            estimated_memory_mb: 150,
            gpu_acceleration_available: true,
            bottlenecks: vec![],
            recommendations: vec![],
        };
        
        assert!(controller.validate_performance_targets(&good_report, &targets).is_ok());
        
        let bad_report = PerformanceReport {
            estimated_fps: 15.0,  // Below target
            estimated_cpu_usage: 8.0,  // Above target
            estimated_memory_mb: 300,  // Above target
            gpu_acceleration_available: false,
            bottlenecks: vec!["CPU bottleneck".to_string()],
            recommendations: vec!["Enable GPU acceleration".to_string()],
        };
        
        assert!(controller.validate_performance_targets(&bad_report, &targets).is_err());
    }
}