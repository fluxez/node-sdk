#!/usr/bin/env node
declare class MigrationCLI {
    private config;
    private migrator;
    constructor();
    private parseArgs;
    run(): Promise<void>;
    private runSchemaBasedMigration;
    private runMigrations;
    private showStatus;
    private rollback;
    private createMigration;
    private reset;
    private showHelp;
}
export { MigrationCLI };
//# sourceMappingURL=cli.d.ts.map