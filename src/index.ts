/**
 * Fluxez Node SDK
 * Official Node.js SDK for Fluxez Platform
 */

// Core Client
export { FluxezClient } from './fluxez-client';
export { HttpClient } from './core/http-client';

// Legacy client (for backward compatibility)
export { FluxezClient as FluxezClientLegacy } from './core/client';
export { FluxezConfig, AuthConfig, StorageConfig } from './types/config';

// Core Types
export * from './types';

// Query Builder
export { QueryBuilder } from './query/query-builder';
export { 
  SelectQuery, 
  InsertQuery, 
  UpdateQuery, 
  DeleteQuery,
  JoinType,
  OrderDirection,
  AggregateFunction
} from './query/types';

// Storage
export { StorageClient } from './storage/storage-client';
export { 
  UploadOptions, 
  UploadResult, 
  SignedUrlOptions,
  ListFilesOptions,
  FileMetadata 
} from './storage/types';

// Search
export { SearchClient } from './search/search-client';
export { 
  SearchQuery, 
  SearchResult, 
  VectorSearchQuery,
  SearchOptions 
} from './search/types';

// Analytics
export { AnalyticsClient } from './analytics/analytics-client';
export { 
  AnalyticsQuery, 
  AnalyticsResult,
  EventData,
  AggregationType 
} from './analytics/types';

// Cache
export { CacheClient } from './cache/cache-client';
export { 
  CacheOperation, 
  CacheStats,
  CacheOptions 
} from './cache/types';

// Auth
export { AuthClient } from './auth/auth-client';
export {
  LoginCredentials,
  RegisterData,
  AuthToken,
  User,
  Role,
  AuthSettings
} from './auth/types';

// Tenant Auth types removed - all auth is now unified in AuthClient
// Use AuthClient for all authentication needs including:
// - User authentication (login, register, logout)
// - OAuth/Social auth (getOAuthUrl, handleOAuthCallback)
// - Team management (createTeam, getTeams, inviteMember)
// - Password reset, email verification, 2FA

// Email
export { EmailClient } from './modules/email';
export type {
  EmailOptions,
  EmailAttachment,
  BulkEmailRecipient,
  EmailTemplate,
  EmailVerificationResult,
  QueuedEmail,
  EmailStats
} from './modules/email';

// Queue
export { QueueClient } from './modules/queue';
export type {
  QueueMessage,
  SendMessageOptions,
  ReceiveMessageOptions,
  ReceivedMessage,
  CreateQueueOptions,
  QueueAttributes,
  QueueInfo
} from './modules/queue';

// AI Module
export { AIModule } from './modules/ai';

// Vector Search (Qdrant)
export { VectorClient } from './modules/vector';
export type {
  VectorDocument,
  QdrantSearchQuery,
  VectorSearchResult,
  CollectionInfo,
  CollectionStats,
  VectorHealthStatus,
  ScrollResult,
  CreateCollectionOptions,
  RecommendOptions
} from './modules/vector';

// Workflow
export { WorkflowClient } from './modules/workflow';
export type {
  WorkflowListOptions,
  WorkflowExecutionOptions,
  WorkflowTemplate,
  WorkflowStats,
  GenerateWorkflowOptions,
  WorkflowAnalysis,
  WorkflowValidation
} from './modules/workflow';

// Connectors
export { ConnectorClient } from './modules/connectors';
export type {
  ConnectorMetadata,
  ConnectorConfigField,
  ConnectorAction,
  ConnectorTrigger,
  ConnectorConfig,
  ConnectorListOptions,
  ConnectorTestResult as ConnectorTestResultType,
  ConnectorActionResult,
  ConnectorResource,
  ConnectorUsageStats,
  WebhookSetupResult,
  GoogleDrive,
  GoogleFolder,
  GoogleFile,
  GoogleSpreadsheet,
  GoogleSheet,
  GoogleSheetColumn,
  GoogleCalendar,
  NotionDatabase,
  NotionPage
} from './modules/connectors';

