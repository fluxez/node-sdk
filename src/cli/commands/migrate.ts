import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { FluxezClient } from '../../index';
import { MigrationProgress } from '../../schema/schema';

// Try to load .env files from the current working directory
try {
  const dotenv = require('dotenv');
  // Try multiple .env file locations
  const envFiles = ['.env.local', '.env'];
  for (const envFile of envFiles) {
    const envPath = path.resolve(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      console.log(chalk.gray(`Loaded environment from ${envFile}`));
      break;
    }
  }
} catch (e) {
  // dotenv not available, continue without it
}

// Helper to load schema from a file
async function loadSchema(schemaPath: string): Promise<any> {
  const resolvedPath = path.resolve(process.cwd(), schemaPath);
  
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Schema file not found: ${resolvedPath}`);
  }

  // Handle both .ts and .js files
  if (resolvedPath.endsWith('.ts')) {
    // Try to use tsx if available, otherwise ts-node
    try {
      // Check if tsx is available
      require.resolve('tsx');
      // Register tsx
      require('tsx/cjs');
    } catch {
      try {
        // Fallback to ts-node
        require('ts-node/register');
      } catch {
        console.log(chalk.yellow('⚠️  Loading TypeScript schema files requires ts-node or tsx to be installed'));
        console.log(chalk.gray('You can install it with: npm install -D tsx'));
      }
    }
  }

  // Try to import the schema module
  try {
    // Use require for TypeScript files to ensure proper transpilation
    if (resolvedPath.endsWith('.ts')) {
      delete require.cache[resolvedPath];
      const schemaModule = require(resolvedPath);
      return schemaModule.schema || schemaModule.default || schemaModule;
    } else {
      // Use dynamic import for JS files
      const schemaModule = await import(resolvedPath);
      return schemaModule.schema || schemaModule.default || schemaModule;
    }
  } catch (error: any) {
    throw new Error(`Failed to load schema: ${error.message}`);
  }
}

// Helper to get API configuration
function getApiConfig() {
  const apiKey = process.env.FLUXEZ_API_KEY || process.env.APPATONCE_API_KEY;

  if (!apiKey) {
    console.error(chalk.red('❌ FLUXEZ_API_KEY not found!'));
    console.error('\\nPlease set it in your environment:');
    console.error('  export FLUXEZ_API_KEY=your_api_key');
    console.error('\\nOr add it to a .env file in your project root');
    process.exit(1);
  }

  return { apiKey };
}

// Helper to handle progress display
function createProgressHandler() {
  return (progress: MigrationProgress) => {
    switch (progress.type) {
      case 'info':
        console.log(chalk.blue(`ℹ️  ${progress.message}`));
        break;
      
      case 'progress':
        if (progress.current && progress.total) {
          const percentage = Math.round((progress.current / progress.total) * 100);
          const barLength = 30;
          const filled = Math.round((barLength * progress.current) / progress.total);
          const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
          
          // Show progress bar with table name
          let progressLine = `📊 [${bar}] ${percentage}% (${progress.current}/${progress.total})`;
          
          if (progress.table) {
            progressLine += chalk.gray(` - ${progress.table}`);
          }
          
          console.log(chalk.cyan(progressLine));
        } else {
          console.log(chalk.yellow(`⏳ ${progress.message}`));
        }
        break;
      
      case 'complete':
        console.log(chalk.green(`✅ ${progress.message || 'Migration completed'}`));
        break;
      
      case 'error':
        console.log(chalk.red(`❌ ${progress.message}`));
        break;
    }
  };
}

// Main migration function
async function runMigration(schemaPath: string, options: any) {
  const { apiKey } = getApiConfig();
  
  // Create client with debug mode if verbose
  const client = new FluxezClient(apiKey, {
    debug: options.verbose || false
  });

  try {
    console.log(chalk.blue('🚀 Fluxez Database Migration'));
    console.log(chalk.gray('================================\\n'));

    // Load schema
    console.log(chalk.gray(`Loading schema from ${schemaPath}...`));
    const schema = await loadSchema(schemaPath);
    
    // Skip connection test since ping endpoint is not available
    // Just assume we're connected if the client was created successfully
    console.log(chalk.green(`✅ Ready to migrate\\n`));

    // NOTE: Realtime WebSocket connection disabled for migrations
    // Migrations use SSE (Server-Sent Events) for progress updates via /schema/migration-progress
    // The realtime WebSocket is only needed for live data subscriptions, not migrations

    // Try to connect to realtime for progress updates
    // if (!options.dryRun) {
    //   try {
    //     if (client.realtime && !client.realtime.isConnectedToRealtime()) {
    //       console.log(chalk.gray('📡 Connecting to realtime server for progress updates...'));
    //       await client.realtime.connect();
    //       console.log(chalk.green('✅ Connected to realtime server'));
    //       await new Promise(resolve => setTimeout(resolve, 1000));
    //     }
    //   } catch (err) {
    //     console.log(chalk.yellow('⚠️  Could not connect to realtime server, progress updates disabled'));
    //   }
    // }

    let result;
    const progressHandler = createProgressHandler();

    if (options.force) {
      // Force sync - drops and recreates all tables
      console.log(chalk.red.bold('⚠️  WARNING: Force sync will DROP and recreate all tables!'));
      console.log(chalk.red.bold('⚠️  All data will be lost! Use with extreme caution.\\n'));
      
      // Ask for confirmation in non-CI environments
      if (!process.env.CI && !options.yes) {
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });

        const answer = await new Promise<string>((resolve) => {
          readline.question(chalk.yellow('Type "yes" to confirm force sync: '), resolve);
        });
        readline.close();

        if (answer.toLowerCase() !== 'yes') {
          console.log(chalk.yellow('\\n❌ Force sync cancelled'));
          process.exit(0);
        }
      }

      result = await client.schema.migrate(schema, {
        force: true,
        dropTables: true,
        onProgress: progressHandler
      });
      
    } else if (options.sync) {
      // Sync mode - only creates new tables
      console.log(chalk.cyan('📦 Running in sync mode (create new tables only)...\\n'));
      
      result = await client.schema.syncSchema(schema, {
        onProgress: progressHandler
      });
      
    } else {
      // Full migration
      console.log(chalk.cyan('🔄 Running full migration...\\n'));
      
      // Show warning if dev mode is enabled
      if (options.dev && !options.dryRun) {
        console.log(chalk.yellow.bold('⚠️  Development mode enabled!'));
        console.log(chalk.yellow('This allows:'));
        console.log(chalk.yellow('  • Dropping columns'));
        console.log(chalk.yellow('  • Changing column types'));
        console.log(chalk.yellow('  • Dropping tables'));
        console.log(chalk.yellow.bold('⚠️  These operations can cause data loss!\\n'));
      }
      
      result = await client.schema.migrate(schema, {
        dryRun: options.dryRun,
        dev: options.dev, // Enable dev mode for full schema changes
        onProgress: progressHandler
      });
    }

    // Add spacing after migration
    console.log('');

    // Display results
    if (result.success) {
      if (options.dryRun) {
        console.log(chalk.green('\\n✅ Dry run completed successfully'));
        console.log(chalk.gray('No changes were applied to the database'));
      } else {
        console.log(chalk.green('\\n✅ Migration completed successfully!'));
      }
      
      // Explicitly exit on success
      process.exit(0);
    } else {
      console.error(chalk.red('\\n❌ Migration failed'));
      if (result.errors && result.errors.length > 0) {
        console.error(chalk.red('\\nErrors:'));
        result.errors.forEach((error: string) => {
          console.error(chalk.red(`  - ${error}`));
        });
      }
      process.exit(1);
    }

  } catch (error: any) {
    console.error(chalk.red('\\n❌ Migration error:'), error.message);
    if (options.verbose && error.stack) {
      console.error(chalk.gray(error.stack));
    }
    process.exit(1);
  } finally {
    // Always disconnect realtime connection
    if (client.realtime && client.realtime.isConnectedToRealtime()) {
      console.log(chalk.gray('\\nDisconnecting from realtime server...'));
      client.realtime.disconnect();
    }
  }
}

// Create the migrate command
export const migrateCommand = new Command('migrate')
  .description('Run database migrations')
  .argument('<schema>', 'Path to schema file (e.g., ./schema.ts or ./schema.js)')
  .option('-d, --dry-run', 'Preview changes without applying them')
  .option('-s, --sync', 'Only create new tables (safe mode)')
  .option('-f, --force', 'Force recreate all tables (WARNING: Data loss!)')
  .option('--dev', 'Development mode - allows column drops, type changes, and table drops')
  .option('-y, --yes', 'Skip confirmation prompts')
  .option('-v, --verbose', 'Show detailed output')
  .action(runMigration);

// Add subcommands
migrateCommand
  .command('up')
  .description('Apply pending migrations (default)')
  .argument('<schema>', 'Path to schema file')
  .option('-d, --dry-run', 'Preview changes without applying them')
  .option('--dev', 'Development mode - allows column drops, type changes, and table drops')
  .option('-v, --verbose', 'Show detailed output')
  .action((schema: string, options: any) => runMigration(schema, options));

migrateCommand
  .command('sync')
  .description('Create new tables only (safe mode)')
  .argument('<schema>', 'Path to schema file')
  .option('-v, --verbose', 'Show detailed output')
  .action((schema: string, options: any) => runMigration(schema, { ...options, sync: true }));

migrateCommand
  .command('force')
  .description('Force recreate all tables (WARNING: Data loss!)')
  .argument('<schema>', 'Path to schema file')
  .option('-y, --yes', 'Skip confirmation prompts')
  .option('-v, --verbose', 'Show detailed output')
  .action((schema: string, options: any) => runMigration(schema, { ...options, force: true }));