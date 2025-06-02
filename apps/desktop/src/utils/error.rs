/*!
 * aegnt-27 - Error Handling
 * 
 * Comprehensive error types and handling for aegnt-27
 */

use std::fmt;

/// Main error type for aegnt-27
#[derive(Debug, thiserror::Error)]
pub enum AegntError {
    /// Mouse humanization errors
    #[error("Mouse humanization failed: {message}")]
    MouseHumanization { message: String },
    
    /// Typing humanization errors
    #[error("Typing humanization failed: {message}")]
    TypingHumanization { message: String },
    
    /// Audio humanization errors
    #[error("Audio humanization failed: {message}")]
    AudioHumanization { message: String },
    
    /// Visual enhancement errors
    #[error("Visual enhancement failed: {message}")]
    VisualEnhancement { message: String },
    
    /// AI detection validation errors
    #[error("AI detection validation failed: {message}")]
    DetectionValidation { message: String },
    
    /// Configuration errors
    #[error("Configuration error: {message}")]
    Configuration { message: String },
    
    /// Platform/environment errors
    #[error("Platform error: {message}")]
    Platform { message: String },
    
    /// Cryptography errors
    #[error("Cryptography error: {message}")]
    Cryptography { message: String },
    
    /// Network/IO errors
    #[error("Network/IO error: {message}")]
    Network { message: String },
    
    /// Permission/access errors
    #[error("Permission denied: {message}")]
    Permission { message: String },
    
    /// Resource errors (memory, CPU, etc.)
    #[error("Resource error: {message}")]
    Resource { message: String },
    
    /// Validation errors
    #[error("Validation error: {message}")]
    Validation { message: String },
    
    /// Generic internal errors
    #[error("Internal error: {message}")]
    Internal { message: String },
}

/// Result type alias for aegnt-27
pub type Result<T> = std::result::Result<T, AegntError>;

impl AegntError {
    /// Create a mouse humanization error
    pub fn mouse_humanization(message: impl Into<String>) -> Self {
        Self::MouseHumanization { message: message.into() }
    }
    
    /// Create a typing humanization error
    pub fn typing_humanization(message: impl Into<String>) -> Self {
        Self::TypingHumanization { message: message.into() }
    }
    
    /// Create an audio humanization error
    pub fn audio_humanization(message: impl Into<String>) -> Self {
        Self::AudioHumanization { message: message.into() }
    }
    
    /// Create a visual enhancement error
    pub fn visual_enhancement(message: impl Into<String>) -> Self {
        Self::VisualEnhancement { message: message.into() }
    }
    
    /// Create a detection validation error
    pub fn detection_validation(message: impl Into<String>) -> Self {
        Self::DetectionValidation { message: message.into() }
    }
    
    /// Create a configuration error
    pub fn configuration(message: impl Into<String>) -> Self {
        Self::Configuration { message: message.into() }
    }
    
    /// Create a platform error
    pub fn platform(message: impl Into<String>) -> Self {
        Self::Platform { message: message.into() }
    }
    
    /// Create a cryptography error
    pub fn cryptography(message: impl Into<String>) -> Self {
        Self::Cryptography { message: message.into() }
    }
    
    /// Create a network error
    pub fn network(message: impl Into<String>) -> Self {
        Self::Network { message: message.into() }
    }
    
    /// Create a permission error
    pub fn permission(message: impl Into<String>) -> Self {
        Self::Permission { message: message.into() }
    }
    
    /// Create a resource error
    pub fn resource(message: impl Into<String>) -> Self {
        Self::Resource { message: message.into() }
    }
    
    /// Create a validation error
    pub fn validation(message: impl Into<String>) -> Self {
        Self::Validation { message: message.into() }
    }
    
    /// Create an internal error
    pub fn internal(message: impl Into<String>) -> Self {
        Self::Internal { message: message.into() }
    }
    
    /// Check if this is a recoverable error
    pub fn is_recoverable(&self) -> bool {
        match self {
            Self::MouseHumanization { .. } => true,
            Self::TypingHumanization { .. } => true,
            Self::AudioHumanization { .. } => true,
            Self::VisualEnhancement { .. } => true,
            Self::DetectionValidation { .. } => true,
            Self::Configuration { .. } => false,
            Self::Platform { .. } => false,
            Self::Cryptography { .. } => false,
            Self::Network { .. } => true,
            Self::Permission { .. } => false,
            Self::Resource { .. } => true,
            Self::Validation { .. } => false,
            Self::Internal { .. } => false,
        }
    }
    
