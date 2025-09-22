import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import { ApiResponse, WorkflowDefinition, WorkflowExecution, ConnectorConfig, ConnectorMetadata } from '../types';

// Extended Workflow Types
export interface WorkflowListOptions {
  status?: 'active' | 'inactive' | 'draft';
  category?: string;
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'executionCount';
  sortOrder?: 'asc' | 'desc';
}

export interface WorkflowExecutionOptions {
  input?: Record<string, any>;
  context?: Record<string, any>;
  timeout?: number;
  async?: boolean;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  tags: string[];
  definition: WorkflowDefinition;
  usageCount: number;
  rating: number;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedTime: string;
}

export interface WorkflowStats {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  mostUsedConnectors: Array<{
    connector: string;
    count: number;
  }>;
  recentExecutions: WorkflowExecution[];
}

export interface GenerateWorkflowOptions {
  category?: string;
  complexity?: 'simple' | 'medium' | 'complex';
  includeErrorHandling?: boolean;
  includeNotifications?: boolean;
  connectorPreferences?: string[];
  timeout?: number;
}

export interface WorkflowAnalysis {
  appType: string;
  suggestedWorkflows: Array<{
    name: string;
    type: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    estimatedSetupTime: string;
    connectors: string[];
    triggers: string[];
    benefits: string[];
  }>;
  automationOpportunities: Array<{
    process: string;
    description: string;
    timesSaved: string;
    complexity: 'simple' | 'medium' | 'complex';
  }>;
  requiredConnectors: Array<{
    type: string;
    purpose: string;
    priority: 'required' | 'recommended' | 'optional';
  }>;
}

export interface ConnectorTestResult {
  success: boolean;
  responseTime: number;
  status: string;
  data?: any;
  error?: string;
  suggestions?: string[];
}

export interface WorkflowValidation {
  isValid: boolean;
  errors: Array<{
    severity: 'error' | 'warning';
    message: string;
    stepId?: string;
    suggestion?: string;
  }>;
  warnings: Array<{
    message: string;
    stepId?: string;
    impact: 'low' | 'medium' | 'high';
  }>;
  performance: {
    estimatedExecutionTime: string;
    complexity: 'simple' | 'medium' | 'complex';
    resourceUsage: 'low' | 'medium' | 'high';
  };
}

export class WorkflowClient {
  private httpClient: AxiosInstance;
  private config: FluxezConfig;
  private logger: Logger;

  constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger) {
    this.httpClient = httpClient;
    this.config = config;
    this.logger = logger;
  }

  /**
   * Create a new workflow from definition
   */
  async create(definition: WorkflowDefinition): Promise<{ id: string; status: string }> {
    try {
      this.logger.debug('Creating workflow', { name: definition.name });

      const response = await this.httpClient.post<ApiResponse<{ id: string; status: string }>>(
        '/workflow/create',
        definition
      );

      this.logger.debug('Workflow created successfully', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to create workflow', error);
      throw error;
    }
  }

  /**
   * Execute a workflow by ID
   */
  async execute(
    workflowId: string, 
    options: WorkflowExecutionOptions = {}
  ): Promise<WorkflowExecution> {
    try {
      this.logger.debug('Executing workflow', { workflowId, options });

      const executionData = {
        workflowId,
        input: options.input || {},
        context: options.context || {},
        timeout: options.timeout || 300000, // 5 minutes default
        async: options.async || false,
      };

      const response = await this.httpClient.post<ApiResponse<WorkflowExecution>>(
        `/workflow/${workflowId}/execute`,
        executionData
      );

      this.logger.debug('Workflow execution started', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to execute workflow', error);
      throw error;
    }
  }

  /**
   * List workflows with filtering options
   */
  async list(options: WorkflowListOptions = {}): Promise<{
    workflows: WorkflowDefinition[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      this.logger.debug('Listing workflows', { options });

      const queryParams = {
        status: options.status,
        category: options.category,
        limit: options.limit || 20,
        offset: options.offset || 0,
        search: options.search,
        sortBy: options.sortBy || 'updatedAt',
        sortOrder: options.sortOrder || 'desc',
      };

      const response = await this.httpClient.get<ApiResponse<{
        workflows: WorkflowDefinition[];
        total: number;
        hasMore: boolean;
      }>>(
        '/workflow/list',
        { params: queryParams }
      );

      this.logger.debug('Workflows listed successfully', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to list workflows', error);
      throw error;
    }
  }

  /**
   * Get workflow details by ID
   */
  async get(workflowId: string): Promise<WorkflowDefinition> {
    try {
      this.logger.debug('Getting workflow details', { workflowId });

      const response = await this.httpClient.get<ApiResponse<WorkflowDefinition>>(
        `/workflow/${workflowId}`
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get workflow', error);
      throw error;
    }
  }

  /**
   * Update workflow definition
   */
  async update(
    workflowId: string, 
    updates: Partial<WorkflowDefinition>
  ): Promise<WorkflowDefinition> {
    try {
      this.logger.debug('Updating workflow', { workflowId, updates });

      const response = await this.httpClient.put<ApiResponse<WorkflowDefinition>>(
        `/workflow/${workflowId}`,
        updates
      );

      this.logger.debug('Workflow updated successfully', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to update workflow', error);
      throw error;
    }
  }

  /**
   * Delete workflow by ID
   */
  async delete(workflowId: string): Promise<void> {
    try {
      this.logger.debug('Deleting workflow', { workflowId });

      await this.httpClient.delete(`/workflow/${workflowId}`);

      this.logger.debug('Workflow deleted successfully', { workflowId });
    } catch (error) {
      this.logger.error('Failed to delete workflow', error);
      throw error;
    }
  }

  /**
   * Get workflow execution history
   */
  async getExecutions(
    workflowId: string,
    options: {
      limit?: number;
      offset?: number;
      status?: 'running' | 'completed' | 'failed' | 'cancelled';
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<{
    executions: WorkflowExecution[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      this.logger.debug('Getting workflow executions', { workflowId, options });

      const queryParams = {
        limit: options.limit || 20,
        offset: options.offset || 0,
        status: options.status,
        startDate: options.startDate,
        endDate: options.endDate,
      };

      const response = await this.httpClient.get<ApiResponse<{
        executions: WorkflowExecution[];
        total: number;
        hasMore: boolean;
      }>>(
        `/workflow/${workflowId}/executions`,
        { params: queryParams }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get workflow executions', error);
      throw error;
    }
  }

  /**
   * Generate workflow from natural language prompt
   */
  async generateFromPrompt(
    prompt: string,
    options: GenerateWorkflowOptions = {}
  ): Promise<WorkflowDefinition> {
    try {
      this.logger.debug('Generating workflow from prompt', { prompt, options });

      const generateData = {
        prompt,
        category: options.category,
        complexity: options.complexity || 'medium',
        includeErrorHandling: options.includeErrorHandling || true,
        includeNotifications: options.includeNotifications || false,
        connectorPreferences: options.connectorPreferences || [],
        timeout: options.timeout || 300000,
      };

      const response = await this.httpClient.post<ApiResponse<WorkflowDefinition>>(
        '/workflow/generate',
        generateData
      );

      this.logger.debug('Workflow generated successfully', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to generate workflow from prompt', error);
      throw error;
    }
  }

  /**
   * List available connectors
   */
  async listConnectors(options: {
    category?: string;
    search?: string;
    limit?: number;
  } = {}): Promise<ConnectorMetadata[]> {
    try {
      this.logger.debug('Listing connectors', { options });

      const queryParams = {
        category: options.category,
        search: options.search,
        limit: options.limit || 50,
      };

      const response = await this.httpClient.get<ApiResponse<ConnectorMetadata[]>>(
        '/workflow/connectors',
        { params: queryParams }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to list connectors', error);
      throw error;
    }
  }

  /**
   * Get connector metadata by type
   */
  async getConnector(connectorType: string): Promise<ConnectorMetadata> {
    try {
      const response = await this.httpClient.get<ApiResponse<ConnectorMetadata>>(
        `/workflow/connectors/${connectorType}`
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get connector', error);
      throw error;
    }
  }

  /**
   * Test connector configuration
   */
  async testConnector(
    connectorType: string, 
    config: Record<string, any>
  ): Promise<ConnectorTestResult> {
    try {
      this.logger.debug('Testing connector configuration', { connectorType });

      const testData = {
        connectorType,
        config,
      };

      const response = await this.httpClient.post<ApiResponse<ConnectorTestResult>>(
        '/workflow/connectors/test',
        testData
      );

      this.logger.debug('Connector test completed', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to test connector', error);
      throw error;
    }
  }

  /**
   * Configure connector for project/app
   */
  async configureConnector(config: ConnectorConfig): Promise<{ id: string; status: string }> {
    try {
      this.logger.debug('Configuring connector', { type: config.connectorType, name: config.name });

      const response = await this.httpClient.post<ApiResponse<{ id: string; status: string }>>(
        '/workflow/connectors/configure',
        config
      );

      this.logger.debug('Connector configured successfully', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to configure connector', error);
      throw error;
    }
  }

  /**
   * Get configured connectors for project/app
   */
  async getConfiguredConnectors(): Promise<ConnectorConfig[]> {
    try {
      const response = await this.httpClient.get<ApiResponse<ConnectorConfig[]>>(
        '/workflow/connectors/configured'
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get configured connectors', error);
      throw error;
    }
  }

  /**
   * Validate workflow definition
   */
  async validate(definition: WorkflowDefinition): Promise<WorkflowValidation> {
    try {
      this.logger.debug('Validating workflow definition', { name: definition.name });

      const response = await this.httpClient.post<ApiResponse<WorkflowValidation>>(
        '/workflow/validate',
        definition
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to validate workflow', error);
      throw error;
    }
  }

  /**
   * Analyze app requirements and suggest workflows
   */
  async analyzeApp(appData: {
    type: string;
    features: string[];
    userCount?: number;
    integrations?: string[];
  }): Promise<WorkflowAnalysis> {
    try {
      this.logger.debug('Analyzing app for workflow opportunities', { appType: appData.type });

      const response = await this.httpClient.post<ApiResponse<WorkflowAnalysis>>(
        '/workflow/analyze',
        appData
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to analyze app', error);
      throw error;
    }
  }

  /**
   * Create workflow - alias for create method
   */
  async createWorkflow(config: any): Promise<any> {
    return this.create(config);
  }

  /**
   * Execute workflow - alias for execute method
   */
  async executeWorkflow(workflowId: string, input?: any): Promise<any> {
    return this.execute(workflowId, { input });
  }

  /**
   * Get workflow templates by category
   */
  async getTemplates(options: {
    category?: string;
    complexity?: 'simple' | 'medium' | 'complex';
    limit?: number;
  } = {}): Promise<WorkflowTemplate[]> {
    try {
      this.logger.debug('Getting workflow templates', { options });

      const queryParams = {
        category: options.category,
        complexity: options.complexity,
        limit: options.limit || 20,
      };

      const response = await this.httpClient.get<ApiResponse<WorkflowTemplate[]>>(
        '/workflow/templates',
        { params: queryParams }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get workflow templates', error);
      throw error;
    }
  }

  /**
   * Create workflow from template
   */
  async createFromTemplate(
    templateId: string,
    customizations: {
      name: string;
      description?: string;
      variables?: Record<string, any>;
      connectorConfigs?: Record<string, any>;
    }
  ): Promise<{ id: string; status: string }> {
    try {
      this.logger.debug('Creating workflow from template', { templateId, name: customizations.name });

      const createData = {
        templateId,
        ...customizations,
      };

      const response = await this.httpClient.post<ApiResponse<{ id: string; status: string }>>(
        '/workflow/templates/create',
        createData
      );

      this.logger.debug('Workflow created from template', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to create workflow from template', error);
      throw error;
    }
  }

  /**
   * Get workflow statistics and metrics
   */
  async getStats(): Promise<WorkflowStats> {
    try {
      const response = await this.httpClient.get<ApiResponse<WorkflowStats>>('/workflow/stats');

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get workflow stats', error);
      throw error;
    }
  }

  /**
   * Cancel running workflow execution
   */
  async cancelExecution(executionId: string): Promise<void> {
    try {
      this.logger.debug('Cancelling workflow execution', { executionId });

      await this.httpClient.post(`/workflow/executions/${executionId}/cancel`);

      this.logger.debug('Workflow execution cancelled', { executionId });
    } catch (error) {
      this.logger.error('Failed to cancel workflow execution', error);
      throw error;
    }
  }

  /**
   * Get execution details by ID
   */
  async getExecution(executionId: string): Promise<WorkflowExecution> {
    try {
      const response = await this.httpClient.get<ApiResponse<WorkflowExecution>>(
        `/workflow/executions/${executionId}`
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get workflow execution', error);
      throw error;
    }
  }

  /**
   * Retry failed workflow execution
   */
  async retryExecution(executionId: string, options: {
    fromStep?: string;
    newInput?: Record<string, any>;
  } = {}): Promise<WorkflowExecution> {
    try {
      this.logger.debug('Retrying workflow execution', { executionId, options });

      const retryData = {
        fromStep: options.fromStep,
        newInput: options.newInput,
      };

      const response = await this.httpClient.post<ApiResponse<WorkflowExecution>>(
        `/workflow/executions/${executionId}/retry`,
        retryData
      );

      this.logger.debug('Workflow execution retried', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to retry workflow execution', error);
      throw error;
    }
  }

  /**
   * Export workflow definition
   */
  async export(workflowId: string, format: 'json' | 'yaml' = 'json'): Promise<string> {
    try {
      const response = await this.httpClient.get<ApiResponse<string>>(
        `/workflow/${workflowId}/export`,
        { params: { format } }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to export workflow', error);
      throw error;
    }
  }

  /**
   * Import workflow definition
   */
  async import(
    workflowData: string,
    format: 'json' | 'yaml' = 'json',
    options: {
      name?: string;
      overwrite?: boolean;
    } = {}
  ): Promise<{ id: string; status: string }> {
    try {
      this.logger.debug('Importing workflow', { format, options });

      const importData = {
        workflowData,
        format,
        name: options.name,
        overwrite: options.overwrite || false,
      };

      const response = await this.httpClient.post<ApiResponse<{ id: string; status: string }>>(
        '/workflow/import',
        importData
      );

      this.logger.debug('Workflow imported successfully', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to import workflow', error);
      throw error;
    }
  }
}