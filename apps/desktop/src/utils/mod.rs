/*!
 * HUMaiN2.7 - Utilities Module
 * 
 * Common utilities, error handling, and helper functions for HUMaiN2.7
 */

pub mod error;
pub mod environment;
pub mod crypto;
pub mod math;

pub use error::{HumainError, Result};
pub use environment::{validate_environment, get_platform_info, PlatformInfo};
pub use crypto::{encrypt_data, decrypt_data, generate_key, hash_data};
pub use math::{bezier_curve, interpolate, normalize_value, random_gaussian};

use serde::{Serialize, Deserialize};
use std::time::{SystemTime, UNIX_EPOCH};
use uuid::Uuid;

/// Generate a unique session ID
pub fn generate_session_id() -> String {
    format!("humain_{}_{}", 
        Uuid::new_v4().simple(), 
        SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis()
    )
}

/// Performance timing utilities
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceTiming {
    pub start_time: std::time::Instant,
    pub checkpoints: Vec<(String, std::time::Duration)>,
}

impl PerformanceTiming {
    pub fn new() -> Self {
        Self {
            start_time: std::time::Instant::now(),
            checkpoints: Vec::new(),
        }
    }
    
    pub fn checkpoint(&mut self, name: impl Into<String>) {
        let elapsed = self.start_time.elapsed();
        self.checkpoints.push((name.into(), elapsed));
    }
    
    pub fn total_duration(&self) -> std::time::Duration {
        self.start_time.elapsed()
    }
}

impl Default for PerformanceTiming {
    fn default() -> Self {
        Self::new()
    }
}

/// Memory management utilities
pub fn clear_sensitive_memory(data: &mut [u8]) {
    // Securely clear memory containing sensitive data
    use std::sync::atomic::{AtomicPtr, Ordering};
    use std::ptr;
    
    unsafe {
        let ptr = AtomicPtr::new(data.as_mut_ptr());
        ptr::write_volatile(ptr.load(Ordering::SeqCst), 0);
        
        for byte in data.iter_mut() {
            ptr::write_volatile(byte, 0);
        }
    }
}

/// Configuration validation utilities
pub trait Validate {
    type Error;
    
    fn validate(&self) -> std::result::Result<(), Self::Error>;
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_session_id_generation() {
        let id1 = generate_session_id();
        let id2 = generate_session_id();
        
        assert_ne!(id1, id2);
        assert!(id1.starts_with("humain_"));
        assert!(id2.starts_with("humain_"));
    }

    #[test]
    fn test_performance_timing() {
        let mut timing = PerformanceTiming::new();
        
        std::thread::sleep(std::time::Duration::from_millis(10));
        timing.checkpoint("first");
        
        std::thread::sleep(std::time::Duration::from_millis(10));
        timing.checkpoint("second");
        
        assert_eq!(timing.checkpoints.len(), 2);
        assert!(timing.total_duration().as_millis() >= 20);
    }

    #[test]
    fn test_clear_sensitive_memory() {
        let mut data = vec![0xAA; 1024];
        clear_sensitive_memory(&mut data);
        
        // Verify all bytes are zeroed (though compiler might optimize this away)
        assert!(data.iter().all(|&b| b == 0));
    }
}