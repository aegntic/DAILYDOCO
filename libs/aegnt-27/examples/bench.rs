//! Honest throughput / timing-quality / memory benchmark for aegnt-27 humanization.
//!
//! Run with:
//!   cargo run --release -p aegnt-27 --features mouse,typing --example bench
//!
//! What it measures (all numbers printed are verbatim output of this run):
//!   1. THROUGHPUT: wall time to humanize a fixed synthetic workload through
//!      MouseHumanizer::humanize_path and TypingHumanizer::humanize_text,
//!      reported as output events per second.
//!   2. REALTIME FACTOR: sum of the humanized output timelines (the media time
//!      the output represents) divided by the wall time spent computing it.
//!   3. TIMING-DISTRIBUTION QUALITY: mean / standard deviation / coefficient of
//!      variation / Shannon entropy (log2-millisecond buckets) of the inter-event
//!      intervals in the humanized output.
//!   4. PEAK MEMORY: peak resident set of this process (VmHWM from
//!      /proc/self/status, the same counter getrusage ru_maxrss reports).
//!
//! Determinism: the synthetic workload is generated from a fixed-seed xorshift64*
//! PRNG (seed below), so the INPUT is bit-identical across runs. The library's
//! internal randomness (HumanRng = rand::thread_rng) cannot be seeded without
//! changing application source, so humanized OUTPUT varies slightly run to run;
//! run-to-run spread is published in BENCHMARKS.md rather than hidden.

use std::time::{Duration, Instant};

use aegnt_27::mouse::{MouseConfig, MousePath, MouseHumanizer, Point};
use aegnt_27::typing::{TypingConfig, TypingHumanizer};

/// Fixed seed for the synthetic input generator (workload is deterministic).
const INPUT_SEED: u64 = 0xD411_D0C0_2711_2025;

const MOUSE_PATHS: usize = 100;
const MOUSE_POINTS_PER_PATH: usize = 100; // 100 * 100 = 10,000 input waypoints
const TYPING_INPUT_CHARS: usize = 2_000;

/// xorshift64* — tiny deterministic PRNG so the workload needs no rand dependency.
struct Xorshift64Star {
    state: u64,
}

impl Xorshift64Star {
    fn new(seed: u64) -> Self {
        Self { state: seed }
    }

    fn next(&mut self) -> u64 {
        let mut x = self.state;
        x ^= x >> 12;
        x ^= x << 25;
        x ^= x >> 27;
        self.state = x;
        x.wrapping_mul(0x2545_F491_4F6C_DD1D)
    }
}

/// Interval statistics over inter-event gaps measured in milliseconds.
struct IntervalStats {
    count: usize,
    mean_ms: f64,
    std_ms: f64,
    cv: f64,
    entropy_bits: f64,
}

fn interval_stats(deltas_ms: &[f64]) -> IntervalStats {
    let n = deltas_ms.len();
    let mean = deltas_ms.iter().sum::<f64>() / n as f64;
    let var = deltas_ms.iter().map(|d| (d - mean) * (d - mean)).sum::<f64>() / n as f64;
    let std = var.sqrt();
    let cv = if mean > 0.0 { std / mean } else { f64::NAN };

    // Shannon entropy over log2-millisecond buckets:
    // bucket b holds intervals in [2^b, 2^(b+1)) ms. Sub-microsecond gaps are
    // clamped to 2^-10 ms so every interval lands in a bucket.
    let mut buckets: std::collections::HashMap<i64, usize> = std::collections::HashMap::new();
    for &d in deltas_ms {
        let d = d.max(2f64.powi(-10));
        let b = d.log2().floor() as i64;
        *buckets.entry(b).or_insert(0) += 1;
    }
    let entropy = buckets
        .values()
        .map(|&c| {
            let p = c as f64 / n as f64;
            -p * p.log2()
        })
        .sum::<f64>();

    IntervalStats {
        count: n,
        mean_ms: mean,
        std_ms: std,
        cv,
        entropy_bits: entropy,
    }
}

fn build_mouse_paths(rng: &mut Xorshift64Star) -> Vec<MousePath> {
    let mut paths = Vec::with_capacity(MOUSE_PATHS);
    for _ in 0..MOUSE_PATHS {
        let mut points = Vec::with_capacity(MOUSE_POINTS_PER_PATH);
        for _ in 0..MOUSE_POINTS_PER_PATH {
            let r = rng.next();
            let x = 100 + (r % 1_700) as i32; // stay inside the default 1920x1080 bounds
            let y = 100 + ((r >> 32) % 860) as i32;
            points.push(Point::new(x, y));
        }
        paths.push(
            MousePath::from_points(points, Duration::from_millis(800))
                .expect("synthetic path is valid"),
        );
    }
    paths
}

fn build_typing_text() -> String {
    let sentence = "The quick brown fox jumps over the lazy dog while documenting \
                    the build pipeline with authentic timing patterns. ";
    let mut text = String::with_capacity(TYPING_INPUT_CHARS);
    while text.chars().count() < TYPING_INPUT_CHARS {
        text.push_str(sentence);
    }
    text.chars().take(TYPING_INPUT_CHARS).collect()
}

