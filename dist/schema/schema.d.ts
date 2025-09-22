import { HttpClient } from '../core/http-client';
import { TableSchema, ColumnDefinition, IndexDefinition, ConstraintDefinition } from '../types';
import { RealtimeModule } from './realtime';
export interface MigrationProgress {
    type: 'info' | 'progress' | 'complete' | 'error';
    message: string;
    current?: number;
    total?: number;
    table?: string;
    phase?: 'fetching' | 'processing' | 'applying';
}
export type ProgressCallback = (progress: MigrationProgress) => void;
export declare class SchemaModule {
    private httpClient;
    private realtime?;
    constructor(httpClient: HttpClient, realtime?: RealtimeModule);
    createTable(tableSchema: {
        name: string;
        columns: ColumnDefinition[];
        indexes?: IndexDefinition[];
        constraints?: ConstraintDefinition[];
        triggers?: Array<{
            name: string;
            type: 'auto_increment' | 'auto_timestamp' | 'auto_email' | 'auto_email_validation' | 'auto_image' | 'auto_url' | 'auto_embedding' | 'custom';
            config?: Record<string, any>;
        }>;
        permissions?: {
            read: string[];
            write: string[];
            delete: string[];
        };
        metadata?: Record<string, any>;
    }): Promise<{
        success: boolean;
        message: string;
        jobId: string;
        tableName: string;
        status: string;
        estimatedTime: string;
    }>;
    updateTable(tableName: string, updates: {
        add_columns?: ColumnDefinition[];
        drop_columns?: string[];
        modify_columns?: Array<{
            name: string;
            definition: ColumnDefinition;
        }>;
        add_indexes?: IndexDefinition[];
        drop_indexes?: string[];
        add_constraints?: ConstraintDefinition[];
        drop_constraints?: string[];
        permissions?: {
            read?: string[];
            write?: string[];
            delete?: string[];
        };
        metadata?: Record<string, any>;
    }): Promise<{
        name: string;
        updated: boolean;
        changes: {
            columns_added: number;
            columns_dropped: number;
            columns_modified: number;
            indexes_added: number;
            indexes_dropped: number;
            constraints_added: number;
            constraints_dropped: number;
        };
    }>;
    getTable(tableName: string): Promise<{
        name: string;
        schema: TableSchema;
        row_count: number;
        size: number;
        created_at: string;
        updated_at: string;
        permissions: {
            read: string[];
            write: string[];
            delete: string[];
        };
        triggers: Array<{
            name: string;
            type: string;
            config: Record<string, any>;
            enabled: boolean;
        }>;
        metadata: Record<string, any>;
        columns?: ColumnDefinition[];
    }>;
    listTables(options?: {
        search?: string;
        hasData?: boolean;
        sortBy?: 'name' | 'created_at' | 'row_count' | 'size';
        sortOrder?: 'asc' | 'desc';
        limit?: number;
        offset?: number;
    }): Promise<{
        tables: Array<{
            name: string;
            column_count: number;
            row_count: number;
            size: number;
            created_at: string;
            updated_at: string;
            has_triggers: boolean;
        }>;
        total: number;
    }>;
    deleteTable(tableName: string, options?: {
        cascade?: boolean;
        backup?: boolean;
    }): Promise<{
        deleted: boolean;
        rows_deleted: number;
        backup_created?: boolean;
        backup_url?: string;
    }>;
    renameTable(tableName: string, newName: string): Promise<{
        old_name: string;
        new_name: string;
        renamed: boolean;
    }>;
    copyTable(sourceTable: string, targetTable: string, options?: {
        copy_data?: boolean;
        copy_indexes?: boolean;
        copy_constraints?: boolean;
        copy_triggers?: boolean;
    }): Promise<{
        source_table: string;
        target_table: string;
        copied: boolean;
        rows_copied: number;
    }>;
    addColumn(tableName: string, column: ColumnDefinition): Promise<{
        table: string;
        column: string;
        added: boolean;
    }>;
    updateColumn(tableName: string, columnName: string, updates: Partial<ColumnDefinition>): Promise<{
        table: string;
        column: string;
        updated: boolean;
    }>;
    dropColumn(tableName: string, columnName: string): Promise<{
        table: string;
        column: string;
        dropped: boolean;
    }>;
    renameColumn(tableName: string, columnName: string, newName: string): Promise<{
        table: string;
        old_name: string;
        new_name: string;
        renamed: boolean;
    }>;
    createIndex(tableName: string, index: IndexDefinition): Promise<{
        table: string;
        index: string;
        created: boolean;
    }>;
    dropIndex(tableName: string, indexName: string): Promise<{
        table: string;
        index: string;
        dropped: boolean;
    }>;
    listIndexes(tableName: string): Promise<Array<{
        name: string;
        type: 'btree' | 'hash' | 'gin' | 'gist';
        columns: string[];
        unique: boolean;
        size: number;
        usage_stats: {
            scans: number;
            tuples_read: number;
            tuples_fetched: number;
        };
    }>>;
    addConstraint(tableName: string, constraint: ConstraintDefinition): Promise<{
        table: string;
        constraint: string;
        added: boolean;
    }>;
    dropConstraint(tableName: string, constraintName: string): Promise<{
        table: string;
        constraint: string;
        dropped: boolean;
    }>;
    listConstraints(tableName: string): Promise<Array<{
        name: string;
        type: 'primary_key' | 'foreign_key' | 'unique' | 'check' | 'not_null';
        columns: string[];
        definition: string;
        referenced_table?: string;
        referenced_columns?: string[];
    }>>;
    createTrigger(tableName: string, trigger: {
        name: string;
        type: 'auto_increment' | 'auto_timestamp' | 'auto_email' | 'auto_image' | 'auto_url' | 'custom';
        events: Array<'INSERT' | 'UPDATE' | 'DELETE'>;
        config?: Record<string, any>;
        enabled?: boolean;
    }): Promise<{
        table: string;
        trigger: string;
        created: boolean;
    }>;
    updateTrigger(tableName: string, triggerName: string, updates: {
        events?: Array<'INSERT' | 'UPDATE' | 'DELETE'>;
        config?: Record<string, any>;
        enabled?: boolean;
    }): Promise<{
        table: string;
        trigger: string;
        updated: boolean;
    }>;
    deleteTrigger(tableName: string, triggerName: string): Promise<{
        table: string;
        trigger: string;
        deleted: boolean;
    }>;
    enableTrigger(tableName: string, triggerName: string): Promise<void>;
    disableTrigger(tableName: string, triggerName: string): Promise<void>;
    listTriggers(tableName: string): Promise<Array<{
        name: string;
        type: string;
        events: string[];
        config: Record<string, any>;
        enabled: boolean;
        created_at: string;
        execution_count: number;
        last_executed?: string;
    }>>;
    analyzeTable(tableName: string): Promise<{
        table: string;
        analysis: {
            row_count: number;
            size: number;
            bloat_ratio: number;
            index_usage: Array<{
                index_name: string;
                scans: number;
                efficiency: number;
                recommendation: string;
            }>;
            column_analysis: Array<{
                column_name: string;
                null_percentage: number;
                unique_values: number;
                data_distribution: any;
                suggestions: string[];
            }>;
            performance_score: number;
            recommendations: string[];
        };
    }>;
    optimizeTable(tableName: string, options?: {
        vacuum?: boolean;
        analyze?: boolean;
        rebuild_indexes?: boolean;
    }): Promise<{
        table: string;
        optimizations_applied: string[];
        before_size: number;
        after_size: number;
        space_reclaimed: number;
    }>;
    suggestIndexes(tableName: string, options?: {
        analyze_queries?: boolean;
        min_impact_threshold?: number;
    }): Promise<{
        table: string;
        suggestions: Array<{
            index_name: string;
            columns: string[];
            type: string;
            estimated_benefit: number;
            reasoning: string;
            query_patterns: string[];
        }>;
    }>;
    createMigration(migration: {
        name: string;
        description?: string;
        up_script: string;
        down_script: string;
        dependencies?: string[];
    }): Promise<{
        id: string;
        name: string;
        version: string;
        created: boolean;
    }>;
    runMigration(migrationId: string, options?: {
        dry_run?: boolean;
        timeout?: number;
    }): Promise<{
        migration_id: string;
        status: 'completed' | 'failed' | 'dry_run';
        changes_applied: string[];
        execution_time: number;
        error?: string;
    }>;
    rollbackMigration(migrationId: string): Promise<{
        migration_id: string;
        status: 'completed' | 'failed';
        changes_reverted: string[];
        execution_time: number;
        error?: string;
    }>;
    listMigrations(): Promise<Array<{
        id: string;
        name: string;
        version: string;
        status: 'pending' | 'applied' | 'failed' | 'rolled_back';
        applied_at?: string;
        execution_time?: number;
        error?: string;
    }>>;
    getMigrationStatus(): Promise<{
        current_version: string;
        pending_migrations: number;
        last_migration: string;
        last_applied_at: string;
        database_up_to_date: boolean;
    }>;
    compareSchemas(source: string, target: string): Promise<{
        differences: Array<{
            type: 'table_added' | 'table_removed' | 'table_modified' | 'column_added' | 'column_removed' | 'column_modified' | 'index_added' | 'index_removed';
            table: string;
            column?: string;
            index?: string;
            old_definition?: any;
            new_definition?: any;
            impact: 'low' | 'medium' | 'high';
        }>;
        summary: {
            tables_added: number;
            tables_removed: number;
            tables_modified: number;
            columns_added: number;
            columns_removed: number;
            columns_modified: number;
            indexes_added: number;
            indexes_removed: number;
        };
    }>;
    generateMigrationFromDiff(source: string, target: string, migrationName: string): Promise<{
        migration_id: string;
        name: string;
        up_script: string;
        down_script: string;
        changes_count: number;
    }>;
    backupSchema(options?: {
        include_data?: boolean;
        tables?: string[];
        compression?: boolean;
    }): Promise<{
        backup_id: string;
        status: 'pending' | 'running' | 'completed' | 'failed';
        created_at: string;
        estimated_completion?: string;
    }>;
    restoreSchema(backupId: string, options?: {
        overwrite_existing?: boolean;
        table_mapping?: Record<string, string>;
    }): Promise<{
        backup_id: string;
        status: 'pending' | 'running' | 'completed' | 'failed';
        started_at: string;
        tables_restored: string[];
        rows_restored: number;
    }>;
    listSchemaBackups(): Promise<Array<{
        id: string;
        created_at: string;
        size: number;
        table_count: number;
        row_count: number;
        includes_data: boolean;
        status: string;
        download_url?: string;
    }>>;
    deleteSchemaBackup(backupId: string): Promise<void>;
    generateDocumentation(options?: {
        format?: 'markdown' | 'html' | 'pdf';
        include_diagrams?: boolean;
        include_examples?: boolean;
        tables?: string[];
    }): Promise<{
        format: string;
        content?: string;
        download_url?: string;
        generated_at: string;
    }>;
    generateERDiagram(options?: {
        format?: 'svg' | 'png' | 'pdf';
        tables?: string[];
        include_columns?: boolean;
        include_relationships?: boolean;
    }): Promise<{
        format: string;
        diagram_url: string;
        generated_at: string;
    }>;
    getTableCreationStatus(jobId: string): Promise<{
        jobId: string;
        status: string;
        progress: number;
        data: any;
        result?: any;
        error?: string;
        createdAt: string;
        processedAt?: string;
        finishedAt?: string;
    }>;
    dropTable(tableName: string, options?: {
        cascade?: boolean;
        backup?: boolean;
    }): Promise<{
        deleted: boolean;
        rows_deleted: number;
        backup_created?: boolean;
        backup_url?: string;
    }>;
    migrate(schema: Record<string, {
        columns: Array<{
            name: string;
            type: string;
            nullable?: boolean;
            unique?: boolean;
            primaryKey?: boolean;
            default?: any;
            references?: {
                table: string;
                column?: string;
                onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
                onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
            };
        }>;
        indexes?: Array<{
            name?: string;
            columns: string[];
            unique?: boolean;
            type?: 'btree' | 'hash' | 'gin' | 'gist';
        }>;
        timestamps?: boolean;
        enableRealtime?: boolean;
        enableSearch?: boolean;
    }>, options?: {
        dryRun?: boolean;
        force?: boolean;
        dropTables?: boolean;
        dev?: boolean;
        onProgress?: ProgressCallback;
    }): Promise<{
        success: boolean;
        plan?: {
            tables: {
                create: string[];
                modify: string[];
                drop: string[];
            };
            columns: {
                add: Array<{
                    table: string;
                    column: string;
                    definition: any;
                }>;
                modify: Array<{
                    table: string;
                    column: string;
                    changes: any;
                }>;
                drop: Array<{
                    table: string;
                    column: string;
                }>;
            };
            indexes: {
                create: Array<{
                    table: string;
                    index: any;
                }>;
                drop: Array<{
                    table: string;
                    indexName: string;
                }>;
            };
            sql: string[];
        };
        applied?: {
            tables: {
                created: number;
                modified: number;
                dropped: number;
            };
            columns: {
                added: number;
                modified: number;
                dropped: number;
            };
            indexes: {
                created: number;
                dropped: number;
            };
        };
        errors?: string[];
    }>;
    generateMigrationPlan(schema: Record<string, any>): Promise<{
        tables: {
            create: string[];
            modify: string[];
            drop: string[];
        };
        columns: {
            add: Array<{
                table: string;
                column: string;
                definition: any;
            }>;
            modify: Array<{
                table: string;
                column: string;
                changes: any;
            }>;
            drop: Array<{
                table: string;
                column: string;
            }>;
        };
        indexes: {
            create: Array<{
                table: string;
                index: any;
            }>;
            drop: Array<{
                table: string;
                indexName: string;
            }>;
        };
        sql: string[];
    }>;
    syncSchema(schema: Record<string, any>, options?: {
        dryRun?: boolean;
        onProgress?: ProgressCallback;
    }): Promise<{
        success: boolean;
        plan?: any;
        applied?: {
            tables: {
                created: number;
                modified: number;
                dropped: number;
            };
            columns: {
                added: number;
                modified: number;
                dropped: number;
            };
            indexes: {
                created: number;
                dropped: number;
            };
        };
        errors?: string[];
    }>;
    getCurrentSchema(options?: {
        includeSystemTables?: boolean;
        includeIndexes?: boolean;
        includeTriggers?: boolean;
    }): Promise<Record<string, any>>;
    validateSchema(schema: Record<string, any>): Promise<{
        valid: boolean;
        errors: string[];
        warnings: string[];
    }>;
}
//# sourceMappingURL=schema.d.ts.map