import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { HttpClientConfig } from '../types';
export declare class HttpClient {
    private client;
    private config;
    private apiKey;
    constructor(apiKey: string, config?: Partial<HttpClientConfig>);
    private createAxiosInstance;
    private setupInterceptors;
    private shouldRetry;
    private createFluxezError;
    private sleep;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    setHeader(key: string, value: string): void;
    removeHeader(key: string): void;
    getAxiosInstance(): AxiosInstance;
}
//# sourceMappingURL=http-client.d.ts.map