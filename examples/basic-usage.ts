import { FluxezClient } from '../src/fluxez-client';

/**
 * Basic usage example of the Fluxez SDK
 */
async function basicUsageExample() {
  // Initialize client with just an API key
  const client = new FluxezClient('cgx_your_api_key_here', {
    debug: true,
    timeout: 15000,
  });

  try {
    // Test connection
    console.log('Testing connection...');
    const connectionTest = await client.testConnection();
    console.log('Connection test:', connectionTest);

    // Health check
    console.log('\nChecking health...');
    const health = await client.health();
    console.log('Health:', health);

    // Set context for a specific project
    client.setProject('proj_12345');
    client.setOrganization('org_67890');

    // Raw SQL query
    console.log('\nExecuting raw SQL...');
    const users = await client.raw('SELECT * FROM users WHERE active = ?', [true]);
    console.log('Active users:', users);

    // Natural language query
    console.log('\nUsing natural language query...');
    const recentUsers = await client.natural('show me users who signed up in the last 7 days');
    console.log('Recent users:', recentUsers);

    // Execute a write operation
    console.log('\nExecuting insert...');
    const insertResult = await client.execute(
      'INSERT INTO users (email, name, active) VALUES (?, ?, ?)',
      ['john@example.com', 'John Doe', true]
    );
    console.log('Insert result:', insertResult);

    // Using module clients
    console.log('\nUsing search client...');
    const searchResults = await client.search.search({
      query: 'john doe',
      limit: 10,
    });
    console.log('Search results:', searchResults);

    // Using cache client  
    console.log('\nUsing cache client...');
    await client.cache.set('user:123', { name: 'John Doe', email: 'john@example.com' }, 3600);
    const cachedUser = await client.cache.get('user:123');
    console.log('Cached user:', cachedUser);

    // Using analytics client
    console.log('\nUsing analytics client...');
    const analyticsResult = await client.analytics.query({
      table: 'events',
      select: ['event', 'COUNT(*) as count'],
      groupBy: ['event'],
      dateRange: {
        start: '2024-01-01',
        end: '2024-12-31',
        field: 'created_at'
      },
      limit: 10,
    });
    console.log('Analytics result:', analyticsResult);

  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Advanced usage with configuration
 */
async function advancedUsageExample() {
  const client = new FluxezClient('cgx_your_api_key_here', {
    apiUrl: 'https://api.fluxez.com/v1',
    timeout: 30000,
    retries: 5,
    debug: false,
    headers: {
      'X-Custom-Header': 'my-value',
      'X-App-Version': '1.0.0',
    },
  });

  // Set multiple contexts
  client.setOrganization('org_my_company');
  client.setProject('proj_my_app');
  client.setApp('app_my_mobile_app');

  try {
    // Complex query with the query builder
    const complexQuery = await client.query
      .select(['users.id', 'users.email', 'profiles.name'])
      .from('users')
      .join('profiles', 'users.id', 'profiles.user_id')
      .where('users.active', true)
      .where('profiles.verified', true)
      .orderBy('users.created_at', 'desc')
      .limit(50)
      .execute();

    console.log('Complex query result:', complexQuery);

    // Upload a file
    const uploadResult = await client.storage.upload(
      Buffer.from('Hello, world!'),
      {
        fileName: 'test.txt',
        contentType: 'text/plain',
        metadata: {
          source: 'sdk-example',
          version: '1.0',
        },
      }
    );

    console.log('Upload result:', uploadResult);

    // Vector search
    const vectorResults = await client.search.vectorSearch({
      collection: 'documents',
      vector: [0.1, 0.2, 0.3, /* ... 1533 more values */],
      limit: 5,
      threshold: 0.8,
    });

    console.log('Vector search results:', vectorResults);

  } catch (error) {
    console.error('Advanced example error:', error);
  }
}

/**
 * Configuration update example
 */
async function configurationExample() {
  const client = new FluxezClient('cgx_your_api_key_here');

  // Get current configuration
  console.log('Current config:', client.getConfig());

  // Update configuration
  client.updateConfig({
    timeout: 60000,
    debug: true,
    headers: {
      'X-Environment': 'production',
    },
  });

  // Clear all context
  client.clearContext();

  // Set specific headers
  client.setHeader('X-Request-ID', 'req_123456');
  client.setHeader('X-User-Agent', 'MyApp/1.0');

  // Remove a header
  client.removeHeader('X-Custom-Header');
}

// Run examples if this file is executed directly
if (require.main === module) {
  console.log('=== Basic Usage Example ===');
  basicUsageExample().catch(console.error);

  setTimeout(() => {
    console.log('\n=== Advanced Usage Example ===');
    advancedUsageExample().catch(console.error);
  }, 2000);

  setTimeout(() => {
    console.log('\n=== Configuration Example ===');
    configurationExample().catch(console.error);
  }, 4000);
}

export {
  basicUsageExample,
  advancedUsageExample,
  configurationExample,
};