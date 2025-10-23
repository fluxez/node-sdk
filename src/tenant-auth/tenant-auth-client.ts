import { AxiosInstance, AxiosError } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import {
  TenantRegisterRequest,
  TenantLoginRequest,
  TenantVerifyEmailRequest,
  TenantForgotPasswordRequest,
  TenantResetPasswordRequest,
  TenantSocialAuthRequest,
  TenantLinkSocialRequest,
  TenantRefreshTokenRequest,
  TenantLogoutRequest,
  CreateTeamRequest,
  InviteMemberRequest,
  AcceptInvitationRequest,
  RemoveMemberRequest,
  UpdateMemberRoleRequest,
  ConfigureSocialProviderRequest,
  TenantAuthResponse,
  TenantUser,
  TenantTeam,
  TenantTeamMember,
  TenantSocialProvider,
  TenantAuthApiError,
  TenantAuthNetworkError,
  SocialProvider,
  TeamRole,
} from '../types/tenant-auth.types';

export class TenantAuthClient {
  private httpClient: AxiosInstance;
  private config: FluxezConfig;
  private logger: Logger;
  private currentUser: TenantUser | null = null;
  
  constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger) {
    this.httpClient = httpClient;
    this.config = config;
    this.logger = logger;
  }
  
  // Authentication operations
  
  /**
   * Register a new tenant user
   */
  public async register(data: TenantRegisterRequest): Promise<TenantUser> {
    this.logger.debug('Registering tenant user', { email: data.email });
    
    return this.makeRequest<TenantUser>(() =>
      this.httpClient.post('/tenant-auth/register', data)
    );
  }
  
  /**
   * Login tenant user
   */
  public async login(credentials: TenantLoginRequest): Promise<TenantAuthResponse> {
    this.logger.debug('Logging in tenant user', { email: credentials.email });
    
    const response = await this.httpClient.post('/tenant-auth/login', credentials);
    
    const authResponse = response.data as TenantAuthResponse;
    
    // Store current user
    this.currentUser = authResponse.user;
    
    // Update client authentication with access token
    if (authResponse.accessToken) {
      this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${authResponse.accessToken}`;
    }
    
    return authResponse;
  }
  
  /**
   * Logout tenant user
   */
  public async logout(data?: TenantLogoutRequest): Promise<void> {
    this.logger.debug('Logging out tenant user');
    
    try {
      await this.httpClient.post('/tenant-auth/logout', data || {});
    } catch (error) {
      this.logger.error('Tenant logout failed', error);
    }
    
    // Clear authentication
    delete this.httpClient.defaults.headers.common['Authorization'];
    this.currentUser = null;
  }
  
  /**
   * Verify email address
   */
  public async verifyEmail(data: TenantVerifyEmailRequest): Promise<void> {
    this.logger.debug('Verifying tenant email');
    
    const response = await this.httpClient.post('/tenant-auth/verify-email', data);
    return response.data;
  }
  
  /**
   * Request password reset
   */
  public async forgotPassword(data: TenantForgotPasswordRequest): Promise<void> {
    this.logger.debug('Requesting tenant password reset', { email: data.email });
    
    const response = await this.httpClient.post('/tenant-auth/forgot-password', data);
    return response.data;
  }
  
  /**
   * Reset password with token
   */
  public async resetPassword(data: TenantResetPasswordRequest): Promise<void> {
    this.logger.debug('Resetting tenant password');
    
    const response = await this.httpClient.post('/tenant-auth/reset-password', data);
    return response.data;
  }
  
  /**
   * Refresh access token
   */
  public async refreshToken(data: TenantRefreshTokenRequest): Promise<TenantAuthResponse> {
    this.logger.debug('Refreshing tenant token');
    
    const response = await this.httpClient.post('/tenant-auth/refresh', data);
    
    const authResponse = response.data as TenantAuthResponse;
    
    // Update client authentication
    if (authResponse.accessToken) {
      this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${authResponse.accessToken}`;
    }
    
    return authResponse;
  }
  
  // Social authentication operations
  
  /**
   * Authenticate with social provider
   */
  public async socialAuth(data: TenantSocialAuthRequest): Promise<TenantAuthResponse> {
    this.logger.debug('Social auth for tenant', { provider: data.provider });
    
    const response = await this.httpClient.post('/tenant-auth/social', data);
    
    const authResponse = response.data as TenantAuthResponse;
    
    // Store current user
    this.currentUser = authResponse.user;
    
    // Update client authentication
    if (authResponse.accessToken) {
      this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${authResponse.accessToken}`;
    }
    
    return authResponse;
  }
  
  /**
   * Link social account to existing user
   */
  public async linkSocial(data: TenantLinkSocialRequest): Promise<void> {
    this.logger.debug('Linking social account', { provider: data.provider });
    
    const response = await this.httpClient.post('/tenant-auth/social/link', data);
    return response.data;
  }
  
  /**
   * Get configured social providers
   */
  public async getSocialProviders(): Promise<TenantSocialProvider[]> {
    this.logger.debug('Getting social providers');
    
    const response = await this.httpClient.get('/tenant-auth/social/providers');
    return response.data;
  }
  
  /**
   * Configure social provider (admin only)
   */
  public async configureSocialProvider(data: ConfigureSocialProviderRequest): Promise<void> {
    this.logger.debug('Configuring social provider', { provider: data.provider });

    const response = await this.httpClient.post('/tenant-auth/social/configure', data);
    return response.data;
  }

  /**
   * Get OAuth authorization URL for a provider
   */
  public async getOAuthUrl(provider: SocialProvider, redirectUrl?: string): Promise<string> {
    this.logger.debug('Getting OAuth URL', { provider, redirectUrl });

    const params = redirectUrl ? { redirect_url: redirectUrl } : {};
    const response = await this.httpClient.get(`/tenant-auth/social/${provider}/url`, { params });
    return response.data.url;
  }

  /**
   * Handle OAuth callback and authenticate user
   */
  public async handleOAuthCallback(
    provider: SocialProvider,
    code: string,
    state: string
  ): Promise<TenantAuthResponse> {
    this.logger.debug('Handling OAuth callback', { provider });

    const response = await this.httpClient.get(`/tenant-auth/social/${provider}/callback`, {
      params: { code, state }
    });

    const authResponse = response.data as TenantAuthResponse;

    // Store current user
    this.currentUser = authResponse.user;

    // Update client authentication
    if (authResponse.accessToken) {
      this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${authResponse.accessToken}`;
    }

    return authResponse;
  }

  /**
   * Initiate OAuth flow - redirects user to provider authorization page
   * This is a convenience method that gets the OAuth URL and returns it
   * The client application should redirect the user to this URL
   */
  public async initiateOAuthFlow(provider: SocialProvider): Promise<string> {
    this.logger.debug('Initiating OAuth flow', { provider });
    return this.getOAuthUrl(provider);
  }
  
  // Team management operations
  
  /**
   * Create a new team
   */
  public async createTeam(data: CreateTeamRequest): Promise<TenantTeam> {
    this.logger.debug('Creating team', { name: data.name });
    
    const response = await this.httpClient.post('/tenant-auth/teams', data);
    return response.data;
  }
  
  /**
   * Get user's teams
   */
  public async getTeams(): Promise<TenantTeam[]> {
    this.logger.debug('Getting user teams');
    
    const response = await this.httpClient.get('/tenant-auth/teams');
    return response.data;
  }
  
  /**
   * Invite member to team
   */
  public async inviteMember(data: InviteMemberRequest): Promise<void> {
    this.logger.debug('Inviting team member', { email: data.email, teamId: data.teamId });
    
    const response = await this.httpClient.post('/tenant-auth/teams/invite', data);
    return response.data;
  }
  
  /**
   * Accept team invitation
   */
  public async acceptInvitation(data: AcceptInvitationRequest): Promise<void> {
    this.logger.debug('Accepting team invitation');
    
    const response = await this.httpClient.post('/tenant-auth/teams/accept-invitation', data);
    return response.data;
  }
  
  /**
   * Remove member from team
   */
  public async removeMember(data: RemoveMemberRequest): Promise<void> {
    this.logger.debug('Removing team member', { teamId: data.teamId, userId: data.userId });
    
    const response = await this.httpClient.delete('/tenant-auth/teams/member', { data });
    return response.data;
  }
  
  /**
   * Update member role
   */
  public async updateMemberRole(data: UpdateMemberRoleRequest): Promise<void> {
    this.logger.debug('Updating member role', { teamId: data.teamId, userId: data.userId, role: data.newRole });
    
    const response = await this.httpClient.put('/tenant-auth/teams/member/role', data);
    return response.data;
  }
  
  /**
   * Get team members
   */
  public async getTeamMembers(teamId: string): Promise<TenantTeamMember[]> {
    this.logger.debug('Getting team members', { teamId });
    
    const response = await this.httpClient.get(`/tenant-auth/teams/${teamId}/members`);
    return response.data;
  }
  
  // Utility methods
  
  /**
   * Get current authenticated user
   */
  public getCurrentUser(): TenantUser | null {
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
  
  // Private helper methods
  
  /**
   * Handle HTTP errors and convert to appropriate tenant auth errors
   */
  private handleError(error: any): never {
    if (error.response) {
      // Server responded with error status
      const apiError = new TenantAuthApiError(
        error.response.data?.message || error.response.data?.error || 'Request failed',
        error.response.status,
        error.response.data?.code,
        error.response.data
      );
      this.logger.error('Tenant Auth API Error', apiError);
      throw apiError;
    } else if (error.request) {
      // Network error
      const networkError = new TenantAuthNetworkError('Network error - no response received');
      this.logger.error('Tenant Auth Network Error', networkError);
      throw networkError;
    } else {
      // Other error
      this.logger.error('Tenant Auth Unknown Error', error);
      throw error;
    }
  }
  
  /**
   * Wrapper for HTTP requests with error handling
   */
  private async makeRequest<T>(requestFn: () => Promise<any>): Promise<T> {
    try {
      const response = await requestFn();
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
}