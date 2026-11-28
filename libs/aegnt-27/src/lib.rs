//! # aegnt-27: The Human Peak Protocol
//! 
//! A sophisticated Rust library for achieving peak human authenticity through
//! 27 distinct behavioral patterns and advanced neural pattern simulation.
//! 
//! ## Features
//! 
//! - **Mouse Authenticity Achievement**: Natural movements through 7 behavioral patterns
//! - **Typing Peak Performance**: Authentic keystroke timing through 7 behavioral patterns
//! - **Audio Authenticity**: Natural voice patterns through 7 behavioral patterns
//! - **Visual Peak Authenticity**: Authentic gaze through 6 behavioral patterns
//! - **Human Authenticity Validation**: Peak human achievement validation
//! 
//! ## Quick Start
//!
//! ```ignore
//! // Requires the `mouse` and `typing` features (--features mouse,typing).
//! use aegnt27::prelude::*;
//! use std::time::Duration;
//!
//! #[tokio::main]
//! async fn main() -> Result<(), Aegnt27Error> {
//!     // Humanize a mouse path
//!     let mut mouse = MouseHumanizer::new(MouseConfig::default()).await?;
//!     let path = MousePath::from_points(
//!         vec![Point::new(0, 0), Point::new(250, 150), Point::new(500, 300)],
//!         Duration::from_millis(300),
//!     )?;
//!     let humanized = mouse.humanize_path(path).await?;
//!     println!("mouse steps: {}", humanized.step_count());
//!
//!     // Humanize typing
//!     let mut typer = TypingHumanizer::new(TypingConfig::default()).await?;
//!     let seq = typer.humanize_text("Hello, world!").await?;
//!     println!("typing authenticity: {:.2}", seq.authenticity_score);
//!
//!     Ok(())
//! }
//! ```

#![cfg_attr(docsrs, feature(doc_cfg))]
#![warn(missing_docs, rust_2018_idioms)]
#![deny(unsafe_code)]

use std::sync::Arc;
use tokio::sync::RwLock;

// Core modules
pub mod config;
pub mod error;
pub mod utils;

// Humanization modules
#[cfg(feature = "mouse")]
#[cfg_attr(docsrs, doc(cfg(feature = "mouse")))]
pub mod mouse;

#[cfg(feature = "typing")]
#[cfg_attr(docsrs, doc(cfg(feature = "typing")))]
pub mod typing;

#[cfg(feature = "audio")]
#[cfg_attr(docsrs, doc(cfg(feature = "audio")))]
pub mod audio;

#[cfg(feature = "visual")]
#[cfg_attr(docsrs, doc(cfg(feature = "visual")))]
pub mod visual;

#[cfg(feature = "detection")]
#[cfg_attr(docsrs, doc(cfg(feature = "detection")))]
pub mod detection;

#[cfg(feature = "persistence")]
#[cfg_attr(docsrs, doc(cfg(feature = "persistence")))]
pub mod persistence;

#[cfg(feature = "authenticity")]
#[cfg_attr(docsrs, doc(cfg(feature = "authenticity")))]
pub mod authenticity;

// Re-exports
pub use crate::config::Aegnt27Config;
pub use crate::error::{Aegnt27Error, Result};

#[cfg(feature = "mouse")]
pub use crate::mouse::{MousePath, Point};

#[cfg(feature = "typing")]
pub use crate::typing::TypingSequence;

#[cfg(feature = "authenticity")]
pub use crate::authenticity::{AuthenticityValidation, AuthenticityConfig};

/// Prelude module for convenient imports
pub mod prelude {
    pub use crate::{Aegnt27Engine, Aegnt27EngineBuilder, Aegnt27Error, Result};
    pub use crate::config::Aegnt27Config;
    
    #[cfg(feature = "mouse")]
    pub use crate::mouse::{MousePath, Point, MouseConfig};

    #[cfg(feature = "typing")]
    pub use crate::typing::{TypingSequence, TypingConfig};
    
    #[cfg(feature = "audio")]
    pub use crate::audio::{AudioData, AuthenticAudio, AudioConfig};
    
    #[cfg(feature = "visual")]
    pub use crate::visual::{VideoFrame, GazePattern, VisualConfig};
    
    #[cfg(feature = "authenticity")]
    pub use crate::authenticity::{AuthenticityValidation, AuthenticityConfig, AuthenticityEngine};
}

/// The main aegnt-27 engine for achieving peak human authenticity through 27 behavioral patterns
#[derive(Debug)]
pub struct Aegnt27Engine {
    config: Arc<Aegnt27Config>,

    #[cfg(feature = "authenticity")]
    authenticity_validator: Arc<RwLock<authenticity::AuthenticityEngine>>,
}

impl Aegnt27Engine {
    /// Creates a new builder for configuring the aegnt-27 engine
    pub fn builder() -> Aegnt27EngineBuilder {
        Aegnt27EngineBuilder::new()
    }
    
    /// Creates an aegnt-27 engine with the provided configuration
    pub async fn with_config(config: Aegnt27Config) -> Result<Self> {
        let config = Arc::new(config);
        
        Ok(Self {
            config: config.clone(),

            #[cfg(feature = "authenticity")]
            authenticity_validator: Arc::new(RwLock::new(
                authenticity::AuthenticityEngine::new(authenticity::AuthenticityConfig::default())
            )),
        })
    }
    
