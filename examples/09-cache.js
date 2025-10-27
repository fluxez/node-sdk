/**
 * Fluxez SDK - Cache Examples
 * 
 * This example demonstrates comprehensive caching capabilities using the Fluxez SDK.
 * Perfect for performance optimization, data caching, and reducing database load.
 * 
 * Features demonstrated:
 * - Basic cache operations (get, set, delete)
 * - TTL (Time To Live) management
 * - Cache patterns and strategies
 * - Distributed caching
 * - Cache invalidation strategies  
 * - Cache performance optimization
 * - Cache analytics and monitoring
 * - Advanced caching patterns
 * 
 * Time to complete: ~10 minutes
 */

const { FluxezClient } = require('@fluxez/node-sdk');

// Configuration
const API_KEY = process.env.FLUXEZ_API_KEY || 'cgx_your_api_key_here';

async function cacheExamplesMain() {
  console.log('💾 Fluxez SDK Cache Examples\n');

  const client = new FluxezClient(API_KEY, {
    
    debug: true,
    timeout: 60000,
  });

  try {
    // Test connection
    const connectionTest = await client.testConnection();
    if (!connectionTest.connected) {
      throw new Error('Cannot connect to backend. Please ensure the Fluxez backend is running.');
    }
    console.log('✅ Connected to Fluxez backend\n');

    // Set context
    client.setOrganization('org_cache_demo');
    client.setProject('proj_cache_demo');

    await demonstrateBasicCacheOperations(client);
    await demonstrateTTLManagement(client);
    await demonstrateCachePatterns(client);
    await demonstrateDistributedCaching(client);
    await demonstrateCacheInvalidation(client);
    await demonstrateCacheOptimization(client);
    await demonstrateCacheAnalytics(client);
    await demonstrateAdvancedCaching(client);

    console.log('\n🎉 Cache Examples Complete!');

  } catch (error) {
    console.error('❌ Cache examples failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Ensure your backend has Redis cache configured');
    console.log('- Check that Redis server is accessible');
    console.log('- Verify your API key has cache permissions');
  }
}

async function demonstrateBasicCacheOperations(client) {
  console.log('🔧 Basic Cache Operations\n');
  console.log('==========================================');

  try {
    console.log('1. Set and get simple values:');
    
    // Set simple string value
    await client.cache.set('user:123:name', 'John Doe');
    const userName = await client.cache.get('user:123:name');
    console.log('✅ String value:', { key: 'user:123:name', value: userName });

    // Set number value
    await client.cache.set('user:123:age', 30);
    const userAge = await client.cache.get('user:123:age');
    console.log('✅ Number value:', { key: 'user:123:age', value: userAge });

    // Set boolean value
    await client.cache.set('user:123:active', true);
    const userActive = await client.cache.get('user:123:active');
    console.log('✅ Boolean value:', { key: 'user:123:active', value: userActive });

    console.log('\n2. Set and get complex objects:');
    
    const userProfile = {
      id: 123,
      name: 'John Doe',
      email: 'john@example.com',
      preferences: {
        theme: 'dark',
        language: 'en',
        notifications: {
          email: true,
          sms: false,
          push: true
        }
      },
      metadata: {
        lastLogin: new Date().toISOString(),
        loginCount: 42,
        accountType: 'premium'
      }
    };

    await client.cache.set('user:123:profile', userProfile);
    const cachedProfile = await client.cache.get('user:123:profile');
    console.log('✅ Complex object:', {
      key: 'user:123:profile',
      name: cachedProfile?.name,
      preferences: cachedProfile?.preferences,
      loginCount: cachedProfile?.metadata?.loginCount
    });

    console.log('\n3. Set with TTL (Time To Live):');
    
    await client.cache.set('session:abc123', {
      userId: 123,
      role: 'user',
      permissions: ['read', 'write'],
      createdAt: new Date().toISOString()
    }, 3600); // 1 hour TTL

    const session = await client.cache.get('session:abc123');
    console.log('✅ Session data with TTL:', session);

    console.log('\n4. Check key existence:');
    
    const exists = await client.cache.exists('user:123:profile');
    const notExists = await client.cache.exists('user:999:profile');
    console.log('✅ Key existence:', { 
      'user:123:profile': exists, 
      'user:999:profile': notExists 
    });

    console.log('\n5. Delete operations:');
    
    await client.cache.set('temp:data', 'temporary data');
    const tempData = await client.cache.get('temp:data');
    console.log('✅ Before delete:', tempData);

    await client.cache.delete('temp:data');
    const deletedData = await client.cache.get('temp:data');
    console.log('✅ After delete:', deletedData); // Should be null

    console.log('\n6. Multiple operations:');
    
    // Set multiple keys at once
    const multipleData = {
      'product:1:name': 'Wireless Headphones',
      'product:1:price': 99.99,
      'product:1:stock': 150,
      'product:2:name': 'Smart Watch',
      'product:2:price': 199.99,
      'product:2:stock': 75
    };

    await client.cache.setMultiple(multipleData);
    
    // Get multiple keys at once
    const productKeys = ['product:1:name', 'product:1:price', 'product:2:name', 'product:2:price'];
    const products = await client.cache.getMultiple(productKeys);
    console.log('✅ Multiple get result:', products);

    // Delete multiple keys
    await client.cache.deleteMultiple(['product:1:stock', 'product:2:stock']);
    console.log('✅ Multiple keys deleted');

  } catch (error) {
    console.error('❌ Basic cache operations failed:', error.message);
  }
}

async function demonstrateTTLManagement(client) {
  console.log('\n⏰ TTL Management\n');
  console.log('==========================================');

  try {
    console.log('1. Set TTL for existing keys:');
    
    await client.cache.set('temp:key1', 'value1');
    await client.cache.setTTL('temp:key1', 300); // 5 minutes
    
    const ttl1 = await client.cache.getTTL('temp:key1');
    console.log('✅ TTL set for existing key:', { key: 'temp:key1', ttl: ttl1 });

    console.log('\n2. Different TTL patterns:');
    
    // Short-lived cache (30 seconds)
    await client.cache.set('shortlived:data', { type: 'temporary' }, 30);
    
    // Medium-lived cache (1 hour)
    await client.cache.set('mediumlived:data', { type: 'session' }, 3600);
    
    // Long-lived cache (24 hours)
    await client.cache.set('longlived:data', { type: 'user-preferences' }, 86400);
    
    // Get TTLs for all
    const ttls = await Promise.all([
      client.cache.getTTL('shortlived:data'),
      client.cache.getTTL('mediumlived:data'),
      client.cache.getTTL('longlived:data')
    ]);

    console.log('✅ Different TTL patterns:', {
      shortLived: ttls[0],
      mediumLived: ttls[1],
      longLived: ttls[2]
    });

    console.log('\n3. Extend TTL:');
    
    await client.cache.set('extendable:key', 'extendable value', 60); // 1 minute initially
    let initialTTL = await client.cache.getTTL('extendable:key');
    console.log('✅ Initial TTL:', initialTTL);

    // Extend TTL to 5 minutes
    await client.cache.setTTL('extendable:key', 300);
    let extendedTTL = await client.cache.getTTL('extendable:key');
    console.log('✅ Extended TTL:', extendedTTL);

    console.log('\n4. Conditional TTL operations:');
    
    // Set only if key doesn't exist
    const setIfNotExists = await client.cache.setIfNotExists('conditional:key1', 'value1', 300);
    console.log('✅ Set if not exists (new key):', setIfNotExists);

    // Try to set the same key again
    const setIfNotExists2 = await client.cache.setIfNotExists('conditional:key1', 'value2', 300);
    console.log('✅ Set if not exists (existing key):', setIfNotExists2);

    // Set only if key exists
    const setIfExists = await client.cache.setIfExists('conditional:key1', 'updated value', 600);
    console.log('✅ Set if exists:', setIfExists);

    console.log('\n5. TTL expiration handling:');
    
    // Set a key with very short TTL for testing
    await client.cache.set('expiring:key', 'will expire soon', 2); // 2 seconds
    
    console.log('✅ Key set with 2-second TTL');
    
    // Check immediately
    const beforeExpiry = await client.cache.get('expiring:key');
    console.log('✅ Before expiry:', beforeExpiry);

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Check after expiration
    const afterExpiry = await client.cache.get('expiring:key');
    console.log('✅ After expiry:', afterExpiry); // Should be null

    console.log('\n6. Refresh TTL on access:');
    
    await client.cache.set('refresh:key', { data: 'refreshable' }, 300);
    
    // Get with TTL refresh
    const refreshedData = await client.cache.getAndRefresh('refresh:key', 600); // Extend to 10 minutes
    const newTTL = await client.cache.getTTL('refresh:key');
    
    console.log('✅ Refreshed on access:', {
      data: refreshedData,
      newTTL: newTTL
    });

  } catch (error) {
    console.error('❌ TTL management failed:', error.message);
  }
}

