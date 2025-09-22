/**
 * Fluxez SDK - Queue Examples
 * 
 * This example demonstrates comprehensive message queuing and processing using the Fluxez SDK.
 * Perfect for background processing, event-driven architecture, and async task management.
 * 
 * Features demonstrated:
 * - Basic message sending and receiving
 * - Queue creation and management
 * - Dead letter queues
 * - Batch message processing
 * - Message scheduling and delays
 * - Queue monitoring and analytics
 * - Error handling and retries
 * - Distributed processing patterns
 * 
 * Time to complete: ~10 minutes
 */

const { FluxezClient } = require('@fluxez/node-sdk');

// Configuration
const API_KEY = process.env.FLUXEZ_API_KEY || 'cgx_your_api_key_here';
const API_URL = process.env.FLUXEZ_API_URL || 'https://api.fluxez.com/api/v1';

async function queueExamplesMain() {
  console.log('📬 Fluxez SDK Queue Examples\n');

  const client = new FluxezClient(API_KEY, {
    apiUrl: API_URL,
    debug: true,
    timeout: 60000, // Longer timeout for queue operations
  });

  try {
    // Test connection
    const connectionTest = await client.testConnection();
    if (!connectionTest.connected) {
      throw new Error('Cannot connect to backend. Please ensure the Fluxez backend is running.');
    }
    console.log('✅ Connected to Fluxez backend\n');

    // Set context
    client.setOrganization('org_queue_demo');
    client.setProject('proj_queue_demo');

    await demonstrateBasicQueuing(client);
    await demonstrateQueueManagement(client);
    await demonstrateBatchProcessing(client);
    await demonstrateScheduledMessages(client);
    await demonstrateErrorHandling(client);
    await demonstrateDistributedProcessing(client);
    await demonstrateQueueMonitoring(client);
    await demonstrateAdvancedPatterns(client);

    console.log('\n🎉 Queue Examples Complete!');

  } catch (error) {
    console.error('❌ Queue examples failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Ensure your backend has queue service configured');
    console.log('- Check that message broker (SQS/RabbitMQ) is accessible');
    console.log('- Verify your API key has queue permissions');
  }
}

async function demonstrateBasicQueuing(client) {
  console.log('📨 Basic Message Queuing\n');
  console.log('==========================================');

  try {
    console.log('1. Create a basic queue:');
    
    const queueName = `demo-queue-${Date.now()}`;
    const queueUrl = await client.queue.createQueue(queueName, {
      visibilityTimeout: 30, // 30 seconds
      messageRetentionPeriod: 1209600, // 14 days
      maxReceiveCount: 3, // Max retries before DLQ
      description: 'Demo queue for SDK examples'
    });

    console.log('✅ Queue created:', {
      name: queueName,
      url: queueUrl
    });

    console.log('\n2. Send simple message:');
    
    const messageResult = await client.queue.sendMessage(queueUrl, {
      action: 'SEND_WELCOME_EMAIL',
      userId: 'user_123',
      email: 'user@example.com',
      timestamp: new Date().toISOString(),
      metadata: {
        source: 'user-registration',
        priority: 'normal'
      }
    });

    console.log('✅ Message sent:', {
      messageId: messageResult.messageId,
      messageBody: messageResult.messageBody
    });

    console.log('\n3. Send message with attributes:');
    
    const attributedMessageResult = await client.queue.sendMessage(queueUrl, {
      action: 'PROCESS_ORDER',
      orderId: 'order_456',
      amount: 99.99,
      currency: 'USD'
    }, {
      messageAttributes: {
        priority: { dataType: 'String', stringValue: 'high' },
        orderType: { dataType: 'String', stringValue: 'premium' },
        processingTime: { dataType: 'Number', stringValue: '5' }
      },
      delaySeconds: 0,
      messageGroupId: 'order-processing', // For FIFO queues
      messageDeduplicationId: `order_456_${Date.now()}` // Prevent duplicates
    });

    console.log('✅ Attributed message sent:', attributedMessageResult);

    console.log('\n4. Receive messages:');
    
    // Wait a moment for message to be available
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const receivedMessages = await client.queue.receiveMessages(queueUrl, {
      maxNumberOfMessages: 5,
      waitTimeSeconds: 2, // Short polling
      messageAttributeNames: ['All']
    });

    console.log('✅ Messages received:', {
      count: receivedMessages.length,
      messages: receivedMessages.map(m => ({
        messageId: m.messageId,
        action: JSON.parse(m.body).action,
        attributes: m.messageAttributes
      }))
    });

    console.log('\n5. Process and delete messages:');
    
    for (const message of receivedMessages) {
      try {
        // Simulate message processing
        const messageData = JSON.parse(message.body);
        console.log(`Processing: ${messageData.action} for ${messageData.userId || messageData.orderId}`);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Delete message after successful processing
        await client.queue.deleteMessage(queueUrl, message.receiptHandle);
        console.log(`✅ Message ${message.messageId} processed and deleted`);
        
      } catch (error) {
        console.error(`❌ Failed to process message ${message.messageId}:`, error.message);
      }
    }

    return queueUrl;

  } catch (error) {
    console.error('❌ Basic queuing failed:', error.message);
    return null;
  }
}

