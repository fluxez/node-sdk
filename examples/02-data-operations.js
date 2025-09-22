/**
 * Fluxez SDK - Data Operations Example
 * 
 * This example demonstrates comprehensive database operations using the Fluxez SDK.
 * Perfect for backend developers and data management scenarios.
 * 
 * Features demonstrated:
 * - Raw SQL queries (SELECT, INSERT, UPDATE, DELETE)
 * - Natural language queries
 * - Query builder patterns
 * - Transaction management
 * - Batch operations
 * - Error handling and recovery
 * 
 * Time to complete: ~10 minutes
 */

const { FluxezClient } = require('@fluxez/node-sdk');

// Configuration
const API_KEY = process.env.FLUXEZ_API_KEY || 'cgx_your_api_key_here';
const API_URL = process.env.FLUXEZ_API_URL || 'https://api.fluxez.com/api/v1';

async function dataOperationsExample() {
  console.log('📊 Fluxez SDK Data Operations Example\n');

  const client = new FluxezClient(API_KEY, {
    apiUrl: API_URL,
    debug: true,
    timeout: 45000, // Longer timeout for complex queries
  });

  try {
    // Test connection first
    const connectionTest = await client.testConnection();
    if (!connectionTest.connected) {
      throw new Error('Cannot connect to backend. Please ensure the Fluxez backend is running.');
    }
    console.log('✅ Connected to Fluxez backend\n');

    // Set context for multi-tenant operations
    client.setOrganization('org_data_demo');
    client.setProject('proj_data_demo');

    await demonstrateRawSQLQueries(client);
    await demonstrateQueryBuilder(client);
    await demonstrateNaturalLanguageQueries(client);
    await demonstrateCRUDOperations(client);
    await demonstrateTransactions(client);
    await demonstrateBatchOperations(client);
    await demonstrateErrorHandling(client);

    console.log('\n🎉 Data Operations Example Complete!');

  } catch (error) {
    console.error('❌ Data operations example failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Ensure your backend is running with database access');
    console.log('- Check that your API key has the necessary permissions');
    console.log('- Verify that a project database has been created');
  }
}

async function demonstrateRawSQLQueries(client) {
  console.log('🔍 Raw SQL Queries\n');
  console.log('==========================================');

  try {
    // Basic SELECT query
    console.log('1. Database version check:');
    const versionResult = await client.raw('SELECT version() as db_version, now() as current_time');
    console.log('✅ Result:', {
      version: versionResult.rows[0]?.db_version?.substring(0, 50) + '...',
      time: versionResult.rows[0]?.current_time
    });

    // Query with parameters (safe from SQL injection)
    console.log('\n2. Parameterized query:');
    const paramResult = await client.raw(
      'SELECT $1 as message, $2 as number, $3 as timestamp',
      ['Hello from Fluxez!', 42, new Date().toISOString()]
    );
    console.log('✅ Result:', paramResult.rows[0]);

    // Try to query existing tables (this might fail if no tables exist yet)
    console.log('\n3. Table existence check:');
    try {
      const tablesResult = await client.raw(`
        SELECT table_name, table_type 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name 
        LIMIT 10
      `);
      console.log('✅ Available tables:', tablesResult.rows);
      return tablesResult.rows.length > 0; // Return true if tables exist
    } catch (error) {
      console.log('⚠️  No accessible tables found (this is normal for new projects)');
      return false;
    }

  } catch (error) {
    console.error('❌ Raw SQL queries failed:', error.message);
    return false;
  }
}

