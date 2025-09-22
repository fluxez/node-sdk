'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Config {
  baseUrl: string;
  apiKey: string;
  projectId: string;
}

export function SchemaManagementPlayground({ config }: { config: Config }) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tableName, setTableName] = useState('users');
  const [schemaJson, setSchemaJson] = useState(`{
  "name": "users",
  "description": "User accounts and profiles",
  "fields": [
    {
      "name": "id",
      "type": "uuid",
      "constraints": { "primaryKey": true }
    },
    {
      "name": "email",
      "type": "varchar(255)",
      "constraints": { "unique": true, "notNull": true }
    },
    {
      "name": "full_name",
      "type": "varchar(255)",
      "constraints": { "notNull": true }
    },
    {
      "name": "created_at",
      "type": "timestamp",
      "defaultValue": "now()"
    }
  ]
}`);

  const handleSchemaOperation = async (endpoint: string, data?: any, method = 'POST') => {
    if (!config.apiKey) {
      setResult({ error: 'Please configure your API key first' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${config.baseUrl}/api/v1${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      const result = await response.json();
      setResult(result);
    } catch (error) {
      setResult({ error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const parseSchema = () => {
    try {
      return JSON.parse(schemaJson);
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Schema Management Playground</h2>
      </div>

      <Tabs defaultValue="schema" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="schema">Schema</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="indexes">Indexes</TabsTrigger>
          <TabsTrigger value="migrations">Migrations</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        {/* Schema Registration */}
        <TabsContent value="schema" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Schema Registration</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Schema Definition (JSON)</label>
                  <textarea
                    value={schemaJson}
                    onChange={(e) => setSchemaJson(e.target.value)}
                    className="w-full p-3 border rounded-md font-mono text-sm"
                    rows={12}
                    placeholder="Enter schema JSON..."
                  />
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      const schema = parseSchema();
                      if (schema) {
                        handleSchemaOperation('/schema/register', {
                          schema,
                          options: { createTable: true, validateOnly: false }
                        });
                      } else {
                        setResult({ error: 'Invalid JSON schema' });
                      }
                    }}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Registering...' : 'Register Schema'}
                  </Button>
                  <Button
                    onClick={() => {
                      const schema = parseSchema();
                      if (schema) {
                        handleSchemaOperation('/schema/validate', { schema });
                      } else {
                        setResult({ error: 'Invalid JSON schema' });
                      }
                    }}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    Validate Schema
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Schema Templates:</h4>
                <div className="space-y-2">
                  <Button
                    onClick={() => setSchemaJson(`{
  "name": "products",
  "description": "Product catalog",
  "fields": [
    { "name": "id", "type": "uuid", "constraints": { "primaryKey": true } },
    { "name": "sku", "type": "varchar(100)", "constraints": { "unique": true, "notNull": true } },
    { "name": "name", "type": "varchar(255)", "constraints": { "notNull": true } },
    { "name": "price", "type": "decimal(10,2)", "constraints": { "notNull": true } },
    { "name": "category_id", "type": "uuid" },
    { "name": "attributes", "type": "jsonb" },
    { "name": "is_active", "type": "boolean", "defaultValue": "true" },
    { "name": "created_at", "type": "timestamp", "defaultValue": "now()" }
  ]
}`)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Load E-commerce Schema
                  </Button>
                  <Button
                    onClick={() => setSchemaJson(`{
  "name": "blog_posts",
  "description": "Blog posts with SEO",
  "fields": [
    { "name": "id", "type": "uuid", "constraints": { "primaryKey": true } },
    { "name": "title", "type": "varchar(255)", "constraints": { "notNull": true } },
    { "name": "slug", "type": "varchar(255)", "constraints": { "unique": true } },
    { "name": "content", "type": "text", "constraints": { "notNull": true } },
    { "name": "author_id", "type": "uuid", "constraints": { "notNull": true } },
    { "name": "tags", "type": "text[]" },
    { "name": "status", "type": "varchar(20)", "defaultValue": "'draft'" },
    { "name": "published_at", "type": "timestamp" },
    { "name": "view_count", "type": "integer", "defaultValue": "0" },
    { "name": "metadata", "type": "jsonb" },
    { "name": "created_at", "type": "timestamp", "defaultValue": "now()" }
  ]
}`)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Load Blog Schema
                  </Button>
                  <Button
                    onClick={() => setSchemaJson(`{
  "name": "sensor_readings",
  "description": "IoT sensor data",
  "fields": [
    { "name": "id", "type": "uuid", "constraints": { "primaryKey": true } },
    { "name": "device_id", "type": "varchar(100)", "constraints": { "notNull": true } },
    { "name": "sensor_type", "type": "varchar(50)", "constraints": { "notNull": true } },
    { "name": "temperature", "type": "decimal(5,2)" },
    { "name": "humidity", "type": "decimal(5,2)" },
    { "name": "pressure", "type": "decimal(8,2)" },
    { "name": "raw_data", "type": "jsonb" },
    { "name": "timestamp", "type": "timestamp", "constraints": { "notNull": true } },
    { "name": "created_at", "type": "timestamp", "defaultValue": "now()" }
  ]
}`)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Load IoT Schema
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Table Management */}
        <TabsContent value="tables" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Table Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Table Name</label>
                  <input
                    type="text"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="users"
                  />
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleSchemaOperation('/schema/tables', null, 'GET')}
                    disabled={loading}
                    className="w-full"
                  >
                    List All Tables
                  </Button>
                  <Button
                    onClick={() => handleSchemaOperation(`/table/${tableName}/describe`, null, 'GET')}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    Describe Table
                  </Button>
                  <Button
                    onClick={() => handleSchemaOperation(`/table/${tableName}/config`, null, 'GET')}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    Get Table Config
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Table Operations:</h4>
                <div className="space-y-2">
                  <Button
                    onClick={() => setResult({
                      example: 'Table structure',
                      description: 'Detailed table information including columns, indexes, and constraints',
                      structure: {
                        name: 'users',
                        columns: [
                          { name: 'id', type: 'uuid', isPrimaryKey: true },
                          { name: 'email', type: 'varchar(255)', isUnique: true },
                          { name: 'full_name', type: 'varchar(255)', isNotNull: true },
                          { name: 'created_at', type: 'timestamp', hasDefault: true }
                        ],
                        indexes: ['idx_users_email', 'idx_users_created_at'],
                        constraints: ['pk_users_id', 'uq_users_email'],
                        size: '2.3 MB',
                        rowCount: 1547
                      }
                    })}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Show Table Structure
                  </Button>
                  <Button
                    onClick={() => setResult({
                      example: 'Database tables list',
                      tables: [
                        { name: 'users', type: 'table', rows: 1547, size: '2.3 MB' },
                        { name: 'products', type: 'table', rows: 892, size: '5.1 MB' },
                        { name: 'orders', type: 'table', rows: 3241, size: '8.7 MB' },
                        { name: 'blog_posts', type: 'table', rows: 156, size: '1.2 MB' }
                      ],
                      total: 4,
                      totalSize: '17.3 MB'
                    })}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Show Tables List
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Index Management */}
        <TabsContent value="indexes" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Index Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Table Name</label>
                  <input
                    type="text"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleSchemaOperation(`/table/${tableName}/index`, {
                      tableName,
                      indexDefinition: {
                        name: `idx_${tableName}_performance`,
                        columns: ['created_at', 'status'],
                        type: 'btree',
                        unique: false
                      }
                    })}
                    disabled={loading}
                    className="w-full"
                  >
                    Create Performance Index
                  </Button>
                  <Button
                    onClick={() => handleSchemaOperation(`/table/${tableName}/index`, {
                      tableName,
                      indexDefinition: {
                        name: `idx_${tableName}_json`,
                        columns: ['metadata'],
                        type: 'gin',
                        unique: false
                      }
                    })}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    Create JSON Index
                  </Button>
                  <Button
                    onClick={() => handleSchemaOperation(`/table/${tableName}/indexes`, null, 'GET')}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    List Table Indexes
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Index Types:</h4>
                <div className="space-y-2">
                  <Button
                    onClick={() => setResult({
                      example: 'Index types and usage',
                      types: [
                        {
                          type: 'btree',
                          usage: 'Default for most queries, sorting, range queries',
                          example: 'CREATE INDEX ON users (email, created_at)'
                        },
                        {
                          type: 'gin',
                          usage: 'JSON/JSONB columns, arrays, full-text search',
                          example: 'CREATE INDEX ON products USING gin (attributes)'
                        },
                        {
                          type: 'hash',
                          usage: 'Equality queries only, faster than btree',
                          example: 'CREATE INDEX ON users USING hash (id)'
                        },
                        {
                          type: 'partial',
                          usage: 'Index with WHERE condition, saves space',
                          example: 'CREATE INDEX ON orders (status) WHERE status = \'active\''
                        }
                      ]
                    })}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Show Index Types
                  </Button>
                  <Button
                    onClick={() => setResult({
                      example: 'Performance recommendations',
                      recommendations: [
                        'Add indexes on frequently queried columns',
                        'Use composite indexes for multi-column queries',
                        'Consider partial indexes for filtered queries',
                        'Use GIN indexes for JSONB and array columns',
                        'Monitor query performance with EXPLAIN',
                        'Drop unused indexes to improve write performance'
                      ]
                    })}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Show Recommendations
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Migrations */}
        <TabsContent value="migrations" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Database Migrations</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Schema Name</label>
                  <input
                    type="text"
                    defaultValue="users"
                    className="w-full p-2 border rounded-md"
                    placeholder="Schema name"
                  />
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleSchemaOperation('/schema/migrate', {
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
                            }
                          ],
                          down: [
                            { type: 'DROP_COLUMN', table: 'users', column: 'preferences' },
                            { type: 'DROP_COLUMN', table: 'users', column: 'timezone' }
                          ]
                        }
                      ]
                    })}
                    disabled={loading}
                    className="w-full"
                  >
                    Add User Preferences
                  </Button>
                  <Button
                    onClick={() => handleSchemaOperation('/schema/migrate', {
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
                            }
                          ],
                          down: [
                            { type: 'DROP_INDEX', index: 'idx_users_email_verified' }
                          ]
                        }
                      ]
                    })}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    Add Performance Indexes
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Migration Examples:</h4>
                <div className="space-y-2">
                  <Button
                    onClick={() => setResult({
                      example: 'Migration operations',
                      operations: [
                        {
                          type: 'ADD_COLUMN',
                          description: 'Add new column to existing table',
                          example: 'ADD_COLUMN users.last_login_at timestamp'
                        },
                        {
                          type: 'DROP_COLUMN',
                          description: 'Remove column from table',
                          example: 'DROP_COLUMN users.deprecated_field'
                        },
                        {
                          type: 'CREATE_INDEX',
                          description: 'Create database index',
                          example: 'CREATE_INDEX idx_users_email ON users(email)'
                        },
                        {
                          type: 'UPDATE_DATA',
                          description: 'Data migration with SQL',
                          example: 'UPDATE users SET preferences = \'{}\' WHERE preferences IS NULL'
                        }
                      ]
                    })}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Show Migration Types
                  </Button>
                  <Button
                    onClick={() => setResult({
                      example: 'Migration best practices',
                      practices: [
                        'Always create reversible migrations with down scripts',
                        'Test migrations on development data first',
                        'Use transactions for atomic operations',
                        'Backup data before major migrations',
                        'Add indexes during low-traffic periods',
                        'Monitor migration performance and impact'
                      ]
                    })}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Show Best Practices
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Table Configuration */}
        <TabsContent value="configuration" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Table Configuration</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Table Name</label>
                  <input
                    type="text"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleSchemaOperation(`/table/${tableName}/config`, {
                      config: {
                        tableName,
                        search: {
                          enabled: true,
                          fields: [
                            { name: 'email', searchable: true, filterable: true },
                            { name: 'full_name', searchable: true, boost: 2.0 }
                          ]
                        }
                      }
                    })}
                    disabled={loading}
                    className="w-full"
                  >
                    Enable Search
                  </Button>
                  <Button
                    onClick={() => handleSchemaOperation(`/table/${tableName}/config`, {
                      config: {
                        tableName,
                        analytics: {
                          enabled: true,
                          fields: [
                            { name: 'created_at', type: 'dimension', granularity: 'day' },
                            { name: 'id', type: 'measure', aggregation: 'count' }
                          ]
                        }
                      }
                    })}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    Enable Analytics
                  </Button>
                  <Button
                    onClick={() => handleSchemaOperation(`/table/${tableName}/config`, {
                      config: {
                        tableName,
                        cache: {
                          enabled: true,
                          strategy: 'write-through',
                          ttl: 3600,
                          keyPattern: `${tableName}:{id}`
                        }
                      }
                    })}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    Enable Caching
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Configuration Features:</h4>
                <div className="space-y-2">
                  <Button
                    onClick={() => setResult({
                      example: 'Multi-service configuration',
                      description: 'Table configuration automatically sets up multiple services',
                      services: {
                        elasticsearch: {
                          enabled: true,
                          purpose: 'Full-text search and filtering',
                          features: ['fuzzy_search', 'highlighting', 'facets']
                        },
                        clickhouse: {
                          enabled: true,
                          purpose: 'Real-time analytics and aggregations',
                          features: ['time_series', 'aggregations', 'partitioning']
                        },
                        redis: {
                          enabled: true,
                          purpose: 'High-performance caching',
                          features: ['key_expiry', 'pattern_matching', 'pub_sub']
                        },
                        qdrant: {
                          enabled: false,
                          purpose: 'Vector similarity search',
                          features: ['embeddings', 'semantic_search', 'recommendations']
                        }
                      }
                    })}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Show Service Integration
                  </Button>
                  <Button
                    onClick={() => setResult({
                      example: 'Real-time sync architecture',
                      description: 'Changes to PostgreSQL automatically sync to all configured services',
                      flow: [
                        '1. Data inserted/updated in PostgreSQL',
                        '2. PostgreSQL trigger fires pg_notify',
                        '3. MCP Server receives notification',
                        '4. Data synced to Elasticsearch (search)',
                        '5. Data synced to ClickHouse (analytics)',
                        '6. Cache updated in Redis',
                        '7. WebSocket notifications sent'
                      ]
                    })}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Show Sync Architecture
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results */}
      {result && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Result</h3>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}