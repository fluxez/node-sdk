/**
 * Fluxez SDK - Workflow Examples
 * 
 * This example demonstrates comprehensive workflow automation using the Fluxez SDK.
 * Perfect for business process automation, integration workflows, and event-driven systems.
 * 
 * Features demonstrated:
 * - Creating workflows from natural language
 * - Workflow execution and monitoring
 * - Connector configuration and usage
 * - Conditional logic and branching
 * - Error handling and retries
 * - Scheduled and triggered workflows
 * - Custom connector development
 * - Workflow analytics and optimization
 * 
 * Time to complete: ~15 minutes
 */

const { FluxezClient } = require('@fluxez/node-sdk');

// Configuration
const API_KEY = process.env.FLUXEZ_API_KEY || 'cgx_your_api_key_here';
const API_URL = process.env.FLUXEZ_API_URL || 'https://api.fluxez.com/api/v1';

async function workflowExamplesMain() {
  console.log('🔄 Fluxez SDK Workflow Examples\n');

  const client = new FluxezClient(API_KEY, {
    apiUrl: API_URL,
    debug: true,
    timeout: 120000, // Longer timeout for workflow operations
  });

  try {
    // Test connection
    const connectionTest = await client.testConnection();
    if (!connectionTest.connected) {
      throw new Error('Cannot connect to backend. Please ensure the Fluxez backend is running.');
    }
    console.log('✅ Connected to Fluxez backend\n');

    // Set context
    client.setOrganization('org_workflow_demo');
    client.setProject('proj_workflow_demo');

    await demonstrateWorkflowCreation(client);
    await demonstrateConnectors(client);
    await demonstrateWorkflowExecution(client);
    await demonstrateConditionalWorkflows(client);
    await demonstrateScheduledWorkflows(client);
    await demonstrateErrorHandling(client);
    await demonstrateWorkflowMonitoring(client);
    await demonstrateAdvancedWorkflows(client);

    console.log('\n🎉 Workflow Examples Complete!');

  } catch (error) {
    console.error('❌ Workflow examples failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Ensure your backend has workflow service configured');
    console.log('- Check that connector services are accessible');
    console.log('- Verify your API key has workflow permissions');
  }
}

async function demonstrateWorkflowCreation(client) {
  console.log('📋 Workflow Creation\n');
  console.log('==========================================');

  try {
    console.log('1. Create workflow from natural language:');
    
    const naturalLanguagePrompt = `When a new user registers:
    1. Send a welcome email with onboarding instructions
    2. Create a Slack notification in the team channel
    3. Add the user to our CRM system
    4. Send a follow-up email after 3 days if they haven't logged in`;

    const generatedWorkflow = await client.workflow.createFromPrompt(naturalLanguagePrompt, {
      includeErrorHandling: true,
      includeLogging: true,
      generateConnectors: true
    });

    console.log('✅ Workflow generated from prompt:', {
      id: generatedWorkflow.id,
      name: generatedWorkflow.name,
      steps: generatedWorkflow.steps?.length || 0,
      connectors: generatedWorkflow.connectors?.map(c => c.type) || []
    });

    console.log('\n2. Create manual workflow definition:');
    
    const manualWorkflow = {
      name: 'Order Processing Workflow',
      description: 'Automated order processing from payment to fulfillment',
      trigger: {
        type: 'webhook',
        endpoint: '/webhook/order-received',
        authentication: {
          type: 'hmac',
          secret: 'order-webhook-secret'
        }
      },
      steps: [
        {
          id: 'validate-order',
          name: 'Validate Order Data',
          type: 'function',
          function: {
            code: `
              function validateOrder(order) {
                if (!order.customerId || !order.items || order.items.length === 0) {
                  throw new Error('Invalid order data');
                }
                return { valid: true, orderId: order.id };
              }
            `
          }
        },
        {
          id: 'check-inventory',
          name: 'Check Inventory',
          type: 'connector',
          connector: 'inventory-system',
          action: 'check-availability',
          input: {
            items: '{{ trigger.body.items }}'
          }
        },
        {
          id: 'process-payment',
          name: 'Process Payment',
          type: 'connector',
          connector: 'stripe',
          action: 'create-payment-intent',
          input: {
            amount: '{{ trigger.body.total }}',
            currency: 'usd',
            customerId: '{{ trigger.body.customerId }}'
          }
        },
        {
          id: 'create-shipment',
          name: 'Create Shipment',
          type: 'connector',
          connector: 'shipping-provider',
          action: 'create-shipment',
          input: {
            orderId: '{{ steps.validate-order.orderId }}',
            items: '{{ trigger.body.items }}',
            address: '{{ trigger.body.shippingAddress }}'
          }
        },
        {
          id: 'send-confirmation',
          name: 'Send Order Confirmation',
          type: 'connector',
          connector: 'email',
          action: 'send-template',
          input: {
            to: '{{ trigger.body.customerEmail }}',
            template: 'order-confirmation',
            data: {
              orderId: '{{ steps.validate-order.orderId }}',
              items: '{{ trigger.body.items }}',
              total: '{{ trigger.body.total }}'
            }
          }
        }
      ],
      errorHandling: {
        retryPolicy: {
          maxRetries: 3,
          backoffType: 'exponential',
          initialDelay: 1000
        },
        onError: [
          {
            step: 'send-error-notification',
            connector: 'slack',
            action: 'send-message',
            input: {
              channel: '#alerts',
              message: 'Order processing failed for order {{ trigger.body.id }}'
            }
          }
        ]
      }
    };

    const createdWorkflow = await client.workflow.create(manualWorkflow);
    console.log('✅ Manual workflow created:', {
      id: createdWorkflow.id,
      name: createdWorkflow.name,
      status: createdWorkflow.status
    });

    console.log('\n3. Create approval workflow:');
    
    const approvalWorkflow = {
      name: 'Document Approval Process',
      description: 'Multi-stage document approval with notifications',
      trigger: {
        type: 'manual',
        requiredFields: ['documentId', 'submitterId', 'documentType']
      },
      steps: [
        {
          id: 'notify-reviewers',
          name: 'Notify Reviewers',
          type: 'parallel',
          branches: [
            {
              steps: [
                {
                  id: 'email-reviewer-1',
                  type: 'connector',
                  connector: 'email',
                  action: 'send-template',
                  input: {
                    to: 'reviewer1@company.com',
                    template: 'review-request'
                  }
                }
              ]
            },
            {
              steps: [
                {
                  id: 'slack-notification',
                  type: 'connector',
                  connector: 'slack',
                  action: 'send-message',
                  input: {
                    channel: '#reviews',
                    message: 'New document pending review'
                  }
                }
              ]
            }
          ]
        },
        {
          id: 'wait-for-approval',
          name: 'Wait for Approval Decision',
          type: 'human-task',
          assignees: ['reviewer1@company.com', 'reviewer2@company.com'],
          deadline: '7d',
          form: {
            fields: [
              { name: 'decision', type: 'select', options: ['approve', 'reject', 'request-changes'] },
              { name: 'comments', type: 'textarea', required: false }
            ]
          }
        },
        {
          id: 'process-decision',
          name: 'Process Approval Decision',
          type: 'switch',
          condition: '{{ steps.wait-for-approval.decision }}',
          cases: {
            'approve': [
              {
                id: 'mark-approved',
                type: 'connector',
                connector: 'document-system',
                action: 'update-status',
                input: { status: 'approved' }
              }
            ],
            'reject': [
              {
                id: 'mark-rejected',
                type: 'connector',
                connector: 'document-system', 
                action: 'update-status',
                input: { status: 'rejected' }
              }
            ],
            'request-changes': [
              {
                id: 'request-revisions',
                type: 'connector',
                connector: 'document-system',
                action: 'update-status',
                input: { status: 'revision-required' }
              }
            ]
          }
        }
      ]
    };

    const approvalWorkflowResult = await client.workflow.create(approvalWorkflow);
    console.log('✅ Approval workflow created:', approvalWorkflowResult.id);

    return {
      generated: generatedWorkflow,
      manual: createdWorkflow,
      approval: approvalWorkflowResult
    };

  } catch (error) {
    console.error('❌ Workflow creation failed:', error.message);
    return null;
  }
}