async function demonstrateQueryBuilder(client) {
  console.log('\n🏗️  Query Builder Patterns\n');
  console.log('==========================================');

  try {
    // Note: These examples show the query builder syntax
    // They may fail if the tables don't exist, which is normal

    console.log('1. Simple SELECT with query builder:');
    try {
      const users = await client.query
        .select(['id', 'email', 'name'])
        .from('users')
        .where('active', true)
        .orderBy('created_at', 'desc')
        .limit(10)
        .execute();
      console.log('✅ Users query result:', users);
    } catch (error) {
      console.log('⚠️  Users table query failed (table may not exist):', error.message);
      
      // Show what the query would look like
      const queryInfo = client.query
        .select(['id', 'email', 'name'])
        .from('users')
        .where('active', true)
        .orderBy('created_at', 'desc')
        .limit(10)
        .toSQL();
      console.log('📝 Generated SQL would be:', queryInfo);
    }

    console.log('\n2. Complex JOIN query:');
    try {
      const joinResult = await client.query
        .select(['u.email', 'p.name as profile_name', 'o.name as org_name'])
        .from('users', 'u')
        .join('profiles', 'p', 'u.id', 'p.user_id')
        .leftJoin('organizations', 'o', 'u.organization_id', 'o.id')
        .where('u.active', true)
        .where('p.verified', true)
        .orderBy('u.created_at', 'desc')
        .limit(5)
        .execute();
      console.log('✅ JOIN query result:', joinResult);
    } catch (error) {
      console.log('⚠️  JOIN query failed (tables may not exist):', error.message);
    }

    console.log('\n3. Aggregation query:');
    try {
      const aggregateResult = await client.query
        .select(['status', { count: 'COUNT(*)' }])
        .from('orders')
        .where('created_at', '>', '2024-01-01')
        .groupBy('status')
        .having('COUNT(*)', '>', 0)
        .orderBy('count', 'desc')
        .execute();
      console.log('✅ Aggregation result:', aggregateResult);
    } catch (error) {
      console.log('⚠️  Aggregation query failed (table may not exist):', error.message);
    }

  } catch (error) {
    console.error('❌ Query builder demonstration failed:', error.message);
  }
}

