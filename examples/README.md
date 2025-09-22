# Fluxez SDK Examples

This directory contains comprehensive examples demonstrating how to use the Fluxez Node.js SDK for various features and use cases.

## Prerequisites

1. **API Key**: Get your API key from the Fluxez dashboard
2. **Environment**: Set up your environment variables or provide the API key directly
3. **Backend**: Make sure your Fluxez backend is running (default: `http://localhost:3000`)

## Environment Setup

Create a `.env` file in your project root:

```env
FLUXEZ_API_KEY=cgx_your_api_key_here
FLUXEZ_API_URL=http://localhost:3000/api/v1
```

Or set these environment variables in your shell:

```bash
export FLUXEZ_API_KEY=cgx_your_api_key_here
export FLUXEZ_API_URL=http://localhost:3000/api/v1
```

## Running the Examples

### Option 1: Node.js (JavaScript)
```bash
# Install dependencies
npm install

# Run individual examples
node examples/01-quick-start.js
node examples/02-data-operations.js
node examples/03-email.js
# ... etc
```

### Option 2: TypeScript (with ts-node)
```bash
# Install ts-node if not already installed
npm install -g ts-node

# Run TypeScript examples directly
ts-node examples/01-quick-start.ts
ts-node examples/02-data-operations.ts
# ... etc
```

### Option 3: From the examples directory
```bash
cd examples
node 01-quick-start.js
node 02-data-operations.js
# ... etc
```

## Examples Overview

### 1. Quick Start (`01-quick-start.js`)
- **Focus**: Getting started quickly
- **Features**: Basic initialization, simple query, email sending, file upload
- **Time**: 5 minutes
- **Good for**: First-time users, proof of concept

### 2. Data Operations (`02-data-operations.js`)
- **Focus**: Database operations and queries
- **Features**: Raw SQL, natural language queries, CRUD operations, transactions
- **Time**: 10 minutes  
- **Good for**: Backend developers, data management

### 3. Email Examples (`03-email.js`)
- **Focus**: Email functionality
- **Features**: Simple email, templates, bulk sending, queued emails
- **Time**: 10 minutes
- **Good for**: Email automation, marketing campaigns

### 4. Storage Examples (`04-storage.js`)
- **Focus**: File storage and management
- **Features**: Upload, download, presigned URLs, file listing, search
- **Time**: 10 minutes
- **Good for**: File management, content delivery

### 5. Queue Examples (`05-queue.js`)
- **Focus**: Message queuing and processing
- **Features**: Send messages, receive messages, queue management
- **Time**: 10 minutes
- **Good for**: Background processing, event-driven architecture

### 6. Search & Analytics (`06-search-analytics.js`)
- **Focus**: Search and analytics capabilities
- **Features**: Full-text search, vector search, analytics queries, event tracking
- **Time**: 15 minutes
- **Good for**: Search features, business intelligence

### 7. AI/Brain Examples (`07-ai-brain.js`)
- **Focus**: AI-powered app generation
- **Features**: App generation, requirement understanding, pattern matching
- **Time**: 15 minutes
- **Good for**: AI-powered development, rapid prototyping

### 8. Workflow Examples (`08-workflows.js`)
- **Focus**: Workflow automation
- **Features**: Workflow creation, execution, prompt-based generation
- **Time**: 15 minutes
- **Good for**: Business process automation

### 9. Cache Examples (`09-cache.js`)
- **Focus**: Caching operations
- **Features**: Set/get cache, invalidation, performance optimization
- **Time**: 10 minutes
- **Good for**: Performance optimization, data caching

### 10. Complete App Example (`10-complete-app.js`)
- **Focus**: Full application example
- **Features**: Combines multiple SDK features in a realistic scenario
- **Time**: 20 minutes
- **Good for**: Understanding complete workflows, architecture patterns

### 🆕 11. Tenant Authentication (`11-tenant-auth.js`)
- **Focus**: End-user authentication system
- **Features**: Registration, login, social auth, teams, email verification, password reset
- **Time**: 15 minutes
- **Good for**: User management, authentication flows, team collaboration

### 🆕 12. Schema Management (`12-schema-management.js`)
- **Focus**: Database schema operations
- **Features**: Schema registration, migrations, table configuration, indexing
- **Time**: 20 minutes
- **Good for**: Database management, schema evolution, performance tuning

### 🆕 13. Tenant Management (`13-tenant-management.js`)
- **Focus**: Multi-tenant platform management
- **Features**: Organizations, projects, apps, API keys, resource quotas, billing
- **Time**: 25 minutes
- **Good for**: SaaS platforms, multi-tenant architecture, platform administration

## Common Patterns

### Error Handling
All examples include proper error handling:

```javascript
try {
  const result = await client.someOperation();
  console.log('Success:', result);
} catch (error) {
  console.error('Error:', error.message);
  if (error.code) {
    console.error('Error Code:', error.code);
  }
}
```

### Context Setting
Examples show how to set project/app context:

```javascript
// Set context for multi-tenant operations
client.setOrganization('org_12345');
client.setProject('proj_67890');
client.setApp('app_abcdef');
```

### Async/Await vs Promises
Examples primarily use async/await but also show promise patterns:

```javascript
// Async/await (recommended)
const result = await client.query.select('users').execute();

// Promise chain (alternative)
client.query.select('users').execute()
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

## Tips for Success

1. **Start with Quick Start**: Begin with `01-quick-start.js` to verify your setup
2. **Read the Comments**: Each example is heavily commented with explanations
3. **Modify and Experiment**: Change parameters and see what happens
4. **Check the Backend**: Ensure your Fluxez backend is running and accessible
5. **Use Debug Mode**: Set `debug: true` in client config for detailed logging
6. **Environment Variables**: Use environment variables for sensitive data

## Troubleshooting

### Common Issues

**Connection Errors**:
```
Error: connect ECONNREFUSED 127.0.0.1:3000
```
- Solution: Make sure the Fluxez backend is running on `http://localhost:3000`

**Authentication Errors**:
```
Error: 401 Unauthorized
```
- Solution: Check that your API key is correct and starts with `cgx_`

**Invalid API Key Format**:
```
Warning: API key should start with "cgx_"
```
- Solution: Get a proper API key from the Fluxez dashboard

**Timeout Errors**:
```
Error: timeout of 30000ms exceeded
```
- Solution: Increase timeout in client config or check backend performance

### Debug Mode

Enable debug mode for detailed logging:

```javascript
const client = new FluxezClient('cgx_your_api_key', {
  debug: true,
  timeout: 60000, // Increase timeout if needed
});
```

### Getting Help

1. **Documentation**: Check the main SDK documentation
2. **Issues**: Report issues on the Fluxez GitHub repository
3. **Community**: Join the Fluxez Discord community
4. **Support**: Contact support@fluxez.com for enterprise support

## Next Steps

After running these examples:

1. **Build Your App**: Use the patterns learned to build your application
2. **Explore Advanced Features**: Dive deeper into specific modules you need
3. **Performance Optimization**: Use caching and analytics for optimization
4. **Production Deployment**: Follow the production deployment guide
5. **Monitoring**: Set up monitoring and alerting for your application

## Contributing

Found an issue or want to improve an example? Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

These examples are provided under the same license as the Fluxez SDK.