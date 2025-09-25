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
   */
  public async requestPasswordReset(email: string): Promise<void> {
    await this.httpClient.post(API_ENDPOINTS.TENANT_AUTH.FORGOT_PASSWORD, { email });
  }
  
  /**
   * Reset password with token
   */
  public async resetPassword(request: PasswordResetRequest): Promise<void> {
    await this.httpClient.post(API_ENDPOINTS.TENANT_AUTH.RESET_PASSWORD, request);
  }
  
  /**
   * Change password
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
   * Login with OAuth provider
   */
  public async socialLogin(provider: 'google' | 'github' | 'facebook'): Promise<string> {
    const response = await this.httpClient.get(`${API_ENDPOINTS.TENANT_AUTH.SOCIAL}/${provider}`);
    return response.data.authUrl;
  }
  
  /**
   * Handle OAuth callback
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
}