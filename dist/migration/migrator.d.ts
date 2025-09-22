export interface MigrationConfig {
    apiKey: string;
    baseURL?: string;
    timeout?: number;
}
export interface Migration {
    id: string;
    name: string;
    sql: string;
    rollback?: string;
    timestamp: string;
    applied: boolean;
}
export interface MigrationResult {
    success: boolean;
    migration: Migration;
    error?: string;
    duration: number;
}
export declare class Migrator {
    private httpClient;
    private logger;
    constructor(config: MigrationConfig);
    /**
     * Get all migrations from the server
     */
    getMigrations(): Promise<Migration[]>;
    /**
     * Get pending migrations
     */
    getPendingMigrations(): Promise<Migration[]>;
    /**
     * Run a single migration
     */
    runMigration(migration: Migration): Promise<MigrationResult>;
    /**
     * Run all pending migrations
     */
    runPendingMigrations(): Promise<MigrationResult[]>;
    /**
     * Rollback a migration
     */
    rollbackMigration(migrationId: string): Promise<MigrationResult>;
    /**
     * Create a new migration
     */
    createMigration(name: string, sql: string, rollback?: string): Promise<Migration>;
    /**
     * Check migration status
     */
    getStatus(): Promise<{
        total: number;
        applied: number;
        pending: number;
        lastApplied?: Migration;
    }>;
    /**
     * Reset all migrations (dangerous!)
     */
    reset(): Promise<void>;
}
//# sourceMappingURL=migrator.d.ts.map