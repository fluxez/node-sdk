import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import { LoginCredentials, RegisterData, AuthToken, User, PasswordResetRequest, PasswordChangeRequest, Organization, Project, ApiKey } from './types';
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
     */
    requestPasswordReset(email: string): Promise<void>;
    /**
     * Reset password with token
     */
    resetPassword(request: PasswordResetRequest): Promise<void>;
    /**
     * Change password
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
     * Login with OAuth provider
     */
    socialLogin(provider: 'google' | 'github' | 'facebook'): Promise<string>;
    /**
     * Handle OAuth callback
     */
    socialCallback(provider: string, code: string): Promise<AuthToken>;
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
}
//# sourceMappingURL=auth-client.d.ts.map