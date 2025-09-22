import { AxiosInstance } from 'axios';
import { SchemaDefinition, RegisterSchemaRequest, RegisterSchemaResponse, MigrateSchemaRequest, MigrateSchemaResponse, TableConfig, ConfigureTableRequest, ConfigureTableResponse, TableStructure, ListTablesOptions, ListTablesResponse, CreateIndexRequest, CreateIndexResponse, DropTableRequest, DropTableResponse, IndexDefinition } from '../types/schema.types';
/**
 * Schema Client for managing database schemas, tables, and indexes
 *
 * Handles:
 * - Schema registration and management
 * - Table configuration for search, analytics, and cache
 * - Database migrations
 * - Index management
 * - Table introspection
 *
 * @example
 * ```typescript
 * // Register a new schema
 * const schema = {
 *   name: 'users',
 *   fields: [
 *     { name: 'id', type: 'uuid', constraints: { primaryKey: true } },
 *     { name: 'email', type: 'varchar(255)', constraints: { unique: true } },
 *     { name: 'name', type: 'varchar(255)' },
 *     { name: 'created_at', type: 'timestamp', defaultValue: 'now()' }
 *   ]
 * };
 *
 * const result = await schemaClient.registerSchema({ schema });
 *
 * // Configure table for search and analytics
 * await schemaClient.configureTable({
 *   config: {
 *     tableName: 'users',
 *     search: {
 *       enabled: true,
 *       fields: [
 *         { name: 'email', searchable: true, filterable: true },
 *         { name: 'name', searchable: true, boost: 2.0 }
 *       ]
 *     },
 *     analytics: {
 *       enabled: true,
 *       fields: [
 *         { name: 'created_at', type: 'dimension' },
 *         { name: 'id', type: 'measure', aggregation: 'count' }
 *       ]
 *     }
 *   }
 * });
 * ```
 */
export declare class SchemaClient {
    private http;
    private config;
    private logger;
    constructor(http: AxiosInstance, config: any, logger: any);
    /**
     * Register a new schema definition
     *
     * @param request Schema registration request
     * @returns Registration response with schema ID and migrations
     */
    registerSchema(request: RegisterSchemaRequest): Promise<RegisterSchemaResponse>;
    /**
     * Get schema definition by name or ID
     *
     * @param schemaIdentifier Schema name or ID
     * @returns Schema definition
     */
    getSchema(schemaIdentifier: string): Promise<SchemaDefinition>;
    /**
     * Apply schema migrations
     *
     * @param request Migration request
     * @returns Migration results
     */
    migrateSchema(request: MigrateSchemaRequest): Promise<MigrateSchemaResponse>;
    /**
     * Configure table settings for search, analytics, and cache
     *
     * @param request Table configuration request
     * @returns Configuration response
     */
    configureTable(request: ConfigureTableRequest): Promise<ConfigureTableResponse>;
    /**
     * Get detailed table structure and metadata
     *
     * @param tableName Table name
     * @returns Table structure information
     */
    describeTable(tableName: string): Promise<TableStructure>;
    /**
     * List all tables in the database
     *
     * @param options List options for filtering and pagination
     * @returns List of tables with metadata
     */
    listTables(options?: ListTablesOptions): Promise<ListTablesResponse>;
    /**
     * Create a database index
     *
     * @param request Index creation request
     * @returns Index creation response
     */
    createIndex(request: CreateIndexRequest): Promise<CreateIndexResponse>;
    /**
     * Drop (delete) a table
     *
     * @param request Drop table request
     * @returns Drop table response
     */
    dropTable(request: DropTableRequest): Promise<DropTableResponse>;
    /**
     * Get table configuration
     *
     * @param tableName Table name
     * @returns Current table configuration
     */
    getTableConfig(tableName: string): Promise<TableConfig>;
    /**
     * Update table configuration
     *
     * @param tableName Table name
     * @param config Updated configuration
     * @returns Configuration response
     */
    updateTableConfig(tableName: string, config: Partial<TableConfig>): Promise<ConfigureTableResponse>;
    /**
     * Drop an index
     *
     * @param tableName Table name
     * @param indexName Index name to drop
     * @returns Operation result
     */
    dropIndex(tableName: string, indexName: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Get list of indexes for a table
     *
     * @param tableName Table name
     * @returns List of indexes
     */
    getTableIndexes(tableName: string): Promise<IndexDefinition[]>;
    /**
     * Create a new table
     *
     * @param config Table configuration
     * @returns Table creation response
     */
    createTable(config: any): Promise<any>;
    /**
     * Get table schema/structure
     *
     * @param tableName Name of the table
     * @returns Table schema
     */
    getTable(tableName: string): Promise<any>;
    /**
     * Validate schema definition
     *
     * @param schema Schema to validate
     * @returns Validation result
     */
    validateSchema(schema: SchemaDefinition): Promise<{
        valid: boolean;
        errors: string[];
        warnings: string[];
    }>;
    /**
     * Run database migrations for a schema
     * Compatible with CLI migration command
     *
     * @param schema Database schema definition
     * @param options Migration options
     * @returns Migration result
     */
    migrate(schema: Record<string, any>, options?: {
        dryRun?: boolean;
        force?: boolean;
        dropTables?: boolean;
        dev?: boolean;
        onProgress?: (progress: any) => void;
    }): Promise<{
        success: boolean;
        plan?: any;
        applied?: any;
        errors?: string[];
    }>;
    /**
     * Sync database schema (create-only mode)
     * Compatible with CLI migration command
     *
     * @param schema Database schema definition
     * @param options Sync options
     * @returns Sync result
     */
    syncSchema(schema: Record<string, any>, options?: {
        dryRun?: boolean;
        onProgress?: (progress: any) => void;
    }): Promise<{
        success: boolean;
        plan?: any;
        applied?: any;
        errors?: string[];
    }>;
    private createSchemaError;
}
//# sourceMappingURL=schema-client.d.ts.map