    /// Get error category
    pub fn category(&self) -> &'static str {
        match self {
            Self::MouseHumanization { .. } => "mouse_humanization",
            Self::TypingHumanization { .. } => "typing_humanization",
            Self::AudioHumanization { .. } => "audio_humanization",
            Self::VisualEnhancement { .. } => "visual_enhancement",
            Self::DetectionValidation { .. } => "detection_validation",
            Self::Configuration { .. } => "configuration",
            Self::Platform { .. } => "platform",
            Self::Cryptography { .. } => "cryptography",
            Self::Network { .. } => "network",
            Self::Permission { .. } => "permission",
            Self::Resource { .. } => "resource",
            Self::Validation { .. } => "validation",
            Self::Internal { .. } => "internal",
        }
    }
}

// Implement conversions from common error types
impl From<std::io::Error> for HumainError {
    fn from(err: std::io::Error) -> Self {
        Self::Network { message: err.to_string() }
    }
}

impl From<serde_json::Error> for HumainError {
    fn from(err: serde_json::Error) -> Self {
        Self::Configuration { message: format!("JSON error: {}", err) }
    }
}

impl From<toml::de::Error> for HumainError {
    fn from(err: toml::de::Error) -> Self {
        Self::Configuration { message: format!("TOML error: {}", err) }
    }
}

impl From<uuid::Error> for HumainError {
    fn from(err: uuid::Error) -> Self {
        Self::Internal { message: format!("UUID error: {}", err) }
    }
}

#[cfg(feature = "network-features")]
impl From<reqwest::Error> for HumainError {
    fn from(err: reqwest::Error) -> Self {
        Self::Network { message: format!("HTTP error: {}", err) }
    }
}

/// Error context for better debugging
#[derive(Debug, Clone)]
pub struct ErrorContext {
    pub operation: String,
    pub component: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub session_id: Option<String>,
    pub additional_info: std::collections::HashMap<String, String>,
}

impl ErrorContext {
    pub fn new(operation: impl Into<String>, component: impl Into<String>) -> Self {
        Self {
            operation: operation.into(),
            component: component.into(),
            timestamp: chrono::Utc::now(),
            session_id: None,
            additional_info: std::collections::HashMap::new(),
        }
    }
    
    pub fn with_session_id(mut self, session_id: impl Into<String>) -> Self {
        self.session_id = Some(session_id.into());
        self
    }
    
    pub fn with_info(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.additional_info.insert(key.into(), value.into());
        self
    }
}

impl fmt::Display for ErrorContext {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "[{}] {} in {} at {}", 
            self.session_id.as_deref().unwrap_or("unknown"),
            self.operation, 
            self.component, 
            self.timestamp.format("%Y-%m-%d %H:%M:%S UTC")
        )?;
        
        if !self.additional_info.is_empty() {
            write!(f, " ({})", 
                self.additional_info.iter()
                    .map(|(k, v)| format!("{}={}", k, v))
                    .collect::<Vec<_>>()
                    .join(", ")
            )?;
        }
        
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_creation() {
        let error = HumainError::mouse_humanization("test error");
        assert!(matches!(error, HumainError::MouseHumanization { .. }));
        assert_eq!(error.category(), "mouse_humanization");
        assert!(error.is_recoverable());
    }

    #[test]
    fn test_error_context() {
        let context = ErrorContext::new("humanize_movement", "mouse_humanizer")
            .with_session_id("test_session")
            .with_info("user_id", "12345");
        
        assert_eq!(context.operation, "humanize_movement");
        assert_eq!(context.component, "mouse_humanizer");
        assert_eq!(context.session_id, Some("test_session".to_string()));
        assert_eq!(context.additional_info.get("user_id"), Some(&"12345".to_string()));
    }

    #[test]
    fn test_error_conversions() {
        let io_error = std::io::Error::new(std::io::ErrorKind::NotFound, "file not found");
        let humain_error: HumainError = io_error.into();
        assert!(matches!(humain_error, HumainError::Network { .. }));
    }
}