async function demonstrateCachePatterns(client) {
  console.log('\n🏗️  Cache Patterns & Strategies\n');
  console.log('==========================================');

  try {
    console.log('1. Cache-aside pattern:');
    
    const getUserFromCache = async (userId) => {
      // Try cache first
      let user = await client.cache.get(`user:${userId}`);
      
      if (!user) {
        console.log('  Cache miss - fetching from database');
        // Simulate database fetch
        user = {
          id: userId,
          name: `User ${userId}`,
          email: `user${userId}@example.com`,
          fetchedAt: new Date().toISOString(),
          source: 'database'
        };
        
        // Store in cache for future requests
        await client.cache.set(`user:${userId}`, user, 3600);
      } else {
        console.log('  Cache hit');
        user.source = 'cache';
      }
      
      return user;
    };

    // First call - cache miss
    const user1 = await getUserFromCache(456);
    console.log('✅ First call (cache miss):', { source: user1.source, name: user1.name });

    // Second call - cache hit
    const user2 = await getUserFromCache(456);
    console.log('✅ Second call (cache hit):', { source: user2.source, name: user2.name });

    console.log('\n2. Write-through pattern:');
    
    const writeUser = async (userId, userData) => {
      // Write to database first (simulated)
      console.log('  Writing to database');
      const savedUser = { ...userData, id: userId, updatedAt: new Date().toISOString() };
      
      // Then write to cache
      await client.cache.set(`user:${userId}`, savedUser, 3600);
      console.log('  Written to cache');
      
      return savedUser;
    };

    const savedUser = await writeUser(789, {
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'admin'
    });
    console.log('✅ Write-through result:', { id: savedUser.id, name: savedUser.name });

    console.log('\n3. Write-behind (write-back) pattern:');
    
    const writeUserAsync = async (userId, userData) => {
      // Write to cache immediately
      const user = { ...userData, id: userId, updatedAt: new Date().toISOString() };
      await client.cache.set(`user:${userId}`, user, 3600);
      
      // Queue for async database write
      await client.cache.set(`pending_writes:user:${userId}`, user, 7200);
      
      console.log('  User cached, database write queued');
      return user;
    };

    const asyncUser = await writeUserAsync(101, {
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'user'
    });
    console.log('✅ Write-behind result:', { id: asyncUser.id, name: asyncUser.name });

    console.log('\n4. Cache warming:');
    
    const warmCache = async () => {
      console.log('  Warming cache with popular data...');
      
      const popularUsers = [
        { id: 1, name: 'Admin User', email: 'admin@example.com', popular: true },
        { id: 2, name: 'Support User', email: 'support@example.com', popular: true },
        { id: 3, name: 'Demo User', email: 'demo@example.com', popular: true }
      ];

      // Pre-load popular data
      for (const user of popularUsers) {
        await client.cache.set(`user:${user.id}`, user, 7200); // 2 hours
      }
      
      // Pre-compute common queries
      await client.cache.set('popular:users', popularUsers, 3600);
      
      console.log('  Cache warmed with popular data');
    };

    await warmCache();
    const popularUsers = await client.cache.get('popular:users');
    console.log('✅ Cache warming result:', { count: popularUsers?.length || 0 });

    console.log('\n5. Lazy loading pattern:');
    
    const lazyLoadData = async (key, loader) => {
      let data = await client.cache.get(key);
      
      if (!data) {
        console.log('  Lazy loading data...');
        data = await loader();
        await client.cache.set(key, data, 1800); // 30 minutes
      } else {
        console.log('  Data found in cache');
      }
      
      return data;
    };

    const expensiveDataLoader = async () => {
      // Simulate expensive computation
      await new Promise(resolve => setTimeout(resolve, 100));
      return {
        computed: true,
        result: Math.random() * 1000,
        computedAt: new Date().toISOString()
      };
    };

    const lazyData = await lazyLoadData('expensive:computation:1', expensiveDataLoader);
    console.log('✅ Lazy loading result:', { computed: lazyData.computed, result: lazyData.result });

    console.log('\n6. Cache stampede prevention:');
    
    const preventStampede = async (key, loader, ttl = 3600) => {
      const lockKey = `lock:${key}`;
      const lockTTL = 30; // 30 seconds lock
      
      // Try to acquire lock
      const lockAcquired = await client.cache.setIfNotExists(lockKey, 'locked', lockTTL);
      
      if (lockAcquired) {
        try {
          console.log('  Lock acquired, loading data...');
          const data = await loader();
          await client.cache.set(key, data, ttl);
          return data;
        } finally {
          // Release lock
          await client.cache.delete(lockKey);
        }
      } else {
        console.log('  Lock not acquired, waiting...');
        // Wait and retry or return cached data
        await new Promise(resolve => setTimeout(resolve, 100));
        const existingData = await client.cache.get(key);
        if (existingData) {
          return existingData;
        }
        // Retry if still no data
        return preventStampede(key, loader, ttl);
      }
    };

    const stampedeData = await preventStampede('stampede:test', async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return { protected: true, timestamp: new Date().toISOString() };
    });

    console.log('✅ Stampede prevention result:', stampedeData);

  } catch (error) {
    console.error('❌ Cache patterns failed:', error.message);
  }
}

