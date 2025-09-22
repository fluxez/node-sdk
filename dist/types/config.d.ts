export interface FluxezConfig {
    apiKey: string;
    storage?: StorageConfig;
    search?: SearchConfig;
    analytics?: AnalyticsConfig;
    cache?: CacheConfig;
    timeout?: number;
    maxRetries?: number;
    headers?: Record<string, string>;
    debug?: boolean;
    logger?: (level: string, message: string, data?: any) => void;
}
export interface AuthConfig {
    type: 'apikey' | 'jwt';
    credentials: string;
}
export interface StorageConfig {
    bucket?: string;
    region?: string;
    endpoint?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    sessionToken?: string;
    maxFileSize?: number;
    allowedMimeTypes?: string[];
    signedUrlExpiry?: number;
    publicBucket?: boolean;
    publicUrl?: string;
}
export interface SearchConfig {
    index?: string;
    analyzer?: string;
    fuzziness?: number;
    highlight?: boolean;
}
export interface AnalyticsConfig {
    database?: string;
    table?: string;
    batchSize?: number;
    flushInterval?: number;
}
export interface CacheConfig {
    prefix?: string;
    ttl?: number;
    namespace?: string;
}
//# sourceMappingURL=config.d.ts.map