export interface FluxezConfig {
  apiKey: string; // Required - API key is mandatory

  // Optional service-specific configurations
  storage?: StorageConfig;
  search?: SearchConfig;
  analytics?: AnalyticsConfig;
  cache?: CacheConfig;

  // Request configuration
  timeout?: number;
  maxRetries?: number;
  headers?: Record<string, string>;

  // Frontend URL for email links (password reset, email verification, etc.)
  frontendUrl?: string;

  // Debugging
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
  
  // Upload settings
  maxFileSize?: number;
  allowedMimeTypes?: string[];
  
  // URL settings
  signedUrlExpiry?: number; // in seconds
  publicBucket?: boolean;
  publicUrl?: string; // Base URL for public file access
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
  flushInterval?: number; // in ms
}

export interface CacheConfig {
  prefix?: string;
  ttl?: number; // default TTL in seconds
  namespace?: string;
}