async function demonstrateConnectors(client) {
  console.log('\n🔌 Connectors Configuration\n');
  console.log('==========================================');

  try {
    console.log('1. List available connectors:');
    
    const availableConnectors = await client.workflow.listConnectors({
      category: 'all',
      includeMetadata: true
    });

    console.log('✅ Available connectors:', {
      total: availableConnectors.length,
      categories: [...new Set(availableConnectors.map(c => c.category))],
      popular: availableConnectors.filter(c => c.popular).map(c => c.name)
    });

    console.log('\n2. Configure popular connectors:');
    
    const connectorConfigs = [
      {
        name: 'slack',
        type: 'slack',
        config: {
          botToken: process.env.SLACK_BOT_TOKEN || 'xoxb-your-bot-token',
          workspace: 'your-workspace'
        },
        testConnection: true
      },
      {
        name: 'stripe',
        type: 'stripe',
        config: {
          secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_your_key',
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_secret'
        },
        testConnection: false // Skip test for demo
      },
      {
        name: 'sendgrid',
        type: 'sendgrid',
        config: {
          apiKey: process.env.SENDGRID_API_KEY || 'SG.your-api-key',
          fromEmail: 'noreply@yourcompany.com',
          fromName: 'Your Company'
        },
        testConnection: false
      },
      {
        name: 'google-sheets',
        type: 'google-sheets',
        config: {
          clientEmail: process.env.GOOGLE_CLIENT_EMAIL || 'service@project.iam.gserviceaccount.com',
          privateKey: process.env.GOOGLE_PRIVATE_KEY || 'your-private-key',
          projectId: 'your-google-project'
        },
        testConnection: false
      }
    ];

    for (const connectorConfig of connectorConfigs) {
      try {
        const configuredConnector = await client.workflow.configureConnector(connectorConfig);
        console.log(`✅ ${connectorConfig.name} configured:`, {
          id: configuredConnector.id,
          status: configuredConnector.status,
          tested: configuredConnector.connectionTest?.success || false
        });
      } catch (error) {
        console.log(`⚠️  ${connectorConfig.name} configuration skipped:`, error.message);
      }
    }

    console.log('\n3. Test connector operations:');
    
    const connectorTests = [
      {
        connector: 'slack',
        action: 'send-message',
        input: {
          channel: '#general',
          message: 'Test message from Fluxez workflow'
        }
      },
      {
        connector: 'sendgrid',
        action: 'send-email',
        input: {
          to: 'test@example.com',
          subject: 'Test Email from Workflow',
          html: '<p>This is a test email sent via workflow connector.</p>'
        }
      }
    ];

    for (const test of connectorTests) {
      try {
        const result = await client.workflow.testConnector(test.connector, test.action, test.input);
        console.log(`✅ ${test.connector} test:`, result.success ? 'passed' : 'failed');
      } catch (error) {
        console.log(`⚠️  ${test.connector} test skipped:`, error.message);
      }
    }

    console.log('\n4. Custom connector development:');
    
    const customConnector = {
      name: 'custom-crm',
      type: 'http',
      description: 'Custom CRM system integration',
      baseUrl: 'https://api.yourcrm.com',
      authentication: {
        type: 'bearer',
        tokenField: 'apiKey'
      },
      actions: [
        {
          name: 'create-contact',
          method: 'POST',
          endpoint: '/contacts',
          parameters: [
            { name: 'name', type: 'string', required: true },
            { name: 'email', type: 'string', required: true },
            { name: 'company', type: 'string', required: false }
          ],
          responseMapping: {
            id: '$.data.id',
            status: '$.status'
          }
        },
        {
          name: 'get-contact',
          method: 'GET',
          endpoint: '/contacts/{id}',
          parameters: [
            { name: 'id', type: 'string', required: true, location: 'path' }
          ]
        }
      ],
      errorHandling: {
        retryableStatusCodes: [500, 502, 503, 504],
        maxRetries: 3,
        backoffStrategy: 'exponential'
      }
    };

    const createdConnector = await client.workflow.createConnector(customConnector);
    console.log('✅ Custom connector created:', {
      id: createdConnector.id,
      name: createdConnector.name,
      actions: createdConnector.actions?.length || 0
    });

    console.log('\n5. Connector usage analytics:');
    
    const connectorAnalytics = await client.workflow.getConnectorAnalytics({
      timeRange: 'last_30_days',
      metrics: ['usage_count', 'success_rate', 'avg_response_time', 'error_rate']
    });

    console.log('✅ Connector analytics:', connectorAnalytics);

  } catch (error) {
    console.error('❌ Connector demonstration failed:', error.message);
  }
}