async function demonstrateDistributedCaching(client) {
  console.log('\n🌐 Distributed Caching\n');
  console.log('==========================================');

  try {
    console.log('1. Multi-level caching:');
    
    const multiLevelCache = {
      async get(key) {
        // Level 1: In-memory cache (simulated)
        if (this.memoryCache?.[key]) {
          console.log('    L1 cache hit (memory)');
          return this.memoryCache[key];
        }
        
        // Level 2: Redis cache
        const redisData = await client.cache.get(key);
        if (redisData) {
          console.log('    L2 cache hit (Redis)');
          // Store in L1 for faster access
          this.memoryCache = this.memoryCache || {};
          this.memoryCache[key] = redisData;
          return redisData;
        }
        
        console.log('    Cache miss at all levels');
        return null;
      },
      
      async set(key, value, ttl) {
        // Store in both levels
        this.memoryCache = this.memoryCache || {};
        this.memoryCache[key] = value;
        await client.cache.set(key, value, ttl);
        console.log('    Data stored in multi-level cache');
      }
    };

    await multiLevelCache.set('ml:user:123', { name: 'Multi-level User' }, 3600);
    const mlUser1 = await multiLevelCache.get('ml:user:123'); // L2 hit
    const mlUser2 = await multiLevelCache.get('ml:user:123'); // L1 hit
    
    console.log('✅ Multi-level caching demonstrated');

    console.log('\n2. Cache partitioning:');
    
    const partitionedCache = {
      getPartition(key) {
        // Simple hash-based partitioning
        const hash = key.split('').reduce((a, b) => (a + b.charCodeAt(0)) % 4, 0);
        return `partition_${hash}`;
      },
      
      async set(key, value, ttl) {
        const partition = this.getPartition(key);
        const partitionedKey = `${partition}:${key}`;
        await client.cache.set(partitionedKey, value, ttl);
        return partition;
      },
      
      async get(key) {
        const partition = this.getPartition(key);
        const partitionedKey = `${partition}:${key}`;
        return client.cache.get(partitionedKey);
      }
    };

    const partition1 = await partitionedCache.set('user:111', { name: 'User 111' }, 3600);
    const partition2 = await partitionedCache.set('user:222', { name: 'User 222' }, 3600);
    const partition3 = await partitionedCache.set('user:333', { name: 'User 333' }, 3600);

    console.log('✅ Data partitioned across:', { partition1, partition2, partition3 });

    console.log('\n3. Consistent hashing simulation:');
    
    const consistentHashCache = {
      nodes: ['cache-node-1', 'cache-node-2', 'cache-node-3'],
      
      getNode(key) {
        // Simple consistent hashing simulation
        const hash = key.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        return this.nodes[hash % this.nodes.length];
      },
      
      async set(key, value, ttl) {
        const node = this.getNode(key);
        const nodeKey = `${node}:${key}`;
        await client.cache.set(nodeKey, { ...value, node }, ttl);
        return node;
      },
      
      async get(key) {
        const node = this.getNode(key);
        const nodeKey = `${node}:${key}`;
        return client.cache.get(nodeKey);
      }
    };

    const nodes = [];
    for (let i = 1; i <= 5; i++) {
      const node = await consistentHashCache.set(`item:${i}`, { id: i, data: `Item ${i}` }, 3600);
      nodes.push(node);
    }

    console.log('✅ Consistent hashing distribution:', {
      nodeDistribution: nodes.reduce((acc, node) => {
        acc[node] = (acc[node] || 0) + 1;
        return acc;
      }, {})
    });

    console.log('\n4. Cache replication:');
    
    const replicatedCache = {
      replicas: ['primary', 'replica1', 'replica2'],
      
      async set(key, value, ttl) {
        // Write to all replicas
        const writes = this.replicas.map(replica =>
          client.cache.set(`${replica}:${key}`, { ...value, replica }, ttl)
        );
        
        await Promise.all(writes);
        console.log(`    Data replicated to ${this.replicas.length} nodes`);
      },
      
      async get(key) {
        // Try primary first, then fallback to replicas
        for (const replica of this.replicas) {
          try {
            const data = await client.cache.get(`${replica}:${key}`);
            if (data) {
              console.log(`    Data retrieved from ${replica}`);
              return data;
            }
          } catch (error) {
            console.log(`    ${replica} unavailable, trying next...`);
          }
        }
        return null;
      }
    };

    await replicatedCache.set('replicated:data', { critical: true, timestamp: new Date().toISOString() }, 3600);
    const replicatedData = await replicatedCache.get('replicated:data');
    console.log('✅ Replicated cache result:', { critical: replicatedData?.critical, from: replicatedData?.replica });

    console.log('\n5. Cache federation:');
    
    const federatedCache = {
      regions: {
        'us-east': 'us-east-cache',
        'us-west': 'us-west-cache',
        'eu-west': 'eu-west-cache'
      },
      
      getUserRegion(userId) {
        // Simple region assignment based on user ID
        const regions = Object.keys(this.regions);
        return regions[userId % regions.length];
      },
      
      async set(userId, data, ttl) {
        const userRegion = this.getUserRegion(userId);
        const regionPrefix = this.regions[userRegion];
        
        // Store in user's primary region
        await client.cache.set(`${regionPrefix}:user:${userId}`, { ...data, region: userRegion }, ttl);
        
        // Optionally replicate to other regions for global data
        if (data.global) {
          const otherRegions = Object.entries(this.regions).filter(([region]) => region !== userRegion);
          await Promise.all(
            otherRegions.map(([region, prefix]) =>
              client.cache.set(`${prefix}:global:user:${userId}`, { ...data, region }, ttl)
            )
          );
        }
        
        return userRegion;
      },
      
      async get(userId) {
        const userRegion = this.getUserRegion(userId);
        const regionPrefix = this.regions[userRegion];
        return client.cache.get(`${regionPrefix}:user:${userId}`);
      }
    };

    const regions = [];
    for (let userId = 1; userId <= 3; userId++) {
      const region = await federatedCache.set(userId, {
        name: `User ${userId}`,
        global: userId === 1 // Make user 1 global
      }, 3600);
      regions.push({ userId, region });
    }

    console.log('✅ Federated cache distribution:', regions);

  } catch (error) {
    console.error('❌ Distributed caching failed:', error.message);
  }
}

