# Fluxez Chatbot - Quick Start Guide

## Installation

```bash
npm install @fluxez/node-sdk
```

## Server-Side (Node.js)

### 1. Basic Setup

```javascript
const { FluxezClient } = require('@fluxez/node-sdk');

const client = new FluxezClient('service_your_api_key', {
  organizationId: 'your-org-id',
  projectId: 'your-project-id',
  appId: 'your-app-id'
});
```

### 2. Send a Message

```javascript
const response = await client.chatbot.sendMessage('What are your hours?', {
  userId: 'user-123',
  sessionId: 'session-456'
});

console.log('Bot:', response.message.content);
```

### 3. Upload Knowledge Base Documents

```javascript
// From text
await client.chatbot.uploadDocument({
  type: 'text',
  content: 'Business hours: Mon-Fri 9am-5pm EST'
});

// From URL
await client.chatbot.uploadDocument({
  type: 'url',
  url: 'https://example.com/faq'
});

// Process multiple URLs
await client.chatbot.processUrls([
  'https://example.com/page1',
  'https://example.com/page2'
]);
```

### 4. Get Statistics

```javascript
const stats = await client.chatbot.getStats();
console.log('Total conversations:', stats.totalConversations);
console.log('Total messages:', stats.totalMessages);
```

## Browser Widget

### Option 1: Direct Script Tag

```html
<!DOCTYPE html>
<html>
<body>
  <h1>My Website</h1>

  <script type="module">
    import { loadChatbot } from 'https://unpkg.com/@fluxez/node-sdk/dist/browser/index.js';

    loadChatbot('service_your_api_key', {
      position: 'bottom-right',
      theme: {
        primaryColor: '#0891b2',
        secondaryColor: '#06b6d4'
      }
    });
  </script>
</body>
</html>
```

### Option 2: NPM/Bundler

```javascript
import { loadChatbot } from '@fluxez/node-sdk/browser';

const widget = loadChatbot('service_your_api_key', {
  position: 'bottom-right',
  startOpen: false,
  theme: {
    primaryColor: '#0891b2',
    secondaryColor: '#06b6d4'
  }
});

// Control the widget
widget.show();    // Show widget
widget.hide();    // Hide widget
widget.toggle();  // Toggle visibility
widget.destroy(); // Remove widget
```

### Widget Customization

```javascript
loadChatbot('service_your_api_key', {
  // Position
  position: 'bottom-right', // or 'bottom-left'

  // Colors
  theme: {
    primaryColor: '#0891b2',
    secondaryColor: '#06b6d4'
  },

  // Behavior
  startOpen: false,
  zIndex: 999999,

  // Context (optional)
  organizationId: 'org-123',
  projectId: 'proj-456',
  appId: 'app-789'
});
```

## API Keys

Two types of API keys:

1. **service_** prefix
   - Full access to all features
   - Use in server-side applications
   - Example: `service_abc123xyz`

2. **anon_** prefix
   - Limited access (chatbot only)
   - Safe for browser use
   - Example: `anon_abc123xyz`

## Common Use Cases

### 1. Customer Support Bot

```javascript
// Configure bot
await client.chatbot.createConfig({
  name: 'Support Bot',
  welcomeMessage: 'Hi! How can I help you?',
  model: 'gpt-4',
  temperature: 0.7,
  customInstructions: 'You are a helpful customer support assistant. Be friendly and concise.'
});

// Upload FAQ documents
await client.chatbot.processUrls([
  'https://yoursite.com/faq',
  'https://yoursite.com/support'
]);
```

### 2. Documentation Assistant

```javascript
await client.chatbot.createConfig({
  name: 'Docs Assistant',
  welcomeMessage: 'Ask me anything about our documentation!',
  customInstructions: 'Help users find information in our documentation. Provide code examples when relevant.'
});

// Upload docs
await client.chatbot.processUrls([
  'https://docs.yoursite.com/getting-started',
  'https://docs.yoursite.com/api-reference'
]);
```

### 3. Sales Assistant

```javascript
await client.chatbot.createConfig({
  name: 'Sales Assistant',
  welcomeMessage: 'Looking to learn more about our products?',
  customInstructions: 'Help potential customers understand our products and pricing. Be persuasive but honest.'
});
```

## Next Steps

- 📖 Read full documentation: [CHATBOT.md](./CHATBOT.md)
- 🎯 See complete examples: [examples/chatbot-example.js](./examples/chatbot-example.js)
- 🌐 Try the widget: [examples/chatbot-widget.html](./examples/chatbot-widget.html)
- 📚 API Reference: See [CHATBOT.md#api-reference](./CHATBOT.md#api-reference)

## Support

- Issues: https://github.com/fluxez/node-sdk/issues
- Docs: https://fluxez.com/docs
- Email: support@fluxez.com
