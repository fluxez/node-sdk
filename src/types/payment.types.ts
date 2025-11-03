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
export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
  UNPAID = 'unpaid',
  PAUSED = 'paused'
}

/**
 * Subscription details
 */
export interface Subscription {
  id?: string;
  organizationId: string;
  projectId: string;
  appId?: string;
  userId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  plan?: string;
  interval?: string;
  status: SubscriptionStatus;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
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
  statementDescriptor?: string;
  captureMethod?: 'automatic' | 'manual';
  confirmationMethod?: 'automatic' | 'manual';
  returnUrl?: string;
  setupFutureUsage?: 'on_session' | 'off_session';
}

/**
 * Update payment intent request
 */
export interface UpdatePaymentIntentRequest {
  amount?: number;
  currency?: string;
  customerId?: string;
  paymentMethodId?: string;
  metadata?: Record<string, any>;
  description?: string;
  statementDescriptor?: string;
}

/**
 * Confirm payment intent request
 */
export interface ConfirmPaymentIntentRequest {
  paymentMethodId?: string;
  returnUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Cancel payment intent request
 */
export interface CancelPaymentIntentRequest {
  cancellationReason?: 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'abandoned';
}

/**
 * Capture payment intent request
 */
export interface CapturePaymentIntentRequest {
  amountToCapture?: number;
  statementDescriptor?: string;
}

/**
 * Charge details (for direct one-time payments)
 */
export interface Charge {
  id: string;
  chargeId: string;
  amount: number;
  amountCaptured: number;
  amountRefunded: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  paymentMethodId?: string;
  customerId?: string;
  description?: string;
  receiptUrl?: string;
  metadata?: Record<string, any>;
  created: string;
  paid: boolean;
  refunded: boolean;
  captured: boolean;
}

/**
 * Create direct charge request
 */
export interface CreateChargeRequest {
  amount: number;
  currency: string;
  source?: string;
  customerId?: string;
  description?: string;
  metadata?: Record<string, any>;
  statementDescriptor?: string;
  capture?: boolean;
}

/**
 * Refund details
 */
export interface Refund {
  id: string;
  refundId: string;
  chargeId?: string;
  paymentIntentId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  receiptNumber?: string;
  metadata?: Record<string, any>;
  created: string;
}

/**
 * Create refund request
 */
export interface CreateRefundRequest {
  chargeId?: string;
  paymentIntentId?: string;
  amount?: number;
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  refundApplicationFee?: boolean;
  reverseTransfer?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Payment source (card, bank account, etc.)
 */
export interface PaymentSource {
  id: string;
  object: 'card' | 'bank_account' | 'source';
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    funding: 'credit' | 'debit' | 'prepaid' | 'unknown';
    country?: string;
  };
  bankAccount?: {
    last4: string;
    bankName?: string;
    accountHolderType?: 'individual' | 'company';
    routingNumber?: string;
  };
  created: string;
}

/**
 * Direct payment result
 */
export interface DirectPaymentResult {
  success: boolean;
  paymentIntent?: PaymentIntent;
  charge?: Charge;
  error?: {
    code: string;
    message: string;
    declineCode?: string;
  };
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
