"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantAuthApiError = exports.TenantAuthNetworkError = exports.TenantAuthValidationError = void 0;
// Auth validation errors
class TenantAuthValidationError extends Error {
    constructor(message, details) {
        super(message);
        this.code = 'VALIDATION_ERROR';
        this.statusCode = 400;
        this.name = 'TenantAuthValidationError';
        this.details = details;
    }
}
exports.TenantAuthValidationError = TenantAuthValidationError;
// Auth network errors
class TenantAuthNetworkError extends Error {
    constructor(message = 'Network error - no response received') {
        super(message);
        this.code = 'NETWORK_ERROR';
        this.statusCode = 0;
        this.name = 'TenantAuthNetworkError';
    }
}
exports.TenantAuthNetworkError = TenantAuthNetworkError;
// Auth API errors
class TenantAuthApiError extends Error {
    constructor(message, statusCode, code, details) {
        super(message);
        this.name = 'TenantAuthApiError';
        this.statusCode = statusCode;
        this.code = code || 'API_ERROR';
        this.details = details;
    }
}
exports.TenantAuthApiError = TenantAuthApiError;
//# sourceMappingURL=tenant-auth.types.js.map