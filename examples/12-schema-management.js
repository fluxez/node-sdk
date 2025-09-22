/**
 * Fluxez Node.js SDK - Schema Management Examples
 * 
 * This example demonstrates comprehensive schema management features including:
 * - Schema registration and validation
 * - Table creation and configuration
 * - Database migrations
 * - Index management
 * - Table introspection and metadata
 * - Search, analytics, and cache configuration
 * 
 * Schema management is the foundation for controlling PostgreSQL, Elasticsearch,
 * ClickHouse, Qdrant, and Redis configurations automatically.
 */

const Fluxez = require('../dist/index');

// Configuration
const config = {
  apiKey: 'cgx_your_project_service_role_key', // Use service role key for schema management
  baseUrl: process.env.FLUXEZ_BASE_URL || 'http://localhost:3000'
};

const fluxez = new Fluxez(config);

async function demonstrateSchemaManagement() {
  console.log('🗃️ Fluxez Schema Management Examples\n');
  console.log('=====================================\n');

  try {
    // 1. Basic Schema Operations
    await demonstrateBasicSchemaOperations();

    // 2. Table Configuration
    await demonstrateTableConfiguration();

    // 3. Advanced Schema Management
    await demonstrateAdvancedSchemaManagement();

    // 4. Database Migrations
    await demonstrateDatabaseMigrations();

    // 5. Index Management
    await demonstrateIndexManagement();

    // 6. Table Introspection
    await demonstrateTableIntrospection();

    // 7. Real-world Schema Examples
    await demonstrateRealWorldSchemas();

    console.log('\n✅ All schema management examples completed successfully!');

  } catch (error) {
    console.error('\n❌ Error in schema management examples:', error);
    
    if (error.code) {
      console.error(`Error Code: ${error.code}`);
    }
    if (error.tableName) {
      console.error(`Table: ${error.tableName}`);
    }
    if (error.schemaName) {
      console.error(`Schema: ${error.schemaName}`);
    }
    if (error.details) {
      console.error('Error Details:', JSON.stringify(error.details, null, 2));
    }
  }
}

/**
 * Demonstrate basic schema operations
 */
async function demonstrateBasicSchemaOperations() {
  console.log('📋 Basic Schema Operations');
  console.log('--------------------------\n');

  try {
    // 1. Register a simple user schema
    console.log('1. Register Simple User Schema:');
    const userSchema = {
      name: 'users',
      description: 'User accounts and profiles',
      fields: [
        {
          name: 'id',
          type: 'uuid',
          constraints: {
            primaryKey: true
          }
        },
        {
          name: 'email',
          type: 'varchar(255)',
          constraints: {
            unique: true,
            notNull: true
          }
        },
        {
          name: 'full_name',
          type: 'varchar(255)',
          constraints: {
            notNull: true
          }
        },
        {
          name: 'avatar_url',
          type: 'text'
        },
        {
          name: 'email_verified',
          type: 'boolean',
          defaultValue: 'false'
        },
        {
          name: 'metadata',
          type: 'jsonb'
        },
        {
          name: 'created_at',
          type: 'timestamp',
          defaultValue: 'now()'
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          defaultValue: 'now()'
        }
      ]
    };

    const userSchemaResult = await fluxez.schema.registerSchema({
      schema: userSchema,
      options: {
        createTable: true,
        validateOnly: false
      }
    });

    console.log('✅ User schema registered:', {
      schemaId: userSchemaResult.schemaId,
      tableName: userSchemaResult.tableName,
      migrationsApplied: userSchemaResult.migrations?.applied || 0
    });

    // 2. Validate schema before registration
    console.log('\n2. Schema Validation:');
    const validationResult = await fluxez.schema.validateSchema({
      name: 'products',
      fields: [
        {
          name: 'id',
          type: 'uuid',
          constraints: { primaryKey: true }
        },
        {
          name: 'name',
          type: 'varchar(255)',
          constraints: { notNull: true }
        },
        {
          name: 'price',
          type: 'decimal(10,2)',
          constraints: { notNull: true }
        },
        {
          name: 'invalid_field', // This might cause a warning
          type: 'unknown_type' // Invalid type
        }
      ]
    });

    console.log('✅ Schema validation result:', {
      valid: validationResult.valid,
      errors: validationResult.errors,
      warnings: validationResult.warnings
    });

    // 3. Get schema information
    console.log('\n3. Get Schema Information:');
    const retrievedSchema = await fluxez.schema.getSchema('users');
    console.log('✅ Schema retrieved:', {
      name: retrievedSchema.name,
      description: retrievedSchema.description,
      fieldsCount: retrievedSchema.fields.length,
      createdAt: retrievedSchema.createdAt
    });

    console.log('\n');

  } catch (error) {
    console.error('❌ Basic schema operations error:', error);
    throw error;
  }
}