async function demonstrateCacheInvalidation(client) {
  console.log('\n🔄 Cache Invalidation Strategies\n');
  console.log('==========================================');

  try {
    console.log('1. Time-based invalidation:');
    
    // Set data with different TTLs for different invalidation strategies
    await client.cache.set('time:short', { type: 'frequently_changing' }, 60); // 1 minute
    await client.cache.set('time:medium', { type: 'moderately_changing' }, 3600); // 1 hour
    await client.cache.set('time:long', { type: 'rarely_changing' }, 86400); // 1 day

    console.log('✅ Time-based invalidation set up');

    console.log('\n2. Event-based invalidation:');
    
    const eventBasedCache = {
      dependencies: new Map(),
      
      async set(key, value, ttl, dependencies = []) {
        await client.cache.set(key, value, ttl);
        
        // Track dependencies
        if (dependencies.length > 0) {
          this.dependencies.set(key, dependencies);
          
          // Create reverse mapping for efficient invalidation
          for (const dep of dependencies) {
            const dependents = await client.cache.get(`dep:${dep}`) || [];
            dependents.push(key);
            await client.cache.set(`dep:${dep}`, dependents, 7200);
          }
        }
      },
      
      async invalidate(event) {
        console.log(`    Invalidating caches for event: ${event}`);
        
        const dependents = await client.cache.get(`dep:${event}`) || [];
        const deletions = dependents.map(key => client.cache.delete(key));
        
        await Promise.all(deletions);
        await client.cache.delete(`dep:${event}`);
        
        return dependents.length;
      }
    };

    // Set cache with dependencies
    await eventBasedCache.set('user:profile:123', { name: 'John' }, 3600, ['user:123', 'profile:changed']);
    await eventBasedCache.set('user:settings:123', { theme: 'dark' }, 3600, ['user:123', 'settings:changed']);
    await eventBasedCache.set('user:posts:123', [], 3600, ['user:123', 'posts:changed']);

    // Invalidate all user:123 related caches
    const invalidated = await eventBasedCache.invalidate('user:123');
    console.log('✅ Event-based invalidation:', { invalidatedKeys: invalidated });

    console.log('\n3. Tag-based invalidation:');
    
    const tagBasedCache = {
      async setWithTags(key, value, ttl, tags = []) {
        // Store the main data
        await client.cache.set(key, value, ttl);
        
        // Store tags mapping
        for (const tag of tags) {
          const taggedKeys = await client.cache.get(`tag:${tag}`) || [];
          taggedKeys.push(key);
          await client.cache.set(`tag:${tag}`, [...new Set(taggedKeys)], ttl + 300);
        }
        
        // Store key's tags for cleanup
        await client.cache.set(`tags:${key}`, tags, ttl);
      },
      
      async invalidateByTag(tag) {
        console.log(`    Invalidating all caches with tag: ${tag}`);
        
        const taggedKeys = await client.cache.get(`tag:${tag}`) || [];
        const deletions = [];
        
        for (const key of taggedKeys) {
          deletions.push(client.cache.delete(key));
          deletions.push(client.cache.delete(`tags:${key}`));
        }
        
        deletions.push(client.cache.delete(`tag:${tag}`));
        await Promise.all(deletions);
        
        return taggedKeys.length;
      }
    };

    // Set caches with tags
    await tagBasedCache.setWithTags('product:1', { name: 'Laptop' }, 3600, ['electronics', 'computers', 'featured']);
    await tagBasedCache.setWithTags('product:2', { name: 'Mouse' }, 3600, ['electronics', 'accessories']);
    await tagBasedCache.setWithTags('product:3', { name: 'Keyboard' }, 3600, ['electronics', 'accessories', 'featured']);

    // Invalidate all electronics
    const electronicsInvalidated = await tagBasedCache.invalidateByTag('electronics');
    console.log('✅ Tag-based invalidation:', { tag: 'electronics', invalidated: electronicsInvalidated });

    console.log('\n4. Version-based invalidation:');
    
    const versionedCache = {
      async setWithVersion(key, value, ttl, version = 1) {
        const versionedKey = `${key}:v${version}`;
        await client.cache.set(versionedKey, { ...value, version }, ttl);
        
        // Store current version pointer
        await client.cache.set(`version:${key}`, version, ttl + 300);
        
        return version;
      },
      
      async get(key) {
        const currentVersion = await client.cache.get(`version:${key}`);
        if (!currentVersion) return null;
        
        const versionedKey = `${key}:v${currentVersion}`;
        return client.cache.get(versionedKey);
      },
      
      async incrementVersion(key) {
        const currentVersion = await client.cache.get(`version:${key}`) || 0;
        const newVersion = currentVersion + 1;
        
        await client.cache.set(`version:${key}`, newVersion, 7200);
        
        // Optional: clean up old versions
        for (let v = 1; v < newVersion; v++) {
          await client.cache.delete(`${key}:v${v}`);
        }
        
        return newVersion;
      }
    };

    // Set versioned data
    let version = await versionedCache.setWithVersion('config:app', { theme: 'light', lang: 'en' }, 3600);
    console.log('✅ Initial version:', version);

    // Update version (invalidates old data)
    version = await versionedCache.incrementVersion('config:app');
    await versionedCache.setWithVersion('config:app', { theme: 'dark', lang: 'en' }, 3600, version);
    
    const currentConfig = await versionedCache.get('config:app');
    console.log('✅ Version-based update:', { version: currentConfig?.version, theme: currentConfig?.theme });

    console.log('\n5. Write-through invalidation:');
    
    const writeThoughInvalidation = {
      relatedKeys: {
        'user:profile': ['user:summary', 'user:dashboard', 'user:preferences'],
        'user:settings': ['user:dashboard', 'user:preferences'],
        'user:posts': ['user:summary', 'user:dashboard']
      },
      
      async updateAndInvalidate(key, data, ttl) {
        // Update the main key
        await client.cache.set(key, data, ttl);
        
        // Find and invalidate related keys
        const related = this.relatedKeys[key.split(':').slice(0, 2).join(':')] || [];
        const invalidations = related.map(relatedKey => {
          const fullRelatedKey = relatedKey + ':' + key.split(':')[2]; // Add user ID
          return client.cache.delete(fullRelatedKey);
        });
        
        await Promise.all(invalidations);
        
        console.log(`    Updated ${key} and invalidated ${related.length} related keys`);
        return related.length;
      }
    };

    const invalidatedRelated = await writeThoughInvalidation.updateAndInvalidate(
      'user:profile:456',
      { name: 'Updated User', email: 'updated@example.com' },
      3600
    );

    console.log('✅ Write-through invalidation:', { relatedInvalidated: invalidatedRelated });

    console.log('\n6. Bulk invalidation patterns:');
    
    // Pattern-based invalidation
    const patternInvalidation = async (pattern) => {
      // Get all keys matching pattern (simplified - in real Redis you'd use SCAN)
      const allKeys = [
        'session:user:123', 'session:user:456', 'session:user:789',
        'temp:file:1', 'temp:file:2',
        'cache:data:old', 'cache:data:new'
      ];
      
      const matchingKeys = allKeys.filter(key => {
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace(/\*/g, '.*'));
          return regex.test(key);
        }
        return key.startsWith(pattern);
      });
      
      // Delete matching keys
      await Promise.all(matchingKeys.map(key => client.cache.delete(key)));
      
      return matchingKeys.length;
    };

    // Invalidate all sessions
    const sessionsInvalidated = await patternInvalidation('session:*');
    console.log('✅ Pattern invalidation:', { pattern: 'session:*', invalidated: sessionsInvalidated });

    // Invalidate temp files
    const tempInvalidated = await patternInvalidation('temp:');
    console.log('✅ Prefix invalidation:', { prefix: 'temp:', invalidated: tempInvalidated });

  } catch (error) {
    console.error('❌ Cache invalidation failed:', error.message);
  }
}