async function demonstrateWorkflowExecution(client) {
  console.log('\n▶️  Workflow Execution\n');
  console.log('==========================================');

  try {
    console.log('1. Execute simple workflow:');
    
    const simpleWorkflow = {
      name: 'Welcome Email Workflow',
      steps: [
        {
          id: 'prepare-data',
          name: 'Prepare Welcome Data',
          type: 'function',
          function: {
            code: `
              function prepareData(input) {
                return {
                  userName: input.name || 'New User',
                  welcomeMessage: \`Welcome to our platform, \${input.name || 'New User'}!\`,
                  timestamp: new Date().toISOString()
                };
              }
            `
          }
        },
        {
          id: 'send-email',
          name: 'Send Welcome Email',
          type: 'connector',
          connector: 'email',
          action: 'send',
          input: {
            to: '{{ input.email }}',
            subject: 'Welcome to Our Platform!',
            html: '<h1>{{ steps.prepare-data.welcomeMessage }}</h1><p>Thanks for joining us on {{ steps.prepare-data.timestamp }}</p>'
          }
        },
        {
          id: 'log-welcome',
          name: 'Log Welcome Event',
          type: 'function',
          function: {
            code: `
              function logWelcome(input, steps) {
                console.log('Welcome email sent to:', input.email);
                return { logged: true, userId: input.userId };
              }
            `
          }
        }
      ]
    };

    const createdWorkflow = await client.workflow.create(simpleWorkflow);
    
    const executionResult = await client.workflow.execute(createdWorkflow.id, {
      name: 'John Doe',
      email: 'john@example.com',
      userId: 'user_123'
    });

    console.log('✅ Simple workflow execution:', {
      executionId: executionResult.executionId,
      status: executionResult.status,
      completedSteps: executionResult.completedSteps
    });

    console.log('\n2. Execute workflow with error handling:');
    
    const errorWorkflow = {
      name: 'Error Handling Demo',
      steps: [
        {
          id: 'risky-operation',
          name: 'Risky Operation',
          type: 'function',
          function: {
            code: `
              function riskyOperation(input) {
                if (Math.random() < 0.5) {
                  throw new Error('Random failure occurred');
                }
                return { success: true, data: 'Operation completed' };
              }
            `
          },
          retryPolicy: {
            maxRetries: 3,
            backoffType: 'exponential',
            initialDelay: 1000
          }
        },
        {
          id: 'success-handler',
          name: 'Handle Success',
          type: 'function',
          function: {
            code: `
              function handleSuccess(input, steps) {
                return { message: 'Workflow completed successfully!' };
              }
            `
          }
        }
      ],
      errorHandling: {
        onError: [
          {
            id: 'error-notification',
            type: 'function',
            function: {
              code: `
                function notifyError(error, input) {
                  console.log('Workflow failed:', error.message);
                  return { errorLogged: true };
                }
              `
            }
          }
        ]
      }
    };

    const errorWorkflowCreated = await client.workflow.create(errorWorkflow);
    
    // Try multiple executions to see both success and failure scenarios
    for (let i = 1; i <= 3; i++) {
      try {
        const result = await client.workflow.execute(errorWorkflowCreated.id, { attempt: i });
        console.log(`✅ Attempt ${i}: ${result.status}`);
      } catch (error) {
        console.log(`❌ Attempt ${i}: ${error.message}`);
      }
    }

    console.log('\n3. Asynchronous workflow execution:');
    
    const asyncWorkflow = {
      name: 'Long Running Process',
      steps: [
        {
          id: 'start-process',
          name: 'Start Long Running Process',
          type: 'function',
          function: {
            code: `
              async function startProcess(input) {
                // Simulate long running task
                await new Promise(resolve => setTimeout(resolve, 2000));
                return { processId: 'proc_' + Date.now(), status: 'processing' };
              }
            `
          }
        },
        {
          id: 'monitor-process',
          name: 'Monitor Process',
          type: 'loop',
          condition: '{{ steps.start-process.status !== "completed" }}',
          maxIterations: 10,
          steps: [
            {
              id: 'check-status',
              type: 'function',
              function: {
                code: `
                  async function checkStatus(input, steps, iteration) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    // Simulate completion after 3 iterations
                    const completed = iteration >= 3;
                    return { status: completed ? 'completed' : 'processing', iteration };
                  }
                `
              }
            }
          ]
        }
      ]
    };

    const asyncWorkflowCreated = await client.workflow.create(asyncWorkflow);
    
    const asyncExecution = await client.workflow.executeAsync(asyncWorkflowCreated.id, { 
      task: 'data-processing' 
    });

    console.log('✅ Async workflow started:', {
      executionId: asyncExecution.executionId,
      status: asyncExecution.status
    });

    // Poll for completion
    let completed = false;
    let attempts = 0;
    while (!completed && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const status = await client.workflow.getExecutionStatus(asyncExecution.executionId);
      console.log(`  Status check ${attempts + 1}: ${status.status}`);
      
      completed = status.status === 'completed' || status.status === 'failed';
      attempts++;
    }

    console.log(`✅ Async workflow ${completed ? 'completed' : 'timeout'}`);

  } catch (error) {
    console.error('❌ Workflow execution failed:', error.message);
  }
}