async function demonstrateNaturalLanguageQueries(client) {
  console.log('\n🤖 Natural Language Queries\n');
  console.log('==========================================');

  try {
    const naturalQueries = [
      'What is the current database version?',
      'Show me the current time and date',
      'Count how many tables are in the public schema',
      'Get the list of all database schemas',
      'Show me database configuration settings'
    ];

    for (let i = 0; i < naturalQueries.length; i++) {
      const query = naturalQueries[i];
      console.log(`${i + 1}. Natural query: "${query}"`);
      
      try {
        const result = await client.natural(query);
        console.log('✅ Result:', result.rows ? result.rows.slice(0, 3) : result);
      } catch (error) {
        console.log('⚠️  Query failed:', error.message);
      }
      
      // Add small delay between queries
      if (i < naturalQueries.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Natural language with context
    console.log('\n🎯 Natural language with context:');
    const contextQuery = await client.natural(
      'How many records are in the users table?',
      'I want to know the total count of user records for analytics purposes'
    );
    console.log('✅ Context-aware result:', contextQuery);

  } catch (error) {
    console.error('❌ Natural language queries failed:', error.message);
  }
}

async function demonstrateCRUDOperations(client) {
  console.log('\n✏️  CRUD Operations\n');
  console.log('==========================================');

  try {
    // Create a demo table first (this might fail if it already exists)
    console.log('1. Creating demo table:');
    try {
      await client.execute(`
        CREATE TABLE IF NOT EXISTS demo_products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          price DECIMAL(10, 2),
          category VARCHAR(100),
          in_stock BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Demo table created or already exists');
    } catch (error) {
      console.log('⚠️  Table creation failed:', error.message);
      return; // Skip CRUD if we can't create table
    }

    // INSERT operations
    console.log('\n2. INSERT operations:');
    
    // Single insert
    const insertResult = await client.execute(`
      INSERT INTO demo_products (name, price, category, in_stock) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, name
    `, ['Fluxez T-Shirt', 29.99, 'Apparel', true]);
    console.log('✅ Single insert result:', insertResult.rows[0]);

    // Batch insert
    const batchInsertResult = await client.execute(`
      INSERT INTO demo_products (name, price, category, in_stock) VALUES 
      ('Fluxez Mug', 14.99, 'Accessories', true),
      ('Fluxez Sticker Pack', 5.99, 'Accessories', true),
      ('Fluxez Hoodie', 49.99, 'Apparel', false)
      RETURNING id, name, price
    `);
    console.log('✅ Batch insert result:', batchInsertResult.rows);

    // SELECT operations
    console.log('\n3. SELECT operations:');
    const selectResult = await client.raw(`
      SELECT id, name, price, category, in_stock, created_at 
      FROM demo_products 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    console.log('✅ All products:', selectResult.rows);

    // UPDATE operations
    console.log('\n4. UPDATE operations:');
    if (selectResult.rows.length > 0) {
      const productId = selectResult.rows[0].id;
      const updateResult = await client.execute(`
        UPDATE demo_products 
        SET price = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2 
        RETURNING id, name, price
      `, [39.99, productId]);
      console.log('✅ Update result:', updateResult.rows[0]);
    }

    // DELETE operations
    console.log('\n5. DELETE operations:');
    const deleteResult = await client.execute(`
      DELETE FROM demo_products 
      WHERE category = $1 AND price < $2 
      RETURNING id, name
    `, ['Accessories', 10.00]);
    console.log('✅ Delete result:', deleteResult.rows);

    // Final count
    const countResult = await client.raw('SELECT COUNT(*) as total FROM demo_products');
    console.log('✅ Final product count:', countResult.rows[0]);

  } catch (error) {
    console.error('❌ CRUD operations failed:', error.message);
  }
}

async function demonstrateTransactions(client) {
  console.log('\n🔄 Transaction Management\n');
  console.log('==========================================');

  try {
    console.log('1. Successful transaction:');
    
    // Begin transaction
    await client.execute('BEGIN');
    
    try {
      // Multiple operations in transaction
      await client.execute(`
        INSERT INTO demo_products (name, price, category) 
        VALUES ('Transaction Product 1', 19.99, 'Test')
      `);
      
      await client.execute(`
        INSERT INTO demo_products (name, price, category) 
        VALUES ('Transaction Product 2', 24.99, 'Test')
      `);
      
      // Check the changes (within transaction)
      const transactionResult = await client.raw(`
        SELECT COUNT(*) as count FROM demo_products WHERE category = 'Test'
      `);
      console.log('✅ Products added in transaction:', transactionResult.rows[0]);
      
      // Commit transaction
      await client.execute('COMMIT');
      console.log('✅ Transaction committed successfully');
      
    } catch (error) {
      // Rollback on error
      await client.execute('ROLLBACK');
      console.log('❌ Transaction rolled back due to error:', error.message);
    }

    console.log('\n2. Transaction with rollback:');
    
    // Demonstrate rollback
    await client.execute('BEGIN');
    
    try {
      await client.execute(`
        INSERT INTO demo_products (name, price, category) 
        VALUES ('Rollback Product', 99.99, 'TempTest')
      `);
      
      // Intentionally cause an error (duplicate key or constraint violation)
      await client.execute(`
        INSERT INTO demo_products (id, name, price, category) 
        VALUES (999999999, 'Invalid Product', -1, 'TempTest')
      `);
      
      await client.execute('COMMIT');
      
    } catch (error) {
      await client.execute('ROLLBACK');
      console.log('✅ Transaction properly rolled back:', error.message);
    }

    // Verify rollback worked
    const rollbackCheck = await client.raw(`
      SELECT COUNT(*) as count FROM demo_products WHERE category = 'TempTest'
    `);
    console.log('✅ Rollback verification (should be 0):', rollbackCheck.rows[0]);

  } catch (error) {
    console.error('❌ Transaction demonstration failed:', error.message);
  }
}

async function demonstrateBatchOperations(client) {
  console.log('\n📦 Batch Operations\n');
  console.log('==========================================');

  try {
    console.log('1. Batch data generation:');
    
    // Generate batch data
    const batchData = [];
    for (let i = 1; i <= 5; i++) {
      batchData.push([
        `Batch Product ${i}`,
        Math.round((Math.random() * 100 + 10) * 100) / 100, // Random price
        i % 2 === 0 ? 'Electronics' : 'Books',
        Math.random() > 0.3 // 70% chance of being in stock
      ]);
    }

    console.log('✅ Generated batch data:', batchData);

    console.log('\n2. Batch insert using VALUES:');
    const valuesList = batchData
      .map((_, index) => `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`)
      .join(', ');
    
    const flatParams = batchData.flat();
    
    const batchInsertResult = await client.execute(`
      INSERT INTO demo_products (name, price, category, in_stock) 
      VALUES ${valuesList} 
      RETURNING id, name, category
    `, flatParams);
    
    console.log('✅ Batch insert result:', batchInsertResult.rows);

    console.log('\n3. Batch update:');
    const categoryUpdateResult = await client.execute(`
      UPDATE demo_products 
      SET category = 'Updated_' || category,
          updated_at = CURRENT_TIMESTAMP
      WHERE category IN ('Electronics', 'Books') 
      RETURNING id, name, category
    `);
    console.log('✅ Batch update result:', categoryUpdateResult.rows);

    console.log('\n4. Batch select with aggregation:');
    const batchStatsResult = await client.raw(`
      SELECT 
        category,
        COUNT(*) as product_count,
        AVG(price) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price,
        SUM(CASE WHEN in_stock THEN 1 ELSE 0 END) as in_stock_count
      FROM demo_products 
      GROUP BY category 
      ORDER BY product_count DESC
    `);
    console.log('✅ Batch statistics:', batchStatsResult.rows);

  } catch (error) {
    console.error('❌ Batch operations failed:', error.message);
  }
}

async function demonstrateErrorHandling(client) {
  console.log('\n🚨 Error Handling\n');
  console.log('==========================================');

  // 1. SQL syntax error
  console.log('1. Handling SQL syntax errors:');
  try {
    await client.raw('SELCT * FROM demo_products'); // Intentional typo
  } catch (error) {
    console.log('✅ Caught syntax error:', error.message);
  }

  // 2. Table not found error
  console.log('\n2. Handling missing table errors:');
  try {
    await client.raw('SELECT * FROM non_existent_table');
  } catch (error) {
    console.log('✅ Caught table not found error:', error.message);
  }

  // 3. Constraint violation
  console.log('\n3. Handling constraint violations:');
  try {
    await client.execute(`
      INSERT INTO demo_products (name, price, category) 
      VALUES (NULL, 29.99, 'Test')
    `); // NULL constraint violation
  } catch (error) {
    console.log('✅ Caught constraint violation:', error.message);
  }

  // 4. Parameter mismatch
  console.log('\n4. Handling parameter mismatches:');
  try {
    await client.raw('SELECT * FROM demo_products WHERE id = $1 AND name = $2', [123]); // Missing second parameter
  } catch (error) {
    console.log('✅ Caught parameter mismatch:', error.message);
  }

  // 5. Timeout handling (simulate with a long query)
  console.log('\n5. Timeout handling demonstration:');
  try {
    // Set a very short timeout for this specific client instance
    const timeoutClient = new FluxezClient(process.env.FLUXEZ_API_KEY || 'cgx_your_api_key_here', {
      apiUrl: process.env.FLUXEZ_API_URL || 'https://api.fluxez.com/api/v1',
      timeout: 100 // Very short timeout
    });
    
    await timeoutClient.raw('SELECT pg_sleep(1)'); // Sleep for 1 second
  } catch (error) {
    console.log('✅ Caught timeout error:', error.message);
  }

  console.log('\n6. Error recovery patterns:');
  let retries = 0;
  const maxRetries = 3;
  
  while (retries < maxRetries) {
    try {
      // This might succeed or fail depending on system state
      const result = await client.raw('SELECT COUNT(*) as total FROM demo_products');
      console.log('✅ Recovery successful on attempt', retries + 1, ':', result.rows[0]);
      break;
    } catch (error) {
      retries++;
      console.log(`⚠️  Attempt ${retries} failed: ${error.message}`);
      
      if (retries < maxRetries) {
        console.log(`🔄 Retrying in ${retries}s...`);
        await new Promise(resolve => setTimeout(resolve, retries * 1000));
      } else {
        console.log('❌ All retry attempts exhausted');
      }
    }
  }
}

// Helper function to clean up demo data
async function cleanupDemoData(client) {
  console.log('\n🧹 Cleaning up demo data...');
  try {
    const deleteResult = await client.execute('DELETE FROM demo_products WHERE category LIKE $1', ['%Test%']);
    console.log('✅ Cleanup complete:', deleteResult.rowCount, 'records removed');
  } catch (error) {
    console.log('⚠️  Cleanup failed (this is fine):', error.message);
  }
}

// Advanced patterns example
async function advancedPatternsExample() {
  console.log('\n🚀 Advanced Data Patterns\n');
  console.log('==========================================');

  const client = new FluxezClient(API_KEY, {
    apiUrl: API_URL,
    debug: false, // Less verbose for advanced patterns
  });

  try {
    // 1. Connection pooling simulation
    console.log('1. Concurrent queries (simulating connection pooling):');
    const promises = [
      client.raw('SELECT 1 as query_1'),
      client.raw('SELECT 2 as query_2'),
      client.raw('SELECT 3 as query_3'),
      client.raw('SELECT NOW() as current_time'),
      client.raw('SELECT version() as db_version')
    ];
    
    const results = await Promise.all(promises);
    console.log('✅ Concurrent queries completed:', results.map(r => r.rows[0]));

    // 2. Prepared statement pattern
    console.log('\n2. Prepared statement pattern:');
    const preparedQuery = (id) => client.raw('SELECT $1 as id, NOW() as timestamp', [id]);
    
    const preparedResults = await Promise.all([
      preparedQuery(1),
      preparedQuery(2),
      preparedQuery(3)
    ]);
    console.log('✅ Prepared statement results:', preparedResults.map(r => r.rows[0]));

    // 3. Dynamic query building
    console.log('\n3. Dynamic query building:');
    const buildDynamicQuery = (filters) => {
      let sql = 'SELECT 1 as example';
      const params = [];
      
      if (filters.length > 0) {
        sql += ' WHERE ';
        const conditions = filters.map((filter, index) => {
          params.push(filter.value);
          return `'${filter.field}' = $${index + 1}`;
        });
        sql += conditions.join(' AND ');
      }
      
      return { sql, params };
    };

    const dynamicFilters = [
      { field: 'status', value: 'active' },
      { field: 'type', value: 'premium' }
    ];
    
    const dynamicQuery = buildDynamicQuery(dynamicFilters);
    console.log('✅ Dynamic query:', dynamicQuery);
    
    const dynamicResult = await client.raw(dynamicQuery.sql, dynamicQuery.params);
    console.log('✅ Dynamic query result:', dynamicResult.rows[0]);

  } catch (error) {
    console.error('❌ Advanced patterns failed:', error.message);
  }
}

// Run the examples
if (require.main === module) {
  console.log('🌟 Running Fluxez SDK Data Operations Examples\n');
  
  dataOperationsExample()
    .then(() => {
      setTimeout(() => {
        console.log('\n' + '='.repeat(50));
        advancedPatternsExample();
      }, 2000);
    })
    .catch(console.error);
}

// Export for use in other files
module.exports = {
  dataOperationsExample,
  demonstrateRawSQLQueries,
  demonstrateQueryBuilder,
  demonstrateNaturalLanguageQueries,
  demonstrateCRUDOperations,
  demonstrateTransactions,
  demonstrateBatchOperations,
  demonstrateErrorHandling,
  advancedPatternsExample,
  cleanupDemoData
};