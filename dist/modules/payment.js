"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentClient = void 0;
/**
 * Payment Client
 *
 * Multi-tenant Stripe integration for subscription management.
 * Uses tenant context (org/project/app) via headers automatically.
 *
 * @example
 * ```typescript
 * // Create payment configuration (uses API key's tenant context)
 * await client.payment.createConfig({
 *   stripePublishableKey: 'pk_...',
 *   stripeSecretKey: 'sk_...',
 *   stripeWebhookSecret: 'whsec_...'
 * });
 *
 * // Create subscription checkout session
 * const session = await client.payment.createCheckoutSession(orgId, projectId, {
 *   priceId: 'price_xxx',
 *   customerEmail: 'user@example.com',
 *   successUrl: 'https://yourapp.com/success',
 *   cancelUrl: 'https://yourapp.com/cancel'
 * });
 * ```
 */
class PaymentClient {
    constructor(httpClient, config, logger) {
        this.httpClient = httpClient;
        this.config = config;
        this.logger = logger;
    }
    // ============================================
    // Payment Configuration
    // ============================================
    /**
     * Create payment configuration
     * Uses the API key's tenant context (org/project/app) automatically
     *
     * @param config Payment configuration details
     * @returns Created payment configuration
     *
     * @example
     * ```typescript
     * // API key determines which org/project/app this config belongs to
     * const config = await client.payment.createConfig({
     *   stripePublishableKey: 'pk_test_...',
     *   stripeSecretKey: 'sk_test_...',
     *   stripeWebhookSecret: 'whsec_...',
     *   currency: 'usd'
     * });
     * ```
     */
    async createConfig(config) {
        try {
            this.logger.debug('Creating payment configuration');
            const response = await this.httpClient.post(`/tenant-payment/config`, config);
            this.logger.debug('Payment configuration created successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to create payment configuration', error);
            throw error;
        }
    }
    /**
     * Get payment configuration
     * Uses the API key's tenant context automatically
     *
     * @returns Payment configuration
     *
     * @example
     * ```typescript
     * const config = await client.payment.getConfig();
     * console.log('Stripe publishable key:', config.stripePublishableKey);
     * ```
     */
    async getConfig() {
        try {
            this.logger.debug('Getting payment configuration');
            const response = await this.httpClient.get(`/tenant-payment/config`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get payment configuration', error);
            throw error;
        }
    }
    /**
     * Update payment configuration
     * Uses the API key's tenant context automatically
     *
     * @param updates Configuration updates
     * @returns Updated payment configuration
     *
     * @example
     * ```typescript
     * const config = await client.payment.updateConfig({
     *   currency: 'eur',
     *   isActive: true
     * });
     * ```
     */
    async updateConfig(updates) {
        try {
            this.logger.debug('Updating payment configuration', { updates });
            const response = await this.httpClient.put(`/tenant-payment/config`, updates);
            this.logger.debug('Payment configuration updated successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to update payment configuration', error);
            throw error;
        }
    }
    /**
     * Delete payment configuration
     * Uses the API key's tenant context automatically
     *
     * @example
     * ```typescript
     * await client.payment.deleteConfig();
     * ```
     */
    async deleteConfig() {
        try {
            this.logger.debug('Deleting payment configuration');
            await this.httpClient.delete(`/tenant-payment/config`);
            this.logger.debug('Payment configuration deleted successfully');
        }
        catch (error) {
            this.logger.error('Failed to delete payment configuration', error);
            throw error;
        }
    }
    // ============================================
    // Price ID Management
    // ============================================
    /**
     * Add a price ID to the organization/project
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param priceId Stripe price ID
     * @returns Created price ID configuration
     *
     * @example
     * ```typescript
     * const priceConfig = await client.payment.addPriceId('org_123', 'proj_456', 'price_xxx');
     * ```
     */
    async addPriceId(organizationId, projectId, priceId) {
        try {
            this.logger.debug('Adding price ID', { organizationId, projectId, priceId });
            const response = await this.httpClient.post(`/tenant-payment/${organizationId}/${projectId}/prices`, { priceId });
            this.logger.debug('Price ID added successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to add price ID', error);
            throw error;
        }
    }
    /**
     * Get all price IDs for an organization/project
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @returns List of price ID configurations
     *
     * @example
     * ```typescript
     * const prices = await client.payment.getPriceIds('org_123', 'proj_456');
     * console.log('Available price IDs:', prices);
     * ```
     */
    async getPriceIds(organizationId, projectId) {
        try {
            this.logger.debug('Getting price IDs', { organizationId, projectId });
            const response = await this.httpClient.get(`/tenant-payment/${organizationId}/${projectId}/prices`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get price IDs', error);
            throw error;
        }
    }
    /**
     * Remove a price ID from the organization/project
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param priceId Stripe Price ID
     *
     * @example
     * ```typescript
     * await client.payment.removePriceId('org_123', 'proj_456', 'price_xxx');
     * ```
     */
    async removePriceId(organizationId, projectId, priceId) {
        try {
            this.logger.debug('Removing price ID', { organizationId, projectId, priceId });
            await this.httpClient.delete(`/tenant-payment/${organizationId}/${projectId}/prices/${priceId}`);
            this.logger.debug('Price ID removed successfully');
        }
        catch (error) {
            this.logger.error('Failed to remove price ID', error);
            throw error;
        }
    }
    // ============================================
    // Subscription Management
    // ============================================
    /**
     * Create a subscription checkout session
     * This creates a Stripe Checkout session URL that customers use to subscribe
     * Organization and project context is determined from the API key
     *
     * @param data Subscription checkout data (priceId must be from tenant_payment_configs.price_ids)
     * @returns Checkout session with URL
     *
     * @example
     * ```typescript
     * // First, get the payment config to see available price IDs
     * const config = await client.payment.getConfig();
     * console.log('Available plans:', config.priceIds); // ["price_xxx", "price_yyy"]
     *
     * // Create checkout session with one of the configured price IDs
     * const session = await client.payment.createCheckoutSession({
     *   priceId: config.priceIds[0], // Use a price ID from the config
     *   successUrl: 'https://yourapp.com/success',
     *   cancelUrl: 'https://yourapp.com/cancel',
     *   customerEmail: 'user@example.com',
     *   trialPeriodDays: 14
     * });
     *
     * // Redirect user to Stripe checkout
     * window.location.href = session.url;
     * ```
     */
    async createCheckoutSession(data) {
        try {
            this.logger.debug('Creating subscription checkout session', { data });
            const response = await this.httpClient.post(`/tenant-payment/subscriptions`, data);
            this.logger.debug('Checkout session created successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to create checkout session', error);
            throw error;
        }
    }
    /**
     * Get subscription details by ID
     * Organization and project context is determined from the API key
     *
     * @param subscriptionId Subscription ID
     * @returns Subscription details
     *
     * @example
     * ```typescript
     * const subscription = await client.payment.getSubscription('sub_xxx');
     * console.log('Status:', subscription.status);
     * ```
     */
    async getSubscription(subscriptionId) {
        try {
            this.logger.debug('Getting subscription', { subscriptionId });
            const response = await this.httpClient.get(`/tenant-payment/subscriptions/${subscriptionId}`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get subscription', error);
            throw error;
        }
    }
    /**
     * List all subscriptions
     * Organization and project context is determined from the API key
     *
     * @returns Array of subscriptions
     *
     * @example
     * ```typescript
     * const subscriptions = await client.payment.listSubscriptions();
     * console.log('Total subscriptions:', subscriptions.length);
     * ```
     */
    async listSubscriptions() {
        try {
            this.logger.debug('Listing subscriptions');
            const response = await this.httpClient.get(`/tenant-payment/subscriptions`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to list subscriptions', error);
            throw error;
        }
    }
    /**
     * Get active subscription by metadata
     * ALL business logic for determining "active" is handled by Fluxez backend
     * Tenant apps just call this method - no filtering logic needed in tenant
     *
     * @param metadataKey - The metadata field to search (e.g., 'workspaceId')
     * @param metadataValue - The value to match (e.g., workspace UUID)
     * @returns Active subscription or null if not found
     *
     * @example
     * const subscription = await client.payment.getActiveSubscriptionByMetadata('workspaceId', '123-456');
     */
    async getActiveSubscriptionByMetadata(metadataKey, metadataValue) {
        try {
            const url = `/tenant-payment/subscriptions/active/${metadataKey}/${metadataValue}`;
            this.logger.debug(`[SDK] Getting active subscription by ${metadataKey}=${metadataValue}`);
            this.logger.debug(`[SDK] Full URL path: ${url}`);
            this.logger.debug(`[SDK] Base URL: ${this.httpClient.config?.baseURL || 'unknown'}`);
            const response = await this.httpClient.get(url);
            this.logger.debug(`[SDK] Response received:`, JSON.stringify(response.data, null, 2));
            return response.data;
        }
        catch (error) {
            this.logger.error(`[SDK] Error calling ${metadataKey}=${metadataValue}:`, error?.message || error);
            this.logger.error(`[SDK] Error status:`, error?.status);
            this.logger.error(`[SDK] Error response:`, error?.response?.data);
            if (error.status === 404) {
                // No active subscription found - return null instead of throwing
                this.logger.debug(`[SDK] 404 - returning null`);
                return null;
            }
            this.logger.error('Failed to get active subscription', error);
            throw error;
        }
    }
    /**
     * Cancel a subscription
     * The subscription will be canceled at the end of the current billing period
     * Organization and project context is determined from the API key
     *
     * @param subscriptionId Subscription ID
     * @returns Canceled subscription details
     *
     * @example
     * ```typescript
     * const subscription = await client.payment.cancelSubscription('sub_xxx');
     * console.log('Subscription will end on:', subscription.currentPeriodEnd);
     * ```
     */
    async cancelSubscription(subscriptionId) {
        try {
            this.logger.debug('Canceling subscription', { subscriptionId });
            const response = await this.httpClient.delete(`/tenant-payment/subscriptions/${subscriptionId}`);
            this.logger.debug('Subscription canceled successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to cancel subscription', error);
            throw error;
        }
    }
    // ============================================
    // Webhook Management
    // ============================================
    /**
     * Handle a webhook event
     * Note: The webhook endpoint is typically called by Stripe, not your application
     * This method is provided for completeness but you'll usually handle webhooks server-side
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param signature Stripe signature header
     * @param payload Raw webhook payload
     * @returns Processing result
     *
     * @example
     * ```typescript
     * // In your webhook handler
     * const result = await client.payment.handleWebhook(
     *   'org_123',
     *   'proj_456',
     *   req.headers['stripe-signature'],
     *   req.rawBody
     * );
     * ```
     */
    async handleWebhook(organizationId, projectId, signature, payload) {
        try {
            this.logger.debug('Handling webhook event', { organizationId, projectId });
            const response = await this.httpClient.post(`/tenant-payment/${organizationId}/${projectId}/webhook`, payload, {
                headers: {
                    'stripe-signature': signature,
                    'content-type': 'application/json'
                }
            });
            this.logger.debug('Webhook event handled successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to handle webhook event', error);
            throw error;
        }
    }
}
exports.PaymentClient = PaymentClient;
//# sourceMappingURL=payment.js.map