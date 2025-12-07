"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentClient = void 0;
/**
 * Payment Client
 *
 * Multi-tenant Stripe integration for subscription management.
 * Uses tenant context (org/project/app) via headers automatically.
 *
 * Payment configuration is stored in tenant DB (auth.payment_providers).
 *
 * @example
 * ```typescript
 * // Get payment configuration (uses API key's tenant context)
 * const config = await client.payment.getConfig();
 *
 * // Configure payment provider
 * await client.payment.configureProvider({
 *   usePlatformKeys: true,
 *   enabled: true,
 *   subscriptionEnabled: true,
 *   priceIds: ['price_xxx', 'price_yyy']
 * });
 *
 * // Create subscription checkout session
 * const session = await client.payment.createCheckoutSession({
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
    // Payment Configuration (via tenant-auth)
    // ============================================
    /**
     * Get payment provider configuration
     * Uses the API key's tenant context automatically
     * Configuration is stored in tenant DB (auth.payment_providers)
     *
     * @returns Payment configuration
     *
     * @example
     * ```typescript
     * const config = await client.payment.getConfig();
     * console.log('Enabled:', config.enabled);
     * console.log('Price IDs:', config.priceIds);
     * ```
     */
    async getConfig() {
        try {
            this.logger.debug('Getting payment configuration from tenant-auth');
            const response = await this.httpClient.get(`/tenant-auth/payment-providers`);
            // Handle the response structure from tenant-auth
            const result = response.data;
            if (!result?.configured || !result?.provider) {
                this.logger.debug('No payment provider configured');
                return null;
            }
            // Map tenant-auth response to PaymentConfig format
            const provider = result.provider;
            const config = {
                id: provider.id,
                publishableKey: provider.publishableKey,
                hasSecretKey: provider.hasSecretKey,
                hasWebhookSecret: provider.hasWebhookSecret,
                enabled: provider.enabled,
                usePlatformKeys: provider.usePlatformKeys,
                subscriptionEnabled: provider.subscriptionEnabled,
                oneTimeEnabled: provider.oneTimeEnabled,
                priceIds: provider.priceIds || [],
                displayName: provider.displayName,
                createdAt: provider.createdAt,
                updatedAt: provider.updatedAt,
            };
            this.logger.debug('Payment config retrieved:', JSON.stringify(config));
            return config;
        }
        catch (error) {
            // If 404 or no config, return null instead of throwing
            if (error?.response?.status === 404 || error?.status === 404) {
                this.logger.debug('No payment configuration found');
                return null;
            }
            this.logger.error('Failed to get payment configuration', error);
            throw error;
        }
    }
    /**
     * Configure payment provider
     * Uses the API key's tenant context automatically
     * Configuration is stored in tenant DB (auth.payment_providers)
     *
     * @param config Payment configuration details
     * @returns Success status
     *
     * @example
     * ```typescript
     * // Use Fluxez platform Stripe keys
     * await client.payment.configureProvider({
     *   usePlatformKeys: true,
     *   enabled: true,
     *   subscriptionEnabled: true,
     *   priceIds: ['price_starter_monthly', 'price_pro_yearly']
     * });
     *
     * // Or use your own Stripe keys
     * await client.payment.configureProvider({
     *   usePlatformKeys: false,
     *   publishableKey: 'pk_live_...',
     *   secretKey: 'sk_live_...',
     *   webhookSecret: 'whsec_...',
     *   enabled: true
     * });
     * ```
     */
    async configureProvider(config) {
        try {
            this.logger.debug('Configuring payment provider');
            const response = await this.httpClient.post(`/tenant-auth/payment-providers`, config);
            this.logger.debug('Payment provider configured successfully');
            return { success: true };
        }
        catch (error) {
            this.logger.error('Failed to configure payment provider', error);
            throw error;
        }
    }
    /**
     * Update payment provider configuration
     * Uses the API key's tenant context automatically
     *
     * @param updates Configuration updates
     * @returns Success status
     */
    async updateConfig(updates) {
        try {
            this.logger.debug('Updating payment configuration', { updates });
            const response = await this.httpClient.post(`/tenant-auth/payment-providers`, updates);
            this.logger.debug('Payment configuration updated successfully');
            return { success: true };
        }
        catch (error) {
            this.logger.error('Failed to update payment configuration', error);
            throw error;
        }
    }
    /**
     * Delete payment provider configuration
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
            await this.httpClient.delete(`/tenant-auth/payment-providers`);
            this.logger.debug('Payment configuration deleted successfully');
        }
        catch (error) {
            this.logger.error('Failed to delete payment configuration', error);
            throw error;
        }
    }
    /**
     * @deprecated Use configureProvider() instead
     * Legacy method for backwards compatibility
     */
    async createConfig(config) {
        this.logger.warn('createConfig is deprecated, use configureProvider instead');
        await this.configureProvider(config);
        const result = await this.getConfig();
        return result;
    }
    // ============================================
    // Subscription Management
    // ============================================
    /**
     * Create a subscription checkout session
     * This creates a Stripe Checkout session URL that customers use to subscribe
     * Organization and project context is determined from the API key
     *
     * @param data Subscription checkout data
     * @returns Checkout session with URL
     *
     * @example
     * ```typescript
     * // Get the payment config to see available price IDs
     * const config = await client.payment.getConfig();
     * console.log('Available plans:', config.priceIds);
     *
     * // Create checkout session with one of the configured price IDs
     * const session = await client.payment.createCheckoutSession({
     *   priceId: config.priceIds[0],
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
            const response = await this.httpClient.get(url);
            this.logger.debug(`[SDK] Response received:`, JSON.stringify(response.data, null, 2));
            return response.data;
        }
        catch (error) {
            if (error?.response?.status === 404 || error?.status === 404) {
                // No active subscription found - return null instead of throwing
                this.logger.debug(`[SDK] 404 - no active subscription found, returning null`);
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
    /**
     * Resume a canceled subscription
     * This undoes cancel_at_period_end and continues the subscription
     *
     * @param subscriptionId Subscription ID (internal UUID or Stripe sub_xxx)
     * @returns Updated subscription
     *
     * @example
     * ```typescript
     * const subscription = await client.payment.resumeSubscription('sub_xxx');
     * console.log('Subscription resumed:', subscription.status);
     * ```
     */
    async resumeSubscription(subscriptionId) {
        try {
            this.logger.debug('Resuming subscription', { subscriptionId });
            const response = await this.httpClient.post(`/tenant-payment/subscriptions/${subscriptionId}/resume`, {});
            this.logger.debug('Subscription resumed successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to resume subscription', error);
            throw error;
        }
    }
    // ============================================
    // Stripe Connect
    // ============================================
    /**
     * Create a Stripe Connect Express account
     * This initiates the Connect onboarding flow for tenants using platform Stripe keys
     *
     * @param businessInfo Optional business information
     * @returns Account ID and onboarding URL
     *
     * @example
     * ```typescript
     * const result = await client.payment.createConnectAccount({
     *   email: 'business@example.com',
     *   businessName: 'My Business',
     *   country: 'US'
     * });
     * // Redirect user to onboarding URL
     * window.location.href = result.onboardingUrl;
     * ```
     */
    async createConnectAccount(businessInfo) {
        try {
            this.logger.debug('Creating Stripe Connect account', businessInfo);
            const response = await this.httpClient.post(`/tenant-payment/connect/account`, businessInfo || {});
            this.logger.debug('Connect account created successfully', response.data);
            return response.data.data || response.data;
        }
        catch (error) {
            this.logger.error('Failed to create Connect account', error);
            throw error;
        }
    }
    /**
     * Get Stripe Connect onboarding link for an existing account
     *
     * @returns Onboarding URL
     *
     * @example
     * ```typescript
     * const { onboardingUrl } = await client.payment.getConnectOnboardingLink();
     * window.location.href = onboardingUrl;
     * ```
     */
    async getConnectOnboardingLink() {
        try {
            this.logger.debug('Getting Connect onboarding link');
            const response = await this.httpClient.get(`/tenant-payment/connect/onboarding`);
            return response.data.data || response.data;
        }
        catch (error) {
            this.logger.error('Failed to get Connect onboarding link', error);
            throw error;
        }
    }
    /**
     * Get Stripe Connect account status
     *
     * @returns Account status including onboarding completion and payment capabilities
     *
     * @example
     * ```typescript
     * const status = await client.payment.getConnectAccountStatus();
     * if (status.chargesEnabled && status.payoutsEnabled) {
     *   console.log('Account is fully set up!');
     * }
     * ```
     */
    async getConnectAccountStatus() {
        try {
            this.logger.debug('Getting Connect account status');
            const response = await this.httpClient.get(`/tenant-payment/connect/status`);
            return response.data.data || response.data;
        }
        catch (error) {
            this.logger.error('Failed to get Connect account status', error);
            throw error;
        }
    }
    /**
     * Get Stripe Connect Express dashboard login link
     *
     * @returns Dashboard URL for the connected account
     *
     * @example
     * ```typescript
     * const { dashboardUrl } = await client.payment.getConnectDashboardLink();
     * window.open(dashboardUrl, '_blank');
     * ```
     */
    async getConnectDashboardLink() {
        try {
            this.logger.debug('Getting Connect dashboard link');
            const response = await this.httpClient.get(`/tenant-payment/connect/dashboard`);
            return response.data.data || response.data;
        }
        catch (error) {
            this.logger.error('Failed to get Connect dashboard link', error);
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
    // ============================================
    // Payment Methods Management
    // ============================================
    /**
     * List all payment methods for a customer
     * Returns saved cards, bank accounts, etc.
     *
     * @param userId User ID to get payment methods for
     * @param type Optional filter by type (e.g., 'card', 'us_bank_account')
     * @returns Array of payment methods
     *
     * @example
     * ```typescript
     * const paymentMethods = await client.payment.listPaymentMethods('user_123');
     * paymentMethods.forEach(pm => {
     *   if (pm.type === 'card') {
     *     console.log(`${pm.card.brand} ending in ${pm.card.last4}`);
     *   }
     * });
     * ```
     */
    async listPaymentMethods(userId, type) {
        try {
            this.logger.debug('Listing payment methods', { userId, type });
            const params = new URLSearchParams({ userId });
            if (type)
                params.append('type', type);
            const response = await this.httpClient.get(`/tenant-payment/payment-methods?${params.toString()}`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to list payment methods', error);
            throw error;
        }
    }
    /**
     * Add a payment method to a customer
     * The paymentMethodId should be created client-side using Stripe.js
     *
     * @param userId User ID to attach payment method to
     * @param paymentMethodId Stripe payment method ID (pm_xxx)
     * @param setAsDefault Whether to set as default payment method
     * @returns The attached payment method
     *
     * @example
     * ```typescript
     * // After creating payment method with Stripe.js
     * const pm = await client.payment.addPaymentMethod(
     *   'user_123',
     *   'pm_xxx_from_stripe_js',
     *   true // set as default
     * );
     * console.log('Added card:', pm.card?.last4);
     * ```
     */
    async addPaymentMethod(userId, paymentMethodId, setAsDefault = false) {
        try {
            this.logger.debug('Adding payment method', { userId, paymentMethodId, setAsDefault });
            const response = await this.httpClient.post(`/tenant-payment/payment-methods`, { userId, paymentMethodId, setAsDefault });
            this.logger.debug('Payment method added successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to add payment method', error);
            throw error;
        }
    }
    /**
     * Remove a payment method
     *
     * @param paymentMethodId Stripe payment method ID (pm_xxx)
     * @returns Success status
     *
     * @example
     * ```typescript
     * await client.payment.removePaymentMethod('pm_xxx');
     * console.log('Payment method removed');
     * ```
     */
    async removePaymentMethod(paymentMethodId) {
        try {
            this.logger.debug('Removing payment method', { paymentMethodId });
            const response = await this.httpClient.delete(`/tenant-payment/payment-methods/${paymentMethodId}`);
            this.logger.debug('Payment method removed successfully');
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to remove payment method', error);
            throw error;
        }
    }
    /**
     * Set a payment method as the default for a customer
     *
     * @param userId User ID
     * @param paymentMethodId Stripe payment method ID (pm_xxx)
     * @returns Success status
     *
     * @example
     * ```typescript
     * await client.payment.setDefaultPaymentMethod('user_123', 'pm_xxx');
     * console.log('Default payment method updated');
     * ```
     */
    async setDefaultPaymentMethod(userId, paymentMethodId) {
        try {
            this.logger.debug('Setting default payment method', { userId, paymentMethodId });
            const response = await this.httpClient.put(`/tenant-payment/payment-methods/${paymentMethodId}/default`, { userId });
            this.logger.debug('Default payment method set successfully');
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to set default payment method', error);
            throw error;
        }
    }
    // ============================================
    // Invoice Management
    // ============================================
    /**
     * List all invoices for a customer
     *
     * @param userId User ID to get invoices for
     * @param limit Maximum number of invoices to return (default 10)
     * @returns Array of invoices
     *
     * @example
     * ```typescript
     * const invoices = await client.payment.listInvoices('user_123', 20);
     * invoices.forEach(inv => {
     *   console.log(`Invoice ${inv.number}: $${inv.amountDue / 100} - ${inv.status}`);
     * });
     * ```
     */
    async listInvoices(userId, limit) {
        try {
            this.logger.debug('Listing invoices', { userId, limit });
            const params = new URLSearchParams({ userId });
            if (limit)
                params.append('limit', limit.toString());
            const response = await this.httpClient.get(`/tenant-payment/invoices?${params.toString()}`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to list invoices', error);
            throw error;
        }
    }
    /**
     * Get a specific invoice by ID
     *
     * @param invoiceId Stripe invoice ID (in_xxx)
     * @returns Invoice details
     *
     * @example
     * ```typescript
     * const invoice = await client.payment.getInvoice('in_xxx');
     * console.log('Amount due:', invoice.amountDue / 100);
     * console.log('PDF URL:', invoice.invoicePdf);
     * ```
     */
    async getInvoice(invoiceId) {
        try {
            this.logger.debug('Getting invoice', { invoiceId });
            const response = await this.httpClient.get(`/tenant-payment/invoices/${invoiceId}`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get invoice', error);
            throw error;
        }
    }
    /**
     * Get upcoming invoice preview for a customer
     * Shows what the next invoice will look like before it's finalized
     *
     * @param userId User ID to get upcoming invoice for
     * @returns Upcoming invoice preview or null if no upcoming invoice
     *
     * @example
     * ```typescript
     * const upcoming = await client.payment.getUpcomingInvoice('user_123');
     * if (upcoming) {
     *   console.log('Next billing amount:', upcoming.amountDue / 100);
     *   console.log('Next billing date:', new Date(upcoming.created * 1000));
     * }
     * ```
     */
    async getUpcomingInvoice(userId) {
        try {
            this.logger.debug('Getting upcoming invoice', { userId });
            const response = await this.httpClient.get(`/tenant-payment/invoices/upcoming?userId=${userId}`);
            return response.data.data;
        }
        catch (error) {
            // No upcoming invoice is not an error
            if (error?.response?.status === 404) {
                return null;
            }
            this.logger.error('Failed to get upcoming invoice', error);
            throw error;
        }
    }
}
exports.PaymentClient = PaymentClient;
//# sourceMappingURL=payment.js.map