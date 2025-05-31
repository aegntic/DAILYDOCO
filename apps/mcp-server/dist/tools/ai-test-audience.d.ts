/**
 * AI Test Audience Tool
 * Simulates 50-100 synthetic viewers to predict video performance
 */
import { z } from 'zod';
declare const RunTestAudienceArgsSchema: z.ZodObject<{
    video_id: z.ZodString;
    audience_size: z.ZodDefault<z.ZodNumber>;
    persona_distribution: z.ZodOptional<z.ZodObject<{
        junior_developer: z.ZodOptional<z.ZodNumber>;
        senior_developer: z.ZodOptional<z.ZodNumber>;
        tech_lead: z.ZodOptional<z.ZodNumber>;
        product_manager: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        junior_developer?: number | undefined;
        senior_developer?: number | undefined;
        tech_lead?: number | undefined;
        product_manager?: number | undefined;
    }, {
        junior_developer?: number | undefined;
        senior_developer?: number | undefined;
        tech_lead?: number | undefined;
        product_manager?: number | undefined;
    }>>;
    optimization_focus: z.ZodOptional<z.ZodArray<z.ZodEnum<["engagement", "retention", "comprehension", "virality"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    video_id: string;
    audience_size: number;
    persona_distribution?: {
        junior_developer?: number | undefined;
        senior_developer?: number | undefined;
        tech_lead?: number | undefined;
        product_manager?: number | undefined;
    } | undefined;
    optimization_focus?: ("engagement" | "retention" | "comprehension" | "virality")[] | undefined;
}, {
    video_id: string;
    audience_size?: number | undefined;
    persona_distribution?: {
        junior_developer?: number | undefined;
        senior_developer?: number | undefined;
        tech_lead?: number | undefined;
        product_manager?: number | undefined;
    } | undefined;
    optimization_focus?: ("engagement" | "retention" | "comprehension" | "virality")[] | undefined;
}>;
declare const GeneratePersonasArgsSchema: z.ZodObject<{
    count: z.ZodNumber;
    target_niche: z.ZodOptional<z.ZodString>;
    experience_levels: z.ZodOptional<z.ZodArray<z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    count: number;
    target_niche?: string | undefined;
    experience_levels?: ("beginner" | "intermediate" | "advanced" | "expert")[] | undefined;
}, {
    count: number;
    target_niche?: string | undefined;
    experience_levels?: ("beginner" | "intermediate" | "advanced" | "expert")[] | undefined;
}>;
export declare class AITestAudience {
    /**
     * Run comprehensive AI test audience simulation
     */
    runTestAudience(args: z.infer<typeof RunTestAudienceArgsSchema>): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Generate synthetic viewer personas
     */
    generatePersonas(args: z.infer<typeof GeneratePersonasArgsSchema>): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    private simulateTestAudience;
    private generatePersonaBreakdown;
    private generatePersonaData;
    private calculateEngagementMetrics;
    private generateOptimizationInsights;
    private generatePlatformPredictions;
    private createSyntheticPersonas;
    private generateInterests;
    private generateSkipTriggers;
    private generateEngagementStyle;
}
export {};
//# sourceMappingURL=ai-test-audience.d.ts.map