import { HttpClient } from './core/http-client';
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
import { VideoClient } from './modules/video';
import { DocumentsClient } from './modules/documents';
import { SchemaClient } from './schema/schema-client';
import { FLUXEZ_BASE_URL } from './constants';
import { 
  FluxezClientConfig, 
  QueryParams, 
  QueryResult, 
  NaturalQueryParams,
  ApiResponse
} from './types';

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
export class FluxezClient {
  private httpClient: HttpClient;
  private apiKey: string;
  private config: FluxezClientConfig;

  // Module clients - exposed as public properties
  public query!: QueryBuilder;
  public storage!: StorageClient;
  public search!: SearchClient;
  public analytics!: AnalyticsClient;
  public cache!: CacheClient;
  public auth!: AuthClient;
  public tenantAuth!: TenantAuthClient;
  public email!: EmailClient;
  public queue!: QueueClient;
  public brain!: BrainClient;
  public ai!: BrainClient; // Alias for brain
  public workflow!: WorkflowClient;
  public schema!: SchemaClient;
  public realtime!: RealtimeClient;
  public push!: PushClient;
  public video!: VideoClient;
  public documents!: DocumentsClient;
  public edgeFunctions!: EdgeFunctionsClient;

  constructor(apiKey: string, config?: FluxezClientConfig) {
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
    this.httpClient = new HttpClient(apiKey, {
      baseURL: FLUXEZ_BASE_URL,
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

  private initializeClients(): void {
    // Pass the HTTP client to each module
    this.query = new QueryBuilder(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
    this.storage = new StorageClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
    this.search = new SearchClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
    this.analytics = new AnalyticsClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
    this.cache = new CacheClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
    this.auth = new AuthClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
    this.tenantAuth = new TenantAuthClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
    this.email = new EmailClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
    this.queue = new QueueClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
    this.brain = new BrainClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
    this.ai = this.brain; // Alias for brain
    this.workflow = new WorkflowClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
    this.schema = new SchemaClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
    this.realtime = new RealtimeClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
    this.push = new PushClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
    this.video = new VideoClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
    this.documents = new DocumentsClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
    this.edgeFunctions = new EdgeFunctionsClient(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
  }

  private getClientConfig(): any {
    // Convert our config to the format expected by existing clients
    return {
      apiKey: this.apiKey,
      baseURL: FLUXEZ_BASE_URL,
      timeout: this.config.timeout,
      maxRetries: this.config.retries,
      headers: this.config.headers,
      debug: this.config.debug,
    };
  }

  private createLogger(): any {
    if (!this.config.debug) {
      return {
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
      };
    }

    return {
      debug: (message: string, data?: any) => console.log(`[Fluxez SDK Debug] ${message}`, data || ''),
      info: (message: string, data?: any) => console.info(`[Fluxez SDK Info] ${message}`, data || ''),
      warn: (message: string, data?: any) => console.warn(`[Fluxez SDK Warn] ${message}`, data || ''),
      error: (message: string, data?: any) => console.error(`[Fluxez SDK Error] ${message}`, data || ''),
    };
  }

  /**
   * Execute raw SQL query
   * 
   * @param sql SQL query string
   * @param params Query parameters
   * @returns Query result
   */
  async raw(sql: string, params?: any[]): Promise<QueryResult> {
    const response = await this.httpClient.post<ApiResponse<QueryResult>>('/query', {
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
  table(tableName: string): QueryBuilder {
    // Create a new query builder instance starting with the table
    const qb = new QueryBuilder(this.httpClient.getAxiosInstance(), this.getClientConfig(), this.createLogger());
    return qb.select('*').from(tableName);
  }

  /**
   * Execute natural language query
   * 
   * @param query Natural language query
   * @param context Optional context for the query
   * @returns Query result
   */
  async natural(query: string, context?: string): Promise<QueryResult> {
    const response = await this.httpClient.post<ApiResponse<QueryResult>>('/query/natural', {
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
  async execute(sql: string, params?: any[]): Promise<QueryResult> {
    const response = await this.httpClient.post<ApiResponse<QueryResult>>('/execute', {
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
  async ping(): Promise<{ status: string; timestamp: number }> {
    const response = await this.httpClient.get<ApiResponse<{ status: string; timestamp: number }>>('/ping');
    return response.data || { status: 'ok', timestamp: Date.now() };
  }


  /**
   * Set custom header for all requests
   * 
   * @param key Header name
   * @param value Header value
   */
  setHeader(key: string, value: string): void {
    this.httpClient.setHeader(key, value);
  }

  /**
   * Remove custom header
   * 
   * @param key Header name to remove
   */
  removeHeader(key: string): void {
    this.httpClient.removeHeader(key);
  }

  /**
   * Health check
   * 
   * @returns Health status
   */
  async health(): Promise<{ status: string; version: string }> {
    return await this.httpClient.get('/health');
  }

  /**
   * Test the connection with a simple query
   * 
   * @returns Connection test result
   */
  async testConnection(): Promise<{ connected: boolean; latency: number; version: string }> {
    const start = Date.now();
    try {
      const health = await this.health();
      const latency = Date.now() - start;
      
      return {
        connected: health.status === 'ok',
        latency,
        version: health.version,
      };
    } catch (error) {
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
  getConfig(): FluxezClientConfig {
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
  updateConfig(config: Partial<FluxezClientConfig>): void {
    this.config = { ...this.config, ...config };

    // Update HTTP client if timeout or retries changed
    if (config.timeout || config.retries) {
      this.httpClient = new HttpClient(this.apiKey, {
        baseURL: FLUXEZ_BASE_URL,
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
  async insert(tableName: string, data: any | any[]) {
    return this.query.from(tableName).insert(data).execute();
  }

  /**
   * Select data from a table
   *
   * @param tableName Name of the table
   * @param columns Columns to select (default: '*')
   * @returns Query builder for chaining
   */
  select(tableName: string, columns: string = '*') {
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
  async update(tableName: string, data: any, where: string | Record<string, any>) {
    const query = this.query.from(tableName).update(data);

    if (typeof where === 'string') {
      // If where is a string, assume it's an ID
      query.where('id', '=', where);
    } else {
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
  async delete(tableName: string, where: string | Record<string, any>) {
    const query = this.query.from(tableName).delete();

    if (typeof where === 'string') {
      // If where is a string, assume it's an ID
      query.where('id', '=', where);
    } else {
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
  async findOne(tableName: string, where: Record<string, any>) {
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
  async findMany(
    tableName: string,
    where?: Record<string, any>,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      order?: 'asc' | 'desc';
    }
  ) {
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