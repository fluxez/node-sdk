"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluxezClient = void 0;
const http_client_1 = require("./core/http-client");
const query_builder_1 = require("./query/query-builder");
const storage_client_1 = require("./storage/storage-client");
const search_client_1 = require("./search/search-client");
const analytics_client_1 = require("./analytics/analytics-client");
const cache_client_1 = require("./cache/cache-client");
const auth_client_1 = require("./auth/auth-client");
const tenant_auth_client_1 = require("./tenant-auth/tenant-auth-client");
const email_1 = require("./modules/email");
const queue_1 = require("./modules/queue");
const ai_1 = require("./modules/ai");
const workflow_1 = require("./modules/workflow");
const connectors_1 = require("./modules/connectors");
const realtime_1 = require("./modules/realtime");
const push_1 = require("./modules/push");
const edge_functions_1 = require("./modules/edge-functions");
const video_conferencing_1 = require("./modules/video-conferencing");
const documents_1 = require("./modules/documents");
const chatbot_1 = require("./modules/chatbot");
const payment_1 = require("./modules/payment");
const schema_client_1 = require("./schema/schema-client");
const constants_1 = require("./constants");
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
 * // AI
 * const result = await client.ai.generateText('Write a blog post about AI');
 * const image = await client.ai.generateImage('A sunset over mountains');
 *
 * // Payment
 * await client.payment.createConfig('org_123', 'proj_456', {
 *   stripePublishableKey: 'pk_...',
 *   stripeSecretKey: 'sk_...',
 *   stripeWebhookSecret: 'whsec_...'
 * });
 * const subscription = await client.payment.createSubscription('org_123', 'proj_456', {
 *   customerId: 'cus_xxx',
 *   priceId: 'price_xxx'
 * });
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
class FluxezClient {
    constructor(apiKey, config) {
        if (!apiKey) {
            throw new Error('API key is required. Get your API key from the Fluxez dashboard.');
        }
        if (!apiKey.startsWith('service_') && !apiKey.startsWith('anon_')) {
            console.warn('Warning: API key should start with "service_" or "anon_". Make sure you\'re using a valid Fluxez API key.');
        }
        this.apiKey = apiKey;
        this.config = {
            timeout: config?.timeout || 30000,
            retries: config?.retries || 3,
            debug: config?.debug || false,
            headers: config?.headers || {},
        };
        // Initialize HTTP client with hardcoded base URL
        this.httpClient = new http_client_1.HttpClient(apiKey, {
            baseURL: constants_1.FLUXEZ_BASE_URL,
            timeout: this.config.timeout,
            retries: this.config.retries,
        });
        // Add custom headers if provided
        if (this.config.headers) {
            Object.entries(this.config.headers).forEach(([key, value]) => {
                this.httpClient.setHeader(key, value);
            });
        }
        // Add context headers if provided
        if (config?.organizationId) {
            this.httpClient.setHeader('x-organization-id', config.organizationId);
        }
        if (config?.projectId) {
            this.httpClient.setHeader('x-project-id', config.projectId);
        }
        if (config?.appId) {
            this.httpClient.setHeader('x-app-id', config.appId);
        }
        // Initialize all module clients
        this.initializeClients();
    }
    initializeClients() {
        // Pass the HTTP client to each module
        this.query = new query_builder_1.QueryBuilder(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
        this.storage = new storage_client_1.StorageClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
        this.search = new search_client_1.SearchClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
        this.analytics = new analytics_client_1.AnalyticsClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
        this.cache = new cache_client_1.CacheClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
        this.auth = new auth_client_1.AuthClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
        this.tenantAuth = new tenant_auth_client_1.TenantAuthClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
        this.email = new email_1.EmailClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
        this.queue = new queue_1.QueueClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
        this.ai = new ai_1.AIModule(this.httpClient);
        this.workflow = new workflow_1.WorkflowClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
        this.connectors = new connectors_1.ConnectorClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
        this.schema = new schema_client_1.SchemaClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
        this.realtime = new realtime_1.RealtimeClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
        this.push = new push_1.PushClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
        this.videoConferencing = new video_conferencing_1.VideoConferencingClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
        this.documents = new documents_1.DocumentsClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
        this.chatbot = new chatbot_1.ChatbotClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
        this.edgeFunctions = new edge_functions_1.EdgeFunctionsClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
        this.payment = new payment_1.PaymentClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
    }
    getClientConfig() {
        // Convert our config to the format expected by existing clients
        return {
            apiKey: this.apiKey,
            baseURL: constants_1.FLUXEZ_BASE_URL,
            timeout: this.config.timeout,
            maxRetries: this.config.retries,
            headers: this.config.headers,
            debug: this.config.debug,
        };
    }
    createLogger() {
        if (!this.config.debug) {
            return {
                debug: () => { },
                info: () => { },
                warn: () => { },
                error: () => { },
            };
        }
        return {
            debug: (message, data) => console.log(`[Fluxez SDK Debug] ${message}`, data || ''),
            info: (message, data) => console.info(`[Fluxez SDK Info] ${message}`, data || ''),
            warn: (message, data) => console.warn(`[Fluxez SDK Warn] ${message}`, data || ''),
            error: (message, data) => console.error(`[Fluxez SDK Error] ${message}`, data || ''),
        };
    }
    /**
     * Execute raw SQL query
     *
     * @param sql SQL query string
     * @param params Query parameters
     * @returns Query result
     */
    async raw(sql, params) {
        const response = await this.httpClient.post('/query', {
            sql,
            params: params || [],
        });
        return response.data;
    }
    /**
     * Direct table access for query building (Fluxez compatibility)
     *
     * @param tableName Name of the table
     * @returns QueryBuilder instance for chaining
     */
    table(tableName) {
        // Create a new query builder instance starting with the table
        const qb = new query_builder_1.QueryBuilder(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
        return qb.select('*').from(tableName);
    }
    /**
     * Execute natural language query
     *
     * @param query Natural language query
     * @param context Optional context for the query
     * @returns Query result
     */
    async natural(query, context) {
        const response = await this.httpClient.post('/query/natural', {
            query,
            context,
        });
        return response.data;
    }
    /**
     * Execute INSERT, UPDATE, DELETE operations
     *
     * @param sql SQL statement
     * @param params Statement parameters
     * @returns Execution result
     */
    async execute(sql, params) {
        const response = await this.httpClient.post('/execute', {
            sql,
            params: params || [],
        });
        return response.data;
    }
    /**
     * Ping the server to check connectivity
     *
     * @returns Ping response
     */
    async ping() {
        const response = await this.httpClient.get('/ping');
        return response.data || { status: 'ok', timestamp: Date.now() };
    }
    /**
     * Set custom header for all requests
     *
     * @param key Header name
     * @param value Header value
     */
    setHeader(key, value) {
        this.httpClient.setHeader(key, value);
    }
    /**
     * Remove custom header
     *
     * @param key Header name to remove
     */
    removeHeader(key) {
        this.httpClient.removeHeader(key);
    }
    /**
     * Health check
     *
     * @returns Health status
     */
    async health() {
        return await this.httpClient.get('/health');
    }
    /**
     * Test the connection with a simple query
     *
     * @returns Connection test result
     */
    async testConnection() {
        const start = Date.now();
        try {
            const health = await this.health();
            const latency = Date.now() - start;
            return {
                connected: health.status === 'ok',
                latency,
                version: health.version,
            };
        }
        catch (error) {
            return {
                connected: false,
                latency: Date.now() - start,
                version: 'unknown',
            };
        }
    }
    /**
     * Get SDK configuration (without sensitive data)
     *
     * @returns Public configuration
     */
    getConfig() {
        return {
            timeout: this.config.timeout,
            retries: this.config.retries,
            debug: this.config.debug,
            headers: this.config.headers,
        };
    }
    /**
     * Update SDK configuration
     *
     * @param config Configuration updates
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        // Update HTTP client if timeout or retries changed
        if (config.timeout || config.retries) {
            this.httpClient = new http_client_1.HttpClient(this.apiKey, {
                baseURL: constants_1.FLUXEZ_BASE_URL,
                timeout: this.config.timeout,
                retries: this.config.retries,
            });
            // Re-initialize clients with new HTTP client
            this.initializeClients();
        }
        // Update headers
        if (config.headers) {
            Object.entries(config.headers).forEach(([key, value]) => {
                this.httpClient.setHeader(key, value);
            });
        }
    }
    // ============================================
    // CRUD Helper Methods (Supabase-style)
    // ============================================
    /**
     * Insert data into a table
     *
     * @param tableName Name of the table
     * @param data Data to insert (single object or array)
     * @returns Inserted data
     */
    async insert(tableName, data) {
        return this.query.from(tableName).insert(data).execute();
    }
    /**
     * Select data from a table
     *
     * @param tableName Name of the table
     * @param columns Columns to select (default: '*')
     * @returns Query builder for chaining
     */
    select(tableName, columns = '*') {
        return this.query.from(tableName).select(columns);
    }
    /**
     * Update data in a table
     *
     * @param tableName Name of the table
     * @param data Data to update
     * @param where WHERE conditions (can be string ID or object with conditions)
     * @returns Updated data
     */
    async update(tableName, data, where) {
        const query = this.query.from(tableName).update(data);
        if (typeof where === 'string') {
            // If where is a string, assume it's an ID
            query.where('id', '=', where);
        }
        else {
            // If where is an object, apply each condition
            Object.entries(where).forEach(([key, value]) => {
                query.where(key, '=', value);
            });
        }
        return query.execute();
    }
    /**
     * Delete data from a table
     *
     * @param tableName Name of the table
     * @param where WHERE conditions (can be string ID or object with conditions)
     * @returns Deletion result
     */
    async delete(tableName, where) {
        const query = this.query.from(tableName).delete();
        if (typeof where === 'string') {
            // If where is a string, assume it's an ID
            query.where('id', '=', where);
        }
        else {
            // If where is an object, apply each condition
            Object.entries(where).forEach(([key, value]) => {
                query.where(key, '=', value);
            });
        }
        return query.execute();
    }
    /**
     * Find one record from a table
     *
     * @param tableName Name of the table
     * @param where WHERE conditions to find the record
     * @returns Single record or null
     */
    async findOne(tableName, where) {
        const query = this.query.from(tableName).select('*');
        Object.entries(where).forEach(([key, value]) => {
            query.where(key, '=', value);
        });
        query.limit(1);
        const result = await query.execute();
        return result.data?.[0] || null;
    }
    /**
     * Find many records from a table
     *
     * @param tableName Name of the table
     * @param where WHERE conditions to filter records
     * @param options Query options (limit, offset, orderBy)
     * @returns Array of records
     */
    async findMany(tableName, where, options) {
        const query = this.query.from(tableName).select('*');
        if (where) {
            Object.entries(where).forEach(([key, value]) => {
                query.where(key, '=', value);
            });
        }
        if (options?.limit) {
            query.limit(options.limit);
        }
        if (options?.offset) {
            query.offset(options.offset);
        }
        if (options?.orderBy) {
            query.orderBy(options.orderBy, options.order || 'asc');
        }
        const result = await query.execute();
        return result.data || [];
    }
}
exports.FluxezClient = FluxezClient;
//# sourceMappingURL=fluxez-client.js.map