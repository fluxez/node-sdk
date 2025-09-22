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
export declare class EdgeFunctionsClient {
    private httpClient;
    private config;
    private logger;
    constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger);
    /**
     * Create a new edge function
     */
    create(options: CreateFunctionOptions): Promise<EdgeFunction>;
    /**
     * Get all edge functions
     */
    list(options?: {
        status?: string;
        runtime?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        functions: EdgeFunction[];
        total: number;
    }>;
    /**
     * Get a specific edge function
     */
    get(functionId: string): Promise<EdgeFunction>;
    /**
     * Update an edge function
     */
    update(functionId: string, updates: UpdateFunctionOptions): Promise<EdgeFunction>;
    /**
     * Delete an edge function
     */
    delete(functionId: string): Promise<{
        success: boolean;
    }>;
    /**
     * Deploy an edge function
     */
    deploy(functionId: string): Promise<EdgeDeployment>;
    /**
     * Execute an edge function
     */
    execute(functionId: string, options?: ExecuteOptions): Promise<EdgeExecution>;
    /**
     * Execute edge function synchronously
     */
    executeSync(functionId: string, input?: any, timeout?: number): Promise<{
        output: any;
        duration: number;
        logs: EdgeLog[];
    }>;
    /**
     * Execute edge function asynchronously
     */
    executeAsync(functionId: string, input?: any): Promise<{
        executionId: string;
    }>;
    /**
     * Get execution status
     */
    getExecution(executionId: string): Promise<EdgeExecution>;
    /**
     * Get execution history for a function
     */
    getExecutions(functionId: string, options?: {
        status?: string;
        limit?: number;
        offset?: number;
        start_date?: string;
        end_date?: string;
    }): Promise<{
        executions: EdgeExecution[];
        total: number;
    }>;
    /**
     * Get function logs
     */
    getLogs(functionId: string, options?: {
        execution_id?: string;
        level?: string;
        limit?: number;
        start_date?: string;
        end_date?: string;
    }): Promise<EdgeLog[]>;
    /**
     * Get function deployments
     */
    getDeployments(functionId: string): Promise<EdgeDeployment[]>;
    /**
     * Rollback to previous deployment
     */
    rollback(functionId: string, deploymentId: string): Promise<EdgeDeployment>;
    /**
     * Update environment variables
     */
    updateEnvironment(functionId: string, variables: Record<string, string>): Promise<{
        success: boolean;
    }>;
    /**
     * Enable or disable a function
     */
    setStatus(functionId: string, status: 'active' | 'inactive'): Promise<{
        success: boolean;
    }>;
    /**
     * Get edge functions statistics
     */
    getStats(options?: {
        function_id?: string;
        start_date?: string;
        end_date?: string;
    }): Promise<EdgeStats>;
    /**
     * Create a webhook trigger for a function
     */
    createWebhook(functionId: string, config: {
        path?: string;
        methods?: string[];
        authentication?: 'none' | 'api_key' | 'bearer';
    }): Promise<{
        webhook_url: string;
        webhook_id: string;
    }>;
    /**
     * Create a scheduled trigger for a function
     */
    createSchedule(functionId: string, config: {
        cron: string;
        timezone?: string;
        input?: any;
    }): Promise<{
        schedule_id: string;
        next_run: string;
    }>;
}
//# sourceMappingURL=edge-functions.d.ts.map