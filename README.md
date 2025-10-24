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
- 🤖 **Comprehensive AI Capabilities** - Text, image, audio, and video generation with job queue, webhooks, and real-time updates
- 🔄 **Workflow Automation** - Create and execute automated workflows with 54+ connectors
- 📧 **Email & Queue Management** - Send emails, manage queues, and handle notifications
- 🎥 **Video Conferencing** - WebRTC-based video rooms with recording and live streaming
- 📄 **Document Processing** - PDF generation, OCR, watermarking, merging, and more
- 📱 **Push Notifications** - Multi-platform push notifications with campaigns and analytics

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

## AI - Text, Image, Audio & Video Generation

Comprehensive AI capabilities for text, image, audio, and video generation:

### Job Queue System & Webhooks

All AI operations (image, video, TTS, STT) support queue-based processing with webhook callbacks for long-running tasks:

#### Enqueue Jobs Directly

```javascript
// Enqueue any AI job type with custom options
const job = await client.ai.enqueueJob('image', {
  prompt: 'A beautiful sunset over the ocean',
  size: '1024x1024',
  quality: 'hd'
}, {
  priority: 'high',
  webhookUrl: 'https://your-server.com/webhook/ai',
  autoRetry: true,
  maxRetries: 3
});

console.log('Job ID:', job.data.jobId);
console.log('Initial status:', job.data.status);
```

#### Track Job Status

```javascript
// Get specific job details with progress tracking
const jobDetails = await client.ai.getJobDetails(jobId);
console.log('Status:', jobDetails.data.status);
console.log('Progress:', jobDetails.data.progress);
console.log('Created:', jobDetails.data.createdAt);

if (jobDetails.data.status === 'completed') {
  console.log('Result:', jobDetails.data.result);
}

// Get queue statistics and health metrics
const queueStatus = await client.ai.getQueueStatus();
console.log('Total jobs:', queueStatus.data.totalJobs);
console.log('Processing:', queueStatus.data.jobsByStatus.processing);
console.log('Queued:', queueStatus.data.jobsByStatus.queued);
console.log('Completed:', queueStatus.data.jobsByStatus.completed);
console.log('Failed:', queueStatus.data.jobsByStatus.failed);
```

#### List and Cancel Jobs

```javascript
// List jobs with flexible filters
const jobs = await client.ai.listJobs({
  type: 'image',           // Filter by job type
  status: 'queued',        // Filter by status
  limit: 20,               // Results per page
  offset: 0                // Pagination offset
});

console.log(`Found ${jobs.data.length} jobs`);

// Cancel a queued or processing job
await client.ai.cancelJob(jobId);
console.log('Job cancelled successfully');
```

#### Webhook Callbacks

Set up a webhook endpoint to receive job completion notifications automatically:

```javascript
// Express.js webhook endpoint example
app.post('/webhook/ai', (req, res) => {
  const { jobId, jobType, status, result, error, metadata } = req.body;

  if (status === 'completed') {
    console.log(`${jobType} job ${jobId} completed successfully`);
    console.log('Storage URL:', result.storageUrl);
    console.log('Cost:', result.cost);

    // Process the result (e.g., update database, notify user)
    updateJobInDatabase(jobId, result);
  } else if (status === 'failed') {
    console.error(`${jobType} job ${jobId} failed:`, error);

    // Handle failure (e.g., log error, retry, notify admin)
    logJobFailure(jobId, error);
  } else if (status === 'processing') {
    console.log(`${jobType} job ${jobId} is ${result.progress}% complete`);
  }

  // Acknowledge receipt
  res.json({ received: true });
});
```

#### Real-time Job Updates

Use the Realtime module to receive WebSocket updates for job progress:

```javascript
const realtime = client.realtime.connect();

// Subscribe to job progress events
realtime.subscribe('job:progress', (data) => {
  console.log(`Job ${data.jobId}: ${data.progress}%`);
  console.log('Current step:', data.currentStep);
});

// Subscribe to job completion events
realtime.subscribe('job:completed', (data) => {
  console.log('Job completed:', data.jobId);
  console.log('Result:', data.result);
  console.log('Processing time:', data.processingTime);
});

// Subscribe to job failure events
realtime.subscribe('job:failed', (data) => {
  console.error('Job failed:', data.jobId);
  console.error('Error:', data.error);
});

// Subscribe to specific job updates
realtime.subscribe(`job:${jobId}`, (data) => {
  console.log('Job update:', data);
});
```

