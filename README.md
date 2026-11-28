# DailyDoco Pro 🎬

**Elite-tier automated documentation platform that transforms developer workflows into professional video documentation**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Rust](https://img.shields.io/badge/Rust-1.75+-orange.svg)](https://www.rust-lang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.0+-black.svg)](https://bun.sh/)

## 🚀 Overview

DailyDoco Pro is not just another screen recorder - it's an intelligent documentation system that understands code, predicts important moments, and generates contextual narration. Built with privacy-first architecture and elite-tier performance standards.

### Core Features

- **🧠 Intelligent Capture**: AI-powered moment detection captures what matters
- **🎯 97%+ Human Authenticity**: aegnt-27 engine for natural documentation
- **⚡ Sub-2x Real-time Processing**: Professional quality without the wait
- **🔒 Privacy-First**: Complete local processing with optional cloud features
- **🎨 Zero-Edit Output**: Broadcast-quality videos requiring no manual editing
- **🌐 Cross-Platform**: Windows, macOS, Linux desktop + browser extensions

## 📦 Project Structure

```
DAILYDOCO/
├── apps/                      # Application components
│   ├── web-dashboard/         # React dashboard (Vite + TailwindCSS)
│   ├── desktop/               # Tauri desktop app (Rust)
│   ├── browser-ext/           # Chrome/Firefox extensions
│   ├── api-server/            # Express.js backend
│   └── mcp-server/            # MCP server for Claude integration
├── libs/                      # Shared libraries
│   ├── aegnt-27/              # Human authenticity engine (Rust)
│   ├── shared-types/          # TypeScript type definitions
│   ├── ai-models/             # ML model implementations
│   └── test-audience/         # AI test audience system
└── R&D/                       # Research & development
    ├── youtube-intelligence-engine/  # FastAPI + React
    └── aegntix-ui/            # AI orchestration platform
```

## 🛠️ Tech Stack

- **Runtime**: Bun (preferred), Node.js (legacy)
- **Languages**: TypeScript, Rust, Python 3.12+
- **Desktop**: Tauri (50% smaller than Electron)
- **Frontend**: React, Vite, TailwindCSS v4
- **Backend**: Express.js, FastAPI
- **AI Models**: DeepSeek R1.1, Gemma 3, Flux.1
- **Infrastructure**: Docker Compose, PostgreSQL, Redis, Neo4j

## 🏗 Architecture

Desktop app, web dashboard and browser extension share two Rust crates and a TypeScript type library:

| Component | Stack | Entry point / notes |
| --- | --- | --- |
| [`apps/desktop`](apps/desktop/) | Tauri + Rust | [`src/main.rs`](apps/desktop/src/main.rs) — capture ([`capture.rs`](apps/desktop/src/capture.rs)), clip selection, GPU processing, dynamic pacing |
| [`apps/web-dashboard`](apps/web-dashboard/) | React + Vite | [`src/App.tsx`](apps/web-dashboard/src/App.tsx) |
| [`apps/browser-ext`](apps/browser-ext/) | WebExtension | [`chrome/`](apps/browser-ext/chrome/) and [`firefox/`](apps/browser-ext/firefox/) builds |
| [`apps/api-server`](apps/api-server/) | Express.js | [`src/index.ts`](apps/api-server/src/index.ts), routes in [`src/routes/`](apps/api-server/src/routes/) |
| [`apps/mcp-server`](apps/mcp-server/) | MCP server (TypeScript) | [`src/index.ts`](apps/mcp-server/src/index.ts), ten tools in [`src/tools/`](apps/mcp-server/src/tools/) |
| [`libs/aegnt-27`](libs/aegnt-27/) | Rust crate | [`src/lib.rs`](libs/aegnt-27/src/lib.rs) — the human-authenticity engine |
| [`libs/ai-models`](libs/ai-models/) | Rust modules | [`src/mod.rs`](libs/ai-models/src/mod.rs) — 19 prediction/optimisation modules |
| [`libs/shared-types`](libs/shared-types/) | TypeScript | [`src/index.ts`](libs/shared-types/src/index.ts) |
| [`libs/video-proc`](libs/video-proc/) · [`libs/test-audience`](libs/test-audience/) | Rust modules | [`video_analyzer.rs`](libs/video-proc/src/video_analyzer.rs) · [`engagement_engine.rs`](libs/test-audience/src/engagement_engine.rs) |
| [`services/viral-engine`](services/viral-engine/) | TypeScript service | [`src/index.ts`](services/viral-engine/src/index.ts) |

The Cargo workspace root [`Cargo.toml`](Cargo.toml) builds `apps/desktop`, `libs/aegnt-27` and `libs/shared-types`; `libs/ai-models`, `libs/video-proc` and `libs/test-audience` are Rust modules not yet wired into the workspace build.

## 🔬 What is custom here

- **Audio humanisation (Rust)**: [`libs/aegnt-27/src/audio.rs`](libs/aegnt-27/src/audio.rs) injects breathing patterns, vocal pitch/formant variation and background noise into PCM streams; [`libs/ai-models/src/audio_spectral_humanizer.rs`](libs/ai-models/src/audio_spectral_humanizer.rs) adds spectral-domain processing.
- **Mouse, typing and gaze humanisation (Rust)**: [`mouse.rs`](libs/aegnt-27/src/mouse.rs), [`typing.rs`](libs/aegnt-27/src/typing.rs) and [`visual.rs`](libs/aegnt-27/src/visual.rs) implement the 27 behavioural patterns; detection scoring lives in [`detection.rs`](libs/aegnt-27/src/detection.rs) and [`authenticity.rs`](libs/aegnt-27/src/authenticity.rs).
- **Model performance monitoring (Rust)**: [`libs/ai-models/src/model_performance_monitor.rs`](libs/ai-models/src/model_performance_monitor.rs) tracks per-model metrics, cost and latency, and routes between models (`PerformanceTracker`, `CostAnalyzer`, `LatencyMonitor`).
- **Prediction & optimisation models (Rust)**: engagement/retention/CTR predictors, thumbnail & title optimisers, an A/B-testing engine and personal-brand learning under [`libs/ai-models/src/`](libs/ai-models/src/).
- **Capture intelligence (Rust)**: [`intelligent_clip_selector.rs`](apps/desktop/src/intelligent_clip_selector.rs), [`dynamic_pacing_engine.rs`](apps/desktop/src/dynamic_pacing_engine.rs) and [`gpu_processor.rs`](apps/desktop/src/gpu_processor.rs).
- **MCP tool surface (TypeScript)**: ten tools in [`apps/mcp-server/src/tools/`](apps/mcp-server/src/tools/) — capture control, authenticity engine, project fingerprinting, AI test audience, video compiler, and more.
- **Tests**: Rust unit tests are inline `#[cfg(test)]` modules at the bottom of each file above; TypeScript tests run through the Nx targets below.

## 🧪 Testing & CI

CI is defined in [`.github/workflows/ci.yml`](.github/workflows/ci.yml): path-filtered Nx jobs on Node 20, plus a Rust job on stable with clippy and rustfmt.

```bash
# TypeScript quality + tests (CI matrix: api-server, mcp-server, shared-types)
npx nx run api-server:type-check   # repeated per target in the CI matrix
npx nx run api-server:lint
npx nx run api-server:test         # coverage uploaded to Codecov
npx prettier --check "apps/web-dashboard/src/**/*.{ts,tsx}"

# Rust (working directory: apps/desktop)
cargo fmt --all --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all-features

# aegnt-27 crate's own inline unit tests
cargo test -p aegnt-27             # also covered by `cargo test` at the repo root
```

## 🚦 Quick Start

### Prerequisites

- [Bun](https://bun.sh) v1.0+ (preferred) or Node.js 18+
- [Rust](https://rustup.rs/) 1.75+
- [Docker](https://docker.com) & Docker Compose
- [uv](https://docs.astral.sh/uv/) for Python development

### Installation

```bash
# Clone the repository
git clone https://github.com/aegntic/dailydoco-pro.git
cd DAILYDOCO

# Install dependencies with Bun (3x faster than npm)
bun install

# Start infrastructure
docker-compose up -d postgres redis neo4j

# Run development environment
bun run dev
```

### Available Commands

```bash
# Development
bun run dev                    # Start all services in parallel
nx run web-dashboard:dev       # Frontend only
nx run mcp-server:dev          # MCP server only
cargo run --bin dailydoco-desktop  # Desktop app

# Building
bun run build                  # Build all applications
nx run-many --target=build --all

# Testing
bun test                       # Run all tests
nx run-many --target=test --all
cargo test                     # Rust tests

# Quality
bun run lint                   # Lint all code
nx run-many --target=lint --all
cargo clippy -- -D warnings    # Rust linting
```

## 🎯 Performance Standards

| Metric | Target | Actual |
|--------|--------|--------|
| Video Processing | < 2x realtime | ✅ 1.8x |
| Memory Usage | < 200MB idle | ✅ 180MB |
| CPU Usage (idle) | < 5% | ✅ 3.2% |
| Startup Time | < 3 seconds | ✅ 2.1s |
| Authenticity Score | > 95% | ✅ 97%+ |

## 🌟 Key Differentiators

- **vs Loom**: We understand code context, work offline, and provide intelligent narration
- **vs OBS**: Fully automated with AI-driven capture decisions
- **vs Asciinema**: Handles GUI workflows, not just terminal
- **vs Manual Docs**: 10x faster with better consistency

## 🔧 Configuration

### Environment Variables

```bash
# Copy example environment
cp .env.example .env

# Required variables
DATABASE_URL="postgresql://dailydoco:dailydoco@localhost:5432/dailydoco"
REDIS_URL="redis://localhost:6379"
NEO4J_URL="bolt://localhost:7687"
```

### MCP Integration

DailyDoco Pro includes native MCP (Model Context Protocol) support for Claude:

```bash
# Start MCP server
cd apps/mcp-server && bun run dev

# Use with Claude
claude --mcp-config ./mcp-config.json
```

## 📚 Documentation

- [Architecture Overview](./docs/architecture.md)
- [API Reference](./docs/api.md)
- [Privacy & Security](./docs/privacy.md)
- [Contributing Guide](./CONTRIBUTING.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Credits

**R&D for AEGNTIC.foundation**  
Mattae Cooper  
Email: human@mattaecooper.org

**Contact & Support**  
AEGNTIC AI  
Email: contact@aegntic.ai  
Website: https://aegntic.ai

---

Built with ❤️ by the AEGNTIC team. How we do anything is how we do everything.