/**
 * Demonstrate table configuration for different purposes
 */
async function demonstrateTableConfiguration() {
  console.log('⚙️ Table Configuration');
  console.log('----------------------\n');

  try {
    // 1. Configure table for search capabilities
    console.log('1. Configure Table for Search:');
    const searchConfig = await fluxez.schema.configureTable({
      config: {
        tableName: 'users',
        search: {
          enabled: true,
          indexName: 'users_search_idx',
          fields: [
            {
              name: 'email',
              searchable: true,
              filterable: true,
              sortable: true,
              boost: 1.0
            },
            {
              name: 'full_name',
              searchable: true,
              filterable: true,
              boost: 2.0, // Higher boost for name searches
              analyzer: 'standard'
            },
            {
              name: 'metadata',
              searchable: true,
              filterable: true,
              nested: true
            }
          ],
          settings: {
            fuzzySearch: true,
            highlightResults: true,
            maxResults: 100
          }
        }
      }
    });

    console.log('✅ Search configuration applied:', {
      tableName: searchConfig.tableName,
      searchEnabled: searchConfig.appliedConfigs.includes('search'),
      indexCreated: searchConfig.searchIndex?.created
    });

    // 2. Configure table for analytics
    console.log('\n2. Configure Table for Analytics:');
    const analyticsConfig = await fluxez.schema.configureTable({
      config: {
        tableName: 'users',
        analytics: {
          enabled: true,
          fields: [
            {
              name: 'created_at',
              type: 'dimension',
              granularity: 'day'
            },
            {
              name: 'email_verified',
              type: 'dimension'
            },
            {
              name: 'id',
              type: 'measure',
              aggregation: 'count'
            },
            {
              name: 'metadata',
              type: 'dimension',
              nested: true,
              extractFields: ['department', 'role', 'plan']
            }
          ],
          partitioning: {
            field: 'created_at',
            interval: 'month'
          },
          retention: {
            raw: '1 year',
            aggregated: '5 years'
          }
        }
      }
    });

    console.log('✅ Analytics configuration applied:', {
      tableName: analyticsConfig.tableName,
      analyticsEnabled: analyticsConfig.appliedConfigs.includes('analytics'),
      clickhouseTable: analyticsConfig.analyticsTable?.created
    });

    // 3. Configure table for caching
    console.log('\n3. Configure Table for Caching:');
    const cacheConfig = await fluxez.schema.configureTable({
      config: {
        tableName: 'users',
        cache: {
          enabled: true,
          strategy: 'write-through',
          ttl: 3600, // 1 hour
          keyPattern: 'user:{id}',
          fields: [
            {
              name: 'id',
              indexable: true
            },
            {
              name: 'email',
              indexable: true
            },
            {
              name: 'full_name',
              cacheable: true
            },
            {
              name: 'avatar_url',
              cacheable: true
            }
          ],
          invalidation: {
            onUpdate: true,
            onDelete: true,
            cascadeKeys: ['user:*', 'profile:{id}']
          }
        }
      }
    });

    console.log('✅ Cache configuration applied:', {
      tableName: cacheConfig.tableName,
      cacheEnabled: cacheConfig.appliedConfigs.includes('cache'),
      redisKeys: cacheConfig.cacheKeys?.created
    });

    // 4. Configure real-time updates
    console.log('\n4. Configure Real-time Updates:');
    const realtimeConfig = await fluxez.schema.configureTable({
      config: {
        tableName: 'users',
        realtime: {
          enabled: true,
          events: ['INSERT', 'UPDATE', 'DELETE'],
          channels: [
            {
              name: 'user_updates',
              filter: "email_verified = true",
              fields: ['id', 'email', 'full_name', 'updated_at']
            },
            {
              name: 'new_users',
              filter: "created_at > now() - interval '1 hour'",
              fields: ['id', 'email', 'created_at']
            }
          ],
          websocket: {
            enabled: true,
            authentication: 'required'
          }
        }
      }
    });

    console.log('✅ Real-time configuration applied:', {
      tableName: realtimeConfig.tableName,
      realtimeEnabled: realtimeConfig.appliedConfigs.includes('realtime'),
      channels: realtimeConfig.realtimeChannels?.length || 0
    });

    console.log('\n');

  } catch (error) {
    console.error('❌ Table configuration error:', error);
    throw error;
  }
}