```javascript
// ========== TEXT AI ==========

// Generate text content
const textResult = await client.ai.generateText(
  'Write a blog post about the future of AI',
  { saveToDatabase: true }
);
console.log(textResult.text);

// Chat with AI
const chatResult = await client.ai.chat([
  { role: 'system', content: 'You are a helpful assistant' },
  { role: 'user', content: 'Explain quantum computing in simple terms' }
]);
console.log(chatResult.message);

// Generate code
const codeResult = await client.ai.generateCode(
  'Create a React component for a login form',
  { language: 'typescript', framework: 'react' }
);
console.log(codeResult.code);

// Summarize text
const summary = await client.ai.summarizeText(
  longArticleText,
  { length: 'short' }
);
console.log(`Summary: ${summary.summary}`);
console.log(`Compression ratio: ${summary.compressionRatio}x`);

// Translate text
const translation = await client.ai.translateText(
  'Hello, how are you?',
  'es', // Spanish
  { sourceLanguage: 'en' }
);
console.log(translation.translatedText);

// ========== IMAGE AI ==========

// Generate images (synchronous)
const imageResult = await client.ai.generateImage(
  'A sunset over mountains with dramatic clouds',
  {
    size: '1024x1024',
    quality: 'hd',
    style: 'vivid',
    n: 1
  }
);
console.log(`Generated image: ${imageResult.images[0].url}`);
console.log(`Cost: $${imageResult.cost}`);

// Generate images (async mode with webhook and queue support)
const imageJob = await client.ai.generateImage(
  'A futuristic city with flying cars',
  {
    size: '1024x1024',
    quality: 'hd',
    style: 'vivid',
    n: 3,
    webhookUrl: 'https://your-server.com/webhook/image',  // Webhook callback
    async: true  // Enable async mode
  }
);

console.log('Image Job ID:', imageJob.jobId);
console.log('Queue position:', imageJob.queuePosition);

// Track job progress
const imageStatus = await client.ai.getJobDetails(imageJob.jobId);
if (imageStatus.data.status === 'completed') {
  console.log('Generated images:', imageStatus.data.result.images);
}

// Analyze image
const analysis = await client.ai.analyzeImage(
  'https://example.com/photo.jpg',
  { question: 'What objects are in this image?' }
);
console.log(analysis.description);

// Edit image
const editedImage = await client.ai.editImage(
  imageDataBase64,
  'Add a rainbow in the sky',
  { mask: maskDataBase64 }
);

// Create image variations
const variations = await client.ai.createImageVariation(
  imageDataBase64,
  { n: 3 }
);

// ========== AUDIO AI ==========

// Transcribe audio (synchronous - for small files)
const audioFile = fs.createReadStream('./audio.mp3');
const transcription = await client.ai.transcribeAudio(
  audioFile,
  { language: 'en', responseFormat: 'json' }
);
console.log(`Transcribed: ${transcription.text}`);

// Transcribe audio (async mode - for large files or background processing)
const audioBuffer = fs.readFileSync('./large-audio.mp3');
const sttJob = await client.ai.transcribeAudio(audioBuffer, {
  language: 'en',
  responseFormat: 'json',
  webhookUrl: 'https://your-server.com/webhook/stt',
  async: true  // Enable async mode
});

console.log('STT Job ID:', sttJob.jobId);

// Check transcription status
const sttStatus = await client.ai.getSTTJobStatus(sttJob.jobId);
console.log('Status:', sttStatus.status);
console.log('Progress:', sttStatus.progress);

if (sttStatus.status === 'completed') {
  console.log('Transcription:', sttStatus.text);
  console.log('Language detected:', sttStatus.language);
  console.log('Duration:', sttStatus.duration);
}

// Text to speech (synchronous - for short text)
const audioBuffer = await client.ai.textToSpeech(
  'Hello, this is a test of text to speech',
  { voice: 'alloy', speed: 1.0 }
);
fs.writeFileSync('./output.mp3', Buffer.from(audioBuffer));

// Text to speech (async mode - for long text or background processing)
const ttsJob = await client.ai.textToSpeech('Very long text to convert to speech...', {
  voice: 'alloy',
  speed: 1.0,
  webhookUrl: 'https://your-server.com/webhook/tts',
  async: true  // Enable async mode
});

console.log('TTS Job ID:', ttsJob.jobId);

// Poll for job status
const ttsStatus = await client.ai.getTTSJobStatus(ttsJob.jobId);
console.log('Status:', ttsStatus.status);
console.log('Progress:', ttsStatus.progress);

// Download audio when ready
if (ttsStatus.status === 'completed') {
  const audio = await client.ai.downloadTTSAudio(ttsJob.jobId);
  fs.writeFileSync('./output.mp3', Buffer.from(audio));
}

// Translate audio
const audioTranslation = await client.ai.translateAudio(
  audioFile,
  'es' // Spanish
);
console.log(`Translated: ${audioTranslation.translatedText}`);

// Get available voices
const voices = await client.ai.getAvailableVoices();
console.log(`Available voices: ${voices.map(v => v.name).join(', ')}`);

// ========== VIDEO AI ==========

// Generate video (async by default - video generation takes time)
const videoResult = await client.ai.generateVideo(
  'A timelapse of a city at sunset',
  {
    duration: 4,
    aspectRatio: '16:9',
    frameRate: 24,
    webhookUrl: 'https://your-server.com/webhook/video'  // Get notified when complete
  }
);
console.log(`Video generation task: ${videoResult.taskId}`);
console.log(`Status: ${videoResult.status}`);
console.log(`Estimated time: ${videoResult.estimatedTime} seconds`);

// Check video generation status
const videoStatus = await client.ai.getVideoJobStatus(videoResult.taskId);
console.log('Current status:', videoStatus.status);
console.log('Progress:', videoStatus.progress);

if (videoStatus.status === 'completed') {
  console.log(`Video ready: ${videoStatus.videoUrl}`);
  console.log(`Duration: ${videoStatus.duration} seconds`);
  console.log(`Size: ${videoStatus.fileSize} bytes`);
}

// Or use the generic job tracking methods
const videoJobDetails = await client.ai.getJobDetails(videoResult.taskId);
if (videoJobDetails.data.status === 'completed') {
  console.log('Video URL:', videoJobDetails.data.result.videoUrl);
  console.log('Thumbnail:', videoJobDetails.data.result.thumbnailUrl);
}
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

## Video Conferencing

Create and manage video rooms for real-time communication:

```javascript
// Create video room
const room = await client.videoConferencing.createRoom({
  name: 'Team Standup',
  description: 'Daily standup meeting',
  maxParticipants: 10,
  recordingEnabled: true,
  videoQuality: 'hd',
  roomType: 'group'
});

