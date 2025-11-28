/**
 * Fluxez SDK Constants
 * Single source of truth for all SDK configuration
 */
export declare const FLUXEZ_BASE_URL = "https://api-dev.fluxez.com/api/v1";
export declare const API_ENDPOINTS: {
    QUERY: string;
    EXECUTE: string;
    NATURAL_QUERY: string;
    TENANT_AUTH: {
        REGISTER: string;
        LOGIN: string;
        LOGOUT: string;
        VERIFY_EMAIL: string;
        FORGOT_PASSWORD: string;
        RESET_PASSWORD: string;
        REFRESH: string;
        SOCIAL: string;
        SOCIAL_LINK: string;
        SOCIAL_PROVIDERS: string;
        SOCIAL_CONFIGURE: string;
        TEAMS: string;
        TEAMS_INVITE: string;
        TEAMS_ACCEPT: string;
        TEAMS_MEMBER: string;
        TEAMS_MEMBER_ROLE: string;
    };
    SCHEMA: {
        REGISTER: string;
        GET: string;
        MIGRATE: string;
        VALIDATE: string;
        TABLES: string;
        TABLE_CONFIG: string;
        TABLE_DESCRIBE: string;
        TABLE_INDEX: string;
    };
    TENANT: {
        CREATE: string;
        PROJECT: string;
        APP: string;
        API_KEY: string;
        API_KEYS: string;
        PROJECTS: string;
        APPS: string;
        ORGANIZATION: string;
        QUOTA: string;
        BILLING: string;
    };
    STORAGE: {
        UPLOAD: string;
        DOWNLOAD: string;
        DELETE: string;
        LIST: string;
        PRESIGNED_URL: string;
    };
    SEARCH: {
        ELASTICSEARCH: string;
        QDRANT: string;
        HYBRID: string;
    };
    ANALYTICS: {
        QUERY: string;
        INSERT: string;
        AGGREGATE: string;
    };
    CACHE: {
        GET: string;
        SET: string;
        DELETE: string;
        FLUSH: string;
        STATS: string;
    };
    BRAIN: {
        UNDERSTAND: string;
        GENERATE: string;
        SUGGEST: string;
        LEARN: string;
    };
    WORKFLOW: {
        CREATE: string;
        EXECUTE: string;
        LIST: string;
        GET: string;
        UPDATE: string;
        DELETE: string;
        HISTORY: string;
    };
    EMAIL: {
        SEND: string;
        SEND_BULK: string;
        TEMPLATE: string;
        VERIFY: string;
    };
    QUEUE: {
        SEND: string;
        RECEIVE: string;
        DELETE: string;
        PURGE: string;
        STATS: string;
    };
};
export declare const SDK_VERSION = "1.0.0";
export declare const DEFAULT_TIMEOUT = 30000;
export declare const DEFAULT_MAX_RETRIES = 3;
export declare const DEFAULT_RETRY_DELAY = 1000;
export declare const API_KEY_HEADER = "x-api-key";
export declare const AUTH_HEADER = "Authorization";
export declare const CONTENT_TYPES: {
    JSON: string;
    FORM_DATA: string;
    OCTET_STREAM: string;
};
export declare const HTTP_METHODS: {
    GET: string;
    POST: string;
    PUT: string;
    DELETE: string;
    PATCH: string;
};
export declare const ERROR_CODES: {
    NETWORK_ERROR: string;
    TIMEOUT_ERROR: string;
    VALIDATION_ERROR: string;
    AUTHENTICATION_ERROR: string;
    AUTHORIZATION_ERROR: string;
    NOT_FOUND_ERROR: string;
    RATE_LIMIT_ERROR: string;
    SERVER_ERROR: string;
    UNKNOWN_ERROR: string;
};
export declare const RATE_LIMIT_HEADERS: {
    LIMIT: string;
    REMAINING: string;
    RESET: string;
};
//# sourceMappingURL=constants.d.ts.map