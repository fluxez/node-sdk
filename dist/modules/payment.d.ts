import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import { PaymentConfig, CreatePaymentConfigRequest, UpdatePaymentConfigRequest, Subscription, CreateCheckoutSessionRequest } from '../types/payment.types';
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
export declare class PaymentClient {
    private httpClient;
    private config;
    private logger;
    constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger);
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
    getConfig(): Promise<PaymentConfig | null>;
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
    configureProvider(config: CreatePaymentConfigRequest): Promise<{
        success: boolean;
    }>;
    /**
     * Update payment provider configuration
     * Uses the API key's tenant context automatically
     *
     * @param updates Configuration updates
     * @returns Success status
     */
    updateConfig(updates: UpdatePaymentConfigRequest): Promise<{
        success: boolean;
    }>;
    /**
     * Delete payment provider configuration
     * Uses the API key's tenant context automatically
     *
     * @example
     * ```typescript
     * await client.payment.deleteConfig();
     * ```
     */
    deleteConfig(): Promise<void>;
    /**
     * @deprecated Use configureProvider() instead
     * Legacy method for backwards compatibility
     */
    createConfig(config: CreatePaymentConfigRequest): Promise<PaymentConfig>;
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
    createCheckoutSession(data: CreateCheckoutSessionRequest): Promise<{
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
    resumeSubscription(subscriptionId: string): Promise<Subscription>;
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
    createConnectAccount(businessInfo?: {
        email?: string;
        businessName?: string;
        country?: string;
    }): Promise<{
        accountId: string;
        onboardingUrl: string;
    }>;
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
    getConnectOnboardingLink(): Promise<{
        onboardingUrl: string;
    }>;
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
    getConnectAccountStatus(): Promise<{
        accountId: string | null;
        onboardingComplete: boolean;
        chargesEnabled: boolean;
        payoutsEnabled: boolean;
        detailsSubmitted: boolean;
    }>;
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
    getConnectDashboardLink(): Promise<{
        dashboardUrl: string;
    }>;
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
    listPaymentMethods(userId: string, type?: string): Promise<PaymentMethod[]>;
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
    addPaymentMethod(userId: string, paymentMethodId: string, setAsDefault?: boolean): Promise<PaymentMethod>;
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
    removePaymentMethod(paymentMethodId: string): Promise<{
        success: boolean;
    }>;
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
    setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<{
        success: boolean;
    }>;
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
    listInvoices(userId: string, limit?: number): Promise<Invoice[]>;
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
    getInvoice(invoiceId: string): Promise<Invoice>;
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
    getUpcomingInvoice(userId: string): Promise<Invoice | null>;
}
/**
 * Payment Method type
 * Represents a saved payment method (card, bank account, etc.)
 */
export interface PaymentMethod {
    id: string;
    type: 'card' | 'us_bank_account' | 'sepa_debit' | 'link' | string;
    card?: {
        brand: string;
        last4: string;
        expMonth: number;
        expYear: number;
        funding: 'credit' | 'debit' | 'prepaid' | 'unknown';
    };
    usBankAccount?: {
        bankName: string;
        last4: string;
        accountType: 'checking' | 'savings';
    };
    billingDetails: {
        name?: string;
        email?: string;
        phone?: string;
        address?: {
            city?: string;
            country?: string;
            line1?: string;
            line2?: string;
            postalCode?: string;
            state?: string;
        };
    };
    created: number;
    isDefault?: boolean;
}
/**
 * Invoice type
 * Represents a Stripe invoice
 */
export interface Invoice {
    id: string;
    number?: string;
    status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
    amountDue: number;
    amountPaid: number;
    amountRemaining: number;
    currency: string;
    created: number;
    dueDate?: number;
    periodStart: number;
    periodEnd: number;
    hostedInvoiceUrl?: string;
    invoicePdf?: string;
    lines: InvoiceLineItem[];
    subtotal: number;
    tax?: number;
    total: number;
}
/**
 * Invoice line item
 */
export interface InvoiceLineItem {
    id: string;
    description?: string;
    amount: number;
    currency: string;
    quantity?: number;
    period: {
        start: number;
        end: number;
    };
}
//# sourceMappingURL=payment.d.ts.map