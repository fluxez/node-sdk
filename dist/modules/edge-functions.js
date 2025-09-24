"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdgeFunctionsClient = void 0;
class EdgeFunctionsClient {
    constructor(httpClient, config, logger) {
        this.httpClient = httpClient;
        this.config = config;
        this.logger = logger;
    }
    /**
     * Create a new edge function
     */
    async create(options) {
        try {
            this.logger.debug('Creating edge function', { name: options.name });
            const response = await this.httpClient.post('/edge-functions', options);
            this.logger.info('Edge function created successfully', {
                id: response.data.id,
                name: options.name
            });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to create edge function', error);
            throw error;
        }
    }
    /**
     * Get all edge functions
     */
    async list(options) {
        try {
            const response = await this.httpClient.get('/edge-functions', { params: options });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to list edge functions', error);
            throw error;
        }
    }
    /**
     * Get a specific edge function
     */
    async get(functionId) {
        try {
            const response = await this.httpClient.get(`/edge-functions/${functionId}`);
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to get edge function', error);
            throw error;
        }
    }
    /**
     * Update an edge function
     */
    async update(functionId, updates) {
        try {
            this.logger.debug('Updating edge function', { functionId, updates });
            const response = await this.httpClient.put(`/edge-functions/${functionId}`, updates);
            this.logger.info('Edge function updated successfully', { functionId });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to update edge function', error);
            throw error;
        }
    }
    /**
     * Delete an edge function
     */
    async delete(functionId) {
        try {
            const response = await this.httpClient.delete(`/edge-functions/${functionId}`);
            this.logger.info('Edge function deleted successfully', { functionId });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to delete edge function', error);
            throw error;
        }
    }
    /**
     * Deploy an edge function
     */
    async deploy(functionId) {
        try {
            this.logger.debug('Deploying edge function', { functionId });
            const response = await this.httpClient.post(`/edge-functions/${functionId}/deploy`);
            this.logger.info('Edge function deployment started', {
                functionId,
                deploymentId: response.data.id
            });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to deploy edge function', error);
            throw error;
        }
    }
    /**
     * Execute an edge function
     */
    async execute(functionId, options) {
        try {
            this.logger.debug('Executing edge function', { functionId, options });
            const response = await this.httpClient.post(`/edge-functions/${functionId}/execute`, {
                input: options?.input,
                timeout: options?.timeout,
                async: options?.async,
            });
            this.logger.info('Edge function executed', {
                functionId,
                executionId: response.data.id,
                status: response.data.status
            });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to execute edge function', error);
            throw error;
        }
    }
    /**
     * Execute edge function synchronously
     */
    async executeSync(functionId, input, timeout) {
        const execution = await this.execute(functionId, {
            input,
            timeout,
            async: false,
        });
        if (execution.status === 'failed') {
            throw new Error(execution.error || 'Edge function execution failed');
        }
        return {
            output: execution.output,
            duration: execution.duration,
            logs: execution.logs,
        };
    }
    /**
     * Execute edge function asynchronously
     */
    async executeAsync(functionId, input) {
        const execution = await this.execute(functionId, {
            input,
            async: true,
        });
        return { executionId: execution.id };
    }
    /**
     * Get execution status
     */
    async getExecution(executionId) {
        try {
            const response = await this.httpClient.get(`/edge-functions/executions/${executionId}`);
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to get edge execution', error);
            throw error;
        }
    }
    /**
     * Get execution history for a function
     */
    async getExecutions(functionId, options) {
        try {
            const response = await this.httpClient.get(`/edge-functions/${functionId}/executions`, {
                params: options
            });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to get edge executions', error);
            throw error;
        }
    }
    /**
     * Get function logs
     */
    async getLogs(functionId, options) {
        try {
            const response = await this.httpClient.get(`/edge-functions/${functionId}/logs`, {
                params: options
            });
            return response.data || [];
        }
        catch (error) {
            this.logger.error('Failed to get edge function logs', error);
            throw error;
        }
    }
    /**
     * Get function deployments
     */
    async getDeployments(functionId) {
        try {
            const response = await this.httpClient.get(`/edge-functions/${functionId}/deployments`);
            return response.data || [];
        }
        catch (error) {
            this.logger.error('Failed to get edge function deployments', error);
            throw error;
        }
    }
    /**
     * Rollback to previous deployment
     */
    async rollback(functionId, deploymentId) {
        try {
            this.logger.debug('Rolling back edge function', { functionId, deploymentId });
            const response = await this.httpClient.post(`/edge-functions/${functionId}/rollback`, {
                deployment_id: deploymentId,
            });
            this.logger.info('Edge function rolled back', { functionId, deploymentId });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to rollback edge function', error);
            throw error;
        }
    }
    /**
     * Update environment variables
     */
    async updateEnvironment(functionId, variables) {
        try {
            const response = await this.httpClient.put(`/edge-functions/${functionId}/environment`, {
                variables,
            });
            this.logger.info('Edge function environment updated', { functionId });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to update edge function environment', error);
            throw error;
        }
    }
    /**
     * Enable or disable a function
     */
    async setStatus(functionId, status) {
        try {
            const response = await this.httpClient.put(`/edge-functions/${functionId}/status`, {
                status,
            });
            this.logger.info('Edge function status updated', { functionId, status });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to update edge function status', error);
            throw error;
        }
    }
    /**
     * Get edge functions statistics
     */
    async getStats(options) {
        try {
            const response = await this.httpClient.get('/edge-functions/stats', { params: options });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to get edge functions stats', error);
            throw error;
        }
    }
    /**
     * Create a webhook trigger for a function
     */
    async createWebhook(functionId, config) {
        try {
            const response = await this.httpClient.post(`/edge-functions/${functionId}/webhooks`, config);
            this.logger.info('Webhook created for edge function', {
                functionId,
                webhookUrl: response.data.webhook_url
            });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to create webhook', error);
            throw error;
        }
    }
    /**
     * Create a scheduled trigger for a function
     */
    async createSchedule(functionId, config) {
        try {
            const response = await this.httpClient.post(`/edge-functions/${functionId}/schedules`, config);
            this.logger.info('Schedule created for edge function', {
                functionId,
                scheduleId: response.data.schedule_id,
                nextRun: response.data.next_run
            });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to create schedule', error);
            throw error;
        }
    }
}
exports.EdgeFunctionsClient = EdgeFunctionsClient;
//# sourceMappingURL=edge-functions.js.map