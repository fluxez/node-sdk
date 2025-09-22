/**
 * Fluxez Node.js SDK - Tenant Authentication Examples
 * 
 * This example demonstrates comprehensive tenant authentication features including:
 * - User registration and login
 * - Email verification and password reset
 * - Social authentication (Google, GitHub, Facebook, etc.)
 * - Team management (create, invite, roles)
 * - User profiles and session management
 * 
 * This is an end-user authentication system for your app's users (not platform management).
 */

const Fluxez = require('../dist/index');

// Configuration
const config = {
  apiKey: 'cgx_your_app_api_key', // Use app-level API key for tenant auth
  baseUrl: process.env.FLUXEZ_BASE_URL || 'http://localhost:3000'
};

const fluxez = new Fluxez(config);

async function demonstrateTenantAuth() {
  console.log('🔐 Fluxez Tenant Authentication Examples\n');
  console.log('==========================================\n');

  try {
    // 1. User Registration
    await demonstrateUserRegistration();

    // 2. User Login and Session Management
    await demonstrateUserLogin();

    // 3. Email Verification Flow
    await demonstrateEmailVerification();

    // 4. Password Reset Flow
    await demonstratePasswordReset();

    // 5. Social Authentication
    await demonstrateSocialAuth();

    // 6. Team Management
    await demonstrateTeamManagement();

    // 7. Advanced Authentication Features
    await demonstrateAdvancedAuth();

    console.log('\n✅ All tenant authentication examples completed successfully!');

  } catch (error) {
    console.error('\n❌ Error in tenant authentication examples:', error);
    
    // Log detailed error information
    if (error.code) {
      console.error(`Error Code: ${error.code}`);
    }
    if (error.statusCode) {
      console.error(`Status Code: ${error.statusCode}`);
    }
    if (error.details) {
      console.error('Error Details:', JSON.stringify(error.details, null, 2));
    }
  }
}

/**
 * Demonstrate user registration with various options
 */