// Generate participant token
const token = await client.videoConferencing.generateToken(
  room.id,
  'user_john_doe',
  {
    permissions: {
      canPublish: true,
      canSubscribe: true
    },
    expiresIn: 3600 // 1 hour
  }
);

// List participants
const participants = await client.videoConferencing.listParticipants(room.id);

// Start recording
const recording = await client.videoConferencing.startRecording(room.id, {
  layout: 'speaker',
  outputFormat: 'mp4',
  width: 1920,
  height: 1080
});

// Stop recording
await client.videoConferencing.stopRecording(recording.id);

// Get session stats
const stats = await client.videoConferencing.getSessionStats(session.id);
console.log(`Peak participants: ${stats.peakParticipants}`);
console.log(`Average quality: ${stats.averageConnectionQuality}`);

// Live streaming (egress)
const egress = await client.videoConferencing.startEgress({
  roomId: room.id,
  type: 'rtmp',
  rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
  rtmpKey: 'your-stream-key'
});

// End room session
await client.videoConferencing.endRoom(room.id);
```

## Document Processing

Generate PDFs, perform OCR, and process documents:

```javascript
// Generate PDF from HTML
const pdf = await client.documents.generatePDF({
  html: '<h1>Invoice</h1><p>Total: $100</p>',
  options: {
    format: 'A4',
    orientation: 'portrait',
    margin: { top: '20mm', bottom: '20mm' }
  },
  metadata: {
    title: 'Invoice #1234',
    author: 'Acme Corp'
  }
});

// Generate from template
const invoice = await client.documents.generatePDF({
  template: 'invoice-template',
  templateData: {
    invoiceNumber: '1234',
    customer: 'John Doe',
    total: 100
  }
});

// Extract text from PDF
const text = await client.documents.extractText(pdfUrl);
console.log(`Extracted ${text.wordCount} words from ${text.pageCount} pages`);