async function demonstrateQueueManagement(client) {
  console.log('\n🔧 Queue Management\n');
  console.log('==========================================');

  try {
    console.log('1. Create multiple queue types:');
    
    // Standard queue
    const standardQueue = await client.queue.createQueue(`standard-queue-${Date.now()}`, {
      queueType: 'standard',
      visibilityTimeout: 60,
      messageRetentionPeriod: 345600, // 4 days
      description: 'Standard queue for general processing'
    });

    // FIFO queue
    const fifoQueue = await client.queue.createQueue(`fifo-queue-${Date.now()}.fifo`, {
      queueType: 'fifo',
      visibilityTimeout: 30,
      contentBasedDeduplication: true,
      description: 'FIFO queue for ordered processing'
    });

    // High-throughput queue
    const highThroughputQueue = await client.queue.createQueue(`high-throughput-${Date.now()}`, {
      queueType: 'standard',
      visibilityTimeout: 5,
      receiveMessageWaitTimeSeconds: 20, // Long polling
      description: 'High throughput queue for bulk processing'
    });

    console.log('✅ Multiple queues created:', {
      standard: standardQueue,
      fifo: fifoQueue,
      highThroughput: highThroughputQueue
    });

    console.log('\n2. List existing queues:');
    
    const queueList = await client.queue.listQueues({
      prefix: 'demo-',
      maxResults: 10
    });

    console.log('✅ Queue list:', {
      totalQueues: queueList.length,
      queues: queueList.map(q => q.name || q.split('/').pop())
    });

    console.log('\n3. Get queue attributes:');
    
    const queueAttributes = await client.queue.getQueueAttributes(standardQueue);
    console.log('✅ Queue attributes:', queueAttributes);

    console.log('\n4. Update queue configuration:');
    
    const updatedAttributes = await client.queue.setQueueAttributes(standardQueue, {
      visibilityTimeout: 120, // Increase to 2 minutes
      messageRetentionPeriod: 604800, // 7 days
      maxReceiveCount: 5 // Allow more retries
    });

    console.log('✅ Queue updated:', updatedAttributes);

    console.log('\n5. Set up dead letter queue:');
    
    const deadLetterQueue = await client.queue.createQueue(`dlq-${Date.now()}`, {
      description: 'Dead letter queue for failed messages'
    });

    await client.queue.setQueueAttributes(standardQueue, {
      deadLetterTargetArn: deadLetterQueue,
      maxReceiveCount: 3
    });

    console.log('✅ Dead letter queue configured:', {
      mainQueue: standardQueue,
      deadLetterQueue: deadLetterQueue
    });

    return {
      standardQueue,
      fifoQueue,
      highThroughputQueue,
      deadLetterQueue
    };

  } catch (error) {
    console.error('❌ Queue management failed:', error.message);
    return null;
  }
}

