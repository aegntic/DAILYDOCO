/*!
 * aegnt-27 - Configuration Module
 * 
 * Configuration structures and management for all aegnt-27 modules
 */

use serde::{Serialize, Deserialize};
use crate::utils::{AegntError, Result, Validate};
use std::path::PathBuf;

/// Main configuration structure for aegnt-27
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AegntConfig {
    /// Mouse humanization configuration
    pub mouse: MouseConfig,
    
    /// Typing humanization configuration
    pub typing: TypingConfig,
    
    /// Audio humanization configuration
    pub audio: AudioConfig,
    
    /// Visual enhancement configuration
    pub visual: VisualConfig,
    
    /// AI detection validation configuration
    pub detection: DetectionConfig,
    
    /// Logging configuration
    pub logging: LoggingConfig,
    
    /// Performance configuration
    pub performance: PerformanceConfig,
    
    /// Privacy configuration
    pub privacy: PrivacyConfig,
}

/// Mouse humanization configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MouseConfig {
    /// Enable/disable mouse humanization
    pub enabled: bool,
    
    /// Target authenticity score (0.0 to 1.0)
    pub authenticity_target: f32,
    
    /// Naturalness threshold (0.0 to 1.0)
    pub naturalness_threshold: f32,
    
    /// Detection resistance level (0.0 to 1.0)
    pub detection_resistance_level: f32,
    
    /// Enable micro-movements
    pub micro_movements_enabled: bool,
    
    /// Enable drift patterns
    pub drift_patterns_enabled: bool,
    
    /// Enable overshoot correction
    pub overshoot_correction_enabled: bool,
    
    /// Enable Bezier curve acceleration
    pub bezier_acceleration_enabled: bool,
    
    /// Enable velocity modulation
    pub velocity_modulation_enabled: bool,
    
    /// Enable human pattern analysis
    pub human_pattern_analysis_enabled: bool,
    
    /// Enable fatigue simulation
    pub fatigue_simulation_enabled: bool,
    
    /// Enable precision variability
    pub precision_variability_enabled: bool,
    
    /// Enable environmental modeling
    pub environmental_modeling_enabled: bool,
    
    /// Mouse movement intensity (0.0 to 1.0)
    pub movement_intensity: f32,
    
    /// Randomness factor (0.0 to 1.0)
    pub randomness_factor: f32,
}

/// Typing humanization configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TypingConfig {
    /// Enable/disable typing humanization
    pub enabled: bool,
    
    /// Target authenticity score (0.0 to 1.0)
    pub authenticity_target: f32,
    
    /// Naturalness threshold (0.0 to 1.0)
    pub naturalness_threshold: f32,
    
    /// Detection resistance level (0.0 to 1.0)
    pub detection_resistance_level: f32,
    
    /// Enable natural typing rhythm
    pub natural_rhythm_enabled: bool,
    
    /// Enable typo injection and correction
    pub typo_injection_enabled: bool,
    
    /// Typo injection rate (0.0 to 1.0)
    pub typo_injection_rate: f32,
    
    /// Enable fatigue simulation
    pub fatigue_simulation_enabled: bool,
    
    /// Enable thinking pauses
    pub thinking_pauses_enabled: bool,
    
    /// Enable burst typing patterns
    pub burst_typing_enabled: bool,
    
    /// Enable correction patterns
    pub correction_patterns_enabled: bool,
    
    /// Enable speed variation
    pub speed_variation_enabled: bool,
    
    /// Base typing speed (WPM)
    pub base_typing_speed: f32,
    
    /// Speed variation factor (0.0 to 1.0)
    pub speed_variation_factor: f32,
    
    /// Thinking pause frequency (0.0 to 1.0)
    pub thinking_pause_frequency: f32,
}

