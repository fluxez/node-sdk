/**
 * Example usage of Email, Storage, and Queue modules
 */
import { FluxezClient } from '../src';

async function example() {
  // Initialize client
  const client = new FluxezClient('cgx_your_api_key');

  try {
    // EMAIL MODULE EXAMPLES
    console.log('=== EMAIL MODULE ===');
    
    // Send a simple email
    const emailResult = await client.email.send(
      'user@example.com',
      'Welcome to Fluxez!',
      '<h1>Welcome!</h1><p>Thanks for signing up.</p>'
    );
    console.log('Email sent:', emailResult);

    // Send templated email
    const templatedResult = await client.email.sendTemplated(
      'welcome-template',
      'user@example.com',
      { name: 'John Doe', company: 'Acme Corp' }
    );
    console.log('Templated email sent:', templatedResult);

    // Send bulk emails
    const bulkResult = await client.email.sendBulk(
      [
        { email: 'user1@example.com', name: 'John', templateData: { role: 'Admin' } },
        { email: 'user2@example.com', name: 'Jane', templateData: { role: 'User' } }
      ],
      'onboarding-template',
      { company: 'Acme Corp' }
    );
    console.log('Bulk emails sent:', bulkResult);

    // Create email template
    const template = await client.email.createTemplate(
      'welcome-template',
      'Welcome to {{company}}!',
      '<h1>Welcome {{name}}!</h1><p>Thanks for joining {{company}}.</p>',
      'Welcome {{name}}! Thanks for joining {{company}}.',
      {
        description: 'Welcome email for new users',
        category: 'onboarding',
        variables: ['name', 'company']
      }
    );
    console.log('Template created:', template);

    // Verify email
    const verification = await client.email.verifyEmail('user@example.com');
    console.log('Email verification:', verification);

    // STORAGE MODULE EXAMPLES
    console.log('\n=== STORAGE MODULE ===');

    // Upload buffer
    const buffer = Buffer.from('Hello, World!', 'utf8');
    const uploadResult = await client.storage.upload(
      buffer,
      'documents/hello.txt',
      {
        fileName: 'hello.txt',
        mimeType: 'text/plain',
        metadata: { author: 'System', version: '1.0' }
      }
    );
    console.log('File uploaded:', uploadResult);

    // Get presigned URL
    const presignedUrl = await client.storage.getPresignedUrl(
      'documents/hello.txt',
      'getObject',
      3600
    );
    console.log('Presigned URL:', presignedUrl);

    // List files
    const files = await client.storage.list({
      prefix: 'documents/',
      limit: 10
    });
    console.log('Files:', files);

    // Search files
    const searchResults = await client.storage.search('hello', {
      prefix: 'documents/',
      includeContent: true
    });
    console.log('Search results:', searchResults);

    // Generate share link
    const shareLink = await client.storage.generateShareLink(
      'documents/hello.txt',
      86400, // 24 hours
      'optional-password',
      {
        allowDownload: true,
        allowPreview: true,
        maxDownloads: 10
      }
    );
    console.log('Share link:', shareLink);

    // Get file metadata
    const metadata = await client.storage.getMetadata('documents/hello.txt');
    console.log('File metadata:', metadata);

    // Create folder
    await client.storage.createFolder('documents/subfolder');
    console.log('Folder created');

    // Copy file
    const copiedFile = await client.storage.copy(
      'documents/hello.txt',
      'documents/backup/hello-copy.txt'
    );
    console.log('File copied:', copiedFile);

    // Get usage stats
    const usageStats = await client.storage.getUsageStats();
    console.log('Storage usage:', usageStats);

    // QUEUE MODULE EXAMPLES
    console.log('\n=== QUEUE MODULE ===');

    // Create queue
    const queueResult = await client.queue.createQueue(
      'my-processing-queue',
      {
        delaySeconds: 0,
        maxReceiveCount: 3,
        messageRetentionPeriod: 1209600, // 14 days
        receiveMessageWaitTimeSeconds: 20, // Long polling
        visibilityTimeoutSeconds: 30
      }
    );
    console.log('Queue created:', queueResult);

    // Send message
    const messageResult = await client.queue.send(
      queueResult.queueUrl,
      {
        action: 'PROCESS_USER',
        userId: '123',
        data: { name: 'John Doe', email: 'john@example.com' }
      },
      {
        delaySeconds: 5,
        messageAttributes: {
          priority: {
            stringValue: 'high',
            dataType: 'String'
          }
        }
      }
    );
    console.log('Message sent:', messageResult);

    // Send batch messages
    const batchResult = await client.queue.sendBatch(
      queueResult.queueUrl,
      [
        {
          id: 'msg1',
          body: { action: 'PROCESS_ORDER', orderId: '1001' },
          delaySeconds: 0
        },
        {
          id: 'msg2',
          body: { action: 'SEND_EMAIL', userId: '123' },
          delaySeconds: 10
        }
      ]
    );
    console.log('Batch messages sent:', batchResult);

    // Receive messages
    const receivedMessages = await client.queue.receive(
      queueResult.queueUrl,
      {
        maxMessages: 5,
        waitTimeSeconds: 20,
        visibilityTimeoutSeconds: 60
      }
    );
    console.log('Received messages:', receivedMessages);

    // Process and delete messages
    for (const message of receivedMessages) {
      console.log('Processing message:', message.body);
      
      // Process the message here...
      
      // Delete message after processing
      await client.queue.delete(queueResult.queueUrl, message.receiptHandle);
      console.log('Message deleted');
    }

    // Get queue attributes
    const queueAttrs = await client.queue.getQueueAttributes(queueResult.queueUrl);
    console.log('Queue attributes:', queueAttrs);

    // Get queue statistics
    const queueStats = await client.queue.getQueueStats(queueResult.queueUrl);
    console.log('Queue stats:', queueStats);

    // List all queues
    const queues = await client.queue.listQueues();
    console.log('All queues:', queues);

    console.log('\n=== ALL MODULES TESTED SUCCESSFULLY ===');

  } catch (error) {
    console.error('Error:', error);
  }
}

// Uncomment to run the example
// example();

export default example;