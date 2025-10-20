import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import { ApiResponse } from '../types';
import {
  PaymentConfig,
  CreatePaymentConfigRequest,
  UpdatePaymentConfigRequest,
  PriceIdConfig,
  AddPriceIdRequest,
  Subscription,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  Invoice,
  CheckoutSession,
  CreateCheckoutSessionRequest,
  Customer,
  CreateCustomerRequest,
  PaymentMethod,
  PaymentIntent,
  CreatePaymentIntentRequest,
  ListOptions,
  ListResponse,
  WebhookEvent,
  WebhookVerificationResult
} from '../types/payment.types';

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
export class PaymentClient {
  private httpClient: AxiosInstance;
  private config: FluxezConfig;
  private logger: Logger;

  constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger) {
    this.httpClient = httpClient;
    this.config = config;
    this.logger = logger;
  }

  // ============================================
  // Payment Configuration
  // ============================================

  /**
   * Create payment configuration for an organization/project/app
   *
   * @param organizationId Organization ID
   * @param projectId Project ID (optional)
   * @param appId App ID (optional)
   * @param config Payment configuration details
   * @returns Created payment configuration
   *
   * @example
   * ```typescript
   * const config = await client.payment.createConfig('org_123', 'proj_456', null, {
   *   stripePublishableKey: 'pk_test_...',
   *   stripeSecretKey: 'sk_test_...',
   *   stripeWebhookSecret: 'whsec_...',
   *   priceIds: ['price_123', 'price_456'],
   *   isActive: true
   * });
   * ```
   */
  async createConfig(
    organizationId: string,
    projectId?: string,
    appId?: string,
    config?: CreatePaymentConfigRequest
  ): Promise<PaymentConfig> {
    try {
      // Handle both old and new signatures
      let actualConfig: CreatePaymentConfigRequest;
      let actualOrgId: string;
      let actualProjectId: string | undefined;
      let actualAppId: string | undefined;

      // Check if called with old signature (orgId, projectId, config)
      if (typeof appId === 'object' && !config) {
        actualOrgId = organizationId;
        actualProjectId = projectId;
        actualAppId = undefined;
        actualConfig = appId as CreatePaymentConfigRequest;
      } else {
        actualOrgId = organizationId;
        actualProjectId = projectId;
        actualAppId = appId;
        actualConfig = config!;
      }

      this.logger.debug('Creating payment configuration', { organizationId: actualOrgId, projectId: actualProjectId, appId: actualAppId });

      const headers: Record<string, string> = {
        'x-organization-id': actualOrgId
      };
      if (actualProjectId) headers['x-project-id'] = actualProjectId;
      if (actualAppId) headers['x-app-id'] = actualAppId;

      const response = await this.httpClient.post<ApiResponse<PaymentConfig>>(
        `/tenant-payment/config`,
        actualConfig,
        { headers }
      );

      this.logger.debug('Payment configuration created successfully', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to create payment configuration', error);
      throw error;
    }
  }

  /**
   * Get payment configuration for an organization/project/app
   *
   * @param organizationId Organization ID
   * @param projectId Project ID (optional)
   * @param appId App ID (optional)
   * @returns Payment configuration
   *
   * @example
   * ```typescript
   * const config = await client.payment.getConfig('org_123', 'proj_456');
   * console.log('Stripe publishable key:', config.stripePublishableKey);
   * ```
   */
  async getConfig(organizationId: string, projectId?: string, appId?: string): Promise<PaymentConfig> {
    try {
      this.logger.debug('Getting payment configuration', { organizationId, projectId, appId });

      const headers: Record<string, string> = {
        'x-organization-id': organizationId
      };
      if (projectId) headers['x-project-id'] = projectId;
      if (appId) headers['x-app-id'] = appId;

      const response = await this.httpClient.get<ApiResponse<PaymentConfig>>(
        `/tenant-payment/config`,
        { headers }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get payment configuration', error);
      throw error;
    }
  }

  /**
   * Update payment configuration for an organization/project/app
   *
   * @param organizationId Organization ID
   * @param projectId Project ID (optional)
   * @param appId App ID (optional)
   * @param updates Configuration updates
   * @returns Updated payment configuration
   *
   * @example
   * ```typescript
   * const config = await client.payment.updateConfig('org_123', 'proj_456', null, {
   *   priceIds: ['price_123', 'price_456'],
   *   isActive: true
   * });
   * ```
   */
  async updateConfig(
    organizationId: string,
    projectId?: string,
    appId?: string,
    updates?: UpdatePaymentConfigRequest
  ): Promise<PaymentConfig> {
    try {
      // Handle both old and new signatures
      let actualUpdates: UpdatePaymentConfigRequest;
      let actualOrgId: string;
      let actualProjectId: string | undefined;
      let actualAppId: string | undefined;

      // Check if called with old signature (orgId, projectId, updates)
      if (typeof appId === 'object' && !updates) {
        actualOrgId = organizationId;
        actualProjectId = projectId;
        actualAppId = undefined;
        actualUpdates = appId as UpdatePaymentConfigRequest;
      } else {
        actualOrgId = organizationId;
        actualProjectId = projectId;
        actualAppId = appId;
        actualUpdates = updates!;
      }

      this.logger.debug('Updating payment configuration', { organizationId: actualOrgId, projectId: actualProjectId, appId: actualAppId, updates: actualUpdates });

      const headers: Record<string, string> = {
        'x-organization-id': actualOrgId
      };
      if (actualProjectId) headers['x-project-id'] = actualProjectId;
      if (actualAppId) headers['x-app-id'] = actualAppId;

      const response = await this.httpClient.put<ApiResponse<PaymentConfig>>(
        `/tenant-payment/config`,
        actualUpdates,
        { headers }
      );

      this.logger.debug('Payment configuration updated successfully', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to update payment configuration', error);
      throw error;
    }
  }

  /**
   * Delete payment configuration for an organization/project/app
   *
   * @param organizationId Organization ID
   * @param projectId Project ID (optional)
   * @param appId App ID (optional)
   *
   * @example
   * ```typescript
   * await client.payment.deleteConfig('org_123', 'proj_456');
   * ```
   */
  async deleteConfig(organizationId: string, projectId?: string, appId?: string): Promise<void> {
    try {
      this.logger.debug('Deleting payment configuration', { organizationId, projectId, appId });

      const headers: Record<string, string> = {
        'x-organization-id': organizationId
      };
      if (projectId) headers['x-project-id'] = projectId;
      if (appId) headers['x-app-id'] = appId;

      await this.httpClient.delete(`/tenant-payment/config`, { headers });

      this.logger.debug('Payment configuration deleted successfully');
    } catch (error) {
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
  async addPriceId(
    organizationId: string,
    projectId: string,
    priceId: string,
    metadata: Omit<AddPriceIdRequest, 'priceId'>
  ): Promise<PriceIdConfig> {
    try {
      this.logger.debug('Adding price ID', { organizationId, projectId, priceId });

      const response = await this.httpClient.post<ApiResponse<PriceIdConfig>>(
        `/payment/${organizationId}/${projectId}/prices`,
        {
          priceId,
          ...metadata
        }
      );

      this.logger.debug('Price ID added successfully', response.data);
      return response.data.data;
    } catch (error) {
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
  async getPriceIds(organizationId: string, projectId: string): Promise<PriceIdConfig[]> {
    try {
      this.logger.debug('Getting price IDs', { organizationId, projectId });

      const response = await this.httpClient.get<ApiResponse<PriceIdConfig[]>>(
        `/payment/${organizationId}/${projectId}/prices`
      );

      return response.data.data;
    } catch (error) {
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
  async removePriceId(
    organizationId: string,
    projectId: string,
    priceIdConfigId: string
  ): Promise<void> {
    try {
      this.logger.debug('Removing price ID', { organizationId, projectId, priceIdConfigId });

      await this.httpClient.delete(
        `/payment/${organizationId}/${projectId}/prices/${priceIdConfigId}`
      );

      this.logger.debug('Price ID removed successfully');
    } catch (error) {
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
  async createSubscription(
    organizationId: string,
    projectId: string,
    data: CreateSubscriptionRequest
  ): Promise<Subscription> {
    try {
      this.logger.debug('Creating subscription', { organizationId, projectId, data });

      const response = await this.httpClient.post<ApiResponse<Subscription>>(
        `/payment/${organizationId}/${projectId}/subscriptions`,
        data
      );

      this.logger.debug('Subscription created successfully', response.data);
      return response.data.data;
    } catch (error) {
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
  async getSubscription(
    organizationId: string,
    projectId: string,
    subscriptionId?: string
  ): Promise<Subscription> {
    try {
      this.logger.debug('Getting subscription', { organizationId, projectId, subscriptionId });

      const url = subscriptionId
        ? `/payment/${organizationId}/${projectId}/subscriptions/${subscriptionId}`
        : `/payment/${organizationId}/${projectId}/subscriptions`;

      const response = await this.httpClient.get<ApiResponse<Subscription>>(url);

      return response.data.data;
    } catch (error) {
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
  async updateSubscription(
    organizationId: string,
    projectId: string,
    subscriptionId: string,
    updates: UpdateSubscriptionRequest
  ): Promise<Subscription> {
    try {
      this.logger.debug('Updating subscription', { organizationId, projectId, subscriptionId, updates });

      const response = await this.httpClient.put<ApiResponse<Subscription>>(
        `/payment/${organizationId}/${projectId}/subscriptions/${subscriptionId}`,
        updates
      );

      this.logger.debug('Subscription updated successfully', response.data);
      return response.data.data;
    } catch (error) {
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
  async cancelSubscription(
    organizationId: string,
    projectId: string,
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<Subscription> {
    try {
      this.logger.debug('Canceling subscription', { organizationId, projectId, subscriptionId, cancelAtPeriodEnd });

      const response = await this.httpClient.post<ApiResponse<Subscription>>(
        `/payment/${organizationId}/${projectId}/subscriptions/${subscriptionId}/cancel`,
        { cancelAtPeriodEnd }
      );

      this.logger.debug('Subscription canceled successfully', response.data);
      return response.data.data;
    } catch (error) {
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
  async resumeSubscription(
    organizationId: string,
    projectId: string,
    subscriptionId: string
  ): Promise<Subscription> {
    try {
      this.logger.debug('Resuming subscription', { organizationId, projectId, subscriptionId });

      const response = await this.httpClient.post<ApiResponse<Subscription>>(
        `/payment/${organizationId}/${projectId}/subscriptions/${subscriptionId}/resume`
      );

      this.logger.debug('Subscription resumed successfully', response.data);
      return response.data.data;
    } catch (error) {
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
  async listSubscriptions(
    organizationId: string,
    projectId: string,
    options?: ListOptions
  ): Promise<ListResponse<Subscription>> {
    try {
      this.logger.debug('Listing subscriptions', { organizationId, projectId, options });

      const response = await this.httpClient.get<ApiResponse<ListResponse<Subscription>>>(
        `/payment/${organizationId}/${projectId}/subscriptions`,
        { params: options }
      );

      return response.data.data;
    } catch (error) {
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
  async getInvoices(
    organizationId: string,
    projectId: string,
    options?: ListOptions & { customerId?: string; subscriptionId?: string }
  ): Promise<ListResponse<Invoice>> {
    try {
      this.logger.debug('Getting invoices', { organizationId, projectId, options });

      const response = await this.httpClient.get<ApiResponse<ListResponse<Invoice>>>(
        `/payment/${organizationId}/${projectId}/invoices`,
        { params: options }
      );

      return response.data.data;
    } catch (error) {
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
  async getInvoice(
    organizationId: string,
    projectId: string,
    invoiceId: string
  ): Promise<Invoice> {
    try {
      this.logger.debug('Getting invoice', { organizationId, projectId, invoiceId });

      const response = await this.httpClient.get<ApiResponse<Invoice>>(
        `/payment/${organizationId}/${projectId}/invoices/${invoiceId}`
      );

      return response.data.data;
    } catch (error) {
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
  async createCheckoutSession(
    organizationId: string,
    projectId: string,
    data: CreateCheckoutSessionRequest
  ): Promise<CheckoutSession> {
    try {
      this.logger.debug('Creating checkout session', { organizationId, projectId, data });

      const response = await this.httpClient.post<ApiResponse<CheckoutSession>>(
        `/payment/${organizationId}/${projectId}/checkout`,
        data
      );

      this.logger.debug('Checkout session created successfully', response.data);
      return response.data.data;
    } catch (error) {
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
  async getCheckoutSession(
    organizationId: string,
    projectId: string,
    sessionId: string
  ): Promise<CheckoutSession> {
    try {
      this.logger.debug('Getting checkout session', { organizationId, projectId, sessionId });

      const response = await this.httpClient.get<ApiResponse<CheckoutSession>>(
        `/payment/${organizationId}/${projectId}/checkout/${sessionId}`
      );

      return response.data.data;
    } catch (error) {
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
  async createCustomer(
    organizationId: string,
    projectId: string,
    data: CreateCustomerRequest
  ): Promise<Customer> {
    try {
      this.logger.debug('Creating customer', { organizationId, projectId, data });

      const response = await this.httpClient.post<ApiResponse<Customer>>(
        `/payment/${organizationId}/${projectId}/customers`,
        data
      );

      this.logger.debug('Customer created successfully', response.data);
      return response.data.data;
    } catch (error) {
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
  async getCustomer(
    organizationId: string,
    projectId: string,
    customerId: string
  ): Promise<Customer> {
    try {
      this.logger.debug('Getting customer', { organizationId, projectId, customerId });

      const response = await this.httpClient.get<ApiResponse<Customer>>(
        `/payment/${organizationId}/${projectId}/customers/${customerId}`
      );

      return response.data.data;
    } catch (error) {
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
  async listPaymentMethods(
    organizationId: string,
    projectId: string,
    customerId: string
  ): Promise<PaymentMethod[]> {
    try {
      this.logger.debug('Listing payment methods', { organizationId, projectId, customerId });

      const response = await this.httpClient.get<ApiResponse<PaymentMethod[]>>(
        `/payment/${organizationId}/${projectId}/customers/${customerId}/payment-methods`
      );

      return response.data.data;
    } catch (error) {
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
  async createPaymentIntent(
    organizationId: string,
    projectId: string,
    data: CreatePaymentIntentRequest
  ): Promise<PaymentIntent> {
    try {
      this.logger.debug('Creating payment intent', { organizationId, projectId, data });

      const response = await this.httpClient.post<ApiResponse<PaymentIntent>>(
        `/payment/${organizationId}/${projectId}/payment-intents`,
        data
      );

      this.logger.debug('Payment intent created successfully', response.data);
      return response.data.data;
    } catch (error) {
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
  async getPaymentIntent(
    organizationId: string,
    projectId: string,
    paymentIntentId: string
  ): Promise<PaymentIntent> {
    try {
      this.logger.debug('Getting payment intent', { organizationId, projectId, paymentIntentId });

      const response = await this.httpClient.get<ApiResponse<PaymentIntent>>(
        `/payment/${organizationId}/${projectId}/payment-intents/${paymentIntentId}`
      );

      return response.data.data;
    } catch (error) {
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
  async verifyWebhook(
    organizationId: string,
    projectId: string,
    payload: string | Buffer,
    signature: string
  ): Promise<WebhookVerificationResult> {
    try {
      this.logger.debug('Verifying webhook', { organizationId, projectId });

      const response = await this.httpClient.post<ApiResponse<WebhookVerificationResult>>(
        `/payment/${organizationId}/${projectId}/webhooks/verify`,
        { payload, signature }
      );

      return response.data.data;
    } catch (error) {
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
  async handleWebhook(
    organizationId: string,
    projectId: string,
    event: WebhookEvent
  ): Promise<{ processed: boolean; message?: string }> {
    try {
      this.logger.debug('Handling webhook event', { organizationId, projectId, eventType: event.type });

      const response = await this.httpClient.post<ApiResponse<{ processed: boolean; message?: string }>>(
        `/payment/${organizationId}/${projectId}/webhooks/handle`,
        { event }
      );

      this.logger.debug('Webhook event handled successfully', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to handle webhook event', error);
      throw error;
    }
  }
}
