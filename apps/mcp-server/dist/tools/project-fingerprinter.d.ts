/**
 * Project Fingerprinter Tool
 * Generates unique project fingerprints with 99%+ technology stack detection accuracy
 */
import { z } from 'zod';
declare const FingerprintProjectArgsSchema: z.ZodObject<{
    path: z.ZodString;
    deep_analysis: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    path: string;
    deep_analysis: boolean;
}, {
    path: string;
    deep_analysis?: boolean | undefined;
}>;
export declare class ProjectFingerprinter {
    /**
     * Generate comprehensive project fingerprint with technology detection
     */
    fingerprintProject(args: z.infer<typeof FingerprintProjectArgsSchema>): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    private analyzeFileStructure;
    private detectTechnologyStack;
    private detectJavaScriptFrameworks;
    private detectPythonFrameworks;
    private detectDatabases;
    private detectToolsAndServices;
    private detectDevOpsTools;
    private detectFrameworksByFiles;
    private analyzeDependencies;
    private assessQualityIndicators;
    private analyzeDevelopmentInsights;
    private determineProjectCharacteristics;
    private identifyDocumentationOpportunities;
    private calculateConfidenceScore;
    private generateFingerprintId;
    private getLanguageFromExtension;
}
export {};
//# sourceMappingURL=project-fingerprinter.d.ts.map