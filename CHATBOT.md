# Fluxez Chatbot Module

The Fluxez Chatbot module provides a complete chatbot solution with both server-side SDK and browser widget capabilities.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Server-Side Usage](#server-side-usage)
- [Browser Widget](#browser-widget)
- [API Reference](#api-reference)
- [Examples](#examples)

## Features

### Server-Side SDK
- Configuration management (create, update, delete, list)
- Conversation management
- Message handling with context
- Document/knowledge base management
- URL processing for training data
- Analytics and statistics
- User feedback collection

### Browser Widget
- Beautiful, responsive chat interface
- Customizable colors and positioning
- Real-time messaging
- Mobile-friendly design
- Easy integration with service_ or anon_ API keys
- Context-aware (organizationId, projectId, appId)

## Installation

```bash
npm install @fluxez/node-sdk
```

## Server-Side Usage

### Initialize the Client

```javascript
const { FluxezClient } = require('@fluxez/node-sdk');

const client = new FluxezClient('service_your_api_key', {
  organizationId: 'your-org-id',
  projectId: 'your-project-id',
  appId: 'your-app-id',
});
```

### Configuration Management

```javascript
// Create a chatbot configuration
const config = await client.chatbot.createConfig({
  name: 'Support Bot',
  description: 'Customer support chatbot',
  enabled: true,
  welcomeMessage: 'Hello! How can I help you today?',
  placeholder: 'Type your message...',
  primaryColor: '#0891b2',
  secondaryColor: '#06b6d4',
  position: 'bottom-right',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
  language: 'en',
  enableMultilingual: true,
  customInstructions: 'You are a helpful assistant.',
});

// Get all configurations
const configs = await client.chatbot.getConfigs({ limit: 10 });

// Get a specific configuration
const specificConfig = await client.chatbot.getConfig(configId);

// Update a configuration
const updated = await client.chatbot.updateConfig(configId, {
  welcomeMessage: 'Hi! How can I assist you?',
  temperature: 0.8,
});

// Delete a configuration
await client.chatbot.deleteConfig(configId);
```

### Messaging

```javascript
// Send a message to the chatbot
const response = await client.chatbot.sendMessage('What are your hours?', {
  userId: 'user-123',
  sessionId: 'session-456',
  metadata: { source: 'web' },
});

console.log('Bot response:', response.message.content);
console.log('Conversation ID:', response.conversationId);

// Get messages from a conversation
const messages = await client.chatbot.getMessages(conversationId, {
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
});

// Send message in a specific conversation
const message = await client.chatbot.sendMessageInConversation(
  conversationId,
  'Follow-up question',
  { metadata: { type: 'followup' } }
);

// Get conversation history
const history = await client.chatbot.getHistory(conversationId);
console.log('Conversation:', history.conversation);
console.log('Messages:', history.messages);
```

### Conversation Management

```javascript
// Get all conversations
const conversations = await client.chatbot.getConversations({
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  filters: { status: 'active' },
});

// Create a new conversation
const conversation = await client.chatbot.createConversation({
  sessionId: 'session-789',
  userId: 'user-456',
  metadata: { source: 'mobile' },
});
```

### Document Management

```javascript
// Upload a text document
const textDoc = await client.chatbot.uploadDocument({
  type: 'text',
  content: 'Business hours: Monday-Friday 9am-5pm EST.',
  metadata: { category: 'hours' },
});

// Upload a file (Node.js)
const fs = require('fs');
const fileBuffer = fs.readFileSync('path/to/document.pdf');
const fileDoc = await client.chatbot.uploadDocument({
  type: 'file',
  content: fileBuffer,
  fileName: 'document.pdf',
  metadata: { category: 'documentation' },
});

// Upload from URL
const urlDoc = await client.chatbot.uploadDocument({
  type: 'url',
  url: 'https://example.com/faq',
  metadata: { category: 'faq' },
});

// Process multiple URLs
const results = await client.chatbot.processUrls([
  'https://example.com/faq',
  'https://example.com/terms',
  'https://example.com/privacy',
]);
console.log(`Processed ${results.processed} URLs`);

// Get all documents
const documents = await client.chatbot.getDocuments({ limit: 50 });

// Delete a document
await client.chatbot.deleteDocument(documentId);

// Get training data summary
const trainingData = await client.chatbot.getTrainingData();
console.log(`Document count: ${trainingData.documentCount}`);
```

### Analytics

```javascript
// Get chatbot statistics
const stats = await client.chatbot.getStats({
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  userId: 'user-123', // optional
});

console.log('Statistics:', {
  totalConversations: stats.totalConversations,
  totalMessages: stats.totalMessages,
  activeConversations: stats.activeConversations,
  averageResponseTime: stats.averageResponseTime,
  satisfactionRate: stats.satisfactionRate,
  topQuestions: stats.topQuestions,
});
```

### Feedback

```javascript
// Provide feedback on a message
await client.chatbot.provideFeedback({
  messageId: 'msg-123',
  rating: 'positive', // or 'negative'
  comment: 'Very helpful response!',
});
```

## Browser Widget

### Basic Setup

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to My Site</h1>

  <!-- Load the Fluxez chatbot widget -->
  <script type="module">
    import { loadChatbot } from 'https://unpkg.com/@fluxez/node-sdk/dist/browser/index.js';

    const widget = loadChatbot('service_your_api_key', {
      position: 'bottom-right',
      theme: {
        primaryColor: '#0891b2',
        secondaryColor: '#06b6d4'
      },
      startOpen: false
    });
  </script>
</body>
</html>
```

### Widget Options

```javascript
const widget = loadChatbot('service_your_api_key', {
  // Position: 'bottom-right' or 'bottom-left'
  position: 'bottom-right',

  // Theme customization
  theme: {
    primaryColor: '#0891b2',
    secondaryColor: '#06b6d4'
  },

  // Start with widget open
  startOpen: false,

  // Z-index for positioning
  zIndex: 999999,

  // Context (optional)
  organizationId: 'your-org-id',
  projectId: 'your-project-id',
  appId: 'your-app-id'
});
```

### Widget Control

```javascript
// Show the widget
widget.show();

// Hide the widget
widget.hide();

// Toggle widget visibility
widget.toggle();

// Check if widget is open
if (widget.isOpen()) {
  console.log('Widget is currently open');
}

// Destroy the widget
widget.destroy();
```

### NPM/Bundler Integration

If you're using a bundler like Webpack or Vite:

```javascript
import { loadChatbot } from '@fluxez/node-sdk/browser';

const widget = loadChatbot('service_your_api_key', {
  position: 'bottom-right',
  theme: {
    primaryColor: '#0891b2',
    secondaryColor: '#06b6d4'
  }
});
```

## API Reference

### ChatbotClient Methods

#### Configuration Management
- `getConfigs(options?)` - Get all chatbot configurations
- `getConfig(configId?)` - Get a specific configuration
- `createConfig(config)` - Create a new configuration
- `updateConfig(configId, updates)` - Update a configuration
- `deleteConfig(configId)` - Delete a configuration

#### Conversation Management
- `getConversations(options?)` - Get all conversations
- `createConversation(data)` - Create a new conversation

#### Messaging
- `sendMessage(message, options?)` - Send a message to the chatbot
- `getMessages(conversationId, options?)` - Get messages from a conversation
- `sendMessageInConversation(conversationId, message, metadata?)` - Send message in specific conversation
- `getHistory(conversationId)` - Get full conversation history
- `provideFeedback(feedback)` - Provide feedback on a message

#### Document Management
- `uploadDocument(options)` - Upload a document to the knowledge base
- `getDocuments(options?)` - Get all documents
- `deleteDocument(documentId)` - Delete a document
- `processUrls(urls)` - Process multiple URLs for the knowledge base
- `uploadAvatar(file, fileName?)` - Upload chatbot avatar
- `getTrainingData()` - Get training data summary

#### Analytics
- `getStats(filters?)` - Get chatbot statistics

### Type Definitions

```typescript
interface ChatbotConfig {
  id?: string;
  name: string;
  description?: string;
  enabled: boolean;
  welcomeMessage?: string;
  placeholder?: string;
  primaryColor?: string;
  secondaryColor?: string;
  position?: 'bottom-right' | 'bottom-left';
  model?: string;
  temperature?: number;
  maxTokens?: number;
  language?: string;
  enableMultilingual?: boolean;
  enableFileUpload?: boolean;
  enableVoice?: boolean;
  customInstructions?: string;
}

interface ChatbotConversation {
  id: string;
  sessionId?: string;
  userId?: string;
  status: 'active' | 'closed' | 'archived';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface ChatbotMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
  timestamp: string;
  createdAt: string;
}

interface ChatbotSendMessageOptions {
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

interface ChatbotSendMessageResponse {
  message: ChatbotMessage;
  conversationId: string;
}

interface ChatbotDocument {
  id: string;
  name: string;
  type: 'file' | 'url' | 'text';
  content?: string;
  url?: string;
  size?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: Record<string, any>;
  createdAt: string;
}

interface ChatbotStats {
  totalConversations: number;
  totalMessages: number;
  activeConversations: number;
  averageResponseTime: number;
  satisfactionRate?: number;
  topQuestions?: Array<{
    question: string;
    count: number;
  }>;
}
```

## Examples

See the following example files:

- **Server-Side**: `examples/chatbot-example.js` - Complete Node.js example
- **Browser Widget**: `examples/chatbot-widget.html` - HTML/JavaScript example

## Authentication

The chatbot module uses Fluxez API keys with either `service_` or `anon_` prefix:

- `service_` keys: Full access, use in server-side applications
- `anon_` keys: Limited access, safe for browser use

The SDK automatically handles authentication headers and context (organizationId, projectId, appId) based on your configuration.

## Error Handling

```javascript
try {
  const response = await client.chatbot.sendMessage('Hello');
  console.log(response.message.content);
} catch (error) {
  console.error('Error:', error.message);
  if (error.response?.data) {
    console.error('Details:', error.response.data);
  }
}
```

## Support

For issues, questions, or feature requests:
- GitHub Issues: https://github.com/fluxez/node-sdk/issues
- Documentation: https://fluxez.com/docs
- Email: support@fluxez.com
