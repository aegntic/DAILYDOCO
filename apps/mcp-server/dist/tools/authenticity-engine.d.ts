/**
 * Authenticity Engine Tool
 * Validates content authenticity and applies human fingerprinting for 95%+ authenticity scores
 */
import { z } from 'zod';
declare const ValidateAuthenticityArgsSchema: z.ZodObject<{
    content_id: z.ZodString;
    content_type: z.ZodEnum<["video", "audio", "text"]>;
    detection_tests: z.ZodOptional<z.ZodArray<z.ZodEnum<["gpt_zero", "originality_ai", "platform_detection"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    content_id: string;
    content_type: "text" | "video" | "audio";
    detection_tests?: ("gpt_zero" | "originality_ai" | "platform_detection")[] | undefined;
}, {
    content_id: string;
    content_type: "text" | "video" | "audio";
    detection_tests?: ("gpt_zero" | "originality_ai" | "platform_detection")[] | undefined;
}>;
declare const ApplyHumanFingerprintArgsSchema: z.ZodObject<{
    content_id: z.ZodString;
    fingerprint_level: z.ZodDefault<z.ZodEnum<["minimal", "moderate", "high", "maximum"]>>;
    components: z.ZodOptional<z.ZodArray<z.ZodEnum<["speech_patterns", "mouse_behavior", "typing_patterns", "error_injection"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    content_id: string;
    fingerprint_level: "maximum" | "moderate" | "minimal" | "high";
    components?: ("speech_patterns" | "mouse_behavior" | "typing_patterns" | "error_injection")[] | undefined;
}, {
    content_id: string;
    fingerprint_level?: "maximum" | "moderate" | "minimal" | "high" | undefined;
    components?: ("speech_patterns" | "mouse_behavior" | "typing_patterns" | "error_injection")[] | undefined;
}>;
export declare class AuthenticityEngine {
    /**
     * Validate content authenticity and AI detection resistance
     */
    validateAuthenticity(args: z.infer<typeof ValidateAuthenticityArgsSchema>): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Apply human authenticity enhancements to content
     */
    applyHumanFingerprint(args: z.infer<typeof ApplyHumanFingerprintArgsSchema>): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    private runAuthenticityValidation;
    private applyFingerprinting;
    private calculateImprovement;
    private generateEnhancementDetails;
}
export {};
//# sourceMappingURL=authenticity-engine.d.ts.map