/**
 * Schema Management Types for Fluxez SDK
 */

// Base schema types
export interface SchemaField {
  name: string;
  type: string;
  nullable?: boolean;
  defaultValue?: any;
  constraints?: FieldConstraints;
  search?: SearchConfig;
  analytics?: AnalyticsConfig;
  cache?: CacheConfig;
}

export interface FieldConstraints {
  primaryKey?: boolean;
  unique?: boolean;
  indexed?: boolean;
  references?: {
    table: string;
    column: string;
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
    onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  };
  check?: string;
  length?: number;
  precision?: number;
  scale?: number;
}

export interface SearchConfig {
  enabled: boolean;
  analyzer?: string;
  boost?: number;
  searchable?: boolean;
  facetable?: boolean;
  filterable?: boolean;
}

export interface AnalyticsConfig {
  enabled: boolean;
  aggregatable?: boolean;
  groupable?: boolean;
  sortable?: boolean;
  trackChanges?: boolean;
}

export interface CacheConfig {
  enabled: boolean;
  ttl?: number;
  tags?: string[];
  invalidateOn?: string[];
}

// Schema definition
export interface SchemaDefinition {
  name: string;
  description?: string;
  fields: SchemaField[];
  indexes?: IndexDefinition[];
  constraints?: TableConstraint[];
  settings?: TableSettings;
}

export interface IndexDefinition {
  name: string;
  type: 'btree' | 'hash' | 'gin' | 'gist' | 'unique' | 'partial';
  columns: string[];
  unique?: boolean;
  where?: string;
  settings?: Record<string, any>;
}

export interface TableConstraint {
  name: string;
  type: 'CHECK' | 'UNIQUE' | 'FOREIGN_KEY' | 'EXCLUDE';
  definition: string;
}

export interface TableSettings {
  partitioning?: {
    type: 'RANGE' | 'LIST' | 'HASH';
    column: string;
    partitions?: PartitionDefinition[];
  };
  compression?: boolean;
  fillfactor?: number;
  autovacuum?: boolean;
}

export interface PartitionDefinition {
  name: string;
  condition: string;
}

// Schema registration
export interface RegisterSchemaRequest {
  schema: SchemaDefinition;
  options?: RegisterSchemaOptions;
}

export interface RegisterSchemaOptions {
  createTables?: boolean;
  createIndexes?: boolean;
  enableSearch?: boolean;
  enableAnalytics?: boolean;
  enableCache?: boolean;
  migrationMode?: 'safe' | 'force' | 'dry-run';
}

export interface RegisterSchemaResponse {
  schemaId: string;
  success: boolean;
  message: string;
  migrations?: SchemaMigration[];
  warnings?: string[];
  errors?: string[];
}

// Schema migration
export interface SchemaMigration {
  id: string;
  type: 'CREATE_TABLE' | 'DROP_TABLE' | 'ADD_COLUMN' | 'DROP_COLUMN' | 'MODIFY_COLUMN' | 'CREATE_INDEX' | 'DROP_INDEX' | 'ADD_CONSTRAINT' | 'DROP_CONSTRAINT';
  tableName: string;
  description: string;
  sql: string;
  rollbackSql?: string;
  dependencies?: string[];
  status: 'pending' | 'applied' | 'failed' | 'rolled_back';
  appliedAt?: string;
  error?: string;
}

export interface MigrateSchemaRequest {
  schemaId?: string;
  schemaName?: string;
  migrations?: SchemaMigration[];
  options?: MigrateSchemaOptions;
}

export interface MigrateSchemaOptions {
  dryRun?: boolean;
  rollback?: boolean;
  targetVersion?: string;
  skipValidation?: boolean;
  continueOnError?: boolean;
}

export interface MigrateSchemaResponse {
  success: boolean;
  appliedMigrations: SchemaMigration[];
  failedMigrations: SchemaMigration[];
  rollbacks?: SchemaMigration[];
  summary: {
    total: number;
    applied: number;
    failed: number;
    skipped: number;
  };
}

// Table configuration
export interface TableConfig {
  tableName: string;
  search?: TableSearchConfig;
  analytics?: TableAnalyticsConfig;
  cache?: TableCacheConfig;
  realtime?: TableRealtimeConfig;
}

