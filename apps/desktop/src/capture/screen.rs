use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::{mpsc, RwLock};
use anyhow::{Result, Context};
use serde::{Serialize, Deserialize};

/// Screen capture configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CaptureConfig {
    /// Target frames per second
    pub fps: u32,
    /// Quality setting (1-100)
    pub quality: u8,
    /// Whether to capture cursor
    pub include_cursor: bool,
    /// Monitor index to capture (None for primary)
    pub monitor_index: Option<usize>,
    /// Capture region (None for full screen)
    pub region: Option<CaptureRegion>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CaptureRegion {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}

/// Frame data with metadata
#[derive(Debug, Clone)]
pub struct CaptureFrame {
    pub data: Vec<u8>,
    pub width: u32,
    pub height: u32,
    pub timestamp: Instant,
    pub format: FrameFormat,
}

#[derive(Debug, Clone, Copy)]
pub enum FrameFormat {
    Rgba8,
    Rgb8,
    Bgra8,
}

/// Screen capture statistics
#[derive(Debug, Clone, Serialize)]
pub struct CaptureStats {
    pub frames_captured: u64,
    pub frames_dropped: u64,
    pub average_fps: f64,
    pub cpu_usage_percent: f64,
    pub memory_usage_mb: f64,
}

/// Events emitted by the capture engine
#[derive(Debug, Clone)]
pub enum CaptureEvent {
    FrameCaptured(CaptureFrame),
    CaptureStarted,
    CaptureStopped,
    Error(String),
    StatsUpdate(CaptureStats),
}

/// High-performance screen capture engine
pub struct ScreenCaptureEngine {
    config: Arc<RwLock<CaptureConfig>>,
    is_capturing: Arc<RwLock<bool>>,
    stats: Arc<RwLock<CaptureStats>>,
    event_sender: mpsc::UnboundedSender<CaptureEvent>,
}

impl ScreenCaptureEngine {
    /// Create a new capture engine
    pub fn new(config: CaptureConfig) -> Result<(Self, mpsc::UnboundedReceiver<CaptureEvent>)> {
        let (event_sender, event_receiver) = mpsc::unbounded_channel();
        
        let engine = Self {
            config: Arc::new(RwLock::new(config)),
            is_capturing: Arc::new(RwLock::new(false)),
            stats: Arc::new(RwLock::new(CaptureStats {
                frames_captured: 0,
                frames_dropped: 0,
                average_fps: 0.0,
                cpu_usage_percent: 0.0,
                memory_usage_mb: 0.0,
            })),
            event_sender,
        };
        
        Ok((engine, event_receiver))
    }
    
    /// Start screen capture
    pub async fn start_capture(&self) -> Result<()> {
        let mut is_capturing = self.is_capturing.write().await;
        
        if *is_capturing {
            return Err(anyhow::anyhow!("Capture already in progress"));
        }
        
        *is_capturing = true;
        drop(is_capturing);
        
        // Emit capture started event
        self.event_sender.send(CaptureEvent::CaptureStarted)
            .map_err(|_| anyhow::anyhow!("Failed to send capture started event"))?;
        
        // Start capture loop in background
        self.spawn_capture_loop().await?;
        
        Ok(())
    }
    
    /// Stop screen capture
    pub async fn stop_capture(&self) -> Result<()> {
        let mut is_capturing = self.is_capturing.write().await;
        *is_capturing = false;
        
        // Emit capture stopped event
        self.event_sender.send(CaptureEvent::CaptureStopped)
            .map_err(|_| anyhow::anyhow!("Failed to send capture stopped event"))?;
        
        Ok(())
    }
    
    /// Update capture configuration
    pub async fn update_config(&self, new_config: CaptureConfig) -> Result<()> {
        let mut config = self.config.write().await;
        *config = new_config;
        Ok(())
    }
    
    /// Get current capture statistics
    pub async fn get_stats(&self) -> CaptureStats {
        self.stats.read().await.clone()
    }
    
    /// Check if currently capturing
    pub async fn is_capturing(&self) -> bool {
        *self.is_capturing.read().await
    }
    
    /// Spawn the main capture loop
    async fn spawn_capture_loop(&self) -> Result<()> {
        let config = self.config.clone();
        let is_capturing = self.is_capturing.clone();
        let stats = self.stats.clone();
        let event_sender = self.event_sender.clone();
        
        tokio::spawn(async move {
            if let Err(e) = Self::capture_loop(config, is_capturing, stats, event_sender).await {
                log::error!("Capture loop error: {}", e);
            }
        });
        
        Ok(())
    }
    
