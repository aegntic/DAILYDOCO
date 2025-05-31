/**
 * Performance Monitor Tool
 * Tracks system performance and ensures elite performance standards
 */
import { z } from 'zod';
import { EventEmitter } from 'events';
declare const GetSystemMetricsArgsSchema: z.ZodObject<{
    include_ai_metrics: z.ZodDefault<z.ZodBoolean>;
    include_capture_metrics: z.ZodDefault<z.ZodBoolean>;
    time_range: z.ZodDefault<z.ZodEnum<["1m", "5m", "15m", "1h"]>>;
}, "strip", z.ZodTypeAny, {
    include_ai_metrics: boolean;
    include_capture_metrics: boolean;
    time_range: "1m" | "5m" | "15m" | "1h";
}, {
    include_ai_metrics?: boolean | undefined;
    include_capture_metrics?: boolean | undefined;
    time_range?: "1m" | "5m" | "15m" | "1h" | undefined;
}>;
declare const RunBenchmarkArgsSchema: z.ZodObject<{
    benchmark_type: z.ZodDefault<z.ZodEnum<["capture", "ai", "video_processing", "full_system"]>>;
    duration: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    benchmark_type: "capture" | "ai" | "video_processing" | "full_system";
    duration: number;
}, {
    benchmark_type?: "capture" | "ai" | "video_processing" | "full_system" | undefined;
    duration?: number | undefined;
}>;
export declare class PerformanceMonitor extends EventEmitter {
    private isMonitoring;
    private metricsHistory;
    private benchmarkHistory;
    /**
     * Get real-time system performance metrics
     */
    getSystemMetrics(args: z.infer<typeof GetSystemMetricsArgsSchema>): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Run comprehensive performance benchmark
     */
    runBenchmark(args: z.infer<typeof RunBenchmarkArgsSchema>): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    private collectCurrentMetrics;
    private getHistoricalMetrics;
    private analyzePerformanceTrends;
    private executeBenchmark;
    private generateBenchmarkScores;
    private generateDetailedMetrics;
    private analyzeBenchmarkResults;
    private generateComparison;
    private getStatusEmoji;
    private calculateOverallHealth;
    cleanup(): Promise<void>;
}
export {};
//# sourceMappingURL=performance-monitor.d.ts.map