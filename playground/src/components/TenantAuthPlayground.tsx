'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Config {
  baseUrl: string;
  apiKey: string;
  projectId: string;
}

export function TenantAuthPlayground({ config }: { config: Config }) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('DemoPass123!');
  const [fullName, setFullName] = useState('Demo User');

  const handleAuthOperation = async (operation: string, data?: any) => {
    if (!config.apiKey) {
      setResult({ error: 'Please configure your API key first' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${config.baseUrl}/api/v1/tenant-auth/${operation}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      setResult(result);
    } catch (error) {
      setResult({ error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tenant Authentication Playground</h2>
      </div>

      <Tabs defaultValue="registration" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="registration">Registration</TabsTrigger>
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="social">Social Auth</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>

        {/* User Registration */}
        <TabsContent value="registration" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">User Registration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="SecurePassword123!"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleAuthOperation('register', { 
                      email, 
                      password, 
                      fullName,
                      metadata: {
                        source: 'playground',
                        registeredAt: new Date().toISOString()
                      }
                    })}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Registering...' : 'Register User'}
                  </Button>
                  <Button
                    onClick={() => handleAuthOperation('register', { 
                      email: 'premium@example.com', 
                      password: 'PremiumPass123!', 
                      fullName: 'Premium User',
                      metadata: {
                        plan: 'premium',
                        features: ['analytics', 'api', 'priority_support'],
                        source: 'playground'
                      }
                    })}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    Register Premium User
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Quick Actions:</h4>
                <div className="space-y-2">
                  <Button
                    onClick={() => setResult({
                      example: 'Registration with metadata',
                      description: 'Users can be registered with custom metadata for personalization',
                      code: `await fluxez.tenantAuth.register({
  email: 'user@example.com',
  password: 'SecurePass123!',
  fullName: 'John Doe',
  metadata: {
    department: 'Engineering',
    role: 'Developer',
    preferences: { theme: 'dark' }
  }
})`
                    })}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Show Registration Example
                  </Button>
                  <Button
                    onClick={() => setResult({
                      example: 'Email verification flow',
                      description: 'After registration, users receive verification emails',
                      steps: [
                        '1. User registers with email',
                        '2. Verification email sent',
                        '3. User clicks verification link',
                        '4. Email status updated to verified'
                      ]
                    })}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Show Verification Flow
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Login */}
        <TabsContent value="login" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">User Login</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleAuthOperation('login', { email, password })}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                  <Button
                    onClick={() => handleAuthOperation('forgot-password', { 
                      email,
                      frontendUrl: 'https://myapp.com/reset-password'
                    })}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    Forgot Password
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Session Management:</h4>
                <div className="space-y-2">
                  <Button
                    onClick={() => setResult({
                      example: 'Token management',
                      description: 'Login returns access and refresh tokens',
                      tokens: {
                        accessToken: 'Short-lived JWT token for API requests',
                        refreshToken: 'Long-lived token for renewing access'
                      },
                      usage: 'Store tokens securely and refresh before expiration'
                    })}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Show Token Management
                  </Button>
                  <Button
                    onClick={() => setResult({
                      example: 'Password reset flow',
                      description: 'Users can reset forgotten passwords via email',
                      steps: [
                        '1. User requests password reset',
                        '2. Reset email sent with secure token',
                        '3. User clicks reset link',
                        '4. New password set and confirmed'
                      ]
                    })}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Show Reset Flow
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Social Auth */}
        <TabsContent value="social" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Social Authentication</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h4 className="font-medium">Social Providers:</h4>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleAuthOperation('social', {
                      provider: 'google',
                      providerId: 'google_user_123',
                      email: 'user@gmail.com',
                      name: 'Google User',
                      avatarUrl: 'https://avatar.url/image.jpg',
                      providerData: {
                        googleId: 'google_user_123',
                        verifiedEmail: true
                      }
                    })}
                    disabled={loading}
                    className="w-full"
                  >
                    🔵 Authenticate with Google
                  </Button>
                  <Button
                    onClick={() => handleAuthOperation('social', {
                      provider: 'github',
                      providerId: 'github_user_456',
                      email: 'dev@github.com',
                      name: 'GitHub Developer',
                      providerData: {
                        githubId: 'github_user_456',
                        username: 'developer123'
                      }
                    })}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    ⚫ Authenticate with GitHub
                  </Button>
                  <Button
                    onClick={() => handleAuthOperation('social', {
                      provider: 'apple',
                      providerId: 'apple_user_789',
                      email: 'user@icloud.com',
                      name: 'Apple User',
                      providerData: {
                        appleId: 'apple_user_789'
                      }
                    })}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    🍎 Authenticate with Apple
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Social Features:</h4>
                <div className="space-y-2">
                  <Button
                    onClick={() => setResult({
                      example: 'Social provider configuration',
                      description: 'Configure OAuth providers for your app',
                      providers: [
                        { name: 'Google', configured: true, enabled: true },
                        { name: 'GitHub', configured: true, enabled: true },
                        { name: 'Facebook', configured: false, enabled: false },
                        { name: 'Apple', configured: true, enabled: true }
                      ],
                      note: 'Each provider requires client ID and secret'
                    })}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Show Provider Config
                  </Button>
                  <Button
                    onClick={() => setResult({
                      example: 'Link social accounts',
                      description: 'Users can link multiple social accounts to their profile',
                      linkedAccounts: [
                        { provider: 'google', email: 'user@gmail.com', linked: true },
                        { provider: 'github', username: 'developer123', linked: true },
                        { provider: 'facebook', linked: false }
                      ]
                    })}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Show Account Linking
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Teams */}
        <TabsContent value="teams" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Team Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Team Name</label>
                  <input
                    type="text"
                    defaultValue="Engineering Team"
                    className="w-full p-2 border rounded-md"
                    placeholder="Team name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    defaultValue="Main engineering team for product development"
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="Team description"
                  />
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleAuthOperation('teams', {
                      name: 'Engineering Team',
                      description: 'Main engineering team',
                      settings: {
                        allowInvitations: true,
                        requireApproval: false
                      }
                    })}
                    disabled={loading}
                    className="w-full"
                  >
                    Create Team
                  </Button>
                  <Button
                    onClick={() => setResult({
                      example: 'Team invitation',
                      description: 'Invite members to join your team',
                      invitation: {
                        email: 'newmember@example.com',
                        role: 'editor',
                        status: 'pending',
                        invitedBy: 'admin@example.com'
                      }
                    })}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    Invite Member
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Team Features:</h4>
                <div className="space-y-2">
                  <Button
                    onClick={() => setResult({
                      example: 'Team roles and permissions',
                      roles: [
                        { name: 'owner', permissions: ['all'] },
                        { name: 'admin', permissions: ['manage_members', 'edit', 'read'] },
                        { name: 'editor', permissions: ['edit', 'read'] },
                        { name: 'viewer', permissions: ['read'] },
                        { name: 'member', permissions: ['read', 'comment'] }
                      ]
                    })}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Show Team Roles
                  </Button>
                  <Button
                    onClick={() => setResult({
                      example: 'Team members list',
                      members: [
                        { email: 'admin@example.com', role: 'owner', joinedAt: '2024-01-15' },
                        { email: 'dev@example.com', role: 'admin', joinedAt: '2024-02-01' },
                        { email: 'designer@example.com', role: 'editor', joinedAt: '2024-02-10' }
                      ]
                    })}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Show Team Members
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* User Management */}
        <TabsContent value="management" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">User Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h4 className="font-medium">User Operations:</h4>
                <div className="space-y-2">
                  <Button
                    onClick={() => setResult({
                      example: 'Current user profile',
                      user: {
                        id: 'user_123',
                        email: 'user@example.com',
                        emailVerified: true,
                        fullName: 'John Doe',
                        avatarUrl: null,
                        createdAt: '2024-01-15T10:00:00Z',
                        lastLoginAt: '2024-03-10T14:30:00Z'
                      }
                    })}
                    variant="outline"
                    className="w-full"
                  >
                    Get Current User
                  </Button>
                  <Button
                    onClick={() => setResult({
                      example: 'Authentication status',
                      isAuthenticated: true,
                      tokenExpiry: '2024-03-11T14:30:00Z',
                      permissions: ['read', 'write', 'delete'],
                      activeSession: true
                    })}
                    variant="outline"
                    className="w-full"
                  >
                    Check Auth Status
                  </Button>
                  <Button
                    onClick={() => setResult({
                      example: 'User logout',
                      message: 'User logged out successfully',
                      tokensRevoked: true,
                      sessionCleared: true
                    })}
                    variant="outline"
                    className="w-full"
                  >
                    Logout User
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Security Features:</h4>
                <div className="space-y-2">
                  <Button
                    onClick={() => setResult({
                      example: 'Security settings',
                      settings: {
                        twoFactorEnabled: false,
                        loginNotifications: true,
                        sessionTimeout: '24h',
                        passwordStrength: 'strong',
                        lastPasswordChange: '2024-01-15',
                        linkedSocialAccounts: ['google', 'github']
                      }
                    })}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Show Security Settings
                  </Button>
                  <Button
                    onClick={() => setResult({
                      example: 'Login history',
                      history: [
                        { timestamp: '2024-03-10T14:30:00Z', ip: '192.168.1.1', device: 'Chrome/Mac' },
                        { timestamp: '2024-03-09T09:15:00Z', ip: '192.168.1.2', device: 'Safari/iPhone' },
                        { timestamp: '2024-03-08T16:45:00Z', ip: '192.168.1.1', device: 'Chrome/Mac' }
                      ]
                    })}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Show Login History
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results */}
      {result && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Result</h3>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}