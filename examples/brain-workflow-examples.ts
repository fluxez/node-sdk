/**
 * Fluxez SDK - Brain/AI and Workflow Examples
 * 
 * This example demonstrates how to use the new Brain/AI and Workflow modules
 * in the Fluxez SDK for automatic app generation and workflow automation.
 */

import { FluxezClient } from '../src';

async function brainExamples() {
  // Initialize the Fluxez client
  const client = new FluxezClient('cgx_your_api_key_here');

  console.log('🧠 Brain/AI Examples:');
  console.log('=====================');

  try {
    // 1. Generate a complete app from natural language
    console.log('\n1. Generating e-commerce app...');
    const ecommerceApp = await client.brain.generate(
      'Create an e-commerce app with Stripe payments, user authentication, and product catalog',
      {
        includeWorkflows: true,
        includeAuth: true,
        includePayments: true,
        framework: 'react',
        styling: 'tailwind',
        complexity: 'standard'
      }
    );
    console.log(`Generated app: ${ecommerceApp.name}`);
    console.log(`Components: ${ecommerceApp.components.length}`);
    console.log(`Features: ${ecommerceApp.features.join(', ')}`);

    // 2. Understand app requirements from prompt
    console.log('\n2. Understanding prompt...');
    const understanding = await client.ai.understand(
      'Build a social media platform like Instagram with photo sharing'
    );
    console.log(`App Type: ${understanding.appType}`);
    console.log(`Confidence: ${understanding.confidence}%`);
    console.log(`Features: ${understanding.features.join(', ')}`);

    // 3. Find similar app patterns
    console.log('\n3. Finding similar patterns...');
    const patterns = await client.brain.findPatterns('social media app', {
      limit: 5,
      threshold: 0.8
    });
    patterns.forEach(pattern => {
      console.log(`- ${pattern.name} (${pattern.similarity}% similar)`);
    });

    // 4. Get architecture recommendations
    console.log('\n4. Getting architecture recommendations...');
    const architecture = await client.ai.suggestArchitecture({
      appType: 'ecommerce',
      features: ['authentication', 'payments', 'inventory'],
      scale: 'medium',
      complexity: 'standard'
    });
    console.log(`Architecture Pattern: ${architecture.pattern}`);
    console.log(`Layers: ${architecture.layers.map(l => l.name).join(', ')}`);

    // 5. Select recommended components
    console.log('\n5. Selecting components...');
    const components = await client.brain.selectComponents('blog', {
      framework: 'react',
      complexity: 'simple'
    });
    console.log(`Recommended components: ${components.length}`);
    components.slice(0, 3).forEach(comp => {
      console.log(`- ${comp.name} (${comp.category})`);
    });

    // 6. Get brain statistics
    console.log('\n6. Getting brain stats...');
    const stats = await client.ai.getStats();
    console.log(`Total generations: ${stats.totalGenerations}`);
    console.log(`Success rate: ${stats.successRate}%`);
    console.log(`Top app types: ${stats.topAppTypes.slice(0, 3).map(t => t.type).join(', ')}`);

  } catch (error) {
    console.error('Brain/AI error:', error);
  }
}

