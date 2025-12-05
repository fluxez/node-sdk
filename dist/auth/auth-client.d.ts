import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import { LoginCredentials, RegisterData, AuthToken, User, PasswordResetRequest, PasswordChangeRequest, Organization, Project, ApiKey, Role, AuthSettings } from './types';
export declare class AuthClient {
    private httpClient;
    private config;
    private logger;
    private currentUser;
    constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger);
    /**
     * Login with email and password
     */
    login(credentials: LoginCredentials): Promise<AuthToken>;
    /**
     * Register a new user
     */
    register(data: RegisterData): Promise<User>;
    /**
     * Refresh access token
     */
    refresh(refreshToken: string): Promise<AuthToken>;
    /**
     * Logout
     */
    logout(): Promise<void>;
    /**
     * Get current user
     */
    me(): Promise<User>;
    /**
     * Get user by ID (admin only)
     */
    getUserById(userId: string): Promise<User>;
    /**
     * Update user (admin only)
     */
    updateUser(userId: string, data: Partial<User>): Promise<User>;
    /**
     * Delete user account (admin only)
     * Permanently deletes a user and all associated data
     * This action cannot be undone
     * @param userId - The ID of the user to delete
     */
    deleteUser(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * List users (admin only)
     */
    listUsers(options?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{
        users: User[];
        total: number;
    }>;
    /**
     * Search users (admin only)
     */
    searchUsers(query: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<{
        users: User[];
        total: number;
    }>;
    /**
     * Update user profile
     */
    updateProfile(data: Partial<User>): Promise<User>;
    /**
     * Request password reset
     * @param email - User's email address
     * @param frontendUrl - Frontend URL where user will reset password (REQUIRED - must be provided by the calling application)
     */
    requestPasswordReset(email: string, frontendUrl: string): Promise<void>;
    /**
     * Reset password with token
     */
    resetPassword(request: PasswordResetRequest): Promise<void>;
    /**
     * Change password for authenticated user
     */
    changePassword(request: PasswordChangeRequest): Promise<void>;
    /**
     * Request email verification
     */
    requestEmailVerification(): Promise<void>;
    /**
     * Verify email with token
     */
    verifyEmail(token: string): Promise<void>;
    /**
     * Resend email verification
     */
    resendEmailVerification(email: string): Promise<void>;
    /**
     * Enable two-factor authentication
     */
    enable2FA(): Promise<{
        secret: string;
        qrCode: string;
    }>;
    /**
     * Disable two-factor authentication
     */
    disable2FA(code: string): Promise<void>;
    /**
     * Verify 2FA code
     */
    verify2FA(code: string): Promise<AuthToken>;
    /**
     * Create organization
     */
    createOrganization(data: {
        name: string;
        slug?: string;
    }): Promise<Organization>;
    /**
     * Get user's organizations
     */
    getOrganizations(): Promise<Organization[]>;
    /**
     * Switch organization context
     */
    switchOrganization(organizationId: string): Promise<void>;
    /**
     * Create project
     */
    createProject(data: {
        name: string;
        organizationId: string;
    }): Promise<Project>;
    /**
     * Get project details
     */
    getProject(projectId: string): Promise<Project>;
    /**
     * Switch project context
     */
    switchProject(projectId: string): Promise<void>;
    /**
     * Create API key
     */
    createApiKey(data: {
        name: string;
        projectId?: string;
        appId?: string;
        role?: string;
        permissions?: string[];
        expiresAt?: string;
    }): Promise<ApiKey>;
    /**
     * List API keys
     */
    listApiKeys(projectId?: string): Promise<ApiKey[]>;
    /**
     * Revoke API key
     */
    revokeApiKey(keyId: string): Promise<void>;
    /**
     * Validate API key
     */
    validateApiKey(apiKey: string): Promise<boolean>;
    /**
     * Get OAuth authorization URL for a provider
     * @param provider - Social provider (google, github, facebook, apple)
     * @param redirectUrl - URL to redirect to after OAuth authorization
     */
    getOAuthUrl(provider: 'google' | 'github' | 'facebook' | 'apple', redirectUrl?: string): Promise<string>;
    /**
     * Handle OAuth callback and authenticate user
     * @param provider - Social provider
     * @param code - OAuth authorization code
     * @param state - OAuth state parameter
     */
    handleOAuthCallback(provider: 'google' | 'github' | 'facebook' | 'apple', code: string, state: string): Promise<AuthToken>;
    /**
     * Initiate OAuth flow - returns URL to redirect user to
     * Convenience method that wraps getOAuthUrl
     * @param provider - Social provider
     */
    initiateOAuthFlow(provider: 'google' | 'github' | 'facebook' | 'apple'): Promise<string>;
    /**
     * Login with OAuth provider
     * @deprecated Use getOAuthUrl or initiateOAuthFlow instead
     */
    socialLogin(provider: 'google' | 'github' | 'facebook'): Promise<string>;
    /**
     * Handle OAuth callback
     * @deprecated Use handleOAuthCallback instead
     */
    socialCallback(provider: string, code: string): Promise<AuthToken>;
    /**
     * Link social account to existing user
     */
    linkSocial(provider: 'google' | 'github' | 'facebook' | 'apple', code: string): Promise<void>;
    /**
     * Get configured social providers
     */
    getSocialProviders(): Promise<any[]>;
    /**
     * Get active sessions
     */
    getSessions(): Promise<any[]>;
    /**
     * Revoke session
     */
    revokeSession(sessionId: string): Promise<void>;
    /**
     * Revoke all sessions
     */
    revokeAllSessions(): Promise<void>;
    /**
     * Create a new team
     */
    createTeam(data: {
        name: string;
        slug?: string;
    }): Promise<any>;
    /**
     * Get user's teams
     */
    getTeams(): Promise<any[]>;
    /**
     * Invite member to team
     */
    inviteMember(data: {
        teamId: string;
        email: string;
        role: string;
    }): Promise<void>;
    /**
     * Accept team invitation
     */
    acceptInvitation(data: {
        token: string;
    }): Promise<void>;
    /**
     * Remove member from team
     */
    removeMember(data: {
        teamId: string;
        userId: string;
    }): Promise<void>;
    /**
     * Update member role
     */
    updateMemberRole(data: {
        teamId: string;
        userId: string;
        newRole: string;
    }): Promise<void>;
    /**
     * Get team members
     */
    getTeamMembers(teamId: string): Promise<any[]>;
    /**
     * Get all roles for the tenant
     * Creates auth.roles table if it doesn't exist
     */
    getRoles(): Promise<Role[]>;
    /**
     * Create a new role
     * @param data - Role data (name, description)
     */
    createRole(data: {
        name: string;
        description?: string;
    }): Promise<Role>;
    /**
     * Delete a role
     * @param roleId - The ID of the role to delete
     */
    deleteRole(roleId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Update a user's role
     * @param userId - The ID of the user
     * @param role - The new role name
     */
    updateUserRole(userId: string, role: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Get auth settings for the tenant
     * Creates auth.settings table if it doesn't exist and returns defaults
     */
    getAuthSettings(): Promise<AuthSettings>;
    /**
     * Update auth settings for the tenant
     * @param settings - Partial settings to update
     */
    updateAuthSettings(settings: Partial<AuthSettings>): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Get current authenticated user
     */
    getCurrentUser(): User | null;
    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean;
    /**
     * Clear authentication state
     */
    clearAuth(): void;
}
//# sourceMappingURL=auth-client.d.ts.map