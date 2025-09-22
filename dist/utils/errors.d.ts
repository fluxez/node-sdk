export declare enum ErrorCode {
    BAD_REQUEST = "BAD_REQUEST",
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    NOT_FOUND = "NOT_FOUND",
    CONFLICT = "CONFLICT",
    UNPROCESSABLE_ENTITY = "UNPROCESSABLE_ENTITY",
    TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
    NOT_IMPLEMENTED = "NOT_IMPLEMENTED",
    BAD_GATEWAY = "BAD_GATEWAY",
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
    GATEWAY_TIMEOUT = "GATEWAY_TIMEOUT",
    NETWORK_ERROR = "NETWORK_ERROR",
    TIMEOUT = "TIMEOUT",
    INVALID_CONFIGURATION = "INVALID_CONFIGURATION",
    INVALID_RESPONSE = "INVALID_RESPONSE",
    QUERY_ERROR = "QUERY_ERROR",
    STORAGE_ERROR = "STORAGE_ERROR",
    SEARCH_ERROR = "SEARCH_ERROR",
    ANALYTICS_ERROR = "ANALYTICS_ERROR",
    CACHE_ERROR = "CACHE_ERROR",
    AUTH_ERROR = "AUTH_ERROR"
}
export declare class ApiError extends Error {
    readonly code: ErrorCode | string;
    readonly statusCode: number;
    readonly details?: any;
    readonly timestamp: Date;
    constructor(message: string, statusCode?: number, code?: ErrorCode | string, details?: any);
    private getCodeFromStatus;
    toJSON(): {
        name: string;
        message: string;
        code: string;
        statusCode: number;
        details: any;
        timestamp: Date;
        stack: string | undefined;
    };
    static isApiError(error: any): error is ApiError;
    static fromAxiosError(error: any): ApiError;
}
//# sourceMappingURL=errors.d.ts.map