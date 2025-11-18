"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthClient = void 0;
const constants_1 = require("../constants");
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
        const response = await this.httpClient.post(constants_1.API_ENDPOINTS.TENANT_AUTH.LOGIN, credentials);
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
    async register(data) {
        this.logger.debug('Registering user', { email: data.email });
        const response = await this.httpClient.post(constants_1.API_ENDPOINTS.TENANT_AUTH.REGISTER, data);
        return response.data;
    }
    /**
     * Refresh access token
     */
    async refresh(refreshToken) {
        this.logger.debug('Refreshing token');
        const response = await this.httpClient.post(constants_1.API_ENDPOINTS.TENANT_AUTH.REFRESH, {
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
    async logout() {
        this.logger.debug('Logging out');
        try {
            await this.httpClient.post(constants_1.API_ENDPOINTS.TENANT_AUTH.LOGOUT);
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
        const response = await this.httpClient.get('/tenant-auth/me');
        this.currentUser = response.data;
        return response.data;
    }
    /**
     * Get user by ID (admin only)
     */
    async getUserById(userId) {
        const response = await this.httpClient.get(`/tenant-auth/users/${userId}`);
        return response.data;
    }
    /**
     * Update user (admin only)
     */
    async updateUser(userId, data) {
        const response = await this.httpClient.put(`/tenant-auth/users/${userId}`, data);
        return response.data;
    }
    /**
     * List users (admin only)
     */
    async listUsers(options) {
        const response = await this.httpClient.get('/tenant-auth/users', {
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
        const response = await this.httpClient.patch('/tenant-auth/profile', data);
        this.currentUser = response.data;
        return response.data;
    }
    /**
     * Request password reset
     * @param email - User's email address
     * @param frontendUrl - Frontend URL where user will reset password (REQUIRED - must be provided by the calling application)
     */
    async requestPasswordReset(email, frontendUrl) {
        if (!frontendUrl) {
            throw new Error('frontendUrl is required for password reset. Please provide the URL where users can reset their password.');
        }
        await this.httpClient.post(constants_1.API_ENDPOINTS.TENANT_AUTH.FORGOT_PASSWORD, {
            email,
            frontendUrl
        });
    }
    /**
     * Reset password with token
     */
    async resetPassword(request) {
        await this.httpClient.post(constants_1.API_ENDPOINTS.TENANT_AUTH.RESET_PASSWORD, request);
    }
    /**
     * Change password for authenticated user
     */
    async changePassword(request) {
        await this.httpClient.post('/tenant-auth/password/change', request);
    }
    /**
     * Request email verification
     */
    async requestEmailVerification() {
        await this.httpClient.post('/tenant-auth/email/verify/request');
    }
    /**
     * Verify email with token
     */
    async verifyEmail(token) {
        await this.httpClient.post(constants_1.API_ENDPOINTS.TENANT_AUTH.VERIFY_EMAIL, { token });
    }
    /**
     * Resend email verification
     */
    async resendEmailVerification(email) {
        await this.httpClient.post('/tenant-auth/verify-email/resend', { email });
    }
    /**
     * Enable two-factor authentication
     */
    async enable2FA() {
        const response = await this.httpClient.post('/tenant-auth/2fa/enable');
        return response.data;
    }
    /**
     * Disable two-factor authentication
     */
    async disable2FA(code) {
        await this.httpClient.post('/tenant-auth/2fa/disable', { code });
    }
    /**
     * Verify 2FA code
     */
    async verify2FA(code) {
        const response = await this.httpClient.post('/tenant-auth/2fa/verify', { code });
        return response.data;
    }
    // Organization management
    /**
     * Create organization
     */
    async createOrganization(data) {
        const response = await this.httpClient.post('/organization/create', data);
        return response.data;
    }
    /**
     * Get user's organizations
     */
    async getOrganizations() {
        const response = await this.httpClient.get('/organization/my');
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
        const response = await this.httpClient.post('/project/create', data);
        return response.data;
    }
    /**
     * Get project details
     */
    async getProject(projectId) {
        const response = await this.httpClient.get(`/project/${projectId}`);
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
        const response = await this.httpClient.post('/api-key/create', data);
        return response.data;
    }
    /**
     * List API keys
     */
    async listApiKeys(projectId) {
        const response = await this.httpClient.get('/api-key/list', {
            params: { projectId },
        });
        return response.data;
    }
    /**
     * Revoke API key
     */
    async revokeApiKey(keyId) {
        await this.httpClient.delete(`/api-key/${keyId}`);
    }
    /**
     * Validate API key
     */
    async validateApiKey(apiKey) {
        try {
            const response = await this.httpClient.post('/api-key/validate', {
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
        const response = await this.httpClient.get(`${constants_1.API_ENDPOINTS.TENANT_AUTH.SOCIAL}/${provider}`);
        return response.data.authUrl;
    }
    /**
     * Handle OAuth callback
     */
    async socialCallback(provider, code) {
        const response = await this.httpClient.post(`${constants_1.API_ENDPOINTS.TENANT_AUTH.SOCIAL}/${provider}/callback`, {
            code,
        });
        return response.data;
    }
    // Session management
    /**
     * Get active sessions
     */
    async getSessions() {
        const response = await this.httpClient.get('/tenant-auth/sessions');
        return response.data;
    }
    /**
     * Revoke session
     */
    async revokeSession(sessionId) {
        await this.httpClient.delete(`/tenant-auth/sessions/${sessionId}`);
    }
    /**
     * Revoke all sessions
     */
    async revokeAllSessions() {
        await this.httpClient.delete('/tenant-auth/sessions');
    }
}
exports.AuthClient = AuthClient;
//# sourceMappingURL=auth-client.js.map