async function workflowExamples() {
  // Initialize the Fluxez client
  const client = new FluxezClient('cgx_your_api_key_here');

  console.log('\n🔄 Workflow Examples:');
  console.log('=====================');

  try {
    // 1. Generate workflow from natural language
    console.log('\n1. Generating workflow from prompt...');
    const welcomeWorkflow = await client.workflow.generateFromPrompt(
      'Send a welcome email when a new user registers, then add them to a mailing list',
      {
        complexity: 'simple',
        includeErrorHandling: true
      }
    );
    console.log(`Generated workflow: ${welcomeWorkflow.name}`);
    console.log(`Steps: ${welcomeWorkflow.steps.length}`);

    // 2. Create workflow from definition
    console.log('\n2. Creating workflow from definition...');
    const workflowResult = await client.workflow.create({
      name: 'Order Processing',
      description: 'Process new e-commerce orders',
      trigger: {
        type: 'webhook',
        config: { endpoint: '/webhook/order' }
      },
      steps: [
        {
          id: 'validate-order',
          name: 'Validate Order',
          type: 'action',
          connector: 'http',
          action: 'validateOrder',
          config: { url: 'https://api.example.com/validate' },
          position: { x: 100, y: 100 },
          connections: ['send-confirmation']
        },
        {
          id: 'send-confirmation',
          name: 'Send Confirmation Email',
          type: 'action',
          connector: 'email',
          action: 'send',
          config: { 
            templateName: 'order-confirmation',
            to: '{{ order.customerEmail }}'
          },
          position: { x: 100, y: 200 },
          connections: []
        }
      ]
    });
    console.log(`Created workflow ID: ${workflowResult.id}`);

    // 3. List available connectors
    console.log('\n3. Listing available connectors...');
    const connectors = await client.workflow.listConnectors({
      category: 'communication',
      limit: 5
    });
    console.log(`Available connectors: ${connectors.length}`);
    connectors.forEach(connector => {
      console.log(`- ${connector.name} (${connector.category})`);
    });

    // 4. Test connector configuration
    console.log('\n4. Testing connector...');
    const testResult = await client.workflow.testConnector('email', {
      provider: 'sendgrid',
      apiKey: 'test-key',
      from: 'test@example.com'
    });
    console.log(`Test result: ${testResult.success ? 'Success' : 'Failed'}`);
    console.log(`Response time: ${testResult.responseTime}ms`);

    // 5. Execute workflow
    console.log('\n5. Executing workflow...');
    const execution = await client.workflow.execute(workflowResult.id, {
      input: {
        order: {
          id: 'order-123',
          customerEmail: 'customer@example.com',
          total: 99.99
        }
      },
      async: true
    });
    console.log(`Execution ID: ${execution.id}`);
    console.log(`Status: ${execution.status}`);

    // 6. Get workflow templates
    console.log('\n6. Getting workflow templates...');
    const templates = await client.workflow.getTemplates({
      category: 'ecommerce',
      limit: 3
    });
    console.log(`Available templates: ${templates.length}`);
    templates.forEach(template => {
      console.log(`- ${template.name} (${template.complexity})`);
    });

    // 7. Analyze app for workflow opportunities
    console.log('\n7. Analyzing app for workflows...');
    const analysis = await client.workflow.analyzeApp({
      type: 'ecommerce',
      features: ['user-auth', 'payments', 'inventory'],
      userCount: 1000
    });
    console.log(`Suggested workflows: ${analysis.suggestedWorkflows.length}`);
    analysis.suggestedWorkflows.slice(0, 2).forEach(workflow => {
      console.log(`- ${workflow.name} (${workflow.priority} priority)`);
    });

    // 8. Get workflow statistics
    console.log('\n8. Getting workflow stats...');
    const workflowStats = await client.workflow.getStats();
    console.log(`Total workflows: ${workflowStats.totalWorkflows}`);
    console.log(`Success rate: ${workflowStats.successRate}%`);
    console.log(`Most used connectors: ${workflowStats.mostUsedConnectors.slice(0, 3).map(c => c.connector).join(', ')}`);

  } catch (error) {
    console.error('Workflow error:', error);
  }
}

async function combinedExample() {
  const client = new FluxezClient('cgx_your_api_key_here');

  console.log('\n🚀 Combined Brain + Workflow Example:');
  console.log('=====================================');

  try {
    // 1. Generate an app with workflows included
    console.log('\n1. Generating SaaS app with automated workflows...');
    const saasApp = await client.brain.generate(
      'Create a SaaS project management tool with team collaboration features',
      {
        includeWorkflows: true,
        includeAuth: true,
        complexity: 'advanced',
        framework: 'react'
      }
    );

    console.log(`Generated SaaS app: ${saasApp.name}`);
    console.log(`Features: ${saasApp.features.join(', ')}`);

    if (saasApp.workflows) {
      console.log(`Suggested workflows: ${saasApp.workflows.length}`);
      
      // 2. Create workflows based on app suggestions
      for (const suggestion of saasApp.workflows.slice(0, 2)) {
        console.log(`\n2. Creating workflow: ${suggestion.name}...`);
        
        const workflow = await client.workflow.generateFromPrompt(
          `${suggestion.description} for a project management app`,
          {
            complexity: 'medium',
            includeNotifications: true
          }
        );

        const createdWorkflow = await client.workflow.create(workflow);
        console.log(`Created workflow: ${createdWorkflow.id}`);
      }
    }

    // 3. Train the brain with this successful generation
    console.log('\n3. Training brain with successful generation...');
    await client.brain.train([
      {
        prompt: 'Create a SaaS project management tool with team collaboration features',
        appType: saasApp.appType,
        features: saasApp.features,
        components: saasApp.components.map(c => c.name),
        architecture: saasApp.architecture.pattern,
        outcome: 'success',
        feedback: 'Successfully generated comprehensive SaaS application'
      }
    ]);
    console.log('Brain training completed');

  } catch (error) {
    console.error('Combined example error:', error);
  }
}

// Main execution function
async function main() {
  console.log('🎯 Fluxez SDK - Brain/AI and Workflow Examples');
  console.log('================================================');
  
  // Run all examples
  await brainExamples();
  await workflowExamples();
  await combinedExample();
  
  console.log('\n✅ All examples completed!');
  console.log('\nNext steps:');
  console.log('1. Get your API key from the Fluxez dashboard');
  console.log('2. Replace "cgx_your_api_key_here" with your actual API key');
  console.log('3. Start building amazing apps with AI assistance!');
}

// Export for use in other files
export {
  brainExamples,
  workflowExamples,
  combinedExample
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}