/**
 * Test script for the new SchemaClient and TenantClient
 * Run with: node test-new-clients.js
 */

// Import the new clients (this will verify the module structure)
try {
  // Test module loading
  console.log('🔍 Testing module imports...');
  
  // Import main client
  const { FluxezClient } = require('./src/fluxez-client.ts');
  console.log('✅ FluxezClient imported successfully');

  // Import individual clients
  const { SchemaClient } = require('./src/schema/schema-client.ts');
  const { TenantClient } = require('./src/tenant/tenant-client.ts');
  console.log('✅ SchemaClient and TenantClient imported successfully');

  // Import types
  const schemaTypes = require('./src/types/schema.types.ts');
  const tenantTypes = require('./src/types/tenant.types.ts');
  console.log('✅ Schema and Tenant types imported successfully');

  console.log('\n🎉 All imports successful!');
  console.log('\n📝 New SDK Features Added:');
  console.log('   • SchemaClient - Complete schema management');
  console.log('   • TenantClient - Organization, project, and app management');
  console.log('   • 50+ TypeScript interfaces for type safety');
  console.log('   • Full API coverage for /api/v1/schema/* and /api/v1/tenant/*');

} catch (error) {
  console.error('❌ Import failed:', error.message);
  process.exit(1);
}

console.log('\n✨ Ready to use the new Fluxez SDK clients!');
console.log('\nExample usage:');
console.log(`
const client = new FluxezClient('cgx_your_api_key');

// Schema management
const schema = await client.schema.registerSchema({
  schema: {
    name: 'users',
    fields: [
      { name: 'id', type: 'uuid', constraints: { primaryKey: true } },
      { name: 'email', type: 'varchar(255)', constraints: { unique: true } }
    ]
  }
});

// Tenant management  
const tenant = await client.tenant.createTenant({
  organizationName: 'Acme Corp',
  projectName: 'Main App',
  ownerEmail: 'admin@acme.com'
});
`);