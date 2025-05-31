/**
 * Personal Brand Manager Tool
 * Learns and adapts to user's unique style and audience preferences
 */
import { z } from 'zod';
declare const AnalyzeBrandPerformanceArgsSchema: z.ZodObject<{
    user_id: z.ZodString;
    time_period: z.ZodDefault<z.ZodEnum<["week", "month", "quarter", "year"]>>;
    include_predictions: z.ZodDefault<z.ZodBoolean>;
    competitive_analysis: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    user_id: string;
    time_period: "week" | "month" | "quarter" | "year";
    include_predictions: boolean;
    competitive_analysis: boolean;
}, {
    user_id: string;
    time_period?: "week" | "month" | "quarter" | "year" | undefined;
    include_predictions?: boolean | undefined;
    competitive_analysis?: boolean | undefined;
}>;
declare const GetBrandRecommendationsArgsSchema: z.ZodObject<{
    user_id: z.ZodString;
    focus_areas: z.ZodOptional<z.ZodArray<z.ZodEnum<["content", "audience", "platform", "growth"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    user_id: string;
    focus_areas?: ("platform" | "content" | "audience" | "growth")[] | undefined;
}, {
    user_id: string;
    focus_areas?: ("platform" | "content" | "audience" | "growth")[] | undefined;
}>;
declare const LearnFromPerformanceArgsSchema: z.ZodObject<{
    user_id: z.ZodString;
    video_id: z.ZodString;
    real_metrics: z.ZodObject<{
        views: z.ZodNumber;
        engagement_rate: z.ZodNumber;
        retention_rate: z.ZodNumber;
        shares: z.ZodNumber;
        comments: z.ZodNumber;
        completion_rate: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        views: number;
        engagement_rate: number;
        retention_rate: number;
        shares: number;
        comments: number;
        completion_rate: number;
    }, {
        views: number;
        engagement_rate: number;
        retention_rate: number;
        shares: number;
        comments: number;
        completion_rate: number;
    }>;
    platform: z.ZodString;
}, "strip", z.ZodTypeAny, {
    video_id: string;
    platform: string;
    user_id: string;
    real_metrics: {
        views: number;
        engagement_rate: number;
        retention_rate: number;
        shares: number;
        comments: number;
        completion_rate: number;
    };
}, {
    video_id: string;
    platform: string;
    user_id: string;
    real_metrics: {
        views: number;
        engagement_rate: number;
        retention_rate: number;
        shares: number;
        comments: number;
        completion_rate: number;
    };
}>;
export declare class PersonalBrandManager {
    /**
     * Analyze personal brand evolution and performance
     */
    analyzeBrandPerformance(args: z.infer<typeof AnalyzeBrandPerformanceArgsSchema>): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Get AI-powered brand optimization recommendations
     */
    getBrandRecommendations(args: z.infer<typeof GetBrandRecommendationsArgsSchema>): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Update brand model with new performance data
     */
    learnFromPerformance(args: z.infer<typeof LearnFromPerformanceArgsSchema>): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Get workflow optimization suggestions
     */
    optimizeWorkflow(args: {
        user_id: string;
        workflow_type?: string;
    }): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    private generateBrandAnalysis;
    private generateRecommendations;
    private processPerformanceData;
    private generateWorkflowOptimization;
}
export {};
//# sourceMappingURL=personal-brand.d.ts.map