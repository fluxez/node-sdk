"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowClient = void 0;
class WorkflowClient {
    constructor(httpClient, config, logger) {
        this.httpClient = httpClient;
        this.config = config;
        this.logger = logger;
    }
    /**
     * Create a new workflow from definition
     */
    async create(definition) {
        try {
            this.logger.debug('Creating workflow', { name: definition.name });
            const response = await this.httpClient.post('/workflow/create', definition);
            this.logger.debug('Workflow created successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to create workflow', error);
            throw error;
        }
    }
    /**
     * Execute a workflow by ID
     */
    async execute(workflowId, options = {}) {
        try {
            this.logger.debug('Executing workflow', { workflowId, options });
            const executionData = {
                workflowId,
                input: options.input || {},
                context: options.context || {},
                timeout: options.timeout || 300000, // 5 minutes default
                async: options.async || false,
            };
            const response = await this.httpClient.post(`/workflow/${workflowId}/execute`, executionData);
            this.logger.debug('Workflow execution started', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to execute workflow', error);
            throw error;
        }
    }
    /**
     * List workflows with filtering options
     */
    async list(options = {}) {
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
            const response = await this.httpClient.get('/workflow/list', { params: queryParams });
            this.logger.debug('Workflows listed successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to list workflows', error);
            throw error;
        }
    }
    /**
     * Get workflow details by ID
     */
    async get(workflowId) {
        try {
            this.logger.debug('Getting workflow details', { workflowId });
            const response = await this.httpClient.get(`/workflow/${workflowId}`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get workflow', error);
            throw error;
        }
    }
    /**
     * Update workflow definition
     */
    async update(workflowId, updates) {
        try {
            this.logger.debug('Updating workflow', { workflowId, updates });
            const response = await this.httpClient.put(`/workflow/${workflowId}`, updates);
            this.logger.debug('Workflow updated successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to update workflow', error);
            throw error;
        }
    }
    /**
     * Delete workflow by ID
     */
    async delete(workflowId) {
        try {
            this.logger.debug('Deleting workflow', { workflowId });
            await this.httpClient.delete(`/workflow/${workflowId}`);
            this.logger.debug('Workflow deleted successfully', { workflowId });
        }
        catch (error) {
            this.logger.error('Failed to delete workflow', error);
            throw error;
        }
    }
    /**
     * Get workflow execution history
     */
    async getExecutions(workflowId, options = {}) {
        try {
            this.logger.debug('Getting workflow executions', { workflowId, options });
            const queryParams = {
                limit: options.limit || 20,
                offset: options.offset || 0,
                status: options.status,
                startDate: options.startDate,
                endDate: options.endDate,
            };
            const response = await this.httpClient.get(`/workflow/${workflowId}/executions`, { params: queryParams });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get workflow executions', error);
            throw error;
        }
    }
    /**
     * Generate workflow from natural language prompt
     */
    async generateFromPrompt(prompt, options = {}) {
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
            const response = await this.httpClient.post('/workflow/generate', generateData);
            this.logger.debug('Workflow generated successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to generate workflow from prompt', error);
            throw error;
        }
    }
    /**
     * List available connectors
     */
    async listConnectors(options = {}) {
        try {
            this.logger.debug('Listing connectors', { options });
            const queryParams = {
                category: options.category,
                search: options.search,
                limit: options.limit || 50,
            };
            const response = await this.httpClient.get('/workflow/connectors', { params: queryParams });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to list connectors', error);
            throw error;
        }
    }
    /**
     * Get connector metadata by type
     */
    async getConnector(connectorType) {
        try {
            const response = await this.httpClient.get(`/workflow/connectors/${connectorType}`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get connector', error);
            throw error;
        }
    }
    /**
     * Test connector configuration
     */
    async testConnector(connectorType, config) {
        try {
            this.logger.debug('Testing connector configuration', { connectorType });
            const testData = {
                connectorType,
                config,
            };
            const response = await this.httpClient.post('/workflow/connectors/test', testData);
            this.logger.debug('Connector test completed', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to test connector', error);
            throw error;
        }
    }
    /**
     * Configure connector for project/app
     */
    async configureConnector(config) {
        try {
            this.logger.debug('Configuring connector', { type: config.connectorType, name: config.name });
            const response = await this.httpClient.post('/workflow/connectors/configure', config);
            this.logger.debug('Connector configured successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to configure connector', error);
            throw error;
        }
    }
    /**
     * Get configured connectors for project/app
     */
    async getConfiguredConnectors() {
        try {
            const response = await this.httpClient.get('/workflow/connectors/configured');
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get configured connectors', error);
            throw error;
        }
    }
    /**
     * Validate workflow definition
     */
    async validate(definition) {
        try {
            this.logger.debug('Validating workflow definition', { name: definition.name });
            const response = await this.httpClient.post('/workflow/validate', definition);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to validate workflow', error);
            throw error;
        }
    }
    /**
     * Analyze app requirements and suggest workflows
     */
    async analyzeApp(appData) {
        try {
            this.logger.debug('Analyzing app for workflow opportunities', { appType: appData.type });
            const response = await this.httpClient.post('/workflow/analyze', appData);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to analyze app', error);
            throw error;
        }
    }
    /**
     * Create workflow - alias for create method
     */
    async createWorkflow(config) {
        return this.create(config);
    }
    /**
     * Execute workflow - alias for execute method
     */
    async executeWorkflow(workflowId, input) {
        return this.execute(workflowId, { input });
    }
    /**
     * Get workflow templates by category
     */
    async getTemplates(options = {}) {
        try {
            this.logger.debug('Getting workflow templates', { options });
            const queryParams = {
                category: options.category,
                complexity: options.complexity,
                limit: options.limit || 20,
            };
            const response = await this.httpClient.get('/workflow/templates', { params: queryParams });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get workflow templates', error);
            throw error;
        }
    }
    /**
     * Create workflow from template
     */
    async createFromTemplate(templateId, customizations) {
        try {
            this.logger.debug('Creating workflow from template', { templateId, name: customizations.name });
            const createData = {
                templateId,
                ...customizations,
            };
            const response = await this.httpClient.post('/workflow/templates/create', createData);
            this.logger.debug('Workflow created from template', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to create workflow from template', error);
            throw error;
        }
    }
    /**
     * Get workflow statistics and metrics
     */
    async getStats() {
        try {
            const response = await this.httpClient.get('/workflow/stats');
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get workflow stats', error);
            throw error;
        }
    }
    /**
     * Cancel running workflow execution
     */
    async cancelExecution(executionId) {
        try {
            this.logger.debug('Cancelling workflow execution', { executionId });
            await this.httpClient.post(`/workflow/executions/${executionId}/cancel`);
            this.logger.debug('Workflow execution cancelled', { executionId });
        }
        catch (error) {
            this.logger.error('Failed to cancel workflow execution', error);
            throw error;
        }
    }
    /**
     * Get execution details by ID
     */
    async getExecution(executionId) {
        try {
            const response = await this.httpClient.get(`/workflow/executions/${executionId}`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get workflow execution', error);
            throw error;
        }
    }
    /**
     * Retry failed workflow execution
     */
    async retryExecution(executionId, options = {}) {
        try {
            this.logger.debug('Retrying workflow execution', { executionId, options });
            const retryData = {
                fromStep: options.fromStep,
                newInput: options.newInput,
            };
            const response = await this.httpClient.post(`/workflow/executions/${executionId}/retry`, retryData);
            this.logger.debug('Workflow execution retried', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to retry workflow execution', error);
            throw error;
        }
    }
    /**
     * Export workflow definition
     */
    async export(workflowId, format = 'json') {
        try {
            const response = await this.httpClient.get(`/workflow/${workflowId}/export`, { params: { format } });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to export workflow', error);
            throw error;
        }
    }
    /**
     * Import workflow definition
     */
    async import(workflowData, format = 'json', options = {}) {
        try {
            this.logger.debug('Importing workflow', { format, options });
            const importData = {
                workflowData,
                format,
                name: options.name,
                overwrite: options.overwrite || false,
            };
            const response = await this.httpClient.post('/workflow/import', importData);
            this.logger.debug('Workflow imported successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to import workflow', error);
            throw error;
        }
    }
}
exports.WorkflowClient = WorkflowClient;
//# sourceMappingURL=workflow.js.map