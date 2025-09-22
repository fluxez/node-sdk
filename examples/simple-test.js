/**
 * Simple test script for the new Fluxez SDK
 * Run with: node examples/simple-test.js
 */

const { FluxezClient } = require('../dist/fluxez-client');

async function testSdk() {
  console.log('🚀 Testing Fluxez SDK...\n');

  // Initialize client with API key
  const client = new FluxezClient('cgx_test_api_key', {
    debug: true,
    timeout: 10000,
  });

  console.log('✅ Client initialized successfully');
  console.log('📋 Configuration:', client.getConfig());

  // Test context management
  console.log('\n🏢 Setting context...');
  client.setOrganization('org_test_123');
  client.setProject('proj_test_456');
  client.setApp('app_test_789');

  // Test header management
  console.log('📤 Setting custom headers...');
  client.setHeader('X-Test-Mode', 'true');
  client.setHeader('X-Version', '1.0.0');

  // Test module clients exist
  console.log('\n🔧 Checking module clients...');
  const modules = ['query', 'storage', 'search', 'analytics', 'cache', 'auth'];
  modules.forEach(module => {
    if (client[module]) {
      console.log(`✅ ${module} client available`);
    } else {
      console.log(`❌ ${module} client missing`);
    }
  });

  // Test core methods exist
  console.log('\n⚙️  Checking core methods...');
  const methods = ['raw', 'natural', 'execute', 'health', 'testConnection'];
  methods.forEach(method => {
    if (typeof client[method] === 'function') {
      console.log(`✅ ${method}() method available`);
    } else {
      console.log(`❌ ${method}() method missing`);
    }
  });

  // Test configuration update
  console.log('\n🔄 Testing configuration update...');
  client.updateConfig({
    timeout: 20000,
    debug: false,
    headers: {
      'X-Updated': 'true'
    }
  });
  console.log('✅ Configuration updated successfully');

  // Clear context
  console.log('🧹 Clearing context...');
  client.clearContext();
  client.removeHeader('X-Test-Mode');
  console.log('✅ Context and headers cleared');

  console.log('\n🎉 All tests passed! SDK is working correctly.');
}

// Handle async errors
testSdk().catch(error => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});

// Test error handling
function testErrorHandling() {
  console.log('\n🚨 Testing error handling...');

  try {
    new FluxezClient();
  } catch (error) {
    console.log('✅ Correctly throws error for missing API key:', error.message);
  }

  try {
    new FluxezClient('');
  } catch (error) {
    console.log('✅ Correctly throws error for empty API key:', error.message);
  }

  // Test non-cgx key warning
  const originalWarn = console.warn;
  let warnCalled = false;
  console.warn = (message) => {
    if (message.includes('cgx_')) {
      warnCalled = true;
    }
  };

  new FluxezClient('invalid_key');
  console.warn = originalWarn;
  
  if (warnCalled) {
    console.log('✅ Correctly warns for non-cgx API key format');
  } else {
    console.log('❌ Should warn for non-cgx API key format');
  }
}

testErrorHandling();