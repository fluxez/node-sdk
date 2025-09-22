# Fluxez Node SDK

**Official Node.js SDK for the Fluxez Platform**

A complete replacement for `@fluxez/node-sdk` with enhanced features, MongoDB-style operators, and comprehensive TypeScript support.

> 🔄 **Drop-in Replacement**: This SDK can immediately replace `@fluxez/node-sdk` in your projects with zero breaking changes.

## Features

- 🔍 **Advanced Query Builder** - Fluent interface for building complex SQL queries
- ☁️ **S3 Storage Integration** - Upload, download, and manage files with built-in S3 support
- 🎯 **Full-Text & Vector Search** - Elasticsearch and Qdrant integration
- 📊 **Real-Time Analytics** - ClickHouse-powered analytics
- ⚡ **Intelligent Caching** - Redis-based caching with multiple strategies
- 🔐 **Unified Authentication** - Support for API keys and JWT tokens
- 🧠 **AI-Powered App Generation** - Generate complete applications from natural language
- 🔄 **Workflow Automation** - Create and execute automated workflows with 54+ connectors
- 📧 **Email & Queue Management** - Send emails, manage queues, and handle notifications

## 🔄 Migration from @fluxez/node-sdk

### Backward Compatibility

The SDK provides 100% backward compatibility through the `FluxezClient` alias:

```javascript
// Replace this:
// const { FluxezClient } = require('@fluxez/node-sdk');

// With this:
const { FluxezClient } = require('@fluxez/node-sdk');

// All existing code continues to work unchanged!
const client = new FluxezClient(process.env.API_KEY);
```

### Migration Steps

1. **Install new SDK:**
   ```bash
   npm uninstall @fluxez/node-sdk
   npm install @fluxez/node-sdk
   ```

2. **Update imports:**
   ```javascript
   // Old
   const { FluxezClient } = require('@fluxez/node-sdk');
   
   // New (recommended)
   const { FluxezClient } = require('@fluxez/node-sdk');
   // OR keep using FluxezClient for compatibility
   const { FluxezClient } = require('@fluxez/node-sdk');
   ```

3. **Environment variables (optional):**
   ```bash
   # Old
   FLUXEZ_API_KEY=your_key
   FLUXEZ_BASE_URL=your_url
   
   # New (both supported)
   FLUXEZ_API_KEY=your_key
   FLUXEZ_BASE_URL=your_url
   ```

### CLI Migration Tool

```bash
# Run pending migrations
npx fluxez migrate

# Check migration status
npx fluxez status

# Create new migration
npx fluxez create add_users_table

# Rollback migration
npx fluxez rollback migration_123

# Get help
npx fluxez help
```

## Installation

```bash
npm install @fluxez/node-sdk
# or
yarn add @fluxez/node-sdk
# or
pnpm add @fluxez/node-sdk
```

## Quick Start

```javascript
import { FluxezClient } from '@fluxez/node-sdk';

// Initialize with just your API key (Fluxez-style)
const client = new FluxezClient('cgx_your_api_key');

// Raw SQL query
const users = await client.raw('SELECT * FROM users WHERE active = ?', [true]);

// Natural language query  
const recentOrders = await client.natural('show me orders from last week');

// Execute operations
const result = await client.execute('INSERT INTO users (email, name) VALUES (?, ?)', [
  'john@example.com',
  'John Doe'
]);

// Query Builder Example
const users = await client.query
  .from('users')
  .select('id', 'name', 'email')
  .where('status', 'active')
  .orderBy('created_at', 'DESC')
  .limit(10)
  .get();

// Storage Example
const uploadResult = await client.storage.upload(
  './document.pdf',
  'documents/2024/',
  { public: true }
);

// Search Example
const searchResults = await client.search.query('machine learning', {
  fields: ['title', 'content'],
  highlight: true,
  limit: 20
});

// Analytics Example
const analytics = await client.analytics.query({
  metric: 'page_views',
  dimensions: ['country', 'browser'],
  timeRange: { start: '2024-01-01', end: '2024-12-31' },
  aggregation: 'sum'
});

// Cache Example
await client.cache.set('user:123', userData, { ttl: 3600 });
const cached = await client.cache.get('user:123');
```

