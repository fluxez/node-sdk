import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import { ApiResponse } from '../types';

// Brain/AI Types
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
  topAppTypes: Array<{ type: string; count: number }>;
  topFeatures: Array<{ feature: string; count: number }>;
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

export class BrainClient {
  private httpClient: AxiosInstance;
  private config: FluxezConfig;
  private logger: Logger;

  constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger) {
    this.httpClient = httpClient;
    this.config = config;
    this.logger = logger;
  }

  /**
   * Generate a complete app from natural language prompt
   */
  async generate(prompt: string, options: GenerateAppOptions = {}): Promise<GeneratedApp> {
    try {
      this.logger.debug('Generating app from prompt', { prompt, options });

      const generateData = {
        prompt,
        options: {
          includeWorkflows: options.includeWorkflows || false,
          includeAuth: options.includeAuth || true,
          includePayments: options.includePayments || false,
          complexity: options.complexity || 'standard',
          framework: options.framework || 'react',
          styling: options.styling || 'tailwind',
          database: options.database || 'postgresql',
          deployment: options.deployment || 'vercel',
          features: options.features || [],
          ...options,
        },
      };

      const response = await this.httpClient.post<ApiResponse<GeneratedApp>>(
        '/brain/generate',
        generateData
      );

      this.logger.debug('App generated successfully', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to generate app', error);
      throw error;
    }
  }

  /**
   * Analyze and understand app requirements from prompt
   */
  async understand(prompt: string): Promise<PromptUnderstanding> {
    try {
      this.logger.debug('Understanding prompt', { prompt });

      const response = await this.httpClient.post<ApiResponse<PromptUnderstanding>>(
        '/brain/understand',
        { prompt }
      );

      this.logger.debug('Prompt understanding completed', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to understand prompt', error);
      throw error;
    }
  }

  /**
   * Find similar app patterns using vector search
   */
  async findPatterns(query: string, options: {
    limit?: number;
    threshold?: number;
    appType?: string;
  } = {}): Promise<AppPattern[]> {
    try {
      this.logger.debug('Finding similar patterns', { query, options });

      const searchData = {
        query,
        limit: options.limit || 10,
        threshold: options.threshold || 0.7,
        appType: options.appType,
      };

      const response = await this.httpClient.post<ApiResponse<AppPattern[]>>(
        '/brain/patterns',
        searchData
      );

      this.logger.debug('Pattern search completed', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to find patterns', error);
      throw error;
    }
  }

  /**
   * Get architecture recommendations for requirements
   */
  async suggestArchitecture(requirements: {
    appType: string;
    features: string[];
    scale: 'small' | 'medium' | 'large';
    complexity: 'simple' | 'standard' | 'advanced';
  }): Promise<AppArchitecture> {
    try {
      this.logger.debug('Suggesting architecture', { requirements });

      const response = await this.httpClient.post<ApiResponse<AppArchitecture>>(
        '/brain/architecture',
        requirements
      );

      this.logger.debug('Architecture suggestion completed', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to suggest architecture', error);
      throw error;
    }
  }

  /**
   * Get recommended UI components for app type
   */
  async selectComponents(appType: string, options: {
    framework?: string;
    complexity?: 'simple' | 'standard' | 'advanced';
    features?: string[];
  } = {}): Promise<AppComponent[]> {
    try {
      this.logger.debug('Selecting components', { appType, options });

      const selectionData = {
        appType,
        framework: options.framework || 'react',
        complexity: options.complexity || 'standard',
        features: options.features || [],
      };

      const response = await this.httpClient.post<ApiResponse<AppComponent[]>>(
        '/brain/components',
        selectionData
      );

      this.logger.debug('Component selection completed', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to select components', error);
      throw error;
    }
  }

  /**
   * Train the brain with new patterns and feedback
   */
  async train(trainingData: BrainTrainingData[]): Promise<{
    trained: number;
    accuracy: number;
    patternsLearned: number;
  }> {
    try {
      this.logger.debug('Training brain with new data', { count: trainingData.length });

      const response = await this.httpClient.post<ApiResponse<{
        trained: number;
        accuracy: number;
        patternsLearned: number;
      }>>(
        '/brain/train',
        { trainingData }
      );

      this.logger.debug('Brain training completed', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to train brain', error);
      throw error;
    }
  }

  /**
   * Get brain performance metrics and statistics
   */
  async getStats(): Promise<BrainStats> {
    try {
      this.logger.debug('Getting brain stats');

      const response = await this.httpClient.get<ApiResponse<BrainStats>>('/brain/stats');

      this.logger.debug('Brain stats retrieved', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get brain stats', error);
      throw error;
    }
  }

  /**
   * Generate synthetic training data for pre-launch preparation
   */
  async generateTrainingData(options: {
    count: number;
    appTypes?: string[];
    complexity?: ('simple' | 'standard' | 'advanced')[];
  }): Promise<BrainTrainingData[]> {
    try {
      this.logger.debug('Generating synthetic training data', { options });

      const response = await this.httpClient.post<ApiResponse<BrainTrainingData[]>>(
        '/brain/training-data/generate',
        options
      );

      this.logger.debug('Synthetic training data generated', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to generate training data', error);
      throw error;
    }
  }

  /**
   * Validate generated app quality
   */
  async validateApp(appData: GeneratedApp): Promise<{
    isValid: boolean;
    score: number;
    issues: Array<{
      severity: 'error' | 'warning' | 'info';
      message: string;
      suggestion?: string;
    }>;
  }> {
    try {
      this.logger.debug('Validating generated app', { appId: appData.id });

      const response = await this.httpClient.post<ApiResponse<{
        isValid: boolean;
        score: number;
        issues: Array<{
          severity: 'error' | 'warning' | 'info';
          message: string;
          suggestion?: string;
        }>;
      }>>(
        '/brain/validate',
        { appData }
      );

      this.logger.debug('App validation completed', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to validate app', error);
      throw error;
    }
  }

  /**
   * Get suggested improvements for an app
   */
  async suggestImprovements(appData: GeneratedApp, feedback?: string): Promise<{
    suggestions: Array<{
      category: 'performance' | 'ux' | 'security' | 'features' | 'architecture';
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      implementation: string;
      impact: string;
    }>;
    estimatedEffort: string;
  }> {
    try {
      this.logger.debug('Getting improvement suggestions', { appId: appData.id });

      const response = await this.httpClient.post<ApiResponse<{
        suggestions: Array<{
          category: 'performance' | 'ux' | 'security' | 'features' | 'architecture';
          priority: 'high' | 'medium' | 'low';
          title: string;
          description: string;
          implementation: string;
          impact: string;
        }>;
        estimatedEffort: string;
      }>>(
        '/brain/improvements',
        { appData, feedback }
      );

      this.logger.debug('Improvement suggestions retrieved', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get improvement suggestions', error);
      throw error;
    }
  }

  /**
   * Generate text content using AI
   */
  async generateText(prompt: string, options?: any): Promise<any> {
    try {
      this.logger.debug('Generating text', { prompt, options });
      
      const response = await this.httpClient.post<ApiResponse<any>>(
        '/brain/text/generate',
        { prompt, ...options }
      );
      
      this.logger.debug('Text generated successfully', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to generate text', error);
      throw error;
    }
  }

  /**
   * Generate image using AI
   */
  async generateImage(prompt: string, options?: any): Promise<any> {
    try {
      this.logger.debug('Generating image', { prompt, options });
      
      const response = await this.httpClient.post<ApiResponse<any>>(
        '/brain/image/generate',
        { prompt, ...options }
      );
      
      this.logger.debug('Image generated successfully', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to generate image', error);
      throw error;
    }
  }

  /**
   * Generate audio from text
   */
  async generateAudio(text: string, options?: any): Promise<any> {
    try {
      this.logger.debug('Generating audio', { text, options });
      
      const response = await this.httpClient.post<ApiResponse<any>>(
        '/brain/audio/generate',
        { text, ...options }
      );
      
      this.logger.debug('Audio generated successfully', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to generate audio', error);
      throw error;
    }
  }

  /**
   * Generate video from prompt
   */
  async generateVideo(prompt: string, options?: any): Promise<any> {
    try {
      this.logger.debug('Generating video', { prompt, options });
      
      const response = await this.httpClient.post<ApiResponse<any>>(
        '/brain/video/generate',
        { prompt, ...options }
      );
      
      this.logger.debug('Video generated successfully', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to generate video', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for text
   */
  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      this.logger.debug('Generating embeddings', { text });
      
      const response = await this.httpClient.post<ApiResponse<{ embeddings: number[] }>>(
        '/brain/embeddings/generate',
        { text }
      );
      
      this.logger.debug('Embeddings generated successfully');
      return response.data.data.embeddings;
    } catch (error) {
      this.logger.error('Failed to generate embeddings', error);
      throw error;
    }
  }

  /**
   * Analyze content using AI
   */
  async analyzeContent(content: string, analysisType: 'sentiment' | 'readability' | 'seo' | 'engagement' | 'all'): Promise<any> {
    try {
      this.logger.debug('Analyzing content', { analysisType });
      
      const response = await this.httpClient.post<ApiResponse<any>>(
        '/brain/analyze/content',
        { content, analysisType }
      );
      
      this.logger.debug('Content analysis completed', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to analyze content', error);
      throw error;
    }
  }
}