async function demonstrateConditionalWorkflows(client) {
  console.log('\n🔀 Conditional Workflows\n');
  console.log('==========================================');

  try {
    console.log('1. If-then-else workflow:');
    
    const conditionalWorkflow = {
      name: 'Order Processing with Conditions',
      steps: [
        {
          id: 'check-order-value',
          name: 'Check Order Value',
          type: 'function',
          function: {
            code: `
              function checkOrderValue(input) {
                const total = input.orderTotal || 0;
                return {
                  total: total,
                  isHighValue: total > 1000,
                  isPremium: input.customerTier === 'premium'
                };
              }
            `
          }
        },
        {
          id: 'conditional-processing',
          name: 'Conditional Processing',
          type: 'if',
          condition: '{{ steps.check-order-value.isHighValue }}',
          then: [
            {
              id: 'high-value-processing',
              name: 'High Value Order Processing',
              type: 'parallel',
              branches: [
                {
                  steps: [
                    {
                      id: 'notify-manager',
                      type: 'function',
                      function: {
                        code: 'function notifyManager() { return { notified: true }; }'
                      }
                    }
                  ]
                },
                {
                  steps: [
                    {
                      id: 'priority-shipping',
                      type: 'function',
                      function: {
                        code: 'function priorityShipping() { return { expedited: true }; }'
                      }
                    }
                  ]
                }
              ]
            }
          ],
          else: [
            {
              id: 'standard-processing',
              name: 'Standard Order Processing',
              type: 'function',
              function: {
                code: `
                  function standardProcessing() {
                    return { processingType: 'standard' };
                  }
                `
              }
            }
          ]
        },
        {
          id: 'premium-check',
          name: 'Premium Customer Check',
          type: 'switch',
          condition: '{{ input.customerTier }}',
          cases: {
            'premium': [
              {
                id: 'premium-perks',
                type: 'function',
                function: {
                  code: 'function addPremiumPerks() { return { freeShipping: true, prioritySupport: true }; }'
                }
              }
            ],
            'gold': [
              {
                id: 'gold-perks',
                type: 'function',
                function: {
                  code: 'function addGoldPerks() { return { discount: 10, prioritySupport: true }; }'
                }
              }
            ],
            'default': [
              {
                id: 'standard-perks',
                type: 'function',
                function: {
                  code: 'function addStandardPerks() { return { standardSupport: true }; }'
                }
              }
            ]
          }
        }
      ]
    };

    const conditionalCreated = await client.workflow.create(conditionalWorkflow);
    
    // Test different scenarios
    const testCases = [
      { orderTotal: 1500, customerTier: 'premium', scenario: 'High value premium' },
      { orderTotal: 500, customerTier: 'gold', scenario: 'Low value gold' },
      { orderTotal: 2000, customerTier: 'standard', scenario: 'High value standard' }
    ];

    for (const testCase of testCases) {
      const result = await client.workflow.execute(conditionalCreated.id, testCase);
      console.log(`✅ ${testCase.scenario}:`, {
        status: result.status,
        branches: result.executedBranches
      });
    }

    console.log('\n2. Loop-based workflow:');
    
    const loopWorkflow = {
      name: 'Batch Processing Loop',
      steps: [
        {
          id: 'initialize-batch',
          name: 'Initialize Batch',
          type: 'function',
          function: {
            code: `
              function initializeBatch(input) {
                const items = input.items || [];
                return {
                  totalItems: items.length,
                  processedItems: 0,
                  currentBatch: items.slice(0, 5), // Process 5 at a time
                  remainingItems: items.slice(5)
                };
              }
            `
          }
        },
        {
          id: 'process-batches',
          name: 'Process Item Batches',
          type: 'while',
          condition: '{{ steps.initialize-batch.remainingItems.length > 0 || steps.initialize-batch.currentBatch.length > 0 }}',
          maxIterations: 20,
          steps: [
            {
              id: 'process-current-batch',
              name: 'Process Current Batch',
              type: 'function',
              function: {
                code: `
                  function processCurrentBatch(input, steps, iteration) {
                    const batch = steps['initialize-batch']?.currentBatch || [];
                    const processed = batch.length;
                    
                    return {
                      batchNumber: iteration + 1,
                      processedCount: processed,
                      totalProcessed: (steps['initialize-batch']?.processedItems || 0) + processed
                    };
                  }
                `
              }
            },
            {
              id: 'prepare-next-batch',
              name: 'Prepare Next Batch',
              type: 'function',
              function: {
                code: `
                  function prepareNextBatch(input, steps) {
                    const remaining = steps['initialize-batch']?.remainingItems || [];
                    const nextBatch = remaining.slice(0, 5);
                    const newRemaining = remaining.slice(5);
                    
                    // Update the batch state
                    return {
                      currentBatch: nextBatch,
                      remainingItems: newRemaining,
                      hasMore: newRemaining.length > 0 || nextBatch.length > 0
                    };
                  }
                `
              }
            }
          ]
        }
      ]
    };

    const loopWorkflowCreated = await client.workflow.create(loopWorkflow);
    
    const loopResult = await client.workflow.execute(loopWorkflowCreated.id, {
      items: Array.from({ length: 23 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }))
    });

    console.log('✅ Loop workflow execution:', {
      status: loopResult.status,
      iterations: loopResult.iterations,
      finalState: loopResult.finalState
    });

  } catch (error) {
    console.error('❌ Conditional workflows failed:', error.message);
  }
}