async function demonstrateCacheOptimization(client) {
  console.log('\n⚡ Cache Performance Optimization\n');
  console.log('==========================================');

  try {
    console.log('1. Compression for large objects:');
    
    const largeObject = {
      id: 'large_dataset',
      data: Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        description: `This is a detailed description for item ${i} with lots of text to make it larger`,
        metadata: {
          created: new Date().toISOString(),
          tags: [`tag${i}`, `category${i % 10}`, `type${i % 5}`],
          properties: {
            weight: Math.random() * 100,
            color: ['red', 'blue', 'green', 'yellow'][i % 4],
            available: Math.random() > 0.3
          }
        }
      })),
      summary: {
        totalItems: 1000,
        categories: 10,
        types: 5,
        generatedAt: new Date().toISOString()
      }
    };

    const originalSize = JSON.stringify(largeObject).length;
    
    // Store with compression flag (simulated)
    await client.cache.set('large:dataset', largeObject, 3600, {
      compress: true,
      compressionLevel: 6
    });

    const retrieved = await client.cache.get('large:dataset');
    console.log('✅ Large object compression:', {
      originalSize: originalSize,
      itemCount: retrieved?.data?.length,
      compressionEnabled: true
    });

    console.log('\n2. Memory-efficient operations:');
    
    // Pipeline operations to reduce round trips
    const pipelineOperations = async () => {
      const pipeline = [];
      
      // Queue multiple operations
      for (let i = 1; i <= 10; i++) {
        pipeline.push(client.cache.set(`batch:${i}`, { value: i * 10 }, 1800));
      }
      
      // Execute all at once
      const results = await Promise.all(pipeline);
      console.log('    Batched 10 SET operations');
      
      // Batch get operations
      const keys = Array.from({ length: 10 }, (_, i) => `batch:${i + 1}`);
      const batchResults = await client.cache.getMultiple(keys);
      
      return Object.keys(batchResults).length;
    };

    const pipelineCount = await pipelineOperations();
    console.log('✅ Pipeline optimization:', { operationsExecuted: pipelineCount });

    console.log('\n3. Connection pooling simulation:');
    
    const connectionPool = {
      activeConnections: 0,
      maxConnections: 5,
      
      async executeWithPooling(operation) {
        if (this.activeConnections >= this.maxConnections) {
          console.log('    Waiting for available connection...');
          await new Promise(resolve => setTimeout(resolve, 10));
          return this.executeWithPooling(operation);
        }
        
        this.activeConnections++;
        try {
          const result = await operation();
          return result;
        } finally {
          this.activeConnections--;
        }
      }
    };

    const pooledOperations = Array.from({ length: 8 }, (_, i) => 
      connectionPool.executeWithPooling(() => 
        client.cache.set(`pooled:${i}`, { data: `pooled data ${i}` }, 1800)
      )
    );

    await Promise.all(pooledOperations);
    console.log('✅ Connection pooling:', { operations: pooledOperations.length, maxPool: connectionPool.maxConnections });

    console.log('\n4. Cache warming strategies:');
    
    const cacheWarmingStrategies = {
      async preloadPopularData() {
        const popularData = [
          { key: 'popular:products', data: ['product1', 'product2', 'product3'] },
          { key: 'popular:categories', data: ['electronics', 'books', 'clothing'] },
          { key: 'popular:brands', data: ['brand1', 'brand2', 'brand3'] }
        ];
        
        const warming = popularData.map(item =>
          client.cache.set(item.key, item.data, 7200) // 2 hours
        );
        
        await Promise.all(warming);
        console.log('    Pre-loaded popular data');
      },
      
      async predictiveWarmup() {
        // Simulate predictive warming based on usage patterns
        const predictions = [
          'user:session:morning',
          'user:session:afternoon',
          'user:session:evening'
        ];
        
        const hour = new Date().getHours();
        const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
        
        // Warm up data for current time period
        await client.cache.set(`active:period`, timeOfDay, 3600);
        await client.cache.set(`predictions:${timeOfDay}`, { predicted: true, hour }, 3600);
        
        console.log(`    Predictive warmup for ${timeOfDay}`);
      }
    };

    await cacheWarmingStrategies.preloadPopularData();
    await cacheWarmingStrategies.predictiveWarmup();
    console.log('✅ Cache warming strategies executed');

    console.log('\n5. Memory usage optimization:');
    
    const memoryOptimization = {
      async compactKeys() {
        // Use shorter, more efficient keys
        const mappings = {
          'user:profile:settings:preferences': 'u:p:s:pr',
          'application:configuration:database': 'a:c:db',
          'session:temporary:data:storage': 's:t:d:st'
        };
        
        for (const [longKey, shortKey] of Object.entries(mappings)) {
          await client.cache.set(shortKey, { compacted: true, originalKey: longKey }, 3600);
        }
        
        return Object.keys(mappings).length;
      },
      
      async optimizeDataStructures() {
        // Use more compact data representations
        const optimizedUser = {
          i: 123, // id
          n: 'John Doe', // name
          e: 'john@example.com', // email
          a: 1, // active (1 instead of true)
          c: Date.now(), // created timestamp instead of ISO string
          p: ['r', 'w'] // permissions array shortened
        };
        
        await client.cache.set('opt:u:123', optimizedUser, 3600);
        
        return optimizedUser;
      }
    };

    const compactedKeys = await memoryOptimization.compactKeys();
    const optimizedData = await memoryOptimization.optimizeDataStructures();
    
    console.log('✅ Memory optimization:', {
      compactedKeys,
      optimizedFieldCount: Object.keys(optimizedData).length
    });

    console.log('\n6. Performance monitoring:');
    
    const performanceMonitoring = {
      async measureCachePerformance() {
        const metrics = {
          operations: 0,
          totalTime: 0,
          hits: 0,
          misses: 0
        };
        
        const testOperations = [
          { key: 'perf:test:1', exists: false },
          { key: 'perf:test:2', exists: true },
          { key: 'perf:test:3', exists: false }
        ];
        
        // Set up one existing key
        await client.cache.set('perf:test:2', { data: 'exists' }, 3600);
        
        for (const op of testOperations) {
          const startTime = Date.now();
          const result = await client.cache.get(op.key);
          const endTime = Date.now();
          
          metrics.operations++;
          metrics.totalTime += (endTime - startTime);
          
          if (result !== null) {
            metrics.hits++;
          } else {
            metrics.misses++;
          }
        }
        
        metrics.avgResponseTime = metrics.totalTime / metrics.operations;
        metrics.hitRate = metrics.hits / metrics.operations;
        
        return metrics;
      }
    };

    const perfMetrics = await performanceMonitoring.measureCachePerformance();
    console.log('✅ Performance metrics:', {
      avgResponseTime: perfMetrics.avgResponseTime.toFixed(2) + 'ms',
      hitRate: (perfMetrics.hitRate * 100).toFixed(1) + '%',
      operations: perfMetrics.operations
    });

  } catch (error) {
    console.error('❌ Cache optimization failed:', error.message);
  }
}

