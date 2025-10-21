import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import { TenantRegisterRequest, TenantLoginRequest, TenantVerifyEmailRequest, TenantForgotPasswordRequest, TenantResetPasswordRequest, TenantSocialAuthRequest, TenantLinkSocialRequest, TenantRefreshTokenRequest, TenantLogoutRequest, CreateTeamRequest, InviteMemberRequest, AcceptInvitationRequest, RemoveMemberRequest, UpdateMemberRoleRequest, ConfigureSocialProviderRequest, TenantAuthResponse, TenantUser, TenantTeam, TenantTeamMember, TenantSocialProvider, SocialProvider } from '../types/tenant-auth.types';
export declare class TenantAuthClient {
    private httpClient;
    private config;
    private logger;
    private currentUser;
    constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger);
    /**
     * Register a new tenant user
     */
    register(data: TenantRegisterRequest): Promise<TenantUser>;
    /**
     * Login tenant user
     */
    login(credentials: TenantLoginRequest): Promise<TenantAuthResponse>;
    /**
     * Logout tenant user
     */
    logout(data?: TenantLogoutRequest): Promise<void>;
    /**
     * Verify email address
     */
    verifyEmail(data: TenantVerifyEmailRequest): Promise<void>;
    /**
     * Request password reset
     */
    forgotPassword(data: TenantForgotPasswordRequest): Promise<void>;
    /**
     * Reset password with token
     */
    resetPassword(data: TenantResetPasswordRequest): Promise<void>;
    /**
     * Refresh access token
     */
    refreshToken(data: TenantRefreshTokenRequest): Promise<TenantAuthResponse>;
    /**
     * Authenticate with social provider
     */
    socialAuth(data: TenantSocialAuthRequest): Promise<TenantAuthResponse>;
    /**
     * Link social account to existing user
     */
    linkSocial(data: TenantLinkSocialRequest): Promise<void>;
    /**
     * Get configured social providers
     */
    getSocialProviders(): Promise<TenantSocialProvider[]>;
    /**
     * Configure social provider (admin only)
     */
    configureSocialProvider(data: ConfigureSocialProviderRequest): Promise<void>;
    /**
     * Get OAuth authorization URL for a provider
     */
    getOAuthUrl(provider: SocialProvider): Promise<string>;
    /**
     * Handle OAuth callback and authenticate user
     */
    handleOAuthCallback(provider: SocialProvider, code: string, state: string): Promise<TenantAuthResponse>;
    /**
     * Initiate OAuth flow - redirects user to provider authorization page
     * This is a convenience method that gets the OAuth URL and returns it
     * The client application should redirect the user to this URL
     */
    initiateOAuthFlow(provider: SocialProvider): Promise<string>;
    /**
     * Create a new team
     */
    createTeam(data: CreateTeamRequest): Promise<TenantTeam>;
    /**
     * Get user's teams
     */
    getTeams(): Promise<TenantTeam[]>;
    /**
     * Invite member to team
     */
    inviteMember(data: InviteMemberRequest): Promise<void>;
    /**
     * Accept team invitation
     */
    acceptInvitation(data: AcceptInvitationRequest): Promise<void>;
    /**
     * Remove member from team
     */
    removeMember(data: RemoveMemberRequest): Promise<void>;
    /**
     * Update member role
     */
    updateMemberRole(data: UpdateMemberRoleRequest): Promise<void>;
    /**
     * Get team members
     */
    getTeamMembers(teamId: string): Promise<TenantTeamMember[]>;
    /**
     * Get current authenticated user
     */
    getCurrentUser(): TenantUser | null;
    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean;
    /**
     * Clear authentication state
     */
    clearAuth(): void;
    /**
     * Handle HTTP errors and convert to appropriate tenant auth errors
     */
    private handleError;
    /**
     * Wrapper for HTTP requests with error handling
     */
    private makeRequest;
}
//# sourceMappingURL=tenant-auth-client.d.ts.map