async function demonstrateScheduledWorkflows(client) {
  console.log('\n⏰ Scheduled Workflows\n');
  console.log('==========================================');

  try {
    console.log('1. Create scheduled workflow:');
    
    const scheduledWorkflow = {
      name: 'Daily Report Generation',
      description: 'Generate and send daily analytics report',
      schedule: {
        cron: '0 9 * * *', // Daily at 9 AM
        timezone: 'UTC'
      },
      steps: [
        {
          id: 'generate-report',
          name: 'Generate Daily Report',
          type: 'function',
          function: {
            code: `
              function generateReport() {
                const date = new Date().toISOString().split('T')[0];
                return {
                  reportDate: date,
                  metrics: {
                    users: Math.floor(Math.random() * 1000) + 500,
                    orders: Math.floor(Math.random() * 100) + 50,
                    revenue: Math.floor(Math.random() * 10000) + 5000
                  }
                };
              }
            `
          }
        },
        {
          id: 'send-report-email',
          name: 'Send Report Email',
          type: 'connector',
          connector: 'email',
          action: 'send-template',
          input: {
            to: ['manager@company.com', 'analytics@company.com'],
            subject: 'Daily Analytics Report - {{ steps.generate-report.reportDate }}',
            template: 'daily-report',
            data: '{{ steps.generate-report.metrics }}'
          }
        },
        {
          id: 'archive-report',
          name: 'Archive Report',
          type: 'connector',
          connector: 'storage',
          action: 'upload',
          input: {
            fileName: 'daily-report-{{ steps.generate-report.reportDate }}.json',
            content: '{{ steps.generate-report }}',
            path: 'reports/daily/'
          }
        }
      ]
    };

    const scheduledCreated = await client.workflow.create(scheduledWorkflow);
    console.log('✅ Scheduled workflow created:', {
      id: scheduledCreated.id,
      schedule: scheduledCreated.schedule,
      nextRun: scheduledCreated.nextRunTime
    });

    console.log('\n2. Create recurring workflow with multiple triggers:');
    
    const recurringWorkflow = {
      name: 'Multi-trigger Maintenance',
      triggers: [
        {
          type: 'schedule',
          cron: '0 2 * * 0', // Weekly on Sunday at 2 AM
          name: 'weekly-cleanup'
        },
        {
          type: 'schedule', 
          cron: '0 0 1 * *', // Monthly on 1st at midnight
          name: 'monthly-report'
        },
        {
          type: 'webhook',
          endpoint: '/trigger/manual-maintenance',
          name: 'manual-trigger'
        }
      ],
      steps: [
        {
          id: 'determine-task',
          name: 'Determine Task Type',
          type: 'switch',
          condition: '{{ trigger.name }}',
          cases: {
            'weekly-cleanup': [
              {
                id: 'weekly-tasks',
                type: 'function',
                function: {
                  code: 'function weeklyTasks() { return { task: "cleanup", frequency: "weekly" }; }'
                }
              }
            ],
            'monthly-report': [
              {
                id: 'monthly-tasks',
                type: 'function',
                function: {
                  code: 'function monthlyTasks() { return { task: "report", frequency: "monthly" }; }'
                }
              }
            ],
            'manual-trigger': [
              {
                id: 'manual-tasks',
                type: 'function',
                function: {
                  code: 'function manualTasks() { return { task: "manual", frequency: "on-demand" }; }'
                }
              }
            ]
          }
        }
      ]
    };

    const recurringCreated = await client.workflow.create(recurringWorkflow);
    console.log('✅ Multi-trigger workflow created:', recurringCreated.id);

    console.log('\n3. Delayed workflow execution:');
    
    const delayedWorkflow = {
      name: 'Follow-up Email Campaign',
      trigger: {
        type: 'manual',
        requiredFields: ['userEmail', 'registrationDate']
      },
      steps: [
        {
          id: 'immediate-welcome',
          name: 'Send Immediate Welcome',
          type: 'connector',
          connector: 'email',
          action: 'send-template',
          input: {
            to: '{{ input.userEmail }}',
            template: 'welcome',
            data: { registrationDate: '{{ input.registrationDate }}' }
          }
        },
        {
          id: 'wait-3-days',
          name: 'Wait 3 Days',
          type: 'delay',
          duration: '3d'
        },
        {
          id: 'send-tips-email',
          name: 'Send Getting Started Tips',
          type: 'connector',
          connector: 'email',
          action: 'send-template',
          input: {
            to: '{{ input.userEmail }}',
            template: 'getting-started-tips'
          }
        },
        {
          id: 'wait-1-week',
          name: 'Wait 1 Week',
          type: 'delay',
          duration: '7d'
        },
        {
          id: 'send-feature-highlights',
          name: 'Send Feature Highlights',
          type: 'connector',
          connector: 'email',
          action: 'send-template',
          input: {
            to: '{{ input.userEmail }}',
            template: 'feature-highlights'
          }
        }
      ]
    };

    const delayedCreated = await client.workflow.create(delayedWorkflow);
    console.log('✅ Delayed workflow created:', delayedCreated.id);

    console.log('\n4. List scheduled workflows:');
    
    const scheduledWorkflows = await client.workflow.listScheduled({
      status: 'active',
      includeNextRun: true
    });

    console.log('✅ Active scheduled workflows:', {
      count: scheduledWorkflows.length,
      workflows: scheduledWorkflows.map(w => ({
        name: w.name,
        schedule: w.schedule,
        nextRun: w.nextRunTime
      }))
    });

  } catch (error) {
    console.error('❌ Scheduled workflows failed:', error.message);
  }
}

async function demonstrateErrorHandling(client) {
  console.log('\n🚨 Error Handling & Recovery\n');
  console.log('==========================================');

  try {
    console.log('1. Workflow with comprehensive error handling:');
    
    const errorHandlingWorkflow = {
      name: 'Robust Payment Processing',
      steps: [
        {
          id: 'validate-payment',
          name: 'Validate Payment Data',
          type: 'function',
          function: {
            code: `
              function validatePayment(input) {
                if (!input.amount || input.amount <= 0) {
                  throw new Error('Invalid payment amount');
                }
                if (!input.cardToken) {
                  throw new Error('Missing payment method');
                }
                return { valid: true, amount: input.amount };
              }
            `
          },
          onError: {
            retry: {
              maxAttempts: 3,
              backoffType: 'fixed',
              delay: 1000
            },
            fallback: [
              {
                id: 'log-validation-error',
                type: 'function',
                function: {
                  code: 'function logError(error) { return { errorLogged: true, error: error.message }; }'
                }
              }
            ]
          }
        },
        {
          id: 'process-payment',
          name: 'Process Payment',
          type: 'function',
          function: {
            code: `
              function processPayment(input) {
                // Simulate payment processing with potential failures
                const successRate = 0.8; // 80% success rate
                if (Math.random() > successRate) {
                  const errors = [
                    'Card declined',
                    'Insufficient funds',
                    'Payment processor timeout',
                    'Network error'
                  ];
                  throw new Error(errors[Math.floor(Math.random() * errors.length)]);
                }
                return { 
                  success: true, 
                  transactionId: 'txn_' + Date.now(),
                  amount: input.amount 
                };
              }
            `
          },
          onError: {
            retry: {
              maxAttempts: 5,
              backoffType: 'exponential',
              initialDelay: 1000,
              maxDelay: 30000
            },
            categorizedHandling: {
              'Card declined': {
                action: 'notify-customer',
                retryable: false
              },
              'Insufficient funds': {
                action: 'notify-customer',
                retryable: false
              },
              'Payment processor timeout': {
                action: 'retry-later',
                retryable: true
              },
              'Network error': {
                action: 'retry-immediately',
                retryable: true
              }
            },
            fallback: [
              {
                id: 'alternative-payment',
                type: 'function',
                function: {
                  code: `
                    function alternativePayment(input, error) {
                      return {
                        alternativeUsed: true,
                        originalError: error.message,
                        method: 'backup-processor'
                      };
                    }
                  `
                }
              }
            ]
          }
        },
        {
          id: 'send-confirmation',
          name: 'Send Payment Confirmation',
          type: 'connector',
          connector: 'email',
          action: 'send-template',
          input: {
            to: '{{ input.customerEmail }}',
            template: 'payment-confirmation',
            data: {
              transactionId: '{{ steps.process-payment.transactionId }}',
              amount: '{{ steps.process-payment.amount }}'
            }
          },
          onError: {
            retry: {
              maxAttempts: 3,
              backoffType: 'exponential',
              initialDelay: 2000
            },
            continueOnFailure: true, // Don't fail the entire workflow
            fallback: [
              {
                id: 'queue-email-retry',
                type: 'connector',
                connector: 'queue',
                action: 'send-message',
                input: {
                  queue: 'email-retry-queue',
                  message: {
                    type: 'retry-email',
                    template: 'payment-confirmation',
                    recipient: '{{ input.customerEmail }}',
                    data: '{{ steps.process-payment }}'
                  }
                }
              }
            ]
          }
        }
      ],
      globalErrorHandling: {
        deadLetterQueue: 'failed-payments-queue',
        notificationChannel: '#payment-alerts',
        maxFailures: 10,
        circuitBreaker: {
          failureThreshold: 5,
          recoveryTime: '5m'
        }
      }
    };

    const errorWorkflowCreated = await client.workflow.create(errorHandlingWorkflow);
    
    // Test multiple scenarios
    const testScenarios = [
      { amount: 100, cardToken: 'card_123', customerEmail: 'success@test.com' },
      { amount: 0, cardToken: 'card_456', customerEmail: 'invalid@test.com' },
      { amount: 50, cardToken: null, customerEmail: 'missing@test.com' },
      { amount: 200, cardToken: 'card_789', customerEmail: 'retry@test.com' }
    ];

    for (let i = 0; i < testScenarios.length; i++) {
      try {
        const result = await client.workflow.execute(errorWorkflowCreated.id, testScenarios[i]);
        console.log(`✅ Scenario ${i + 1}: ${result.status}`);
      } catch (error) {
        console.log(`❌ Scenario ${i + 1}: ${error.message}`);
      }
    }

    console.log('\n2. Dead letter queue handling:');
    
    const deadLetterQueue = await client.workflow.getDeadLetterQueue('failed-payments-queue');
    console.log('✅ Dead letter queue:', {
      messageCount: deadLetterQueue.messageCount,
      oldestMessage: deadLetterQueue.oldestMessage,
      recentFailures: deadLetterQueue.recentFailures
    });

    console.log('\n3. Circuit breaker status:');
    
    const circuitBreakerStatus = await client.workflow.getCircuitBreakerStatus(errorWorkflowCreated.id);
    console.log('✅ Circuit breaker status:', circuitBreakerStatus);

    console.log('\n4. Error analytics:');
    
    const errorAnalytics = await client.workflow.getErrorAnalytics({
      workflowId: errorWorkflowCreated.id,
      timeRange: 'last_24_hours',
      groupBy: 'error_type'
    });

    console.log('✅ Error analytics:', errorAnalytics);

  } catch (error) {
    console.error('❌ Error handling demonstration failed:', error.message);
  }
}