async function demonstrateBatchProcessing(client) {
  console.log('\n📦 Batch Message Processing\n');
  console.log('==========================================');

  try {
    console.log('1. Send batch messages:');
    
    const batchQueue = await client.queue.createQueue(`batch-queue-${Date.now()}`, {
      description: 'Queue for batch processing demo'
    });

    // Prepare batch messages
    const batchMessages = [];
    for (let i = 1; i <= 10; i++) {
      batchMessages.push({
        id: `msg_${i}`,
        messageBody: {
          action: 'PROCESS_BATCH_ITEM',
          itemId: `item_${i}`,
          batchId: 'batch_123',
          itemData: {
            name: `Item ${i}`,
            value: Math.random() * 100,
            category: i % 2 === 0 ? 'premium' : 'standard'
          },
          timestamp: new Date().toISOString()
        },
        messageAttributes: {
          itemType: { dataType: 'String', stringValue: i % 2 === 0 ? 'premium' : 'standard' },
          batchPosition: { dataType: 'Number', stringValue: i.toString() }
        }
      });
    }

    const batchSendResult = await client.queue.sendMessageBatch(batchQueue, batchMessages);
    console.log('✅ Batch messages sent:', {
      successful: batchSendResult.successful?.length || 0,
      failed: batchSendResult.failed?.length || 0,
      details: batchSendResult
    });

    console.log('\n2. Process messages in batches:');
    
    let processedCount = 0;
    let batchNumber = 1;

    while (processedCount < 10) {
      console.log(`Processing batch ${batchNumber}...`);
      
      const messages = await client.queue.receiveMessages(batchQueue, {
        maxNumberOfMessages: 3, // Process 3 at a time
        waitTimeSeconds: 2,
        messageAttributeNames: ['All']
      });

      if (messages.length === 0) {
        console.log('No more messages to process');
        break;
      }

      // Process batch in parallel
      const processingPromises = messages.map(async (message) => {
        try {
          const messageData = JSON.parse(message.body);
          console.log(`  Processing item: ${messageData.itemId}`);
          
          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
          
          return {
            messageId: message.messageId,
            receiptHandle: message.receiptHandle,
            success: true,
            itemId: messageData.itemId
          };
        } catch (error) {
          return {
            messageId: message.messageId,
            receiptHandle: message.receiptHandle,
            success: false,
            error: error.message
          };
        }
      });

      const results = await Promise.all(processingPromises);
      
      // Delete successfully processed messages
      const successfulMessages = results.filter(r => r.success);
      if (successfulMessages.length > 0) {
        const deleteEntries = successfulMessages.map(r => ({
          id: r.messageId,
          receiptHandle: r.receiptHandle
        }));

        await client.queue.deleteMessageBatch(batchQueue, deleteEntries);
        console.log(`✅ Batch ${batchNumber} complete: ${successfulMessages.length} items processed`);
      }

      processedCount += successfulMessages.length;
      batchNumber++;
    }

    console.log(`✅ Batch processing complete: ${processedCount} total items processed`);

    console.log('\n3. Bulk message sending with different priorities:');
    
    const priorityMessages = [
      { priority: 'critical', count: 2 },
      { priority: 'high', count: 5 },
      { priority: 'normal', count: 10 },
      { priority: 'low', count: 3 }
    ];

    for (const priority of priorityMessages) {
      const messages = [];
      for (let i = 1; i <= priority.count; i++) {
        messages.push({
          id: `${priority.priority}_${i}`,
          messageBody: {
            action: 'PRIORITY_TASK',
            taskId: `task_${priority.priority}_${i}`,
            priority: priority.priority,
            data: { task: `${priority.priority} priority task ${i}` }
          },
          messageAttributes: {
            priority: { dataType: 'String', stringValue: priority.priority }
          }
        });
      }

      const result = await client.queue.sendMessageBatch(batchQueue, messages);
      console.log(`✅ ${priority.priority} priority messages sent:`, result.successful?.length || 0);
    }

  } catch (error) {
    console.error('❌ Batch processing failed:', error.message);
  }
}