/// Audio humanization configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioConfig {
    /// Enable/disable audio humanization
    pub enabled: bool,
    
    /// Target authenticity score (0.0 to 1.0)
    pub authenticity_target: f32,
    
    /// Naturalness threshold (0.0 to 1.0)
    pub naturalness_threshold: f32,
    
    /// Detection resistance level (0.0 to 1.0)
    pub detection_resistance_level: f32,
    
    /// Enable breathing pattern injection
    pub breathing_injection_enabled: bool,
    
    /// Enable pause optimization
    pub pause_optimization_enabled: bool,
    
    /// Enable filler word insertion
    pub filler_words_enabled: bool,
    
    /// Enable vocal variation
    pub vocal_variation_enabled: bool,
    
    /// Enable background noise synthesis
    pub background_noise_enabled: bool,
    
    /// Enable emotional intonation
    pub emotional_intonation_enabled: bool,
    
    /// Enable spectral humanization
    pub spectral_humanization_enabled: bool,
    
    /// Breathing frequency (breaths per minute)
    pub breathing_frequency: f32,
    
    /// Pause variation intensity (0.0 to 1.0)
    pub pause_variation_intensity: f32,
    
    /// Background noise level (0.0 to 1.0)
    pub background_noise_level: f32,
}

/// Visual enhancement configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VisualConfig {
    /// Enable/disable visual enhancement
    pub enabled: bool,
    
    /// Target authenticity score (0.0 to 1.0)
    pub authenticity_target: f32,
    
    /// Naturalness threshold (0.0 to 1.0)
    pub naturalness_threshold: f32,
    
    /// Detection resistance level (0.0 to 1.0)
    pub detection_resistance_level: f32,
    
    /// Enable gaze pattern modeling
    pub gaze_patterns_enabled: bool,
    
    /// Enable attention heatmap modeling
    pub attention_modeling_enabled: bool,
    
    /// Enable blink pattern simulation
    pub blink_patterns_enabled: bool,
    
    /// Enable facial micro-expressions
    pub micro_expressions_enabled: bool,
    
    /// Enable lighting adaptation
    pub lighting_adaptation_enabled: bool,
    
    /// Enable screen interaction naturalness
    pub screen_interaction_enabled: bool,
    
    /// Gaze pattern intensity (0.0 to 1.0)
    pub gaze_intensity: f32,
    
    /// Blink frequency (blinks per minute)
    pub blink_frequency: f32,
    
    /// Attention focus variability (0.0 to 1.0)
    pub attention_variability: f32,
}

/// AI detection validation configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectionConfig {
    /// Enable/disable detection validation
    pub enabled: bool,
    
    /// Target resistance score (0.0 to 1.0)
    pub resistance_target: f32,
    
    /// Detection evasion threshold (0.0 to 1.0)
    pub detection_evasion_threshold: f32,
    
    /// Enable GPTZero testing
    pub gpt_zero_testing_enabled: bool,
    
    /// Enable Originality.ai testing
    pub originality_ai_testing_enabled: bool,
    
    /// Enable YouTube detection testing
    pub youtube_detection_testing_enabled: bool,
    
    /// Enable Turnitin testing
    pub turnitin_testing_enabled: bool,
    
    /// Enable comprehensive testing
    pub comprehensive_testing_enabled: bool,
    
    /// Enable evasion strategy generation
    pub evasion_strategies_enabled: bool,
    
    /// Enable pattern analysis
    pub pattern_analysis_enabled: bool,
    
    /// Enable vulnerability assessment
    pub vulnerability_assessment_enabled: bool,
    
    /// Testing timeout (seconds)
    pub testing_timeout_seconds: u32,
    
    /// Maximum concurrent tests
    pub max_concurrent_tests: usize,
}

/// Logging configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoggingConfig {
    /// Enable/disable logging
    pub enabled: bool,
    
    /// Log level (trace, debug, info, warn, error)
    pub level: String,
    
    /// Log to file
    pub file_logging_enabled: bool,
    
    /// Log file path
    pub log_file_path: Option<PathBuf>,
    
    /// Maximum log file size (MB)
    pub max_file_size_mb: u64,
    
    /// Number of log files to retain
    pub max_files: u32,
    
    /// Enable console logging
    pub console_logging_enabled: bool,
    
    /// Enable structured logging (JSON)
    pub structured_logging: bool,
}

