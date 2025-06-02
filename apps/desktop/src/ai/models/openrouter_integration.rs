/*!
 * DailyDoco Pro - OpenRouter Integration for Developer Model Switching
 * 
 * Hidden developer option for switching between different AI models via OpenRouter
 * Allows testing different models without changing core implementation
 */

use std::collections::HashMap;
use serde::{Serialize, Deserialize};
use anyhow::{Result, anyhow};
use reqwest::Client;
use tokio::sync::RwLock;
use std::sync::Arc;

/// OpenRouter integration for flexible model switching (Developer Mode)
#[derive(Debug, Clone)]
pub struct OpenRouterIntegration {
    client: Client,
    config: OpenRouterConfig,
    available_models: Arc<RwLock<Vec<OpenRouterModel>>>,
    current_overrides: Arc<RwLock<HashMap<String, String>>>, // task_type -> model_id
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenRouterConfig {
    pub api_key: String,
    pub base_url: String,
    pub app_name: String,
    pub enabled: bool,
    pub developer_mode: bool,
    pub fallback_enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenRouterModel {
    pub id: String,
    pub name: String,
    pub description: String,
    pub pricing: ModelPricing,
    pub context_length: u32,
    pub architecture: String,
    pub provider: String,
    pub capabilities: Vec<String>,
    pub performance_tier: PerformanceTier,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelPricing {
    pub prompt: f32,      // per 1k tokens
    pub completion: f32,  // per 1k tokens
    pub currency: String, // "USD"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PerformanceTier {
    Free,
    Standard,
    Premium,
    Elite,
    Experimental,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelOverride {
    pub task_type: String,
    pub original_model: String,
    pub override_model: String,
    pub reason: String,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenRouterRequest {
    pub model: String,
    pub messages: Vec<OpenRouterMessage>,
    pub temperature: Option<f32>,
    pub max_tokens: Option<u32>,
    pub top_p: Option<f32>,
    pub frequency_penalty: Option<f32>,
    pub presence_penalty: Option<f32>,
    pub stop: Option<Vec<String>>,
    pub stream: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenRouterMessage {
    pub role: String,    // "user", "assistant", "system"
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenRouterResponse {
    pub id: String,
    pub object: String,
    pub created: u64,
    pub model: String,
    pub choices: Vec<OpenRouterChoice>,
    pub usage: OpenRouterUsage,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenRouterChoice {
    pub index: u32,
    pub message: OpenRouterMessage,
    pub finish_reason: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenRouterUsage {
    pub prompt_tokens: u32,
    pub completion_tokens: u32,
    pub total_tokens: u32,
}

impl OpenRouterIntegration {
    /// Initialize OpenRouter integration (Hidden Developer Feature)
    pub async fn new(config: OpenRouterConfig) -> Result<Self> {
        if !config.developer_mode {
            return Err(anyhow!("OpenRouter integration requires developer mode"));
        }
        
        log::info!("🔧 Initializing OpenRouter Integration (Developer Mode)");
        
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()?;
        
        let integration = Self {
            client,
            config: config.clone(),
            available_models: Arc::new(RwLock::new(Vec::new())),
            current_overrides: Arc::new(RwLock::new(HashMap::new())),
        };
        
        // Load available models
        integration.refresh_available_models().await?;
        
        log::info!("✅ OpenRouter Integration ready for model switching");
        Ok(integration)
    }
    
    /// Get all available models from OpenRouter
    pub async fn get_available_models(&self) -> Result<Vec<OpenRouterModel>> {
        let models = self.available_models.read().await;
        Ok(models.clone())
    }
    
    /// Set model override for specific task type (Developer Feature)
    pub async fn set_model_override(&self, task_type: &str, model_id: &str, reason: &str) -> Result<()> {
        log::info!("🔄 Setting model override: {} -> {} ({})", task_type, model_id, reason);
        
        // Validate model exists
        let models = self.available_models.read().await;
        if !models.iter().any(|m| m.id == model_id) {
            return Err(anyhow!("Model {} not found in available models", model_id));
        }
        
        let mut overrides = self.current_overrides.write().await;
        overrides.insert(task_type.to_string(), model_id.to_string());
        
        log::info!("✅ Model override set successfully");
        Ok(())
    }
    
    /// Remove model override
    pub async fn remove_model_override(&self, task_type: &str) -> Result<()> {
        let mut overrides = self.current_overrides.write().await;
        overrides.remove(task_type);
        log::info!("🗑️ Removed model override for {}", task_type);
        Ok(())
    }
    
    /// Get current model overrides
    pub async fn get_current_overrides(&self) -> HashMap<String, String> {
        let overrides = self.current_overrides.read().await;
        overrides.clone()
    }
    
    /// Check if task should use override model
    pub async fn should_use_override(&self, task_type: &str) -> Option<String> {
        let overrides = self.current_overrides.read().await;
        overrides.get(task_type).cloned()
    }
    
    /// Execute task with OpenRouter model
    pub async fn execute_with_openrouter(
        &self,
        model_id: &str,
        prompt: &str,
        context: Option<&str>,
        task_type: &str,
    ) -> Result<OpenRouterResponse> {
        log::debug!("🌐 Executing {} task with OpenRouter model: {}", task_type, model_id);
        
        let mut messages = vec![
            OpenRouterMessage {
                role: "system".to_string(),
                content: self.get_system_prompt_for_task(task_type).to_string(),
            },
        ];
        
        if let Some(ctx) = context {
            messages.push(OpenRouterMessage {
                role: "user".to_string(),
                content: format!("Context: {}\n\nTask: {}", ctx, prompt),
            });
        } else {
            messages.push(OpenRouterMessage {
                role: "user".to_string(),
                content: prompt.to_string(),
            });
        }
        
        let request = OpenRouterRequest {
            model: model_id.to_string(),
            messages,
            temperature: Some(0.7),
            max_tokens: Some(4096),
            top_p: Some(0.9),
            frequency_penalty: None,
            presence_penalty: None,
            stop: None,
            stream: Some(false),
        };
        
        let response = self.client
            .post(&format!("{}/chat/completions", self.config.base_url))
            .header("Authorization", format!("Bearer {}", self.config.api_key))
            .header("HTTP-Referer", "https://dailydoco.pro")
            .header("X-Title", &self.config.app_name)
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await?;
        
        if !response.status().is_success() {
            let error_text = response.text().await?;
            return Err(anyhow!("OpenRouter API error: {}", error_text));
        }
        
        let openrouter_response: OpenRouterResponse = response.json().await?;
        
        log::debug!("✅ OpenRouter execution complete. Tokens used: {}", 
            openrouter_response.usage.total_tokens);
        
        Ok(openrouter_response)
    }
    
    /// Refresh available models from OpenRouter
    async fn refresh_available_models(&self) -> Result<()> {
        log::debug!("🔄 Refreshing available models from OpenRouter...");
        
        let response = self.client
            .get(&format!("{}/models", self.config.base_url))
            .header("Authorization", format!("Bearer {}", self.config.api_key))
            .send()
            .await?;
        
        if !response.status().is_success() {
            return Err(anyhow!("Failed to fetch models from OpenRouter"));
        }
        
        let models_response: serde_json::Value = response.json().await?;
        let models = self.parse_models_response(models_response)?;
        
        let mut available_models = self.available_models.write().await;
        *available_models = models;
        
        log::info!("📋 Loaded {} models from OpenRouter", available_models.len());
        Ok(())
    }
    
    /// Parse models response from OpenRouter API
    fn parse_models_response(&self, response: serde_json::Value) -> Result<Vec<OpenRouterModel>> {
        let mut models = Vec::new();
        
        if let Some(data) = response.get("data") {
            if let Some(models_array) = data.as_array() {
                for model_data in models_array {
                    if let Ok(model) = self.parse_single_model(model_data) {
                        models.push(model);
                    }
                }
            }
        }
        
        // Add some popular models for developers
        models.extend(self.get_popular_developer_models());
        
        Ok(models)
    }
    
    /// Parse single model from API response
    fn parse_single_model(&self, model_data: &serde_json::Value) -> Result<OpenRouterModel> {
        let id = model_data.get("id")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing model id"))?;
        
        let name = model_data.get("name")
            .and_then(|v| v.as_str())
            .unwrap_or(id);
        
        let description = model_data.get("description")
            .and_then(|v| v.as_str())
            .unwrap_or("No description available");
        
        let pricing = model_data.get("pricing")
            .map(|p| ModelPricing {
                prompt: p.get("prompt").and_then(|v| v.as_str()).and_then(|s| s.parse().ok()).unwrap_or(0.001),
                completion: p.get("completion").and_then(|v| v.as_str()).and_then(|s| s.parse().ok()).unwrap_or(0.002),
                currency: "USD".to_string(),
            })
            .unwrap_or(ModelPricing {
                prompt: 0.001,
                completion: 0.002,
                currency: "USD".to_string(),
            });
        
        let context_length = model_data.get("context_length")
            .and_then(|v| v.as_u64())
            .unwrap_or(4096) as u32;
        
        Ok(OpenRouterModel {
            id: id.to_string(),
            name: name.to_string(),
            description: description.to_string(),
            pricing,
            context_length,
            architecture: self.infer_architecture(id),
            provider: self.infer_provider(id),
            capabilities: self.infer_capabilities(id),
            performance_tier: self.infer_performance_tier(id),
        })
    }
    
    /// Get popular models for developers to test
    fn get_popular_developer_models(&self) -> Vec<OpenRouterModel> {
        vec![
            OpenRouterModel {
                id: "deepseek/deepseek-r1".to_string(),
                name: "DeepSeek R1".to_string(),
                description: "Latest DeepSeek R1 with breakthrough reasoning".to_string(),
                pricing: ModelPricing { prompt: 0.0014, completion: 0.0028, currency: "USD".to_string() },
                context_length: 32768,
                architecture: "Transformer".to_string(),
                provider: "DeepSeek".to_string(),
                capabilities: vec!["reasoning".to_string(), "code".to_string(), "analysis".to_string()],
                performance_tier: PerformanceTier::Elite,
            },
            OpenRouterModel {
                id: "google/gemma-3-9b-it".to_string(),
                name: "Gemma 3 9B Instruct".to_string(),
                description: "Fast and efficient Gemma 3 for edge deployment".to_string(),
                pricing: ModelPricing { prompt: 0.0002, completion: 0.0004, currency: "USD".to_string() },
                context_length: 8192,
                architecture: "Transformer".to_string(),
                provider: "Google".to_string(),
                capabilities: vec!["fast".to_string(), "edge".to_string(), "efficient".to_string()],
                performance_tier: PerformanceTier::Standard,
            },
            OpenRouterModel {
                id: "anthropic/claude-3.5-sonnet".to_string(),
                name: "Claude 3.5 Sonnet".to_string(),
                description: "Advanced reasoning and code understanding".to_string(),
                pricing: ModelPricing { prompt: 0.003, completion: 0.015, currency: "USD".to_string() },
                context_length: 200000,
                architecture: "Transformer".to_string(),
                provider: "Anthropic".to_string(),
                capabilities: vec!["reasoning".to_string(), "code".to_string(), "long-context".to_string()],
                performance_tier: PerformanceTier::Elite,
            },
            OpenRouterModel {
                id: "openai/gpt-4o".to_string(),
                name: "GPT-4o".to_string(),
                description: "OpenAI's latest multimodal model".to_string(),
                pricing: ModelPricing { prompt: 0.005, completion: 0.015, currency: "USD".to_string() },
                context_length: 128000,
                architecture: "GPT".to_string(),
                provider: "OpenAI".to_string(),
                capabilities: vec!["multimodal".to_string(), "reasoning".to_string(), "code".to_string()],
                performance_tier: PerformanceTier::Premium,
            },
        ]
    }
    
    /// Get system prompt for specific task type
    fn get_system_prompt_for_task(&self, task_type: &str) -> &str {
        match task_type {
            "CodeAnalysis" => "You are an expert code analyzer. Provide detailed analysis of code structure, quality, complexity, and suggestions for improvement.",
            "NarrationGeneration" => "You are an expert technical educator. Generate clear, engaging narration for coding tutorials that explains concepts step-by-step.",
            "PersonalBrandAnalysis" => "You are a personal branding expert for technical content creators. Analyze brand voice, audience resonance, and growth opportunities.",
            "AuthenticityValidation" => "You are an authenticity validator. Assess content for human-like characteristics and provide recommendations for improvement.",
            "EngagementPrediction" => "You are an engagement prediction specialist. Analyze content and predict viewer engagement patterns.",
            _ => "You are a helpful AI assistant specialized in software development and technical education.",
        }
    }
    
    // Helper methods for model metadata inference
    
    fn infer_architecture(&self, model_id: &str) -> String {
        if model_id.contains("gpt") {
            "GPT".to_string()
        } else if model_id.contains("claude") {
            "Claude".to_string()
        } else if model_id.contains("gemma") {
            "Gemma".to_string()
        } else if model_id.contains("deepseek") {
            "DeepSeek".to_string()
        } else {
            "Transformer".to_string()
        }
    }
    
    fn infer_provider(&self, model_id: &str) -> String {
        if let Some(provider) = model_id.split('/').next() {
            provider.to_string()
        } else {
            "Unknown".to_string()
        }
    }
    
    fn infer_capabilities(&self, model_id: &str) -> Vec<String> {
        let mut capabilities = vec!["text".to_string()];
        
        if model_id.contains("code") || model_id.contains("deepseek") {
            capabilities.push("code".to_string());
        }
        if model_id.contains("reasoning") || model_id.contains("r1") {
            capabilities.push("reasoning".to_string());
        }
        if model_id.contains("vision") || model_id.contains("4o") {
            capabilities.push("vision".to_string());
        }
        
        capabilities
    }
    
    fn infer_performance_tier(&self, model_id: &str) -> PerformanceTier {
        if model_id.contains("gpt-4") || model_id.contains("claude-3") || model_id.contains("deepseek-r1") {
            PerformanceTier::Elite
        } else if model_id.contains("gemma") {
            PerformanceTier::Standard
        } else {
            PerformanceTier::Standard
        }
    }
}

/// Developer settings for OpenRouter integration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeveloperSettings {
    pub openrouter_enabled: bool,
    pub openrouter_api_key: Option<String>,
    pub model_overrides: Vec<ModelOverride>,
    pub experimental_features: bool,
    pub debug_mode: bool,
}

impl Default for DeveloperSettings {
    fn default() -> Self {
        Self {
            openrouter_enabled: false,
            openrouter_api_key: None,
            model_overrides: Vec::new(),
            experimental_features: false,
            debug_mode: false,
        }
    }
}

impl Default for OpenRouterConfig {
    fn default() -> Self {
        Self {
            api_key: String::new(),
            base_url: "https://openrouter.ai/api/v1".to_string(),
            app_name: "DailyDoco Pro".to_string(),
            enabled: false,
            developer_mode: false,
            fallback_enabled: true,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_openrouter_config() {
        let config = OpenRouterConfig::default();
        assert_eq!(config.app_name, "DailyDoco Pro");
        assert!(!config.enabled);
        assert!(!config.developer_mode);
    }
    
    #[test]
    fn test_model_parsing() {
        let integration = OpenRouterIntegration {
            client: Client::new(),
            config: OpenRouterConfig::default(),
            available_models: Arc::new(RwLock::new(Vec::new())),
            current_overrides: Arc::new(RwLock::new(HashMap::new())),
        };
        
        assert_eq!(integration.infer_provider("openai/gpt-4o"), "openai");
        assert_eq!(integration.infer_provider("deepseek/deepseek-r1"), "deepseek");
        assert_eq!(integration.infer_architecture("gpt-4o"), "GPT");
        assert_eq!(integration.infer_architecture("deepseek-r1"), "DeepSeek");
    }
    
    #[test]
    fn test_developer_settings() {
        let settings = DeveloperSettings::default();
        assert!(!settings.openrouter_enabled);
        assert!(!settings.experimental_features);
        assert!(!settings.debug_mode);
    }
}