async function demonstrateWorkflowMonitoring(client) {
  console.log('\n📊 Workflow Monitoring & Analytics\n');
  console.log('==========================================');

  try {
    console.log('1. Workflow execution metrics:');
    
    const executionMetrics = await client.workflow.getExecutionMetrics({
      timeRange: 'last_7_days',
      groupBy: 'day',
      metrics: ['total_executions', 'success_rate', 'avg_duration', 'error_count']
    });

    console.log('✅ Execution metrics:', executionMetrics);

    console.log('\n2. Performance analytics:');
    
    const performanceAnalytics = await client.workflow.getPerformanceAnalytics({
      workflowIds: 'all',
      timeRange: 'last_30_days',
      includeStepBreakdown: true,
      includeBottlenecks: true
    });

    console.log('✅ Performance analytics:', {
      totalWorkflows: performanceAnalytics.totalWorkflows,
      avgExecutionTime: performanceAnalytics.avgExecutionTime,
      bottlenecks: performanceAnalytics.bottlenecks,
      topPerformers: performanceAnalytics.topPerformers
    });

    console.log('\n3. Resource utilization:');
    
    const resourceUtilization = await client.workflow.getResourceUtilization({
      resources: ['cpu', 'memory', 'network', 'storage'],
      timeRange: 'last_24_hours',
      granularity: 'hour'
    });

    console.log('✅ Resource utilization:', resourceUtilization);

    console.log('\n4. Workflow health dashboard:');
    
    const healthDashboard = await client.workflow.getHealthDashboard({
      includeActiveExecutions: true,
      includeRecentErrors: true,
      includeSystemStatus: true,
      refreshInterval: 30
    });

    console.log('✅ Health dashboard:', {
      systemStatus: healthDashboard.systemStatus,
      activeExecutions: healthDashboard.activeExecutions,
      recentErrors: healthDashboard.recentErrors?.length || 0,
      uptime: healthDashboard.uptime
    });

    console.log('\n5. Custom alerts and notifications:');
    
    const alertRules = [
      {
        name: 'High Failure Rate Alert',
        condition: {
          metric: 'failure_rate',
          operator: 'greater_than',
          threshold: 0.1, // 10%
          timeWindow: '15m'
        },
        actions: [
          {
            type: 'email',
            recipients: ['devops@company.com'],
            subject: 'Workflow Failure Rate Alert'
          },
          {
            type: 'slack',
            channel: '#workflow-alerts',
            message: 'Workflow failure rate exceeded 10%'
          }
        ]
      },
      {
        name: 'Long Running Workflow Alert',
        condition: {
          metric: 'execution_duration',
          operator: 'greater_than',
          threshold: 3600, // 1 hour
          workflowSpecific: true
        },
        actions: [
          {
            type: 'webhook',
            url: 'https://monitoring.company.com/alerts',
            payload: {
              alert_type: 'long_running_workflow',
              severity: 'warning'
            }
          }
        ]
      }
    ];

    for (const rule of alertRules) {
      const createdAlert = await client.workflow.createAlert(rule);
      console.log(`✅ Alert rule created: ${rule.name}`, createdAlert.id);
    }

    console.log('\n6. Audit trail and compliance:');
    
    const auditTrail = await client.workflow.getAuditTrail({
      timeRange: 'last_7_days',
      includeUserActions: true,
      includeSystemEvents: true,
      includeDataAccess: true
    });

    console.log('✅ Audit trail:', {
      totalEvents: auditTrail.totalEvents,
      userActions: auditTrail.userActions,
      systemEvents: auditTrail.systemEvents,
      complianceScore: auditTrail.complianceScore
    });

    console.log('\n7. Real-time monitoring setup:');
    
    const realtimeMonitoring = await client.workflow.setupRealtimeMonitoring({
      webhookUrl: 'https://monitoring.company.com/workflow-events',
      events: [
        'workflow_started',
        'workflow_completed',
        'workflow_failed',
        'step_failed',
        'performance_degradation'
      ],
      filters: {
        criticality: ['high', 'critical'],
        workflowTypes: ['payment', 'order-processing', 'user-registration']
      }
    });

    console.log('✅ Real-time monitoring setup:', realtimeMonitoring);

  } catch (error) {
    console.error('❌ Workflow monitoring failed:', error.message);
  }
}