    /// Main capture loop
    async fn capture_loop(
        config: Arc<RwLock<CaptureConfig>>,
        is_capturing: Arc<RwLock<bool>>,
        stats: Arc<RwLock<CaptureStats>>,
        event_sender: mpsc::UnboundedSender<CaptureEvent>,
    ) -> Result<()> {
        let mut frame_count = 0u64;
        let mut last_stats_update = Instant::now();
        let stats_update_interval = Duration::from_secs(1);
        
        // Initialize screen capture
        let capturer = Self::initialize_capturer(&config).await?;
        
        while *is_capturing.read().await {
            let capture_start = Instant::now();
            let config_guard = config.read().await;
            let target_frame_duration = Duration::from_millis(1000 / config_guard.fps as u64);
            drop(config_guard);
            
            // Capture frame
            match Self::capture_single_frame(&capturer).await {
                Ok(frame) => {
                    frame_count += 1;
                    
                    // Send frame event
                    if event_sender.send(CaptureEvent::FrameCaptured(frame)).is_err() {
                        log::warn!("Failed to send frame event - receiver dropped");
                        break;
                    }
                    
                    // Update stats
                    {
                        let mut stats_guard = stats.write().await;
                        stats_guard.frames_captured = frame_count;
                    }
                }
                Err(e) => {
                    log::error!("Frame capture error: {}", e);
                    let _ = event_sender.send(CaptureEvent::Error(e.to_string()));
                    
                    // Update dropped frame count
                    {
                        let mut stats_guard = stats.write().await;
                        stats_guard.frames_dropped += 1;
                    }
                }
            }
            
            // Update stats periodically
            if last_stats_update.elapsed() >= stats_update_interval {
                let current_stats = stats.read().await.clone();
                let _ = event_sender.send(CaptureEvent::StatsUpdate(current_stats));
                last_stats_update = Instant::now();
            }
            
            // Frame rate limiting
            let capture_duration = capture_start.elapsed();
            if capture_duration < target_frame_duration {
                tokio::time::sleep(target_frame_duration - capture_duration).await;
            }
        }
        
        Ok(())
    }
    
    /// Initialize screen capturer based on platform
    async fn initialize_capturer(
        _config: &Arc<RwLock<CaptureConfig>>,
    ) -> Result<PlatformCapturer> {
        // Platform-specific initialization
        #[cfg(target_os = "windows")]
        {
            PlatformCapturer::new_windows().await
        }
        #[cfg(target_os = "macos")]
        {
            PlatformCapturer::new_macos().await
        }
        #[cfg(target_os = "linux")]
        {
            PlatformCapturer::new_linux().await
        }
    }
    
    /// Capture a single frame
    async fn capture_single_frame(capturer: &PlatformCapturer) -> Result<CaptureFrame> {
        capturer.capture_frame().await
    }
}

/// Platform-specific capturer implementation
pub struct PlatformCapturer {
    // Platform-specific fields will be added here
    #[allow(dead_code)]
    inner: Box<dyn Send + Sync>,
}

impl PlatformCapturer {
    /// Create Windows-specific capturer
    #[cfg(target_os = "windows")]
    async fn new_windows() -> Result<Self> {
        use screenshots::Screen;
        
        let screens = Screen::all().context("Failed to enumerate screens")?;
        if screens.is_empty() {
            return Err(anyhow::anyhow!("No screens found"));
        }
        
        // Use primary screen for now
        let screen = screens[0].clone();
        
        Ok(Self {
            inner: Box::new(screen),
        })
    }
    
    /// Create macOS-specific capturer  
    #[cfg(target_os = "macos")]
    async fn new_macos() -> Result<Self> {
        use screenshots::Screen;
        
        let screens = Screen::all().context("Failed to enumerate screens")?;
        if screens.is_empty() {
            return Err(anyhow::anyhow!("No screens found"));
        }
        
        Ok(Self {
            inner: Box::new(screens[0].clone()),
        })
    }
    
    /// Create Linux-specific capturer
    #[cfg(target_os = "linux")]
    async fn new_linux() -> Result<Self> {
        use screenshots::Screen;
        
        let screens = Screen::all().context("Failed to enumerate screens")?;
        if screens.is_empty() {
            return Err(anyhow::anyhow!("No screens found"));
        }
        
        Ok(Self {
            inner: Box::new(screens[0].clone()),
        })
    }
    
    /// Capture a frame from the screen
    async fn capture_frame(&self) -> Result<CaptureFrame> {
        // This is a simplified implementation
        // In production, this would use platform-specific optimized APIs
        
        use screenshots::Screen;
        let screen = Screen::all().context("Failed to get screens")?;
        let primary = &screen[0];
        
        let image = primary.capture().context("Failed to capture screen")?;
        
        Ok(CaptureFrame {
            data: image.as_raw().to_vec(),
            width: image.width(),
            height: image.height(),
            timestamp: Instant::now(),
            format: FrameFormat::Rgba8,
        })
    }
}

/// Default configuration for high-quality capture
impl Default for CaptureConfig {
    fn default() -> Self {
        Self {
            fps: 30,
            quality: 90,
            include_cursor: true,
            monitor_index: None,
            region: None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_capture_engine_creation() {
        let config = CaptureConfig::default();
        let result = ScreenCaptureEngine::new(config);
        assert!(result.is_ok());
    }
    
    #[tokio::test]
    async fn test_capture_config_update() {
        let config = CaptureConfig::default();
        let (engine, _receiver) = ScreenCaptureEngine::new(config).unwrap();
        
        let new_config = CaptureConfig {
            fps: 60,
            ..Default::default()
        };
        
        let result = engine.update_config(new_config).await;
        assert!(result.is_ok());
    }
}