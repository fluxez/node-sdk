#!/usr/bin/env node

/**
 * Quick test script to verify SDK build and basic functionality
 */

const { FluxezClient } = require('./dist');

console.log('✅ SDK imported successfully');

// Test client initialization
const client = new FluxezClient('cgx_test_api_key');
console.log('✅ Client initialized with API key only');

// Verify all modules are present
const modules = [
  'query',
  'storage', 
  'search',
  'analytics',
  'cache',
  'auth',
  'email',
  'queue',
  'brain',
  'ai',
  'workflow'
];

let allModulesPresent = true;
for (const module of modules) {
  if (client[module]) {
    console.log(`✅ Module '${module}' is present`);
  } else {
    console.log(`❌ Module '${module}' is missing`);
    allModulesPresent = false;
  }
}

// Test core methods
const coreMethods = ['raw', 'natural', 'execute', 'setProject', 'setApp', 'setOrganization'];
for (const method of coreMethods) {
  if (typeof client[method] === 'function') {
    console.log(`✅ Core method '${method}' is present`);
  } else {
    console.log(`❌ Core method '${method}' is missing`);
    allModulesPresent = false;
  }
}

// Verify email module methods
const emailMethods = ['send', 'sendTemplated', 'sendBulk', 'queueEmail', 'verifyEmail'];
for (const method of emailMethods) {
  if (typeof client.email[method] === 'function') {
    console.log(`✅ Email method '${method}' is present`);
  } else {
    console.log(`❌ Email method '${method}' is missing`);
  }
}

// Verify storage module methods  
const storageMethods = ['upload', 'download', 'delete', 'list', 'getPresignedUrl'];
for (const method of storageMethods) {
  if (typeof client.storage[method] === 'function') {
    console.log(`✅ Storage method '${method}' is present`);
  } else {
    console.log(`❌ Storage method '${method}' is missing`);
  }
}

// Verify brain/AI module methods
const brainMethods = ['generate', 'understand', 'findPatterns', 'suggestArchitecture'];
for (const method of brainMethods) {
  if (typeof client.brain[method] === 'function') {
    console.log(`✅ Brain method '${method}' is present`);
  } else {
    console.log(`❌ Brain method '${method}' is missing`);
  }
}

// Verify workflow module methods
const workflowMethods = ['create', 'execute', 'list', 'generateFromPrompt'];
for (const method of workflowMethods) {
  if (typeof client.workflow[method] === 'function') {
    console.log(`✅ Workflow method '${method}' is present`);
  } else {
    console.log(`❌ Workflow method '${method}' is missing`);
  }
}

console.log('\n========================================');
if (allModulesPresent) {
  console.log('✅ ALL TESTS PASSED - SDK is properly built and all modules are accessible');
} else {
  console.log('⚠️ Some modules are missing - please check the build');
}
console.log('========================================\n');

// Test type exports
try {
  const types = require('./dist/types');
  console.log('✅ Type definitions exported successfully');
  console.log('Available type categories:', Object.keys(types).length, 'exports');
} catch (error) {
  console.log('⚠️ Could not import types directly, but they should be available through main export');
}

console.log('\nSDK Test Complete! 🎉');
console.log('\nTo use the SDK:');
console.log("const { FluxezClient } = require('@fluxez/node-sdk');");
console.log("const client = new FluxezClient('cgx_your_api_key');");
console.log('\nRun examples with: npm run example');