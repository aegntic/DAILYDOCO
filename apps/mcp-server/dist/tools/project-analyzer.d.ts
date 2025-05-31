/**
 * Project Analyzer Tool
 * Provides intelligent project analysis and documentation opportunity detection
 */
import { z } from 'zod';
declare const AnalyzeProjectArgsSchema: z.ZodObject<{
    path: z.ZodString;
    include_git_analysis: z.ZodDefault<z.ZodBoolean>;
    detect_complexity: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    path: string;
    include_git_analysis: boolean;
    detect_complexity: boolean;
}, {
    path: string;
    include_git_analysis?: boolean | undefined;
    detect_complexity?: boolean | undefined;
}>;
export declare class ProjectAnalyzer {
    /**
     * Analyze a project and identify documentation opportunities
     */
    analyzeProject(args: z.infer<typeof AnalyzeProjectArgsSchema>): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Get AI-powered insights about documentation opportunities
     */
    getProjectInsights(args: {
        project_path: string;
        analysis_depth?: string;
    }): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    private analyzeProjectStructure;
    private analyzeLanguagesAndFrameworks;
    private analyzeDependencies;
    private analyzeExistingDocumentation;
    private analyzeGitHistory;
    private calculateComplexity;
    private detectDocumentationOpportunities;
    private generateRecommendations;
    private calculateDocumentationCoverage;
    private generateInsights;
}
export {};
//# sourceMappingURL=project-analyzer.d.ts.map