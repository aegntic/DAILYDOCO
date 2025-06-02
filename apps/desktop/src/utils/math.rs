/*!
 * aegnt-27 - Mathematical Utilities
 * 
 * Mathematical functions for humanization algorithms and curve generation
 */

use rand::Rng;
use serde::{Serialize, Deserialize};
use std::f32::consts::PI;

/// 2D point for mathematical operations
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct Point2D {
    pub x: f32,
    pub y: f32,
}

impl Point2D {
    pub fn new(x: f32, y: f32) -> Self {
        Self { x, y }
    }
    
    pub fn distance_to(&self, other: &Point2D) -> f32 {
        ((self.x - other.x).powi(2) + (self.y - other.y).powi(2)).sqrt()
    }
    
    pub fn angle_to(&self, other: &Point2D) -> f32 {
        (other.y - self.y).atan2(other.x - self.x)
    }
    
    pub fn lerp(&self, other: &Point2D, t: f32) -> Point2D {
        Point2D {
            x: self.x + (other.x - self.x) * t,
            y: self.y + (other.y - self.y) * t,
        }
    }
}

/// Bezier curve implementation for smooth movement paths
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BezierCurve {
    pub start: Point2D,
    pub control1: Point2D,
    pub control2: Point2D,
    pub end: Point2D,
}

impl BezierCurve {
    pub fn new(start: Point2D, control1: Point2D, control2: Point2D, end: Point2D) -> Self {
        Self { start, control1, control2, end }
    }
    
    /// Evaluate the Bezier curve at parameter t (0.0 to 1.0)
    pub fn evaluate(&self, t: f32) -> Point2D {
        let t = t.clamp(0.0, 1.0);
        let one_minus_t = 1.0 - t;
        
        // Cubic Bezier formula: B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
        let x = one_minus_t.powi(3) * self.start.x
            + 3.0 * one_minus_t.powi(2) * t * self.control1.x
            + 3.0 * one_minus_t * t.powi(2) * self.control2.x
            + t.powi(3) * self.end.x;
            
        let y = one_minus_t.powi(3) * self.start.y
            + 3.0 * one_minus_t.powi(2) * t * self.control1.y
            + 3.0 * one_minus_t * t.powi(2) * self.control2.y
            + t.powi(3) * self.end.y;
            
        Point2D::new(x, y)
    }
    
    /// Generate points along the curve
    pub fn generate_points(&self, num_points: usize) -> Vec<Point2D> {
        if num_points < 2 {
            return vec![self.start, self.end];
        }
        
        (0..num_points)
            .map(|i| {
                let t = i as f32 / (num_points - 1) as f32;
                self.evaluate(t)
            })
            .collect()
    }
    
    /// Get the derivative (velocity) at parameter t
    pub fn derivative(&self, t: f32) -> Point2D {
        let t = t.clamp(0.0, 1.0);
        let one_minus_t = 1.0 - t;
        
        // Derivative of cubic Bezier: B'(t) = 3(1-t)²(P₁-P₀) + 6(1-t)t(P₂-P₁) + 3t²(P₃-P₂)
        let dx = 3.0 * one_minus_t.powi(2) * (self.control1.x - self.start.x)
            + 6.0 * one_minus_t * t * (self.control2.x - self.control1.x)
            + 3.0 * t.powi(2) * (self.end.x - self.control2.x);
            
        let dy = 3.0 * one_minus_t.powi(2) * (self.control1.y - self.start.y)
            + 6.0 * one_minus_t * t * (self.control2.y - self.control1.y)
            + 3.0 * t.powi(2) * (self.end.y - self.control2.y);
            
        Point2D::new(dx, dy)
    }
}

/// Generate a Bezier curve between two points with natural control points
pub fn bezier_curve(start: Point2D, end: Point2D, curvature: f32, randomness: f32) -> BezierCurve {
    let mut rng = rand::thread_rng();
    
    let distance = start.distance_to(&end);
    let angle = start.angle_to(&end);
    
    // Generate control points with some randomness for natural feel
    let control_distance = distance * curvature * (0.2 + rng.gen::<f32>() * 0.3);
    let angle_offset1 = (rng.gen::<f32>() - 0.5) * randomness * PI / 4.0;
    let angle_offset2 = (rng.gen::<f32>() - 0.5) * randomness * PI / 4.0;
    
    let control1 = Point2D::new(
        start.x + control_distance * (angle + angle_offset1).cos(),
        start.y + control_distance * (angle + angle_offset1).sin(),
    );
    
    let control2 = Point2D::new(
        end.x - control_distance * (angle + PI + angle_offset2).cos(),
        end.y - control_distance * (angle + PI + angle_offset2).sin(),
    );
    
    BezierCurve::new(start, control1, control2, end)
}

