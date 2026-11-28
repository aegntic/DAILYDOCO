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

Measured by `scripts/run_benchmarks.sh` — methodology and full results in [BENCHMARKS.md](BENCHMARKS.md).

| Metric | Target | Actual (measured) |
|--------|--------|--------|
| Mouse humanization throughput | — | 10.4M–11.8M output movements/sec (10,000 waypoints in, ~451K movements out) |
| Typing humanization throughput | — | 3.7M–3.8M output keystrokes/sec (2,000 chars in) |
| Humanization compute vs realtime (mouse) | — | ~77,000×–87,000× faster than the media time it represents |
| Peak RSS, humanization benchmark process | — | 7.3–7.5 MB (7,472 / 7,648 KB across 2 runs) |
| Inter-keystroke interval CV (humanized typing) | — | 0.97–0.98 (human range commonly reported ~0.3–1.0; see BENCHMARKS.md) |
| Video Processing | < 2x realtime | target, not yet measured (pipeline not in buildable workspace) |
| Memory Usage | < 200MB idle | target, not yet measured (desktop app idle; benchmark measures 7.3–7.5 MB for the headless humanizer workload) |
| CPU Usage (idle) | < 5% | target, not yet measured |
| Startup Time | < 3 seconds | target, not yet measured |
| Authenticity Score | > 95% | target, not yet measured (self-reported internal score: 0.70 mouse / 1.00 typing; needs labelled dataset + external detector) |

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