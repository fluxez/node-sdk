"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = exports.ErrorCode = void 0;
var ErrorCode;
(function (ErrorCode) {
    // Client errors
    ErrorCode["BAD_REQUEST"] = "BAD_REQUEST";
    ErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ErrorCode["CONFLICT"] = "CONFLICT";
    ErrorCode["UNPROCESSABLE_ENTITY"] = "UNPROCESSABLE_ENTITY";
    ErrorCode["TOO_MANY_REQUESTS"] = "TOO_MANY_REQUESTS";
    // Server errors
    ErrorCode["INTERNAL_SERVER_ERROR"] = "INTERNAL_SERVER_ERROR";
    ErrorCode["NOT_IMPLEMENTED"] = "NOT_IMPLEMENTED";
    ErrorCode["BAD_GATEWAY"] = "BAD_GATEWAY";
    ErrorCode["SERVICE_UNAVAILABLE"] = "SERVICE_UNAVAILABLE";
    ErrorCode["GATEWAY_TIMEOUT"] = "GATEWAY_TIMEOUT";
    // Custom errors
    ErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    ErrorCode["TIMEOUT"] = "TIMEOUT";
    ErrorCode["INVALID_CONFIGURATION"] = "INVALID_CONFIGURATION";
    ErrorCode["INVALID_RESPONSE"] = "INVALID_RESPONSE";
    ErrorCode["QUERY_ERROR"] = "QUERY_ERROR";
    ErrorCode["STORAGE_ERROR"] = "STORAGE_ERROR";
    ErrorCode["SEARCH_ERROR"] = "SEARCH_ERROR";
    ErrorCode["ANALYTICS_ERROR"] = "ANALYTICS_ERROR";
    ErrorCode["CACHE_ERROR"] = "CACHE_ERROR";
    ErrorCode["AUTH_ERROR"] = "AUTH_ERROR";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
class ApiError extends Error {
    constructor(message, statusCode = 500, code, details) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.code = code || this.getCodeFromStatus(statusCode);
        this.details = details;
        this.timestamp = new Date();
        // Maintains proper stack trace for where our error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }
    getCodeFromStatus(status) {
        const statusMap = {
            400: ErrorCode.BAD_REQUEST,
            401: ErrorCode.UNAUTHORIZED,
            403: ErrorCode.FORBIDDEN,
            404: ErrorCode.NOT_FOUND,
            409: ErrorCode.CONFLICT,
            422: ErrorCode.UNPROCESSABLE_ENTITY,
            429: ErrorCode.TOO_MANY_REQUESTS,
            500: ErrorCode.INTERNAL_SERVER_ERROR,
            501: ErrorCode.NOT_IMPLEMENTED,
            502: ErrorCode.BAD_GATEWAY,
            503: ErrorCode.SERVICE_UNAVAILABLE,
            504: ErrorCode.GATEWAY_TIMEOUT,
        };
        return statusMap[status] || ErrorCode.INTERNAL_SERVER_ERROR;
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            details: this.details,
            timestamp: this.timestamp,
            stack: this.stack,
        };
    }
    static isApiError(error) {
        return error instanceof ApiError;
    }
    static fromAxiosError(error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            return new ApiError(error.response.data?.message || error.message, error.response.status, error.response.data?.code, error.response.data);
        }
        else if (error.request) {
            // The request was made but no response was received
            return new ApiError('No response received from server', 0, ErrorCode.NETWORK_ERROR, { request: error.request });
        }
        else {
            // Something happened in setting up the request that triggered an Error
            return new ApiError(error.message, 500, ErrorCode.INTERNAL_SERVER_ERROR, { originalError: error });
        }
    }
}
exports.ApiError = ApiError;
//# sourceMappingURL=errors.js.map