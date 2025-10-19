"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentClient = void 0;
/**
 * Payment Client
 *
 * Multi-tenant Stripe integration for subscription and payment management.
 * Supports payment configuration, subscription management, and webhook handling.
 *
 * @example
 * ```typescript
 * // Create payment configuration
 * await client.payment.createConfig(orgId, projectId, {
 *   stripePublishableKey: 'pk_...',
 *   stripeSecretKey: 'sk_...',
 *   stripeWebhookSecret: 'whsec_...'
 * });
 *
 * // Add price IDs
 * await client.payment.addPriceId(orgId, projectId, 'price_xxx', {
 *   name: 'Pro Monthly',
 *   interval: 'month'
 * });
 *
 * // Create subscription
 * await client.payment.createSubscription(orgId, projectId, {
 *   customerId: 'cus_xxx',
 *   priceId: 'price_xxx'
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
     * Create payment configuration for an organization/project
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param config Payment configuration details
     * @returns Created payment configuration
     *
     * @example
     * ```typescript
     * const config = await client.payment.createConfig('org_123', 'proj_456', {
     *   stripePublishableKey: 'pk_test_...',
     *   stripeSecretKey: 'sk_test_...',
     *   stripeWebhookSecret: 'whsec_...',
     *   currency: 'usd'
     * });
     * ```
     */
    async createConfig(organizationId, projectId, config) {
        try {
            this.logger.debug('Creating payment configuration', { organizationId, projectId });
            const response = await this.httpClient.post(`/payment/${organizationId}/${projectId}/config`, config);
            this.logger.debug('Payment configuration created successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to create payment configuration', error);
            throw error;
        }
    }
    /**
     * Get payment configuration for an organization/project
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @returns Payment configuration
     *
     * @example
     * ```typescript
     * const config = await client.payment.getConfig('org_123', 'proj_456');
     * console.log('Stripe publishable key:', config.stripePublishableKey);
     * ```
     */
    async getConfig(organizationId, projectId) {
        try {
            this.logger.debug('Getting payment configuration', { organizationId, projectId });
            const response = await this.httpClient.get(`/payment/${organizationId}/${projectId}/config`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get payment configuration', error);
            throw error;
        }
    }
    /**
     * Update payment configuration for an organization/project
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param updates Configuration updates
     * @returns Updated payment configuration
     *
     * @example
     * ```typescript
     * const config = await client.payment.updateConfig('org_123', 'proj_456', {
     *   currency: 'eur',
     *   isActive: true
     * });
     * ```
     */
    async updateConfig(organizationId, projectId, updates) {
        try {
            this.logger.debug('Updating payment configuration', { organizationId, projectId, updates });
            const response = await this.httpClient.put(`/payment/${organizationId}/${projectId}/config`, updates);
            this.logger.debug('Payment configuration updated successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to update payment configuration', error);
            throw error;
        }
    }
    /**
     * Delete payment configuration for an organization/project
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     *
     * @example
     * ```typescript
     * await client.payment.deleteConfig('org_123', 'proj_456');
     * ```
     */
    async deleteConfig(organizationId, projectId) {
        try {
            this.logger.debug('Deleting payment configuration', { organizationId, projectId });
            await this.httpClient.delete(`/payment/${organizationId}/${projectId}/config`);
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
     * @param metadata Price metadata
     * @returns Created price ID configuration
     *
     * @example
     * ```typescript
     * const priceConfig = await client.payment.addPriceId('org_123', 'proj_456', 'price_xxx', {
     *   name: 'Pro Monthly Plan',
     *   description: 'Monthly subscription to Pro features',
     *   interval: 'month',
     *   amount: 2999,
     *   currency: 'usd',
     *   metadata: { tier: 'pro', features: 'all' }
     * });
     * ```
     */
    async addPriceId(organizationId, projectId, priceId, metadata) {
        try {
            this.logger.debug('Adding price ID', { organizationId, projectId, priceId });
            const response = await this.httpClient.post(`/payment/${organizationId}/${projectId}/prices`, {
                priceId,
                ...metadata
            });
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
     * prices.forEach(price => {
     *   console.log(`${price.name}: ${price.amount} ${price.currency} per ${price.interval}`);
     * });
     * ```
     */
    async getPriceIds(organizationId, projectId) {
        try {
            this.logger.debug('Getting price IDs', { organizationId, projectId });
            const response = await this.httpClient.get(`/payment/${organizationId}/${projectId}/prices`);
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
     * @param priceIdConfigId Price ID configuration ID
     *
     * @example
     * ```typescript
     * await client.payment.removePriceId('org_123', 'proj_456', 'price_config_789');
     * ```
     */
    async removePriceId(organizationId, projectId, priceIdConfigId) {
        try {
            this.logger.debug('Removing price ID', { organizationId, projectId, priceIdConfigId });
            await this.httpClient.delete(`/payment/${organizationId}/${projectId}/prices/${priceIdConfigId}`);
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
     * Create a new subscription
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param data Subscription data
     * @returns Created subscription
     *
     * @example
     * ```typescript
     * const subscription = await client.payment.createSubscription('org_123', 'proj_456', {
     *   customerId: 'cus_xxx',
     *   priceId: 'price_xxx',
     *   trialPeriodDays: 14,
     *   metadata: { userId: 'user_123' }
     * });
     * ```
     */
    async createSubscription(organizationId, projectId, data) {
        try {
            this.logger.debug('Creating subscription', { organizationId, projectId, data });
            const response = await this.httpClient.post(`/payment/${organizationId}/${projectId}/subscriptions`, data);
            this.logger.debug('Subscription created successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to create subscription', error);
            throw error;
        }
    }
    /**
     * Get subscription details
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param subscriptionId Subscription ID (optional, returns first active if not provided)
     * @returns Subscription details
     *
     * @example
     * ```typescript
     * const subscription = await client.payment.getSubscription('org_123', 'proj_456', 'sub_xxx');
     * console.log('Status:', subscription.status);
     * console.log('Current period:', subscription.currentPeriodStart, 'to', subscription.currentPeriodEnd);
     * ```
     */
    async getSubscription(organizationId, projectId, subscriptionId) {
        try {
            this.logger.debug('Getting subscription', { organizationId, projectId, subscriptionId });
            const url = subscriptionId
                ? `/payment/${organizationId}/${projectId}/subscriptions/${subscriptionId}`
                : `/payment/${organizationId}/${projectId}/subscriptions`;
            const response = await this.httpClient.get(url);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get subscription', error);
            throw error;
        }
    }
    /**
     * Update a subscription
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param subscriptionId Subscription ID
     * @param updates Subscription updates
     * @returns Updated subscription
     *
     * @example
     * ```typescript
     * const subscription = await client.payment.updateSubscription('org_123', 'proj_456', 'sub_xxx', {
     *   priceId: 'price_yyy', // Upgrade/downgrade plan
     *   prorationBehavior: 'create_prorations'
     * });
     * ```
     */
    async updateSubscription(organizationId, projectId, subscriptionId, updates) {
        try {
            this.logger.debug('Updating subscription', { organizationId, projectId, subscriptionId, updates });
            const response = await this.httpClient.put(`/payment/${organizationId}/${projectId}/subscriptions/${subscriptionId}`, updates);
            this.logger.debug('Subscription updated successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to update subscription', error);
            throw error;
        }
    }
    /**
     * Cancel a subscription
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param subscriptionId Subscription ID
     * @param cancelAtPeriodEnd Whether to cancel at period end or immediately
     * @returns Canceled subscription
     *
     * @example
     * ```typescript
     * // Cancel at period end (recommended)
     * const subscription = await client.payment.cancelSubscription('org_123', 'proj_456', 'sub_xxx', true);
     *
     * // Cancel immediately
     * const subscription = await client.payment.cancelSubscription('org_123', 'proj_456', 'sub_xxx', false);
     * ```
     */
    async cancelSubscription(organizationId, projectId, subscriptionId, cancelAtPeriodEnd = true) {
        try {
            this.logger.debug('Canceling subscription', { organizationId, projectId, subscriptionId, cancelAtPeriodEnd });
            const response = await this.httpClient.post(`/payment/${organizationId}/${projectId}/subscriptions/${subscriptionId}/cancel`, { cancelAtPeriodEnd });
            this.logger.debug('Subscription canceled successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to cancel subscription', error);
            throw error;
        }
    }
    /**
     * Resume a canceled subscription (only if canceled at period end)
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param subscriptionId Subscription ID
     * @returns Resumed subscription
     *
     * @example
     * ```typescript
     * const subscription = await client.payment.resumeSubscription('org_123', 'proj_456', 'sub_xxx');
     * ```
     */
    async resumeSubscription(organizationId, projectId, subscriptionId) {
        try {
            this.logger.debug('Resuming subscription', { organizationId, projectId, subscriptionId });
            const response = await this.httpClient.post(`/payment/${organizationId}/${projectId}/subscriptions/${subscriptionId}/resume`);
            this.logger.debug('Subscription resumed successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to resume subscription', error);
            throw error;
        }
    }
    /**
     * List all subscriptions for an organization/project
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param options List options
     * @returns List of subscriptions
     *
     * @example
     * ```typescript
     * const subscriptions = await client.payment.listSubscriptions('org_123', 'proj_456', {
     *   limit: 10
     * });
     * ```
     */
    async listSubscriptions(organizationId, projectId, options) {
        try {
            this.logger.debug('Listing subscriptions', { organizationId, projectId, options });
            const response = await this.httpClient.get(`/payment/${organizationId}/${projectId}/subscriptions`, { params: options });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to list subscriptions', error);
            throw error;
        }
    }
    // ============================================
    // Invoice Management
    // ============================================
    /**
     * Get invoices for a subscription or customer
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param options Filter options
     * @returns List of invoices
     *
     * @example
     * ```typescript
     * const invoices = await client.payment.getInvoices('org_123', 'proj_456', {
     *   limit: 10
     * });
     *
     * invoices.data.forEach(invoice => {
     *   console.log(`Invoice ${invoice.invoiceId}: ${invoice.amount} ${invoice.currency} - ${invoice.status}`);
     * });
     * ```
     */
    async getInvoices(organizationId, projectId, options) {
        try {
            this.logger.debug('Getting invoices', { organizationId, projectId, options });
            const response = await this.httpClient.get(`/payment/${organizationId}/${projectId}/invoices`, { params: options });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get invoices', error);
            throw error;
        }
    }
    /**
     * Get a specific invoice
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param invoiceId Invoice ID
     * @returns Invoice details
     *
     * @example
     * ```typescript
     * const invoice = await client.payment.getInvoice('org_123', 'proj_456', 'in_xxx');
     * console.log('PDF URL:', invoice.invoicePdf);
     * console.log('Hosted URL:', invoice.hostedInvoiceUrl);
     * ```
     */
    async getInvoice(organizationId, projectId, invoiceId) {
        try {
            this.logger.debug('Getting invoice', { organizationId, projectId, invoiceId });
            const response = await this.httpClient.get(`/payment/${organizationId}/${projectId}/invoices/${invoiceId}`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get invoice', error);
            throw error;
        }
    }
    // ============================================
    // Checkout Session
    // ============================================
    /**
     * Create a checkout session
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param data Checkout session data
     * @returns Created checkout session
     *
     * @example
     * ```typescript
     * const session = await client.payment.createCheckoutSession('org_123', 'proj_456', {
     *   priceId: 'price_xxx',
     *   successUrl: 'https://yourapp.com/success',
     *   cancelUrl: 'https://yourapp.com/cancel',
     *   mode: 'subscription',
     *   customerEmail: 'user@example.com',
     *   allowPromotionCodes: true,
     *   trialPeriodDays: 14
     * });
     *
     * // Redirect user to session.url
     * console.log('Checkout URL:', session.url);
     * ```
     */
    async createCheckoutSession(organizationId, projectId, data) {
        try {
            this.logger.debug('Creating checkout session', { organizationId, projectId, data });
            const response = await this.httpClient.post(`/payment/${organizationId}/${projectId}/checkout`, data);
            this.logger.debug('Checkout session created successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to create checkout session', error);
            throw error;
        }
    }
    /**
     * Get checkout session details
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param sessionId Checkout session ID
     * @returns Checkout session details
     *
     * @example
     * ```typescript
     * const session = await client.payment.getCheckoutSession('org_123', 'proj_456', 'cs_xxx');
     * console.log('Payment status:', session.paymentStatus);
     * ```
     */
    async getCheckoutSession(organizationId, projectId, sessionId) {
        try {
            this.logger.debug('Getting checkout session', { organizationId, projectId, sessionId });
            const response = await this.httpClient.get(`/payment/${organizationId}/${projectId}/checkout/${sessionId}`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get checkout session', error);
            throw error;
        }
    }
    // ============================================
    // Customer Management
    // ============================================
    /**
     * Create a customer
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param data Customer data
     * @returns Created customer
     *
     * @example
     * ```typescript
     * const customer = await client.payment.createCustomer('org_123', 'proj_456', {
     *   email: 'user@example.com',
     *   name: 'John Doe',
     *   metadata: { userId: 'user_123' }
     * });
     * ```
     */
    async createCustomer(organizationId, projectId, data) {
        try {
            this.logger.debug('Creating customer', { organizationId, projectId, data });
            const response = await this.httpClient.post(`/payment/${organizationId}/${projectId}/customers`, data);
            this.logger.debug('Customer created successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to create customer', error);
            throw error;
        }
    }
    /**
     * Get customer details
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param customerId Customer ID
     * @returns Customer details
     *
     * @example
     * ```typescript
     * const customer = await client.payment.getCustomer('org_123', 'proj_456', 'cus_xxx');
     * ```
     */
    async getCustomer(organizationId, projectId, customerId) {
        try {
            this.logger.debug('Getting customer', { organizationId, projectId, customerId });
            const response = await this.httpClient.get(`/payment/${organizationId}/${projectId}/customers/${customerId}`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get customer', error);
            throw error;
        }
    }
    /**
     * List customer payment methods
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param customerId Customer ID
     * @returns List of payment methods
     *
     * @example
     * ```typescript
     * const paymentMethods = await client.payment.listPaymentMethods('org_123', 'proj_456', 'cus_xxx');
     * ```
     */
    async listPaymentMethods(organizationId, projectId, customerId) {
        try {
            this.logger.debug('Listing payment methods', { organizationId, projectId, customerId });
            const response = await this.httpClient.get(`/payment/${organizationId}/${projectId}/customers/${customerId}/payment-methods`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to list payment methods', error);
            throw error;
        }
    }
    // ============================================
    // Payment Intent
    // ============================================
    /**
     * Create a payment intent
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param data Payment intent data
     * @returns Created payment intent
     *
     * @example
     * ```typescript
     * const intent = await client.payment.createPaymentIntent('org_123', 'proj_456', {
     *   amount: 2999,
     *   currency: 'usd',
     *   customerId: 'cus_xxx',
     *   metadata: { orderId: 'order_123' }
     * });
     *
     * // Use intent.clientSecret on the frontend
     * console.log('Client secret:', intent.clientSecret);
     * ```
     */
    async createPaymentIntent(organizationId, projectId, data) {
        try {
            this.logger.debug('Creating payment intent', { organizationId, projectId, data });
            const response = await this.httpClient.post(`/payment/${organizationId}/${projectId}/payment-intents`, data);
            this.logger.debug('Payment intent created successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to create payment intent', error);
            throw error;
        }
    }
    /**
     * Get payment intent details
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param paymentIntentId Payment intent ID
     * @returns Payment intent details
     *
     * @example
     * ```typescript
     * const intent = await client.payment.getPaymentIntent('org_123', 'proj_456', 'pi_xxx');
     * console.log('Status:', intent.status);
     * ```
     */
    async getPaymentIntent(organizationId, projectId, paymentIntentId) {
        try {
            this.logger.debug('Getting payment intent', { organizationId, projectId, paymentIntentId });
            const response = await this.httpClient.get(`/payment/${organizationId}/${projectId}/payment-intents/${paymentIntentId}`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get payment intent', error);
            throw error;
        }
    }
    // ============================================
    // Webhook Management
    // ============================================
    /**
     * Verify a webhook signature
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param payload Webhook payload
     * @param signature Stripe signature header
     * @returns Verification result with parsed event
     *
     * @example
     * ```typescript
     * // In your webhook handler
     * const result = await client.payment.verifyWebhook(
     *   'org_123',
     *   'proj_456',
     *   req.body,
     *   req.headers['stripe-signature']
     * );
     *
     * if (result.verified) {
     *   console.log('Event type:', result.event.type);
     *   // Handle event
     * }
     * ```
     */
    async verifyWebhook(organizationId, projectId, payload, signature) {
        try {
            this.logger.debug('Verifying webhook', { organizationId, projectId });
            const response = await this.httpClient.post(`/payment/${organizationId}/${projectId}/webhooks/verify`, { payload, signature });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to verify webhook', error);
            throw error;
        }
    }
    /**
     * Handle a webhook event
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param event Webhook event
     * @returns Processing result
     *
     * @example
     * ```typescript
     * const result = await client.payment.handleWebhook('org_123', 'proj_456', event);
     * ```
     */
    async handleWebhook(organizationId, projectId, event) {
        try {
            this.logger.debug('Handling webhook event', { organizationId, projectId, eventType: event.type });
            const response = await this.httpClient.post(`/payment/${organizationId}/${projectId}/webhooks/handle`, { event });
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