async function demonstrateScheduledMessages(client) {
  console.log('\n⏰ Scheduled Messages\n');
  console.log('==========================================');

  try {
    console.log('1. Send delayed messages:');
    
    const scheduleQueue = await client.queue.createQueue(`schedule-queue-${Date.now()}`, {
      description: 'Queue for scheduled message demo'
    });

    // Send immediate message
    await client.queue.sendMessage(scheduleQueue, {
      action: 'IMMEDIATE_TASK',
      message: 'This message should process immediately',
      timestamp: new Date().toISOString()
    });

    // Send message delayed by 5 seconds
    await client.queue.sendMessage(scheduleQueue, {
      action: 'DELAYED_TASK',
      message: 'This message is delayed by 5 seconds',
      scheduledFor: new Date(Date.now() + 5000).toISOString()
    }, {
      delaySeconds: 5
    });

    // Send message delayed by 10 seconds
    await client.queue.sendMessage(scheduleQueue, {
      action: 'DELAYED_TASK',
      message: 'This message is delayed by 10 seconds',
      scheduledFor: new Date(Date.now() + 10000).toISOString()
    }, {
      delaySeconds: 10
    });

    console.log('✅ Scheduled messages sent at:', new Date().toLocaleTimeString());

    console.log('\n2. Schedule recurring tasks:');
    
    const recurringTasks = [
      {
        name: 'Daily Report',
        schedule: '0 9 * * *', // Daily at 9 AM
        action: 'GENERATE_DAILY_REPORT',
        data: { reportType: 'daily', recipients: ['admin@example.com'] }
      },
      {
        name: 'Weekly Backup',
        schedule: '0 2 * * 0', // Weekly on Sunday at 2 AM
        action: 'BACKUP_DATABASE',
        data: { backupType: 'full', destination: 'fluxez://backups/' }
      },
      {
        name: 'Hourly Health Check',
        schedule: '0 * * * *', // Every hour
        action: 'HEALTH_CHECK',
        data: { services: ['database', 'cache', 'storage'] }
      }
    ];

    for (const task of recurringTasks) {
      const scheduleResult = await client.queue.scheduleRecurringMessage(scheduleQueue, {
        schedule: task.schedule,
        messageBody: {
          action: task.action,
          taskName: task.name,
          data: task.data,
          scheduledTask: true
        },
        timezone: 'UTC'
      });

      console.log(`✅ Scheduled recurring task: ${task.name}`, scheduleResult);
    }

    console.log('\n3. Monitor scheduled messages:');
    
    // Wait and check for immediate message
    let attempts = 0;
    while (attempts < 3) {
      const messages = await client.queue.receiveMessages(scheduleQueue, {
        maxNumberOfMessages: 1,
        waitTimeSeconds: 2
      });

      if (messages.length > 0) {
        const message = messages[0];
        const messageData = JSON.parse(message.body);
        console.log(`✅ Received message at ${new Date().toLocaleTimeString()}:`, messageData.message);
        
        await client.queue.deleteMessage(scheduleQueue, message.receiptHandle);
      } else {
        console.log(`⏳ Waiting for messages... (attempt ${attempts + 1})`);
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n4. Schedule message with complex conditions:');
    
    const conditionalMessage = await client.queue.sendMessage(scheduleQueue, {
      action: 'CONDITIONAL_TASK',
      conditions: {
        executeAfter: new Date(Date.now() + 3000).toISOString(),
        executeBefore: new Date(Date.now() + 30000).toISOString(),
        requiredConditions: ['system_healthy', 'low_load']
      },
      data: {
        task: 'System maintenance task',
        priority: 'low'
      }
    }, {
      delaySeconds: 3,
      messageAttributes: {
        conditional: { dataType: 'String', stringValue: 'true' },
        maxExecutionTime: { dataType: 'Number', stringValue: '30' }
      }
    });

    console.log('✅ Conditional message scheduled:', conditionalMessage);

  } catch (error) {
    console.error('❌ Scheduled messages failed:', error.message);
  }
}

async function demonstrateErrorHandling(client) {
  console.log('\n🚨 Error Handling & Retries\n');
  console.log('==========================================');

  try {
    console.log('1. Create error handling queue:');
    
    const errorQueue = await client.queue.createQueue(`error-queue-${Date.now()}`, {
      visibilityTimeout: 10, // Short timeout for demo
      maxReceiveCount: 3, // Max 3 retries
      description: 'Queue for error handling demo'
    });

    const dlqUrl = await client.queue.createQueue(`error-dlq-${Date.now()}`, {
      description: 'Dead letter queue for error handling demo'
    });

    // Configure dead letter queue
    await client.queue.setQueueAttributes(errorQueue, {
      deadLetterTargetArn: dlqUrl,
      maxReceiveCount: 3
    });

    console.log('✅ Error handling queues created');

    console.log('\n2. Send messages that will fail:');
    
    // Send messages designed to fail
    const failingMessages = [
      {
        action: 'DIVIDE_BY_ZERO',
        data: { numerator: 10, denominator: 0 },
        willFail: true
      },
      {
        action: 'INVALID_EMAIL',
        data: { email: 'not-an-email' },
        willFail: true
      },
      {
        action: 'MISSING_REQUIRED_FIELD',
        data: { name: 'test' }, // missing required 'id' field
        willFail: true
      },
      {
        action: 'SUCCESS_TASK',
        data: { message: 'This should work' },
        willFail: false
      }
    ];

    for (const message of failingMessages) {
      await client.queue.sendMessage(errorQueue, message);
    }

    console.log('✅ Test messages sent (some will fail)');

    console.log('\n3. Process messages with error handling:');
    
    const processMessage = async (message) => {
      const messageData = JSON.parse(message.body);
      
      console.log(`Processing: ${messageData.action}`);
      
      // Simulate processing logic that might fail
      switch (messageData.action) {
        case 'DIVIDE_BY_ZERO':
          if (messageData.data.denominator === 0) {
            throw new Error('Division by zero');
          }
          return messageData.data.numerator / messageData.data.denominator;
          
        case 'INVALID_EMAIL':
          if (!messageData.data.email.includes('@')) {
            throw new Error('Invalid email format');
          }
          return `Email ${messageData.data.email} is valid`;
          
        case 'MISSING_REQUIRED_FIELD':
          if (!messageData.data.id) {
            throw new Error('Missing required field: id');
          }
          return `Processing item ${messageData.data.id}`;
          
        case 'SUCCESS_TASK':
          return `Success: ${messageData.data.message}`;
          
        default:
          throw new Error('Unknown action');
      }
    };

    // Process messages with retry logic
    let processingRound = 1;
    while (processingRound <= 4) { // Process through multiple rounds to show retries
      console.log(`\n--- Processing Round ${processingRound} ---`);
      
      const messages = await client.queue.receiveMessages(errorQueue, {
        maxNumberOfMessages: 5,
        waitTimeSeconds: 2,
        messageAttributeNames: ['All']
      });

      if (messages.length === 0) {
        console.log('No messages to process');
        break;
      }

      for (const message of messages) {
        try {
          const result = await processMessage(message);
          console.log(`✅ Success: ${result}`);
          
          // Delete successful message
          await client.queue.deleteMessage(errorQueue, message.receiptHandle);
          
        } catch (error) {
          console.log(`❌ Error: ${error.message} (message will retry)`);
          
          // Message will automatically retry due to visibility timeout
          // After maxReceiveCount is reached, it will go to DLQ
        }
      }
      
      processingRound++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n4. Check dead letter queue:');
    
    const dlqMessages = await client.queue.receiveMessages(dlqUrl, {
      maxNumberOfMessages: 10,
      waitTimeSeconds: 2
    });

    console.log(`✅ Dead letter queue contains ${dlqMessages.length} failed messages:`);
    dlqMessages.forEach(msg => {
      const data = JSON.parse(msg.body);
      console.log(`  - ${data.action}: ${data.data ? JSON.stringify(data.data) : 'no data'}`);
    });

    console.log('\n5. Implement message retry with exponential backoff:');
    
    const retryWithBackoff = async (messageData, attempt = 1, maxAttempts = 3) => {
      try {
        // Simulate a flaky operation
        if (Math.random() < 0.7 && attempt < 3) { // 70% chance to fail on first two attempts
          throw new Error('Temporary failure');
        }
        
        console.log(`✅ Success on attempt ${attempt}`);
        return true;
        
      } catch (error) {
        if (attempt >= maxAttempts) {
          console.log(`❌ Failed after ${maxAttempts} attempts: ${error.message}`);
          return false;
        }
        
        const backoffDelay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`⚠️  Attempt ${attempt} failed, retrying in ${backoffDelay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return retryWithBackoff(messageData, attempt + 1, maxAttempts);
      }
    };

    // Test retry logic
    await retryWithBackoff({ action: 'FLAKY_OPERATION' });

  } catch (error) {
    console.error('❌ Error handling demonstration failed:', error.message);
  }
}

async function demonstrateDistributedProcessing(client) {
  console.log('\n🌐 Distributed Processing\n');
  console.log('==========================================');

  try {
    console.log('1. Set up distributed work queue:');
    
    const workQueue = await client.queue.createQueue(`work-queue-${Date.now()}`, {
      visibilityTimeout: 30,
      description: 'Distributed work processing queue'
    });

    // Create a large batch of work items
    const workItems = [];
    for (let i = 1; i <= 20; i++) {
      workItems.push({
        id: `work_${i}`,
        messageBody: {
          action: 'PROCESS_WORK_ITEM',
          workId: `work_${i}`,
          data: {
            task: `Task ${i}`,
            complexity: Math.floor(Math.random() * 5) + 1, // 1-5 complexity
            estimatedTime: Math.floor(Math.random() * 10) + 1 // 1-10 seconds
          },
          createdAt: new Date().toISOString()
        }
      });
    }

    const batchResult = await client.queue.sendMessageBatch(workQueue, workItems);
    console.log(`✅ ${batchResult.successful?.length || 0} work items queued`);

    console.log('\n2. Simulate multiple workers:');
    
    const workers = [];
    const workerCount = 3;

    // Create worker functions
    for (let workerId = 1; workerId <= workerCount; workerId++) {
      const worker = {
        id: workerId,
        name: `Worker-${workerId}`,
        processed: 0,
        errors: 0,
        active: true
      };

      const workerProcess = async () => {
        while (worker.active) {
          try {
            const messages = await client.queue.receiveMessages(workQueue, {
              maxNumberOfMessages: 1,
              waitTimeSeconds: 3 // Short wait for demo
            });

            if (messages.length === 0) {
              // No work available, continue polling
              continue;
            }

            const message = messages[0];
            const workData = JSON.parse(message.body);
            
            console.log(`${worker.name} processing: ${workData.workId}`);
            
            // Simulate work processing time
            await new Promise(resolve => 
              setTimeout(resolve, workData.data.estimatedTime * 100) // Scale down for demo
            );

            // Simulate occasional failures
            if (Math.random() < 0.1) { // 10% failure rate
              throw new Error('Random processing error');
            }

            // Mark work as completed
            await client.queue.deleteMessage(workQueue, message.receiptHandle);
            worker.processed++;
            
            console.log(`✅ ${worker.name} completed: ${workData.workId} (total: ${worker.processed})`);
            
          } catch (error) {
            worker.errors++;
            console.log(`❌ ${worker.name} error: ${error.message} (errors: ${worker.errors})`);
            
            // Continue processing other messages
          }
        }
      };

      workers.push({ ...worker, process: workerProcess });
    }

    // Start all workers
    const workerPromises = workers.map(worker => worker.process());

    // Let workers run for a limited time
    await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds

    // Stop all workers
    workers.forEach(worker => worker.active = false);

    // Wait for workers to finish current tasks
    await Promise.all(workerPromises);

    console.log('\n✅ Worker summary:');
    workers.forEach(worker => {
      console.log(`  ${worker.name}: ${worker.processed} processed, ${worker.errors} errors`);
    });

    console.log('\n3. Load balancing demonstration:');
    
    // Create priority queues for load balancing
    const highPriorityQueue = await client.queue.createQueue(`high-priority-${Date.now()}`, {
      description: 'High priority work queue'
    });

    const lowPriorityQueue = await client.queue.createQueue(`low-priority-${Date.now()}`, {
      description: 'Low priority work queue'
    });

    // Send messages to different priority queues
    await client.queue.sendMessage(highPriorityQueue, {
      action: 'URGENT_TASK',
      priority: 'high',
      data: { message: 'This is urgent!' }
    });

    await client.queue.sendMessage(lowPriorityQueue, {
      action: 'BACKGROUND_TASK',
      priority: 'low',
      data: { message: 'This can wait' }
    });

    // Demonstrate priority processing
    console.log('Processing with priority:');
    
    // Check high priority first
    let highPriorityMessages = await client.queue.receiveMessages(highPriorityQueue, {
      maxNumberOfMessages: 5,
      waitTimeSeconds: 1
    });

    if (highPriorityMessages.length > 0) {
      console.log('✅ Processing high priority messages first');
      for (const msg of highPriorityMessages) {
        await client.queue.deleteMessage(highPriorityQueue, msg.receiptHandle);
      }
    }

    // Then check low priority
    let lowPriorityMessages = await client.queue.receiveMessages(lowPriorityQueue, {
      maxNumberOfMessages: 5,
      waitTimeSeconds: 1
    });

    if (lowPriorityMessages.length > 0) {
      console.log('✅ Processing low priority messages');
      for (const msg of lowPriorityMessages) {
        await client.queue.deleteMessage(lowPriorityQueue, msg.receiptHandle);
      }
    }

  } catch (error) {
    console.error('❌ Distributed processing failed:', error.message);
  }
}

async function demonstrateQueueMonitoring(client) {
  console.log('\n📊 Queue Monitoring & Analytics\n');
  console.log('==========================================');

  try {
    console.log('1. Queue statistics:');
    
    const monitorQueue = await client.queue.createQueue(`monitor-queue-${Date.now()}`, {
      description: 'Queue for monitoring demonstration'
    });

    // Add some messages for monitoring
    for (let i = 1; i <= 5; i++) {
      await client.queue.sendMessage(monitorQueue, {
        action: 'MONITOR_TEST',
        messageNumber: i,
        timestamp: new Date().toISOString()
      });
    }

    const queueStats = await client.queue.getQueueStats(monitorQueue);
    console.log('✅ Queue statistics:', queueStats);

    console.log('\n2. Message flow analytics:');
    
    const flowAnalytics = await client.queue.getMessageFlowAnalytics(monitorQueue, {
      period: 'last_24_hours',
      includeMetrics: ['sent', 'received', 'deleted', 'failed']
    });

    console.log('✅ Message flow analytics:', flowAnalytics);

    console.log('\n3. Queue health monitoring:');
    
    const healthMetrics = await client.queue.getQueueHealth(monitorQueue);
    console.log('✅ Queue health:', healthMetrics);

    console.log('\n4. Set up monitoring alerts:');
    
    const alertConfig = await client.queue.setupMonitoringAlerts(monitorQueue, {
      alerts: [
        {
          metric: 'visible_messages',
          threshold: 100,
          comparison: 'greater_than',
          action: 'email',
          recipients: ['admin@example.com']
        },
        {
          metric: 'message_age',
          threshold: 300, // 5 minutes
          comparison: 'greater_than',
          action: 'webhook',
          webhookUrl: 'https://alerts.myapp.com/queue-alert'
        },
        {
          metric: 'error_rate',
          threshold: 0.1, // 10%
          comparison: 'greater_than',
          action: 'slack',
          slackChannel: '#alerts'
        }
      ]
    });

    console.log('✅ Monitoring alerts configured:', alertConfig);

    console.log('\n5. Performance metrics:');
    
    const performanceMetrics = await client.queue.getPerformanceMetrics([monitorQueue], {
      metrics: ['throughput', 'latency', 'error_rate', 'processing_time'],
      timeRange: 'last_hour',
      granularity: 'minute'
    });

    console.log('✅ Performance metrics:', performanceMetrics);

    console.log('\n6. Real-time monitoring dashboard data:');
    
    const dashboardData = await client.queue.getDashboardData({
      queues: [monitorQueue],
      includeCharts: true,
      refreshInterval: 30 // seconds
    });

    console.log('✅ Dashboard data:', {
      totalQueues: dashboardData.summary?.totalQueues,
      totalMessages: dashboardData.summary?.totalMessages,
      avgProcessingTime: dashboardData.summary?.avgProcessingTime
    });

  } catch (error) {
    console.error('❌ Queue monitoring failed:', error.message);
  }
}

async function demonstrateAdvancedPatterns(client) {
  console.log('\n🚀 Advanced Queue Patterns\n');
  console.log('==========================================');

  try {
    console.log('1. Fan-out pattern (broadcast):');
    
    // Create multiple queues for fan-out
    const fanoutQueues = {
      email: await client.queue.createQueue(`fanout-email-${Date.now()}`),
      sms: await client.queue.createQueue(`fanout-sms-${Date.now()}`),
      push: await client.queue.createQueue(`fanout-push-${Date.now()}`),
      webhook: await client.queue.createQueue(`fanout-webhook-${Date.now()}`)
    };

    // Broadcast message to all channels
    const broadcastMessage = {
      event: 'USER_REGISTERED',
      userId: 'user_789',
      email: 'user@example.com',
      phone: '+1234567890',
      data: {
        name: 'John Doe',
        plan: 'premium'
      },
      timestamp: new Date().toISOString()
    };

    // Send to all notification channels
    const fanoutPromises = Object.entries(fanoutQueues).map(([channel, queueUrl]) =>
      client.queue.sendMessage(queueUrl, {
        ...broadcastMessage,
        channel: channel,
        action: `SEND_${channel.toUpperCase()}_NOTIFICATION`
      })
    );

    await Promise.all(fanoutPromises);
    console.log('✅ Fan-out message sent to all channels');

    console.log('\n2. Saga pattern (distributed transaction):');
    
    const sagaQueue = await client.queue.createQueue(`saga-${Date.now()}`);
    
    // Define saga steps
    const sagaSteps = [
      { step: 1, action: 'RESERVE_INVENTORY', rollback: 'RELEASE_INVENTORY' },
      { step: 2, action: 'CHARGE_PAYMENT', rollback: 'REFUND_PAYMENT' },
      { step: 3, action: 'CREATE_ORDER', rollback: 'CANCEL_ORDER' },
      { step: 4, action: 'SEND_CONFIRMATION', rollback: 'SEND_CANCELLATION' }
    ];

    const sagaTransaction = {
      sagaId: `saga_${Date.now()}`,
      orderId: 'order_123',
      userId: 'user_456',
      amount: 99.99,
      steps: sagaSteps,
      currentStep: 1,
      status: 'started'
    };

    // Start saga
    await client.queue.sendMessage(sagaQueue, {
      action: 'START_SAGA',
      ...sagaTransaction
    });

    console.log('✅ Saga transaction started');

    console.log('\n3. Circuit breaker pattern:');
    
    const circuitBreakerQueue = await client.queue.createQueue(`circuit-breaker-${Date.now()}`);
    
    // Simulate circuit breaker state
    let circuitState = {
      state: 'closed', // closed, open, half-open
      failureCount: 0,
      lastFailureTime: null,
      threshold: 3,
      timeout: 60000 // 1 minute
    };

    const processWithCircuitBreaker = async (message) => {
      if (circuitState.state === 'open') {
        const timeSinceLastFailure = Date.now() - circuitState.lastFailureTime;
        if (timeSinceLastFailure < circuitState.timeout) {
          throw new Error('Circuit breaker is open');
        } else {
          circuitState.state = 'half-open';
        }
      }

      try {
        // Simulate external service call that might fail
        if (Math.random() < 0.3) { // 30% failure rate
          throw new Error('External service failure');
        }

        // Success - reset circuit breaker
        circuitState.state = 'closed';
        circuitState.failureCount = 0;
        return 'Success';

      } catch (error) {
        circuitState.failureCount++;
        circuitState.lastFailureTime = Date.now();

        if (circuitState.failureCount >= circuitState.threshold) {
          circuitState.state = 'open';
        }

        throw error;
      }
    };

    // Test circuit breaker
    for (let i = 1; i <= 5; i++) {
      try {
        await processWithCircuitBreaker({});
        console.log(`✅ Request ${i}: Success (circuit: ${circuitState.state})`);
      } catch (error) {
        console.log(`❌ Request ${i}: ${error.message} (circuit: ${circuitState.state})`);
      }
    }

    console.log('\n4. Message deduplication:');
    
    const dedupeQueue = await client.queue.createQueue(`dedupe-${Date.now()}.fifo`, {
      queueType: 'fifo',
      contentBasedDeduplication: true
    });

    // Send duplicate messages
    const duplicateMessage = {
      action: 'PROCESS_PAYMENT',
      paymentId: 'payment_123',
      amount: 50.00
    };

    for (let i = 1; i <= 3; i++) {
      await client.queue.sendMessage(dedupeQueue, duplicateMessage, {
        messageGroupId: 'payment-processing',
        messageDeduplicationId: 'payment_123' // Same ID for deduplication
      });
    }

    console.log('✅ Duplicate messages sent (should be deduplicated)');

    // Check that only one message is received
    const dedupeMessages = await client.queue.receiveMessages(dedupeQueue, {
      maxNumberOfMessages: 5,
      waitTimeSeconds: 2
    });

    console.log(`✅ Deduplication result: ${dedupeMessages.length} message(s) received (should be 1)`);

    console.log('\n5. Message routing based on content:');
    
    const routingQueues = {
      premium: await client.queue.createQueue(`route-premium-${Date.now()}`),
      standard: await client.queue.createQueue(`route-standard-${Date.now()}`),
      basic: await client.queue.createQueue(`route-basic-${Date.now()}`)
    };

    const users = [
      { id: 'user_1', plan: 'premium', priority: 'high' },
      { id: 'user_2', plan: 'standard', priority: 'normal' },
      { id: 'user_3', plan: 'basic', priority: 'low' },
      { id: 'user_4', plan: 'premium', priority: 'high' }
    ];

    // Route messages based on user plan
    for (const user of users) {
      const targetQueue = routingQueues[user.plan];
      await client.queue.sendMessage(targetQueue, {
        action: 'PROCESS_USER_REQUEST',
        userId: user.id,
        plan: user.plan,
        priority: user.priority,
        routedTo: user.plan
      });
    }

    console.log('✅ Messages routed based on user plans');

  } catch (error) {
    console.error('❌ Advanced patterns failed:', error.message);
  }
}

// Promise-based queue example
function promiseBasedQueueExample() {
  console.log('\n🔄 Promise-based Queue Operations\n');

  const client = new FluxezClient(API_KEY, {
    apiUrl: API_URL,
    debug: false
  });

  const queueName = `promise-queue-${Date.now()}`;

  return client.queue.createQueue(queueName)
    .then(queueUrl => {
      console.log('✅ Promise queue created:', queueUrl);
      return client.queue.sendMessage(queueUrl, {
        action: 'PROMISE_TEST',
        message: 'This message was sent using promises'
      });
    })
    .then(sendResult => {
      console.log('✅ Promise message sent:', sendResult.messageId);
      return client.queue.receiveMessages(queueName, { maxNumberOfMessages: 1 });
    })
    .then(messages => {
      if (messages.length > 0) {
        console.log('✅ Promise message received:', JSON.parse(messages[0].body));
        return client.queue.deleteMessage(queueName, messages[0].receiptHandle);
      }
    })
    .then(() => {
      console.log('✅ Promise message processed and deleted');
    })
    .catch(error => {
      console.error('❌ Promise chain failed:', error.message);
    });
}

// Run the examples
if (require.main === module) {
  console.log('🌟 Running Fluxez SDK Queue Examples\n');
  
  queueExamplesMain()
    .then(() => {
      setTimeout(() => {
        console.log('\n' + '='.repeat(50));
        promiseBasedQueueExample();
      }, 2000);
    })
    .catch(console.error);
}

// Export for use in other files
module.exports = {
  queueExamplesMain,
  demonstrateBasicQueuing,
  demonstrateQueueManagement,
  demonstrateBatchProcessing,
  demonstrateScheduledMessages,
  demonstrateErrorHandling,
  demonstrateDistributedProcessing,
  demonstrateQueueMonitoring,
  demonstrateAdvancedPatterns,
  promiseBasedQueueExample
};