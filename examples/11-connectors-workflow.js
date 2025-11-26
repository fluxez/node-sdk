/**
 * Fluxez SDK - Connectors & Workflows Example
 *
 * This example demonstrates how to use connectors and workflows,
 * similar to how Slack, Google Drive, and other apps work in platforms like Zapier.
 *
 * Use cases:
 * - Connect external services (Google Drive, Slack, Notion, etc.)
 * - Automate workflows between services
 * - Build integrations for your app (like Deskive using Google Drive)
 */

const { FluxezClient } = require('@fluxez/node-sdk');

// Initialize client with your API key
// The API key already contains the project/app context
const client = new FluxezClient('service_your_api_key_here', {
  debug: true // Optional: enable debug logging
});

async function connectorExamples() {
  console.log('\n=== 1. Discover Available Connectors ===\n');

  // Get all available connectors
  const allConnectors = await client.connectors.getAvailableConnectors();
  console.log(`Total available connectors: ${allConnectors.length}`);

  // Filter by category
  const storageConnectors = await client.connectors.getAvailableConnectors({
    category: 'storage'
  });
  console.log('Storage connectors:', storageConnectors.map(c => c.name));

  // Search for specific connector
  const googleConnectors = await client.connectors.getAvailableConnectors({
    search: 'google'
  });
  console.log('Google connectors:', googleConnectors.map(c => c.name));

  console.log('\n=== 2. Get Connector Metadata ===\n');

  // Get detailed information about a specific connector
  const googleDriveMetadata = await client.connectors.getConnectorMetadata('google-drive');
  console.log('Google Drive Connector:');
  console.log('- Name:', googleDriveMetadata.name);
  console.log('- Category:', googleDriveMetadata.category);
  console.log('- Requires OAuth:', googleDriveMetadata.requiresOAuth);
  console.log('- Config Fields:', googleDriveMetadata.configFields.map(f => f.name));
  console.log('- Available Actions:', googleDriveMetadata.actions.map(a => a.name));
  console.log('- Available Triggers:', googleDriveMetadata.triggers.map(t => t.name));

  console.log('\n=== 3. Configure Connectors ===\n');

  // Example 1: Configure Google Drive (OAuth)
  const googleDriveConfig = await client.connectors.create({
    connector_type: 'google-drive',
    name: 'My Google Drive',
    config: {
      // OAuth connectors will be configured through OAuth flow
      // This config is saved after OAuth callback
    },
    enabled: true
  });
  console.log('Google Drive configured:', googleDriveConfig.id);

  // Example 2: Configure Slack (OAuth)
  const slackConfig = await client.connectors.create({
    connector_type: 'slack',
    name: 'Team Slack Workspace',
    config: {
      // OAuth will populate: access_token, workspace_id, etc.
    },
    enabled: true
  });
  console.log('Slack configured:', slackConfig.id);

  // Example 3: Configure Notion (OAuth)
  const notionConfig = await client.connectors.create({
    connector_type: 'notion',
    name: 'Company Notion',
    config: {},
    enabled: true
  });
  console.log('Notion configured:', notionConfig.id);

  // Example 4: Configure OpenAI (API Key)
  const openaiConfig = await client.connectors.create({
    connector_type: 'openai',
    name: 'OpenAI API',
    config: {
      api_key: 'sk-...',
      organization_id: 'org-...' // Optional
    },
    enabled: true
  });
  console.log('OpenAI configured:', openaiConfig.id);

  console.log('\n=== 4. Test Connector Connection ===\n');

  // Test if connector is working
  const testResult = await client.connectors.test(googleDriveConfig.id);
  console.log('Connection test:', testResult.success ? '✓ Passed' : '✗ Failed');
  if (testResult.message) {
    console.log('Message:', testResult.message);
  }

  console.log('\n=== 5. OAuth Flow ===\n');

  // Step 1: Get OAuth URL for user authorization
  const oauthUrl = client.connectors.getOAuthUrl(
    'google-drive',
    'https://yourapp.com/oauth/callback',
    'random_state_string'
  );
  console.log('Send user to:', oauthUrl);

  // Step 2: After user authorizes, handle the callback
  // The backend will automatically save the OAuth tokens to your connector config

  console.log('\n=== 6. Resource Discovery (Google Drive) ===\n');

  // Get all drives (My Drive + Shared Drives)
  const drives = await client.connectors.getGoogleDrives(googleDriveConfig.id);
  console.log('Available drives:', drives.map(d => `${d.name} (${d.type})`));

  // Get folders
  const folders = await client.connectors.getGoogleFolders(googleDriveConfig.id, {
    drive_id: drives[0]?.id,
    limit: 10
  });
  console.log('Folders:', folders.map(f => f.name));

  // Get files
  const files = await client.connectors.getGoogleFiles(googleDriveConfig.id, {
    folder_id: folders[0]?.id,
    limit: 20
  });
  console.log('Files:', files.map(f => `${f.name} (${f.mime_type})`));

  // Get spreadsheets
  const spreadsheets = await client.connectors.getGoogleSpreadsheets(googleDriveConfig.id);
  console.log('Spreadsheets:', spreadsheets.map(s => s.name));

  if (spreadsheets.length > 0) {
    // Get sheets from a spreadsheet
    const sheets = await client.connectors.getGoogleSheets(
      googleDriveConfig.id,
      spreadsheets[0].id
    );
    console.log('Sheets in first spreadsheet:', sheets.map(s => s.name));

    // Get columns from a sheet
    const columns = await client.connectors.getGoogleSheetColumns(
      googleDriveConfig.id,
      spreadsheets[0].id,
      sheets[0].name
    );
    console.log('Columns:', columns.map(c => `${c.letter}: ${c.header}`));
  }

  // Get calendars
  const calendars = await client.connectors.getGoogleCalendars(googleDriveConfig.id);
  console.log('Calendars:', calendars.map(c => `${c.name} (${c.primary ? 'Primary' : 'Secondary'})`));

  console.log('\n=== 7. Resource Discovery (Notion) ===\n');

  // Get Notion databases
  const databases = await client.connectors.getNotionDatabases(notionConfig.id);
  console.log('Notion databases:', databases.map(d => d.name));

  // Get Notion pages
  const pages = await client.connectors.getNotionPages(notionConfig.id, {
    parent_id: databases[0]?.id
  });
  console.log('Notion pages:', pages.map(p => p.title));

  console.log('\n=== 8. Execute Connector Actions ===\n');

  // Example: Upload file to Google Drive
  const uploadResult = await client.connectors.executeAction(
    googleDriveConfig.id,
    'upload-file',
    {
      name: 'document.pdf',
      content: Buffer.from('...').toString('base64'),
      folder_id: folders[0]?.id,
      mime_type: 'application/pdf'
    }
  );
  console.log('File uploaded:', uploadResult.success);

  // Example: Send Slack message
  const slackResult = await client.connectors.executeAction(
    slackConfig.id,
    'send-message',
    {
      channel: '#general',
      text: 'Hello from Fluxez SDK!',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Automated message* from Fluxez workflow'
          }
        }
      ]
    }
  );
  console.log('Slack message sent:', slackResult.success);

  // Example: Create Notion page
  const notionResult = await client.connectors.executeAction(
    notionConfig.id,
    'create-page',
    {
      parent_id: databases[0]?.id,
      title: 'New Task',
      properties: {
        Status: { select: { name: 'Todo' } },
        Priority: { select: { name: 'High' } }
      }
    }
  );
  console.log('Notion page created:', notionResult.success);

  console.log('\n=== 9. Setup Webhooks ===\n');

  // Setup webhook for Google Drive file changes
  const webhook = await client.connectors.setupWebhook(
    googleDriveConfig.id,
    {
      events: ['file.created', 'file.updated', 'file.deleted'],
      callback_url: 'https://yourapp.com/webhooks/google-drive'
    }
  );
  console.log('Webhook URL:', webhook.webhook_url);
  console.log('Webhook secret:', webhook.secret);

  console.log('\n=== 10. List Configured Connectors ===\n');

  // Get all configured connectors
  const myConnectors = await client.connectors.list();
  console.log(`Total configured connectors: ${myConnectors.total}`);

  // Filter by type
  const googleConnectorsOnly = await client.connectors.list({
    connector_type: 'google-drive',
    enabled: true
  });
  console.log('Google Drive connectors:', googleConnectorsOnly.connectors.length);

  // Group by category
  const byCategory = await client.connectors.getByCategory();
  Object.entries(byCategory).forEach(([category, connectors]) => {
    console.log(`${category}:`, connectors.map(c => c.name).join(', '));
  });

  console.log('\n=== 11. Get Connector Usage Stats ===\n');

  const stats = await client.connectors.getUsageStats(googleDriveConfig.id, {
    start_date: '2024-01-01',
    end_date: '2024-12-31'
  });
  console.log('Usage statistics:');
  console.log('- Total calls:', stats.total_calls);
  console.log('- Success rate:', `${(100 - stats.error_rate).toFixed(2)}%`);
  console.log('- Avg response time:', `${stats.average_response_time}ms`);

  console.log('\n=== 12. Update & Delete Connectors ===\n');

  // Update connector
  await client.connectors.update(googleDriveConfig.id, {
    name: 'Primary Google Drive',
    enabled: true
  });
  console.log('Connector updated');

  // Delete connector
  // await client.connectors.delete(googleDriveConfig.id);
  // console.log('Connector deleted');
}