/// Linear interpolation between two values
pub fn interpolate(start: f32, end: f32, t: f32) -> f32 {
    start + (end - start) * t.clamp(0.0, 1.0)
}

/// Smooth step interpolation (S-curve)
pub fn smooth_step(start: f32, end: f32, t: f32) -> f32 {
    let t = t.clamp(0.0, 1.0);
    let smooth_t = t * t * (3.0 - 2.0 * t);
    interpolate(start, end, smooth_t)
}

/// Smoother step interpolation (improved S-curve)
pub fn smoother_step(start: f32, end: f32, t: f32) -> f32 {
    let t = t.clamp(0.0, 1.0);
    let smooth_t = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
    interpolate(start, end, smooth_t)
}

/// Normalize value to range [0, 1]
pub fn normalize_value(value: f32, min: f32, max: f32) -> f32 {
    if max <= min {
        return 0.0;
    }
    ((value - min) / (max - min)).clamp(0.0, 1.0)
}

/// Generate random value with Gaussian (normal) distribution
pub fn random_gaussian(mean: f32, std_dev: f32) -> f32 {
    use rand_distr::{Distribution, Normal};
    let normal = Normal::new(mean, std_dev).unwrap_or_else(|_| Normal::new(0.0, 1.0).unwrap());
    normal.sample(&mut rand::thread_rng())
}

/// Generate random value with exponential distribution
pub fn random_exponential(lambda: f32) -> f32 {
    use rand_distr::{Distribution, Exp};
    let exp = Exp::new(lambda).unwrap_or_else(|_| Exp::new(1.0).unwrap());
    exp.sample(&mut rand::thread_rng())
}

/// Perlin noise-like function for natural variation
pub fn perlin_noise_1d(x: f32, frequency: f32, amplitude: f32) -> f32 {
    let scaled_x = x * frequency;
    let int_x = scaled_x.floor() as i32;
    let frac_x = scaled_x - int_x as f32;
    
    // Simple hash function for pseudo-random values
    let hash = |n: i32| -> f32 {
        let n = n.wrapping_mul(1597334677).wrapping_add(12345);
        let n = (n >> 16) ^ n;
        let n = n.wrapping_mul(0x45d9f3b);
        let n = (n >> 16) ^ n;
        ((n & 0x7fff) as f32 / 32767.0 - 0.5) * 2.0
    };
    
    let a = hash(int_x);
    let b = hash(int_x + 1);
    
    // Smooth interpolation
    let smooth_frac = frac_x * frac_x * (3.0 - 2.0 * frac_x);
    let noise = interpolate(a, b, smooth_frac);
    
    noise * amplitude
}

/// Apply jitter to a value with specified intensity
pub fn apply_jitter(value: f32, intensity: f32) -> f32 {
    let mut rng = rand::thread_rng();
    let jitter = (rng.gen::<f32>() - 0.5) * 2.0 * intensity;
    value + jitter
}

/// Calculate ease-in-out curve
pub fn ease_in_out(t: f32) -> f32 {
    let t = t.clamp(0.0, 1.0);
    if t < 0.5 {
        2.0 * t * t
    } else {
        -1.0 + (4.0 - 2.0 * t) * t
    }
}

/// Calculate bounce curve for overshoot effects
pub fn bounce_curve(t: f32, bounce_intensity: f32) -> f32 {
    let t = t.clamp(0.0, 1.0);
    let bounce = (-7.5625 * t * t + 10.75 * t).max(0.0) * bounce_intensity;
    t + bounce * (1.0 - t)
}

/// Generate natural acceleration curve
pub fn natural_acceleration(t: f32, acceleration_factor: f32) -> f32 {
    let t = t.clamp(0.0, 1.0);
    let exp_factor = 1.0 + acceleration_factor;
    (t.powf(exp_factor) + t) / 2.0
}

/// Statistical functions for analysis
pub struct Statistics {
    pub mean: f32,
    pub variance: f32,
    pub std_dev: f32,
    pub min: f32,
    pub max: f32,
    pub median: f32,
}

