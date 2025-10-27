/**
 * Fluxez SDK - Quick Start Example
 * 
 * This example shows the fastest way to get started with the Fluxez SDK.
 * Perfect for proof of concept and first-time users.
 * 
 * Features demonstrated:
 * - Basic SDK initialization
 * - Simple database query
 * - Send an email
 * - Upload a file
 * - Connection testing
 * 
 * Time to complete: ~5 minutes
 */

const { FluxezClient } = require('@fluxez/node-sdk');

// Configuration - Use environment variables or replace with your actual values
const API_KEY = process.env.FLUXEZ_API_KEY || 'cgx_your_api_key_here';

async function quickStartExample() {
  console.log('🚀 Fluxez SDK Quick Start Example\n');

  // Step 1: Initialize the client
  console.log('📡 Initializing Fluxez client...');
  const client = new FluxezClient(API_KEY, {
    
    debug: true, // Enable debug logging to see what's happening
    timeout: 30000, // 30 second timeout
  });

  try {
    // Step 2: Test the connection
    console.log('\n🔍 Testing connection...');
    const connectionTest = await client.testConnection();
    console.log(`✅ Connected! Latency: ${connectionTest.latency}ms, Version: ${connectionTest.version}`);

    if (!connectionTest.connected) {
      throw new Error('❌ Failed to connect to Fluxez backend. Please check your API_URL and ensure the backend is running.');
    }

    // Step 3: Set context (optional but recommended for multi-tenant apps)
    console.log('\n🏢 Setting organizational context...');
    client.setOrganization('org_demo_123');
    client.setProject('proj_demo_456');
    console.log('✅ Context set successfully');

    // Step 4: Simple database query
    console.log('\n📊 Executing a simple database query...');
    try {
      // Try to get database version - this works on any PostgreSQL database
      const versionResult = await client.raw('SELECT version() as db_version');
      console.log('✅ Database query successful:', versionResult.rows[0]);
    } catch (error) {
      console.log('⚠️  Database query failed (this is normal if no project database is set up):', error.message);
      
      // Alternative: Try a natural language query
      console.log('\n🤖 Trying natural language query instead...');
      try {
        const naturalResult = await client.natural('What is the current database version?');
        console.log('✅ Natural language query successful:', naturalResult);
      } catch (naturalError) {
        console.log('⚠️  Natural language query also failed:', naturalError.message);
      }
    }

    // Step 5: Send a simple email
    console.log('\n📧 Sending a welcome email...');
    try {
      const emailResult = await client.email.send({
        to: 'user@example.com',
        subject: '🎉 Welcome to Fluxez!',
        html: `
          <h1>Welcome to Fluxez!</h1>
          <p>This email was sent using the Fluxez SDK Quick Start example.</p>
          <p>Time sent: ${new Date().toISOString()}</p>
          <hr>
          <p><small>This is a test email from the Fluxez SDK</small></p>
        `,
        text: 'Welcome to Fluxez! This email was sent using the Fluxez SDK.',
        tags: ['welcome', 'sdk-example'],
        metadata: {
          source: 'quick-start-example',
          version: '1.0'
        }
      });
      console.log('✅ Email sent successfully:', {
        messageId: emailResult.messageId,
        status: emailResult.status
      });
    } catch (error) {
      console.log('⚠️  Email sending failed (email service may not be configured):', error.message);
    }

    // Step 6: Upload a simple file
    console.log('\n📁 Uploading a test file...');
    try {
      const testFileContent = `Hello from Fluxez SDK!
Generated at: ${new Date().toISOString()}
Random ID: ${Math.random().toString(36).substr(2, 9)}`;

      const uploadResult = await client.storage.upload(
        Buffer.from(testFileContent, 'utf-8'),
        {
          fileName: `test-file-${Date.now()}.txt`,
          contentType: 'text/plain',
          metadata: {
            source: 'quick-start-example',
            description: 'Test file from Fluxez SDK quick start'
          }
        }
      );
      
      console.log('✅ File uploaded successfully:', {
        url: uploadResult.url,
        fileName: uploadResult.fileName,
        size: uploadResult.size
      });

      // Try to generate a presigned URL for download
      if (uploadResult.key) {
        const downloadUrl = await client.storage.getSignedUrl(uploadResult.key, {
          operation: 'download',
          expiresIn: 3600 // 1 hour
        });
        console.log('📥 Download URL generated:', downloadUrl);
      }

    } catch (error) {
      console.log('⚠️  File upload failed (storage service may not be configured):', error.message);
    }

    // Step 7: Quick cache operation
    console.log('\n💾 Testing cache operations...');
    try {
      const cacheKey = `quick-start-${Date.now()}`;
      const cacheData = {
        message: 'Hello from cache!',
        timestamp: new Date().toISOString(),
        randomValue: Math.random()
      };

      // Set cache
      await client.cache.set(cacheKey, cacheData, 300); // 5 minutes TTL
      console.log('✅ Data cached successfully');

      // Get cache
      const cachedData = await client.cache.get(cacheKey);
      console.log('✅ Data retrieved from cache:', cachedData);

      // Optional: Delete cache entry
      await client.cache.delete(cacheKey);
      console.log('✅ Cache entry deleted');

    } catch (error) {
      console.log('⚠️  Cache operations failed (cache service may not be configured):', error.message);
    }

    // Step 8: Summary
    console.log('\n🎊 Quick Start Complete!');
    console.log('==========================================');
    console.log('✅ SDK initialized successfully');
    console.log('✅ Connection tested');
    console.log('✅ Context configured');
    console.log('✅ Database operations attempted');
    console.log('✅ Email functionality tested');
    console.log('✅ File storage tested');
    console.log('✅ Cache operations tested');
    console.log('==========================================');
    console.log('\n📚 Next steps:');
    console.log('1. Run other examples to learn specific features');
    console.log('2. Check examples/02-data-operations.js for database operations');
    console.log('3. Check examples/03-email.js for advanced email features');
    console.log('4. Check examples/04-storage.js for file management');
    console.log('5. Build your own application using these patterns!');

  } catch (error) {
    console.error('\n❌ Quick start failed:', error);
    
    // Provide helpful troubleshooting information
    console.log('\n🔧 Troubleshooting:');
    if (error.message.includes('ECONNREFUSED')) {
      console.log('- Make sure the Fluxez backend is running on', API_URL);
      console.log('- Try starting the backend with: npm run start:dev');
    }
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('- Check your API key is correct');
      console.log('- Make sure it starts with "cgx_"');
      console.log('- Get your API key from the Fluxez dashboard');
    }
    if (error.message.includes('timeout')) {
      console.log('- The backend might be slow to respond');
      console.log('- Try increasing the timeout in the client config');
    }
    console.log('- Enable debug mode for more details: { debug: true }');
    console.log('- Check the Fluxez documentation for setup instructions');
  }
}

