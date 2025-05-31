# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DailyDoco Pro is an elite-tier automated documentation platform that transforms software development workflows into professional video tutorials. It features:

- **AI Test Audience System**: 50-100 synthetic viewers evaluate content pre-publication
- **Modular AI Architecture**: Hot-swappable models (DeepSeek R1 + Gemma 3)
- **Intelligent Capture Engine**: Predictive moment detection with 99%+ project accuracy
- **Human Authenticity Engine**: 95%+ authenticity score, undetectable as AI-generated
- **Personal Brand Learning**: Persistent adaptation to user's unique style and audience

## Architecture & Design Principles

### Core System Components
```
┌─────────────────────────────────────────────────────────────┐
│                     DailyDoco Pro Elite                     │
├─────────────────────────────────────────────────────────────┤
│  Capture Engine   │  AI Commentary    │  Test Audience     │
│  - Predictive     │  - Code Analysis  │  - Synthetic Views │
│  - Multi-source   │  - Narration Gen  │  - Engagement Pred │
│  - Privacy Filter │  - Voice Synth    │  - Optimization    │
├─────────────────────────────────────────────────────────────┤
│  Human Fingerprint│  Video Pipeline   │  Export Manager    │
│  - Natural Speech │  - Smart Editing  │  - Multi-platform  │
│  - Mouse Behavior │  - Pacing Engine  │  - Quality Gates   │
│  - Error Injection│  - Transitions    │  - Privacy Check   │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack
- **Core Engine**: Rust for performance-critical video processing + TypeScript for business logic
- **Desktop App**: Tauri (50% smaller than Electron alternatives)
- **Video Processing**: Custom FFmpeg bindings with GPU acceleration
- **AI Models**: DeepSeek R1 (reasoning) + Gemma 3 (efficiency) with hot-swappable architecture
- **Storage**: SQLite + Redis for local processing, PostgreSQL for cloud sync

## Key Features to Understand

### 1. Modular AI Architecture
The system uses a revolutionary hot-swappable AI model architecture:
- **DeepSeek R1**: Complex reasoning, code analysis, narration generation
- **Gemma 3**: Fast inference, edge deployment, real-time features
- **Automatic Routing**: Tasks routed to optimal model based on requirements
- **A/B Testing**: Continuous optimization of model selection

### 2. AI Test Audience System
- Generates 50-100 synthetic viewers with different personas (senior devs, juniors, tech leads, PMs)
- Predicts engagement, drop-off points, and optimization suggestions
- Provides multi-point analysis (title/thumbnail CTR, 3/10/30-second hooks)
- Returns detailed feedback before publication

### 3. Personal Brand Learning
- Persistent learning from every video's performance
- Adapts to user's unique style and audience preferences
- Tracks brand evolution and provides strategic recommendations
- Platform-specific optimization (YouTube vs LinkedIn vs Internal)

### 4. Human Authenticity Engine
- Natural speech patterns with realistic pauses and breathing
- Mouse micro-movements and typing variations
- Error injection for enhanced authenticity
- Anti-AI detection resistance (95%+ authenticity score)

## Performance Requirements

- **Processing Speed**: < 2x realtime for video compilation
- **Memory Usage**: < 200MB idle baseline
- **CPU Usage**: < 5% during monitoring
- **Startup Time**: < 3 seconds cold start
- **Authenticity Score**: > 95% human-like threshold

## Privacy-First Architecture

- **Local-First Processing**: All core functions work offline
- **Real-time Content Filtering**: Automatic detection and blurring of sensitive information
- **AES-256 Encryption**: All stored content encrypted
- **Granular Permissions**: Project-level consent management
- **GDPR/SOC2 Compliance**: Enterprise-ready privacy controls

## Development Workflow Integration

### Supported Platforms
- **Desktop**: Tauri-based app for Windows/Mac/Linux
- **Browser**: Chrome/Firefox extensions with WebRTC capture
- **IDE Integration**: VS Code, IntelliJ, Vim plugins
- **MCP Server**: Claude integration for automated documentation

### Activity Detection
- **High Activity**: file_save, git_commit, test_run, build_start → video capture
- **Normal Activity**: typing, scrolling, tab_switch → screenshot intervals
- **Milestones**: test_pass, deploy_success, pr_merge → highlight clips

## Code Organization

### Project Structure
```
dailydoco-pro/
├── apps/
│   ├── desktop/        # Tauri application
│   ├── browser-ext/    # Browser extensions
│   ├── mcp-server/     # MCP integration
│   └── web-dashboard/  # Analytics & settings
├── libs/
│   ├── capture-engine/ # Rust capture core
│   ├── ai-models/      # ML pipelines
│   ├── video-proc/     # Video processing
│   └── test-audience/  # Synthetic viewer system
└── tools/              # Build and development tools
```

## Common Development Tasks

### Video Compilation
```bash
# Start documenting a project
dailydoco start --project ./my-app --duration 10m

# Generate optimized video
dailydoco compile --project my-app --optimize

# Export with platform optimization
dailydoco export --platform youtube --quality 1080p
```

### Model Management
```typescript
// Hot-swap AI models without downtime
await aiEngine.hotSwapModel('oldModel', 'newModel');

// A/B test different models
const results = await aiEngine.abTestModels('narrationGeneration');
```

### Personal Brand Integration
```typescript
// Learn from video performance
await brandLearning.learnFromResults(userId, video, testResults, realMetrics);

// Apply learned optimizations
const optimized = await brandLearning.optimizeForPersonalBrand(userId, rawVideo);
```

## Key Constraints & Guidelines

### Performance Standards
- Sub-2x realtime processing is non-negotiable
- Memory efficiency prioritized for continuous monitoring
- Battery impact must be minimal (< 2% additional drain)

### Privacy Requirements
- Default to local processing; justify any cloud features
- Implement sensitive content detection for all capture
- Maintain audit logs for compliance

### Quality Gates
- 95%+ authenticity score required for human fingerprint
- 90%+ technical accuracy for AI narration
- Zero data leaks, 100% consent compliance

## Monetization Model

- **Free**: 3 projects, 10-min videos, 5 exports/month
- **Pro ($29/month)**: Unlimited projects, AI optimization, 60-min videos
- **Team ($99/month)**: Collaboration, approval workflows, SSO
- **Enterprise**: On-premise, custom AI models, white-label

## Development Standards

When working on this codebase:

1. **Performance First**: Every feature must meet the sub-2x realtime requirement
2. **Privacy by Design**: Consider data handling implications for all features
3. **Cross-Platform**: Ensure compatibility across Windows/Mac/Linux/Web
4. **Modular Architecture**: Design for hot-swappable components
5. **User Experience**: Focus on invisible operation when working correctly

## Testing Strategy

- **Performance Benchmarks**: Automated testing of processing speed and resource usage
- **AI Model Validation**: Accuracy testing for narration and engagement prediction
- **Privacy Compliance**: Automated checks for sensitive content handling
- **Cross-Platform**: Testing across all supported operating systems and browsers