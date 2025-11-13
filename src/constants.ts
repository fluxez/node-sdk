/**
 * Fluxez SDK Constants
 * Single source of truth for all SDK configuration
 */

// API Base URL - will be patched for production deployments
export const FLUXEZ_BASE_URL = 'https://api-dev.fluxez.com/api/v1';

// API Endpoints
export const API_ENDPOINTS = {
  // Data operations
  QUERY: '/query',
  EXECUTE: '/execute',
  NATURAL_QUERY: '/natural-query',
  
  // Tenant Auth
  TENANT_AUTH: {
    REGISTER: '/tenant-auth/register',
    LOGIN: '/tenant-auth/login',
    LOGOUT: '/tenant-auth/logout',
    VERIFY_EMAIL: '/tenant-auth/verify-email',
    FORGOT_PASSWORD: '/tenant-auth/forgot-password',
    RESET_PASSWORD: '/tenant-auth/reset-password',
    REFRESH: '/tenant-auth/refresh',
    SOCIAL: '/tenant-auth/social',
    SOCIAL_LINK: '/tenant-auth/social/link',
    SOCIAL_PROVIDERS: '/tenant-auth/social/providers',
    SOCIAL_CONFIGURE: '/tenant-auth/social/configure',
    TEAMS: '/tenant-auth/teams',
    TEAMS_INVITE: '/tenant-auth/teams/invite',
    TEAMS_ACCEPT: '/tenant-auth/teams/accept-invitation',
    TEAMS_MEMBER: '/tenant-auth/teams/member',
    TEAMS_MEMBER_ROLE: '/tenant-auth/teams/member/role',
  },
  
  // Schema management
  SCHEMA: {
    REGISTER: '/schema/register',
    GET: '/schema',
    MIGRATE: '/schema/migrate',
    VALIDATE: '/schema/validate',
    TABLES: '/schema/tables',
    TABLE_CONFIG: '/table/config',
    TABLE_DESCRIBE: '/table/describe',
    TABLE_INDEX: '/table/index',
  },
  
  // Tenant management
  TENANT: {
    CREATE: '/tenant/create',
    PROJECT: '/tenant/project',
    APP: '/tenant/app',
    API_KEY: '/tenant/api-key/create',
    API_KEYS: '/tenant/api-keys',
    PROJECTS: '/tenant/projects',
    APPS: '/tenant/apps',
    ORGANIZATION: '/tenant/organization',
    QUOTA: '/tenant/quota',
    BILLING: '/tenant/billing',
  },
  
  // Storage
  STORAGE: {
    UPLOAD: '/storage/upload',
    DOWNLOAD: '/storage/download',
    DELETE: '/storage/delete',
    LIST: '/storage/list',
    PRESIGNED_URL: '/storage/presigned-url',
  },
  
  // Search
  SEARCH: {
    ELASTICSEARCH: '/search/elasticsearch',
    QDRANT: '/search/qdrant',
    HYBRID: '/search/hybrid',
  },
  
  // Analytics
  ANALYTICS: {
    QUERY: '/analytics/query',
    INSERT: '/analytics/insert',
    AGGREGATE: '/analytics/aggregate',
  },
  
  // Cache
  CACHE: {
    GET: '/cache/get',
    SET: '/cache/set',
    DELETE: '/cache/delete',
    FLUSH: '/cache/flush',
    STATS: '/cache/stats',
  },
  
  // Brain/AI
  BRAIN: {
    UNDERSTAND: '/brain/understand',
    GENERATE: '/brain/generate',
    SUGGEST: '/brain/suggest',
    LEARN: '/brain/learn',
  },
  
  // Workflow
  WORKFLOW: {
    CREATE: '/workflow/create',
    EXECUTE: '/workflow/execute',
    LIST: '/workflow/list',
    GET: '/workflow',
    UPDATE: '/workflow',
    DELETE: '/workflow',
    HISTORY: '/workflow/history',
  },
  
  // Email
  EMAIL: {
    SEND: '/email/send',
    SEND_BULK: '/email/send-bulk',
    TEMPLATE: '/email/template',
    VERIFY: '/email/verify',
  },
  
  // Queue
  QUEUE: {
    SEND: '/queue/send',
    RECEIVE: '/queue/receive',
    DELETE: '/queue/delete',
    PURGE: '/queue/purge',
    STATS: '/queue/stats',
  },
};

// SDK Version
export const SDK_VERSION = '1.0.0';

// Default timeout (30 seconds)
export const DEFAULT_TIMEOUT = 30000;

// Default retry attempts
export const DEFAULT_MAX_RETRIES = 3;

// Default retry delay (ms)
export const DEFAULT_RETRY_DELAY = 1000;

// API Key header name
export const API_KEY_HEADER = 'x-api-key';

// Authorization header name
export const AUTH_HEADER = 'Authorization';

// Content types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  OCTET_STREAM: 'application/octet-stream',
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
};

// Error codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

// Rate limit headers
export const RATE_LIMIT_HEADERS = {
  LIMIT: 'X-RateLimit-Limit',
  REMAINING: 'X-RateLimit-Remaining',
  RESET: 'X-RateLimit-Reset',
};