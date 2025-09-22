/**
 * Fluxez Node SDK
 * Official Node.js SDK for Fluxez Platform
 */
export { FluxezClient } from './fluxez-client';
export { HttpClient } from './core/http-client';
export { FluxezClient as FluxezClientLegacy } from './core/client';
export { FluxezConfig, AuthConfig, StorageConfig } from './types/config';
export * from './types';
export { QueryBuilder } from './query/query-builder';
export { SelectQuery, InsertQuery, UpdateQuery, DeleteQuery, JoinType, OrderDirection, AggregateFunction } from './query/types';
export { StorageClient } from './storage/storage-client';
export { UploadOptions, UploadResult, SignedUrlOptions, ListFilesOptions, FileMetadata } from './storage/types';
export { SearchClient } from './search/search-client';
export { SearchQuery, SearchResult, VectorSearchQuery, SearchOptions } from './search/types';
export { AnalyticsClient } from './analytics/analytics-client';
export { AnalyticsQuery, AnalyticsResult, EventData, AggregationType } from './analytics/types';
export { CacheClient } from './cache/cache-client';
export { CacheOperation, CacheStats, CacheOptions } from './cache/types';
export { AuthClient } from './auth/auth-client';
export { LoginCredentials, RegisterData, AuthToken, User } from './auth/types';
export { TenantAuthClient } from './tenant-auth/tenant-auth-client';
export { TenantRegisterRequest, TenantLoginRequest, TenantVerifyEmailRequest, TenantForgotPasswordRequest, TenantResetPasswordRequest, TenantSocialAuthRequest, TenantLinkSocialRequest, TenantRefreshTokenRequest, TenantLogoutRequest, CreateTeamRequest, InviteMemberRequest, AcceptInvitationRequest, RemoveMemberRequest, UpdateMemberRoleRequest, ConfigureSocialProviderRequest, TenantAuthResponse, TenantUser, TenantTeam, TenantTeamMember, TenantSocialProvider, SocialProvider, TeamRole, TenantAuthApiError, TenantAuthNetworkError, TenantAuthValidationError } from './types/tenant-auth.types';
export { EmailClient } from './modules/email';
export type { EmailOptions, EmailAttachment, BulkEmailRecipient, EmailTemplate, EmailVerificationResult, QueuedEmail, EmailStats } from './modules/email';
export { QueueClient } from './modules/queue';
export type { QueueMessage, SendMessageOptions, ReceiveMessageOptions, ReceivedMessage, CreateQueueOptions, QueueAttributes, QueueInfo } from './modules/queue';
export { BrainClient } from './modules/brain';
export type { GenerateAppOptions, GeneratedApp, AppComponent, AppArchitecture, ArchitectureLayer, DatabaseLayer, ApiLayer, ServiceLayer, GeneratedFile, DeploymentConfig, WorkflowSuggestion, PromptUnderstanding, AppPattern, BrainTrainingData, BrainStats } from './modules/brain';
export { WorkflowClient } from './modules/workflow';
export type { WorkflowListOptions, WorkflowExecutionOptions, WorkflowTemplate, WorkflowStats, GenerateWorkflowOptions, WorkflowAnalysis, ConnectorTestResult, WorkflowValidation } from './modules/workflow';
export { SchemaClient } from './schema/schema-client';
export { SchemaModule, MigrationProgress } from './schema/schema';
export type { ProgressCallback } from './schema/schema';
export type { SchemaDefinition, SchemaField, FieldConstraints, SearchConfig, AnalyticsConfig, CacheConfig, IndexDefinition, TableConstraint, TableSettings, RegisterSchemaRequest, RegisterSchemaResponse, MigrateSchemaRequest, MigrateSchemaResponse, SchemaMigration, TableConfig, ConfigureTableRequest, ConfigureTableResponse, TableStructure, ColumnInfo, IndexInfo, ConstraintInfo, TriggerInfo, TableSize, TableStats, ListTablesOptions, ListTablesResponse, TableInfo, CreateIndexRequest, CreateIndexResponse, DropTableRequest, DropTableResponse, SchemaError, SchemaValidationError } from './types/schema.types';
export { RealtimeClient } from './modules/realtime';
export type { RealtimeConfig, RealtimeMessage, ChannelSubscription, PresenceData, RealtimeOptions } from './modules/realtime';
export { PushClient } from './modules/push';
export type { PushNotification, NotificationAction, PushTarget, PushSubscription, SendPushOptions, PushCampaign, PushTemplate, DeviceRegistration, PushStats } from './modules/push';
export { EdgeFunctionsClient } from './modules/edge-functions';
export type { EdgeFunction, EdgeTrigger, EdgeExecution, EdgeLog, EdgeDeployment, CreateFunctionOptions, UpdateFunctionOptions, ExecuteOptions, EdgeStats } from './modules/edge-functions';
export { Migrator } from './migration/migrator';
export { MigrationCLI } from './migration/cli';
export type { MigrationConfig, Migration, MigrationResult } from './migration/migrator';
export { ApiError, ErrorCode } from './utils/errors';
export { Logger } from './utils/logger';
//# sourceMappingURL=index.d.ts.map