## Query Builder

### SELECT Queries

```javascript
// Simple select
const posts = await client.query
  .from('posts')
  .select('*')
  .get();

// With conditions
const activePosts = await client.query
  .from('posts')
  .select('id', 'title', 'content')
  .where('status', 'published')
  .where('views', '>', 100)
  .orderBy('created_at', 'DESC')
  .limit(20)
  .get();

// With joins
const postsWithAuthors = await client.query
  .from('posts')
  .select('posts.*', 'users.name as author_name')
  .leftJoin('users', 'posts.author_id', '=', 'users.id')
  .get();

// Aggregations
const stats = await client.query
  .from('orders')
  .select('status')
  .count('id')
  .sum('total')
  .groupBy('status')
  .get();

// Pagination
const page = await client.query
  .from('products')
  .select('*')
  .paginate(2, 20) // page 2, 20 items per page
  .get();
```

### INSERT Queries

```javascript
// Insert single record
const newUser = await client.query
  .from('users')
  .insert({
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active'
  })
  .returning('*')
  .execute();

// Insert multiple records
const newPosts = await client.query
  .from('posts')
  .insert([
    { title: 'Post 1', content: 'Content 1' },
    { title: 'Post 2', content: 'Content 2' }
  ])
  .returning('id')
  .execute();
```

### UPDATE Queries

```javascript
// Update with conditions
const updated = await client.query
  .from('users')
  .update({ verified: true })
  .where('email_confirmed', true)
  .returning('*')
  .execute();
```

### DELETE Queries

```javascript
// Delete with conditions
const deleted = await client.query
  .from('posts')
  .delete()
  .where('status', 'draft')
  .where('created_at', '<', '2023-01-01')
  .execute();
```

### MongoDB-style Operators

For enhanced compatibility with MongoDB and modern query patterns:

```javascript
// MongoDB-style operators
const users = await client.query
  .from('users')
  .$gt('age', 18)                    // Greater than
  .$gte('score', 100)                // Greater than or equal
  .$lt('attempts', 5)                // Less than
  .$lte('retry_count', 3)            // Less than or equal
  .$in('status', ['active', 'pending']) // In array
  .$notIn('role', ['banned'])        // Not in array
  .$like('name', '%john%')           // Like pattern
  .$ilike('email', '%@GMAIL.COM')    // Case-insensitive like
  .$or([                             // OR conditions
    { column: 'role', value: 'admin' },
    { column: 'role', value: 'moderator' }
  ])
  .execute();

// Complex OR with different operators
const results = await client.query
  .from('orders')
  .where('status', 'completed')
  .$or([
    { column: 'total', operator: '>', value: 1000 },
    { column: 'priority', value: 'high' },
    { column: 'customer_type', operator: 'IN', value: ['premium', 'vip'] }
  ])
  .orWhere$gte('created_at', '2024-01-01')
  .execute();
```

## Storage

### Upload Files

```javascript
// Upload from file path
const result = await client.storage.upload(
  './image.jpg',
  'images/profile/',
  {
    public: true,
    metadata: { userId: '123' }
  }
);

// Upload from buffer
const buffer = Buffer.from('file content');
const result = await client.storage.upload(
  buffer,
  'documents/',
  {
    fileName: 'document.txt',
    mimeType: 'text/plain'
  }
);

// Upload from stream
const stream = fs.createReadStream('./video.mp4');
const result = await client.storage.upload(
  stream,
  'videos/',
  {
    fileName: 'video.mp4',
    mimeType: 'video/mp4'
  }
);
```

### Manage Files