impl Statistics {
    pub fn from_values(values: &[f32]) -> Option<Self> {
        if values.is_empty() {
            return None;
        }
        
        let mut sorted_values = values.to_vec();
        sorted_values.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
        
        let min = sorted_values[0];
        let max = sorted_values[sorted_values.len() - 1];
        let median = if sorted_values.len() % 2 == 0 {
            (sorted_values[sorted_values.len() / 2 - 1] + sorted_values[sorted_values.len() / 2]) / 2.0
        } else {
            sorted_values[sorted_values.len() / 2]
        };
        
        let mean = values.iter().sum::<f32>() / values.len() as f32;
        let variance = values.iter()
            .map(|x| (x - mean).powi(2))
            .sum::<f32>() / values.len() as f32;
        let std_dev = variance.sqrt();
        
        Some(Statistics {
            mean,
            variance,
            std_dev,
            min,
            max,
            median,
        })
    }
}

/// Frequency analysis for pattern detection
pub fn analyze_frequency_pattern(values: &[f32], sample_rate: f32) -> Vec<f32> {
    // Simple FFT-like analysis for detecting patterns
    // This is a simplified version - in production, use a proper FFT library
    let n = values.len();
    let mut frequencies = Vec::new();
    
    for k in 0..n/2 {
        let mut real = 0.0;
        let mut imag = 0.0;
        
        for i in 0..n {
            let angle = -2.0 * PI * k as f32 * i as f32 / n as f32;
            real += values[i] * angle.cos();
            imag += values[i] * angle.sin();
        }
        
        let magnitude = (real * real + imag * imag).sqrt() / n as f32;
        frequencies.push(magnitude);
    }
    
    frequencies
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_point2d_operations() {
        let p1 = Point2D::new(0.0, 0.0);
        let p2 = Point2D::new(3.0, 4.0);
        
        assert_eq!(p1.distance_to(&p2), 5.0);
        
        let lerp_point = p1.lerp(&p2, 0.5);
        assert_eq!(lerp_point, Point2D::new(1.5, 2.0));
    }

    #[test]
    fn test_bezier_curve() {
        let start = Point2D::new(0.0, 0.0);
        let end = Point2D::new(10.0, 10.0);
        let control1 = Point2D::new(3.0, 0.0);
        let control2 = Point2D::new(7.0, 10.0);
        
        let curve = BezierCurve::new(start, control1, control2, end);
        
        assert_eq!(curve.evaluate(0.0), start);
        assert_eq!(curve.evaluate(1.0), end);
        
        let points = curve.generate_points(5);
        assert_eq!(points.len(), 5);
        assert_eq!(points[0], start);
        assert_eq!(points[4], end);
    }

    #[test]
    fn test_interpolation_functions() {
        assert_eq!(interpolate(0.0, 10.0, 0.5), 5.0);
        assert_eq!(interpolate(0.0, 10.0, 0.0), 0.0);
        assert_eq!(interpolate(0.0, 10.0, 1.0), 10.0);
        
        let smooth = smooth_step(0.0, 10.0, 0.5);
        assert!(smooth > 4.0 && smooth < 6.0);
    }

    #[test]
    fn test_normalize_value() {
        assert_eq!(normalize_value(5.0, 0.0, 10.0), 0.5);
        assert_eq!(normalize_value(-5.0, 0.0, 10.0), 0.0);
        assert_eq!(normalize_value(15.0, 0.0, 10.0), 1.0);
    }

    #[test]
    fn test_statistics() {
        let values = vec![1.0, 2.0, 3.0, 4.0, 5.0];
        let stats = Statistics::from_values(&values).unwrap();
        
        assert_eq!(stats.mean, 3.0);
        assert_eq!(stats.min, 1.0);
        assert_eq!(stats.max, 5.0);
        assert_eq!(stats.median, 3.0);
    }

    #[test]
    fn test_perlin_noise() {
        let noise1 = perlin_noise_1d(0.0, 1.0, 1.0);
        let noise2 = perlin_noise_1d(0.0, 1.0, 1.0);
        
        // Should be deterministic
        assert_eq!(noise1, noise2);
        
        // Should be in reasonable range
        assert!(noise1 >= -1.0 && noise1 <= 1.0);
    }

    #[test]
    fn test_easing_functions() {
        assert_eq!(ease_in_out(0.0), 0.0);
        assert_eq!(ease_in_out(1.0), 1.0);
        
        let mid = ease_in_out(0.5);
        assert!(mid > 0.4 && mid < 0.6);
    }
}