async function demonstrateCacheAnalytics(client) {
  console.log('\n📊 Cache Analytics & Monitoring\n');
  console.log('==========================================');

  try {
    console.log('1. Cache hit/miss analytics:');
    
    // Simulate cache operations with tracking
    const analytics = {
      hits: 0,
      misses: 0,
      operations: [],
      
      async trackGet(key) {
        const startTime = Date.now();
        const result = await client.cache.get(key);
        const endTime = Date.now();
        
        const operation = {
          key,
          type: 'GET',
          hit: result !== null,
          responseTime: endTime - startTime,
          timestamp: new Date().toISOString()
        };
        
        this.operations.push(operation);
        
        if (operation.hit) {
          this.hits++;
        } else {
          this.misses++;
        }
        
        return result;
      },
      
      getMetrics() {
        const totalOps = this.operations.length;
        const avgResponseTime = this.operations.reduce((sum, op) => sum + op.responseTime, 0) / totalOps;
        const hitRate = this.hits / totalOps;
        
        return {
          totalOperations: totalOps,
          hits: this.hits,
          misses: this.misses,
          hitRate: hitRate,
          avgResponseTime: avgResponseTime
        };
      }
    };

    // Set up some test data
    await client.cache.set('analytics:key1', 'value1', 3600);
    await client.cache.set('analytics:key2', 'value2', 3600);
    // analytics:key3 doesn't exist

    // Perform tracked operations
    await analytics.trackGet('analytics:key1'); // hit
    await analytics.trackGet('analytics:key2'); // hit
    await analytics.trackGet('analytics:key3'); // miss
    await analytics.trackGet('analytics:key1'); // hit
    await analytics.trackGet('analytics:key4'); // miss

    const metrics = analytics.getMetrics();
    console.log('✅ Cache analytics:', {
      hitRate: (metrics.hitRate * 100).toFixed(1) + '%',
      avgResponseTime: metrics.avgResponseTime.toFixed(2) + 'ms',
      totalOps: metrics.totalOperations
    });

    console.log('\n2. Memory usage monitoring:');
    
    const memoryMonitoring = {
      async getMemoryStats() {
        // Simulate memory usage calculation
        const stats = {
          totalKeys: 0,
          estimatedMemoryUsage: 0,
          keysByType: {},
          largestKeys: []
        };
        
        // Sample keys to analyze
        const sampleKeys = [
          'analytics:key1', 'analytics:key2', 'user:123:profile',
          'session:abc123', 'large:dataset'
        ];
        
        for (const key of sampleKeys) {
          const value = await client.cache.get(key);
          if (value !== null) {
            stats.totalKeys++;
            
            const serialized = JSON.stringify(value);
            const size = serialized.length;
            stats.estimatedMemoryUsage += size;
            
            const keyType = key.split(':')[0];
            stats.keysByType[keyType] = (stats.keysByType[keyType] || 0) + 1;
            
            stats.largestKeys.push({ key, size });
          }
        }
        
        // Sort by size
        stats.largestKeys.sort((a, b) => b.size - a.size);
        stats.largestKeys = stats.largestKeys.slice(0, 3);
        
        return stats;
      }
    };

    const memoryStats = await memoryMonitoring.getMemoryStats();
    console.log('✅ Memory monitoring:', {
      totalKeys: memoryStats.totalKeys,
      estimatedMemory: memoryStats.estimatedMemoryUsage + ' bytes',
      keyTypes: memoryStats.keysByType,
      largestKey: memoryStats.largestKeys[0]?.key
    });

    console.log('\n3. Cache performance trends:');
    
    const performanceTrends = {
      async simulateTimeSeriesData() {
        const trends = [];
        const hours = 24;
        
        for (let i = 0; i < hours; i++) {
          // Simulate varying load throughout the day
          const baseLoad = 100;
          const peakMultiplier = Math.sin((i - 6) * Math.PI / 12) * 0.5 + 1;
          const requests = Math.floor(baseLoad * peakMultiplier);
          const hitRate = 0.7 + Math.random() * 0.25; // 70-95% hit rate
          const avgResponseTime = 5 + Math.random() * 15; // 5-20ms
          
          trends.push({
            hour: i,
            requests,
            hitRate: hitRate,
            avgResponseTime: avgResponseTime,
            throughput: requests * hitRate
          });
        }
        
        return trends;
      },
      
      analyzePerformance(trends) {
        const peakHour = trends.reduce((max, current) => 
          current.requests > max.requests ? current : max
        );
        
        const avgHitRate = trends.reduce((sum, t) => sum + t.hitRate, 0) / trends.length;
        const avgResponseTime = trends.reduce((sum, t) => sum + t.avgResponseTime, 0) / trends.length;
        
        return {
          peakHour: peakHour.hour,
          peakRequests: peakHour.requests,
          avgHitRate: avgHitRate,
          avgResponseTime: avgResponseTime
        };
      }
    };

    const trends = await performanceTrends.simulateTimeSeriesData();
    const analysis = performanceTrends.analyzePerformance(trends);
    
    console.log('✅ Performance trends:', {
      peakHour: analysis.peakHour + ':00',
      peakRequests: analysis.peakRequests,
      avgHitRate: (analysis.avgHitRate * 100).toFixed(1) + '%',
      avgResponseTime: analysis.avgResponseTime.toFixed(1) + 'ms'
    });

    console.log('\n4. Cache health monitoring:');
    
    const healthMonitoring = {
      async checkCacheHealth() {
        const healthChecks = {
          connectivity: false,
          responseTime: 0,
          memoryPressure: false,
          errorRate: 0,
          warnings: []
        };
        
        try {
          // Test connectivity
          const startTime = Date.now();
          await client.cache.set('health:check', 'ok', 60);
          const result = await client.cache.get('health:check');
          const endTime = Date.now();
          
          healthChecks.connectivity = result === 'ok';
          healthChecks.responseTime = endTime - startTime;
          
          // Simulate health checks
          if (healthChecks.responseTime > 100) {
            healthChecks.warnings.push('High response time detected');
          }
          
          // Simulate memory check
          const memoryUsage = Math.random();
          healthChecks.memoryPressure = memoryUsage > 0.8;
          if (healthChecks.memoryPressure) {
            healthChecks.warnings.push('High memory usage detected');
          }
          
          // Clean up
          await client.cache.delete('health:check');
          
        } catch (error) {
          healthChecks.connectivity = false;
          healthChecks.errorRate = 1.0;
          healthChecks.warnings.push(`Connection error: ${error.message}`);
        }
        
        return healthChecks;
      }
    };

    const healthStatus = await healthMonitoring.checkCacheHealth();
    console.log('✅ Cache health status:', {
      connectivity: healthStatus.connectivity ? '✅ OK' : '❌ FAIL',
      responseTime: healthStatus.responseTime + 'ms',
      memoryPressure: healthStatus.memoryPressure ? '⚠️  HIGH' : '✅ NORMAL',
      warnings: healthStatus.warnings.length
    });

    console.log('\n5. Alert system:');
    
    const alertSystem = {
      thresholds: {
        hitRate: 0.7, // 70%
        responseTime: 50, // 50ms
        errorRate: 0.1 // 10%
      },
      
      checkAlerts(metrics) {
        const alerts = [];
        
        if (metrics.hitRate < this.thresholds.hitRate) {
          alerts.push({
            type: 'LOW_HIT_RATE',
            severity: 'warning',
            message: `Hit rate ${(metrics.hitRate * 100).toFixed(1)}% below threshold ${(this.thresholds.hitRate * 100)}%`,
            value: metrics.hitRate,
            threshold: this.thresholds.hitRate
          });
        }
        
        if (metrics.avgResponseTime > this.thresholds.responseTime) {
          alerts.push({
            type: 'HIGH_RESPONSE_TIME',
            severity: 'warning',
            message: `Response time ${metrics.avgResponseTime.toFixed(1)}ms above threshold ${this.thresholds.responseTime}ms`,
            value: metrics.avgResponseTime,
            threshold: this.thresholds.responseTime
          });
        }
        
        return alerts;
      }
    };

    const alerts = alertSystem.checkAlerts(metrics);
    console.log('✅ Alert system:', {
      alertsTriggered: alerts.length,
      alerts: alerts.map(a => ({ type: a.type, severity: a.severity }))
    });

    console.log('\n6. Custom metrics dashboard:');
    
    const dashboard = {
      async generateDashboardData() {
        return {
          overview: {
            totalOperations: metrics.totalOperations,
            hitRate: (metrics.hitRate * 100).toFixed(1) + '%',
            avgResponseTime: metrics.avgResponseTime.toFixed(2) + 'ms',
            status: healthStatus.connectivity ? 'healthy' : 'unhealthy'
          },
          performance: {
            peakHour: analysis.peakHour,
            peakRequests: analysis.peakRequests,
            dailyAvgHitRate: (analysis.avgHitRate * 100).toFixed(1) + '%'
          },
          memory: {
            totalKeys: memoryStats.totalKeys,
            estimatedUsage: memoryStats.estimatedMemoryUsage + ' bytes',
            keyDistribution: memoryStats.keysByType
          },
          alerts: {
            active: alerts.length,
            warnings: healthStatus.warnings.length
          },
          lastUpdated: new Date().toISOString()
        };
      }
    };

    const dashboardData = await dashboard.generateDashboardData();
    console.log('✅ Dashboard data generated:', {
      overview: dashboardData.overview,
      activeAlerts: dashboardData.alerts.active,
      memoryKeys: dashboardData.memory.totalKeys
    });

  } catch (error) {
    console.error('❌ Cache analytics failed:', error.message);
  }
}

