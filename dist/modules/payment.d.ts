import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import { PaymentConfig, CreatePaymentConfigRequest, UpdatePaymentConfigRequest, PriceIdConfig, AddPriceIdRequest, Subscription, CreateSubscriptionRequest, UpdateSubscriptionRequest, Invoice, CheckoutSession, CreateCheckoutSessionRequest, Customer, CreateCustomerRequest, PaymentMethod, PaymentIntent, CreatePaymentIntentRequest, UpdatePaymentIntentRequest, ConfirmPaymentIntentRequest, CancelPaymentIntentRequest, CapturePaymentIntentRequest, Charge, CreateChargeRequest, Refund, CreateRefundRequest, DirectPaymentResult, ListOptions, ListResponse, WebhookEvent, WebhookVerificationResult } from '../types/payment.types';
/**
 * Payment Client
 *
 * Multi-tenant Stripe integration for subscription and direct payment management.
 * Supports payment configuration, subscription management, direct payments, refunds, and webhook handling.
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
 * // Subscription payment
 * await client.payment.createSubscription(orgId, projectId, {
 *   customerId: 'cus_xxx',
 *   priceId: 'price_xxx'
 * });
 *
 * // Direct one-time payment
 * await client.payment.createDirectPayment(orgId, projectId, {
 *   amount: 2999,
 *   currency: 'usd',
 *   customerId: 'cus_xxx',
 *   description: 'Product purchase'
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
     *   priceIds: ['price_123', 'price_456'],
     *   isActive: true
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
     *   priceIds: ['price_123', 'price_456'],
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
    addPriceId(organizationId: string, projectId: string, priceId: string, metadata: Omit<AddPriceIdRequest, 'priceId'>): Promise<PriceIdConfig>;
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
    getPriceIds(organizationId: string, projectId: string): Promise<PriceIdConfig[]>;
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
    removePriceId(organizationId: string, projectId: string, priceIdConfigId: string): Promise<void>;
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
    createSubscription(organizationId: string, projectId: string, data: CreateSubscriptionRequest): Promise<Subscription>;
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
    getSubscription(organizationId: string, projectId: string, subscriptionId?: string): Promise<Subscription>;
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
    updateSubscription(organizationId: string, projectId: string, subscriptionId: string, updates: UpdateSubscriptionRequest): Promise<Subscription>;
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
    cancelSubscription(organizationId: string, projectId: string, subscriptionId: string, cancelAtPeriodEnd?: boolean): Promise<Subscription>;
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
    resumeSubscription(organizationId: string, projectId: string, subscriptionId: string): Promise<Subscription>;
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
    listSubscriptions(organizationId: string, projectId: string, options?: ListOptions): Promise<ListResponse<Subscription>>;
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
    getInvoices(organizationId: string, projectId: string, options?: ListOptions & {
        customerId?: string;
        subscriptionId?: string;
    }): Promise<ListResponse<Invoice>>;
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
    getInvoice(organizationId: string, projectId: string, invoiceId: string): Promise<Invoice>;
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
    createCheckoutSession(organizationId: string, projectId: string, data: CreateCheckoutSessionRequest): Promise<CheckoutSession>;
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
    getCheckoutSession(organizationId: string, projectId: string, sessionId: string): Promise<CheckoutSession>;
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
    createCustomer(organizationId: string, projectId: string, data: CreateCustomerRequest): Promise<Customer>;
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
    getCustomer(organizationId: string, projectId: string, customerId: string): Promise<Customer>;
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
    listPaymentMethods(organizationId: string, projectId: string, customerId: string): Promise<PaymentMethod[]>;
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
    createPaymentIntent(organizationId: string, projectId: string, data: CreatePaymentIntentRequest): Promise<PaymentIntent>;
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
    getPaymentIntent(organizationId: string, projectId: string, paymentIntentId: string): Promise<PaymentIntent>;
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
    verifyWebhook(organizationId: string, projectId: string, payload: string | Buffer, signature: string): Promise<WebhookVerificationResult>;
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
    handleWebhook(organizationId: string, projectId: string, event: WebhookEvent): Promise<{
        processed: boolean;
        message?: string;
    }>;
    /**
     * Update an existing payment intent
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param paymentIntentId Payment intent ID
     * @param updates Payment intent updates
     * @returns Updated payment intent
     *
     * @example
     * ```typescript
     * const intent = await client.payment.updatePaymentIntent('org_123', 'proj_456', 'pi_xxx', {
     *   amount: 3499,
     *   description: 'Updated order amount'
     * });
     * ```
     */
    updatePaymentIntent(organizationId: string, projectId: string, paymentIntentId: string, updates: UpdatePaymentIntentRequest): Promise<PaymentIntent>;
    /**
     * Confirm a payment intent
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param paymentIntentId Payment intent ID
     * @param data Confirmation data
     * @returns Confirmed payment intent
     *
     * @example
     * ```typescript
     * const intent = await client.payment.confirmPaymentIntent('org_123', 'proj_456', 'pi_xxx', {
     *   paymentMethodId: 'pm_xxx',
     *   returnUrl: 'https://yourapp.com/payment/complete'
     * });
     *
     * if (intent.status === 'succeeded') {
     *   console.log('Payment successful!');
     * }
     * ```
     */
    confirmPaymentIntent(organizationId: string, projectId: string, paymentIntentId: string, data: ConfirmPaymentIntentRequest): Promise<PaymentIntent>;
    /**
     * Cancel a payment intent
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param paymentIntentId Payment intent ID
     * @param data Cancellation data
     * @returns Canceled payment intent
     *
     * @example
     * ```typescript
     * const intent = await client.payment.cancelPaymentIntent('org_123', 'proj_456', 'pi_xxx', {
     *   cancellationReason: 'requested_by_customer'
     * });
     * ```
     */
    cancelPaymentIntent(organizationId: string, projectId: string, paymentIntentId: string, data?: CancelPaymentIntentRequest): Promise<PaymentIntent>;
    /**
     * Capture a payment intent (for manual capture)
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param paymentIntentId Payment intent ID
     * @param data Capture data
     * @returns Captured payment intent
     *
     * @example
     * ```typescript
     * // Capture the full authorized amount
     * const intent = await client.payment.capturePaymentIntent('org_123', 'proj_456', 'pi_xxx');
     *
     * // Capture a partial amount
     * const intent = await client.payment.capturePaymentIntent('org_123', 'proj_456', 'pi_xxx', {
     *   amountToCapture: 1999
     * });
     * ```
     */
    capturePaymentIntent(organizationId: string, projectId: string, paymentIntentId: string, data?: CapturePaymentIntentRequest): Promise<PaymentIntent>;
    /**
     * List all payment intents
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param options List options
     * @returns List of payment intents
     *
     * @example
     * ```typescript
     * const intents = await client.payment.listPaymentIntents('org_123', 'proj_456', {
     *   limit: 10
     * });
     *
     * intents.data.forEach(intent => {
     *   console.log(`Payment ${intent.id}: ${intent.status}`);
     * });
     * ```
     */
    listPaymentIntents(organizationId: string, projectId: string, options?: ListOptions & {
        customerId?: string;
    }): Promise<ListResponse<PaymentIntent>>;
    /**
     * Create a direct payment (combines payment intent creation and confirmation)
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param data Payment data
     * @returns Direct payment result
     *
     * @example
     * ```typescript
     * // Create and confirm payment in one step
     * const result = await client.payment.createDirectPayment('org_123', 'proj_456', {
     *   amount: 2999,
     *   currency: 'usd',
     *   customerId: 'cus_xxx',
     *   paymentMethodId: 'pm_xxx',
     *   description: 'Product purchase',
     *   metadata: { orderId: 'order_123' }
     * });
     *
     * if (result.success) {
     *   console.log('Payment successful!', result.paymentIntent);
     * } else {
     *   console.error('Payment failed:', result.error?.message);
     * }
     * ```
     */
    createDirectPayment(organizationId: string, projectId: string, data: CreatePaymentIntentRequest & {
        confirmationMethod?: 'automatic';
    }): Promise<DirectPaymentResult>;
    /**
     * Create a direct charge (legacy method, use createDirectPayment for new implementations)
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param data Charge data
     * @returns Created charge
     *
     * @example
     * ```typescript
     * const charge = await client.payment.createCharge('org_123', 'proj_456', {
     *   amount: 2999,
     *   currency: 'usd',
     *   source: 'tok_visa', // or payment method
     *   description: 'Product purchase'
     * });
     * ```
     */
    createCharge(organizationId: string, projectId: string, data: CreateChargeRequest): Promise<Charge>;
    /**
     * Get charge details
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param chargeId Charge ID
     * @returns Charge details
     *
     * @example
     * ```typescript
     * const charge = await client.payment.getCharge('org_123', 'proj_456', 'ch_xxx');
     * console.log('Receipt URL:', charge.receiptUrl);
     * ```
     */
    getCharge(organizationId: string, projectId: string, chargeId: string): Promise<Charge>;
    /**
     * List all charges
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param options List options
     * @returns List of charges
     *
     * @example
     * ```typescript
     * const charges = await client.payment.listCharges('org_123', 'proj_456', {
     *   limit: 10
     * });
     * ```
     */
    listCharges(organizationId: string, projectId: string, options?: ListOptions & {
        customerId?: string;
    }): Promise<ListResponse<Charge>>;
    /**
     * Create a refund for a charge or payment intent
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param data Refund data
     * @returns Created refund
     *
     * @example
     * ```typescript
     * // Full refund
     * const refund = await client.payment.createRefund('org_123', 'proj_456', {
     *   chargeId: 'ch_xxx',
     *   reason: 'requested_by_customer'
     * });
     *
     * // Partial refund
     * const refund = await client.payment.createRefund('org_123', 'proj_456', {
     *   paymentIntentId: 'pi_xxx',
     *   amount: 1000,
     *   reason: 'requested_by_customer',
     *   metadata: { reason: 'Partial order cancellation' }
     * });
     * ```
     */
    createRefund(organizationId: string, projectId: string, data: CreateRefundRequest): Promise<Refund>;
    /**
     * Get refund details
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param refundId Refund ID
     * @returns Refund details
     *
     * @example
     * ```typescript
     * const refund = await client.payment.getRefund('org_123', 'proj_456', 're_xxx');
     * console.log('Refund status:', refund.status);
     * ```
     */
    getRefund(organizationId: string, projectId: string, refundId: string): Promise<Refund>;
    /**
     * List all refunds
     *
     * @param organizationId Organization ID
     * @param projectId Project ID
     * @param options List options
     * @returns List of refunds
     *
     * @example
     * ```typescript
     * const refunds = await client.payment.listRefunds('org_123', 'proj_456', {
     *   limit: 10
     * });
     *
     * refunds.data.forEach(refund => {
     *   console.log(`Refund ${refund.id}: ${refund.amount} ${refund.currency} - ${refund.status}`);
     * });
     * ```
     */
    listRefunds(organizationId: string, projectId: string, options?: ListOptions & {
        chargeId?: string;
        paymentIntentId?: string;
    }): Promise<ListResponse<Refund>>;
}
//# sourceMappingURL=payment.d.ts.map