export interface TableSearchConfig {
  enabled: boolean;
  indexName?: string;
  fields: Array<{
    name: string;
    analyzer?: string;
    boost?: number;
    searchable?: boolean;
    facetable?: boolean;
    filterable?: boolean;
  }>;
  settings?: {
    shards?: number;
    replicas?: number;
    refreshInterval?: string;
  };
}

export interface TableAnalyticsConfig {
  enabled: boolean;
  tableName?: string;
  fields: Array<{
    name: string;
    type: 'dimension' | 'measure';
    aggregation?: 'sum' | 'count' | 'avg' | 'min' | 'max' | 'distinct';
  }>;
  partitioning?: {
    field: string;
    interval: 'day' | 'week' | 'month' | 'year';
  };
}

export interface TableCacheConfig {
  enabled: boolean;
  ttl?: number;
  invalidation?: {
    events: string[];
    patterns: string[];
  };
  compression?: boolean;
}

export interface TableRealtimeConfig {
  enabled: boolean;
  events: Array<'INSERT' | 'UPDATE' | 'DELETE'>;
  channels?: string[];
  filters?: Record<string, any>;
}

export interface ConfigureTableRequest {
  config: TableConfig;
}

export interface ConfigureTableResponse {
  success: boolean;
  message: string;
  appliedConfigs: string[];
  errors?: string[];
}

// Table structure
export interface TableStructure {
  name: string;
  schema: string;
  columns: ColumnInfo[];
  indexes: IndexInfo[];
  constraints: ConstraintInfo[];
  triggers: TriggerInfo[];
  size: TableSize;
  stats: TableStats;
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: any;
  isPrimaryKey: boolean;
  isUnique: boolean;
  isForeignKey: boolean;
  references?: {
    table: string;
    column: string;
  };
  comment?: string;
}

export interface IndexInfo {
  name: string;
  type: string;
  columns: string[];
  unique: boolean;
  primary: boolean;
  size: number;
  usage: number;
}

export interface ConstraintInfo {
  name: string;
  type: string;
  definition: string;
  columns: string[];
}

export interface TriggerInfo {
  name: string;
  event: string;
  timing: 'BEFORE' | 'AFTER';
  definition: string;
}

export interface TableSize {
  rows: number;
  diskSize: string;
  indexSize: string;
  totalSize: string;
}

export interface TableStats {
  selectCount: number;
  insertCount: number;
  updateCount: number;
  deleteCount: number;
  lastAnalyzed?: string;
  lastVacuumed?: string;
}

// List tables
export interface ListTablesOptions {
  schema?: string;
  pattern?: string;
  includeViews?: boolean;
  includeSize?: boolean;
  includeStats?: boolean;
}

export interface TableInfo {
  name: string;
  schema: string;
  type: 'table' | 'view' | 'materialized_view';
  columns: number;
  size?: TableSize;
  stats?: TableStats;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListTablesResponse {
  tables: TableInfo[];
  total: number;
  schemas: string[];
}

// Create index
export interface CreateIndexRequest {
  tableName: string;
  indexDefinition: IndexDefinition;
  options?: CreateIndexOptions;
}

export interface CreateIndexOptions {
  concurrently?: boolean;
  ifNotExists?: boolean;
  validate?: boolean;
}

export interface CreateIndexResponse {
  success: boolean;
  indexName: string;
  sql: string;
  executionTime: number;
  message: string;
}

// Drop table
export interface DropTableRequest {
  tableName: string;
  options?: DropTableOptions;
}

export interface DropTableOptions {
  ifExists?: boolean;
  cascade?: boolean;
  purge?: boolean;
  backup?: boolean;
}

export interface DropTableResponse {
  success: boolean;
  message: string;
  backupLocation?: string;
  affectedObjects?: string[];
}

// Schema client errors
export interface SchemaError extends Error {
  code: string;
  tableName?: string;
  schemaName?: string;
  details?: any;
}

export interface SchemaValidationError extends SchemaError {
  field?: string;
  constraint?: string;
  value?: any;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}