async function demonstrateAdvancedCaching(client) {
  console.log('\n🚀 Advanced Caching Patterns\n');
  console.log('==========================================');

  try {
    console.log('1. Circuit breaker pattern:');
    
    const circuitBreaker = {
      state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
      failureCount: 0,
      threshold: 3,
      timeout: 5000, // 5 seconds
      lastFailureTime: 0,
      
      async execute(operation) {
        if (this.state === 'OPEN') {
          if (Date.now() - this.lastFailureTime > this.timeout) {
            this.state = 'HALF_OPEN';
            console.log('    Circuit breaker: HALF_OPEN');
          } else {
            throw new Error('Circuit breaker is OPEN');
          }
        }
        
        try {
          const result = await operation();
          
          if (this.state === 'HALF_OPEN') {
            this.state = 'CLOSED';
            this.failureCount = 0;
            console.log('    Circuit breaker: CLOSED (recovered)');
          }
          
          return result;
          
        } catch (error) {
          this.failureCount++;
          this.lastFailureTime = Date.now();
          
          if (this.failureCount >= this.threshold) {
            this.state = 'OPEN';
            console.log('    Circuit breaker: OPEN');
          }
          
          throw error;
        }
      }
    };

    // Test circuit breaker
    let attempts = 0;
    while (attempts < 5) {
      try {
        await circuitBreaker.execute(async () => {
          // Simulate unreliable operation
          if (Math.random() < 0.7 && attempts < 3) { // Fail first 3 attempts
            throw new Error('Simulated failure');
          }
          return client.cache.set(`cb:test:${attempts}`, { success: true }, 300);
        });
        console.log(`✅ Circuit breaker attempt ${attempts + 1}: SUCCESS`);
      } catch (error) {
        console.log(`❌ Circuit breaker attempt ${attempts + 1}: ${error.message}`);
      }
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n2. Bloom filter for cache existence:');
    
    // Simplified bloom filter implementation
    const bloomFilter = {
      bitArray: new Array(1000).fill(false),
      
      hash1(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff;
        }
        return Math.abs(hash) % this.bitArray.length;
      },
      
      hash2(str) {
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
          hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
        }
        return Math.abs(hash) % this.bitArray.length;
      },
      
      add(key) {
        this.bitArray[this.hash1(key)] = true;
        this.bitArray[this.hash2(key)] = true;
      },
      
      mightExist(key) {
        return this.bitArray[this.hash1(key)] && this.bitArray[this.hash2(key)];
      },
      
      async getWithBloom(key) {
        if (!this.mightExist(key)) {
          console.log(`    Bloom filter: ${key} definitely doesn't exist`);
          return null;
        }
        
        console.log(`    Bloom filter: ${key} might exist, checking cache...`);
        const result = await client.cache.get(key);
        
        if (result !== null) {
          this.add(key); // Ensure it's in bloom filter
        }
        
        return result;
      }
    };

    // Add some keys to bloom filter
    await client.cache.set('bloom:exists:1', 'data1', 300);
    bloomFilter.add('bloom:exists:1');
    
    // Test bloom filter
    const bloomTest1 = await bloomFilter.getWithBloom('bloom:exists:1'); // exists
    const bloomTest2 = await bloomFilter.getWithBloom('bloom:missing:1'); // doesn't exist
    
    console.log('✅ Bloom filter test:', {
      existing: bloomTest1 !== null,
      missing: bloomTest2 === null
    });

    console.log('\n3. Read-through cache with fallback:');
    
    const readThroughCache = {
      dataSources: [
        {
          name: 'primary',
          fetch: async (key) => {
            // Simulate primary data source
            if (key.includes('primary')) {
              return { data: `Primary data for ${key}`, source: 'primary' };
            }
            return null;
          }
        },
        {
          name: 'secondary',
          fetch: async (key) => {
            // Simulate secondary data source
            return { data: `Secondary data for ${key}`, source: 'secondary' };
          }
        }
      ],
      
      async get(key) {
        // Try cache first
        let data = await client.cache.get(key);
        if (data) {
          console.log(`    Cache hit for ${key}`);
          return { ...data, cached: true };
        }
        
        // Try data sources in order
        for (const source of this.dataSources) {
          try {
            data = await source.fetch(key);
            if (data) {
              console.log(`    Data fetched from ${source.name}`);
              // Cache the result
              await client.cache.set(key, data, 1800);
              return data;
            }
          } catch (error) {
            console.log(`    ${source.name} failed: ${error.message}`);
          }
        }
        
        return null;
      }
    };

    const readThrough1 = await readThroughCache.get('primary:user:123');
    const readThrough2 = await readThroughCache.get('secondary:user:456');
    const readThrough3 = await readThroughCache.get('primary:user:123'); // Should hit cache
    
    console.log('✅ Read-through cache:', {
      primary: readThrough1?.source,
      secondary: readThrough2?.source,
      cached: readThrough3?.cached
    });

    console.log('\n4. Intelligent cache prefetching:');
    
    const intelligentPrefetch = {
      accessPatterns: new Map(),
      
      recordAccess(key) {
        const now = Date.now();
        const pattern = this.accessPatterns.get(key) || { accesses: [], frequency: 0 };
        
        pattern.accesses.push(now);
        pattern.frequency++;
        
        // Keep only recent accesses (last hour)
        pattern.accesses = pattern.accesses.filter(time => now - time < 3600000);
        
        this.accessPatterns.set(key, pattern);
      },
      
      predictNext(key) {
        // Simple prediction: if user accesses user:123, they might access user:124
        const predictions = [];
        
        if (key.startsWith('user:')) {
          const userId = parseInt(key.split(':')[1]);
          if (!isNaN(userId)) {
            predictions.push(`user:${userId + 1}`);
            predictions.push(`user:${userId - 1}`);
            predictions.push(`profile:${userId}`);
          }
        }
        
        return predictions;
      },
      
      async accessWithPrefetch(key) {
        this.recordAccess(key);
        
        // Get requested data
        let data = await client.cache.get(key);
        if (!data) {
          // Simulate data fetch
          data = { data: `Data for ${key}`, fetchedAt: new Date().toISOString() };
          await client.cache.set(key, data, 1800);
        }
        
        // Prefetch predicted keys in background
        const predictions = this.predictNext(key);
        predictions.forEach(async (predictedKey) => {
          const exists = await client.cache.exists(predictedKey);
          if (!exists) {
            console.log(`    Prefetching: ${predictedKey}`);
            const prefetchData = { data: `Prefetched data for ${predictedKey}`, prefetched: true };
            await client.cache.set(predictedKey, prefetchData, 1800);
          }
        });
        
        return data;
      }
    };

    await intelligentPrefetch.accessWithPrefetch('user:100');
    await intelligentPrefetch.accessWithPrefetch('user:101'); // Should benefit from prefetch
    
    console.log('✅ Intelligent prefetching demonstrated');

    console.log('\n5. Cache mesh/federation:');
    
    const cacheMesh = {
      nodes: [
        { id: 'node1', region: 'us-east', prefix: 'use1' },
        { id: 'node2', region: 'us-west', prefix: 'usw1' },
        { id: 'node3', region: 'eu-west', prefix: 'euw1' }
      ],
      
      getClosestNode(userRegion = 'us-east') {
        // Simple region matching
        const regionMap = {
          'us-east': 'use1',
          'us-west': 'usw1',
          'eu-west': 'euw1'
        };
        return regionMap[userRegion] || 'use1';
      },
      
      async distributedGet(key, userRegion) {
        const primaryNode = this.getClosestNode(userRegion);
        const primaryKey = `${primaryNode}:${key}`;
        
        // Try primary node first
        let data = await client.cache.get(primaryKey);
        if (data) {
          console.log(`    Found in primary node: ${primaryNode}`);
          return data;
        }
        
        // Try other nodes
        for (const node of this.nodes) {
          if (node.prefix !== primaryNode) {
            const nodeKey = `${node.prefix}:${key}`;
            data = await client.cache.get(nodeKey);
            if (data) {
              console.log(`    Found in remote node: ${node.prefix}`);
              // Optionally replicate to primary node
              await client.cache.set(primaryKey, data, 1800);
              return data;
            }
          }
        }
        
        return null;
      },
      
      async distributedSet(key, value, ttl, userRegion) {
        const primaryNode = this.getClosestNode(userRegion);
        const primaryKey = `${primaryNode}:${key}`;
        
        // Store in primary node
        await client.cache.set(primaryKey, value, ttl);
        
        // Optionally replicate to geographically close nodes
        const replicationTargets = this.nodes.filter(n => n.prefix !== primaryNode).slice(0, 1);
        for (const target of replicationTargets) {
          await client.cache.set(`${target.prefix}:${key}`, value, ttl);
        }
        
        return { primary: primaryNode, replicated: replicationTargets.map(t => t.prefix) };
      }
    };

    const meshResult1 = await cacheMesh.distributedSet('mesh:data:1', { global: true }, 1800, 'us-east');
    const meshResult2 = await cacheMesh.distributedGet('mesh:data:1', 'us-west');
    
    console.log('✅ Cache mesh:', {
      stored: meshResult1,
      retrieved: meshResult2 !== null
    });

    console.log('\n6. Adaptive caching:');
    
    const adaptiveCache = {
      keyStats: new Map(),
      
      recordAccess(key, hit) {
        const stats = this.keyStats.get(key) || {
          accesses: 0,
          hits: 0,
          lastAccess: 0,
          computeCost: 1,
          size: 100
        };
        
        stats.accesses++;
        if (hit) stats.hits++;
        stats.lastAccess = Date.now();
        
        this.keyStats.set(key, stats);
      },
      
      calculateOptimalTTL(key) {
        const stats = this.keyStats.get(key);
        if (!stats) return 3600; // Default 1 hour
        
        const hitRate = stats.hits / stats.accesses;
        const recency = Date.now() - stats.lastAccess;
        
        // Higher hit rate and recent access = longer TTL
        const baseTTL = 3600; // 1 hour
        const hitRateMultiplier = hitRate * 2; // 0-2x
        const recencyMultiplier = Math.max(0.1, 1 - (recency / 86400000)); // Decay over 24 hours
        
        return Math.floor(baseTTL * hitRateMultiplier * recencyMultiplier);
      },
      
      async adaptiveGet(key) {
        const hit = await client.cache.get(key) !== null;
        this.recordAccess(key, hit);
        
        if (!hit) {
          // Generate data and set with adaptive TTL
          const data = { adaptive: true, key, generatedAt: new Date().toISOString() };
          const optimalTTL = this.calculateOptimalTTL(key);
          
          await client.cache.set(key, data, optimalTTL);
          console.log(`    Adaptive TTL for ${key}: ${optimalTTL}s`);
          
          return data;
        }
        
        return client.cache.get(key);
      }
    };

    // Simulate different access patterns
    await adaptiveCache.adaptiveGet('adaptive:hot:key'); // First access
    await adaptiveCache.adaptiveGet('adaptive:hot:key'); // Second access
    await adaptiveCache.adaptiveGet('adaptive:cold:key'); // Cold key
    
    console.log('✅ Adaptive caching demonstrated');

  } catch (error) {
    console.error('❌ Advanced caching patterns failed:', error.message);
  }
}

