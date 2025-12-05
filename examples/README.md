# Fluxez SDK Examples

This directory contains example code demonstrating how to use the Fluxez Node SDK.

## Prerequisites

1. Install the SDK:
   ```bash
   npm install @fluxez/node-sdk
   ```

2. Set environment variables:
   ```bash
   export FLUXEZ_API_KEY=cgx_your_api_key
   export FLUXEZ_PROJECT_ID=proj_your_project_id
   ```

## Examples

### Authentication, Roles & Settings

**File:** `auth-roles-settings.ts`

Demonstrates:
- Configuring auth settings (password policies, email verification, session duration)
- Managing custom roles (create, list, delete)
- User registration and login
- Assigning roles to users

```bash
npx ts-node examples/auth-roles-settings.ts
```

## Quick Start

```typescript
import { FluxezClient } from '@fluxez/node-sdk';

const client = new FluxezClient('cgx_your_api_key');
client.setProject('proj_your_project_id');

// Get roles
const roles = await client.auth.getRoles();

// Get settings
const settings = await client.auth.getAuthSettings();

// Register user
const user = await client.auth.register({
  email: 'user@example.com',
  password: 'SecurePass123!',
  name: 'John Doe'
});

// Login
const { token, user } = await client.auth.login({
  email: 'user@example.com',
  password: 'SecurePass123!'
});
```

## Auto-Creation Behavior

The SDK automatically creates necessary tables when you first access them:

| Method | Creates |
|--------|---------|
| `getRoles()` | `auth.roles` table with default roles (admin, user) |
| `getAuthSettings()` | `auth.settings` table with default settings |
| `register()` | Both tables if not exist |

This means you don't need to manually set up database tables - they're created on first use.

## Types

The SDK exports TypeScript types for full type safety:

```typescript
import {
  FluxezClient,
  User,
  Role,
  AuthSettings,
  AuthToken
} from '@fluxez/node-sdk';
```

## More Examples

Check the main [README.md](../README.md) for more examples covering:
- Query Builder
- Storage
- Search
- Analytics
- Cache
- AI (Text, Image, Audio, Video)
- Workflow Automation
- Video Conferencing
- Document Processing
- Payment Management
- Email & Queue
