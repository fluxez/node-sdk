"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluxezClient = void 0;
const axios_1 = __importDefault(require("axios"));
const query_builder_1 = require("../query/query-builder");
const storage_client_1 = require("../storage/storage-client");
const search_client_1 = require("../search/search-client");
const analytics_client_1 = require("../analytics/analytics-client");
const cache_client_1 = require("../cache/cache-client");
const auth_client_1 = require("../auth/auth-client");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
const constants_1 = require("../constants");
class FluxezClient {
    constructor(config) {
        this.config = this.validateConfig(config);
        this.logger = new logger_1.Logger(config.debug || false, config.logger);
        // Initialize HTTP client
        this.httpClient = this.createHttpClient();
        // Initialize sub-clients
        this.query = new query_builder_1.QueryBuilder(this.httpClient, this.config, this.logger);
        this.storage = new storage_client_1.StorageClient(this.httpClient, this.config, this.logger);
        this.search = new search_client_1.SearchClient(this.httpClient, this.config, this.logger);
        this.analytics = new analytics_client_1.AnalyticsClient(this.httpClient, this.config, this.logger);
        this.cache = new cache_client_1.CacheClient(this.httpClient, this.config, this.logger);
        this.auth = new auth_client_1.AuthClient(this.httpClient, this.config, this.logger);
    }
    validateConfig(config) {
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
    createHttpClient() {
        const headers = {
            'Content-Type': 'application/json',
            ...this.config.headers,
        };
        // Add authentication headers
        if (this.config.apiKey) {
            // Use Bearer token format for cgx_ keys
            if (this.config.apiKey.startsWith('cgx_')) {
                headers['Authorization'] = `Bearer ${this.config.apiKey}`;
            }
            else {
                headers['X-API-Key'] = this.config.apiKey;
            }
        }
        const client = axios_1.default.create({
            baseURL: constants_1.FLUXEZ_BASE_URL,
            timeout: this.config.timeout,
            headers,
        });
        // Request interceptor for logging
        client.interceptors.request.use((config) => {
            this.logger.debug('Request', {
                method: config.method,
                url: config.url,
                data: config.data,
            });
            return config;
        }, (error) => {
            this.logger.error('Request Error', error);
            return Promise.reject(error);
        });
        // Response interceptor for error handling
        client.interceptors.response.use((response) => {
            this.logger.debug('Response', {
                status: response.status,
                data: response.data,
            });
            return response;
        }, async (error) => {
            if (error.response) {
                const apiError = new errors_1.ApiError(error.response.data?.message || 'Request failed', error.response.status, error.response.data?.code);
                this.logger.error('API Error', apiError);
                throw apiError;
            }
            else if (error.request) {
                const networkError = new errors_1.ApiError('Network error - no response received', 0, 'NETWORK_ERROR');
                this.logger.error('Network Error', networkError);
                throw networkError;
            }
            else {
                this.logger.error('Unknown Error', error);
                throw error;
            }
        });
        return client;
    }
    /**
     * Update authentication credentials
     */
    setAuth(apiKey) {
        this.config.apiKey = apiKey;
        // Use Bearer token format for cgx_ keys
        if (apiKey.startsWith('cgx_')) {
            this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
            delete this.httpClient.defaults.headers.common['X-API-Key'];
        }
        else {
            this.httpClient.defaults.headers.common['X-API-Key'] = apiKey;
            delete this.httpClient.defaults.headers.common['Authorization'];
        }
    }
    /**
     * Set project context
     */
    setProject(projectId) {
        this.httpClient.defaults.headers.common['X-Project-Id'] = projectId;
    }
    /**
     * Set organization context
     */
    setOrganization(organizationId) {
        this.httpClient.defaults.headers.common['X-Organization-Id'] = organizationId;
    }
    /**
     * Execute raw SQL query
     */
    async raw(sql, params) {
        const response = await this.httpClient.post('/api/v1/query', {
            sql,
            params,
        });
        return response.data;
    }
    /**
     * Execute natural language query
     */
    async natural(query) {
        const response = await this.httpClient.post('/api/v1/query/natural', {
            query,
        });
        return response.data;
    }
    /**
     * Health check
     */
    async health() {
        const response = await this.httpClient.get('/health');
        return response.data;
    }
}
exports.FluxezClient = FluxezClient;
//# sourceMappingURL=client.js.map