"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantAuthApiError = exports.TenantAuthNetworkError = exports.TenantAuthValidationError = exports.TeamRole = exports.SocialProvider = void 0;
// Social Provider Enum
var SocialProvider;
(function (SocialProvider) {
    SocialProvider["GOOGLE"] = "google";
    SocialProvider["GITHUB"] = "github";
    SocialProvider["FACEBOOK"] = "facebook";
    SocialProvider["APPLE"] = "apple";
    SocialProvider["TWITTER"] = "twitter";
})(SocialProvider || (exports.SocialProvider = SocialProvider = {}));
// Team Role Enum
var TeamRole;
(function (TeamRole) {
    TeamRole["OWNER"] = "owner";
    TeamRole["ADMIN"] = "admin";
    TeamRole["EDITOR"] = "editor";
    TeamRole["VIEWER"] = "viewer";
    TeamRole["MEMBER"] = "member";
})(TeamRole || (exports.TeamRole = TeamRole = {}));
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