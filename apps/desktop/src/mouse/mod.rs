/*!
 * aegnt-27 - Mouse Humanization Module
 * 
 * Advanced mouse movement humanization with natural patterns, micro-movements,
 * and detection resistance capabilities.
 */

pub mod humanizer;
pub mod patterns;
pub mod analysis;

pub use humanizer::{
    MouseHumanizer, MouseHumanizationInput, MouseHumanizationResult,
    MouseHumanizationConfig,
};

pub use patterns::{
    MousePath, MousePoint, HumanizedMousePath, HumanizedMousePoint,
    Coordinates, Velocity, Acceleration, MovementType, MousePathType,
    MovementIntent, HumanizationType,
};

pub use analysis::{
    MovementAuthenticityScores, MovementNaturalnessMetrics,
    DetectionResistanceAssessment, HumanLikenessEvaluation,
    MovementBeforeAfterComparison, MovementImprovementMetrics,
    MovementAuthenticityProgression,
};

// Re-export commonly used types
pub use uuid::Uuid;
pub use chrono::{DateTime, Utc};
pub use serde::{Serialize, Deserialize};

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_mouse_module_integration() {
        // Test that the module can be imported and basic types work
        let _humanizer_result = MouseHumanizer::new().await;
        // Note: This may fail in test environment due to platform dependencies
        // but validates the module structure
    }
}