// Configuration Management Module - Application settings and preferences

use anyhow::Result;
use serde::{Serialize, Deserialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub capture: CaptureSettings,
    pub ai: AISettings,
    pub video: VideoSettings,
    pub privacy: PrivacySettings,
    pub performance: PerformanceSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CaptureSettings {
    pub quality: String,
    pub fps: u32,
    pub audio_enabled: bool,
    pub auto_start: bool,
    pub hotkey: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AISettings {
    pub preferred_model: String,
    pub fallback_models: Vec<String>,
    pub narration_enabled: bool,
    pub test_audience_enabled: bool,
    pub personal_brand_learning: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoSettings {
    pub output_format: String,
    pub resolution: String,
    pub quality: String,
    pub compression: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrivacySettings {
    pub sensitive_content_detection: bool,
    pub blur_enabled: bool,
    pub encryption_enabled: bool,
    pub local_processing_only: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceSettings {
    pub max_cpu_usage: f32,
    pub max_memory_usage: u64,
    pub gpu_acceleration: bool,
    pub hardware_encoding: bool,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            capture: CaptureSettings {
                quality: "high".to_string(),
                fps: 30,
                audio_enabled: true,
                auto_start: false,
                hotkey: "Ctrl+Shift+R".to_string(),
            },
            ai: AISettings {
                preferred_model: "deepseek-r1".to_string(),
                fallback_models: vec!["gemma-3".to_string()],
                narration_enabled: true,
                test_audience_enabled: true,
                personal_brand_learning: true,
            },
            video: VideoSettings {
                output_format: "mp4".to_string(),
                resolution: "1920x1080".to_string(),
                quality: "high".to_string(),
                compression: "h264".to_string(),
            },
            privacy: PrivacySettings {
                sensitive_content_detection: true,
                blur_enabled: true,
                encryption_enabled: true,
                local_processing_only: true,
            },
            performance: PerformanceSettings {
                max_cpu_usage: 80.0,
                max_memory_usage: 2 * 1024 * 1024 * 1024, // 2GB
                gpu_acceleration: true,
                hardware_encoding: true,
            },
        }
    }
}

impl AppConfig {
    pub async fn load() -> Result<Self> {
        let config_path = Self::get_config_path()?;
        
        if config_path.exists() {
            log::info!("Loading config from: {:?}", config_path);
            let content = std::fs::read_to_string(&config_path)?;
            let config: AppConfig = toml::from_str(&content)?;
            Ok(config)
        } else {
            log::info!("Config file not found, using defaults");
            let config = Self::default();
            config.save().await?;
            Ok(config)
        }
    }
    
    pub async fn save(&self) -> Result<()> {
        let config_path = Self::get_config_path()?;
        
        if let Some(parent) = config_path.parent() {
            if !parent.exists() {
                std::fs::create_dir_all(parent)?;
            }
        }
        
        let content = toml::to_string_pretty(self)?;
        std::fs::write(&config_path, content)?;
        
        log::info!("Config saved to: {:?}", config_path);
        Ok(())
    }
    
    fn get_config_path() -> Result<PathBuf> {
        let config_dir = dirs::config_dir()
            .ok_or_else(|| anyhow::anyhow!("Could not determine config directory"))?
            .join("dailydoco-pro");
        
        Ok(config_dir.join("config.toml"))
    }
}