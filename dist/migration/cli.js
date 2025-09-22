#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationCLI = void 0;
const migrator_1 = require("./migrator");
class MigrationCLI {
    constructor() {
        this.config = this.parseArgs();
        this.migrator = new migrator_1.Migrator({
            apiKey: this.config.apiKey,
            baseURL: this.config.baseURL,
            timeout: this.config.timeout,
        });
    }
    parseArgs() {
        const args = process.argv.slice(2);
        // Default config
        const config = {
            command: 'help',
            args: [],
            apiKey: process.env.FLUXEZ_API_KEY || process.env.FLUXEZ_API_KEY || '',
            baseURL: process.env.FLUXEZ_BASE_URL || process.env.FLUXEZ_BASE_URL || 'http://localhost:3000/api/v1',
            timeout: 60000,
        };
        // Parse command
        if (args.length > 0) {
            config.command = args[0];
            config.args = args.slice(1);
        }
        // Parse flags
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg === '--api-key' && i + 1 < args.length) {
                config.apiKey = args[i + 1];
                i++;
            }
            else if (arg === '--base-url' && i + 1 < args.length) {
                config.baseURL = args[i + 1];
                i++;
            }
            else if (arg === '--timeout' && i + 1 < args.length) {
                config.timeout = parseInt(args[i + 1], 10);
                i++;
            }
        }
        return config;
    }
    async run() {
        try {
            switch (this.config.command) {
                case 'migrate':
                    // Check if a schema file was provided
                    if (this.config.args.length > 0) {
                        await this.runSchemaBasedMigration();
                    }
                    else {
                        await this.runMigrations();
                    }
                    break;
                case 'status':
                    await this.showStatus();
                    break;
                case 'rollback':
                    await this.rollback();
                    break;
                case 'create':
                    await this.createMigration();
                    break;
                case 'reset':
                    await this.reset();
                    break;
                case 'help':
                default:
                    this.showHelp();
                    break;
            }
        }
        catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    }
    async runSchemaBasedMigration() {
        const schemaPath = this.config.args[0];
        const path = require('path');
        const fs = require('fs');
        console.log(`Running migration from schema: ${schemaPath}`);
        // Check if file exists
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found: ${schemaPath}`);
        }
        // Resolve absolute path
        const absolutePath = path.resolve(schemaPath);
        try {
            // Load the schema module
            const schemaModule = require(absolutePath);
            const schema = schemaModule.schema || schemaModule.default || schemaModule;
            // Check for migration options in args
            const isDryRun = this.config.args.includes('--dry-run');
            const isForce = this.config.args.includes('--force');
            const isSync = this.config.args.includes('--sync');
            const isDev = this.config.args.includes('--dev');
            console.log('Migration options:', {
                dryRun: isDryRun,
                force: isForce,
                sync: isSync,
                dev: isDev
            });
            // For now, just log the schema structure
            console.log('Schema loaded successfully');
            console.log('Tables found:', Object.keys(schema).length);
            // TODO: Implement actual schema migration logic
            // This would involve:
            // 1. Parsing the schema structure
            // 2. Generating SQL migrations
            // 3. Applying them to the database
            console.log('✅ Migration completed (placeholder - actual implementation needed)');
        }
        catch (error) {
            console.error('Failed to load schema:', error.message);
            throw error;
        }
    }
    async runMigrations() {
        console.log('Running pending migrations...');
        const results = await this.migrator.runPendingMigrations();
        if (results.length === 0) {
            console.log('✅ No pending migrations');
            return;
        }
        let successCount = 0;
        let failureCount = 0;
        for (const result of results) {
            if (result.success) {
                console.log(`✅ ${result.migration.name} (${result.duration}ms)`);
                successCount++;
            }
            else {
                console.log(`❌ ${result.migration.name} - ${result.error}`);
                failureCount++;
            }
        }
        console.log(`\nCompleted: ${successCount} successful, ${failureCount} failed`);
        if (failureCount > 0) {
            process.exit(1);
        }
    }
    async showStatus() {
        console.log('Migration Status:\n');
        const status = await this.migrator.getStatus();
        console.log(`Total migrations: ${status.total}`);
        console.log(`Applied: ${status.applied}`);
        console.log(`Pending: ${status.pending}`);
        if (status.lastApplied) {
            console.log(`Last applied: ${status.lastApplied.name} (${status.lastApplied.timestamp})`);
        }
        if (status.pending > 0) {
            console.log('\nPending migrations:');
            const pending = await this.migrator.getPendingMigrations();
            for (const migration of pending) {
                console.log(`  - ${migration.name}`);
            }
        }
    }
    async rollback() {
        const migrationId = this.config.args[0];
        if (!migrationId) {
            console.error('Migration ID is required for rollback');
            console.log('Usage: fluxez rollback <migration-id>');
            process.exit(1);
        }
        console.log(`Rolling back migration: ${migrationId}`);
        const result = await this.migrator.rollbackMigration(migrationId);
        if (result.success) {
            console.log(`✅ Rollback completed (${result.duration}ms)`);
        }
        else {
            console.log(`❌ Rollback failed: ${result.error}`);
            process.exit(1);
        }
    }
    async createMigration() {
        const name = this.config.args[0];
        if (!name) {
            console.error('Migration name is required');
            console.log('Usage: fluxez create <migration-name>');
            process.exit(1);
        }
        // For CLI, we'll create a simple template
        const sql = `-- Add your migration SQL here
-- Example:
-- CREATE TABLE example (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP DEFAULT NOW()
-- );`;
        const rollback = `-- Add your rollback SQL here
-- Example:
-- DROP TABLE IF EXISTS example;`;
        const migration = await this.migrator.createMigration(name, sql, rollback);
        console.log(`✅ Created migration: ${migration.name}`);
        console.log(`ID: ${migration.id}`);
        console.log('Edit the migration SQL before running migrations.');
    }
    async reset() {
        console.log('⚠️  This will reset ALL migrations and drop ALL tables!');
        console.log('Type "yes" to continue:');
        // In a real CLI, you'd use readline for input
        // For now, we'll just show the warning
        console.log('Reset cancelled. Use with caution in production!');
        // Uncomment to actually reset:
        // await this.migrator.reset();
        // console.log('✅ All migrations have been reset');
    }
    showHelp() {
        console.log(`
Fluxez Migration CLI

Usage: fluxez <command> [options]

Commands:
  migrate                Run pending migrations
  status                 Show migration status
  rollback <id>         Rollback a specific migration
  create <name>         Create a new migration
  reset                 Reset all migrations (dangerous!)
  help                  Show this help message

Options:
  --api-key <key>       API key (or set FLUXEZ_API_KEY env var)
  --base-url <url>      Base URL (or set FLUXEZ_BASE_URL env var)
  --timeout <ms>        Request timeout in milliseconds

Environment Variables:
  FLUXEZ_API_KEY        Your Fluxez API key
  FLUXEZ_BASE_URL       Fluxez API base URL
  FLUXEZ_API_KEY     Legacy API key (for backward compatibility)
  FLUXEZ_BASE_URL    Legacy base URL (for backward compatibility)

Examples:
  fluxez migrate
  fluxez status
  fluxez create add_users_table
  fluxez rollback migration_123
  fluxez migrate --api-key cgx_your_key
`);
    }
}
exports.MigrationCLI = MigrationCLI;
// Run CLI if this file is executed directly
if (require.main === module) {
    const cli = new MigrationCLI();
    cli.run().catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=cli.js.map