/// Performance configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceConfig {
    /// Maximum memory usage (MB)
    pub max_memory_mb: u64,
    
    /// Maximum CPU usage percentage
    pub max_cpu_percent: f32,
    
    /// Enable parallel processing
    pub parallel_processing_enabled: bool,
    
    /// Number of worker threads
    pub worker_threads: Option<usize>,
    
    /// Enable caching
    pub caching_enabled: bool,
    
    /// Cache size (MB)
    pub cache_size_mb: u64,
    
    /// Enable GPU acceleration
    pub gpu_acceleration_enabled: bool,
    
    /// Performance monitoring enabled
    pub monitoring_enabled: bool,
    
    /// Metrics collection interval (seconds)
    pub metrics_interval_seconds: u32,
}

/// Privacy configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrivacyConfig {
    /// Enable privacy protection
    pub enabled: bool,
    
    /// Local processing only (no cloud features)
    pub local_only: bool,
    
    /// Enable data encryption
    pub encryption_enabled: bool,
    
    /// Enable secure memory clearing
    pub secure_memory_clearing: bool,
    
    /// Enable audit logging
    pub audit_logging_enabled: bool,
    
    /// Data retention period (days)
    pub data_retention_days: u32,
    
    /// Enable anonymization
    pub anonymization_enabled: bool,
    
    /// Enable user consent management
    pub consent_management_enabled: bool,
}

impl Default for HumainConfig {
    fn default() -> Self {
        Self {
            mouse: MouseConfig::default(),
            typing: TypingConfig::default(),
            audio: AudioConfig::default(),
            visual: VisualConfig::default(),
            detection: DetectionConfig::default(),
            logging: LoggingConfig::default(),
            performance: PerformanceConfig::default(),
            privacy: PrivacyConfig::default(),
        }
    }
}

impl Default for MouseConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            authenticity_target: 0.96,
            naturalness_threshold: 0.93,
            detection_resistance_level: 0.98,
            micro_movements_enabled: true,
            drift_patterns_enabled: true,
            overshoot_correction_enabled: true,
            bezier_acceleration_enabled: true,
            velocity_modulation_enabled: true,
            human_pattern_analysis_enabled: true,
            fatigue_simulation_enabled: true,
            precision_variability_enabled: true,
            environmental_modeling_enabled: true,
            movement_intensity: 0.7,
            randomness_factor: 0.3,
        }
    }
}

impl Default for TypingConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            authenticity_target: 0.94,
            naturalness_threshold: 0.90,
            detection_resistance_level: 0.96,
            natural_rhythm_enabled: true,
            typo_injection_enabled: true,
            typo_injection_rate: 0.02,
            fatigue_simulation_enabled: true,
            thinking_pauses_enabled: true,
            burst_typing_enabled: true,
            correction_patterns_enabled: true,
            speed_variation_enabled: true,
            base_typing_speed: 65.0,
            speed_variation_factor: 0.25,
            thinking_pause_frequency: 0.15,
        }
    }
}

impl Default for AudioConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            authenticity_target: 0.95,
            naturalness_threshold: 0.92,
            detection_resistance_level: 0.97,
            breathing_injection_enabled: true,
            pause_optimization_enabled: true,
            filler_words_enabled: true,
            vocal_variation_enabled: true,
            background_noise_enabled: false,
            emotional_intonation_enabled: true,
            spectral_humanization_enabled: true,
            breathing_frequency: 16.0,
            pause_variation_intensity: 0.4,
            background_noise_level: 0.1,
        }
    }
}

impl Default for VisualConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            authenticity_target: 0.93,
            naturalness_threshold: 0.88,
            detection_resistance_level: 0.95,
            gaze_patterns_enabled: true,
            attention_modeling_enabled: true,
            blink_patterns_enabled: true,
            micro_expressions_enabled: false,
            lighting_adaptation_enabled: true,
            screen_interaction_enabled: true,
            gaze_intensity: 0.6,
            blink_frequency: 17.0,
            attention_variability: 0.3,
        }
    }
}

impl Default for DetectionConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            resistance_target: 0.98,
            detection_evasion_threshold: 0.95,
            gpt_zero_testing_enabled: true,
            originality_ai_testing_enabled: true,
            youtube_detection_testing_enabled: true,
            turnitin_testing_enabled: true,
            comprehensive_testing_enabled: true,
            evasion_strategies_enabled: true,
            pattern_analysis_enabled: true,
            vulnerability_assessment_enabled: true,
            testing_timeout_seconds: 30,
            max_concurrent_tests: 4,
        }
    }
}

