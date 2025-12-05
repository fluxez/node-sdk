/**
 * Fluxez SDK - Authentication, Roles & Settings Example
 *
 * This example demonstrates:
 * - User authentication (login, register)
 * - Role management (create, list, delete, assign)
 * - Auth settings configuration
 */

import { FluxezClient, Role, AuthSettings, User } from '@fluxez/node-sdk';

// Initialize client with your API key
const client = new FluxezClient(process.env.FLUXEZ_API_KEY || 'cgx_your_api_key');

// Set project context (required for tenant operations)
client.setProject(process.env.FLUXEZ_PROJECT_ID || 'proj_your_project_id');

async function main() {
  try {
    // ============================================
    // 1. AUTH SETTINGS CONFIGURATION
    // ============================================
    console.log('\n=== Auth Settings ===\n');

    // Get current settings (auto-creates table with defaults if not exists)
    const currentSettings = await client.auth.getAuthSettings();
    console.log('Current settings:', {
      requireEmailVerification: currentSettings.requireEmailVerification,
      minPasswordLength: currentSettings.minPasswordLength,
      allowRegistration: currentSettings.allowRegistration,
      defaultRole: currentSettings.defaultRole
    });

    // Update settings for your application
    await client.auth.updateAuthSettings({
      // Enable email verification for new users
      requireEmailVerification: true,
      verificationUrl: 'https://myapp.com/verify-email',
      verificationEmailSubject: 'Welcome! Please verify your email',

      // Strong password policy
      minPasswordLength: 10,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,

      // Session configuration
      sessionDurationHours: 24,
      refreshTokenDurationDays: 30,

      // Registration settings
      allowRegistration: true,
      defaultRole: 'user'
    });
    console.log('Auth settings updated!');

    // ============================================
    // 2. ROLE MANAGEMENT
    // ============================================
    console.log('\n=== Role Management ===\n');

    // Get all roles (auto-creates table with default roles if not exists)
    const roles = await client.auth.getRoles();
    console.log('Available roles:', roles.map(r => `${r.name} (${r.isDefault ? 'default' : 'custom'})`));

    // Create custom roles for your application
    const customRoles = [
      { name: 'editor', description: 'Can create and edit content' },
      { name: 'moderator', description: 'Can moderate user content and comments' },
      { name: 'viewer', description: 'Read-only access' }
    ];

    for (const roleData of customRoles) {
      try {
        const role = await client.auth.createRole(roleData);
        console.log(`Created role: ${role.name}`);
      } catch (error: any) {
        // Role might already exist
        if (error.message?.includes('already exists')) {
          console.log(`Role "${roleData.name}" already exists`);
        } else {
          throw error;
        }
      }
    }

    // List all roles again
    const allRoles = await client.auth.getRoles();
    console.log('\nAll roles:');
    allRoles.forEach(role => {
      console.log(`  - ${role.name}: ${role.description || 'No description'}`);
    });

    // ============================================
    // 3. USER REGISTRATION WITH SETTINGS
    // ============================================
    console.log('\n=== User Registration ===\n');

    // Register a new user (will use settings for password validation, default role, etc.)
    try {
      const newUser = await client.auth.register({
        email: 'newuser@example.com',
        password: 'SecurePass123!', // Must meet password policy
        name: 'New User'
      });
      console.log('User registered:', {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      });

      // If email verification is required, user will receive verification email
      if (currentSettings.requireEmailVerification) {
        console.log('Verification email sent to:', newUser.email);
      }
    } catch (error: any) {
      console.log('Registration error:', error.message);
    }

    // ============================================
    // 4. USER LOGIN
    // ============================================
    console.log('\n=== User Login ===\n');

    try {
      const loginResult = await client.auth.login({
        email: 'existinguser@example.com',
        password: 'SecurePass123!'
      });

      console.log('Login successful:', {
        userId: loginResult.user.id,
        email: loginResult.user.email,
        role: loginResult.user.role,
        tokenExpiry: loginResult.expiresIn
      });

      // Use the token for authenticated requests
      // The token is a JWT signed by Fluxez backend
      console.log('Access token received (use this for authenticated requests)');

    } catch (error: any) {
      console.log('Login error:', error.message);
    }

    // ============================================
    // 5. ASSIGN ROLES TO USERS
    // ============================================
    console.log('\n=== Assign Roles ===\n');

    // List users
    const { users } = await client.auth.listUsers({ limit: 10 });
    console.log(`Found ${users.length} users`);

    // Update a user's role
    if (users.length > 0) {
      const targetUser = users[0];
      await client.auth.updateUserRole(targetUser.id, 'editor');
      console.log(`Updated ${targetUser.email} role to "editor"`);
    }

    // ============================================
    // 6. CLEANUP (Optional - delete custom role)
    // ============================================
    console.log('\n=== Cleanup ===\n');

    // Find and delete the 'viewer' role we created
    const viewerRole = allRoles.find(r => r.name === 'viewer');
    if (viewerRole && !viewerRole.isDefault) {
      await client.auth.deleteRole(viewerRole.id);
      console.log('Deleted "viewer" role');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
main();
