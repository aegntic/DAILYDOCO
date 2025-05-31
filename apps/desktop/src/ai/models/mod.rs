// AI Model Implementations - DeepSeek R1 & Gemma 3

use async_trait::async_trait;
use anyhow::Result;
use serde::{Serialize, Deserialize};
use uuid::Uuid;

pub mod deepseek_r1;
pub mod gemma_3;

pub use deepseek_r1::DeepSeekR1;
pub use gemma_3::Gemma3;

use super::{AITask, AIResponse, TokenUsage, ResponseMetadata, AlternativeResponse};

/// Common interface for all AI models in the system
#[async_trait]
pub trait AIModel {
    /// Get unique model identifier
    fn get_id(&self) -> &str;
    
    /// Get model capabilities and specifications
    async fn get_capabilities(&self) -> Result<ModelCapabilities>;
    
    /// Get current model configuration
    async fn get_config(&self) -> Result<ModelConfig>;
    
    /// Process a task and return response
    async fn process_task(&self, task: &AITask) -> Result<ModelResponse>;
    
    /// Check model health and availability
    async fn health_check(&self) -> Result<HealthStatus>;
    
    /// Shutdown model and cleanup resources
    async fn shutdown(&self) -> Result<()>;
    
    /// Update model configuration
    async fn configure(&mut self, config: ModelConfig) -> Result<()>;
    
    /// Get resource requirements for this model
    async fn get_resource_requirements(&self) -> Result<ResourceRequirements>;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelCapabilities {
    pub task_types: Vec<String>,
    pub input_types: Vec<String>,
    pub output_types: Vec<String>,
    pub max_input_length: u32,
    pub max_output_length: u32,
    pub multimodal: bool,
    pub streaming: bool,
    pub batch_processing: bool,
    pub fine_tunable: bool,
    pub languages: Vec<String>,
    pub specialties: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelConfig {
    pub model_id: String,
    pub version: String,
    pub provider: String,
    pub deployment: DeploymentConfig,
    pub parameters: ModelParameters,
    pub optimization: OptimizationConfig,
    pub security: SecurityConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeploymentConfig {
    pub environments: Vec<String>,
    pub scaling: ScalingConfig,
    pub fallback: FallbackConfig,
    pub monitoring: MonitoringConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScalingConfig {
    pub min_instances: u32,
    pub max_instances: u32,
    pub scale_metric: String,
    pub scale_threshold: f32,
    pub cooldown: u32, // seconds
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FallbackConfig {
    pub enabled: bool,
    pub fallback_models: Vec<String>,
    pub trigger_conditions: Vec<String>,
    pub max_retries: u32,
    pub backoff_strategy: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitoringConfig {
    pub metrics_collection: bool,
    pub performance_tracking: bool,
    pub cost_tracking: bool,
    pub quality_assurance: bool,
    pub alerting: AlertConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertConfig {
    pub enabled: bool,
    pub thresholds: Vec<AlertThreshold>,
    pub channels: Vec<String>,
    pub cooldown: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertThreshold {
    pub metric: String,
    pub threshold: f32,
    pub severity: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelParameters {
    pub temperature: f32,
    pub top_p: f32,
    pub top_k: u32,
    pub max_tokens: u32,
    pub stop_sequences: Vec<String>,
    pub frequency_penalty: f32,
    pub presence_penalty: f32,
    pub custom_parameters: std::collections::HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OptimizationConfig {
    pub quantization: Option<String>,
    pub caching: bool,
    pub prefill_optimization: bool,
    pub batch_size: u32,
    pub context_window: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityConfig {
    pub encryption: bool,
    pub data_residency: Vec<String>,
    pub audit_logging: bool,
    pub access_control: AccessControlConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccessControlConfig {
    pub authentication: bool,
    pub authorization: bool,
    pub rate_limiting: RateLimitConfig,
    pub ip_whitelisting: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimitConfig {
    pub requests_per_minute: u32,
    pub requests_per_hour: u32,
    pub concurrent_requests: u32,
    pub burst_capacity: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceRequirements {
    pub min_memory: u64,    // bytes
    pub max_memory: u64,    // bytes
    pub min_cpu: f32,       // cores
    pub gpu: bool,
    pub min_gpu_memory: Option<u64>, // bytes
    pub storage: u64,       // bytes for model files
    pub network: bool,      // requires internet
    pub latency_class: LatencyClass,
    pub concurrent: u32,    // max concurrent requests
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LatencyClass {
    UltraLow,  // < 50ms
    Low,       // < 100ms
    Medium,    // < 500ms
    High,      // < 2000ms
    Batch,     // > 2000ms, optimized for throughput
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthStatus {
    pub status: String,
    pub last_check: chrono::DateTime<chrono::Utc>,
    pub metrics: HealthMetrics,
    pub issues: Vec<HealthIssue>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthMetrics {
    pub response_time: f32,   // milliseconds
    pub error_rate: f32,      // 0-1
    pub throughput: f32,      // requests per second
    pub resource_usage: ResourceUsage,
    pub accuracy: f32,        // 0-1
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceUsage {
    pub cpu: f32,        // percentage
    pub memory: u64,     // bytes
    pub gpu: Option<f32>, // percentage
    pub network: f32,    // bytes/second
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthIssue {
    pub severity: String,
    pub message: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub suggested_action: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelResponse {
    pub result: serde_json::Value,
    pub confidence: f32,
    pub tokens: TokenUsage,
    pub metadata: ResponseMetadata,
    pub alternatives: Vec<AlternativeResponse>,
}

/// Model performance statistics for optimization
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelPerformanceStats {
    pub model_id: String,
    pub total_requests: u64,
    pub successful_requests: u64,
    pub failed_requests: u64,
    pub average_latency: f32,
    pub p95_latency: f32,
    pub p99_latency: f32,
    pub average_accuracy: f32,
    pub cost_per_request: f64,
    pub uptime: f32,
    pub last_updated: chrono::DateTime<chrono::Utc>,
}

/// Task-specific performance metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskPerformanceMetrics {
    pub task_type: String,
    pub model_performance: std::collections::HashMap<String, ModelPerformanceStats>,
    pub optimal_model: String,
    pub performance_trend: Vec<PerformanceDataPoint>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceDataPoint {
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub latency: f32,
    pub accuracy: f32,
    pub cost: f64,
    pub throughput: f32,
}