impl Default for LoggingConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            level: "info".to_string(),
            file_logging_enabled: false,
            log_file_path: None,
            max_file_size_mb: 10,
            max_files: 5,
            console_logging_enabled: true,
            structured_logging: false,
        }
    }
}

impl Default for PerformanceConfig {
    fn default() -> Self {
        Self {
            max_memory_mb: 512,
            max_cpu_percent: 50.0,
            parallel_processing_enabled: true,
            worker_threads: None, // Use system default
            caching_enabled: true,
            cache_size_mb: 64,
            gpu_acceleration_enabled: false,
            monitoring_enabled: true,
            metrics_interval_seconds: 60,
        }
    }
}

impl Default for PrivacyConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            local_only: true,
            encryption_enabled: true,
            secure_memory_clearing: true,
            audit_logging_enabled: false,
            data_retention_days: 30,
            anonymization_enabled: true,
            consent_management_enabled: true,
        }
    }
}

impl Validate for AegntConfig {
    type Error = AegntError;
    
    fn validate(&self) -> Result<()> {
        self.mouse.validate()?;
        self.typing.validate()?;
        self.audio.validate()?;
        self.visual.validate()?;
        self.detection.validate()?;
        self.logging.validate()?;
        self.performance.validate()?;
        self.privacy.validate()?;
        
        Ok(())
    }
}

impl Validate for MouseConfig {
    type Error = HumainError;
    
    fn validate(&self) -> Result<()> {
        if self.authenticity_target < 0.0 || self.authenticity_target > 1.0 {
            return Err(HumainError::validation("Mouse authenticity_target must be between 0.0 and 1.0"));
        }
        if self.naturalness_threshold < 0.0 || self.naturalness_threshold > 1.0 {
            return Err(HumainError::validation("Mouse naturalness_threshold must be between 0.0 and 1.0"));
        }
        if self.detection_resistance_level < 0.0 || self.detection_resistance_level > 1.0 {
            return Err(HumainError::validation("Mouse detection_resistance_level must be between 0.0 and 1.0"));
        }
        Ok(())
    }
}

impl Validate for TypingConfig {
    type Error = HumainError;
    
    fn validate(&self) -> Result<()> {
        if self.typo_injection_rate < 0.0 || self.typo_injection_rate > 1.0 {
            return Err(HumainError::validation("Typing typo_injection_rate must be between 0.0 and 1.0"));
        }
        if self.base_typing_speed <= 0.0 {
            return Err(HumainError::validation("Typing base_typing_speed must be positive"));
        }
        Ok(())
    }
}

impl Validate for AudioConfig {
    type Error = HumainError;
    
    fn validate(&self) -> Result<()> {
        if self.breathing_frequency <= 0.0 {
            return Err(HumainError::validation("Audio breathing_frequency must be positive"));
        }
        if self.background_noise_level < 0.0 || self.background_noise_level > 1.0 {
            return Err(HumainError::validation("Audio background_noise_level must be between 0.0 and 1.0"));
        }
        Ok(())
    }
}

impl Validate for VisualConfig {
    type Error = HumainError;
    
    fn validate(&self) -> Result<()> {
        if self.blink_frequency <= 0.0 {
            return Err(HumainError::validation("Visual blink_frequency must be positive"));
        }
        if self.gaze_intensity < 0.0 || self.gaze_intensity > 1.0 {
            return Err(HumainError::validation("Visual gaze_intensity must be between 0.0 and 1.0"));
        }
        Ok(())
    }
}

impl Validate for DetectionConfig {
    type Error = HumainError;
    
    fn validate(&self) -> Result<()> {
        if self.testing_timeout_seconds == 0 {
            return Err(HumainError::validation("Detection testing_timeout_seconds must be positive"));
        }
        if self.max_concurrent_tests == 0 {
            return Err(HumainError::validation("Detection max_concurrent_tests must be positive"));
        }
        Ok(())
    }
}

impl Validate for LoggingConfig {
    type Error = HumainError;
    
    fn validate(&self) -> Result<()> {
        let valid_levels = ["trace", "debug", "info", "warn", "error"];
        if !valid_levels.contains(&self.level.as_str()) {
            return Err(HumainError::validation("Invalid logging level"));
        }
        Ok(())
    }
}

