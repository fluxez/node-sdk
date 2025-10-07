/**
 * Fluxez SDK - Chatbot Example
 *
 * This example demonstrates how to use the Chatbot module
 * for managing configurations, conversations, and messages.
 */

const { FluxezClient } = require('../dist/index');

async function main() {
  // Initialize the client
  const client = new FluxezClient('service_your_api_key_here', {
    organizationId: 'your-org-id',
    projectId: 'your-project-id',
    appId: 'your-app-id',
  });

  try {
    console.log('=== Fluxez Chatbot Example ===\n');

    // 1. Create a chatbot configuration
    console.log('1. Creating chatbot configuration...');
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
      enableFileUpload: false,
      enableVoice: false,
      customInstructions: 'You are a helpful customer support assistant.',
    });
    console.log('✓ Configuration created:', config.id);
    console.log();

    // 2. Get all configurations
    console.log('2. Fetching all configurations...');
    const configs = await client.chatbot.getConfigs({ limit: 10 });
    console.log(`✓ Found ${configs.length} configurations`);
    console.log();

    // 3. Get a specific configuration
    console.log('3. Fetching default configuration...');
    const defaultConfig = await client.chatbot.getConfig();
    console.log('✓ Configuration:', defaultConfig.name);
    console.log();

    // 4. Send a message to the chatbot
    console.log('4. Sending a message...');
    const response = await client.chatbot.sendMessage('What are your business hours?', {
      userId: 'user-123',
      sessionId: 'session-456',
    });
    console.log('✓ Bot response:', response.message.content);
    console.log('✓ Conversation ID:', response.conversationId);
    console.log();

    // 5. Get conversations
    console.log('5. Fetching conversations...');
    const conversations = await client.chatbot.getConversations({
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    console.log(`✓ Found ${conversations.length} conversations`);
    console.log();

    // 6. Get messages from a conversation
    if (conversations.length > 0) {
      const conversationId = conversations[0].id;
      console.log('6. Fetching messages from conversation...');
      const messages = await client.chatbot.getMessages(conversationId, {
        limit: 20,
      });
      console.log(`✓ Found ${messages.length} messages`);
      console.log();
    }

    // 7. Upload a document to the knowledge base
    console.log('7. Uploading document to knowledge base...');
    const document = await client.chatbot.uploadDocument({
      type: 'text',
      content: 'Business hours: Monday-Friday 9am-5pm EST. Closed on weekends and holidays.',
      metadata: { category: 'hours' },
    });
    console.log('✓ Document uploaded:', document.id);
    console.log();

    // 8. Process URLs for the knowledge base
    console.log('8. Processing URLs...');
    const urlResults = await client.chatbot.processUrls([
      'https://example.com/faq',
      'https://example.com/terms',
    ]);
    console.log(`✓ Processed ${urlResults.processed} URLs`);
    console.log();

    // 9. Get chatbot statistics
    console.log('9. Fetching chatbot statistics...');
    const stats = await client.chatbot.getStats({
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    });
    console.log('✓ Statistics:');
    console.log(`  - Total conversations: ${stats.totalConversations}`);
    console.log(`  - Total messages: ${stats.totalMessages}`);
    console.log(`  - Active conversations: ${stats.activeConversations}`);
    console.log(`  - Avg response time: ${stats.averageResponseTime}ms`);
    console.log();

    // 10. Provide feedback on a message
    console.log('10. Providing feedback...');
    await client.chatbot.provideFeedback({
      messageId: response.message.id,
      rating: 'positive',
      comment: 'Very helpful!',
    });
    console.log('✓ Feedback submitted');
    console.log();

    // 11. Update the configuration
    console.log('11. Updating configuration...');
    const updatedConfig = await client.chatbot.updateConfig(config.id, {
      welcomeMessage: 'Hi there! How can I assist you today?',
      temperature: 0.8,
    });
    console.log('✓ Configuration updated');
    console.log();

    // 12. Get all documents
    console.log('12. Fetching documents...');
    const documents = await client.chatbot.getDocuments({ limit: 10 });
    console.log(`✓ Found ${documents.length} documents`);
    console.log();

    // 13. Delete a document
    if (documents.length > 0) {
      console.log('13. Deleting document...');
      await client.chatbot.deleteDocument(document.id);
      console.log('✓ Document deleted');
      console.log();
    }

    // 14. Delete the configuration (cleanup)
    console.log('14. Deleting configuration...');
    await client.chatbot.deleteConfig(config.id);
    console.log('✓ Configuration deleted');
    console.log();

    console.log('=== Example completed successfully! ===');
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
  }
}

// Run the example
main();
