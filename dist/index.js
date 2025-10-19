"use strict";
/**
 * Fluxez Node SDK
 * Official Node.js SDK for Fluxez Platform
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.ErrorCode = exports.ApiError = exports.PaymentClient = exports.MigrationCLI = exports.Migrator = exports.ChatbotClient = exports.EdgeFunctionsClient = exports.DocumentsClient = exports.VideoConferencingClient = exports.PushClient = exports.RealtimeClient = exports.SchemaModule = exports.SchemaClient = exports.WorkflowClient = exports.AIModule = exports.QueueClient = exports.EmailClient = exports.TenantAuthValidationError = exports.TenantAuthNetworkError = exports.TenantAuthApiError = exports.TeamRole = exports.SocialProvider = exports.TenantAuthClient = exports.AuthClient = exports.CacheClient = exports.AnalyticsClient = exports.SearchClient = exports.StorageClient = exports.QueryBuilder = exports.FluxezClientLegacy = exports.HttpClient = exports.FluxezClient = void 0;
// Core Client
var fluxez_client_1 = require("./fluxez-client");
Object.defineProperty(exports, "FluxezClient", { enumerable: true, get: function () { return fluxez_client_1.FluxezClient; } });
var http_client_1 = require("./core/http-client");
Object.defineProperty(exports, "HttpClient", { enumerable: true, get: function () { return http_client_1.HttpClient; } });
// Legacy client (for backward compatibility)
var client_1 = require("./core/client");
Object.defineProperty(exports, "FluxezClientLegacy", { enumerable: true, get: function () { return client_1.FluxezClient; } });
// Core Types
__exportStar(require("./types"), exports);
// Query Builder
var query_builder_1 = require("./query/query-builder");
Object.defineProperty(exports, "QueryBuilder", { enumerable: true, get: function () { return query_builder_1.QueryBuilder; } });
// Storage
var storage_client_1 = require("./storage/storage-client");
Object.defineProperty(exports, "StorageClient", { enumerable: true, get: function () { return storage_client_1.StorageClient; } });
// Search
var search_client_1 = require("./search/search-client");
Object.defineProperty(exports, "SearchClient", { enumerable: true, get: function () { return search_client_1.SearchClient; } });
// Analytics
var analytics_client_1 = require("./analytics/analytics-client");
Object.defineProperty(exports, "AnalyticsClient", { enumerable: true, get: function () { return analytics_client_1.AnalyticsClient; } });
// Cache
var cache_client_1 = require("./cache/cache-client");
Object.defineProperty(exports, "CacheClient", { enumerable: true, get: function () { return cache_client_1.CacheClient; } });
// Auth
var auth_client_1 = require("./auth/auth-client");
Object.defineProperty(exports, "AuthClient", { enumerable: true, get: function () { return auth_client_1.AuthClient; } });
// Tenant Auth
var tenant_auth_client_1 = require("./tenant-auth/tenant-auth-client");
Object.defineProperty(exports, "TenantAuthClient", { enumerable: true, get: function () { return tenant_auth_client_1.TenantAuthClient; } });
var tenant_auth_types_1 = require("./types/tenant-auth.types");
Object.defineProperty(exports, "SocialProvider", { enumerable: true, get: function () { return tenant_auth_types_1.SocialProvider; } });
Object.defineProperty(exports, "TeamRole", { enumerable: true, get: function () { return tenant_auth_types_1.TeamRole; } });
Object.defineProperty(exports, "TenantAuthApiError", { enumerable: true, get: function () { return tenant_auth_types_1.TenantAuthApiError; } });
Object.defineProperty(exports, "TenantAuthNetworkError", { enumerable: true, get: function () { return tenant_auth_types_1.TenantAuthNetworkError; } });
Object.defineProperty(exports, "TenantAuthValidationError", { enumerable: true, get: function () { return tenant_auth_types_1.TenantAuthValidationError; } });
// Email
var email_1 = require("./modules/email");
Object.defineProperty(exports, "EmailClient", { enumerable: true, get: function () { return email_1.EmailClient; } });
// Queue
var queue_1 = require("./modules/queue");
Object.defineProperty(exports, "QueueClient", { enumerable: true, get: function () { return queue_1.QueueClient; } });
// AI Module
var ai_1 = require("./modules/ai");
Object.defineProperty(exports, "AIModule", { enumerable: true, get: function () { return ai_1.AIModule; } });
// Workflow
var workflow_1 = require("./modules/workflow");
Object.defineProperty(exports, "WorkflowClient", { enumerable: true, get: function () { return workflow_1.WorkflowClient; } });
// Schema Management
var schema_client_1 = require("./schema/schema-client");
Object.defineProperty(exports, "SchemaClient", { enumerable: true, get: function () { return schema_client_1.SchemaClient; } });
var schema_1 = require("./schema/schema");
Object.defineProperty(exports, "SchemaModule", { enumerable: true, get: function () { return schema_1.SchemaModule; } });
// Realtime
var realtime_1 = require("./modules/realtime");
Object.defineProperty(exports, "RealtimeClient", { enumerable: true, get: function () { return realtime_1.RealtimeClient; } });
// Push Notifications
var push_1 = require("./modules/push");
Object.defineProperty(exports, "PushClient", { enumerable: true, get: function () { return push_1.PushClient; } });
// Video Conferencing
var video_conferencing_1 = require("./modules/video-conferencing");
Object.defineProperty(exports, "VideoConferencingClient", { enumerable: true, get: function () { return video_conferencing_1.VideoConferencingClient; } });
// Documents
var documents_1 = require("./modules/documents");
Object.defineProperty(exports, "DocumentsClient", { enumerable: true, get: function () { return documents_1.DocumentsClient; } });
// Edge Functions
var edge_functions_1 = require("./modules/edge-functions");
Object.defineProperty(exports, "EdgeFunctionsClient", { enumerable: true, get: function () { return edge_functions_1.EdgeFunctionsClient; } });
// Chatbot
var chatbot_1 = require("./modules/chatbot");
Object.defineProperty(exports, "ChatbotClient", { enumerable: true, get: function () { return chatbot_1.ChatbotClient; } });
// Migration
var migrator_1 = require("./migration/migrator");
Object.defineProperty(exports, "Migrator", { enumerable: true, get: function () { return migrator_1.Migrator; } });
var cli_1 = require("./migration/cli");
Object.defineProperty(exports, "MigrationCLI", { enumerable: true, get: function () { return cli_1.MigrationCLI; } });
// Payment
var payment_1 = require("./modules/payment");
Object.defineProperty(exports, "PaymentClient", { enumerable: true, get: function () { return payment_1.PaymentClient; } });
// Utils
var errors_1 = require("./utils/errors");
Object.defineProperty(exports, "ApiError", { enumerable: true, get: function () { return errors_1.ApiError; } });
Object.defineProperty(exports, "ErrorCode", { enumerable: true, get: function () { return errors_1.ErrorCode; } });
var logger_1 = require("./utils/logger");
Object.defineProperty(exports, "Logger", { enumerable: true, get: function () { return logger_1.Logger; } });
//# sourceMappingURL=index.js.map