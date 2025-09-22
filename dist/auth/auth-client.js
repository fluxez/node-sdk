"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthClient = void 0;
class AuthClient {
    constructor(httpClient, config, logger) {
        this.currentUser = null;
        this.httpClient = httpClient;
        this.config = config;
        this.logger = logger;
    }
    /**
     * Login with email and password
     */
    async login(credentials) {
        this.logger.debug('Logging in', { email: credentials.email });
        const response = await this.httpClient.post('/api/auth/login', credentials);
        const token = response.data;
        // Store current user
        this.currentUser = token.user;
        // Update client authentication
        if (token.token) {
            this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${token.token}`;
        }
        return token;
    }
    /**
     * Register a new user
     */
    async register(data) {
        this.logger.debug('Registering user', { email: data.email });
        const response = await this.httpClient.post('/api/auth/register', data);
        return response.data;
    }
    /**
     * Refresh access token
     */
    async refresh(refreshToken) {
        this.logger.debug('Refreshing token');
        const response = await this.httpClient.post('/api/auth/refresh', {
            refreshToken,
        });
        const token = response.data;
        // Update client authentication
        if (token.token) {
            this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${token.token}`;
        }
        return token;
    }
    /**
     * Logout
     */
    async logout() {
        this.logger.debug('Logging out');
        try {
            await this.httpClient.post('/api/auth/logout');
        }
        catch (error) {
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
    async me() {
        if (this.currentUser) {
            return this.currentUser;
        }
        const response = await this.httpClient.get('/api/auth/me');
        this.currentUser = response.data;
        return response.data;
    }
    /**
     * Get user by ID (admin only)
     */
    async getUserById(userId) {
        const response = await this.httpClient.get(`/api/auth/users/${userId}`);
        return response.data;
    }
    /**
     * Update user (admin only)
     */
    async updateUser(userId, data) {
        const response = await this.httpClient.patch(`/api/auth/users/${userId}`, data);
        return response.data;
    }
    /**
     * List users (admin only)
     */
    async listUsers(options) {
        const response = await this.httpClient.get('/api/auth/users', {
            params: options
        });
        return response.data;
    }
    /**
     * Search users (admin only)
     */
    async searchUsers(query, options) {
        return this.listUsers({ ...options, search: query });
    }
    /**
     * Update user profile
     */
    async updateProfile(data) {
        const response = await this.httpClient.patch('/api/auth/profile', data);
        this.currentUser = response.data;
        return response.data;
    }
    /**
     * Request password reset
     */
    async requestPasswordReset(email) {
        await this.httpClient.post('/api/auth/password/reset', { email });
    }
    /**
     * Reset password with token
     */
    async resetPassword(request) {
        await this.httpClient.post('/api/auth/password/reset/confirm', request);
    }
    /**
     * Change password
     */
    async changePassword(request) {
        await this.httpClient.post('/api/auth/password/change', request);
    }
    /**
     * Request email verification
     */
    async requestEmailVerification() {
        await this.httpClient.post('/api/auth/email/verify');
    }
    /**
     * Verify email with token
     */
    async verifyEmail(token) {
        await this.httpClient.post('/api/auth/email/verify/confirm', { token });
    }
    /**
     * Enable two-factor authentication
     */
    async enable2FA() {
        const response = await this.httpClient.post('/api/auth/2fa/enable');
        return response.data;
    }
    /**
     * Disable two-factor authentication
     */
    async disable2FA(code) {
        await this.httpClient.post('/api/auth/2fa/disable', { code });
    }
    /**
     * Verify 2FA code
     */
    async verify2FA(code) {
        const response = await this.httpClient.post('/api/auth/2fa/verify', { code });
        return response.data;
    }
    // Organization management
    /**
     * Create organization
     */
    async createOrganization(data) {
        const response = await this.httpClient.post('/api/organization/create', data);
        return response.data;
    }
    /**
     * Get user's organizations
     */
    async getOrganizations() {
        const response = await this.httpClient.get('/api/organization/my');
        return response.data;
    }
    /**
     * Switch organization context
     */
    async switchOrganization(organizationId) {
        this.httpClient.defaults.headers.common['X-Organization-Id'] = organizationId;
    }
    // Project management
    /**
     * Create project
     */
    async createProject(data) {
        const response = await this.httpClient.post('/api/project/create', data);
        return response.data;
    }
    /**
     * Get project details
     */
    async getProject(projectId) {
        const response = await this.httpClient.get(`/api/project/${projectId}`);
        return response.data;
    }
    /**
     * Switch project context
     */
    async switchProject(projectId) {
        this.httpClient.defaults.headers.common['X-Project-Id'] = projectId;
    }
    // API Key management
    /**
     * Create API key
     */
    async createApiKey(data) {
        const response = await this.httpClient.post('/api/api-key/create', data);
        return response.data;
    }
    /**
     * List API keys
     */
    async listApiKeys(projectId) {
        const response = await this.httpClient.get('/api/api-key/list', {
            params: { projectId },
        });
        return response.data;
    }
    /**
     * Revoke API key
     */
    async revokeApiKey(keyId) {
        await this.httpClient.delete(`/api/api-key/${keyId}`);
    }
    /**
     * Validate API key
     */
    async validateApiKey(apiKey) {
        try {
            const response = await this.httpClient.post('/api/api-key/validate', {
                apiKey,
            });
            return response.data.valid === true;
        }
        catch {
            return false;
        }
    }
    // Social authentication
    /**
     * Login with OAuth provider
     */
    async socialLogin(provider) {
        const response = await this.httpClient.get(`/api/auth/social/${provider}`);
        return response.data.authUrl;
    }
    /**
     * Handle OAuth callback
     */
    async socialCallback(provider, code) {
        const response = await this.httpClient.post(`/api/auth/social/${provider}/callback`, {
            code,
        });
        return response.data;
    }
    // Session management
    /**
     * Get active sessions
     */
    async getSessions() {
        const response = await this.httpClient.get('/api/auth/sessions');
        return response.data;
    }
    /**
     * Revoke session
     */
    async revokeSession(sessionId) {
        await this.httpClient.delete(`/api/auth/sessions/${sessionId}`);
    }
    /**
     * Revoke all sessions
     */
    async revokeAllSessions() {
        await this.httpClient.delete('/api/auth/sessions');
    }
}
exports.AuthClient = AuthClient;
//# sourceMappingURL=auth-client.js.map