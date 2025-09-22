#!/usr/bin/env node

import { program } from 'commander';
import { migrateCommand } from './commands/migrate';

// Define the main CLI program
program
  .name('fluxez')
  .description('Fluxez SDK CLI - Database migrations and more')
  .version('1.0.0');

// Add the migrate command
program.addCommand(migrateCommand);

// Parse command line arguments
program.parse(process.argv);