```javascript
// Get signed URL
const url = await client.storage.getSignedUrl('documents/file.pdf', {
  expiresIn: 3600 // 1 hour
});

// List files
const files = await client.storage.list({
  prefix: 'images/',
  limit: 100
});

// Download file
const buffer = await client.storage.download('documents/file.pdf');

// Delete file
await client.storage.delete('temp/old-file.txt');

// Copy file
await client.storage.copy(
  'source/file.txt',
  'destination/file.txt'
);

// Move file
await client.storage.move(
  'temp/file.txt',
  'permanent/file.txt'
);
```

## Search

### Full-Text Search

```javascript
// Simple search
const results = await client.search.query('artificial intelligence', {
  fields: ['title', 'content'],
  limit: 20
});

// Multi-match search
const results = await client.search.multiMatch(
  'machine learning',
  ['title', 'description', 'tags'],
  { fuzziness: 'AUTO' }
);

// Phrase search
const results = await client.search.matchPhrase(
  'content',
  'exact phrase to match'
);

// Boolean search
const results = await client.search.bool({
  must: [
    { query: 'javascript', fields: ['tags'] }
  ],
  should: [
    { query: 'react', fields: ['title'] },
    { query: 'vue', fields: ['title'] }
  ],
  mustNot: [
    { query: 'deprecated', fields: ['status'] }
  ]
});
```

### Vector Search

```javascript
// Similarity search
const similar = await client.search.vectorSearch({
  vector: [0.1, 0.2, 0.3, ...], // 1536-dimensional vector
  collection: 'documents',
  limit: 10,
  threshold: 0.8
});
```

## Analytics

```javascript
// Track event
await client.analytics.track({
  event: 'page_view',
  properties: {
    page: '/products',
    referrer: 'google.com',
    browser: 'Chrome'
  }
});

// Query analytics
const data = await client.analytics.query({
  metric: 'revenue',
  dimensions: ['product_category', 'region'],
  timeRange: {
    start: '2024-01-01',
    end: '2024-12-31'
  },
  aggregation: 'sum',
  orderBy: { revenue: 'DESC' }
});

// Time series data
const timeSeries = await client.analytics.timeSeries({
  metric: 'active_users',
  interval: 'day',
  timeRange: { days: 30 }
});
```

## Cache

```javascript
// Set cache
await client.cache.set('key', { data: 'value' }, {
  ttl: 3600, // 1 hour
  tags: ['user', 'session']
});

// Get cache
const value = await client.cache.get('key');

// Delete cache
await client.cache.delete('key');

// Invalidate by tags
await client.cache.invalidateByTags(['user']);

// Cache stats
const stats = await client.cache.stats();
```

## Authentication

```javascript
// Login
const { token, user } = await client.auth.login({
  email: 'user@example.com',
  password: 'password123'
});

// Register
const { user } = await client.auth.register({
  email: 'new@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe'
});

// Refresh token
const { token } = await client.auth.refresh(refreshToken);

// Update client auth
client.setAuth({ jwt: token });
```

## SDK Playground

The SDK includes an interactive playground for testing all features:

```bash
cd node-sdk/playground
npm install
npm run dev
```

Open http://localhost:3001 to access the playground.

## Configuration

```javascript
// Simple initialization (recommended)
const client = new FluxezClient('cgx_your_api_key');

// With custom configuration
const client = new FluxezClient('cgx_your_api_key', {
  apiUrl: 'https://api.fluxez.com/v1',  // Custom API URL
  timeout: 30000,                       // Request timeout
  retries: 3,                          // Retry attempts
  debug: true,                         // Enable logging
  headers: {                           // Custom headers
    'X-App-Version': '1.0.0'
  }
});

// Set context for multi-tenant apps
client.setOrganization('org_your_org_id');
client.setProject('proj_your_project_id');
client.setApp('app_your_app_id');
```

## Error Handling