async function demonstrateAdvancedWorkflows(client) {
  console.log('\n🚀 Advanced Workflow Patterns\n');
  console.log('==========================================');

  try {
    console.log('1. Saga pattern implementation:');
    
    const sagaWorkflow = {
      name: 'E-commerce Order Saga',
      description: 'Distributed transaction with compensation',
      type: 'saga',
      steps: [
        {
          id: 'reserve-inventory',
          name: 'Reserve Inventory',
          type: 'connector',
          connector: 'inventory-service',
          action: 'reserve',
          compensation: {
            connector: 'inventory-service',
            action: 'release',
            input: '{{ steps.reserve-inventory.reservationId }}'
          }
        },
        {
          id: 'process-payment',
          name: 'Process Payment', 
          type: 'connector',
          connector: 'payment-service',
          action: 'charge',
          compensation: {
            connector: 'payment-service',
            action: 'refund',
            input: '{{ steps.process-payment.chargeId }}'
          }
        },
        {
          id: 'create-shipment',
          name: 'Create Shipment',
          type: 'connector',
          connector: 'shipping-service',
          action: 'create',
          compensation: {
            connector: 'shipping-service',
            action: 'cancel',
            input: '{{ steps.create-shipment.shipmentId }}'
          }
        },
        {
          id: 'update-order-status',
          name: 'Update Order Status',
          type: 'connector',
          connector: 'order-service',
          action: 'update-status',
          input: { status: 'completed' },
          compensation: {
            connector: 'order-service',
            action: 'update-status',
            input: { status: 'cancelled' }
          }
        }
      ],
      sagaConfig: {
        compensationStrategy: 'backward', // backward or forward
        timeoutDuration: '30m',
        retryPolicy: {
          maxRetries: 3,
          backoffType: 'exponential'
        }
      }
    };

    const sagaCreated = await client.workflow.create(sagaWorkflow);
    console.log('✅ Saga workflow created:', sagaCreated.id);

    console.log('\n2. Event-driven workflow:');
    
    const eventDrivenWorkflow = {
      name: 'User Journey Orchestration',
      type: 'event-driven',
      eventSources: [
        {
          name: 'user-events',
          type: 'kafka',
          topic: 'user-events',
          consumerGroup: 'workflow-consumer'
        },
        {
          name: 'system-events',
          type: 'webhook',
          endpoint: '/events/system'
        }
      ],
      eventHandlers: [
        {
          event: 'user.registered',
          workflow: {
            steps: [
              {
                id: 'welcome-sequence',
                type: 'subworkflow',
                workflowId: 'welcome-email-sequence'
              }
            ]
          }
        },
        {
          event: 'user.upgraded',
          workflow: {
            steps: [
              {
                id: 'upgrade-celebration',
                type: 'connector',
                connector: 'email',
                action: 'send-template',
                input: {
                  template: 'upgrade-celebration',
                  to: '{{ event.data.userEmail }}'
                }
              }
            ]
          }
        },
        {
          event: 'system.maintenance',
          workflow: {
            steps: [
              {
                id: 'notify-all-users',
                type: 'connector',
                connector: 'bulk-email',
                action: 'send-to-all',
                input: {
                  template: 'maintenance-notification',
                  scheduledTime: '{{ event.data.maintenanceTime }}'
                }
              }
            ]
          }
        }
      ]
    };

    const eventWorkflowCreated = await client.workflow.create(eventDrivenWorkflow);
    console.log('✅ Event-driven workflow created:', eventWorkflowCreated.id);

    console.log('\n3. Machine learning workflow:');
    
    const mlWorkflow = {
      name: 'Intelligent Content Moderation',
      steps: [
        {
          id: 'extract-content',
          name: 'Extract Content Features',
          type: 'connector',
          connector: 'ml-feature-extractor',
          action: 'extract',
          input: {
            content: '{{ input.content }}',
            features: ['text', 'images', 'sentiment', 'toxicity']
          }
        },
        {
          id: 'ai-analysis',
          name: 'AI Content Analysis',
          type: 'parallel',
          branches: [
            {
              steps: [
                {
                  id: 'text-analysis',
                  type: 'connector',
                  connector: 'openai',
                  action: 'moderate',
                  input: {
                    text: '{{ steps.extract-content.text }}',
                    categories: ['hate', 'harassment', 'violence', 'spam']
                  }
                }
              ]
            },
            {
              steps: [
                {
                  id: 'image-analysis',
                  type: 'connector',
                  connector: 'vision-ai',
                  action: 'analyze',
                  input: {
                    images: '{{ steps.extract-content.images }}'
                  }
                }
              ]
            }
          ]
        },
        {
          id: 'decision-engine',
          name: 'Moderation Decision',
          type: 'function',
          function: {
            code: `
              function makeDecision(input, steps) {
                const textScore = steps['text-analysis']?.score || 0;
                const imageScore = steps['image-analysis']?.score || 0;
                const combinedScore = (textScore + imageScore) / 2;
                
                if (combinedScore > 0.8) {
                  return { action: 'block', confidence: combinedScore, reason: 'high-risk-content' };
                } else if (combinedScore > 0.5) {
                  return { action: 'review', confidence: combinedScore, reason: 'moderate-risk' };
                } else {
                  return { action: 'approve', confidence: combinedScore, reason: 'low-risk' };
                }
              }
            `
          }
        },
        {
          id: 'execute-decision',
          name: 'Execute Moderation Decision',
          type: 'switch',
          condition: '{{ steps.decision-engine.action }}',
          cases: {
            'block': [
              {
                id: 'block-content',
                type: 'connector',
                connector: 'content-service',
                action: 'block',
                input: {
                  contentId: '{{ input.contentId }}',
                  reason: '{{ steps.decision-engine.reason }}'
                }
              }
            ],
            'review': [
              {
                id: 'queue-for-review',
                type: 'connector',
                connector: 'review-queue',
                action: 'add',
                input: {
                  contentId: '{{ input.contentId }}',
                  priority: 'medium',
                  aiAnalysis: '{{ steps.decision-engine }}'
                }
              }
            ],
            'approve': [
              {
                id: 'approve-content',
                type: 'connector',
                connector: 'content-service',
                action: 'approve',
                input: {
                  contentId: '{{ input.contentId }}'
                }
              }
            ]
          }
        },
        {
          id: 'learning-feedback',
          name: 'Update ML Models',
          type: 'connector',
          connector: 'ml-feedback',
          action: 'record',
          input: {
            features: '{{ steps.extract-content }}',
            prediction: '{{ steps.decision-engine }}',
            actualOutcome: '{{ input.userReported || null }}'
          }
        }
      ]
    };

    const mlWorkflowCreated = await client.workflow.create(mlWorkflow);
    console.log('✅ ML workflow created:', mlWorkflowCreated.id);

    console.log('\n4. Multi-tenant workflow:');
    
    const multiTenantWorkflow = {
      name: 'Multi-Tenant Data Processing',
      tenantIsolation: true,
      steps: [
        {
          id: 'identify-tenant',
          name: 'Identify Tenant Context',
          type: 'function',
          function: {
            code: `
              function identifyTenant(input) {
                const tenantId = input.tenantId || input.headers?.['x-tenant-id'];
                if (!tenantId) {
                  throw new Error('Tenant ID required');
                }
                return {
                  tenantId: tenantId,
                  tenantConfig: getTenantConfig(tenantId) // Would fetch from database
                };
              }
            `
          }
        },
        {
          id: 'tenant-specific-processing',
          name: 'Process with Tenant Rules',
          type: 'function',
          function: {
            code: `
              function processWithTenantRules(input, steps) {
                const config = steps['identify-tenant'].tenantConfig;
                // Apply tenant-specific business rules
                return {
                  processed: true,
                  appliedRules: config.businessRules || [],
                  tenantSpecific: true
                };
              }
            `
          }
        },
        {
          id: 'tenant-database-operation',
          name: 'Execute Tenant Database Operation',
          type: 'connector',
          connector: 'multi-tenant-db',
          action: 'execute',
          input: {
            tenantId: '{{ steps.identify-tenant.tenantId }}',
            operation: 'insert',
            table: 'processing_log',
            data: '{{ steps.tenant-specific-processing }}'
          }
        }
      ],
      tenantConfig: {
        isolationLevel: 'strict',
        dataEncryption: true,
        auditTrail: true
      }
    };

    const multiTenantCreated = await client.workflow.create(multiTenantWorkflow);
    console.log('✅ Multi-tenant workflow created:', multiTenantCreated.id);

    console.log('\n5. Workflow composition and reusability:');
    
    const reusableWorkflows = {
      'email-notification': {
        name: 'Reusable Email Notification',
        parameters: ['recipient', 'template', 'data'],
        steps: [
          {
            id: 'send-email',
            type: 'connector',
            connector: 'email',
            action: 'send-template',
            input: {
              to: '{{ params.recipient }}',
              template: '{{ params.template }}',
              data: '{{ params.data }}'
            }
          }
        ]
      },
      'audit-log': {
        name: 'Reusable Audit Logging',
        parameters: ['action', 'userId', 'resource', 'details'],
        steps: [
          {
            id: 'log-action',
            type: 'connector',
            connector: 'audit-service',
            action: 'log',
            input: {
              timestamp: '{{ now() }}',
              action: '{{ params.action }}',
              userId: '{{ params.userId }}',
              resource: '{{ params.resource }}',
              details: '{{ params.details }}'
            }
          }
        ]
      }
    };

    // Create reusable workflows
    for (const [key, workflow] of Object.entries(reusableWorkflows)) {
      const created = await client.workflow.createReusable(workflow);
      console.log(`✅ Reusable workflow '${key}' created:`, created.id);
    }

    // Compose workflow using reusable components
    const composedWorkflow = {
      name: 'User Account Update with Notifications',
      steps: [
        {
          id: 'update-account',
          type: 'connector',
          connector: 'user-service',
          action: 'update',
          input: {
            userId: '{{ input.userId }}',
            updates: '{{ input.updates }}'
          }
        },
        {
          id: 'send-confirmation',
          type: 'subworkflow',
          workflowId: 'email-notification',
          parameters: {
            recipient: '{{ input.userEmail }}',
            template: 'account-updated',
            data: {
              userId: '{{ input.userId }}',
              changes: '{{ input.updates }}'
            }
          }
        },
        {
          id: 'audit-update',
          type: 'subworkflow',
          workflowId: 'audit-log',
          parameters: {
            action: 'account-update',
            userId: '{{ input.userId }}',
            resource: 'user-account',
            details: '{{ input.updates }}'
          }
        }
      ]
    };

    const composedCreated = await client.workflow.create(composedWorkflow);
    console.log('✅ Composed workflow created:', composedCreated.id);

  } catch (error) {
    console.error('❌ Advanced workflows failed:', error.message);
  }
}

