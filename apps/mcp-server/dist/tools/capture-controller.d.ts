/**
 * Capture Controller Tool
 * Manages intelligent video capture with predictive moment detection
 */
import { z } from 'zod';
import { EventEmitter } from 'events';
declare const StartCaptureArgsSchema: z.ZodObject<{
    project_path: z.ZodString;
    quality: z.ZodDefault<z.ZodEnum<["720p", "1080p", "1440p", "4K"]>>;
    capture_audio: z.ZodDefault<z.ZodBoolean>;
    ai_optimization: z.ZodDefault<z.ZodBoolean>;
    privacy_filters: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    project_path: string;
    quality: "720p" | "1080p" | "1440p" | "4K";
    capture_audio: boolean;
    ai_optimization: boolean;
    privacy_filters: boolean;
}, {
    project_path: string;
    quality?: "720p" | "1080p" | "1440p" | "4K" | undefined;
    capture_audio?: boolean | undefined;
    ai_optimization?: boolean | undefined;
    privacy_filters?: boolean | undefined;
}>;
declare const StopCaptureArgsSchema: z.ZodObject<{
    auto_compile: z.ZodDefault<z.ZodBoolean>;
    run_test_audience: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    auto_compile: boolean;
    run_test_audience: boolean;
}, {
    auto_compile?: boolean | undefined;
    run_test_audience?: boolean | undefined;
}>;
export declare class CaptureController extends EventEmitter {
    private currentSession;
    private isInitialized;
    /**
     * Start intelligent video capture
     */
    startCapture(args: z.infer<typeof StartCaptureArgsSchema>): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Stop video capture and begin processing
     */
    stopCapture(args: z.infer<typeof StopCaptureArgsSchema>): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Get real-time capture status and metrics
     */
    getCaptureStatus(): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    private initializeCaptureEngine;
    private startScreenCapture;
    private stopScreenCapture;
    private enableAIOptimization;
    private enablePrivacyFilters;
    cleanup(): Promise<void>;
}
export {};
//# sourceMappingURL=capture-controller.d.ts.map