/**
 * Demonstrate advanced schema management features
 */
async function demonstrateAdvancedSchemaManagement() {
  console.log('🚀 Advanced Schema Management');
  console.log('-----------------------------\n');

  try {
    // 1. Register complex e-commerce schema
    console.log('1. Register Complex E-commerce Schema:');
    const productSchema = {
      name: 'products',
      description: 'Product catalog with variants and inventory',
      fields: [
        { name: 'id', type: 'uuid', constraints: { primaryKey: true } },
        { name: 'sku', type: 'varchar(100)', constraints: { unique: true, notNull: true } },
        { name: 'name', type: 'varchar(255)', constraints: { notNull: true } },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal(10,2)', constraints: { notNull: true } },
        { name: 'category_id', type: 'uuid', foreignKey: { table: 'categories', column: 'id' } },
        { name: 'brand_id', type: 'uuid', foreignKey: { table: 'brands', column: 'id' } },
        { name: 'attributes', type: 'jsonb' },
        { name: 'images', type: 'jsonb' },
        { name: 'inventory_count', type: 'integer', constraints: { notNull: true }, defaultValue: '0' },
        { name: 'is_active', type: 'boolean', defaultValue: 'true' },
        { name: 'weight', type: 'decimal(8,3)' },
        { name: 'dimensions', type: 'jsonb' },
        { name: 'tags', type: 'text[]' },
        { name: 'created_at', type: 'timestamp', defaultValue: 'now()' },
        { name: 'updated_at', type: 'timestamp', defaultValue: 'now()' }
      ],
      indexes: [
        {
          name: 'idx_products_category',
          columns: ['category_id', 'is_active'],
          type: 'btree'
        },
        {
          name: 'idx_products_price',
          columns: ['price'],
          type: 'btree'
        },
        {
          name: 'idx_products_attributes',
          columns: ['attributes'],
          type: 'gin'
        },
        {
          name: 'idx_products_tags',
          columns: ['tags'],
          type: 'gin'
        },
        {
          name: 'idx_products_fulltext',
          columns: ['name', 'description'],
          type: 'gin',
          expression: "to_tsvector('english', name || ' ' || coalesce(description, ''))"
        }
      ]
    };

    const productResult = await fluxez.schema.registerSchema({
      schema: productSchema,
      options: {
        createTable: true,
        createIndexes: true,
        validateForeignKeys: false // Skip FK validation for demo
      }
    });

    console.log('✅ Complex product schema registered:', {
      schemaId: productResult.schemaId,
      indexesCreated: productResult.indexes?.created?.length || 0
    });

    // 2. Multi-table configuration for comprehensive setup
    console.log('\n2. Configure Product Table for All Features:');
    const comprehensiveConfig = await fluxez.schema.configureTable({
      config: {
        tableName: 'products',
        search: {
          enabled: true,
          fields: [
            { name: 'name', searchable: true, boost: 3.0 },
            { name: 'description', searchable: true, boost: 1.0 },
            { name: 'sku', searchable: true, exact: true },
            { name: 'attributes', searchable: true, nested: true },
            { name: 'tags', searchable: true, array: true },
            { name: 'price', filterable: true, sortable: true },
            { name: 'category_id', filterable: true },
            { name: 'is_active', filterable: true }
          ]
        },
        analytics: {
          enabled: true,
          fields: [
            { name: 'created_at', type: 'dimension', granularity: 'day' },
            { name: 'category_id', type: 'dimension' },
            { name: 'price', type: 'measure', aggregation: 'avg' },
            { name: 'inventory_count', type: 'measure', aggregation: 'sum' },
            { name: 'id', type: 'measure', aggregation: 'count' }
          ]
        },
        cache: {
          enabled: true,
          strategy: 'write-behind',
          ttl: 7200, // 2 hours
          keyPattern: 'product:{id}',
          fields: [
            { name: 'id', indexable: true },
            { name: 'sku', indexable: true },
            { name: 'name', cacheable: true },
            { name: 'price', cacheable: true },
            { name: 'is_active', cacheable: true }
          ]
        },
        realtime: {
          enabled: true,
          events: ['INSERT', 'UPDATE'],
          channels: [
            {
              name: 'product_updates',
              filter: "is_active = true",
              fields: ['id', 'name', 'price', 'inventory_count']
            }
          ]
        }
      }
    });

    console.log('✅ Comprehensive configuration applied:', {
      appliedConfigs: comprehensiveConfig.appliedConfigs,
      searchEnabled: comprehensiveConfig.appliedConfigs.includes('search'),
      analyticsEnabled: comprehensiveConfig.appliedConfigs.includes('analytics'),
      cacheEnabled: comprehensiveConfig.appliedConfigs.includes('cache'),
      realtimeEnabled: comprehensiveConfig.appliedConfigs.includes('realtime')
    });

    console.log('\n');

  } catch (error) {
    console.error('❌ Advanced schema management error:', error);
    throw error;
  }
}

