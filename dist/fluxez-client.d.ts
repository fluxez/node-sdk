import { QueryBuilder } from './query/query-builder';
import { StorageClient } from './storage/storage-client';
import { SearchClient } from './search/search-client';
import { AnalyticsClient } from './analytics/analytics-client';
import { CacheClient } from './cache/cache-client';
import { AuthClient } from './auth/auth-client';
import { TenantAuthClient } from './tenant-auth/tenant-auth-client';
import { EmailClient } from './modules/email';
import { QueueClient } from './modules/queue';
import { BrainClient } from './modules/brain';
import { WorkflowClient } from './modules/workflow';
import { RealtimeClient } from './modules/realtime';
import { PushClient } from './modules/push';
import { EdgeFunctionsClient } from './modules/edge-functions';
import { SchemaClient } from './schema/schema-client';
import { FluxezClientConfig, QueryResult } from './types';
/**
 * Main Fluxez SDK Client
 *
 * Simple usage:
 * ```typescript
 * const client = new FluxezClient('cgx_your_api_key');
 *
 * // Query data
 * const users = await client.query.select('users').execute();
 *
 * // Raw SQL
 * const result = await client.raw('SELECT * FROM users WHERE active = ?', [true]);
 *
 * // Natural language
 * const data = await client.natural('show me all active users from last week');
 *
 * // Email
 * await client.email.send('user@example.com', 'Welcome!', '<h1>Hello</h1>');
 *
 * // Storage
 * const url = await client.storage.upload(buffer, 'images/logo.png');
 *
 * // Queue
 * await client.queue.send('my-queue-url', { action: 'PROCESS', data: {...} });
 *
 * // Tenant Auth
 * const authResult = await client.tenantAuth.login({ email: 'user@example.com', password: 'password' });
 * const teams = await client.tenantAuth.getTeams();
 *
 * // Brain/AI
 * const app = await client.brain.generate('Create an e-commerce app with Stripe');
 *
 * // Workflow
 * const workflow = await client.workflow.create({
 *   name: 'Send Welcome Email',
 *   triggers: [{ type: 'user.created' }],
 *   actions: [{ type: 'email.send', params: {...} }]
 * });
 *
 * // Schema Management
 * const schema = await client.schema.registerSchema({
 *   schema: {
 *     name: 'users',
 *     fields: [
 *       { name: 'id', type: 'uuid', constraints: { primaryKey: true } },
 *       { name: 'email', type: 'varchar(255)', constraints: { unique: true } }
 *     ]
 *   }
 * });
 *
 * ```
 */
export declare class FluxezClient {
    private httpClient;
    private apiKey;
    private config;
    query: QueryBuilder;
    storage: StorageClient;
    search: SearchClient;
    analytics: AnalyticsClient;
    cache: CacheClient;
    auth: AuthClient;
    tenantAuth: TenantAuthClient;
    email: EmailClient;
    queue: QueueClient;
    brain: BrainClient;
    ai: BrainClient;
    workflow: WorkflowClient;
    schema: SchemaClient;
    realtime: RealtimeClient;
    push: PushClient;
    edgeFunctions: EdgeFunctionsClient;
    constructor(apiKey: string, config?: FluxezClientConfig);
    private initializeClients;
    private getClientConfig;
    private createLogger;
    /**
     * Execute raw SQL query
     *
     * @param sql SQL query string
     * @param params Query parameters
     * @returns Query result
     */
    raw(sql: string, params?: any[]): Promise<QueryResult>;
    /**
     * Direct table access for query building (Fluxez compatibility)
     *
     * @param tableName Name of the table
     * @returns QueryBuilder instance for chaining
     */
    table(tableName: string): QueryBuilder;
    /**
     * Execute natural language query
     *
     * @param query Natural language query
     * @param context Optional context for the query
     * @returns Query result
     */
    natural(query: string, context?: string): Promise<QueryResult>;
    /**
     * Execute INSERT, UPDATE, DELETE operations
     *
     * @param sql SQL statement
     * @param params Statement parameters
     * @returns Execution result
     */
    execute(sql: string, params?: any[]): Promise<QueryResult>;
    /**
     * Ping the server to check connectivity
     *
     * @returns Ping response
     */
    ping(): Promise<{
        status: string;
        timestamp: number;
    }>;
    /**
     * Set custom header for all requests
     *
     * @param key Header name
     * @param value Header value
     */
    setHeader(key: string, value: string): void;
    /**
     * Remove custom header
     *
     * @param key Header name to remove
     */
    removeHeader(key: string): void;
    /**
     * Health check
     *
     * @returns Health status
     */
    health(): Promise<{
        status: string;
        version: string;
    }>;
    /**
     * Test the connection with a simple query
     *
     * @returns Connection test result
     */
    testConnection(): Promise<{
        connected: boolean;
        latency: number;
        version: string;
    }>;
    /**
     * Get SDK configuration (without sensitive data)
     *
     * @returns Public configuration
     */
    getConfig(): FluxezClientConfig;
    /**
     * Update SDK configuration
     *
     * @param config Configuration updates
     */
    updateConfig(config: Partial<FluxezClientConfig>): void;
}
//# sourceMappingURL=fluxez-client.d.ts.map