async function workflowExamples() {
  console.log('\n\n========== WORKFLOW EXAMPLES ==========\n');

  console.log('\n=== 1. List Workflow Templates ===\n');

  // Get pre-built workflow templates
  const templates = await client.workflow.getTemplates({
    category: 'automation',
    complexity: 'simple'
  });
  console.log('Available templates:', templates.map(t => t.name));

  templates.slice(0, 3).forEach(t => {
    console.log(`\n${t.name}:`);
    console.log(`  - Category: ${t.category}`);
    console.log(`  - Complexity: ${t.complexity}`);
    console.log(`  - Est. time: ${t.estimatedTime}`);
    console.log(`  - Description: ${t.description}`);
  });

  console.log('\n=== 2. Create Workflow from Template ===\n');

  // Create a workflow from a template
  const newWorkflow = await client.workflow.createFromTemplate(
    templates[0].id,
    {
      name: 'My Automated Workflow',
      description: 'Auto-sync files from Google Drive to Notion',
      variables: {
        drive_folder: 'Documents',
        notion_database: 'Files Registry'
      },
      connectorConfigs: {
        googleDrive: 'connector_id_123',
        notion: 'connector_id_456'
      }
    }
  );
  console.log('Workflow created from template:', newWorkflow.id);

  console.log('\n=== 3. Create Custom Workflow ===\n');

  // Create a custom workflow
  const customWorkflow = await client.workflow.create({
    name: 'New File Notification',
    description: 'Send Slack message when new file uploaded to Google Drive',
    triggers: [
      {
        type: 'webhook',
        connector: 'google-drive',
        event: 'file.created',
        config: {
          folder_id: 'folder_xyz'
        }
      }
    ],
    nodes: [
      {
        id: 'node_1',
        type: 'connector_action',
        connector: 'slack',
        action: 'send-message',
        config: {
          channel: '#notifications',
          text: 'New file uploaded: {{trigger.file.name}}'
        }
      }
    ],
    edges: [
      {
        from: 'trigger',
        to: 'node_1'
      }
    ],
    status: 'active'
  });
  console.log('Custom workflow created:', customWorkflow.id);

  console.log('\n=== 4. Generate Workflow from Natural Language ===\n');

  // AI-powered workflow generation
  const generated Workflow = await client.workflow.generateFromPrompt(
    'When a new row is added to my Google Sheet "Customers", create a new card in Notion database "CRM"',
    {
      complexity: 'medium',
      includeErrorHandling: true,
      connectorPreferences: ['google-sheets', 'notion']
    }
  );
  console.log('Generated workflow:', generatedWorkflow.name);
  console.log('Nodes:', generatedWorkflow.nodes?.length);

  console.log('\n=== 5. Execute Workflow ===\n');

  // Manual workflow execution
  const execution = await client.workflow.execute(customWorkflow.id, {
    input: {
      file_id: 'file_123',
      file_name: 'Report.pdf'
    }
  });
  console.log('Execution ID:', execution.id);
  console.log('Status:', execution.status);
  console.log('Output:', execution.output_data);

  console.log('\n=== 6. List Workflows ===\n');

  const workflows = await client.workflow.list({
    status: 'active',
    category: 'automation',
    limit: 20
  });
  console.log(`Total workflows: ${workflows.total}`);
  workflows.workflows.forEach(w => {
    console.log(`- ${w.name} (${w.status})`);
  });

  console.log('\n=== 7. Get Workflow Execution History ===\n');

  const executions = await client.workflow.getExecutions(customWorkflow.id, {
    limit: 10,
    status: 'completed'
  });
  console.log(`Total executions: ${executions.total}`);
  executions.executions.forEach(e => {
    console.log(`- ${e.id}: ${e.status} (${e.duration}ms)`);
  });

  console.log('\n=== 8. Workflow Statistics ===\n');

  const stats = await client.workflow.getStats();
  console.log('Workflow statistics:');
  console.log('- Total workflows:', stats.totalWorkflows);
  console.log('- Active workflows:', stats.activeWorkflows);
  console.log('- Total executions:', stats.totalExecutions);
  console.log('- Success rate:', `${stats.successRate.toFixed(2)}%`);
  console.log('- Most used connectors:', stats.mostUsedConnectors.map(c => c.connector).join(', '));

  console.log('\n=== 9. Validate Workflow ===\n');

  const validation = await client.workflow.validate({
    name: 'Test Workflow',
    nodes: [
      {
        id: 'node_1',
        type: 'connector_action',
        connector: 'google-drive',
        action: 'upload-file'
      }
    ],
    edges: []
  });
  console.log('Validation:', validation.isValid ? '✓ Valid' : '✗ Invalid');
  if (validation.errors.length > 0) {
    console.log('Errors:', validation.errors.map(e => e.message));
  }
  console.log('Estimated execution time:', validation.performance.estimatedExecutionTime);

  console.log('\n=== 10. Update & Delete Workflow ===\n');

  // Update workflow
  await client.workflow.update(customWorkflow.id, {
    name: 'Updated Workflow Name',
    status: 'inactive'
  });
  console.log('Workflow updated');

  // Delete workflow
  // await client.workflow.delete(customWorkflow.id);
  // console.log('Workflow deleted');
}

