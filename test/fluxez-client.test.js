/**
 * Simple test to verify the new FluxezClient structure
 */
const { FluxezClient } = require('../dist/fluxez-client');

describe('FluxezClient', () => {
  let client;

  beforeAll(() => {
    // Initialize with a test API key
    client = new FluxezClient('cgx_test_api_key', {
      debug: false,
      timeout: 5000,
    });
  });

  test('should initialize with API key only', () => {
    expect(client).toBeDefined();
    expect(typeof client.raw).toBe('function');
    expect(typeof client.natural).toBe('function');
    expect(typeof client.execute).toBe('function');
  });

  test('should have all module clients', () => {
    expect(client.query).toBeDefined();
    expect(client.storage).toBeDefined();
    expect(client.search).toBeDefined();
    expect(client.analytics).toBeDefined();
    expect(client.cache).toBeDefined();
    expect(client.auth).toBeDefined();
  });

  test('should have context management methods', () => {
    expect(typeof client.setProject).toBe('function');
    expect(typeof client.setApp).toBe('function');
    expect(typeof client.setOrganization).toBe('function');
    expect(typeof client.clearContext).toBe('function');
  });

  test('should have header management methods', () => {
    expect(typeof client.setHeader).toBe('function');
    expect(typeof client.removeHeader).toBe('function');
  });

  test('should have utility methods', () => {
    expect(typeof client.health).toBe('function');
    expect(typeof client.testConnection).toBe('function');
    expect(typeof client.getConfig).toBe('function');
    expect(typeof client.updateConfig).toBe('function');
  });

  test('should allow configuration updates', () => {
    const originalConfig = client.getConfig();
    
    client.updateConfig({
      timeout: 10000,
      debug: true,
      headers: {
        'X-Test': 'value'
      }
    });

    const newConfig = client.getConfig();
    expect(newConfig.timeout).toBe(10000);
    expect(newConfig.debug).toBe(true);
    expect(newConfig.headers['X-Test']).toBe('value');
  });

  test('should handle context setting', () => {
    // These should not throw errors
    expect(() => {
      client.setOrganization('org_test');
      client.setProject('proj_test');
      client.setApp('app_test');
      client.clearContext();
    }).not.toThrow();
  });

  test('should handle header management', () => {
    // These should not throw errors
    expect(() => {
      client.setHeader('X-Custom', 'test-value');
      client.removeHeader('X-Custom');
    }).not.toThrow();
  });

  test('should throw error for missing API key', () => {
    expect(() => {
      new FluxezClient();
    }).toThrow('API key is required');
    
    expect(() => {
      new FluxezClient('');
    }).toThrow('API key is required');
  });

  test('should warn for non-cgx API keys', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    new FluxezClient('invalid_key_format');
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('API key should start with "cgx_"')
    );
    
    consoleSpy.mockRestore();
  });
});

// Test that the main exports work
describe('Main exports', () => {
  test('should export FluxezClient from main index', () => {
    const { FluxezClient } = require('../dist/index');
    expect(FluxezClient).toBeDefined();
    expect(typeof FluxezClient).toBe('function');
  });

  test('should export HttpClient', () => {
    const { HttpClient } = require('../dist/index');
    expect(HttpClient).toBeDefined();
    expect(typeof HttpClient).toBe('function');
  });

  test('should export types', () => {
    const exports = require('../dist/index');
    
    // Should have various type exports (they'll be undefined in JS but should exist)
    expect('ApiResponse' in exports).toBe(true);
    expect('QueryResult' in exports).toBe(true);
    expect('SearchResult' in exports).toBe(true);
  });
});