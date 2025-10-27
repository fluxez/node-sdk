/**
 * Tenant Auth Example
 * 
 * This example demonstrates how to use the TenantAuthClient 
 * for tenant-specific authentication operations.
 */

const { FluxezClient, SocialProvider, TeamRole } = require('../dist');

async function main() {
  // Initialize client with API key
  const client = new FluxezClient('cgx_your_api_key_here', {
    
    debug: true
  });

  try {
    console.log('🚀 Tenant Auth Client Example');
    
    // Set project and app context
    client.setProject('your-project-id');
    client.setApp('your-app-id');
    
    // Register a new tenant user
    console.log('\n📝 Registering new tenant user...');
    const newUser = await client.tenantAuth.register({
      email: 'newuser@example.com',
      password: 'SecurePass123!',
      fullName: 'John Doe',
      metadata: { source: 'web', plan: 'free' }
    });
    console.log('User registered:', newUser);
    
    // Login
    console.log('\n🔑 Logging in tenant user...');
    const authResult = await client.tenantAuth.login({
      email: 'user@example.com',
      password: 'password123'
    });
    console.log('Login successful:', authResult);
    
    // Get current user
    console.log('\n👤 Current user:', client.tenantAuth.getCurrentUser());
    
    // Create a team
    console.log('\n👥 Creating team...');
    const team = await client.tenantAuth.createTeam({
      name: 'Development Team',
      description: 'Our main development team',
      settings: { notifications: true }
    });
    console.log('Team created:', team);
    
    // Get teams
    console.log('\n📋 Getting user teams...');
    const teams = await client.tenantAuth.getTeams();
    console.log('Teams:', teams);
    
    // Invite a team member
    console.log('\n📨 Inviting team member...');
    await client.tenantAuth.inviteMember({
      teamId: team.id,
      email: 'newmember@example.com',
      role: TeamRole.EDITOR,
      frontendUrl: 'https://app.example.com'
    });
    console.log('Invitation sent successfully');
    
    // Get team members
    console.log('\n👥 Getting team members...');
    const members = await client.tenantAuth.getTeamMembers(team.id);
    console.log('Team members:', members);
    
    // Configure social provider
    console.log('\n🔗 Configuring Google OAuth...');
    await client.tenantAuth.configureSocialProvider({
      provider: SocialProvider.GOOGLE,
      clientId: 'your-google-client-id',
      clientSecret: 'your-google-client-secret',
      redirectUri: 'https://app.example.com/auth/callback',
      scopes: ['profile', 'email'],
      enabled: true
    });
    console.log('Google OAuth configured successfully');
    
    // Get configured providers
    console.log('\n🌐 Getting social providers...');
    const providers = await client.tenantAuth.getSocialProviders();
    console.log('Configured providers:', providers);
    
    // Social auth example
    console.log('\n🔐 Social authentication...');
    const socialAuth = await client.tenantAuth.socialAuth({
      provider: SocialProvider.GOOGLE,
      providerId: 'google-user-id-123',
      email: 'user@gmail.com',
      name: 'John Doe',
      avatarUrl: 'https://avatar.url'
    });
    console.log('Social auth successful:', socialAuth);
    
    // Refresh token
    console.log('\n🔄 Refreshing token...');
    const refreshResult = await client.tenantAuth.refreshToken({
      refreshToken: authResult.refreshToken
    });
    console.log('Token refreshed:', refreshResult);
    
    // Logout
    console.log('\n👋 Logging out...');
    await client.tenantAuth.logout({
      refreshToken: refreshResult.refreshToken
    });
    console.log('Logout successful');
    
  } catch (error) {
    if (error.name === 'TenantAuthApiError') {
      console.error('❌ API Error:', error.message, 'Status:', error.statusCode);
    } else if (error.name === 'TenantAuthNetworkError') {
      console.error('❌ Network Error:', error.message);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

// Run example if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };