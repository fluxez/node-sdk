"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantAuthClient = void 0;
const tenant_auth_types_1 = require("../types/tenant-auth.types");
class TenantAuthClient {
    constructor(httpClient, config, logger) {
        this.currentUser = null;
        this.httpClient = httpClient;
        this.config = config;
        this.logger = logger;
    }
    // Authentication operations
    /**
     * Register a new tenant user
     */
    async register(data) {
        this.logger.debug('Registering tenant user', { email: data.email });
        return this.makeRequest(() => this.httpClient.post('/tenant-auth/register', data));
    }
    /**
     * Login tenant user
     */
    async login(credentials) {
        this.logger.debug('Logging in tenant user', { email: credentials.email });
        const response = await this.httpClient.post('/tenant-auth/login', credentials);
        const authResponse = response.data;
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
    async logout(data) {
        this.logger.debug('Logging out tenant user');
        try {
            await this.httpClient.post('/tenant-auth/logout', data || {});
        }
        catch (error) {
            this.logger.error('Tenant logout failed', error);
        }
        // Clear authentication
        delete this.httpClient.defaults.headers.common['Authorization'];
        this.currentUser = null;
    }
    /**
     * Verify email address
     */
    async verifyEmail(data) {
        this.logger.debug('Verifying tenant email');
        const response = await this.httpClient.post('/tenant-auth/verify-email', data);
        return response.data;
    }
    /**
     * Request password reset
     */
    async forgotPassword(data) {
        this.logger.debug('Requesting tenant password reset', { email: data.email });
        const response = await this.httpClient.post('/tenant-auth/forgot-password', data);
        return response.data;
    }
    /**
     * Reset password with token
     */
    async resetPassword(data) {
        this.logger.debug('Resetting tenant password');
        const response = await this.httpClient.post('/tenant-auth/reset-password', data);
        return response.data;
    }
    /**
     * Refresh access token
     */
    async refreshToken(data) {
        this.logger.debug('Refreshing tenant token');
        const response = await this.httpClient.post('/tenant-auth/refresh', data);
        const authResponse = response.data;
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
    async socialAuth(data) {
        this.logger.debug('Social auth for tenant', { provider: data.provider });
        const response = await this.httpClient.post('/tenant-auth/social', data);
        const authResponse = response.data;
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
    async linkSocial(data) {
        this.logger.debug('Linking social account', { provider: data.provider });
        const response = await this.httpClient.post('/tenant-auth/social/link', data);
        return response.data;
    }
    /**
     * Get configured social providers
     */
    async getSocialProviders() {
        this.logger.debug('Getting social providers');
        const response = await this.httpClient.get('/tenant-auth/social/providers');
        return response.data;
    }
    /**
     * Configure social provider (admin only)
     */
    async configureSocialProvider(data) {
        this.logger.debug('Configuring social provider', { provider: data.provider });
        const response = await this.httpClient.post('/tenant-auth/social/configure', data);
        return response.data;
    }
    /**
     * Get OAuth authorization URL for a provider
     */
    async getOAuthUrl(provider) {
        this.logger.debug('Getting OAuth URL', { provider });
        const response = await this.httpClient.get(`/tenant-auth/social/${provider}/url`);
        return response.data.url;
    }
    /**
     * Handle OAuth callback and authenticate user
     */
    async handleOAuthCallback(provider, code, state) {
        this.logger.debug('Handling OAuth callback', { provider });
        const response = await this.httpClient.get(`/tenant-auth/social/${provider}/callback`, {
            params: { code, state }
        });
        const authResponse = response.data;
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
    async initiateOAuthFlow(provider) {
        this.logger.debug('Initiating OAuth flow', { provider });
        return this.getOAuthUrl(provider);
    }
    // Team management operations
    /**
     * Create a new team
     */
    async createTeam(data) {
        this.logger.debug('Creating team', { name: data.name });
        const response = await this.httpClient.post('/tenant-auth/teams', data);
        return response.data;
    }
    /**
     * Get user's teams
     */
    async getTeams() {
        this.logger.debug('Getting user teams');
        const response = await this.httpClient.get('/tenant-auth/teams');
        return response.data;
    }
    /**
     * Invite member to team
     */
    async inviteMember(data) {
        this.logger.debug('Inviting team member', { email: data.email, teamId: data.teamId });
        const response = await this.httpClient.post('/tenant-auth/teams/invite', data);
        return response.data;
    }
    /**
     * Accept team invitation
     */
    async acceptInvitation(data) {
        this.logger.debug('Accepting team invitation');
        const response = await this.httpClient.post('/tenant-auth/teams/accept-invitation', data);
        return response.data;
    }
    /**
     * Remove member from team
     */
    async removeMember(data) {
        this.logger.debug('Removing team member', { teamId: data.teamId, userId: data.userId });
        const response = await this.httpClient.delete('/tenant-auth/teams/member', { data });
        return response.data;
    }
    /**
     * Update member role
     */
    async updateMemberRole(data) {
        this.logger.debug('Updating member role', { teamId: data.teamId, userId: data.userId, role: data.newRole });
        const response = await this.httpClient.put('/tenant-auth/teams/member/role', data);
        return response.data;
    }
    /**
     * Get team members
     */
    async getTeamMembers(teamId) {
        this.logger.debug('Getting team members', { teamId });
        const response = await this.httpClient.get(`/tenant-auth/teams/${teamId}/members`);
        return response.data;
    }
    // Utility methods
    /**
     * Get current authenticated user
     */
    getCurrentUser() {
        return this.currentUser;
    }
    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }
    /**
     * Clear authentication state
     */
    clearAuth() {
        delete this.httpClient.defaults.headers.common['Authorization'];
        this.currentUser = null;
    }
    // Private helper methods
    /**
     * Handle HTTP errors and convert to appropriate tenant auth errors
     */
    handleError(error) {
        if (error.response) {
            // Server responded with error status
            const apiError = new tenant_auth_types_1.TenantAuthApiError(error.response.data?.message || error.response.data?.error || 'Request failed', error.response.status, error.response.data?.code, error.response.data);
            this.logger.error('Tenant Auth API Error', apiError);
            throw apiError;
        }
        else if (error.request) {
            // Network error
            const networkError = new tenant_auth_types_1.TenantAuthNetworkError('Network error - no response received');
            this.logger.error('Tenant Auth Network Error', networkError);
            throw networkError;
        }
        else {
            // Other error
            this.logger.error('Tenant Auth Unknown Error', error);
            throw error;
        }
    }
    /**
     * Wrapper for HTTP requests with error handling
     */
    async makeRequest(requestFn) {
        try {
            const response = await requestFn();
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
}
exports.TenantAuthClient = TenantAuthClient;
//# sourceMappingURL=tenant-auth-client.js.map