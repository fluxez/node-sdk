import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import { API_ENDPOINTS } from '../constants';
import {
  LoginCredentials,
  RegisterData,
  AuthToken,
  User,
  RefreshTokenRequest,
  PasswordResetRequest,
  PasswordChangeRequest,
  EmailVerificationRequest,
  Organization,
  Project,
  ApiKey,
  Role,
  AuthSettings,
} from './types';

export class AuthClient {
  private httpClient: AxiosInstance;
  private config: FluxezConfig;
  private logger: Logger;
  private currentUser: User | null = null;
  
  constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger) {
    this.httpClient = httpClient;
    this.config = config;
    this.logger = logger;
  }
  
  /**
   * Login with email and password
   */
  public async login(credentials: LoginCredentials): Promise<AuthToken> {
    this.logger.debug('Logging in', { email: credentials.email });

    const response = await this.httpClient.post(API_ENDPOINTS.TENANT_AUTH.LOGIN, credentials);

    const data = response.data;

    // Store current user
    this.currentUser = data.user;

    // DON'T update client authentication here - it breaks subsequent auth operations
    // The API key needs to remain for tenant-auth endpoints
    // Users should manually set the token if they want to use it
    const accessToken = data.accessToken || data.token;

    // Normalize response to match AuthToken interface
    return {
      token: accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn || 3600,
      tokenType: data.tokenType || 'Bearer',
      user: data.user
    };
  }
  
  /**
   * Register a new user
   */
  public async register(data: RegisterData): Promise<User> {
    this.logger.debug('Registering user', { email: data.email });
    
    const response = await this.httpClient.post(API_ENDPOINTS.TENANT_AUTH.REGISTER, data);
    return response.data;
  }
  
  /**
   * Refresh access token
   */
  public async refresh(refreshToken: string): Promise<AuthToken> {
    this.logger.debug('Refreshing token');

    const response = await this.httpClient.post(API_ENDPOINTS.TENANT_AUTH.REFRESH, {
      refreshToken,
    });
    
    const token = response.data;
    
    // DON'T update client authentication here - it breaks subsequent auth operations
    // The API key needs to remain for tenant-auth endpoints
    
    return token;
  }

  /**
   * Refresh access token (alias for refresh)
   */
  public async refreshToken(refreshToken: string): Promise<AuthToken> {
    return this.refresh(refreshToken);
  }

  /**
   * Logout
   */
  public async logout(): Promise<void> {
    this.logger.debug('Logging out');
    
    try {
      await this.httpClient.post(API_ENDPOINTS.TENANT_AUTH.LOGOUT);
    } catch (error) {
      this.logger.error('Logout failed', error);
    }
    
    // Clear authentication
    delete this.httpClient.defaults.headers.common['Authorization'];
    delete this.httpClient.defaults.headers.common['X-API-Key'];
    this.currentUser = null;
  }
  
  /**
   * Get current user
   */
  public async me(): Promise<User> {
    if (this.currentUser) {
      return this.currentUser;
    }
    
    const response = await this.httpClient.get('/tenant-auth/me');
    this.currentUser = response.data;
    return response.data;
  }


  /**
   * Get user by ID (admin only)
   */
  public async getUserById(userId: string): Promise<User> {
    const response = await this.httpClient.get(`/tenant-auth/users/${userId}`);
    return response.data;
  }

  /**
   * Update user (admin only)
   */
  public async updateUser(userId: string, data: Partial<User>): Promise<User> {
    const response = await this.httpClient.put(`/tenant-auth/users/${userId}`, data);
    return response.data;
  }

  /**
   * Delete user account (admin only)
   * Permanently deletes a user and all associated data
   * This action cannot be undone
   * @param userId - The ID of the user to delete
   */
  public async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.httpClient.delete(`/tenant-auth/users/${userId}`);
    return response.data;
  }

  /**
   * List users (admin only)
   */
  public async listUsers(options?: { page?: number; limit?: number; search?: string }): Promise<{ users: User[]; total: number }> {
    const response = await this.httpClient.get('/tenant-auth/users', {
      params: options
    });
    return response.data;
  }

  /**
   * Search users (admin only)
   */
  public async searchUsers(query: string, options?: { page?: number; limit?: number }): Promise<{ users: User[]; total: number }> {
    return this.listUsers({ ...options, search: query });
  }
  
  /**
   * Update user profile
   */
  public async updateProfile(data: Partial<User>): Promise<User> {
    const response = await this.httpClient.patch('/tenant-auth/profile', data);
    this.currentUser = response.data;
    return response.data;
  }
  
  /**
   * Request password reset
   * @param email - User's email address
   * @param frontendUrl - Frontend URL where user will reset password (REQUIRED - must be provided by the calling application)
   */
  public async requestPasswordReset(email: string, frontendUrl: string): Promise<void> {
    if (!frontendUrl) {
      throw new Error('frontendUrl is required for password reset. Please provide the URL where users can reset their password.');
    }

    await this.httpClient.post(API_ENDPOINTS.TENANT_AUTH.FORGOT_PASSWORD, {
      email,
      frontendUrl
    });
  }
  
  /**
   * Reset password with token
   */
  public async resetPassword(request: PasswordResetRequest): Promise<void> {
    await this.httpClient.post(API_ENDPOINTS.TENANT_AUTH.RESET_PASSWORD, request);
  }
  
  /**
   * Change password for authenticated user
   */
  public async changePassword(request: PasswordChangeRequest): Promise<void> {
    await this.httpClient.post('/tenant-auth/password/change', request);
  }
  
  /**
   * Request email verification
   */
  public async requestEmailVerification(): Promise<void> {
    await this.httpClient.post('/tenant-auth/email/verify/request');
  }

  /**
   * Verify email with token
   */
  public async verifyEmail(token: string): Promise<void> {
    await this.httpClient.post(API_ENDPOINTS.TENANT_AUTH.VERIFY_EMAIL, { token });
  }

  /**
   * Resend email verification
   */
  public async resendEmailVerification(email: string): Promise<void> {
    await this.httpClient.post('/tenant-auth/verify-email/resend', { email });
  }
  
  /**
   * Enable two-factor authentication
   */
  public async enable2FA(): Promise<{ secret: string; qrCode: string }> {
    const response = await this.httpClient.post('/tenant-auth/2fa/enable');
    return response.data;
  }
  
  /**
   * Disable two-factor authentication
   */
  public async disable2FA(code: string): Promise<void> {
    await this.httpClient.post('/tenant-auth/2fa/disable', { code });
  }
  
  /**
   * Verify 2FA code
   */
  public async verify2FA(code: string): Promise<AuthToken> {
    const response = await this.httpClient.post('/tenant-auth/2fa/verify', { code });
    return response.data;
  }
  
  // Organization management
  
  /**
   * Create organization
   */
  public async createOrganization(data: {
    name: string;
    slug?: string;
  }): Promise<Organization> {
    const response = await this.httpClient.post('/organization/create', data);
    return response.data;
  }
  
  /**
   * Get user's organizations
   */
  public async getOrganizations(): Promise<Organization[]> {
    const response = await this.httpClient.get('/organization/my');
    return response.data;
  }
  
  /**
   * Switch organization context
   */
  public async switchOrganization(organizationId: string): Promise<void> {
    this.httpClient.defaults.headers.common['X-Organization-Id'] = organizationId;
  }
  
  // Project management
  
  /**
   * Create project
   */
  public async createProject(data: {
    name: string;
    organizationId: string;
  }): Promise<Project> {
    const response = await this.httpClient.post('/project/create', data);
    return response.data;
  }
  
  /**
   * Get project details
   */
  public async getProject(projectId: string): Promise<Project> {
    const response = await this.httpClient.get(`/project/${projectId}`);
    return response.data;
  }
  
  /**
   * Switch project context
   */
  public async switchProject(projectId: string): Promise<void> {
    this.httpClient.defaults.headers.common['X-Project-Id'] = projectId;
  }
  
  // API Key management
  
  /**
   * Create API key
   */
  public async createApiKey(data: {
    name: string;
    projectId?: string;
    appId?: string;
    role?: string;
    permissions?: string[];
    expiresAt?: string;
  }): Promise<ApiKey> {
    const response = await this.httpClient.post('/api-key/create', data);
    return response.data;
  }
  
  /**
   * List API keys
   */
  public async listApiKeys(projectId?: string): Promise<ApiKey[]> {
    const response = await this.httpClient.get('/api-key/list', {
      params: { projectId },
    });
    return response.data;
  }
  
  /**
   * Revoke API key
   */
  public async revokeApiKey(keyId: string): Promise<void> {
    await this.httpClient.delete(`/api-key/${keyId}`);
  }
  
  /**
   * Validate API key
   */
  public async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await this.httpClient.post('/api-key/validate', {
        apiKey,
      });
      return response.data.valid === true;
    } catch {
      return false;
    }
  }
  
  // Social authentication

  /**
   * Get OAuth authorization URL for a provider
   * @param provider - Social provider (google, github, facebook, apple)
   * @param redirectUrl - URL to redirect to after OAuth authorization
   */
  public async getOAuthUrl(provider: 'google' | 'github' | 'facebook' | 'apple', redirectUrl?: string): Promise<string> {
    this.logger.debug('Getting OAuth URL', { provider, redirectUrl });

    const params = redirectUrl ? { redirect_url: redirectUrl } : {};
    const response = await this.httpClient.get(`/tenant-auth/social/${provider}/url`, { params });
    return response.data.url;
  }

  /**
   * Handle OAuth callback and authenticate user
   * @param provider - Social provider
   * @param code - OAuth authorization code
   * @param state - OAuth state parameter
   */
  public async handleOAuthCallback(
    provider: 'google' | 'github' | 'facebook' | 'apple',
    code: string,
    state: string
  ): Promise<AuthToken> {
    this.logger.debug('Handling OAuth callback', { provider });

    const response = await this.httpClient.get(`/tenant-auth/social/${provider}/callback`, {
      params: { code, state }
    });

    const authResponse = response.data;

    // Store current user
    this.currentUser = authResponse.user;

    // Normalize response to match AuthToken interface
    return {
      token: authResponse.accessToken || authResponse.token,
      refreshToken: authResponse.refreshToken,
      expiresIn: authResponse.expiresIn || 3600,
      tokenType: authResponse.tokenType || 'Bearer',
      user: authResponse.user
    };
  }

  /**
   * Initiate OAuth flow - returns URL to redirect user to
   * Convenience method that wraps getOAuthUrl
   * @param provider - Social provider
   */
  public async initiateOAuthFlow(provider: 'google' | 'github' | 'facebook' | 'apple'): Promise<string> {
    this.logger.debug('Initiating OAuth flow', { provider });
    return this.getOAuthUrl(provider);
  }

  /**
   * Login with OAuth provider
   * @deprecated Use getOAuthUrl or initiateOAuthFlow instead
   */
  public async socialLogin(provider: 'google' | 'github' | 'facebook'): Promise<string> {
    const response = await this.httpClient.get(`${API_ENDPOINTS.TENANT_AUTH.SOCIAL}/${provider}`);
    return response.data.authUrl;
  }

  /**
   * Handle OAuth callback
   * @deprecated Use handleOAuthCallback instead
   */
  public async socialCallback(
    provider: string,
    code: string
  ): Promise<AuthToken> {
    const response = await this.httpClient.post(`${API_ENDPOINTS.TENANT_AUTH.SOCIAL}/${provider}/callback`, {
      code,
    });
    return response.data;
  }

  /**
   * Link social account to existing user
   */
  public async linkSocial(provider: 'google' | 'github' | 'facebook' | 'apple', code: string): Promise<void> {
    this.logger.debug('Linking social account', { provider });

    const response = await this.httpClient.post('/tenant-auth/social/link', {
      provider,
      code
    });
    return response.data;
  }

  /**
   * Get configured social providers
   */
  public async getSocialProviders(): Promise<any[]> {
    this.logger.debug('Getting social providers');

    const response = await this.httpClient.get('/tenant-auth/social/providers');
    return response.data;
  }
  
  // Session management
  
  /**
   * Get active sessions
   */
  public async getSessions(): Promise<any[]> {
    const response = await this.httpClient.get('/tenant-auth/sessions');
    return response.data;
  }
  
  /**
   * Revoke session
   */
  public async revokeSession(sessionId: string): Promise<void> {
    await this.httpClient.delete(`/tenant-auth/sessions/${sessionId}`);
  }
  
  /**
   * Revoke all sessions
   */
  public async revokeAllSessions(): Promise<void> {
    await this.httpClient.delete('/tenant-auth/sessions');
  }

  // Team management

  /**
   * Create a new team
   */
  public async createTeam(data: { name: string; slug?: string }): Promise<any> {
    this.logger.debug('Creating team', { name: data.name });

    const response = await this.httpClient.post('/tenant-auth/teams', data);
    return response.data;
  }

  /**
   * Get user's teams
   */
  public async getTeams(): Promise<any[]> {
    this.logger.debug('Getting user teams');

    const response = await this.httpClient.get('/tenant-auth/teams');
    return response.data;
  }

  /**
   * Invite member to team
   */
  public async inviteMember(data: { teamId: string; email: string; role: string }): Promise<void> {
    this.logger.debug('Inviting team member', { email: data.email, teamId: data.teamId });

    const response = await this.httpClient.post('/tenant-auth/teams/invite', data);
    return response.data;
  }

  /**
   * Accept team invitation
   */
  public async acceptInvitation(data: { token: string }): Promise<void> {
    this.logger.debug('Accepting team invitation');

    const response = await this.httpClient.post('/tenant-auth/teams/accept-invitation', data);
    return response.data;
  }

  /**
   * Remove member from team
   */
  public async removeMember(data: { teamId: string; userId: string }): Promise<void> {
    this.logger.debug('Removing team member', { teamId: data.teamId, userId: data.userId });

    const response = await this.httpClient.delete('/tenant-auth/teams/member', { data });
    return response.data;
  }

  /**
   * Update member role
   */
  public async updateMemberRole(data: { teamId: string; userId: string; newRole: string }): Promise<void> {
    this.logger.debug('Updating member role', { teamId: data.teamId, userId: data.userId, role: data.newRole });

    const response = await this.httpClient.put('/tenant-auth/teams/member/role', data);
    return response.data;
  }

  /**
   * Get team members
   */
  public async getTeamMembers(teamId: string): Promise<any[]> {
    this.logger.debug('Getting team members', { teamId });

    const response = await this.httpClient.get(`/tenant-auth/teams/${teamId}/members`);
    return response.data;
  }

  // Role management

  /**
   * Get all roles for the tenant
   * Creates auth.roles table if it doesn't exist
   */
  public async getRoles(): Promise<Role[]> {
    this.logger.debug('Getting roles');

    const response = await this.httpClient.get('/tenant-auth/roles');
    return response.data.roles || response.data;
  }

  /**
   * Create a new role
   * @param data - Role data (name, description)
   */
  public async createRole(data: { name: string; description?: string }): Promise<Role> {
    this.logger.debug('Creating role', { name: data.name });

    const response = await this.httpClient.post('/tenant-auth/roles', data);
    return response.data.role || response.data;
  }

  /**
   * Delete a role
   * @param roleId - The ID of the role to delete
   */
  public async deleteRole(roleId: string): Promise<{ success: boolean; message: string }> {
    this.logger.debug('Deleting role', { roleId });

    const response = await this.httpClient.delete(`/tenant-auth/roles/${roleId}`);
    return response.data;
  }

  /**
   * Update a user's role
   * @param userId - The ID of the user
   * @param role - The new role name
   */
  public async updateUserRole(userId: string, role: string): Promise<{ success: boolean; message: string }> {
    this.logger.debug('Updating user role', { userId, role });

    const response = await this.httpClient.put(`/tenant-auth/users/${userId}/role`, { role });
    return response.data;
  }

  // Auth Settings management

  /**
   * Get auth settings for the tenant
   * Creates auth.settings table if it doesn't exist and returns defaults
   */
  public async getAuthSettings(): Promise<AuthSettings> {
    this.logger.debug('Getting auth settings');

    const response = await this.httpClient.get('/tenant-auth/settings');
    return response.data.settings || response.data;
  }

  /**
   * Update auth settings for the tenant
   * @param settings - Partial settings to update
   */
  public async updateAuthSettings(settings: Partial<AuthSettings>): Promise<{ success: boolean; message: string }> {
    this.logger.debug('Updating auth settings');

    const response = await this.httpClient.put('/tenant-auth/settings', settings);
    return response.data;
  }

  // Utility methods

  /**
   * Get current authenticated user
   */
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Clear authentication state
   */
  public clearAuth(): void {
    delete this.httpClient.defaults.headers.common['Authorization'];
    this.currentUser = null;
  }
}