// Promise-based example (alternative to async/await)
function quickStartPromiseExample() {
  console.log('\n🔄 Quick Start using Promises (alternative pattern)...\n');

  const client = new FluxezClient(API_KEY, {
    
    debug: false, // Less verbose for promise example
  });

  return client.testConnection()
    .then(connectionTest => {
      console.log('✅ Connection test (promises):', connectionTest);
      return client.raw('SELECT NOW() as current_time');
    })
    .then(timeResult => {
      console.log('✅ Current time query (promises):', timeResult.rows[0]);
      return client.cache.set('promise-example', { success: true }, 60);
    })
    .then(() => {
      console.log('✅ Cache set successfully (promises)');
      return client.cache.get('promise-example');
    })
    .then(cachedData => {
      console.log('✅ Cache retrieved (promises):', cachedData);
    })
    .catch(error => {
      console.error('❌ Promise chain failed:', error.message);
    });
}

// Configuration example
function configurationExample() {
  console.log('\n⚙️  Configuration Example...\n');

  // Different ways to configure the client
  
  // 1. Minimal configuration
  const client1 = new FluxezClient('cgx_your_api_key');
  console.log('Config 1 (minimal):', client1.getConfig());

  // 2. Full configuration
  const client2 = new FluxezClient('cgx_your_api_key', {
    
    timeout: 60000,
    retries: 5,
    debug: true,
    headers: {
      'X-App-Name': 'MyApp',
      'X-App-Version': '1.0.0',
      'X-Environment': 'production'
    }
  });
  console.log('Config 2 (full):', client2.getConfig());

  // 3. Runtime configuration updates
  client2.updateConfig({
    timeout: 90000,
    debug: false,
    headers: {
      'X-Environment': 'staging'
    }
  });
  console.log('Config 2 (updated):', client2.getConfig());

  // 4. Context management
  client2.setOrganization('org_my_company');
  client2.setProject('proj_my_app');
  client2.setApp('app_mobile');
  console.log('✅ Context set for multi-tenant operation');

  // 5. Header management
  client2.setHeader('X-Request-ID', 'req_' + Date.now());
  client2.setHeader('X-User-ID', 'user_123');
  console.log('✅ Custom headers added');
}

// Run the examples
if (require.main === module) {
  console.log('🌟 Running Fluxez SDK Quick Start Examples\n');
  
  // Run main example
  quickStartExample()
    .then(() => {
      // Run promise example after a delay
      setTimeout(() => quickStartPromiseExample(), 2000);
    })
    .then(() => {
      // Run configuration example after another delay
      setTimeout(() => configurationExample(), 1000);
    })
    .catch(console.error);
}

// Export for use in other files
module.exports = {
  quickStartExample,
  quickStartPromiseExample,
  configurationExample
};