// Promise-based cache example
function promiseBasedCacheExample() {
  console.log('\n🔄 Promise-based Cache Operations\n');

  const client = new FluxezClient(API_KEY, {
    
    debug: false
  });

  return client.cache.set('promise:key', { message: 'Promise-based caching' }, 300)
    .then(() => {
      console.log('✅ Promise cache set');
      return client.cache.get('promise:key');
    })
    .then(data => {
      console.log('✅ Promise cache get:', data?.message);
      return client.cache.setMultiple({
        'promise:key1': 'value1',
        'promise:key2': 'value2',
        'promise:key3': 'value3'
      });
    })
    .then(() => {
      console.log('✅ Promise multiple set');
      return client.cache.getMultiple(['promise:key1', 'promise:key2']);
    })
    .then(results => {
      console.log('✅ Promise multiple get:', Object.keys(results).length, 'keys');
    })
    .catch(error => {
      console.error('❌ Promise chain failed:', error.message);
    });
}

// Run the examples
if (require.main === module) {
  console.log('🌟 Running Fluxez SDK Cache Examples\n');
  
  cacheExamplesMain()
    .then(() => {
      setTimeout(() => {
        console.log('\n' + '='.repeat(50));
        promiseBasedCacheExample();
      }, 2000);
    })
    .catch(console.error);
}

// Export for use in other files
module.exports = {
  cacheExamplesMain,
  demonstrateBasicCacheOperations,
  demonstrateTTLManagement,
  demonstrateCachePatterns,
  demonstrateDistributedCaching,
  demonstrateCacheInvalidation,
  demonstrateCacheOptimization,
  demonstrateCacheAnalytics,
  demonstrateAdvancedCaching,
  promiseBasedCacheExample
};