/**
 * Demonstrate database migrations
 */
async function demonstrateDatabaseMigrations() {
  console.log('🔄 Database Migrations');
  console.log('----------------------\n');

  try {
    // 1. Create migration for adding new fields
    console.log('1. Apply Schema Migration - Add New Fields:');
    const migrationResult = await fluxez.schema.migrateSchema({
      schemaName: 'users',
      migrations: [
        {
          id: 'add_user_preferences',
          description: 'Add user preferences and settings',
          up: [
            {
              type: 'ADD_COLUMN',
              table: 'users',
              column: {
                name: 'preferences',
                type: 'jsonb',
                defaultValue: '{}'
              }
            },
            {
              type: 'ADD_COLUMN',
              table: 'users',
              column: {
                name: 'timezone',
                type: 'varchar(50)',
                defaultValue: "'UTC'"
              }
            },
            {
              type: 'ADD_COLUMN',
              table: 'users',
              column: {
                name: 'last_login_at',
                type: 'timestamp'
              }
            }
          ],
          down: [
            {
              type: 'DROP_COLUMN',
              table: 'users',
              column: 'preferences'
            },
            {
              type: 'DROP_COLUMN',
              table: 'users',
              column: 'timezone'
            },
            {
              type: 'DROP_COLUMN',
              table: 'users',
              column: 'last_login_at'
            }
          ]
        }
      ]
    });

    console.log('✅ Migration applied:', {
      applied: migrationResult.summary.applied,
      failed: migrationResult.summary.failed,
      executionTime: migrationResult.executionTime,
      migrations: migrationResult.migrations?.map(m => ({
        id: m.id,
        status: m.status,
        error: m.error
      }))
    });

    // 2. Create index migration
    console.log('\n2. Apply Index Migration:');
    const indexMigrationResult = await fluxez.schema.migrateSchema({
      schemaName: 'users',
      migrations: [
        {
          id: 'add_user_indexes',
          description: 'Add performance indexes',
          up: [
            {
              type: 'CREATE_INDEX',
              table: 'users',
              index: {
                name: 'idx_users_email_verified',
                columns: ['email_verified', 'created_at']
              }
            },
            {
              type: 'CREATE_INDEX',
              table: 'users',
              index: {
                name: 'idx_users_preferences',
                columns: ['preferences'],
                type: 'gin'
              }
            }
          ],
          down: [
            {
              type: 'DROP_INDEX',
              index: 'idx_users_email_verified'
            },
            {
              type: 'DROP_INDEX',
              index: 'idx_users_preferences'
            }
          ]
        }
      ]
    });

    console.log('✅ Index migration applied:', {
      applied: indexMigrationResult.summary.applied,
      indexesCreated: indexMigrationResult.summary.applied
    });

    // 3. Data migration example
    console.log('\n3. Data Migration Example:');
    const dataMigrationResult = await fluxez.schema.migrateSchema({
      schemaName: 'users',
      migrations: [
        {
          id: 'set_default_preferences',
          description: 'Set default preferences for existing users',
          up: [
            {
              type: 'UPDATE_DATA',
              table: 'users',
              sql: `
                UPDATE users 
                SET preferences = '{
                  "notifications": true,
                  "newsletter": false,
                  "theme": "light",
                  "language": "en"
                }'::jsonb
                WHERE preferences IS NULL OR preferences = '{}'::jsonb
              `
            }
          ],
          down: [
            {
              type: 'UPDATE_DATA',
              table: 'users',
              sql: "UPDATE users SET preferences = '{}' WHERE preferences IS NOT NULL"
            }
          ]
        }
      ]
    });

    console.log('✅ Data migration applied:', {
      applied: dataMigrationResult.summary.applied,
      rowsAffected: dataMigrationResult.rowsAffected
    });

    console.log('\n');

  } catch (error) {
    console.error('❌ Database migration error:', error);
    throw error;
  }
}

