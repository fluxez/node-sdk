import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import { PaymentConfig, CreatePaymentConfigRequest, UpdatePaymentConfigRequest, PriceIdConfig, Subscription, CreateSubscriptionRequest } from '../types/payment.types';
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
export declare class PaymentClient {
    private httpClient;
    private config;
    private logger;
    constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger);
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
    createConfig(config: CreatePaymentConfigRequest): Promise<PaymentConfig>;
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
    getConfig(): Promise<PaymentConfig>;
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
    updateConfig(updates: UpdatePaymentConfigRequest): Promise<PaymentConfig>;
    /**
     * Delete payment configuration
     * Uses the API key's tenant context automatically
     *
     * @example
     * ```typescript
     * await client.payment.deleteConfig();
     * ```
     */
    deleteConfig(): Promise<void>;
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
    addPriceId(organizationId: string, projectId: string, priceId: string): Promise<PriceIdConfig>;
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
    getPriceIds(organizationId: string, projectId: string): Promise<PriceIdConfig[]>;
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
    removePriceId(organizationId: string, projectId: string, priceId: string): Promise<void>;
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
    createCheckoutSession(data: CreateSubscriptionRequest): Promise<{
        url: string;
        sessionId: string;
    }>;
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
    getSubscription(subscriptionId: string): Promise<Subscription>;
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
    listSubscriptions(): Promise<Subscription[]>;
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
    getActiveSubscriptionByMetadata(metadataKey: string, metadataValue: string): Promise<Subscription | null>;
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
    cancelSubscription(subscriptionId: string): Promise<Subscription>;
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
    handleWebhook(organizationId: string, projectId: string, signature: string, payload: Buffer | string): Promise<{
        processed: boolean;
        message?: string;
    }>;
}
//# sourceMappingURL=payment.d.ts.map