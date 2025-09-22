# Fluxez SDK Modules

The Fluxez SDK provides several powerful modules for common application needs.

## Email Module

Send emails, manage templates, and track delivery.

### Basic Usage

```typescript
import { FluxezClient } from '@fluxez/node-sdk';

const client = new FluxezClient('cgx_your_api_key');

// Send simple email
await client.email.send(
  'user@example.com',
  'Welcome!',
  '<h1>Hello World</h1>'
);

// Send templated email
await client.email.sendTemplated(
  'welcome-template',
  'user@example.com',
  { name: 'John', company: 'Acme' }
);

// Send bulk emails
await client.email.sendBulk(
  [
    { email: 'user1@example.com', templateData: { role: 'admin' } },
    { email: 'user2@example.com', templateData: { role: 'user' } }
  ],
  'onboarding-template',
  { company: 'Acme Corp' }
);
```

### Templates

```typescript
// Create template
const template = await client.email.createTemplate(
  'welcome-template',
  'Welcome to {{company}}!',
  '<h1>Welcome {{name}}!</h1>',
  'Welcome {{name}}!',
  {
    description: 'User welcome email',
    variables: ['name', 'company']
  }
);

// List templates
const templates = await client.email.listTemplates();
```

### Email Verification

```typescript
const result = await client.email.verifyEmail('user@example.com');
console.log(result.valid, result.deliverable);
```

### Queue Emails

```typescript
// Send email with delay
const queued = await client.email.queueEmail({
  to: 'user@example.com',
  subject: 'Reminder',
  html: '<p>Don\'t forget!</p>'
}, 3600); // 1 hour delay
```

## Storage Module

Upload, download, and manage files

### Basic Usage

```typescript
// Upload buffer
const buffer = Buffer.from('Hello World');
const result = await client.storage.upload(buffer, 'path/file.txt');

// Upload file
await client.storage.upload('/local/file.pdf', 'documents/file.pdf');

// Download file
const fileData = await client.storage.download('path/file.txt');

// Delete file
await client.storage.delete('path/file.txt');
```

### File Management

```typescript
// List files
const files = await client.storage.list({
  prefix: 'documents/',
  limit: 100
});

// Get file metadata
const metadata = await client.storage.getMetadata('path/file.txt');

// Copy file
await client.storage.copy('source.txt', 'destination.txt');

// Move file
await client.storage.move('old-path.txt', 'new-path.txt');
```

### Presigned URLs

```typescript
// Get download URL
const downloadUrl = await client.storage.getPresignedUrl(
  'path/file.txt',
  'getObject',
  3600 // 1 hour expiry
);

// Get upload URL
const uploadUrl = await client.storage.getPresignedUrl(
  'path/new-file.txt',
  'putObject',
  3600
);
```

### File Search

```typescript
const results = await client.storage.search('keyword', {
  prefix: 'documents/',
  includeContent: true,
  fileTypes: ['pdf', 'txt'],
  dateRange: {
    start: '2024-01-01',
    end: '2024-12-31'
  }
});
```

### Share Links

```typescript
const shareLink = await client.storage.generateShareLink(
  'path/file.txt',
  86400, // 24 hours
  'optional-password',
  {
    allowDownload: true,
    maxDownloads: 10
  }
);
```

### Folders

```typescript
// Create folder
await client.storage.createFolder('documents/subfolder');

// Get usage statistics
const stats = await client.storage.getUsageStats();
```

## Queue Module

Reliable message queuing with SQS compatibility.

### Basic Usage

```typescript
// Create queue
const queue = await client.queue.createQueue('my-queue', {
  delaySeconds: 0,
  messageRetentionPeriod: 1209600, // 14 days
  visibilityTimeoutSeconds: 30
});

// Send message
await client.queue.send(queue.queueUrl, {
  action: 'PROCESS_ORDER',
  orderId: '12345',
  data: { ... }
});

// Receive messages
const messages = await client.queue.receive(queue.queueUrl, {
  maxMessages: 10,
  waitTimeSeconds: 20 // Long polling
});

// Process and delete
for (const message of messages) {
  console.log('Processing:', message.body);
  // ... process message ...
  await client.queue.delete(queue.queueUrl, message.receiptHandle);
}
```

### Batch Operations

```typescript
// Send multiple messages
const results = await client.queue.sendBatch(queueUrl, [
  { id: 'msg1', body: { action: 'ACTION1' } },
  { id: 'msg2', body: { action: 'ACTION2' } }
]);

// Delete multiple messages
await client.queue.deleteBatch(queueUrl, [
  { id: 'msg1', receiptHandle: 'handle1' },
  { id: 'msg2', receiptHandle: 'handle2' }
]);
```

### Queue Management

```typescript
// List all queues
const queues = await client.queue.listQueues();

// Get queue URL by name
const queueUrl = await client.queue.getQueueUrl('my-queue');

// Get queue attributes
const attrs = await client.queue.getQueueAttributes(queueUrl);

// Update queue settings
await client.queue.setQueueAttributes(queueUrl, {
  visibilityTimeoutSeconds: 60,
  receiveMessageWaitTimeSeconds: 20
});

// Purge queue (delete all messages)
await client.queue.purgeQueue(queueUrl);

// Delete queue
await client.queue.deleteQueue(queueUrl);
```

### Message Visibility

```typescript
// Change message visibility timeout
await client.queue.changeMessageVisibility(
  queueUrl,
  receiptHandle,
  300 // 5 minutes
);
```

### Queue Statistics

```typescript
const stats = await client.queue.getQueueStats(queueUrl);
console.log(stats.messageCount);
console.log(stats.messagesInFlight);
console.log(stats.averageMessageSize);
```

## Advanced Features

### Error Handling

All modules throw descriptive errors that can be caught and handled:

```typescript
try {
  await client.email.send('invalid-email', 'Subject', 'Body');
} catch (error) {
  console.error('Email failed:', error.message);
}
```

### Debugging

Enable debug mode to see detailed logs:

```typescript
const client = new FluxezClient('cgx_your_api_key', {
  debug: true
});
```

### Custom Configuration

```typescript
const client = new FluxezClient('cgx_your_api_key', {
  apiUrl: 'https://custom-api.fluxez.com',
  timeout: 60000,
  retries: 5,
  headers: {
    'Custom-Header': 'value'
  }
});
```

## TypeScript Support

All modules are fully typed with TypeScript:

```typescript
import { 
  EmailOptions, 
  UploadOptions, 
  QueueMessage 
} from '@fluxez/node-sdk';

const emailOptions: EmailOptions = {
  to: 'user@example.com',
  cc: ['admin@example.com'],
  attachments: [...]
};
```