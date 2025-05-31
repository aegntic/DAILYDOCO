/**
 * Video Compiler Tool
 * Handles intelligent video compilation with AI optimization and professional quality
 */
import { z } from 'zod';
import { EventEmitter } from 'events';
declare const CompileVideoArgsSchema: z.ZodObject<{
    capture_session_id: z.ZodString;
    template: z.ZodDefault<z.ZodEnum<["quick_demo", "tutorial", "deep_dive", "bug_fix", "custom"]>>;
    ai_narration: z.ZodDefault<z.ZodBoolean>;
    personal_branding: z.ZodDefault<z.ZodBoolean>;
    quality_preset: z.ZodDefault<z.ZodEnum<["draft", "standard", "high", "broadcast"]>>;
    target_duration: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    capture_session_id: string;
    template: "custom" | "quick_demo" | "tutorial" | "deep_dive" | "bug_fix";
    ai_narration: boolean;
    personal_branding: boolean;
    quality_preset: "standard" | "high" | "draft" | "broadcast";
    target_duration?: number | undefined;
}, {
    capture_session_id: string;
    template?: "custom" | "quick_demo" | "tutorial" | "deep_dive" | "bug_fix" | undefined;
    ai_narration?: boolean | undefined;
    personal_branding?: boolean | undefined;
    quality_preset?: "standard" | "high" | "draft" | "broadcast" | undefined;
    target_duration?: number | undefined;
}>;
declare const GetCompilationStatusArgsSchema: z.ZodObject<{
    compilation_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    compilation_id: string;
}, {
    compilation_id: string;
}>;
export declare class VideoCompiler extends EventEmitter {
    private activeCompilations;
    private compilationHistory;
    /**
     * Compile video with AI optimization and professional quality
     */
    compileVideo(args: z.infer<typeof CompileVideoArgsSchema>): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Get video compilation progress and status
     */
    getCompilationStatus(args: z.infer<typeof GetCompilationStatusArgsSchema>): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    private processCompilation;
    private updateStage;
    private calculateOverallProgress;
    private completeCompilation;
    private calculateEstimatedCompletion;
    private simulateProcessing;
    cleanup(): Promise<void>;
}
export {};
//# sourceMappingURL=video-compiler.d.ts.map