/**
 * Demonstrate index management
 */
async function demonstrateIndexManagement() {
  console.log('📊 Index Management');
  console.log('-------------------\n');

  try {
    // 1. Create various types of indexes
    console.log('1. Create Performance Indexes:');
    
    // B-tree index for sorting and range queries
    const btreeIndex = await fluxez.schema.createIndex({
      tableName: 'products',
      indexDefinition: {
        name: 'idx_products_price_range',
        columns: ['price', 'created_at'],
        type: 'btree',
        unique: false
      }
    });
    console.log('✅ B-tree index created:', btreeIndex.indexName);

    // GIN index for JSONB and array columns
    const ginIndex = await fluxez.schema.createIndex({
      tableName: 'products',
      indexDefinition: {
        name: 'idx_products_attributes_gin',
        columns: ['attributes'],
        type: 'gin',
        unique: false
      }
    });
    console.log('✅ GIN index created:', ginIndex.indexName);

    // Partial index with condition
    const partialIndex = await fluxez.schema.createIndex({
      tableName: 'products',
      indexDefinition: {
        name: 'idx_active_products',
        columns: ['name'],
        type: 'btree',
        unique: false,
        condition: 'is_active = true'
      }
    });
    console.log('✅ Partial index created:', partialIndex.indexName);

    // 2. List all indexes for a table
    console.log('\n2. List Table Indexes:');
    const indexes = await fluxez.schema.getTableIndexes('products');
    console.log('✅ Current indexes on products table:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${index.columns.join(', ')} (${index.type})`);
    });

    // 3. Get table structure with index information
    console.log('\n3. Detailed Table Structure:');
    const tableStructure = await fluxez.schema.describeTable('products');
    console.log('✅ Table structure:', {
      name: tableStructure.name,
      columns: tableStructure.columns?.length || 0,
      indexes: tableStructure.indexes?.length || 0,
      constraints: tableStructure.constraints?.length || 0,
      size: tableStructure.size || 'N/A'
    });

    console.log('\n');

  } catch (error) {
    console.error('❌ Index management error:', error);
    throw error;
  }
}

/**
 * Demonstrate table introspection
 */
