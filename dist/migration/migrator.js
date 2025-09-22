"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migrator = void 0;
const http_client_1 = require("../core/http-client");
const logger_1 = require("../utils/logger");
class Migrator {
    constructor(config) {
        if (!config.apiKey) {
            throw new Error('API key is required for migrations');
        }
        this.httpClient = new http_client_1.HttpClient(config.apiKey, {
            baseURL: config.baseURL || 'http://localhost:3000/api/v1',
            timeout: config.timeout || 60000,
        });
        this.logger = new logger_1.Logger(true);
    }
    /**
     * Get all migrations from the server
     */
    async getMigrations() {
        try {
            const response = await this.httpClient.get('/schema/migrations');
            return response.data || [];
        }
        catch (error) {
            this.logger.error('Failed to fetch migrations', error);
            throw error;
        }
    }
    /**
     * Get pending migrations
     */
    async getPendingMigrations() {
        const migrations = await this.getMigrations();
        return migrations.filter(m => !m.applied);
    }
    /**
     * Run a single migration
     */
    async runMigration(migration) {
        const startTime = Date.now();
        try {
            this.logger.info(`Running migration: ${migration.name}`);
            const response = await this.httpClient.post('/schema/migrate', {
                migrationId: migration.id,
                sql: migration.sql,
            });
            const duration = Date.now() - startTime;
            this.logger.info(`Migration completed in ${duration}ms`);
            return {
                success: true,
                migration,
                duration,
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(`Migration failed: ${error.message}`);
            return {
                success: false,
                migration,
                error: error.message,
                duration,
            };
        }
    }
    /**
     * Run all pending migrations
     */
    async runPendingMigrations() {
        const pendingMigrations = await this.getPendingMigrations();
        if (pendingMigrations.length === 0) {
            this.logger.info('No pending migrations');
            return [];
        }
        this.logger.info(`Found ${pendingMigrations.length} pending migrations`);
        const results = [];
        for (const migration of pendingMigrations) {
            const result = await this.runMigration(migration);
            results.push(result);
            if (!result.success) {
                this.logger.error(`Stopping migration process due to failure in: ${migration.name}`);
                break;
            }
        }
        return results;
    }
    /**
     * Rollback a migration
     */
    async rollbackMigration(migrationId) {
        const startTime = Date.now();
        try {
            const migrations = await this.getMigrations();
            const migration = migrations.find(m => m.id === migrationId);
            if (!migration) {
                throw new Error(`Migration not found: ${migrationId}`);
            }
            if (!migration.rollback) {
                throw new Error(`No rollback script available for migration: ${migration.name}`);
            }
            this.logger.info(`Rolling back migration: ${migration.name}`);
            const response = await this.httpClient.post('/schema/rollback', {
                migrationId: migration.id,
                sql: migration.rollback,
            });
            const duration = Date.now() - startTime;
            this.logger.info(`Rollback completed in ${duration}ms`);
            return {
                success: true,
                migration,
                duration,
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(`Rollback failed: ${error.message}`);
            return {
                success: false,
                migration: {},
                error: error.message,
                duration,
            };
        }
    }
    /**
     * Create a new migration
     */
    async createMigration(name, sql, rollback) {
        try {
            const migration = {
                name,
                sql,
                rollback,
                timestamp: new Date().toISOString(),
            };
            const response = await this.httpClient.post('/schema/migrations', migration);
            this.logger.info(`Created migration: ${name}`);
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to create migration', error);
            throw error;
        }
    }
    /**
     * Check migration status
     */
    async getStatus() {
        const migrations = await this.getMigrations();
        const applied = migrations.filter(m => m.applied);
        const pending = migrations.filter(m => !m.applied);
        const lastApplied = applied
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        return {
            total: migrations.length,
            applied: applied.length,
            pending: pending.length,
            lastApplied,
        };
    }
    /**
     * Reset all migrations (dangerous!)
     */
    async reset() {
        try {
            this.logger.warn('Resetting all migrations - this will drop all tables!');
            await this.httpClient.post('/schema/reset');
            this.logger.info('All migrations have been reset');
        }
        catch (error) {
            this.logger.error('Failed to reset migrations', error);
            throw error;
        }
    }
}
exports.Migrator = Migrator;
//# sourceMappingURL=migrator.js.map