// Promise-based workflow example
function promiseBasedWorkflowExample() {
  console.log('\n🔄 Promise-based Workflow Operations\n');

  const client = new FluxezClient(API_KEY, {
    apiUrl: API_URL,
    debug: false
  });

  const simpleWorkflow = {
    name: 'Promise-based Test Workflow',
    steps: [
      {
        id: 'step1',
        type: 'function',
        function: { code: 'function step1() { return { message: "Hello from promise workflow" }; }' }
      }
    ]
  };

  return client.workflow.create(simpleWorkflow)
    .then(workflow => {
      console.log('✅ Promise workflow created:', workflow.id);
      return client.workflow.execute(workflow.id, { test: true });
    })
    .then(execution => {
      console.log('✅ Promise workflow executed:', execution.status);
      return client.workflow.getExecutionStatus(execution.executionId);
    })
    .then(status => {
      console.log('✅ Promise execution status:', status.status);
    })
    .catch(error => {
      console.error('❌ Promise chain failed:', error.message);
    });
}

// Run the examples
if (require.main === module) {
  console.log('🌟 Running Fluxez SDK Workflow Examples\n');
  
  workflowExamplesMain()
    .then(() => {
      setTimeout(() => {
        console.log('\n' + '='.repeat(50));
        promiseBasedWorkflowExample();
      }, 2000);
    })
    .catch(console.error);
}

// Export for use in other files
module.exports = {
  workflowExamplesMain,
  demonstrateWorkflowCreation,
  demonstrateConnectors,
  demonstrateWorkflowExecution,
  demonstrateConditionalWorkflows,
  demonstrateScheduledWorkflows,
  demonstrateErrorHandling,
  demonstrateWorkflowMonitoring,
  demonstrateAdvancedWorkflows,
  promiseBasedWorkflowExample
};