async function demonstrateUserRegistration() {
  console.log('👤 User Registration Examples');
  console.log('-----------------------------\n');

  try {
    // Basic user registration
    console.log('1. Basic User Registration:');
    const user1 = await fluxez.tenantAuth.register({
      email: 'john.doe@example.com',
      password: 'SecurePassword123!',
      fullName: 'John Doe'
    });
    console.log('✅ User registered:', {
      id: user1.id,
      email: user1.email,
      emailVerified: user1.emailVerified
    });

    // Registration with metadata
    console.log('\n2. Registration with Custom Metadata:');
    const user2 = await fluxez.tenantAuth.register({
      email: 'jane.smith@example.com',
      password: 'SecurePassword123!',
      fullName: 'Jane Smith',
      metadata: {
        department: 'Engineering',
        role: 'Senior Developer',
        preferences: {
          newsletter: true,
          notifications: true
        },
        onboardingStep: 1
      },
      frontendUrl: 'https://myapp.com/verify-email'
    });
    console.log('✅ User with metadata registered:', {
      id: user2.id,
      email: user2.email,
      fullName: user2.fullName
    });

    // Registration with validation example
    console.log('\n3. Registration Validation Handling:');
    try {
      await fluxez.tenantAuth.register({
        email: 'invalid-email', // Invalid email format
        password: '123', // Weak password
        fullName: ''
      });
    } catch (validationError) {
      console.log('✅ Validation error caught correctly:', validationError.message);
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Registration error:', error);
    throw error;
  }
}

/**
 * Demonstrate user login and session management
 */
async function demonstrateUserLogin() {
  console.log('🔑 User Login and Session Management');
  console.log('------------------------------------\n');

  try {
    // Basic login
    console.log('1. Basic User Login:');
    const loginResponse = await fluxez.tenantAuth.login({
      email: 'john.doe@example.com',
      password: 'SecurePassword123!'
    });
    console.log('✅ Login successful:', {
      accessToken: loginResponse.accessToken ? 'Present' : 'Missing',
      refreshToken: loginResponse.refreshToken ? 'Present' : 'Missing',
      user: {
        id: loginResponse.user.id,
        email: loginResponse.user.email,
        emailVerified: loginResponse.user.emailVerified
      }
    });

    // Check authentication status
    console.log('\n2. Check Authentication Status:');
    console.log('✅ Is authenticated:', fluxez.tenantAuth.isAuthenticated());
    console.log('✅ Current user:', fluxez.tenantAuth.getCurrentUser());

    // Token refresh
    console.log('\n3. Token Refresh:');
    const refreshResponse = await fluxez.tenantAuth.refreshToken({
      refreshToken: loginResponse.refreshToken
    });
    console.log('✅ Token refreshed:', {
      accessToken: refreshResponse.accessToken ? 'New token issued' : 'No token',
      user: refreshResponse.user.email
    });

    // Login with invalid credentials
    console.log('\n4. Invalid Login Handling:');
    try {
      await fluxez.tenantAuth.login({
        email: 'john.doe@example.com',
        password: 'WrongPassword'
      });
    } catch (loginError) {
      console.log('✅ Invalid login handled correctly:', loginError.message);
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
}

/**
 * Demonstrate email verification flow
 */
async function demonstrateEmailVerification() {
  console.log('📧 Email Verification Flow');
  console.log('--------------------------\n');

  try {
    // In a real application, the token would come from the email link
    console.log('1. Email Verification Process:');
    console.log('📝 Note: In real app, verification token comes from email link');
    
    // Simulate email verification token (in real app this comes from email)
    const mockVerificationToken = 'verify_token_from_email_link';
    
    try {
      await fluxez.tenantAuth.verifyEmail({
        token: mockVerificationToken
      });
      console.log('✅ Email verification would succeed with valid token');
    } catch (verifyError) {
      console.log('✅ Verification error handled (expected with mock token):', verifyError.message);
    }

    // Show how verification affects user state
    console.log('\n2. User State After Verification:');
    const currentUser = fluxez.tenantAuth.getCurrentUser();
    if (currentUser) {
      console.log('Current user email verified status:', currentUser.emailVerified);
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Email verification error:', error);
    throw error;
  }
}

/**
 * Demonstrate password reset flow
 */
async function demonstratePasswordReset() {
  console.log('🔒 Password Reset Flow');
  console.log('---------------------\n');

  try {
    // Request password reset
    console.log('1. Request Password Reset:');
    await fluxez.tenantAuth.forgotPassword({
      email: 'john.doe@example.com',
      frontendUrl: 'https://myapp.com/reset-password'
    });
    console.log('✅ Password reset email requested');

    // Reset password with token
    console.log('\n2. Reset Password with Token:');
    console.log('📝 Note: In real app, reset token comes from email link');
    
    const mockResetToken = 'reset_token_from_email_link';
    
    try {
      await fluxez.tenantAuth.resetPassword({
        token: mockResetToken,
        newPassword: 'NewSecurePassword123!'
      });
      console.log('✅ Password reset would succeed with valid token');
    } catch (resetError) {
      console.log('✅ Reset error handled (expected with mock token):', resetError.message);
    }

    // Handle invalid reset attempts
    console.log('\n3. Invalid Reset Token Handling:');
    try {
      await fluxez.tenantAuth.resetPassword({
        token: 'invalid_token',
        newPassword: 'NewPassword123!'
      });
    } catch (invalidResetError) {
      console.log('✅ Invalid reset token handled correctly:', invalidResetError.message);
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Password reset error:', error);
    throw error;
  }
}

/**
 * Demonstrate social authentication
 */
async function demonstrateSocialAuth() {
  console.log('🌐 Social Authentication');
  console.log('------------------------\n');

  try {
    // Get available social providers
    console.log('1. Get Available Social Providers:');
    const providers = await fluxez.tenantAuth.getSocialProviders();
    console.log('✅ Available providers:', providers.map(p => ({
      provider: p.provider,
      configured: p.configured,
      enabled: p.enabled
    })));

    // Google authentication example
    console.log('\n2. Google Authentication Example:');
    try {
      const googleAuthResponse = await fluxez.tenantAuth.socialAuth({
        provider: 'google',
        providerId: 'google_user_id_123',
        email: 'user@gmail.com',
        name: 'John Doe',
        avatarUrl: 'https://avatar.url/image.jpg',
        providerData: {
          googleId: 'google_user_id_123',
          locale: 'en-US',
          verifiedEmail: true
        }
      });
      console.log('✅ Google auth successful:', {
        user: googleAuthResponse.user.email,
        accessToken: googleAuthResponse.accessToken ? 'Present' : 'Missing'
      });
    } catch (socialAuthError) {
      console.log('✅ Social auth error handled:', socialAuthError.message);
    }

    // GitHub authentication example
    console.log('\n3. GitHub Authentication Example:');
    try {
      const githubAuthResponse = await fluxez.tenantAuth.socialAuth({
        provider: 'github',
        providerId: 'github_user_id_456',
        email: 'developer@github.com',
        name: 'GitHub Developer',
        avatarUrl: 'https://github.com/avatar.jpg',
        providerData: {
          githubId: 'github_user_id_456',
          username: 'developer123',
          publicRepos: 42
        }
      });
      console.log('✅ GitHub auth successful:', {
        user: githubAuthResponse.user.email,
        accessToken: githubAuthResponse.accessToken ? 'Present' : 'Missing'
      });
    } catch (githubAuthError) {
      console.log('✅ GitHub auth error handled:', githubAuthError.message);
    }

    // Link social account to existing user
    console.log('\n4. Link Social Account to Existing User:');
    try {
      await fluxez.tenantAuth.linkSocial({
        provider: 'facebook',
        providerId: 'facebook_user_id_789',
        providerData: {
          facebookId: 'facebook_user_id_789',
          picture: 'https://facebook.com/profile.jpg'
        }
      });
      console.log('✅ Facebook account linked successfully');
    } catch (linkError) {
      console.log('✅ Social linking error handled:', linkError.message);
    }

    // Configure social provider (admin only)
    console.log('\n5. Configure Social Provider (Admin Only):');
    try {
      await fluxez.tenantAuth.configureSocialProvider({
        provider: 'google',
        clientId: 'your_google_client_id',
        clientSecret: 'your_google_client_secret',
        redirectUri: 'https://myapp.com/auth/google/callback',
        scopes: ['email', 'profile'],
        enabled: true
      });
      console.log('✅ Google provider configured');
    } catch (configError) {
      console.log('✅ Provider config error handled:', configError.message);
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Social authentication error:', error);
    throw error;
  }
}

/**
 * Demonstrate team management features
 */
async function demonstrateTeamManagement() {
  console.log('👥 Team Management');
  console.log('------------------\n');

  let teamId;

  try {
    // Create a new team
    console.log('1. Create New Team:');
    const team = await fluxez.tenantAuth.createTeam({
      name: 'Engineering Team',
      description: 'Main engineering team for product development',
      settings: {
        allowInvitations: true,
        requireApproval: false,
        defaultRole: 'member'
      }
    });
    teamId = team.id;
    console.log('✅ Team created:', {
      id: team.id,
      name: team.name,
      description: team.description
    });

    // Get user's teams
    console.log('\n2. Get User Teams:');
    const userTeams = await fluxez.tenantAuth.getTeams();
    console.log('✅ User teams:', userTeams.map(t => ({
      id: t.id,
      name: t.name,
      role: t.role,
      joinedAt: t.joinedAt
    })));

    // Invite member to team
    console.log('\n3. Invite Team Member:');
    try {
      await fluxez.tenantAuth.inviteMember({
        teamId: teamId,
        email: 'new.member@example.com',
        role: 'editor',
        frontendUrl: 'https://myapp.com/accept-invitation'
      });
      console.log('✅ Team invitation sent to new.member@example.com');
    } catch (inviteError) {
      console.log('✅ Invitation error handled:', inviteError.message);
    }

    // Accept team invitation (simulated)
    console.log('\n4. Accept Team Invitation:');
    try {
      const mockInvitationToken = 'invitation_token_from_email';
      await fluxez.tenantAuth.acceptInvitation({
        token: mockInvitationToken
      });
      console.log('✅ Invitation accepted');
    } catch (acceptError) {
      console.log('✅ Invitation acceptance error handled (expected with mock token):', acceptError.message);
    }

    // Get team members
    console.log('\n5. Get Team Members:');
    const teamMembers = await fluxez.tenantAuth.getTeamMembers(teamId);
    console.log('✅ Team members:', teamMembers.map(m => ({
      email: m.email,
      role: m.role,
      joinedAt: m.joinedAt,
      emailVerified: m.emailVerified
    })));

    // Update member role
    console.log('\n6. Update Member Role:');
    try {
      // This would typically use a real user ID
      const mockUserId = 'mock_user_id';
      await fluxez.tenantAuth.updateMemberRole({
        teamId: teamId,
        userId: mockUserId,
        newRole: 'admin'
      });
      console.log('✅ Member role updated to admin');
    } catch (roleError) {
      console.log('✅ Role update error handled:', roleError.message);
    }

    // Remove member from team
    console.log('\n7. Remove Team Member:');
    try {
      const mockUserId = 'mock_user_id';
      await fluxez.tenantAuth.removeMember({
        teamId: teamId,
        userId: mockUserId
      });
      console.log('✅ Member removed from team');
    } catch (removeError) {
      console.log('✅ Member removal error handled:', removeError.message);
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Team management error:', error);
    throw error;
  }
}

/**
 * Demonstrate advanced authentication features
 */
async function demonstrateAdvancedAuth() {
  console.log('🚀 Advanced Authentication Features');
  console.log('-----------------------------------\n');

  try {
    // Authentication state management
    console.log('1. Authentication State Management:');
    console.log('Current user:', fluxez.tenantAuth.getCurrentUser());
    console.log('Is authenticated:', fluxez.tenantAuth.isAuthenticated());

    // Session cleanup
    console.log('\n2. Session Management:');
    console.log('Clearing local authentication state...');
    fluxez.tenantAuth.clearAuth();
    console.log('✅ Local auth state cleared');
    console.log('Is authenticated after clear:', fluxez.tenantAuth.isAuthenticated());

    // Logout with cleanup
    console.log('\n3. Proper Logout:');
    try {
      // Login again to demonstrate logout
      const loginResponse = await fluxez.tenantAuth.login({
        email: 'john.doe@example.com',
        password: 'SecurePassword123!'
      });
      console.log('✅ Logged in for logout demo');

      // Logout with refresh token cleanup
      await fluxez.tenantAuth.logout({
        refreshToken: loginResponse.refreshToken
      });
      console.log('✅ Logged out with token cleanup');
      console.log('Is authenticated after logout:', fluxez.tenantAuth.isAuthenticated());

    } catch (logoutError) {
      console.log('✅ Logout error handled:', logoutError.message);
    }

    // Error handling examples
    console.log('\n4. Error Handling Examples:');
    
    // Network error simulation
    console.log('Network error handling:');
    try {
      // This would typically cause a network error in a real scenario
      await fluxez.tenantAuth.login({
        email: 'test@example.com',
        password: 'password'
      });
    } catch (networkError) {
      if (networkError.name === 'TenantAuthNetworkError') {
        console.log('✅ Network error detected and handled');
      } else if (networkError.name === 'TenantAuthApiError') {
        console.log('✅ API error detected and handled');
      } else {
        console.log('✅ Generic error handled:', networkError.message);
      }
    }

    // Validation error demonstration
    console.log('\nValidation error handling:');
    try {
      await fluxez.tenantAuth.register({
        email: '', // Empty email
        password: '', // Empty password
        fullName: ''
      });
    } catch (validationError) {
      console.log('✅ Validation error handled:', validationError.message);
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Advanced auth error:', error);
    throw error;
  }
}

/**
 * Real-world usage scenarios
 */
async function demonstrateRealWorldScenarios() {
  console.log('🌍 Real-World Usage Scenarios');
  console.log('-----------------------------\n');

  try {
    // E-commerce user registration and login
    console.log('1. E-commerce User Flow:');
    
    // Register customer
    const customer = await fluxez.tenantAuth.register({
      email: 'customer@shop.com',
      password: 'CustomerPass123!',
      fullName: 'Shop Customer',
      metadata: {
        userType: 'customer',
        preferences: {
          marketing: true,
          orderNotifications: true
        },
        address: {
          country: 'US',
          timezone: 'America/New_York'
        }
      }
    });
    console.log('✅ E-commerce customer registered');

    // SaaS application user onboarding
    console.log('\n2. SaaS User Onboarding:');
    
    const saasUser = await fluxez.tenantAuth.register({
      email: 'user@saas.com',
      password: 'SaaSPass123!',
      fullName: 'SaaS User',
      metadata: {
        plan: 'pro',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        onboardingCompleted: false,
        features: {
          analytics: true,
          api: true,
          exports: true
        }
      }
    });
    console.log('✅ SaaS user registered with trial');

    // Mobile app user with social login
    console.log('\n3. Mobile App Social Login:');
    
    const mobileUser = await fluxez.tenantAuth.socialAuth({
      provider: 'apple',
      providerId: 'apple_user_id_xyz',
      email: 'user@icloud.com',
      name: 'Mobile User',
      providerData: {
        appleId: 'apple_user_id_xyz',
        authorizationCode: 'apple_auth_code',
        identityToken: 'apple_identity_token'
      }
    });
    console.log('✅ Mobile user authenticated via Apple');

    console.log('\n');

  } catch (error) {
    console.error('❌ Real-world scenario error:', error);
    throw error;
  }
}

// Helper function to simulate real-world authentication flow
async function simulateAuthenticationFlow() {
  console.log('🔄 Complete Authentication Flow Simulation');
  console.log('------------------------------------------\n');

  try {
    let userEmail = 'flowtest@example.com';
    
    // 1. User Registration
    console.log('Step 1: User Registration');
    const user = await fluxez.tenantAuth.register({
      email: userEmail,
      password: 'FlowTest123!',
      fullName: 'Flow Test User',
      metadata: {
        source: 'demo',
        registrationDate: new Date().toISOString()
      }
    });
    console.log('✅ User registered with ID:', user.id);

    // 2. Email Verification (simulated)
    console.log('\nStep 2: Email Verification (simulated)');
    console.log('📧 Verification email would be sent to:', userEmail);
    console.log('✅ In production, user clicks verification link');

    // 3. User Login
    console.log('\nStep 3: User Login');
    const loginResponse = await fluxez.tenantAuth.login({
      email: userEmail,
      password: 'FlowTest123!'
    });
    console.log('✅ User logged in successfully');

    // 4. Create Team
    console.log('\nStep 4: Create Team');
    const team = await fluxez.tenantAuth.createTeam({
      name: 'Demo Team',
      description: 'Demonstration team for flow test'
    });
    console.log('✅ Team created:', team.name);

    // 5. Invite Team Member
    console.log('\nStep 5: Invite Team Member');
    await fluxez.tenantAuth.inviteMember({
      teamId: team.id,
      email: 'teammate@example.com',
      role: 'editor',
      frontendUrl: 'https://demo.com/invite'
    });
    console.log('✅ Team invitation sent');

    // 6. Token Refresh
    console.log('\nStep 6: Token Refresh');
    const refreshedAuth = await fluxez.tenantAuth.refreshToken({
      refreshToken: loginResponse.refreshToken
    });
    console.log('✅ Token refreshed successfully');

    // 7. Logout
    console.log('\nStep 7: User Logout');
    await fluxez.tenantAuth.logout({
      refreshToken: refreshedAuth.refreshToken
    });
    console.log('✅ User logged out with cleanup');

    console.log('\n🎉 Complete authentication flow simulation completed!');

  } catch (error) {
    console.error('❌ Flow simulation error:', error);
    throw error;
  }
}

// Run the examples
if (require.main === module) {
  demonstrateTenantAuth()
    .then(() => {
      console.log('\n📚 Additional Examples:');
      console.log('- Check examples/README.md for more use cases');
      console.log('- See playground/ for interactive testing');
      console.log('- Visit https://docs.fluxez.com for full documentation');
    })
    .catch(console.error);
}

module.exports = {
  demonstrateTenantAuth,
  demonstrateUserRegistration,
  demonstrateUserLogin,
  demonstrateEmailVerification,
  demonstratePasswordReset,
  demonstrateSocialAuth,
  demonstrateTeamManagement,
  demonstrateAdvancedAuth,
  demonstrateRealWorldScenarios,
  simulateAuthenticationFlow
};