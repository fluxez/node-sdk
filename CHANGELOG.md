# Changelog

## [2.0.0] - 2024-09-09

### 🚀 Major Changes - New SDK Architecture

#### Simplified Client Initialization (Fluxez Pattern)
- **Breaking Change**: New `FluxezClient` constructor takes only an API key
- **Before**: `new FluxezClient({ baseUrl: '...', apiKey: '...', projectId: '...' })`
- **After**: `new FluxezClient('cgx_your_api_key')`
- Automatic API URL detection from environment or defaults to localhost
- Optional configuration object as second parameter

#### New Core Methods
- `client.raw(sql, params)` - Execute raw SQL queries
- `client.natural(query, context)` - Natural language to SQL conversion  
- `client.execute(sql, params)` - Execute INSERT/UPDATE/DELETE operations
- `client.testConnection()` - Test connection with latency measurement
- `client.health()` - Health check endpoint

#### Enhanced HTTP Client
- **New**: Dedicated `HttpClient` class with advanced features
- **Retry Logic**: Exponential backoff for failed requests
- **Authentication**: Automatic Bearer token handling for `cgx_` keys  
- **Request/Response Interceptors**: Built-in logging and error handling
- **Type Safety**: Full TypeScript support with proper error types

#### Context Management
- `client.setProject(projectId)` - Set project context
- `client.setApp(appId)` - Set app context  
- `client.setOrganization(orgId)` - Set organization context
- `client.clearContext()` - Clear all context headers
- `client.setHeader(key, value)` - Set custom headers
- `client.removeHeader(key)` - Remove headers

#### Configuration Management
- `client.getConfig()` - Get current configuration (without sensitive data)
- `client.updateConfig(updates)` - Update configuration dynamically
- Support for custom headers, timeouts, retry settings
- Debug mode with detailed logging

#### Comprehensive Type Definitions
- **New**: Complete type definitions in `/types/index.ts`
- Core API types: `ApiResponse`, `QueryResult`, `SearchResult`, etc.
- Authentication types: `AuthUser`, `LoginCredentials`, `AuthToken`
- Storage types: `UploadOptions`, `UploadResult`, `FileMetadata`
- Analytics types: `AnalyticsQuery`, `AnalyticsResult`, `EventData`
- Cache types: `CacheOperation`, `CacheStats`, `CacheOptions`
- Workflow types: `WorkflowDefinition`, `WorkflowExecution`
- Error types: `FluxezError` with proper error codes

#### Backward Compatibility
- Legacy client available as `FluxezClientLegacy`
- All existing module clients remain unchanged
- Existing query builder, storage, search, analytics, cache, auth clients work as before

#### Developer Experience
- **Examples**: Complete usage examples in `/examples/basic-usage.ts`
- **Testing**: Simple test script in `/examples/simple-test.js`
- **Documentation**: Updated README with new patterns
- **Type Safety**: Full TypeScript support throughout

#### Performance & Reliability
- Automatic request retries with exponential backoff
- Connection pooling and timeout management
- Error recovery and detailed error reporting
- Request/response logging in development mode

### Migration Guide

#### From v1.x to v2.0

**Old way:**
```typescript
const client = new FluxezClient({
  baseUrl: 'https://api.fluxez.com',
  apiKey: 'cgx_your_key',
  projectId: 'proj_123'
});
```

**New way:**
```typescript
const client = new FluxezClient('cgx_your_key');
client.setProject('proj_123');
```

**Optional configuration:**
```typescript
const client = new FluxezClient('cgx_your_key', {
  apiUrl: 'https://api.fluxez.com/v1',
  timeout: 30000,
  debug: true
});
```

### Files Added
- `/src/fluxez-client.ts` - New main client with simplified API
- `/src/core/http-client.ts` - Enhanced HTTP client with retry logic
- `/src/types/index.ts` - Comprehensive type definitions
- `/examples/basic-usage.ts` - Complete usage examples
- `/examples/simple-test.js` - Simple test script
- `/test/fluxez-client.test.js` - Unit tests for new client

### Files Modified
- `/src/index.ts` - Updated exports to include new client
- `/README.md` - Updated documentation with new patterns

### Notes
- API keys should start with `cgx_` for proper authentication
- Environment variable `FLUXEZ_API_URL` can set default API URL
- All module clients (query, storage, search, etc.) remain fully functional
- New client automatically handles authentication headers and context