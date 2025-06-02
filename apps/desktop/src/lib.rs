/*!
 * HUMaiN2.7 - Human-like Ultra-Modern AI Neutralization System
 * 
 * A comprehensive Rust library for AI detection evasion and human-like behavior simulation.
 * Provides state-of-the-art humanization techniques for automated systems while maintaining
 * authenticity and privacy.
 */

#![deny(missing_docs)]
#![warn(clippy::all, clippy::pedantic, clippy::nursery)]
#![allow(clippy::module_name_repetitions, clippy::too_many_lines)]

// Core modules
pub mod mouse;
pub mod typing;
pub mod audio;
pub mod visual;
pub mod detection;
pub mod config;
pub mod utils;

// Re-export main interfaces for convenience
pub use mouse::{
    MouseHumanizer, MouseHumanizationConfig, MouseHumanizationInput, 
    MouseHumanizationResult, MousePath, MousePoint, HumanizedMousePath,
    MovementAuthenticityScores,
};

pub use typing::{
    TypingHumanizer, TypingHumanizationConfig, TypingHumanizationInput,
    TypingHumanizationResult, HumanizedTypingSequence, HumanizedKeystroke,
    TypingAuthenticityScores,
};

pub use audio::{
    AudioSpectralHumanizer, AudioSpectralHumanizationConfig, AudioHumanizationResult,
    HumanizedAudio, AudioAuthenticityScores, SpectralAnalysisResults,
};

pub use visual::{
    VisualAuthenticityEnhancer, VisualAuthenticityConfig, VisualEnhancementResult,
    EnhancedVisualContent, VisualAuthenticityScores, VisualAnalysisResults,
};

pub use detection::{
    AIDetectionValidator, AIDetectionValidationConfig, ValidationInput, ValidationResult,
    DetectorTestResult, DetectionVerdict, VulnerabilityAssessment,
};

pub use config::{
    HumainConfig, MouseConfig, TypingConfig, AudioConfig, VisualConfig, DetectionConfig,
};

// Prelude module for convenient imports
pub mod prelude {
    //! Convenient re-exports for common HUMaiN2.7 usage
    
    pub use crate::{
        // Core types
        HumainConfig,
        
        // Mouse humanization
        MouseHumanizer, MouseHumanizationConfig, MouseHumanizationInput,
        MouseHumanizationResult, MousePath, MousePoint, MovementAuthenticityScores,
        
        // Typing humanization  
        TypingHumanizer, TypingHumanizationConfig, TypingHumanizationInput,
        TypingHumanizationResult, TypingAuthenticityScores,
        
        // Audio humanization
        AudioSpectralHumanizer, AudioSpectralHumanizationConfig, AudioHumanizationResult,
        AudioAuthenticityScores,
        
        // Visual enhancement
        VisualAuthenticityEnhancer, VisualAuthenticityConfig, VisualEnhancementResult,
        VisualAuthenticityScores,
        
        // AI detection validation
        AIDetectionValidator, AIDetectionValidationConfig, ValidationInput, ValidationResult,
        DetectionVerdict,
        
        // Utilities
        utils::{HumainError, Result},
    };
    
    // Common external dependencies
    pub use uuid::Uuid;
    pub use chrono::{DateTime, Utc};
    pub use serde::{Serialize, Deserialize};
    pub use tokio;
}

// Version information
pub const VERSION: &str = env!("CARGO_PKG_VERSION");
pub const AUTHORS: &str = env!("CARGO_PKG_AUTHORS");
pub const DESCRIPTION: &str = env!("CARGO_PKG_DESCRIPTION");

/// Initialize aegnt-27 with default configuration
/// 
/// This function sets up logging and validates the runtime environment.
/// Should be called once at the start of your application.
///
/// # Examples
///
/// ```no_run
/// use aegnt_27;
///
/// #[tokio::main]
/// async fn main() -> Result<(), Box<dyn std::error::Error>> {
///     aegnt_27::init().await?;
///     
///     // Your aegnt-27 code here
///     
///     Ok(())
/// }
/// ```
pub async fn init() -> utils::Result<()> {
    // Initialize logging if not already configured
    if std::env::var("RUST_LOG").is_err() {
        std::env::set_var("RUST_LOG", "humain27=info");
    }
    
    env_logger::try_init().ok(); // Ignore error if already initialized
    
    log::info!("aegnt-27 v{} initializing...", VERSION);
    log::info!("Authors: {}", AUTHORS);
    log::info!("Description: {}", DESCRIPTION);
    
    // Validate runtime environment
    utils::validate_environment().await?;
    
    log::info!("aegnt-27 initialization complete");
    
    Ok(())
}

/// Initialize aegnt-27 with custom configuration
///
/// # Examples
///
/// ```no_run
/// use humain27::{prelude::*, config::HumainConfig};
///
/// #[tokio::main]
/// async fn main() -> Result<(), Box<dyn std::error::Error>> {
///     let config = HumainConfig {
///         mouse: MouseConfig {
///             authenticity_target: 0.98,
///             ..Default::default()
///         },
///         ..Default::default()
///     };
///     
///     humain27::init_with_config(config).await?;
///     
///     // Your aegnt-27 code here
///     
///     Ok(())
/// }
/// ```
pub async fn init_with_config(config: config::HumainConfig) -> utils::Result<()> {
    // Initialize logging based on config
    if config.logging.enabled {
        if std::env::var("RUST_LOG").is_err() {
            std::env::set_var("RUST_LOG", &config.logging.level);
        }
        env_logger::try_init().ok();
    }
    
    log::info!("aegnt-27 v{} initializing with custom config...", VERSION);
    
    // Validate configuration
    config.validate()?;
    
    // Validate runtime environment
    utils::validate_environment().await?;
    
    log::info!("aegnt-27 initialization complete with custom config");
    
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_init() {
        // Test that initialization works without errors
        let result = init().await;
        assert!(result.is_ok(), "Initialization failed: {:?}", result.err());
    }

    #[tokio::test] 
    async fn test_init_with_config() {
        let config = config::HumainConfig::default();
        let result = init_with_config(config).await;
        assert!(result.is_ok(), "Config initialization failed: {:?}", result.err());
    }

    #[test]
    fn test_version_info() {
        assert!(!VERSION.is_empty());
        assert!(!AUTHORS.is_empty());
        assert!(!DESCRIPTION.is_empty());
    }
}