// Merge PDFs
const merged = await client.documents.mergePDFs([
  'https://example.com/doc1.pdf',
  'https://example.com/doc2.pdf'
]);

// Add watermark
const watermarked = await client.documents.addWatermark(
  pdfUrl,
  'CONFIDENTIAL',
  {
    position: 'center',
    opacity: 0.3,
    rotation: 45
  }
);

// Split PDF
const split = await client.documents.splitPDF(pdfUrl, [
  { start: 1, end: 5 },
  { start: 6, end: 10 }
]);

// Compress PDF
const compressed = await client.documents.compressPDF(pdfUrl, 70);

// Protect with password
const protected = await client.documents.protectPDF(
  pdfUrl,
  'password123',
  { allowPrinting: false, allowCopying: false }
);

// OCR on image
const ocrResult = await client.documents.performOCR(
  'https://example.com/scan.jpg',
  'google-vision'
);
console.log(`Extracted: ${ocrResult.text}`);
console.log(`Confidence: ${ocrResult.confidence}%`);

// OCR on PDF
const pdfOcr = await client.documents.ocrPDF(
  'https://example.com/scanned.pdf',
  'aws-textract'
);

// Create template
const template = await client.documents.createTemplate({
  name: 'Invoice Template',
  type: 'pdf',
  content: '<html>...</html>',
  variables: [
    { name: 'invoiceNumber', type: 'string', required: true },
    { name: 'total', type: 'number', required: true }
  ]
});

// Convert document
const converted = await client.documents.convertDocument({
  sourceUrl: 'https://example.com/doc.docx',
  sourceFormat: 'docx',
  targetFormat: 'pdf'
});
```

## Payment Management

Manage Stripe payments and subscriptions with multi-tenant support:

```javascript
// ========== PAYMENT CONFIGURATION ==========

// Create payment configuration for organization/project
const paymentConfig = await client.payment.createConfig('org_123', 'proj_456', {
  stripePublishableKey: 'pk_test_...',
  stripeSecretKey: 'sk_test_...',
  stripeWebhookSecret: 'whsec_...',
  currency: 'usd'
});

// Get payment configuration
const config = await client.payment.getConfig('org_123', 'proj_456');
console.log('Stripe publishable key:', config.stripePublishableKey);

// Update payment configuration
await client.payment.updateConfig('org_123', 'proj_456', {
  currency: 'eur',
  isActive: true
});

// ========== PRICE MANAGEMENT ==========

// Add price ID for subscription plans
const priceConfig = await client.payment.addPriceId('org_123', 'proj_456', 'price_xxx', {
  name: 'Pro Monthly Plan',
  description: 'Monthly subscription to Pro features',
  interval: 'month',
  amount: 2999, // $29.99
  currency: 'usd',
  metadata: { tier: 'pro', features: 'all' }
});

// Get all price IDs
const prices = await client.payment.getPriceIds('org_123', 'proj_456');
prices.forEach(price => {
  console.log(`${price.name}: ${price.amount} ${price.currency} per ${price.interval}`);
});

// Remove price ID
await client.payment.removePriceId('org_123', 'proj_456', 'price_config_789');

// ========== SUBSCRIPTION MANAGEMENT ==========

// Create subscription
const subscription = await client.payment.createSubscription('org_123', 'proj_456', {
  customerId: 'cus_xxx',
  priceId: 'price_xxx',
  trialPeriodDays: 14,
  metadata: { userId: 'user_123' }
});
console.log('Subscription status:', subscription.status);

// Get subscription details
const sub = await client.payment.getSubscription('org_123', 'proj_456', 'sub_xxx');
console.log('Current period:', sub.currentPeriodStart, 'to', sub.currentPeriodEnd);

// Update subscription (upgrade/downgrade)
const updated = await client.payment.updateSubscription('org_123', 'proj_456', 'sub_xxx', {
  priceId: 'price_yyy', // New plan
  prorationBehavior: 'create_prorations'
});

// Cancel subscription (at period end - recommended)
await client.payment.cancelSubscription('org_123', 'proj_456', 'sub_xxx', true);

// Cancel immediately
await client.payment.cancelSubscription('org_123', 'proj_456', 'sub_xxx', false);

// Resume canceled subscription
await client.payment.resumeSubscription('org_123', 'proj_456', 'sub_xxx');

// List all subscriptions
const subscriptions = await client.payment.listSubscriptions('org_123', 'proj_456', {
  limit: 10
});