// Schema Management
export { SchemaClient } from './schema/schema-client';
export { SchemaModule, MigrationProgress } from './schema/schema';
export type { ProgressCallback } from './schema/schema';
export type {
  SchemaDefinition,
  SchemaField,
  FieldConstraints,
  SearchConfig,
  AnalyticsConfig,
  CacheConfig,
  IndexDefinition,
  TableConstraint,
  TableSettings,
  RegisterSchemaRequest,
  RegisterSchemaResponse,
  MigrateSchemaRequest,
  MigrateSchemaResponse,
  SchemaMigration,
  TableConfig,
  ConfigureTableRequest,
  ConfigureTableResponse,
  TableStructure,
  ColumnInfo,
  IndexInfo,
  ConstraintInfo,
  TriggerInfo,
  TableSize,
  TableStats,
  ListTablesOptions,
  ListTablesResponse,
  TableInfo,
  CreateIndexRequest,
  CreateIndexResponse,
  DropTableRequest,
  DropTableResponse,
  SchemaError,
  SchemaValidationError
} from './types/schema.types';


// Realtime
export { RealtimeClient } from './modules/realtime';
export type {
  RealtimeConfig,
  RealtimeMessage,
  ChannelSubscription,
  PresenceData,
  RealtimeOptions
} from './modules/realtime';

// Push Notifications
export { PushClient } from './modules/push';
export type {
  PushNotification,
  NotificationAction,
  PushTarget,
  PushSubscription,
  SendPushOptions,
  PushCampaign,
  PushTemplate,
  DeviceRegistration,
  PushStats
} from './modules/push';

// Video Conferencing
export { VideoConferencingClient } from './modules/video-conferencing';
export type {
  CreateRoomOptions,
  VideoRoom,
  RoomFilters,
  TokenOptions,
  RoomToken,
  Participant,
  ParticipantTrack,
  RecordingConfig,
  Recording,
  SessionFilters,
  VideoSession,
  SessionStats,
  UpdateRoomOptions,
  EgressOptions,
  Egress,
  RoomWebhookEvent
} from './modules/video-conferencing';

// Documents
export { DocumentsClient } from './modules/documents';
export type {
  GeneratePDFOptions,
  DocumentResult,
  TextExtractionResult,
  PageRange,
  WatermarkOptions,
  OCRProvider,
  OCRResult,
  OCRBlock,
  OCRWord,
  TemplateFilters,
  DocumentTemplate,
  TemplateVariable,
  CreateTemplateOptions,
  LogFilters,
  ProcessingLog,
  MergePDFOptions,
  SplitPDFOptions,
  ConvertDocumentOptions
} from './modules/documents';

// Edge Functions
export { EdgeFunctionsClient } from './modules/edge-functions';
export type {
  EdgeFunction,
  EdgeTrigger,
  EdgeExecution,
  EdgeLog,
  EdgeDeployment,
  CreateFunctionOptions,
  UpdateFunctionOptions,
  ExecuteOptions,
  EdgeStats
} from './modules/edge-functions';

// Chatbot
export { ChatbotClient } from './modules/chatbot';
export type {
  ChatbotConfig,
  ChatbotConversation,
  ChatbotMessage,
  ChatbotSendMessageOptions,
  ChatbotSendMessageResponse,
  ChatbotDocument,
  UploadDocumentOptions,
  ChatbotStats,
  MessageFeedback,
  ListOptions as ChatbotListOptions
} from './modules/chatbot';

// Migration
export { Migrator } from './migration/migrator';
export { MigrationCLI } from './migration/cli';
export type {
  MigrationConfig,
  Migration,
  MigrationResult
} from './migration/migrator';

// Payment
export { PaymentClient } from './modules/payment';
export type {
  PaymentConfig,
  CreatePaymentConfigRequest,
  UpdatePaymentConfigRequest,
  PriceIdConfig,
  AddPriceIdRequest,
  Subscription,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  SubscriptionStatus,
  Invoice,
  CheckoutSession,
  CreateCheckoutSessionRequest,
  Customer,
  CreateCustomerRequest,
  PaymentMethod,
  PaymentIntent,
  CreatePaymentIntentRequest,
  UpdatePaymentIntentRequest,
  ConfirmPaymentIntentRequest,
  CancelPaymentIntentRequest,
  CapturePaymentIntentRequest,
  Charge,
  CreateChargeRequest,
  Refund,
  CreateRefundRequest,
  PaymentSource,
  DirectPaymentResult,
  ListOptions,
  ListResponse,
  WebhookEvent,
  WebhookVerificationResult
} from './types/payment.types';

// Utils
export { ApiError, ErrorCode } from './utils/errors';
export { Logger } from './utils/logger';