impl Validate for PerformanceConfig {
    type Error = HumainError;
    
    fn validate(&self) -> Result<()> {
        if self.max_memory_mb == 0 {
            return Err(HumainError::validation("Performance max_memory_mb must be positive"));
        }
        if self.max_cpu_percent <= 0.0 || self.max_cpu_percent > 100.0 {
            return Err(HumainError::validation("Performance max_cpu_percent must be between 0.0 and 100.0"));
        }
        Ok(())
    }
}

impl Validate for PrivacyConfig {
    type Error = HumainError;
    
    fn validate(&self) -> Result<()> {
        if self.data_retention_days == 0 {
            return Err(HumainError::validation("Privacy data_retention_days must be positive"));
        }
        Ok(())
    }
}

/// Configuration management utilities
pub struct ConfigManager;

impl ConfigManager {
    /// Load configuration from file
    pub fn load_from_file(path: &std::path::Path) -> Result<AegntConfig> {
        let content = std::fs::read_to_string(path)
            .map_err(|e| AegntError::configuration(format!("Failed to read config file: {}", e)))?
        
        if path.extension().and_then(|s| s.to_str()) == Some("json") {
            serde_json::from_str(&content)
                .map_err(|e| AegntError::configuration(format!("Failed to parse JSON config: {}", e)))
        } else {
            toml::from_str(&content)
                .map_err(|e| AegntError::configuration(format!("Failed to parse TOML config: {}", e)))
        }
    }
    
    /// Save configuration to file
    pub fn save_to_file(config: &AegntConfig, path: &std::path::Path) -> Result<()> {
        let content = if path.extension().and_then(|s| s.to_str()) == Some("json") {
            serde_json::to_string_pretty(config)
                .map_err(|e| AegntError::configuration(format!("Failed to serialize JSON config: {}", e)))?
        } else {
            toml::to_string_pretty(config)
                .map_err(|e| AegntError::configuration(format!("Failed to serialize TOML config: {}", e)))?
        };
        
        std::fs::write(path, content)
            .map_err(|e| AegntError::configuration(format!("Failed to write config file: {}", e)))?;
        
        Ok(())
    }
    
    /// Load configuration from environment variables
    pub fn load_from_env() -> Result<AegntConfig> {
        // This would implement environment variable configuration loading
        // For now, return default config
        Ok(AegntConfig::default())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::NamedTempFile;

    #[test]
    fn test_default_config_validation() {
        let config = HumainConfig::default();
        assert!(config.validate().is_ok());
    }

    #[test]
    fn test_invalid_config_validation() {
        let mut config = HumainConfig::default();
        config.mouse.authenticity_target = 1.5; // Invalid value
        
        assert!(config.validate().is_err());
    }

    #[test]
    fn test_config_serialization() {
        let config = HumainConfig::default();
        
        // Test JSON serialization
        let json = serde_json::to_string(&config).unwrap();
        let deserialized: HumainConfig = serde_json::from_str(&json).unwrap();
        assert_eq!(config.mouse.authenticity_target, deserialized.mouse.authenticity_target);
        
        // Test TOML serialization
        let toml = toml::to_string(&config).unwrap();
        let deserialized: HumainConfig = toml::from_str(&toml).unwrap();
        assert_eq!(config.mouse.authenticity_target, deserialized.mouse.authenticity_target);
    }

    #[test]
    fn test_config_file_operations() {
        let config = HumainConfig::default();
        
        // Test JSON file
        let json_file = NamedTempFile::with_suffix(".json").unwrap();
        ConfigManager::save_to_file(&config, json_file.path()).unwrap();
        let loaded_config = ConfigManager::load_from_file(json_file.path()).unwrap();
        assert_eq!(config.mouse.authenticity_target, loaded_config.mouse.authenticity_target);
        
        // Test TOML file
        let toml_file = NamedTempFile::with_suffix(".toml").unwrap();
        ConfigManager::save_to_file(&config, toml_file.path()).unwrap();
        let loaded_config = ConfigManager::load_from_file(toml_file.path()).unwrap();
        assert_eq!(config.mouse.authenticity_target, loaded_config.mouse.authenticity_target);
    }
}