#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const migrate_1 = require("./commands/migrate");
// Define the main CLI program
commander_1.program
    .name('fluxez')
    .description('Fluxez SDK CLI - Database migrations and more')
    .version('1.0.0');
// Add the migrate command
commander_1.program.addCommand(migrate_1.migrateCommand);
// Parse command line arguments
commander_1.program.parse(process.argv);
//# sourceMappingURL=index.js.map