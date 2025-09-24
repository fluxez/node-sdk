import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';

export interface EdgeFunction {
  id: string;
  name: string;
  description?: string;
  code: string;
  runtime: 'nodejs' | 'python' | 'deno' | 'wasm';
  version: string;
  status: 'active' | 'inactive' | 'error';
  environment_variables: Record<string, string>;
  triggers: EdgeTrigger[];
  memory_limit: number;
  timeout: number;
  region?: string;
  created_at: string;
  updated_at: string;
  last_execution?: string;
  execution_count: number;
}

export interface EdgeTrigger {
  type: 'http' | 'webhook' | 'schedule' | 'event';
  config: Record<string, any>;
  enabled: boolean;
}

export interface EdgeExecution {
  id: string;
  function_id: string;
  function_name: string;
  trigger_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'timeout';
  input: any;
  output?: any;
  error?: string;
  duration: number;
  memory_used: number;
  logs: EdgeLog[];
  started_at: string;
  completed_at?: string;
}

export interface EdgeLog {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface EdgeDeployment {
  id: string;
  function_id: string;
  version: string;
  status: 'deploying' | 'active' | 'failed' | 'rolled_back';
  deployment_url?: string;
  error?: string;
  deployed_at: string;
}

export interface CreateFunctionOptions {
  name: string;
  description?: string;
  code: string;
  runtime: 'nodejs' | 'python' | 'deno' | 'wasm';
  environment_variables?: Record<string, string>;
  memory_limit?: number;
  timeout?: number;
  region?: string;
  triggers?: EdgeTrigger[];
}

export interface UpdateFunctionOptions {
  name?: string;
  description?: string;
  code?: string;
  environment_variables?: Record<string, string>;
  memory_limit?: number;
  timeout?: number;
  triggers?: EdgeTrigger[];
}

export interface ExecuteOptions {
  input?: any;
  timeout?: number;
  async?: boolean;
}

export interface EdgeStats {
  total_functions: number;
  active_functions: number;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  average_duration: number;
  total_memory_used: number;
  success_rate: number;
}

export class EdgeFunctionsClient {
  private httpClient: AxiosInstance;
  private config: FluxezConfig;
  private logger: Logger;

  constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger) {
    this.httpClient = httpClient;
    this.config = config;
    this.logger = logger;
  }

  /**
   * Create a new edge function
   */
  async create(options: CreateFunctionOptions): Promise<EdgeFunction> {
    try {
      this.logger.debug('Creating edge function', { name: options.name });
      
      const response = await this.httpClient.post('/edge-functions', options);
      
      this.logger.info('Edge function created successfully', {
        id: response.data.id,
        name: options.name
      });
      
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create edge function', error);
      throw error;
    }
  }