async function demonstrateTableIntrospection() {
  console.log('🔍 Table Introspection');
  console.log('----------------------\n');

  try {
    // 1. List all tables
    console.log('1. List All Tables:');
    const allTables = await fluxez.schema.listTables({
      includeViews: true,
      includeSize: true,
      includeStats: true
    });

    console.log('✅ Database tables:');
    allTables.tables.forEach(table => {
      console.log(`  - ${table.name}: ${table.type} (${table.rowCount || 0} rows)`);
    });
    console.log(`Total tables: ${allTables.total}`);

    // 2. Get specific table configuration
    console.log('\n2. Get Table Configuration:');
    const userTableConfig = await fluxez.schema.getTableConfig('users');
    console.log('✅ Users table configuration:', {
      tableName: userTableConfig.tableName,
      searchEnabled: userTableConfig.search?.enabled,
      analyticsEnabled: userTableConfig.analytics?.enabled,
      cacheEnabled: userTableConfig.cache?.enabled,
      realtimeEnabled: userTableConfig.realtime?.enabled
    });

    // 3. Update table configuration
    console.log('\n3. Update Table Configuration:');
    const updatedConfig = await fluxez.schema.updateTableConfig('users', {
      search: {
        enabled: true,
        fields: [
          { name: 'full_name', searchable: true, boost: 2.0 },
          { name: 'email', searchable: true, exact: true }
        ]
      }
    });
    console.log('✅ Configuration updated:', {
      appliedConfigs: updatedConfig.appliedConfigs
    });

    // 4. Search tables by pattern
    console.log('\n4. Search Tables by Pattern:');
    const userTables = await fluxez.schema.listTables({
      pattern: 'user%', // Tables starting with 'user'
      includeStats: true
    });
    console.log('✅ User-related tables:', userTables.tables.map(t => t.name));

    console.log('\n');

  } catch (error) {
    console.error('❌ Table introspection error:', error);
    throw error;
  }
}

/**
 * Demonstrate real-world schema examples
 */