async function realWorldExample() {
  console.log('\n\n========== REAL-WORLD EXAMPLE: Deskive-like Integration ==========\n');
  console.log('Building a file management system like Deskive with Google Drive integration');

  // Step 1: Configure Google Drive connector
  const googleDrive = await client.connectors.create({
    connector_type: 'google-drive',
    name: 'Deskive Google Drive',
    config: {},
    enabled: true
  });
  console.log('\n✓ Google Drive connector configured');

  // Step 2: Configure Slack for notifications
  const slack = await client.connectors.create({
    connector_type: 'slack',
    name: 'Team Notifications',
    config: {},
    enabled: true
  });
  console.log('✓ Slack connector configured');

  // Step 3: Get user's drives and folders
  const drives = await client.connectors.getGoogleDrives(googleDrive.id);
  const folders = await client.connectors.getGoogleFolders(googleDrive.id);
  console.log(`\n✓ Found ${drives.length} drives and ${folders.length} folders`);

  // Step 4: Create workflow for new file notifications
  const fileNotificationWorkflow = await client.workflow.create({
    name: 'New File Alert',
    description: 'Notify team in Slack when new file is added',
    triggers: [
      {
        type: 'webhook',
        connector: googleDrive.id,
        event: 'file.created'
      }
    ],
    nodes: [
      {
        id: 'notify_slack',
        type: 'connector_action',
        connector: slack.id,
        action: 'send-message',
        config: {
          channel: '#file-updates',
          text: '📄 New file: {{trigger.file.name}}\n👤 Uploaded by: {{trigger.user.email}}\n📁 Folder: {{trigger.folder.name}}\n🔗 {{trigger.file.web_view_link}}'
        }
      }
    ],
    edges: [
      { from: 'trigger', to: 'notify_slack' }
    ],
    status: 'active'
  });
  console.log('\n✓ File notification workflow created');

  // Step 5: Create workflow for file backup
  const backupWorkflow = await client.workflow.create({
    name: 'Daily File Backup',
    description: 'Backup important files to secondary location',
    triggers: [
      {
        type: 'schedule',
        config: {
          cron: '0 2 * * *' // Every day at 2 AM
        }
      }
    ],
    nodes: [
      {
        id: 'list_files',
        type: 'connector_action',
        connector: googleDrive.id,
        action: 'list-files',
        config: {
          folder_id: '{{config.source_folder}}',
          modified_after: '{{trigger.last_run}}'
        }
      },
      {
        id: 'copy_files',
        type: 'loop',
        config: {
          items: '{{list_files.files}}'
        },
        nodes: [
          {
            id: 'copy_file',
            type: 'connector_action',
            connector: googleDrive.id,
            action: 'copy-file',
            config: {
              file_id: '{{item.id}}',
              destination_folder: '{{config.backup_folder}}'
            }
          }
        ]
      },
      {
        id: 'notify_completion',
        type: 'connector_action',
        connector: slack.id,
        action: 'send-message',
        config: {
          channel: '#backups',
          text: '✅ Backup completed: {{copy_files.count}} files backed up'
        }
      }
    ],
    edges: [
      { from: 'trigger', to: 'list_files' },
      { from: 'list_files', to: 'copy_files' },
      { from: 'copy_files', to: 'notify_completion' }
    ],
    status: 'active'
  });
  console.log('✓ Backup workflow created');

  // Step 6: List files for UI display
  const recentFiles = await client.connectors.getGoogleFiles(googleDrive.id, {
    limit: 50
  });
  console.log(`\n✓ Retrieved ${recentFiles.length} files for display`);

  // Step 7: Upload a file programmatically
  const uploadResult = await client.connectors.executeAction(
    googleDrive.id,
    'upload-file',
    {
      name: 'test-document.txt',
      content: Buffer.from('Hello from Deskive!').toString('base64'),
      folder_id: folders[0]?.id,
      mime_type: 'text/plain'
    }
  );
  console.log('\n✓ File uploaded successfully');

  // Step 8: Get workflow statistics
  const workflowStats = await client.workflow.getStats();
  console.log(`\n✓ Active workflows: ${workflowStats.activeWorkflows}`);
  console.log(`✓ Total executions: ${workflowStats.totalExecutions}`);
  console.log(`✓ Success rate: ${workflowStats.successRate.toFixed(2)}%`);

  console.log('\n✅ Deskive-like integration complete!');
}

// Run examples
async function main() {
  try {
    await connectorExamples();
    await workflowExamples();
    await realWorldExample();
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

main();
