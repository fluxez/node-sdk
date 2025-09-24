/**
 * Core types for Fluxez SDK
 */

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  details?: any;
}

// Authentication Types
export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  metadata?: Record<string, any>;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

// Query Types
export interface QueryParams {
  sql: string;
  params?: any[];
}

export interface QueryResult {
  rows: any[];
  fields?: string[];
  rowCount: number;
  command?: string;
}

export interface NaturalQueryParams {
  query: string;
  context?: string;
}

// Search Types
export interface SearchQuery {
  index?: string;
  query: string;
  filters?: Record<string, any>;
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  limit?: number;
  offset?: number;
  highlight?: boolean;
}

export interface SearchResult {
  hits: Array<{
    id: string;
    score: number;
    source: any;
    highlight?: Record<string, string[]>;
  }>;
  total: number;
  maxScore: number;
  took: number;
}

export interface VectorSearchQuery {
  collection: string;
  vector: number[];
  limit?: number;
  filter?: Record<string, any>;
  threshold?: number;
}

export interface VectorSearchResult {
  id: string;
  score: number;
  payload: any;
}

export interface TableField {
  name: string;
  type: 'string' | 'text' | 'integer' | 'decimal' | 'boolean' | 'json' | 'jsonb' | 'timestamp' | 'uuid' | 'vector';
  nullable?: boolean;
  unique?: boolean;
  default?: any;
  primary_key?: boolean;
  references?: {
    table: string;
    field: string;
  };
  smart_pattern?: string;
  triggers?: string[] | false;
}


export interface TableSchema {
  name: string;
  fields: TableField[];
  indexes?: TableIndex[];
  metadata?: {
    realtime?: boolean;
    triggers?: boolean;
    searchable?: boolean;
  };
}

export interface TableIndex {
  name?: string;
  fields: string[];
  unique?: boolean;
  method?: 'btree' | 'hash' | 'gin' | 'gist';
}

export interface ColumnDefinition {
  name: string;
  type: string;
  length?: number;
  precision?: number;
  scale?: number;
  required?: boolean;
  unique?: boolean;
  primaryKey?: boolean;
  defaultValue?: any;
  min?: number;
  max?: number;
  foreignKey?: {
    table: string;
    column: string;
  };
  // Search & AI properties
  searchable?: boolean;  // Index for full-text search
  embeddable?: boolean;  // Generate embeddings for semantic search
  searchWeight?: number; // Boost factor for search relevance (1.0 = normal, 2.0 = double weight)
}

export interface IndexDefinition {
  name: string;
  columns: string[];
  type?: 'btree' | 'hash' | 'gin' | 'gist' | 'hnsw' | 'ivfflat';
  unique?: boolean;
}

export interface ConstraintDefinition {
  name: string;
  type: 'primary_key' | 'foreign_key' | 'unique' | 'check' | 'not_null';
  columns: string[];
  definition?: string;
  referenced_table?: string;
  referenced_columns?: string[];
}


// Realtime Types
export interface RealtimeEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  data: any;
  old?: any;
  timestamp: string;
}

export interface RealtimeSubscription {
  id: string;
  type: 'database' | 'workflow' | 'presence' | 'analytics' | 'logic';
  callback: (data: any) => void;
  active: boolean;
}

export interface RealtimeChannel {
  name: string;
  callback: (message: any) => void;
  subscribers: number;
}

export interface RealtimeMessage {
  type: 'channel_message' | 'database_change' | 'workflow_event' | 'user_presence';
  channel: string;
  data: any;
}

export interface RealtimeConnection {
  connected: boolean;
  subscriptions: RealtimeSubscription[];
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  subscribe(table: string, callback: (event: RealtimeEvent) => void, filter?: Record<string, any>): string;
  unsubscribe(subscriptionId: string): void;
}

// Storage Types
export interface UploadOptions {
  fileName?: string;
  contentType?: string;
  metadata?: Record<string, string>;
  acl?: 'private' | 'public-read' | 'public-read-write';
}

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
  size: number;
  contentType: string;
  etag: string;
}

export interface SignedUrlOptions {
  key: string;
  expiresIn?: number;
  operation?: 'getObject' | 'putObject';
}

export interface FileMetadata {
  key: string;
  size: number;
  lastModified: string;
  contentType: string;
  etag: string;
  metadata?: Record<string, string>;
}

// Analytics Types
export interface AnalyticsQuery {
  table?: string;
  select: string[];
  where?: Record<string, any>;
  groupBy?: string[];
  orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  limit?: number;
  dateRange?: {
    start: string;
    end: string;
    field?: string;
  };
}

export interface AnalyticsResult {
  data: any[];
  summary?: {
    total: number;
    aggregations?: Record<string, any>;
  };
  query: AnalyticsQuery;
  executionTime: number;
}

export interface EventData {
  event: string;
  userId?: string;
  sessionId?: string;
  timestamp?: string;
  properties?: Record<string, any>;
  traits?: Record<string, any>;
}

// Cache Types
export interface CacheOperation {
  key: string;
  value?: any;
  ttl?: number;
  operation: 'get' | 'set' | 'delete' | 'exists' | 'expire';
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalKeys: number;
  memoryUsage?: number;
}

export interface CacheOptions {
  prefix?: string;
  ttl?: number;
  compress?: boolean;
  serialize?: boolean;
}

// Workflow Types
export interface WorkflowDefinition {
  id?: string;
  name: string;
  description?: string;
  trigger: {
    type: 'manual' | 'schedule' | 'webhook' | 'event';
    config: any;
  };
  steps: WorkflowStep[];
  variables?: Record<string, any>;
  settings?: {
    timeout?: number;
    retries?: number;
    errorHandling?: 'stop' | 'continue' | 'retry';
  };
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'condition' | 'loop' | 'parallel';
  connector?: string;
  action?: string;
  config: any;
  position: { x: number; y: number };
  connections?: string[];
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  input?: any;
  output?: any;
  steps: Array<{
    stepId: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    startedAt?: string;
    completedAt?: string;
    input?: any;
    output?: any;
    error?: string;
  }>;
}

// Connector Types
export interface ConnectorConfig {
  id?: string;
  connectorType: string;
  name: string;
  description?: string;
  config: Record<string, any>;
  credentials?: Record<string, any>;
  isActive: boolean;
  tags?: string[];
}

export interface ConnectorMetadata {
  type: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  website?: string;
  documentation?: string;
  configSchema: any;
  credentialsSchema?: any;
  actions: Array<{
    name: string;
    description: string;
    inputSchema: any;
    outputSchema: any;
  }>;
}

// Tenant Management Types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  ownerId: string;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  databaseName: string;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface App {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  databaseName: string;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  type: 'service_role' | 'anon';
  projectId?: string;
  appId?: string;
  permissions?: string[];
  expiresAt?: string;
  lastUsedAt?: string;
  createdAt: string;
}

// Error Types
export interface FluxezError extends Error {
  code?: string;
  status?: number;
  details?: any;
}

// HTTP Client Configuration
export interface HttpClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

// SDK Configuration  
export interface FluxezClientConfig {
  timeout?: number;
  retries?: number;
  debug?: boolean;
  headers?: Record<string, string>;
  organizationId?: string;
  projectId?: string;
  appId?: string;
}