async function demonstrateRealWorldSchemas() {
  console.log('🌍 Real-World Schema Examples');
  console.log('-----------------------------\n');

  try {
    // 1. Blog/CMS Schema
    console.log('1. Blog/CMS Schema:');
    const blogSchema = {
      name: 'blog_posts',
      description: 'Blog posts with SEO and content management features',
      fields: [
        { name: 'id', type: 'uuid', constraints: { primaryKey: true } },
        { name: 'title', type: 'varchar(255)', constraints: { notNull: true } },
        { name: 'slug', type: 'varchar(255)', constraints: { unique: true, notNull: true } },
        { name: 'content', type: 'text', constraints: { notNull: true } },
        { name: 'excerpt', type: 'text' },
        { name: 'author_id', type: 'uuid', constraints: { notNull: true } },
        { name: 'category_id', type: 'uuid' },
        { name: 'tags', type: 'text[]' },
        { name: 'featured_image', type: 'text' },
        { name: 'seo_title', type: 'varchar(255)' },
        { name: 'seo_description', type: 'text' },
        { name: 'status', type: 'varchar(20)', defaultValue: "'draft'" },
        { name: 'published_at', type: 'timestamp' },
        { name: 'view_count', type: 'integer', defaultValue: '0' },
        { name: 'reading_time', type: 'integer' },
        { name: 'metadata', type: 'jsonb' },
        { name: 'created_at', type: 'timestamp', defaultValue: 'now()' },
        { name: 'updated_at', type: 'timestamp', defaultValue: 'now()' }
      ]
    };

    const blogResult = await fluxez.schema.registerSchema({
      schema: blogSchema,
      options: { createTable: true }
    });
    console.log('✅ Blog schema registered');

    // Configure for content management
    await fluxez.schema.configureTable({
      config: {
        tableName: 'blog_posts',
        search: {
          enabled: true,
          fields: [
            { name: 'title', searchable: true, boost: 3.0 },
            { name: 'content', searchable: true, boost: 1.0 },
            { name: 'excerpt', searchable: true, boost: 2.0 },
            { name: 'tags', searchable: true, array: true },
            { name: 'status', filterable: true }
          ]
        },
        analytics: {
          enabled: true,
          fields: [
            { name: 'published_at', type: 'dimension', granularity: 'day' },
            { name: 'category_id', type: 'dimension' },
            { name: 'view_count', type: 'measure', aggregation: 'sum' },
            { name: 'reading_time', type: 'measure', aggregation: 'avg' }
          ]
        }
      }
    });

    // 2. E-commerce Order Schema
    console.log('\n2. E-commerce Order Schema:');
    const orderSchema = {
      name: 'orders',
      description: 'Customer orders with payment and shipping tracking',
      fields: [
        { name: 'id', type: 'uuid', constraints: { primaryKey: true } },
        { name: 'order_number', type: 'varchar(50)', constraints: { unique: true, notNull: true } },
        { name: 'customer_id', type: 'uuid', constraints: { notNull: true } },
        { name: 'status', type: 'varchar(20)', constraints: { notNull: true } },
        { name: 'total_amount', type: 'decimal(12,2)', constraints: { notNull: true } },
        { name: 'tax_amount', type: 'decimal(12,2)' },
        { name: 'shipping_amount', type: 'decimal(12,2)' },
        { name: 'discount_amount', type: 'decimal(12,2)' },
        { name: 'currency', type: 'char(3)', defaultValue: "'USD'" },
        { name: 'payment_status', type: 'varchar(20)' },
        { name: 'payment_method', type: 'varchar(50)' },
        { name: 'shipping_address', type: 'jsonb' },
        { name: 'billing_address', type: 'jsonb' },
        { name: 'line_items', type: 'jsonb' },
        { name: 'tracking_number', type: 'varchar(100)' },
        { name: 'notes', type: 'text' },
        { name: 'metadata', type: 'jsonb' },
        { name: 'created_at', type: 'timestamp', defaultValue: 'now()' },
        { name: 'updated_at', type: 'timestamp', defaultValue: 'now()' }
      ]
    };

    await fluxez.schema.registerSchema({
      schema: orderSchema,
      options: { createTable: true }
    });
    console.log('✅ Order schema registered');

    // Configure for business intelligence
    await fluxez.schema.configureTable({
      config: {
        tableName: 'orders',
        analytics: {
          enabled: true,
          fields: [
            { name: 'created_at', type: 'dimension', granularity: 'hour' },
            { name: 'status', type: 'dimension' },
            { name: 'payment_status', type: 'dimension' },
            { name: 'total_amount', type: 'measure', aggregation: 'sum' },
            { name: 'id', type: 'measure', aggregation: 'count' }
          ],
          partitioning: { field: 'created_at', interval: 'month' }
        },
        realtime: {
          enabled: true,
          events: ['INSERT', 'UPDATE'],
          channels: [
            {
              name: 'new_orders',
              filter: "status = 'pending'",
              fields: ['id', 'order_number', 'total_amount', 'customer_id']
            }
          ]
        }
      }
    });

    // 3. IoT Sensor Data Schema
    console.log('\n3. IoT Sensor Data Schema:');
    const sensorSchema = {
      name: 'sensor_readings',
      description: 'Time-series data from IoT sensors',
      fields: [
        { name: 'id', type: 'uuid', constraints: { primaryKey: true } },
        { name: 'device_id', type: 'varchar(100)', constraints: { notNull: true } },
        { name: 'sensor_type', type: 'varchar(50)', constraints: { notNull: true } },
        { name: 'location', type: 'varchar(255)' },
        { name: 'temperature', type: 'decimal(5,2)' },
        { name: 'humidity', type: 'decimal(5,2)' },
        { name: 'pressure', type: 'decimal(8,2)' },
        { name: 'battery_level', type: 'decimal(5,2)' },
        { name: 'signal_strength', type: 'integer' },
        { name: 'coordinates', type: 'point' }, // PostGIS point type
        { name: 'raw_data', type: 'jsonb' },
        { name: 'quality_score', type: 'decimal(3,2)' },
        { name: 'timestamp', type: 'timestamp', constraints: { notNull: true } },
        { name: 'created_at', type: 'timestamp', defaultValue: 'now()' }
      ]
    };

    await fluxez.schema.registerSchema({
      schema: sensorSchema,
      options: { createTable: true }
    });
    console.log('✅ Sensor data schema registered');

    // Configure for time-series analytics
    await fluxez.schema.configureTable({
      config: {
        tableName: 'sensor_readings',
        analytics: {
          enabled: true,
          fields: [
            { name: 'timestamp', type: 'dimension', granularity: 'minute' },
            { name: 'device_id', type: 'dimension' },
            { name: 'sensor_type', type: 'dimension' },
            { name: 'temperature', type: 'measure', aggregation: 'avg' },
            { name: 'humidity', type: 'measure', aggregation: 'avg' },
            { name: 'pressure', type: 'measure', aggregation: 'avg' }
          ],
          partitioning: { field: 'timestamp', interval: 'day' }
        }
      }
    });

    console.log('\n✅ All real-world schemas configured successfully');

    console.log('\n');

  } catch (error) {
    console.error('❌ Real-world schema error:', error);
    throw error;
  }
}