// ========== CHECKOUT SESSIONS ==========

// Create checkout session for new subscription
const session = await client.payment.createCheckoutSession('org_123', 'proj_456', {
  priceId: 'price_xxx',
  successUrl: 'https://yourapp.com/success',
  cancelUrl: 'https://yourapp.com/cancel',
  mode: 'subscription',
  customerEmail: 'user@example.com',
  allowPromotionCodes: true,
  trialPeriodDays: 14,
  metadata: { userId: 'user_123' }
});

// Redirect user to Stripe Checkout
console.log('Checkout URL:', session.url);
window.location.href = session.url; // In browser

// Get checkout session details
const sessionDetails = await client.payment.getCheckoutSession('org_123', 'proj_456', 'cs_xxx');
console.log('Payment status:', sessionDetails.paymentStatus);

// ========== CUSTOMER MANAGEMENT ==========

// Create customer
const customer = await client.payment.createCustomer('org_123', 'proj_456', {
  email: 'user@example.com',
  name: 'John Doe',
  phone: '+1234567890',
  metadata: { userId: 'user_123', plan: 'pro' }
});
console.log('Customer ID:', customer.customerId);

// Get customer details
const customerInfo = await client.payment.getCustomer('org_123', 'proj_456', 'cus_xxx');
console.log('Customer:', customerInfo.name, customerInfo.email);

// List customer payment methods
const paymentMethods = await client.payment.listPaymentMethods('org_123', 'proj_456', 'cus_xxx');
paymentMethods.forEach(pm => {
  if (pm.card) {
    console.log(`${pm.card.brand} ending in ${pm.card.last4}`);
  }
});

// ========== PAYMENT INTENTS ==========

// Create payment intent for one-time payment
const intent = await client.payment.createPaymentIntent('org_123', 'proj_456', {
  amount: 2999, // $29.99
  currency: 'usd',
  customerId: 'cus_xxx',
  description: 'One-time purchase',
  metadata: { orderId: 'order_123' }
});

// Use client secret on frontend
console.log('Client secret:', intent.clientSecret);
// Pass to Stripe.js: stripe.confirmCardPayment(intent.clientSecret)

// Get payment intent status
const intentStatus = await client.payment.getPaymentIntent('org_123', 'proj_456', 'pi_xxx');
console.log('Payment status:', intentStatus.status);

// ========== INVOICES ==========

// Get invoices for a customer
const invoices = await client.payment.getInvoices('org_123', 'proj_456', {
  customerId: 'cus_xxx',
  limit: 10
});

invoices.data.forEach(invoice => {
  console.log(`Invoice ${invoice.invoiceId}: ${invoice.amount} ${invoice.currency} - ${invoice.status}`);
  console.log(`PDF: ${invoice.invoicePdf}`);
});

// Get specific invoice
const invoice = await client.payment.getInvoice('org_123', 'proj_456', 'in_xxx');
console.log('Invoice PDF:', invoice.invoicePdf);
console.log('Hosted URL:', invoice.hostedInvoiceUrl);

// ========== WEBHOOK HANDLING ==========

// Verify webhook signature (in your webhook endpoint)
const result = await client.payment.verifyWebhook(
  'org_123',
  'proj_456',
  req.body, // Raw request body
  req.headers['stripe-signature'] // Stripe signature header
);

if (result.verified) {
  console.log('Verified event:', result.event.type);

  // Handle different event types
  switch (result.event.type) {
    case 'customer.subscription.created':
      console.log('New subscription created');
      break;
    case 'customer.subscription.updated':
      console.log('Subscription updated');
      break;
    case 'customer.subscription.deleted':
      console.log('Subscription canceled');
      break;
    case 'invoice.payment_succeeded':
      console.log('Payment succeeded');
      break;
    case 'invoice.payment_failed':
      console.log('Payment failed');
      break;
  }

  // Process the event
  await client.payment.handleWebhook('org_123', 'proj_456', result.event);
} else {
  console.error('Webhook verification failed:', result.error);
}

// ========== COMPLETE PAYMENT FLOW EXAMPLE ==========

