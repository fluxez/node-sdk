import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import { WorkflowDefinition, WorkflowExecution, ConnectorConfig, ConnectorMetadata } from '../types';
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
export declare class WorkflowClient {
    private httpClient;
    private config;
    private logger;
    constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger);
    /**
     * Create a new workflow from definition
     */
    create(definition: WorkflowDefinition): Promise<{
        id: string;
        status: string;
    }>;
    /**
     * Execute a workflow by ID
     */
    execute(workflowId: string, options?: WorkflowExecutionOptions): Promise<WorkflowExecution>;
    /**
     * List workflows with filtering options
     */
    list(options?: WorkflowListOptions): Promise<{
        workflows: WorkflowDefinition[];
        total: number;
        hasMore: boolean;
    }>;
    /**
     * Get workflow details by ID
     */
    get(workflowId: string): Promise<WorkflowDefinition>;
    /**
     * Update workflow definition
     */
    update(workflowId: string, updates: Partial<WorkflowDefinition>): Promise<WorkflowDefinition>;
    /**
     * Delete workflow by ID
     */
    delete(workflowId: string): Promise<void>;
    /**
     * Get workflow execution history
     */
    getExecutions(workflowId: string, options?: {
        limit?: number;
        offset?: number;
        status?: 'running' | 'completed' | 'failed' | 'cancelled';
        startDate?: string;
        endDate?: string;
    }): Promise<{
        executions: WorkflowExecution[];
        total: number;
        hasMore: boolean;
    }>;
    /**
     * Generate workflow from natural language prompt
     */
    generateFromPrompt(prompt: string, options?: GenerateWorkflowOptions): Promise<WorkflowDefinition>;
    /**
     * List available connectors
     */
    listConnectors(options?: {
        category?: string;
        search?: string;
        limit?: number;
    }): Promise<ConnectorMetadata[]>;
    /**
     * Get connector metadata by type
     */
    getConnector(connectorType: string): Promise<ConnectorMetadata>;
    /**
     * Test connector configuration
     */
    testConnector(connectorType: string, config: Record<string, any>): Promise<ConnectorTestResult>;
    /**
     * Configure connector for project/app
     */
    configureConnector(config: ConnectorConfig): Promise<{
        id: string;
        status: string;
    }>;
    /**
     * Get configured connectors for project/app
     */
    getConfiguredConnectors(): Promise<ConnectorConfig[]>;
    /**
     * Validate workflow definition
     */
    validate(definition: WorkflowDefinition): Promise<WorkflowValidation>;
    /**
     * Analyze app requirements and suggest workflows
     */
    analyzeApp(appData: {
        type: string;
        features: string[];
        userCount?: number;
        integrations?: string[];
    }): Promise<WorkflowAnalysis>;
    /**
     * Create workflow - alias for create method
     */
    createWorkflow(config: any): Promise<any>;
    /**
     * Execute workflow - alias for execute method
     */
    executeWorkflow(workflowId: string, input?: any): Promise<any>;
    /**
     * Get workflow templates by category
     */
    getTemplates(options?: {
        category?: string;
        complexity?: 'simple' | 'medium' | 'complex';
        limit?: number;
    }): Promise<WorkflowTemplate[]>;
    /**
     * Create workflow from template
     */
    createFromTemplate(templateId: string, customizations: {
        name: string;
        description?: string;
        variables?: Record<string, any>;
        connectorConfigs?: Record<string, any>;
    }): Promise<{
        id: string;
        status: string;
    }>;
    /**
     * Get workflow statistics and metrics
     */
    getStats(): Promise<WorkflowStats>;
    /**
     * Cancel running workflow execution
     */
    cancelExecution(executionId: string): Promise<void>;
    /**
     * Get execution details by ID
     */
    getExecution(executionId: string): Promise<WorkflowExecution>;
    /**
     * Retry failed workflow execution
     */
    retryExecution(executionId: string, options?: {
        fromStep?: string;
        newInput?: Record<string, any>;
    }): Promise<WorkflowExecution>;
    /**
     * Export workflow definition
     */
    export(workflowId: string, format?: 'json' | 'yaml'): Promise<string>;
    /**
     * Import workflow definition
     */
    import(workflowData: string, format?: 'json' | 'yaml', options?: {
        name?: string;
        overwrite?: boolean;
    }): Promise<{
        id: string;
        status: string;
    }>;
}
//# sourceMappingURL=workflow.d.ts.map