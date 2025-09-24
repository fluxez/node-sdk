import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { FluxezConfig } from '../types/config';
import { QueryBuilder } from '../query/query-builder';
import { StorageClient } from '../storage/storage-client';
import { SearchClient } from '../search/search-client';
import { AnalyticsClient } from '../analytics/analytics-client';
import { CacheClient } from '../cache/cache-client';
import { AuthClient } from '../auth/auth-client';
import { ApiError } from '../utils/errors';
import { Logger } from '../utils/logger';
import { FLUXEZ_BASE_URL } from '../constants';

export class FluxezClient {
  private config: FluxezConfig;
  private httpClient: AxiosInstance;
  private logger: Logger;
  
  // Sub-clients
  public query: QueryBuilder;
  public storage: StorageClient;
  public search: SearchClient;
  public analytics: AnalyticsClient;
  public cache: CacheClient;
  public auth: AuthClient;
  
  constructor(config: FluxezConfig) {
    this.config = this.validateConfig(config);
    this.logger = new Logger(config.debug || false, config.logger);
    
    // Initialize HTTP client
    this.httpClient = this.createHttpClient();
    
    // Initialize sub-clients
    this.query = new QueryBuilder(this.httpClient, this.config, this.logger);
    this.storage = new StorageClient(this.httpClient, this.config, this.logger);
    this.search = new SearchClient(this.httpClient, this.config, this.logger);
    this.analytics = new AnalyticsClient(this.httpClient, this.config, this.logger);
    this.cache = new CacheClient(this.httpClient, this.config, this.logger);
    this.auth = new AuthClient(this.httpClient, this.config, this.logger);
  }
  
  private validateConfig(config: FluxezConfig): FluxezConfig {
    if (!config.apiKey) {
      throw new Error('apiKey is required in FluxezConfig');
    }
    
    // Set defaults
    return {
      ...config,
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3,
      headers: config.headers || {},
    };
  }
  
  private createHttpClient(): AxiosInstance {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.headers,
    };
    
    // Add authentication headers
    if (this.config.apiKey) {
      // Use Bearer token format for cgx_ keys
      if (this.config.apiKey.startsWith('cgx_')) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      } else {
        headers['X-API-Key'] = this.config.apiKey;
      }
    }
    
    const client = axios.create({
      baseURL: FLUXEZ_BASE_URL,
      timeout: this.config.timeout,
      headers,
    });
    
    // Request interceptor for logging
    client.interceptors.request.use(
      (config) => {
        this.logger.debug('Request', {
          method: config.method,
          url: config.url,
          data: config.data,
        });
        return config;
      },
      (error) => {
        this.logger.error('Request Error', error);
        return Promise.reject(error);
      }
    );
    
    // Response interceptor for error handling
    client.interceptors.response.use(
      (response) => {
        this.logger.debug('Response', {
          status: response.status,
          data: response.data,
        });
        return response;
      },
      async (error) => {
        if (error.response) {
          const apiError = new ApiError(
            error.response.data?.message || 'Request failed',
            error.response.status,
            error.response.data?.code
          );
          this.logger.error('API Error', apiError);
          throw apiError;
        } else if (error.request) {
          const networkError = new ApiError(
            'Network error - no response received',
            0,
            'NETWORK_ERROR'
          );
          this.logger.error('Network Error', networkError);
          throw networkError;
        } else {
          this.logger.error('Unknown Error', error);
          throw error;
        }
      }
    );
    
    return client;
  }
  
  /**
   * Update authentication credentials
   */
  public setAuth(apiKey: string): void {
    this.config.apiKey = apiKey;
    
    // Use Bearer token format for cgx_ keys
    if (apiKey.startsWith('cgx_')) {
      this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
      delete this.httpClient.defaults.headers.common['X-API-Key'];
    } else {
      this.httpClient.defaults.headers.common['X-API-Key'] = apiKey;
      delete this.httpClient.defaults.headers.common['Authorization'];
    }
  }
  
  /**
   * Set project context
   */
  public setProject(projectId: string): void {
    this.httpClient.defaults.headers.common['X-Project-Id'] = projectId;
  }
  
  /**
   * Set organization context
   */
  public setOrganization(organizationId: string): void {
    this.httpClient.defaults.headers.common['X-Organization-Id'] = organizationId;
  }
  
  /**
   * Execute raw SQL query
   */
  public async raw(sql: string, params?: any[]): Promise<any> {
    const response = await this.httpClient.post('/query', {
      sql,
      params,
    });
    return response.data;
  }
  
  /**
   * Execute natural language query
   */
  public async natural(query: string): Promise<any> {
    const response = await this.httpClient.post('/query/natural', {
      query,
    });
    return response.data;
  }
  
  /**
   * Health check
   */
  public async health(): Promise<{ status: string; version: string }> {
    const response = await this.httpClient.get('/health');
    return response.data;
  }
}