```javascript
try {
  const result = await client.query
    .from('users')
    .select('*')
    .get();
} catch (error) {
  if (error.code === 'UNAUTHORIZED') {
    // Handle auth error
  } else if (error.code === 'NOT_FOUND') {
    // Handle not found
  } else {
    // Handle other errors
  }
}
```

## Brain/AI - App Generation

Generate complete applications from natural language using our AI-powered brain system:

```javascript
// Generate a complete e-commerce app
const app = await client.brain.generate(
  'Create an e-commerce app with Stripe payments and user authentication',
  {
    includeWorkflows: true,
    includeAuth: true,
    includePayments: true,
    framework: 'react',
    styling: 'tailwind',
    complexity: 'standard'
  }
);

console.log(`Generated: ${app.name}`);
console.log(`Components: ${app.components.length}`);
console.log(`Features: ${app.features.join(', ')}`);

// Understand app requirements from natural language
const understanding = await client.ai.understand(
  'Build a social media platform like Instagram with photo sharing'
);

console.log(`App Type: ${understanding.appType}`);
console.log(`Confidence: ${understanding.confidence}%`);
console.log(`Required features: ${understanding.features.join(', ')}`);

// Find similar app patterns using vector search
const patterns = await client.brain.findPatterns('social media app', {
  limit: 5,
  threshold: 0.8
});

// Get architecture recommendations
const architecture = await client.ai.suggestArchitecture({
  appType: 'ecommerce',
  features: ['authentication', 'payments', 'inventory'],
  scale: 'medium',
  complexity: 'standard'
});

// Select recommended UI components
const components = await client.brain.selectComponents('blog', {
  framework: 'react',
  complexity: 'simple'
});

// Train the brain with successful generations
await client.brain.train([
  {
    prompt: 'Create a task management app',
    appType: 'productivity',
    features: ['tasks', 'projects', 'teams'],
    components: ['TaskList', 'ProjectView', 'TeamDashboard'],
    architecture: 'mvc',
    outcome: 'success',
    feedback: 'User loved the generated app'
  }
]);

// Get brain performance statistics
const stats = await client.ai.getStats();
console.log(`Success rate: ${stats.successRate}%`);
console.log(`Total generations: ${stats.totalGenerations}`);
```

## Workflow Automation

Create and execute automated workflows with 54+ built-in connectors:

```javascript
// Generate workflow from natural language
const workflow = await client.workflow.generateFromPrompt(
  'Send welcome email when user registers, then add to mailing list',
  {
    complexity: 'simple',
    includeErrorHandling: true,
    includeNotifications: true
  }
);

// Create workflow from definition
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

// Execute workflow
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

// List available connectors (54+ built-in)
const connectors = await client.workflow.listConnectors({
  category: 'communication'
});

// Available connector categories:
// - Communication: Discord, Slack, Twilio, SendGrid, WhatsApp
// - AI/ML: OpenAI, Anthropic, Gemini, Cohere, Groq
// - Social: Twitter, Facebook, LinkedIn, Instagram, YouTube
// - Databases: PostgreSQL, MySQL, MongoDB, Redis, Qdrant
// - Cloud: AWS S3/SES/SQS, Google Cloud, Azure, Cloudflare
// - Payments: Stripe, PayPal, Razorpay, Square
// - Analytics: Segment, Amplitude, Mixpanel, Google Analytics
// - Dev Tools: GitHub, GitLab, Jira, Jenkins, Docker
// - File Storage: Dropbox, Box, Google Drive, OneDrive

// Test connector configuration
const testResult = await client.workflow.testConnector('stripe', {
  secretKey: 'sk_test_...',
  publicKey: 'pk_test_...'
});

// Configure connector for your project
await client.workflow.configureConnector({
  connectorType: 'sendgrid',
  name: 'Main Email Service',
  description: 'Primary email service for notifications',
  config: {
    apiKey: 'SG.xxx',
    fromEmail: 'noreply@example.com',
    fromName: 'My App'
  },
  isActive: true
});

// Analyze app for workflow opportunities
const analysis = await client.workflow.analyzeApp({
  type: 'ecommerce',
  features: ['user-auth', 'payments', 'inventory'],
  userCount: 1000
});

console.log(`Suggested workflows: ${analysis.suggestedWorkflows.length}`);
console.log(`Automation opportunities: ${analysis.automationOpportunities.length}`);

// Get workflow templates
const templates = await client.workflow.getTemplates({
  category: 'ecommerce',
  complexity: 'simple'
});

// Create from template
await client.workflow.createFromTemplate(templates[0].id, {
  name: 'My Order Processing',
  description: 'Custom order processing workflow',
  variables: {
    notificationEmail: 'admin@example.com',
    slackChannel: '#orders'
  }
});

// Get workflow execution history
const executions = await client.workflow.getExecutions(workflowResult.id, {
  limit: 10,
  status: 'completed'
});

// Monitor workflow performance
const workflowStats = await client.workflow.getStats();
console.log(`Success rate: ${workflowStats.successRate}%`);
console.log(`Average execution time: ${workflowStats.averageExecutionTime}ms`);
```