async function completePaymentFlow() {
  const orgId = 'org_123';
  const projectId = 'proj_456';

  // 1. Configure payment for your project
  await client.payment.createConfig(orgId, projectId, {
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    currency: 'usd'
  });

  // 2. Add subscription plans
  const proPlan = await client.payment.addPriceId(orgId, projectId, 'price_pro_monthly', {
    name: 'Pro Monthly',
    interval: 'month',
    amount: 2999
  });

  const enterprisePlan = await client.payment.addPriceId(orgId, projectId, 'price_enterprise_monthly', {
    name: 'Enterprise Monthly',
    interval: 'month',
    amount: 9999
  });

  // 3. Create customer when user signs up
  const customer = await client.payment.createCustomer(orgId, projectId, {
    email: 'newuser@example.com',
    name: 'New User',
    metadata: { userId: 'user_new_123' }
  });

  // 4. Create checkout session for subscription
  const checkoutSession = await client.payment.createCheckoutSession(orgId, projectId, {
    priceId: proPlan.priceId,
    customerId: customer.customerId,
    successUrl: 'https://yourapp.com/success?session_id={CHECKOUT_SESSION_ID}',
    cancelUrl: 'https://yourapp.com/pricing',
    mode: 'subscription',
    allowPromotionCodes: true,
    trialPeriodDays: 14
  });

  // 5. Redirect user to checkout
  return checkoutSession.url;
}

// ========== WEBHOOK ENDPOINT EXAMPLE ==========

// Express.js webhook endpoint
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    // Verify and handle webhook
    const verification = await client.payment.verifyWebhook(
      'org_123',
      'proj_456',
      req.body,
      sig
    );

    if (verification.verified) {
      const event = verification.event;

      // Process webhook event
      await client.payment.handleWebhook('org_123', 'proj_456', event);

      // Custom handling based on event type
      switch (event.type) {
        case 'customer.subscription.created':
          await updateUserSubscription(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await sendPaymentReceipt(event.data.object);
          break;
        case 'invoice.payment_failed':
          await notifyPaymentFailure(event.data.object);
          break;
      }

      res.json({ received: true });
    } else {
      res.status(400).send(`Webhook Error: ${verification.error}`);
    }
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
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
  // AI Job Queue Types
  AIJob,
  AIJobDetails,
  AIJobStatus,
  QueueStatus,
  JobEnqueueOptions,
  // Workflow Types
  WorkflowDefinition,
  WorkflowExecution,
  ConnectorMetadata,
  WorkflowStats,
  // Video Types
  VideoRoom,
  RoomToken,
  Participant,
  Recording,
  SessionStats,
  // Document Types
  DocumentResult,
  OCRResult,
  DocumentTemplate,
  TextExtractionResult
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

// Typed AI responses
const textResult = await client.ai.generateText(
  'Write a product description'
);

const imageResult = await client.ai.generateImage(
  'A modern office workspace'
);

// Typed AI job queue operations
const job: AIJob = await client.ai.enqueueJob('image', {
  prompt: 'A sunset over the ocean',
  size: '1024x1024'
}, {
  priority: 'high',
  webhookUrl: 'https://example.com/webhook',
  autoRetry: true
});

const jobDetails: AIJobDetails = await client.ai.getJobDetails(job.data.jobId);
console.log('Job status:', jobDetails.data.status);
console.log('Progress:', jobDetails.data.progress);

const queueStatus: QueueStatus = await client.ai.getQueueStatus();
console.log('Total jobs:', queueStatus.data.totalJobs);

const jobs: AIJob[] = await client.ai.listJobs({
  type: 'image',
  status: 'queued',
  limit: 20
});

// Typed workflow operations
const workflow: WorkflowDefinition = await client.workflow.generateFromPrompt(
  'Send email notifications for new orders'
);

const execution: WorkflowExecution = await client.workflow.execute(
  'workflow-id',
  { input: { orderId: '123' }}
);

// Typed video conferencing operations
const room: VideoRoom = await client.videoConferencing.createRoom({
  name: 'Team Meeting',
  maxParticipants: 10
});

const token: RoomToken = await client.videoConferencing.generateToken(
  room.id,
  'user_123'
);

const stats: SessionStats = await client.videoConferencing.getSessionStats(
  'session_id'
);

// Typed document operations
const pdf: DocumentResult = await client.documents.generatePDF({
  html: '<h1>Document</h1>',
  options: { format: 'A4' }
});

const ocr: OCRResult = await client.documents.performOCR(
  'https://example.com/image.jpg',
  'google-vision'
);

const template: DocumentTemplate = await client.documents.createTemplate({
  name: 'Invoice',
  type: 'pdf',
  content: '<html>...</html>'
});

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
