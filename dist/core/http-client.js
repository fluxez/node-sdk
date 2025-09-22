"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("../constants");
class HttpClient {
    constructor(apiKey, config = {}) {
        this.apiKey = apiKey;
        this.config = {
            baseURL: config.baseURL || constants_1.FLUXEZ_BASE_URL,
            timeout: config.timeout || 30000,
            retries: config.retries || 3,
            retryDelay: config.retryDelay || 1000,
        };
        this.client = this.createAxiosInstance();
        this.setupInterceptors();
    }
    createAxiosInstance() {
        const headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'Fluxez-SDK/1.0.0',
        };
        // Handle API key authentication
        if (this.apiKey.startsWith('service_') || this.apiKey.startsWith('anon_')) {
            // Use lowercase x-api-key header for service_ and anon_ keys
            headers['x-api-key'] = this.apiKey;
        }
        else if (this.apiKey.startsWith('Bearer ')) {
            // Already has Bearer prefix
            headers['Authorization'] = this.apiKey;
        }
        else {
            // Default to x-api-key header
            headers['x-api-key'] = this.apiKey;
        }
        return axios_1.default.create({
            baseURL: this.config.baseURL,
            timeout: this.config.timeout,
            headers,
        });
    }
    setupInterceptors() {
        // Request interceptor
        this.client.interceptors.request.use((config) => {
            // Add timestamp for debugging
            config.metadata = { startTime: Date.now() };
            if (process.env.NODE_ENV === 'development') {
                console.log(`[Fluxez SDK] ${config.method?.toUpperCase()} ${config.url}`);
            }
            return config;
        }, (error) => {
            return Promise.reject(this.createFluxezError(error));
        });
        // Response interceptor with retry logic
        this.client.interceptors.response.use((response) => {
            // Log response time in development
            if (process.env.NODE_ENV === 'development' && response.config.metadata) {
                const duration = Date.now() - response.config.metadata.startTime;
                console.log(`[Fluxez SDK] Response received in ${duration}ms`);
            }
            return response;
        }, async (error) => {
            const originalRequest = error.config;
            // Retry logic for network errors and 5xx errors
            if (!originalRequest._retry &&
                originalRequest._retryCount < this.config.retries &&
                this.shouldRetry(error)) {
                originalRequest._retry = true;
                originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
                // Wait before retrying with exponential backoff
                const delay = this.config.retryDelay * Math.pow(2, originalRequest._retryCount - 1);
                await this.sleep(delay);
                if (process.env.NODE_ENV === 'development') {
                    console.log(`[Fluxez SDK] Retrying request (${originalRequest._retryCount}/${this.config.retries})`);
                }
                return this.client(originalRequest);
            }
            return Promise.reject(this.createFluxezError(error));
        });
    }
    shouldRetry(error) {
        // Retry on network errors
        if (!error.response) {
            return true;
        }
        // Retry on 5xx server errors
        if (error.response.status >= 500) {
            return true;
        }
        // Retry on specific 4xx errors
        if (error.response.status === 408 || error.response.status === 429) {
            return true;
        }
        return false;
    }
    createFluxezError(error) {
        if (error.response) {
            // Server responded with error status
            const responseData = error.response.data;
            const fluxezError = new Error(responseData?.message || `Request failed with status ${error.response.status}`);
            fluxezError.name = 'FluxezApiError';
            fluxezError.code = responseData?.code || `HTTP_${error.response.status}`;
            fluxezError.status = error.response.status;
            fluxezError.details = error.response.data;
            return fluxezError;
        }
        else if (error.request) {
            // Network error
            const fluxezError = new Error('Network error - no response received');
            fluxezError.name = 'FluxezNetworkError';
            fluxezError.code = 'NETWORK_ERROR';
            fluxezError.status = 0;
            return fluxezError;
        }
        else {
            // Request setup error
            const fluxezError = new Error(`Request setup error: ${error.message}`);
            fluxezError.name = 'FluxezRequestError';
            fluxezError.code = 'REQUEST_ERROR';
            return fluxezError;
        }
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    // HTTP Methods
    async get(url, config) {
        const response = await this.client.get(url, config);
        return response.data;
    }
    async post(url, data, config) {
        const response = await this.client.post(url, data, config);
        return response.data;
    }
    async put(url, data, config) {
        const response = await this.client.put(url, data, config);
        return response.data;
    }
    async patch(url, data, config) {
        const response = await this.client.patch(url, data, config);
        return response.data;
    }
    async delete(url, config) {
        const response = await this.client.delete(url, config);
        return response.data;
    }
    // Utility methods
    setHeader(key, value) {
        this.client.defaults.headers.common[key] = value;
    }
    removeHeader(key) {
        delete this.client.defaults.headers.common[key];
    }
    // Get the underlying axios instance if needed
    getAxiosInstance() {
        return this.client;
    }
}
exports.HttpClient = HttpClient;
//# sourceMappingURL=http-client.js.map