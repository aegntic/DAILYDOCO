# Benchmarks — measured reality

This document reports what the code in this repository **actually does** on the
machine listed below. Every number is verbatim output of
`scripts/run_benchmarks.sh` (harness: `libs/aegnt-27/examples/bench.rs`). Nothing
is extrapolated, averaged in our favour, or tuned to pass a threshold. Claims
that cannot be measured with an in-repo harness are listed under
[Unmeasured](#unmeasured) and remain explicitly labelled targets in the README.

## Methodology

- **Commit measured**: `9c95abe001f99b1ca0ab892768b2ab4cb424ae3e` (main, plus the
  additive benchmark harness and the minimal build repairs listed in
  [Build repairs required to measure](#build-repairs-required-to-measure)).
- **Machine**: Intel Core Ultra 9 275HX (24 hardware threads), 64 GB RAM, Linux
  (Arch-based, kernel 7.2.15-4-omarchy).
- **Toolchain**: rustc 1.98.0 (88d9e12ae 2026-08-18), cargo 1.98.0, release
  profile from the workspace root (`opt-level = 3`, `lto = true`,
  `codegen-units = 1`).
- **Workload** (identical every run — generated from fixed-seed xorshift64*,
  seed `0xD411_D0C0_2711_2025`):
  - Mouse: 100 paths × 100 waypoints = **10,000 synthetic input waypoints**
    through `MouseHumanizer::humanize_path` (default `MouseConfig`, 1920×1080).
  - Typing: one **2,000-character** fixed text through
    `TypingHumanizer::humanize_text` (default `TypingConfig`).
- **Timing**: wall-clock around the humanization calls, single-threaded tokio
  runtime; a small warmup call per engine is excluded.
- **Interval statistics**: computed over consecutive inter-event gaps of the
  humanized output; Shannon entropy over log2-millisecond buckets
  (bucket *b* holds gaps in [2^b, 2^(b+1)) ms).
- **Peak memory**: peak resident set size of the benchmark process, read from
  `/proc/self/status` `VmHWM` (the same counter `getrusage`/`ru_maxrss` and
  `/usr/bin/time -v` report; `/usr/bin/time` is not installed on this machine).
- **Run-to-run variance**: the synthetic *input* is bit-identical across runs,
  but the library's internal randomness (`HumanRng` wraps
  `rand::thread_rng()`) is not seedable without changing application source, so
  humanized *output* varies slightly between runs. Both runs are published.

## Results (two consecutive runs, verbatim)

```
run 1:
mode=mouse input_waypoints=10000 output_movements=451301 wall_ms=38.323 events_per_sec=11776196.4 represented_media_ms=3335838.0 realtime_factor=87045.0 intervals=451201 interval_mean_ms=27.8066 interval_std_ms=32.5312 interval_cv=1.1699 interval_entropy_bits=2.5890 self_reported_authenticity_avg=0.7000
mode=typing input_chars=2000 output_keystrokes=2042 wall_ms=0.543 events_per_sec=3762279.9 represented_media_ms=607350.0 realtime_factor=1119011.1 intervals=2041 interval_mean_ms=297.4821 interval_std_ms=290.3323 interval_cv=0.9760 interval_entropy_bits=2.5231 self_reported_authenticity=1.0000 actual_wpm=39.5 injected_error_rate=0.0132
peak_rss_kb=7472

run 2:
mode=mouse input_waypoints=10000 output_movements=450711 wall_ms=43.455 events_per_sec=10371959.3 represented_media_ms=3345439.0 realtime_factor=76986.7 intervals=450611 interval_mean_ms=28.0129 interval_std_ms=32.9731 interval_cv=1.1771 interval_entropy_bits=2.6248 self_reported_authenticity_avg=0.7000
mode=typing input_chars=2000 output_keystrokes=2036 wall_ms=0.549 events_per_sec=3707082.2 represented_media_ms=600957.0 realtime_factor=1094202.9 intervals=2035 interval_mean_ms=294.8998 interval_std_ms=285.4894 interval_cv=0.9681 interval_entropy_bits=2.5238 self_reported_authenticity=1.0000 actual_wpm=39.9 injected_error_rate=0.0103
peak_rss_kb=7648
```

### Summary table

| Metric | Run 1 | Run 2 | Run-to-run spread |
|---|---|---|---|
| Mouse humanization throughput (output movements/sec) | 11,776,196.4 | 10,371,959.3 | −11.9% |
| Mouse realtime factor (represented media time ÷ wall time) | 87,045.0× | 76,986.7× | −11.6% |
| Mouse inter-event interval mean (ms) | 27.8066 | 28.0129 | +0.7% |
| Mouse inter-event interval CV | 1.1699 | 1.1771 | +0.6% |
| Mouse interval Shannon entropy (log2-ms buckets, bits) | 2.5890 | 2.6248 | +1.4% |
| Typing humanization throughput (output keystrokes/sec) | 3,762,279.9 | 3,707,082.2 | −1.5% |
| Typing realtime factor | 1,119,011.1× | 1,094,202.9× | −2.2% |
| Typing inter-event interval mean (ms) | 297.4821 | 294.8998 | −0.9% |
| Typing inter-event interval CV | 0.9760 | 0.9681 | −0.8% |
| Typing interval Shannon entropy (bits) | 2.5231 | 2.5238 | +0.03% |
| Peak RSS of benchmark process (KB) | 7,472 | 7,648 | +2.4% |

## Interpretation (plain words)

- **Compute is not the bottleneck.** Humanizing 10,000 mouse waypoints into
  ~451,000 output movements takes ~38–43 ms, and humanizing 2,000 characters
  takes ~0.55 ms. Expressed against the media time the output timelines
  represent, the humanizer runs roughly **77,000–87,000× faster than realtime
  for mouse** and roughly **1.1 million× faster than realtime for typing** on
  this machine. Any "× realtime" claim about humanization is therefore
  unremarkable: the interesting budget is elsewhere (capture, video, disk).
- **Timing-distribution quality.** Published human inter-keystroke interval
  CVs are commonly reported in the ~0.3–1.0 range depending on task (roughly:
  transcription toward the lower end, free composition with pauses toward the
  upper end). The measured typing-interval CV of ~0.97–0.98 sits at the upper
  end of that range — consistent with a sequence that models sentence, word,
  and thinking pauses, which widen the interval spread beyond within-word
  typing alone. This is a *consistency* observation only, not a statement that
  the output fools any detector. The mouse-interval CV (~1.17) has no directly
  comparable published figure cited here and is reported as measured.
- **Entropy** of ~2.5–2.6 bits over log2-ms buckets means the intervals span
  roughly 6–7 distinct logarithmic decades of mass — a wide, multi-scale
  distribution rather than a single fixed tick.
- **Memory.** The humanization workload peaks at **7.3–7.5 MB RSS** for the
  whole benchmark process (includes the tokio runtime, allocator overhead and
  output buffers; it is *not* an attribution of memory to the humanizer alone).
- **Self-reported authenticity** (`authenticity_score` fields the library
  computes about its own output) measured 0.70 (mouse paths) and 1.00 (typing
  sequence). These are the library grading itself with internal heuristics;
  they are **not** a measured human-detection or AI-detection rate. See
  Unmeasured.

## Unmeasured

The following README "Performance Standards" claims have **no harness in this
repository** and are not verified by anything above. They remain labelled
targets:

- **Video processing 1.8× realtime** — the video pipeline
  (`libs/video-proc` et al.) is not part of the buildable Cargo workspace
  (workspace members are `apps/desktop`, `libs/aegnt-27`,
  `libs/shared-types`), so no video-processing throughput can be measured here.
  Would need: a buildable video pipeline plus a fixed reference video.
- **Memory ≤180 MB idle / CPU idle 3.2% / startup 2.1 s** — these are
  desktop-application properties (Tauri app with GUI, capture subsystem). The
  harness measures a headless library workload (7.3–7.5 MB peak RSS), which is
  a different quantity. Would need: a runnable desktop build with instrumentation.
- **Authenticity 97%+ / accuracy 87%+** — no labelled human-vs-AI dataset and
  no external detector exist in this repository, so detector-facing accuracy is
  unmeasurable with the current code. The only related measured quantity is the
  library's *self-reported* internal score (0.70 mouse / 1.00 typing above),
  which is not evidence of detector evasion. Would need: a labelled dataset and
  an independent third-party detector.

## Build repairs required to measure

The repository did not compile on any platform before this PR (every `cargo`
command failed). To run *anything*, the following minimal, behaviour-preserving
repairs were required; none of them change application logic, and each is
disclosed here:

1. **Dependency-name typo** — `num-cpus` does not exist on crates.io (the real
   crate is `num_cpus`), so dependency resolution failed workspace-wide.
   Renamed in root `Cargo.toml`, `libs/aegnt-27/Cargo.toml`, and
   `apps/desktop/Cargo.toml` (workspace-inheritance key).
2. **Misplaced dependency table** — in `libs/aegnt-27/Cargo.toml`, the block
   after `[target.'cfg(target_os = "macos")'.dependencies]` (including `toml`,
   which `error.rs` and `config.rs` import) silently applied to macOS only, so
   Linux builds failed with "cannot find crate `toml`". Moved `toml` back to
   top-level `[dependencies]`. (`enigo`, `inputbot`, `config` were left exactly
   where they were; source does not import them.)
3. **Dead references to unimplemented types** — `src/lib.rs` referenced
   `MouseAuthenticator` / `TypingAuthenticator` / `AudioAuthenticator` /
   `VisualAuthenticator` / `AuthenticMousePath` / `AuthenticKeystroke`, none of
   which are defined anywhere in the crate; the public engine facade that used
   them has never compiled. Those dead fields/methods/re-exports were removed.
   The working humanizers (`MouseHumanizer`, `TypingHumanizer`) and the
   authenticity engine are untouched; `Aegnt27Engine` still exists with its
   builder, config, and `validate_authenticity` paths.

## Harness limitations

- Single machine, single-threaded runtime; absolute numbers will differ
  elsewhere. Ratios and distributions are the durable part.
- The library's internal RNG cannot be seeded from outside, so humanized output
  (and therefore CV/entropy digits) varies slightly run to run; the input
  workload is deterministic and both runs are published.
- Peak RSS is process-level; it includes runtime/allocator overhead and does
  not isolate the humanizer's contribution.
- Pre-existing issues left untouched (out of scope): the broken example
  `libs/aegnt-27/examples/performance_optimization.rs` (57 compile errors of its
  own; not compiled by this harness) and the flaky test
  `config::tests::test_config_builder` (fails when the parallel
  `test_env_override` leaks `HUMAIN_PERFORMANCE_MAX_CONCURRENT_OPERATIONS=8`
  into the shared process environment).