#[tokio::main(flavor = "current_thread")]
async fn main() {
    let mut rng = Xorshift64Star::new(INPUT_SEED);
    let mouse_paths = build_mouse_paths(&mut rng);
    let typing_text = build_typing_text();

    let mut mouse = MouseHumanizer::new(MouseConfig::default())
        .await
        .expect("mouse humanizer constructs");
    let mut typer = TypingHumanizer::new(TypingConfig::default())
        .await
        .expect("typing humanizer constructs");

    // Warmup (excluded from all timing): one tiny call per engine.
    let _ = mouse
        .humanize_path(
            MousePath::from_points(
                vec![Point::new(10, 10), Point::new(60, 60)],
                Duration::from_millis(50),
            )
            .expect("warmup path"),
        )
        .await;
    let _ = typer.humanize_text("warmup").await.expect("warmup text");

    // ---- Mouse humanization: timed pass over the fixed workload ----
    let mut mouse_intervals_ms: Vec<f64> = Vec::new();
    let mut mouse_out_events: usize = 0;
    let mut mouse_represented_ms: f64 = 0.0;
    let mut mouse_self_authenticity: f64 = 0.0;

    let mouse_wall = Instant::now();
    for path in &mouse_paths {
        let humanized = mouse
            .humanize_path(path.clone())
            .await
            .expect("mouse humanization succeeds on valid input");
        mouse_out_events += humanized.movements.len();
        mouse_represented_ms += humanized.total_duration.as_secs_f64() * 1_000.0;
        mouse_self_authenticity += humanized.authenticity_score as f64;
        for pair in humanized.movements.windows(2) {
            let d = pair[1]
                .timestamp
                .saturating_sub(pair[0].timestamp)
                .as_secs_f64()
                * 1_000.0;
            mouse_intervals_ms.push(d);
        }
    }
    let mouse_wall_ms = mouse_wall.elapsed().as_secs_f64() * 1_000.0;
    let mouse_stats = interval_stats(&mouse_intervals_ms);

    // ---- Typing humanization: timed pass over the fixed workload ----
    let typing_wall = Instant::now();
    let sequence = typer
        .humanize_text(&typing_text)
        .await
        .expect("typing humanization succeeds on non-empty input");
    let typing_wall_ms = typing_wall.elapsed().as_secs_f64() * 1_000.0;

    let typing_out_keys = sequence.keystrokes.len();
    let typing_represented_ms = sequence.total_duration.as_secs_f64() * 1_000.0;
    let mut typing_intervals_ms: Vec<f64> = Vec::with_capacity(typing_out_keys);
    for pair in sequence.keystrokes.windows(2) {
        let d = pair[1]
            .timestamp
            .saturating_sub(pair[0].timestamp)
            .as_secs_f64()
            * 1_000.0;
        typing_intervals_ms.push(d);
    }
    let typing_stats = interval_stats(&typing_intervals_ms);

    // ---- Peak RSS of this process (VmHWM == getrusage ru_maxrss) ----
    let peak_rss_kb = std::fs::read_to_string("/proc/self/status")
        .ok()
        .and_then(|s| {
            s.lines()
                .find(|l| l.starts_with("VmHWM:"))
                .and_then(|l| l.split_whitespace().nth(1).map(String::from))
        })
        .unwrap_or_else(|| "unavailable".into());

    // ---- Report ----
    let mouse_events_per_sec = mouse_out_events as f64 / (mouse_wall_ms / 1_000.0);
    let mouse_realtime = if mouse_wall_ms > 0.0 {
        mouse_represented_ms / mouse_wall_ms
    } else {
        f64::NAN
    };
    let typing_events_per_sec = typing_out_keys as f64 / (typing_wall_ms / 1_000.0);
    let typing_realtime = if typing_wall_ms > 0.0 {
        typing_represented_ms / typing_wall_ms
    } else {
        f64::NAN
    };

    println!("== aegnt-27 humanization benchmark ==");
    println!("input_seed={:#x} rng=workload-deterministic-library-rng-unseeded", INPUT_SEED);
    println!(
        "mode=mouse input_waypoints={} output_movements={} wall_ms={:.3} events_per_sec={:.1} \
         represented_media_ms={:.1} realtime_factor={:.1} intervals={} \
         interval_mean_ms={:.4} interval_std_ms={:.4} interval_cv={:.4} interval_entropy_bits={:.4} \
         self_reported_authenticity_avg={:.4}",
        MOUSE_PATHS * MOUSE_POINTS_PER_PATH,
        mouse_out_events,
        mouse_wall_ms,
        mouse_events_per_sec,
        mouse_represented_ms,
        mouse_realtime,
        mouse_stats.count,
        mouse_stats.mean_ms,
        mouse_stats.std_ms,
        mouse_stats.cv,
        mouse_stats.entropy_bits,
        mouse_self_authenticity / MOUSE_PATHS as f64,
    );
    println!(
        "mode=typing input_chars={} output_keystrokes={} wall_ms={:.3} events_per_sec={:.1} \
         represented_media_ms={:.1} realtime_factor={:.1} intervals={} \
         interval_mean_ms={:.4} interval_std_ms={:.4} interval_cv={:.4} interval_entropy_bits={:.4} \
         self_reported_authenticity={:.4} actual_wpm={:.1} injected_error_rate={:.4}",
        TYPING_INPUT_CHARS,
        typing_out_keys,
        typing_wall_ms,
        typing_events_per_sec,
        typing_represented_ms,
        typing_realtime,
        typing_stats.count,
        typing_stats.mean_ms,
        typing_stats.std_ms,
        typing_stats.cv,
        typing_stats.entropy_bits,
        sequence.authenticity_score,
        sequence.actual_wpm,
        sequence.error_rate,
    );
    println!("peak_rss_kb={}", peak_rss_kb);
}