    /// Quick authenticity validation for simple use cases
    #[cfg(feature = "authenticity")]
    pub async fn quick_validate(content: &str, target_score: f64) -> Result<authenticity::AuthenticityValidation> {
        let config = Aegnt27Config::builder().build()?;
        let engine = Self::with_config(config).await?;
        engine.validate_authenticity(content).await
    }

    // Human authenticity validation methods
    
    #[cfg(feature = "authenticity")]
    #[cfg_attr(docsrs, doc(cfg(feature = "authenticity")))]
    /// Achieves peak behavioral patterns for optimal authenticity
    pub async fn validate_authenticity(&self, content: &str) -> Result<authenticity::AuthenticityValidation> {
        let mut validator = self.authenticity_validator.write().await;
        validator.validate_authenticity(content).await.map_err(|e| 
            Aegnt27Error::Validation(crate::error::ValidationError::RequiredFieldMissing(e.to_string()))
        )
    }
}

/// Builder for configuring and creating an aegnt-27 engine
#[derive(Debug, Default)]
pub struct Aegnt27EngineBuilder {
    #[cfg(feature = "mouse")]
    mouse_enabled: bool,
    #[cfg(feature = "typing")]
    typing_enabled: bool,
    #[cfg(feature = "audio")]
    audio_enabled: bool,
    #[cfg(feature = "visual")]
    visual_enabled: bool,
    #[cfg(feature = "authenticity")]
    authenticity_enabled: bool,
    
    config: Option<Aegnt27Config>,
}

impl Aegnt27EngineBuilder {
    /// Creates a new builder
    pub fn new() -> Self {
        Self::default()
    }
    
    #[cfg(feature = "mouse")]
    /// Enables mouse authenticity achievement
    pub fn enable_mouse_authenticity(mut self) -> Self {
        self.mouse_enabled = true;
        self
    }
    
    #[cfg(feature = "typing")]
    /// Enables typing authenticity achievement
    pub fn enable_typing_authenticity(mut self) -> Self {
        self.typing_enabled = true;
        self
    }
    
    #[cfg(feature = "audio")]
    /// Enables audio authenticity achievement
    pub fn enable_audio_authenticity(mut self) -> Self {
        self.audio_enabled = true;
        self
    }
    
    #[cfg(feature = "visual")]
    /// Enables visual authenticity achievement
    pub fn enable_visual_authenticity(mut self) -> Self {
        self.visual_enabled = true;
        self
    }
    
    #[cfg(feature = "authenticity")]
    /// Enables human authenticity validation
    pub fn enable_authenticity_validation(mut self) -> Self {
        self.authenticity_enabled = true;
        self
    }
    
    /// Enables all available features
    pub fn enable_all_features(mut self) -> Self {
        #[cfg(feature = "mouse")]
        { self.mouse_enabled = true; }
        #[cfg(feature = "typing")]
        { self.typing_enabled = true; }
        #[cfg(feature = "audio")]
        { self.audio_enabled = true; }
        #[cfg(feature = "visual")]
        { self.visual_enabled = true; }
        #[cfg(feature = "authenticity")]
        { self.authenticity_enabled = true; }
        self
    }
    
    /// Sets a custom configuration
    pub fn with_config(mut self, config: Aegnt27Config) -> Self {
        self.config = Some(config);
        self
    }
    
    /// Loads configuration from a file
    pub fn with_config_file<P: AsRef<std::path::Path>>(mut self, path: P) -> Result<Self> {
        let config = Aegnt27Config::from_file(path)?;
        self.config = Some(config);
        Ok(self)
    }
    
    /// Builds the aegnt-27 engine
    pub async fn build(self) -> Result<Aegnt27Engine> {
        let config = self.config.unwrap_or_else(|| {
            let mut builder = Aegnt27Config::builder();
            
            #[cfg(feature = "mouse")]
            if self.mouse_enabled {
                builder = builder.mouse(mouse::MouseConfig::default());
            }
            
            #[cfg(feature = "typing")]
            if self.typing_enabled {
                builder = builder.typing(typing::TypingConfig::default());
            }
            
            #[cfg(feature = "audio")]
            if self.audio_enabled {
                builder = builder.audio(audio::AudioConfig::default());
            }
            
            #[cfg(feature = "visual")]
            if self.visual_enabled {
                builder = builder.visual(visual::VisualConfig::default());
            }
            
            #[cfg(feature = "authenticity")]
            if self.authenticity_enabled {
                // Authenticity config is handled internally
                let _ = self.authenticity_enabled; // Use the variable to avoid warnings
            }
            
            builder.build().expect("Failed to build default config")
        });
        
        Aegnt27Engine::with_config(config).await
    }
}

// Convenience functions for quick usage
#[cfg(feature = "authenticity")]
/// Quick authenticity validation function for simple use cases
pub async fn validate_authenticity(content: &str) -> Result<authenticity::AuthenticityValidation> {
    Aegnt27Engine::quick_validate(content, 0.95).await
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_engine_builder() {
        let builder = Aegnt27Engine::builder();
        assert!(builder.config.is_none());
    }
    
    #[tokio::test]
    async fn test_builder_with_all_features() {
        let result = Aegnt27Engine::builder()
            .enable_all_features()
            .build()
            .await;
        
        assert!(result.is_ok());
    }
    
    #[cfg(feature = "authenticity")]
    #[tokio::test]
    async fn test_quick_validate() {
        let result = validate_authenticity("This is a test message").await;
        assert!(result.is_ok());
    }
}