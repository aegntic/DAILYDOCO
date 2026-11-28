#!/usr/bin/env bash
# Runs the aegnt-27 humanization benchmark in release mode and prints its output.
#
# Measures (all numbers are verbatim harness output, no tuning or rounding in
# favour of any claim):
#   - mouse humanization throughput (output movements/sec) and realtime factor
#   - typing humanization throughput (output keystrokes/sec) and realtime factor
#   - inter-event interval mean/std/CV/Shannon entropy for both streams
#   - peak resident set size of the benchmark process (VmHWM)
#
# Usage: scripts/run_benchmarks.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "== building (release) =="
cargo build --release -p aegnt-27 --features mouse,typing --example bench

BIN="$ROOT/target/release/examples/bench"
if [[ ! -x "$BIN" ]]; then
    echo "error: benchmark binary not found at $BIN" >&2
    exit 1
fi

echo "== running =="
"$BIN"