## Email & Queue Management

Send emails and manage message queues:

```javascript
// Send simple email
await client.email.send(
  'user@example.com',
  'Welcome to our app!',
  '<h1>Welcome!</h1><p>Thanks for joining us.</p>'
);

// Send templated email
await client.email.sendTemplated(
  'welcome-template',
  'user@example.com',
  { name: 'John', companyName: 'Acme Corp' }
);

// Send bulk emails
await client.email.sendBulk([
  { email: 'user1@example.com', name: 'User 1', templateData: { plan: 'Pro' }},
  { email: 'user2@example.com', name: 'User 2', templateData: { plan: 'Basic' }}
], 'plan-notification');

// Queue management
await client.queue.send('my-queue-url', {
  action: 'PROCESS_ORDER',
  orderId: 'order-123',
  priority: 'high'
});

// Receive and process messages
const messages = await client.queue.receive('my-queue-url', {
  maxMessages: 10,
  waitTime: 20
});

for (const message of messages) {
  // Process message
  console.log('Processing:', message.body);
  
  // Delete after processing
  await client.queue.delete(message.receiptHandle);
}
```

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

```typescript
import { 
  FluxezClient, 
  QueryBuilder,
  UploadResult,
  SearchResult,
  User,
  // Brain/AI Types
  GeneratedApp,
  AppComponent,
  PromptUnderstanding,
  BrainStats,
  // Workflow Types
  WorkflowDefinition,
  WorkflowExecution,
  ConnectorMetadata,
  WorkflowStats
} from '@fluxez/node-sdk';

// Typed responses
const users: User[] = await client.query
  .from('users')
  .select<User>('*')
  .get();

// Typed search results
const results: SearchResult<Product> = await client.search
  .query<Product>('laptop', {
    fields: ['name', 'description']
  });

// Typed Brain/AI responses
const app: GeneratedApp = await client.brain.generate(
  'Create a blog app with authentication'
);

const understanding: PromptUnderstanding = await client.ai.understand(
  'Build a social media platform'
);

// Typed workflow operations
const workflow: WorkflowDefinition = await client.workflow.generateFromPrompt(
  'Send email notifications for new orders'
);

const execution: WorkflowExecution = await client.workflow.execute(
  'workflow-id',
  { input: { orderId: '123' }}
);

const connectors: ConnectorMetadata[] = await client.workflow.listConnectors();
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- 📧 Email: support@fluxez.com
- 💬 Discord: [Join our community](https://discord.gg/fluxez)
- 📖 Documentation: [https://docs.fluxez.com](https://docs.fluxez.com)
- 🐛 Issues: [GitHub Issues](https://github.com/fluxez/node-sdk/issues)## Updated: Mon Sep 22 15:43:03 JST 2025
