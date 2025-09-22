"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaClient = void 0;
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
class SchemaClient {
    constructor(http, config, logger) {
        this.http = http;
        this.config = config;
        this.logger = logger;
    }
    /**
     * Register a new schema definition
     *
     * @param request Schema registration request
     * @returns Registration response with schema ID and migrations
     */
    async registerSchema(request) {
        try {
            this.logger.debug('Registering schema', { schemaName: request.schema.name });
            const response = await this.http.post('/schema/register', request);
            if (!response.data.data) {
                throw new Error('No data in response');
            }
            this.logger.debug('Schema registered successfully', {
                schemaId: response.data.data.schemaId
            });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to register schema', {
                schemaName: request.schema.name,
                error: error.message
            });
            throw this.createSchemaError(error, 'REGISTER_SCHEMA_FAILED', request.schema.name);
        }
    }
    /**
     * Get schema definition by name or ID
     *
     * @param schemaIdentifier Schema name or ID
     * @returns Schema definition
     */
    async getSchema(schemaIdentifier) {
        try {
            this.logger.debug('Getting schema', { schemaIdentifier });
            const response = await this.http.get(`/schema/${encodeURIComponent(schemaIdentifier)}`);
            if (!response.data.data) {
                throw new Error('No data in response');
            }
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get schema', {
                schemaIdentifier,
                error: error.message
            });
            throw this.createSchemaError(error, 'GET_SCHEMA_FAILED', undefined, schemaIdentifier);
        }
    }
    /**
     * Apply schema migrations
     *
     * @param request Migration request
     * @returns Migration results
     */
    async migrateSchema(request) {
        try {
            this.logger.debug('Migrating schema', {
                schemaId: request.schemaId,
                schemaName: request.schemaName,
                migrationsCount: request.migrations?.length || 0
            });
            const response = await this.http.post('/schema/migrate', request);
            if (!response.data.data) {
                throw new Error('No data in response');
            }
            this.logger.info('Schema migration completed', {
                applied: response.data.data.summary.applied,
                failed: response.data.data.summary.failed,
                skipped: response.data.data.summary.skipped
            });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to migrate schema', {
                schemaId: request.schemaId,
                schemaName: request.schemaName,
                error: error.message
            });
            throw this.createSchemaError(error, 'MIGRATE_SCHEMA_FAILED', undefined, request.schemaName || request.schemaId);
        }
    }
    /**
     * Configure table settings for search, analytics, and cache
     *
     * @param request Table configuration request
     * @returns Configuration response
     */
    async configureTable(request) {
        try {
            this.logger.debug('Configuring table', {
                tableName: request.config.tableName,
                features: {
                    search: request.config.search?.enabled,
                    analytics: request.config.analytics?.enabled,
                    cache: request.config.cache?.enabled,
                    realtime: request.config.realtime?.enabled
                }
            });
            const response = await this.http.post(`/table/${encodeURIComponent(request.config.tableName)}/config`, request);
            if (!response.data.data) {
                throw new Error('No data in response');
            }
            this.logger.info('Table configured successfully', {
                tableName: request.config.tableName,
                appliedConfigs: response.data.data.appliedConfigs
            });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to configure table', {
                tableName: request.config.tableName,
                error: error.message
            });
            throw this.createSchemaError(error, 'CONFIGURE_TABLE_FAILED', request.config.tableName);
        }
    }
    /**
     * Get detailed table structure and metadata
     *
     * @param tableName Table name
     * @returns Table structure information
     */
    async describeTable(tableName) {
        try {
            this.logger.debug('Describing table', { tableName });
            const response = await this.http.get(`/table/${encodeURIComponent(tableName)}/describe`);
            if (!response.data.data) {
                throw new Error('No data in response');
            }
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to describe table', {
                tableName,
                error: error.message
            });
            throw this.createSchemaError(error, 'DESCRIBE_TABLE_FAILED', tableName);
        }
    }
    /**
     * List all tables in the database
     *
     * @param options List options for filtering and pagination
     * @returns List of tables with metadata
     */
    async listTables(options = {}) {
        try {
            this.logger.debug('Listing tables', { options });
            const params = new URLSearchParams();
            if (options.schema)
                params.append('schema', options.schema);
            if (options.pattern)
                params.append('pattern', options.pattern);
            if (options.includeViews !== undefined)
                params.append('includeViews', String(options.includeViews));
            if (options.includeSize !== undefined)
                params.append('includeSize', String(options.includeSize));
            if (options.includeStats !== undefined)
                params.append('includeStats', String(options.includeStats));
            const response = await this.http.get(`/schema/tables?${params.toString()}`);
            if (!response.data.data) {
                throw new Error('No data in response');
            }
            this.logger.debug('Tables listed successfully', {
                count: response.data.data.tables.length,
                total: response.data.data.total
            });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to list tables', {
                options,
                error: error.message
            });
            throw this.createSchemaError(error, 'LIST_TABLES_FAILED');
        }
    }
    /**
     * Create a database index
     *
     * @param request Index creation request
     * @returns Index creation response
     */
    async createIndex(request) {
        try {
            this.logger.debug('Creating index', {
                tableName: request.tableName,
                indexName: request.indexDefinition.name,
                columns: request.indexDefinition.columns
            });
            const response = await this.http.post(`/table/${encodeURIComponent(request.tableName)}/index`, request);
            if (!response.data.data) {
                throw new Error('No data in response');
            }
            this.logger.info('Index created successfully', {
                tableName: request.tableName,
                indexName: response.data.data.indexName,
                executionTime: response.data.data.executionTime
            });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to create index', {
                tableName: request.tableName,
                indexName: request.indexDefinition.name,
                error: error.message
            });
            throw this.createSchemaError(error, 'CREATE_INDEX_FAILED', request.tableName);
        }
    }
    /**
     * Drop (delete) a table
     *
     * @param request Drop table request
     * @returns Drop table response
     */
    async dropTable(request) {
        try {
            this.logger.warn('Dropping table', {
                tableName: request.tableName,
                options: request.options
            });
            const response = await this.http.delete(`/table/${encodeURIComponent(request.tableName)}`, { data: request });
            if (!response.data.data) {
                throw new Error('No data in response');
            }
            this.logger.warn('Table dropped successfully', {
                tableName: request.tableName,
                backupLocation: response.data.data.backupLocation,
                affectedObjects: response.data.data.affectedObjects
            });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to drop table', {
                tableName: request.tableName,
                error: error.message
            });
            throw this.createSchemaError(error, 'DROP_TABLE_FAILED', request.tableName);
        }
    }
    /**
     * Get table configuration
     *
     * @param tableName Table name
     * @returns Current table configuration
     */
    async getTableConfig(tableName) {
        try {
            this.logger.debug('Getting table config', { tableName });
            const response = await this.http.get(`/table/${encodeURIComponent(tableName)}/config`);
            if (!response.data.data) {
                throw new Error('No data in response');
            }
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get table config', {
                tableName,
                error: error.message
            });
            throw this.createSchemaError(error, 'GET_TABLE_CONFIG_FAILED', tableName);
        }
    }
    /**
     * Update table configuration
     *
     * @param tableName Table name
     * @param config Updated configuration
     * @returns Configuration response
     */
    async updateTableConfig(tableName, config) {
        try {
            this.logger.debug('Updating table config', { tableName, config });
            const request = {
                config: { tableName, ...config }
            };
            const response = await this.http.put(`/table/${encodeURIComponent(tableName)}/config`, request);
            if (!response.data.data) {
                throw new Error('No data in response');
            }
            this.logger.info('Table config updated successfully', {
                tableName,
                appliedConfigs: response.data.data.appliedConfigs
            });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to update table config', {
                tableName,
                error: error.message
            });
            throw this.createSchemaError(error, 'UPDATE_TABLE_CONFIG_FAILED', tableName);
        }
    }
    /**
     * Drop an index
     *
     * @param tableName Table name
     * @param indexName Index name to drop
     * @returns Operation result
     */
    async dropIndex(tableName, indexName) {
        try {
            this.logger.debug('Dropping index', { tableName, indexName });
            const response = await this.http.delete(`/table/${encodeURIComponent(tableName)}/index/${encodeURIComponent(indexName)}`);
            if (!response.data.data) {
                throw new Error('No data in response');
            }
            this.logger.info('Index dropped successfully', { tableName, indexName });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to drop index', {
                tableName,
                indexName,
                error: error.message
            });
            throw this.createSchemaError(error, 'DROP_INDEX_FAILED', tableName);
        }
    }
    /**
     * Get list of indexes for a table
     *
     * @param tableName Table name
     * @returns List of indexes
     */
    async getTableIndexes(tableName) {
        try {
            this.logger.debug('Getting table indexes', { tableName });
            const response = await this.http.get(`/table/${encodeURIComponent(tableName)}/indexes`);
            if (!response.data.data) {
                throw new Error('No data in response');
            }
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get table indexes', {
                tableName,
                error: error.message
            });
            throw this.createSchemaError(error, 'GET_TABLE_INDEXES_FAILED', tableName);
        }
    }
    /**
     * Create a new table
     *
     * @param config Table configuration
     * @returns Table creation response
     */
    async createTable(config) {
        try {
            this.logger.debug('Creating table', { config });
            const response = await this.http.post('/schema/table/create', config);
            if (!response.data.data) {
                throw new Error('No data in response');
            }
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to create table', {
                config,
                error: error.message
            });
            throw this.createSchemaError(error, 'CREATE_TABLE_FAILED');
        }
    }
    /**
     * Get table schema/structure
     *
     * @param tableName Name of the table
     * @returns Table schema
     */
    async getTable(tableName) {
        try {
            this.logger.debug('Getting table schema', { tableName });
            const response = await this.http.get(`/schema/table/${tableName}`);
            if (!response.data.data) {
                throw new Error('No data in response');
            }
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get table schema', {
                tableName,
                error: error.message
            });
            throw this.createSchemaError(error, 'GET_TABLE_FAILED', tableName);
        }
    }
    /**
     * Validate schema definition
     *
     * @param schema Schema to validate
     * @returns Validation result
     */
    async validateSchema(schema) {
        try {
            this.logger.debug('Validating schema', { schemaName: schema.name });
            const response = await this.http.post('/schema/validate', { schema });
            if (!response.data.data) {
                throw new Error('No data in response');
            }
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to validate schema', {
                schemaName: schema.name,
                error: error.message
            });
            throw this.createSchemaError(error, 'VALIDATE_SCHEMA_FAILED', undefined, schema.name);
        }
    }
    /**
     * Run database migrations for a schema
     * Compatible with CLI migration command
     *
     * @param schema Database schema definition
     * @param options Migration options
     * @returns Migration result
     */
    async migrate(schema, options) {
        try {
            this.logger.debug('Running schema migration', {
                dryRun: options?.dryRun,
                force: options?.force,
                dev: options?.dev
            });
            // Generate migration ID
            const migrationId = `migration-${Date.now()}`;
            // If onProgress is provided, set up SSE connection for progress
            if (options?.onProgress && !options.dryRun) {
                // Try to connect to SSE progress endpoint
                try {
                    // Import EventSource properly
                    const EventSourceModule = require('eventsource');
                    const EventSource = EventSourceModule.EventSource || EventSourceModule;
                    const baseURL = this.config.baseURL || 'http://localhost:3000/api/v1';
                    // Pass API key as query parameter since EventSource doesn't support custom headers well
                    const progressUrl = `${baseURL}/schema/migration-progress?migrationId=${migrationId}&apiKey=${encodeURIComponent(this.config.apiKey)}`;
                    this.logger.debug('Setting up SSE connection for progress', { progressUrl: progressUrl.replace(/apiKey=[^&]+/, 'apiKey=***'), migrationId });
                    const eventSource = new EventSource(progressUrl);
                    eventSource.onmessage = (event) => {
                        try {
                            const progress = JSON.parse(event.data);
                            this.logger.debug('SSE progress received', progress);
                            if (options.onProgress) {
                                options.onProgress(progress);
                            }
                            // Close connection on complete or error
                            if (progress.type === 'complete' || progress.type === 'error') {
                                eventSource.close();
                            }
                        }
                        catch (err) {
                            this.logger.debug('Failed to parse SSE progress', err);
                        }
                    };
                    eventSource.onerror = (error) => {
                        this.logger.debug('SSE connection error', error);
                        eventSource.close();
                    };
                }
                catch (sseError) {
                    this.logger.debug('Failed to setup SSE progress, continuing without progress updates', sseError);
                }
            }
            // Backend uses the same migrate endpoint with dryRun flag
            const endpoint = '/schema/migrate';
            const response = await this.http.post(endpoint, {
                schema,
                dryRun: options?.dryRun,
                force: options?.force,
                dropTables: options?.dropTables,
                dev: options?.dev,
                migrationId
            });
            // Handle both wrapped and unwrapped responses
            const result = response.data.data || response.data;
            if (!result) {
                throw new Error('No data in response');
            }
            return result;
        }
        catch (error) {
            this.logger.error('Failed to migrate schema', {
                error: error.message
            });
            throw this.createSchemaError(error, 'MIGRATE_FAILED');
        }
    }
    /**
     * Sync database schema (create-only mode)
     * Compatible with CLI migration command
     *
     * @param schema Database schema definition
     * @param options Sync options
     * @returns Sync result
     */
    async syncSchema(schema, options) {
        try {
            this.logger.debug('Syncing schema', {
                dryRun: options?.dryRun
            });
            const response = await this.http.post('/schema/sync', {
                schema,
                dryRun: options?.dryRun
            });
            if (!response.data.data) {
                throw new Error('No data in response');
            }
            // Call progress callback if provided
            if (options?.onProgress && response.data.data.progress) {
                options.onProgress(response.data.data.progress);
            }
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to sync schema', {
                error: error.message
            });
            throw this.createSchemaError(error, 'SYNC_FAILED');
        }
    }
    createSchemaError(originalError, code, tableName, schemaName) {
        const error = new Error(originalError.message || 'Schema operation failed');
        error.name = 'SchemaError';
        error.code = code;
        error.tableName = tableName;
        error.schemaName = schemaName;
        error.details = originalError.response?.data || originalError;
        return error;
    }
}
exports.SchemaClient = SchemaClient;
//# sourceMappingURL=schema-client.js.map