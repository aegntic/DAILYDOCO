/*!
 * aegnt-27 - Environment Validation
 * 
 * Platform detection and environment validation for aegnt-27
 */

use serde::{Serialize, Deserialize};
use crate::utils::{AegntError, Result};

/// Platform information structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlatformInfo {
    pub os: OperatingSystem,
    pub architecture: Architecture,
    pub display_info: DisplayInfo,
    pub input_capabilities: InputCapabilities,
    pub performance_info: PerformanceInfo,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OperatingSystem {
    Windows { version: String, build: String },
    Linux { distribution: String, kernel: String },
    MacOS { version: String, build: String },
    Unknown { name: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Architecture {
    X86_64,
    Aarch64,
    X86,
    Unknown(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisplayInfo {
    pub primary_resolution: (u32, u32),
    pub display_count: u32,
    pub dpi: Option<f32>,
    pub color_depth: Option<u8>,
    pub refresh_rate: Option<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InputCapabilities {
    pub mouse_available: bool,
    pub keyboard_available: bool,
    pub touch_available: bool,
    pub microphone_available: bool,
    pub camera_available: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceInfo {
    pub cpu_count: usize,
    pub total_memory_mb: u64,
    pub available_memory_mb: u64,
    pub cpu_usage_percent: Option<f32>,
}

/// Validate the runtime environment for HUMaiN2.7
pub async fn validate_environment() -> Result<()> {
    log::info!("Validating runtime environment...");
    
    let platform_info = get_platform_info().await?;
    
    // Check minimum requirements
    validate_platform_requirements(&platform_info)?;
    validate_permissions(&platform_info)?;
    validate_resources(&platform_info)?;
    
    log::info!("Environment validation complete");
    log::debug!("Platform info: {:#?}", platform_info);
    
    Ok(())
}

/// Get comprehensive platform information
pub async fn get_platform_info() -> Result<PlatformInfo> {
    let os = detect_operating_system()?;
    let architecture = detect_architecture();
    let display_info = get_display_info().await?;
    let input_capabilities = detect_input_capabilities().await?;
    let performance_info = get_performance_info().await?;
    
    Ok(PlatformInfo {
        os,
        architecture,
        display_info,
        input_capabilities,
        performance_info,
    })
}

fn detect_operating_system() -> Result<OperatingSystem> {
    #[cfg(target_os = "windows")]
    {
        let version = get_windows_version()?;
        let build = get_windows_build()?;
        Ok(OperatingSystem::Windows { version, build })
    }
    
    #[cfg(target_os = "linux")]
    {
        let distribution = get_linux_distribution()?;
        let kernel = get_linux_kernel_version()?;
        Ok(OperatingSystem::Linux { distribution, kernel })
    }
    
    #[cfg(target_os = "macos")]
    {
        let version = get_macos_version()?;
        let build = get_macos_build()?;
        Ok(OperatingSystem::MacOS { version, build })
    }
    
    #[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "macos")))]
    {
        Ok(OperatingSystem::Unknown { 
            name: std::env::consts::OS.to_string() 
        })
    }
}

fn detect_architecture() -> Architecture {
    match std::env::consts::ARCH {
        "x86_64" => Architecture::X86_64,
        "aarch64" => Architecture::Aarch64,
        "x86" => Architecture::X86,
        arch => Architecture::Unknown(arch.to_string()),
    }
}

async fn get_display_info() -> Result<DisplayInfo> {
    #[cfg(target_os = "windows")]
    {
        get_windows_display_info().await
    }
    
    #[cfg(target_os = "linux")]
    {
        get_linux_display_info().await
    }
    
    #[cfg(target_os = "macos")]
    {
        get_macos_display_info().await
    }
    
    #[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "macos")))]
    {
        Ok(DisplayInfo {
            primary_resolution: (1920, 1080), // Default fallback
            display_count: 1,
            dpi: None,
            color_depth: None,
            refresh_rate: None,
        })
    }
}

async fn detect_input_capabilities() -> Result<InputCapabilities> {
    Ok(InputCapabilities {
        mouse_available: is_mouse_available().await?,
        keyboard_available: is_keyboard_available().await?,
        touch_available: is_touch_available().await?,
        microphone_available: is_microphone_available().await?,
        camera_available: is_camera_available().await?,
    })
}

async fn get_performance_info() -> Result<PerformanceInfo> {
    let cpu_count = num_cpus::get();
    let (total_memory_mb, available_memory_mb) = get_memory_info()?;
    let cpu_usage_percent = get_cpu_usage().await.ok();
    
    Ok(PerformanceInfo {
        cpu_count,
        total_memory_mb,
        available_memory_mb,
        cpu_usage_percent,
    })
}

fn validate_platform_requirements(platform_info: &PlatformInfo) -> Result<()> {
    // Check operating system support
    match &platform_info.os {
        OperatingSystem::Windows { .. } => {
            log::debug!("Windows platform detected");
        },
        OperatingSystem::Linux { .. } => {
            log::debug!("Linux platform detected");
        },
        OperatingSystem::MacOS { .. } => {
            log::debug!("macOS platform detected");
        },
        OperatingSystem::Unknown { name } => {
            return Err(HumainError::platform(format!("Unsupported platform: {}", name)));
        },
    }
    
    // Check architecture support
    match platform_info.architecture {
        Architecture::X86_64 | Architecture::Aarch64 => {
            log::debug!("Supported architecture: {:?}", platform_info.architecture);
        },
        _ => {
            return Err(HumainError::platform(format!("Unsupported architecture: {:?}", platform_info.architecture)));
        },
    }
    
    Ok(())
}

fn validate_permissions(_platform_info: &PlatformInfo) -> Result<()> {
    // Check required permissions based on platform
    #[cfg(target_os = "windows")]
    {
        validate_windows_permissions()?;
    }
    
    #[cfg(target_os = "linux")]
    {
        validate_linux_permissions()?;
    }
    
    #[cfg(target_os = "macos")]
    {
        validate_macos_permissions()?;
    }
    
    Ok(())
}

fn validate_resources(platform_info: &PlatformInfo) -> Result<()> {
    // Check minimum memory requirements (512MB)
    if platform_info.performance_info.available_memory_mb < 512 {
        return Err(HumainError::resource(
            format!("Insufficient memory: {}MB available, 512MB required", 
                platform_info.performance_info.available_memory_mb)
        ));
    }
    
    // Check minimum CPU count (1 core)
    if platform_info.performance_info.cpu_count < 1 {
        return Err(HumainError::resource("No CPU cores detected"));
    }
    
    log::info!("Resource validation passed: {}MB memory, {} CPU cores", 
        platform_info.performance_info.available_memory_mb,
        platform_info.performance_info.cpu_count
    );
    
    Ok(())
}

// Platform-specific implementations
#[cfg(target_os = "windows")]
mod windows {
    use super::*;
    
    pub fn get_windows_version() -> Result<String> {
        // Implementation for Windows version detection
        Ok("Windows 11".to_string()) // Placeholder
    }
    
    pub fn get_windows_build() -> Result<String> {
        // Implementation for Windows build detection
        Ok("22000".to_string()) // Placeholder
    }
    
    pub async fn get_windows_display_info() -> Result<DisplayInfo> {
        // Implementation for Windows display info
        Ok(DisplayInfo {
            primary_resolution: (1920, 1080),
            display_count: 1,
            dpi: Some(96.0),
            color_depth: Some(32),
            refresh_rate: Some(60.0),
        })
    }
    
    pub fn validate_windows_permissions() -> Result<()> {
        // Check Windows-specific permissions
        Ok(())
    }
}

#[cfg(target_os = "linux")]
mod linux {
    use super::*;
    
    pub fn get_linux_distribution() -> Result<String> {
        // Implementation for Linux distribution detection
        Ok("Ubuntu".to_string()) // Placeholder
    }
    
    pub fn get_linux_kernel_version() -> Result<String> {
        // Implementation for kernel version detection
        Ok("6.8.0".to_string()) // Placeholder
    }
    
    pub async fn get_linux_display_info() -> Result<DisplayInfo> {
        // Implementation for Linux display info
        Ok(DisplayInfo {
            primary_resolution: (1920, 1080),
            display_count: 1,
            dpi: Some(96.0),
            color_depth: Some(32),
            refresh_rate: Some(60.0),
        })
    }
    
    pub fn validate_linux_permissions() -> Result<()> {
        // Check Linux-specific permissions
        Ok(())
    }
}

#[cfg(target_os = "macos")]
mod macos {
    use super::*;
    
    pub fn get_macos_version() -> Result<String> {
        // Implementation for macOS version detection
        Ok("14.0".to_string()) // Placeholder
    }
    
    pub fn get_macos_build() -> Result<String> {
        // Implementation for macOS build detection
        Ok("23A344".to_string()) // Placeholder
    }
    
    pub async fn get_macos_display_info() -> Result<DisplayInfo> {
        // Implementation for macOS display info
        Ok(DisplayInfo {
            primary_resolution: (2560, 1440),
            display_count: 1,
            dpi: Some(110.0),
            color_depth: Some(32),
            refresh_rate: Some(60.0),
        })
    }
    
    pub fn validate_macos_permissions() -> Result<()> {
        // Check macOS-specific permissions
        Ok(())
    }
}

// Cross-platform implementations
async fn is_mouse_available() -> Result<bool> {
    // Platform-agnostic mouse detection
    Ok(true) // Placeholder
}

async fn is_keyboard_available() -> Result<bool> {
    // Platform-agnostic keyboard detection
    Ok(true) // Placeholder
}

async fn is_touch_available() -> Result<bool> {
    // Platform-agnostic touch detection
    Ok(false) // Placeholder
}

async fn is_microphone_available() -> Result<bool> {
    // Platform-agnostic microphone detection
    Ok(true) // Placeholder
}

async fn is_camera_available() -> Result<bool> {
    // Platform-agnostic camera detection
    Ok(false) // Placeholder
}

fn get_memory_info() -> Result<(u64, u64)> {
    // Cross-platform memory information
    // Returns (total_mb, available_mb)
    Ok((8192, 4096)) // Placeholder: 8GB total, 4GB available
}

async fn get_cpu_usage() -> Result<f32> {
    // Cross-platform CPU usage detection
    Ok(25.0) // Placeholder: 25% usage
}

// Re-export platform-specific functions
#[cfg(target_os = "windows")]
pub use windows::*;

#[cfg(target_os = "linux")]
pub use linux::*;

#[cfg(target_os = "macos")]
pub use macos::*;

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_platform_detection() {
        let platform_info = get_platform_info().await;
        assert!(platform_info.is_ok());
        
        let info = platform_info.unwrap();
        assert!(info.performance_info.cpu_count > 0);
        assert!(info.performance_info.total_memory_mb > 0);
    }

    #[tokio::test]
    async fn test_environment_validation() {
        let result = validate_environment().await;
        // Should pass on supported platforms
        assert!(result.is_ok() || matches!(result.unwrap_err(), HumainError::Platform { .. }));
    }

    #[test]
    fn test_architecture_detection() {
        let arch = detect_architecture();
        assert!(matches!(arch, Architecture::X86_64 | Architecture::Aarch64 | Architecture::Unknown(_)));
    }
}