  /**
   * Get all edge functions
   */
  async list(options?: {
    status?: string;
    runtime?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    functions: EdgeFunction[];
    total: number;
  }> {
    try {
      const response = await this.httpClient.get('/edge-functions', { params: options });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to list edge functions', error);
      throw error;
    }
  }

  /**
   * Get a specific edge function
   */
  async get(functionId: string): Promise<EdgeFunction> {
    try {
      const response = await this.httpClient.get(`/edge-functions/${functionId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get edge function', error);
      throw error;
    }
  }

  /**
   * Update an edge function
   */
  async update(functionId: string, updates: UpdateFunctionOptions): Promise<EdgeFunction> {
    try {
      this.logger.debug('Updating edge function', { functionId, updates });
      
      const response = await this.httpClient.put(`/edge-functions/${functionId}`, updates);
      
      this.logger.info('Edge function updated successfully', { functionId });
      
      return response.data;
    } catch (error) {
      this.logger.error('Failed to update edge function', error);
      throw error;
    }
  }

  /**
   * Delete an edge function
   */
  async delete(functionId: string): Promise<{ success: boolean }> {
    try {
      const response = await this.httpClient.delete(`/edge-functions/${functionId}`);
      
      this.logger.info('Edge function deleted successfully', { functionId });
      
      return response.data;
    } catch (error) {
      this.logger.error('Failed to delete edge function', error);
      throw error;
    }
  }

  /**
   * Deploy an edge function
   */
  async deploy(functionId: string): Promise<EdgeDeployment> {
    try {
      this.logger.debug('Deploying edge function', { functionId });
      
      const response = await this.httpClient.post(`/edge-functions/${functionId}/deploy`);
      
      this.logger.info('Edge function deployment started', {
        functionId,
        deploymentId: response.data.id
      });
      
      return response.data;
    } catch (error) {
      this.logger.error('Failed to deploy edge function', error);
      throw error;
    }
  }

  /**
   * Execute an edge function
   */
  async execute(functionId: string, options?: ExecuteOptions): Promise<EdgeExecution> {
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
    } catch (error) {
      this.logger.error('Failed to execute edge function', error);
      throw error;
    }
  }

  /**
   * Execute edge function synchronously
   */
  async executeSync(functionId: string, input?: any, timeout?: number): Promise<{
    output: any;
    duration: number;
    logs: EdgeLog[];
  }> {
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
  async executeAsync(functionId: string, input?: any): Promise<{ executionId: string }> {
    const execution = await this.execute(functionId, {
      input,
      async: true,
    });

    return { executionId: execution.id };
  }

  /**
   * Get execution status
   */
  async getExecution(executionId: string): Promise<EdgeExecution> {
    try {
      const response = await this.httpClient.get(`/edge-functions/executions/${executionId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get edge execution', error);
      throw error;
    }
  }

  /**
   * Get execution history for a function
   */
  async getExecutions(functionId: string, options?: {
    status?: string;
    limit?: number;
    offset?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<{
    executions: EdgeExecution[];
    total: number;
  }> {
    try {
      const response = await this.httpClient.get(`/edge-functions/${functionId}/executions`, {
        params: options
      });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get edge executions', error);
      throw error;
    }
  }

  /**
   * Get function logs
   */
  async getLogs(functionId: string, options?: {
    execution_id?: string;
    level?: string;
    limit?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<EdgeLog[]> {
    try {
      const response = await this.httpClient.get(`/edge-functions/${functionId}/logs`, {
        params: options
      });
      return response.data || [];
    } catch (error) {
      this.logger.error('Failed to get edge function logs', error);
      throw error;
    }
  }

  /**
   * Get function deployments
   */
  async getDeployments(functionId: string): Promise<EdgeDeployment[]> {
    try {
      const response = await this.httpClient.get(`/edge-functions/${functionId}/deployments`);
      return response.data || [];
    } catch (error) {
      this.logger.error('Failed to get edge function deployments', error);
      throw error;
    }
  }

  /**
   * Rollback to previous deployment
   */
  async rollback(functionId: string, deploymentId: string): Promise<EdgeDeployment> {
    try {
      this.logger.debug('Rolling back edge function', { functionId, deploymentId });
      
      const response = await this.httpClient.post(`/edge-functions/${functionId}/rollback`, {
        deployment_id: deploymentId,
      });
      
      this.logger.info('Edge function rolled back', { functionId, deploymentId });
      
      return response.data;
    } catch (error) {
      this.logger.error('Failed to rollback edge function', error);
      throw error;
    }
  }

  /**
   * Update environment variables
   */
  async updateEnvironment(functionId: string, variables: Record<string, string>): Promise<{ success: boolean }> {
    try {
      const response = await this.httpClient.put(`/edge-functions/${functionId}/environment`, {
        variables,
      });
      
      this.logger.info('Edge function environment updated', { functionId });
      
      return response.data;
    } catch (error) {
      this.logger.error('Failed to update edge function environment', error);
      throw error;
    }
  }

  /**
   * Enable or disable a function
   */
  async setStatus(functionId: string, status: 'active' | 'inactive'): Promise<{ success: boolean }> {
    try {
      const response = await this.httpClient.put(`/edge-functions/${functionId}/status`, {
        status,
      });
      
      this.logger.info('Edge function status updated', { functionId, status });
      
      return response.data;
    } catch (error) {
      this.logger.error('Failed to update edge function status', error);
      throw error;
    }
  }

  /**
   * Get edge functions statistics
   */
  async getStats(options?: {
    function_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<EdgeStats> {
    try {
      const response = await this.httpClient.get('/edge-functions/stats', { params: options });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get edge functions stats', error);
      throw error;
    }
  }

  /**
   * Create a webhook trigger for a function
   */
  async createWebhook(functionId: string, config: {
    path?: string;
    methods?: string[];
    authentication?: 'none' | 'api_key' | 'bearer';
  }): Promise<{
    webhook_url: string;
    webhook_id: string;
  }> {
    try {
      const response = await this.httpClient.post(`/edge-functions/${functionId}/webhooks`, config);
      
      this.logger.info('Webhook created for edge function', {
        functionId,
        webhookUrl: response.data.webhook_url
      });
      
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create webhook', error);
      throw error;
    }
  }

  /**
   * Create a scheduled trigger for a function
   */
  async createSchedule(functionId: string, config: {
    cron: string;
    timezone?: string;
    input?: any;
  }): Promise<{
    schedule_id: string;
    next_run: string;
  }> {
    try {
      const response = await this.httpClient.post(`/edge-functions/${functionId}/schedules`, config);
      
      this.logger.info('Schedule created for edge function', {
        functionId,
        scheduleId: response.data.schedule_id,
        nextRun: response.data.next_run
      });
      
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create schedule', error);
      throw error;
    }
  }
}

