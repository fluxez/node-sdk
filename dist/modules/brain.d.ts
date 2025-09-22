import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
export interface GenerateAppOptions {
    includeWorkflows?: boolean;
    includeAuth?: boolean;
    includePayments?: boolean;
    complexity?: 'simple' | 'standard' | 'advanced';
    framework?: 'react' | 'flutter' | 'nestjs';
    styling?: 'tailwind' | 'styled-components' | 'material-ui';
    database?: 'postgresql' | 'mysql' | 'mongodb';
    deployment?: 'vercel' | 'aws' | 'docker';
    features?: string[];
}
export interface GeneratedApp {
    id: string;
    name: string;
    description: string;
    appType: string;
    framework: string;
    components: AppComponent[];
    architecture: AppArchitecture;
    workflows?: WorkflowSuggestion[];
    features: string[];
    complexity: string;
    estimatedTime: string;
    techStack: string[];
    files?: GeneratedFile[];
    deployment?: DeploymentConfig;
}
export interface AppComponent {
    id: string;
    name: string;
    type: string;
    description: string;
    props?: Record<string, any>;
    children?: string[];
    dependencies?: string[];
    category: 'layout' | 'form' | 'display' | 'navigation' | 'input' | 'feedback';
}
export interface AppArchitecture {
    pattern: 'mvc' | 'mvvm' | 'clean' | 'modular' | 'microservices';
    layers: ArchitectureLayer[];
    databases: DatabaseLayer[];
    apis: ApiLayer[];
    services: ServiceLayer[];
}
export interface ArchitectureLayer {
    name: string;
    type: 'presentation' | 'business' | 'data' | 'infrastructure';
    components: string[];
    dependencies: string[];
}
export interface DatabaseLayer {
    name: string;
    type: 'primary' | 'cache' | 'search' | 'analytics';
    technology: string;
    purpose: string;
}
export interface ApiLayer {
    name: string;
    method: string;
    endpoint: string;
    description: string;
    authentication: boolean;
}
export interface ServiceLayer {
    name: string;
    type: 'internal' | 'external' | 'third-party';
    description: string;
    dependencies: string[];
}
export interface GeneratedFile {
    path: string;
    content: string;
    type: 'component' | 'service' | 'config' | 'test' | 'documentation';
    dependencies: string[];
}
export interface DeploymentConfig {
    platform: string;
    environment: Record<string, string>;
    scripts: Record<string, string>;
    dockerConfig?: any;
}
export interface WorkflowSuggestion {
    name: string;
    type: string;
    description: string;
    triggers: string[];
    actions: string[];
    priority: 'high' | 'medium' | 'low';
}
export interface PromptUnderstanding {
    appType: string;
    confidence: number;
    features: string[];
    complexity: 'simple' | 'standard' | 'advanced';
    framework: string;
    intents: string[];
    entities: Record<string, any>;
    requirements: string[];
    constraints: string[];
    assumptions: string[];
}
export interface AppPattern {
    id: string;
    name: string;
    description: string;
    appType: string;
    similarity: number;
    components: string[];
    features: string[];
    usageCount: number;
}
export interface BrainTrainingData {
    prompt: string;
    appType: string;
    features: string[];
    components: string[];
    architecture: string;
    outcome: 'success' | 'failure';
    feedback?: string;
    metadata?: Record<string, any>;
}
export interface BrainStats {
    totalGenerations: number;
    successRate: number;
    averageConfidence: number;
    topAppTypes: Array<{
        type: string;
        count: number;
    }>;
    topFeatures: Array<{
        feature: string;
        count: number;
    }>;
    learningProgress: {
        patternsLearned: number;
        accuracy: number;
        lastTraining: string;
    };
    performance: {
        averageGenerationTime: number;
        cacheHitRate: number;
        errorRate: number;
    };
}
export declare class BrainClient {
    private httpClient;
    private config;
    private logger;
    constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger);
    /**
     * Generate a complete app from natural language prompt
     */
    generate(prompt: string, options?: GenerateAppOptions): Promise<GeneratedApp>;
    /**
     * Analyze and understand app requirements from prompt
     */
    understand(prompt: string): Promise<PromptUnderstanding>;
    /**
     * Find similar app patterns using vector search
     */
    findPatterns(query: string, options?: {
        limit?: number;
        threshold?: number;
        appType?: string;
    }): Promise<AppPattern[]>;
    /**
     * Get architecture recommendations for requirements
     */
    suggestArchitecture(requirements: {
        appType: string;
        features: string[];
        scale: 'small' | 'medium' | 'large';
        complexity: 'simple' | 'standard' | 'advanced';
    }): Promise<AppArchitecture>;
    /**
     * Get recommended UI components for app type
     */
    selectComponents(appType: string, options?: {
        framework?: string;
        complexity?: 'simple' | 'standard' | 'advanced';
        features?: string[];
    }): Promise<AppComponent[]>;
    /**
     * Train the brain with new patterns and feedback
     */
    train(trainingData: BrainTrainingData[]): Promise<{
        trained: number;
        accuracy: number;
        patternsLearned: number;
    }>;
    /**
     * Get brain performance metrics and statistics
     */
    getStats(): Promise<BrainStats>;
    /**
     * Generate synthetic training data for pre-launch preparation
     */
    generateTrainingData(options: {
        count: number;
        appTypes?: string[];
        complexity?: ('simple' | 'standard' | 'advanced')[];
    }): Promise<BrainTrainingData[]>;
    /**
     * Validate generated app quality
     */
    validateApp(appData: GeneratedApp): Promise<{
        isValid: boolean;
        score: number;
        issues: Array<{
            severity: 'error' | 'warning' | 'info';
            message: string;
            suggestion?: string;
        }>;
    }>;
    /**
     * Get suggested improvements for an app
     */
    suggestImprovements(appData: GeneratedApp, feedback?: string): Promise<{
        suggestions: Array<{
            category: 'performance' | 'ux' | 'security' | 'features' | 'architecture';
            priority: 'high' | 'medium' | 'low';
            title: string;
            description: string;
            implementation: string;
            impact: string;
        }>;
        estimatedEffort: string;
    }>;
    /**
     * Generate text content using AI
     */
    generateText(prompt: string, options?: any): Promise<any>;
    /**
     * Generate image using AI
     */
    generateImage(prompt: string, options?: any): Promise<any>;
    /**
     * Generate audio from text
     */
    generateAudio(text: string, options?: any): Promise<any>;
    /**
     * Generate video from prompt
     */
    generateVideo(prompt: string, options?: any): Promise<any>;
    /**
     * Generate embeddings for text
     */
    generateEmbeddings(text: string): Promise<number[]>;
    /**
     * Analyze content using AI
     */
    analyzeContent(content: string, analysisType: 'sentiment' | 'readability' | 'seo' | 'engagement' | 'all'): Promise<any>;
}
//# sourceMappingURL=brain.d.ts.map