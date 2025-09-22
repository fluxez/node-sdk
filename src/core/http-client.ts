import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { HttpClientConfig, FluxezError } from '../types';
import { FLUXEZ_BASE_URL } from '../constants';

export class HttpClient {
  private client: AxiosInstance;
  private config: HttpClientConfig;
  private apiKey: string;

  constructor(apiKey: string, config: Partial<HttpClientConfig> = {}) {
    this.apiKey = apiKey;
    this.config = {
      baseURL: config.baseURL || FLUXEZ_BASE_URL,
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
    };

    this.client = this.createAxiosInstance();
    this.setupInterceptors();
  }

  private createAxiosInstance(): AxiosInstance {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Fluxez-SDK/1.0.0',
    };

    // Handle API key authentication
    if (this.apiKey.startsWith('service_') || this.apiKey.startsWith('anon_')) {
      // Use lowercase x-api-key header for service_ and anon_ keys
      headers['x-api-key'] = this.apiKey;
    } else if (this.apiKey.startsWith('Bearer ')) {
      // Already has Bearer prefix
      headers['Authorization'] = this.apiKey;
    } else {
      // Default to x-api-key header
      headers['x-api-key'] = this.apiKey;
    }

    return axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers,
    });
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add timestamp for debugging
        (config as any).metadata = { startTime: Date.now() };
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Fluxez SDK] ${config.method?.toUpperCase()} ${config.url}`);
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(this.createFluxezError(error));
      }
    );

    // Response interceptor with retry logic
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response time in development
        if (process.env.NODE_ENV === 'development' && (response.config as any).metadata) {
          const duration = Date.now() - (response.config as any).metadata.startTime;
          console.log(`[Fluxez SDK] Response received in ${duration}ms`);
        }
        
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        
        // Retry logic for network errors and 5xx errors
        if (
          !originalRequest._retry &&
          originalRequest._retryCount < this.config.retries &&
          this.shouldRetry(error)
        ) {
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
      }
    );
  }

  private shouldRetry(error: AxiosError): boolean {
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

  private createFluxezError(error: AxiosError): FluxezError {
    if (error.response) {
      // Server responded with error status
      const responseData = error.response.data as any;
      const fluxezError = new Error(
        responseData?.message || `Request failed with status ${error.response.status}`
      ) as FluxezError;
      
      fluxezError.name = 'FluxezApiError';
      fluxezError.code = responseData?.code || `HTTP_${error.response.status}`;
      fluxezError.status = error.response.status;
      fluxezError.details = error.response.data;
      
      return fluxezError;
    } else if (error.request) {
      // Network error
      const fluxezError = new Error('Network error - no response received') as FluxezError;
      fluxezError.name = 'FluxezNetworkError';
      fluxezError.code = 'NETWORK_ERROR';
      fluxezError.status = 0;
      
      return fluxezError;
    } else {
      // Request setup error
      const fluxezError = new Error(`Request setup error: ${error.message}`) as FluxezError;
      fluxezError.name = 'FluxezRequestError';
      fluxezError.code = 'REQUEST_ERROR';
      
      return fluxezError;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  // Utility methods
  setHeader(key: string, value: string): void {
    this.client.defaults.headers.common[key] = value;
  }

  removeHeader(key: string): void {
    delete this.client.defaults.headers.common[key];
  }


  // Get the underlying axios instance if needed
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}