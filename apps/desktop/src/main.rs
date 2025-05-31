// DailyDoco Pro Desktop Application
// Elite-tier automated documentation platform

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::sync::Arc;
use tauri::{Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, CustomMenuItem};
use tokio::sync::Mutex;

mod capture;
mod ai;
mod video;
mod storage;
mod config;
mod performance;
mod fingerprinting;
mod privacy;
mod commands;

use capture::CaptureEngine;
use ai::ModularAIEngine;
use video::VideoProcessor;
use storage::StorageManager;
use config::AppConfig;
use performance::PerformanceMonitor;

/// Application state shared across all components
#[derive(Default)]
pub struct AppState {
    pub capture_engine: Arc<Mutex<Option<CaptureEngine>>>,
    pub ai_engine: Arc<Mutex<Option<ModularAIEngine>>>,
    pub video_processor: Arc<Mutex<Option<VideoProcessor>>>,
    pub storage_manager: Arc<Mutex<Option<StorageManager>>>,
    pub performance_monitor: Arc<Mutex<Option<PerformanceMonitor>>>,
    pub config: Arc<Mutex<AppConfig>>,
}

fn create_system_tray() -> SystemTray {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit DailyDoco Pro");
    let show = CustomMenuItem::new("show".to_string(), "Show Window");
    let start_capture = CustomMenuItem::new("start_capture".to_string(), "Start Capture");
    let stop_capture = CustomMenuItem::new("stop_capture".to_string(), "Stop Capture");
    
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_native_item(tauri::SystemTrayMenuItem::Separator)
        .add_item(start_capture)
        .add_item(stop_capture)
        .add_native_item(tauri::SystemTrayMenuItem::Separator)
        .add_item(quit);

    SystemTray::new().with_menu(tray_menu)
}

fn handle_system_tray_event(app: &tauri::AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick {
            position: _,
            size: _,
            ..
        } => {
            let window = app.get_window("main").unwrap();
            window.show().unwrap();
            window.set_focus().unwrap();
        }
        SystemTrayEvent::MenuItemClick { id, .. } => {
            match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "show" => {
                    let window = app.get_window("main").unwrap();
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
                "start_capture" => {
                    // TODO: Implement start capture command
                    log::info!("Starting capture from system tray");
                }
                "stop_capture" => {
                    // TODO: Implement stop capture command
                    log::info!("Stopping capture from system tray");
                }
                _ => {}
            }
        }
        _ => {}
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize logging
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();
    
    log::info!("Starting DailyDoco Pro v{}", env!("CARGO_PKG_VERSION"));

    // Initialize application state
    let state = AppState::default();
    
    // Load configuration
    let config = AppConfig::load().await.unwrap_or_else(|e| {
        log::warn!("Failed to load config, using defaults: {}", e);
        AppConfig::default()
    });
    
    *state.config.lock().await = config;

    // Create system tray
    let tray = create_system_tray();

    // Build and run Tauri application
    tauri::Builder::default()
        .manage(state)
        .system_tray(tray)
        .on_system_tray_event(handle_system_tray_event)
        .invoke_handler(tauri::generate_handler![
            // Core commands
            commands::initialize_app,
            commands::get_app_info,
            commands::shutdown_app,
            
            // Project commands
            commands::create_project,
            commands::get_projects,
            commands::get_project,
            commands::update_project,
            commands::delete_project,
            
            // Capture commands
            commands::start_capture,
            commands::stop_capture,
            commands::pause_capture,
            commands::resume_capture,
            commands::get_capture_status,
            
            // AI commands
            commands::get_ai_models,
            commands::switch_ai_model,
            commands::analyze_code,
            commands::generate_narration,
            commands::run_test_audience,
            
            // Video commands
            commands::compile_video,
            commands::export_video,
            commands::get_video_status,
            commands::preview_video,
            
            // Performance commands
            commands::get_performance_metrics,
            commands::run_benchmark,
            
            // Settings commands
            commands::get_settings,
            commands::update_settings,
            commands::reset_settings,
        ])
        .setup(|app| {
            let app_handle = app.handle();
            
            // Initialize core components in background
            tauri::async_runtime::spawn(async move {
                if let Err(e) = initialize_core_components(&app_handle).await {
                    log::error!("Failed to initialize core components: {}", e);
                }
            });
            
            log::info!("DailyDoco Pro initialized successfully");
            Ok(())
        })
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                event.window().hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("Error while running DailyDoco Pro");

    Ok(())
}

async fn initialize_core_components(app_handle: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let state: tauri::State<AppState> = app_handle.state();
    
    log::info!("Initializing core components...");
    
    // Initialize storage manager
    log::info!("Initializing storage manager...");
    let storage_manager = StorageManager::new().await?;
    *state.storage_manager.lock().await = Some(storage_manager);
    
    // Initialize performance monitor
    log::info!("Initializing performance monitor...");
    let performance_monitor = PerformanceMonitor::new();
    performance_monitor.start_monitoring().await?;
    *state.performance_monitor.lock().await = Some(performance_monitor);
    
    // Initialize AI engine
    log::info!("Initializing modular AI engine...");
    let ai_engine = ModularAIEngine::new().await?;
    *state.ai_engine.lock().await = Some(ai_engine);
    
    // Initialize capture engine
    log::info!("Initializing capture engine...");
    let capture_engine = CaptureEngine::new().await?;
    *state.capture_engine.lock().await = Some(capture_engine);
    
    // Initialize video processor
    log::info!("Initializing video processor...");
    let video_processor = VideoProcessor::new().await?;
    *state.video_processor.lock().await = Some(video_processor);
    
    log::info!("All core components initialized successfully");
    Ok(())
}