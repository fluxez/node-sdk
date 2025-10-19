/**
 * Fluxez Payment Module Types
 * Multi-tenant Stripe integration for subscription and payment management
 */
/**
 * Payment configuration for an organization/project
 */
export interface PaymentConfig {
    id?: string;
    organizationId: string;
    projectId: string;
    stripePublishableKey: string;
    stripeSecretKey: string;
    stripeWebhookSecret: string;
    currency?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
/**
 * Request to create payment configuration
 */
export interface CreatePaymentConfigRequest {
    stripePublishableKey: string;
    stripeSecretKey: string;
    stripeWebhookSecret: string;
    currency?: string;
}
/**
 * Request to update payment configuration
 */
export interface UpdatePaymentConfigRequest {
    stripePublishableKey?: string;
    stripeSecretKey?: string;
    stripeWebhookSecret?: string;
    currency?: string;
    isActive?: boolean;
}
/**
 * Price ID configuration for subscription plans
 */
export interface PriceIdConfig {
    id?: string;
    organizationId: string;
    projectId: string;
    priceId: string;
    name: string;
    description?: string;
    interval: 'day' | 'week' | 'month' | 'year';
    intervalCount?: number;
    amount?: number;
    currency?: string;
    isActive?: boolean;
    metadata?: Record<string, any>;
    createdAt?: string;
    updatedAt?: string;
}
/**
 * Request to add a price ID
 */
export interface AddPriceIdRequest {
    priceId: string;
    name: string;
    description?: string;
    interval: 'day' | 'week' | 'month' | 'year';
    intervalCount?: number;
    amount?: number;
    currency?: string;
    metadata?: Record<string, any>;
}
/**
 * Subscription status
 */
export declare enum SubscriptionStatus {
    ACTIVE = "active",
    CANCELED = "canceled",
    INCOMPLETE = "incomplete",
    INCOMPLETE_EXPIRED = "incomplete_expired",
    PAST_DUE = "past_due",
    TRIALING = "trialing",
    UNPAID = "unpaid",
    PAUSED = "paused"
}
/**
 * Subscription details
 */
export interface Subscription {
    id?: string;
    subscriptionId: string;
    organizationId: string;
    projectId: string;
    customerId: string;
    priceId: string;
    status: SubscriptionStatus;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
    canceledAt?: string;
    trialStart?: string;
    trialEnd?: string;
    metadata?: Record<string, any>;
    createdAt?: string;
    updatedAt?: string;
}
/**
 * Request to create a subscription
 */
export interface CreateSubscriptionRequest {
    customerId: string;
    priceId: string;
    trialPeriodDays?: number;
    metadata?: Record<string, any>;
    paymentMethodId?: string;
    couponId?: string;
    promotionCode?: string;
}
/**
 * Invoice details
 */
export interface Invoice {
    id: string;
    invoiceId: string;
    subscriptionId?: string;
    customerId: string;
    amount: number;
    amountPaid: number;
    amountDue: number;
    currency: string;
    status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
    invoicePdf?: string;
    hostedInvoiceUrl?: string;
    description?: string;
    metadata?: Record<string, any>;
    created: string;
    dueDate?: string;
    paidAt?: string;
}
/**
 * Checkout session details
 */
export interface CheckoutSession {
    id: string;
    sessionId: string;
    url: string;
    customerId?: string;
    customerEmail?: string;
    status: 'open' | 'complete' | 'expired';
    paymentStatus: 'paid' | 'unpaid' | 'no_payment_required';
    mode: 'payment' | 'subscription' | 'setup';
    successUrl: string;
    cancelUrl: string;
    expiresAt: string;
    metadata?: Record<string, any>;
}
/**
 * Request to create a checkout session
 */
export interface CreateCheckoutSessionRequest {
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    mode?: 'payment' | 'subscription' | 'setup';
    customerId?: string;
    customerEmail?: string;
    quantity?: number;
    allowPromotionCodes?: boolean;
    trialPeriodDays?: number;
    metadata?: Record<string, any>;
}
/**
 * Customer details
 */
export interface Customer {
    id: string;
    customerId: string;
    email: string;
    name?: string;
    phone?: string;
    description?: string;
    metadata?: Record<string, any>;
    created: string;
}
/**
 * Request to create a customer
 */
export interface CreateCustomerRequest {
    email: string;
    name?: string;
    phone?: string;
    description?: string;
    paymentMethodId?: string;
    metadata?: Record<string, any>;
}
/**
 * Payment method details
 */
export interface PaymentMethod {
    id: string;
    type: 'card' | 'bank_account' | 'sepa_debit' | 'ideal' | 'alipay';
    card?: {
        brand: string;
        last4: string;
        expMonth: number;
        expYear: number;
    };
    created: string;
}
/**
 * Webhook event
 */
export interface WebhookEvent {
    id: string;
    type: string;
    data: {
        object: any;
    };
    created: string;
}
/**
 * Subscription update request
 */
export interface UpdateSubscriptionRequest {
    priceId?: string;
    cancelAtPeriodEnd?: boolean;
    metadata?: Record<string, any>;
    prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
}
/**
 * Payment intent
 */
export interface PaymentIntent {
    id: string;
    amount: number;
    currency: string;
    status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
    clientSecret: string;
    customerId?: string;
    metadata?: Record<string, any>;
    created: string;
}
/**
 * Request to create a payment intent
 */
export interface CreatePaymentIntentRequest {
    amount: number;
    currency: string;
    customerId?: string;
    paymentMethodId?: string;
    metadata?: Record<string, any>;
    description?: string;
}
/**
 * List options for pagination
 */
export interface ListOptions {
    limit?: number;
    startingAfter?: string;
    endingBefore?: string;
}
/**
 * List response with pagination
 */
export interface ListResponse<T> {
    data: T[];
    hasMore: boolean;
    total?: number;
}
/**
 * Webhook verification result
 */
export interface WebhookVerificationResult {
    verified: boolean;
    event?: WebhookEvent;
    error?: string;
}
//# sourceMappingURL=payment.types.d.ts.map