/**
 * Demonstrate schema cleanup and maintenance
 */
async function demonstrateSchemaCleanup() {
  console.log('🧹 Schema Cleanup and Maintenance');
  console.log('---------------------------------\n');

  try {
    // 1. Drop unused indexes
    console.log('1. Drop Unused Index:');
    await fluxez.schema.dropIndex('products', 'idx_products_old_index');
    console.log('✅ Unused index dropped');

    // 2. Drop table (with backup)
    console.log('\n2. Drop Table with Backup:');
    const dropResult = await fluxez.schema.dropTable({
      tableName: 'temp_table',
      options: {
        cascade: false,
        backup: true,
        confirmDrop: true
      }
    });
    console.log('✅ Table dropped:', {
      tableName: 'temp_table',
      backupLocation: dropResult.backupLocation
    });

    console.log('\n');

  } catch (error) {
    // Expected errors for demo cleanup
    console.log('✅ Cleanup operations completed (some expected failures in demo)');
  }
}

// Helper function to demonstrate schema versioning
async function demonstrateSchemaVersioning() {
  console.log('📋 Schema Versioning Example');
  console.log('----------------------------\n');

  try {
    // Register versioned schema
    const versionedSchema = {
      name: 'api_logs',
      version: '1.0.0',
      description: 'API request and response logs',
      fields: [
        { name: 'id', type: 'uuid', constraints: { primaryKey: true } },
        { name: 'request_id', type: 'varchar(100)', constraints: { unique: true } },
        { name: 'method', type: 'varchar(10)' },
        { name: 'path', type: 'varchar(500)' },
        { name: 'status_code', type: 'integer' },
        { name: 'response_time', type: 'integer' },
        { name: 'user_agent', type: 'text' },
        { name: 'ip_address', type: 'inet' },
        { name: 'created_at', type: 'timestamp', defaultValue: 'now()' }
      ]
    };

    await fluxez.schema.registerSchema({
      schema: versionedSchema,
      options: { createTable: true }
    });

    console.log('✅ Versioned schema registered');

  } catch (error) {
    console.error('❌ Schema versioning error:', error);
    throw error;
  }
}

// Run the examples
if (require.main === module) {
  demonstrateSchemaManagement()
    .then(() => {
      console.log('\n📚 Additional Resources:');
      console.log('- Schema validation tools in examples/');
      console.log('- Migration examples in examples/migrations/');
      console.log('- Visit https://docs.fluxez.com/schema for full documentation');
    })
    .catch(console.error);
}

module.exports = {
  demonstrateSchemaManagement,
  demonstrateBasicSchemaOperations,
  demonstrateTableConfiguration,
  demonstrateAdvancedSchemaManagement,
  demonstrateDatabaseMigrations,
  demonstrateIndexManagement,
  demonstrateTableIntrospection,
  demonstrateRealWorldSchemas,
  demonstrateSchemaCleanup,
  demonstrateSchemaVersioning
};