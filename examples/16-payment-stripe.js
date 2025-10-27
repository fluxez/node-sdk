/**
 * Fluxez SDK - Payment & Stripe Integration Examples
 *
 * This example demonstrates comprehensive Stripe payment integration using the Fluxez SDK.
 * Perfect for SaaS applications, subscription-based services, and e-commerce platforms.
 *
 * Features demonstrated:
 * - Multi-tenant payment configuration
 * - Subscription plan management
 * - Customer management
 * - Checkout session creation
 * - Payment intent handling
 * - Invoice management
 * - Webhook verification and handling
 * - Complete payment workflows
 *
 * Time to complete: ~15 minutes
 */

const { FluxezClient } = require('@fluxez/node-sdk');

// Configuration
const API_KEY = process.env.FLUXEZ_API_KEY || 'cgx_your_api_key_here';

// Stripe credentials (use test mode keys for development)
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_...';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_...';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_...';

async function paymentExamplesMain() {
  console.log('💳 Fluxez SDK Payment & Stripe Integration Examples\n');

  const client = new FluxezClient(API_KEY, {
    
    debug: true,
    timeout: 60000, // Longer timeout for payment operations
  });

  try {
    // Test connection
    const connectionTest = await client.testConnection();
    if (!connectionTest.connected) {
      throw new Error('Cannot connect to backend. Please ensure the Fluxez backend is running.');
    }
    console.log('✅ Connected to Fluxez backend\n');

    // Set multi-tenant context
    const orgId = 'org_payment_demo';
    const projectId = 'proj_saas_app';

    await demonstratePaymentConfiguration(client, orgId, projectId);
    await demonstratePriceManagement(client, orgId, projectId);
    await demonstrateCustomerManagement(client, orgId, projectId);
    await demonstrateSubscriptionManagement(client, orgId, projectId);
    await demonstrateCheckoutSessions(client, orgId, projectId);
    await demonstratePaymentIntents(client, orgId, projectId);
    await demonstrateInvoiceManagement(client, orgId, projectId);
    await demonstrateWebhookHandling(client, orgId, projectId);
    await demonstrateCompletePaymentFlow(client, orgId, projectId);

    console.log('\n🎉 Payment Examples Complete!');

  } catch (error) {
    console.error('❌ Payment examples failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Ensure your backend has Stripe integration configured');
    console.log('- Check that Stripe API keys are properly set');
    console.log('- Verify your API key has payment permissions');
    console.log('- Make sure you are using Stripe test mode keys for development');
  }
}

async function demonstratePaymentConfiguration(client, orgId, projectId) {
  console.log('⚙️  Payment Configuration\n');
  console.log('==========================================');

  try {
    console.log('1. Creating payment configuration:');

    const paymentConfig = await client.payment.createConfig(orgId, projectId, {
      stripePublishableKey: STRIPE_PUBLISHABLE_KEY,
      stripeSecretKey: STRIPE_SECRET_KEY,
      stripeWebhookSecret: STRIPE_WEBHOOK_SECRET,
      currency: 'usd'
    });

    console.log('✅ Payment configuration created:', {
      id: paymentConfig.id,
      currency: paymentConfig.currency,
      isActive: paymentConfig.isActive,
      organizationId: paymentConfig.organizationId,
      projectId: paymentConfig.projectId
    });

    console.log('\n2. Getting payment configuration:');

    const config = await client.payment.getConfig(orgId, projectId);
    console.log('✅ Payment configuration retrieved:', {
      id: config.id,
      stripePublishableKey: config.stripePublishableKey.substring(0, 20) + '...',
      currency: config.currency,
      isActive: config.isActive
    });

    console.log('\n3. Updating payment configuration:');

    const updatedConfig = await client.payment.updateConfig(orgId, projectId, {
      currency: 'usd',
      isActive: true
    });

    console.log('✅ Payment configuration updated:', {
      currency: updatedConfig.currency,
      isActive: updatedConfig.isActive
    });

  } catch (error) {
    console.error('❌ Payment configuration failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

async function demonstratePriceManagement(client, orgId, projectId) {
  console.log('\n💰 Price Management\n');
  console.log('==========================================');

  try {
    console.log('1. Adding subscription price IDs:');

    // Add Starter plan
    const starterPrice = await client.payment.addPriceId(
      orgId,
      projectId,
      'price_starter_monthly', // Replace with actual Stripe price ID
      {
        name: 'Starter Monthly',
        description: 'Perfect for individuals and small teams',
        interval: 'month',
        amount: 999, // $9.99
        currency: 'usd',
        metadata: {
          tier: 'starter',
          features: 'basic',
          maxUsers: '5',
          storage: '10GB'
        }
      }
    );

    console.log('✅ Starter plan added:', {
      id: starterPrice.id,
      name: starterPrice.name,
      amount: `$${(starterPrice.amount / 100).toFixed(2)}`,
      interval: starterPrice.interval
    });

    // Add Pro plan
    const proPrice = await client.payment.addPriceId(
      orgId,
      projectId,
      'price_pro_monthly',
      {
        name: 'Pro Monthly',
        description: 'Advanced features for growing businesses',
        interval: 'month',
        amount: 2999, // $29.99
        currency: 'usd',
        metadata: {
          tier: 'pro',
          features: 'advanced',
          maxUsers: '25',
          storage: '100GB'
        }
      }
    );

    console.log('✅ Pro plan added:', {
      id: proPrice.id,
      name: proPrice.name,
      amount: `$${(proPrice.amount / 100).toFixed(2)}`,
      interval: proPrice.interval
    });

    // Add Enterprise plan
    const enterprisePrice = await client.payment.addPriceId(
      orgId,
      projectId,
      'price_enterprise_monthly',
      {
        name: 'Enterprise Monthly',
        description: 'Unlimited power for large organizations',
        interval: 'month',
        amount: 9999, // $99.99
        currency: 'usd',
        metadata: {
          tier: 'enterprise',
          features: 'all',
          maxUsers: 'unlimited',
          storage: '1TB'
        }
      }
    );

    console.log('✅ Enterprise plan added:', {
      id: enterprisePrice.id,
      name: enterprisePrice.name,
      amount: `$${(enterprisePrice.amount / 100).toFixed(2)}`,
      interval: enterprisePrice.interval
    });

    console.log('\n2. Getting all price IDs:');

    const prices = await client.payment.getPriceIds(orgId, projectId);
    console.log('✅ Available plans:', prices.length);

    prices.forEach(price => {
      console.log(`   - ${price.name}: $${(price.amount / 100).toFixed(2)}/${price.interval}`);
      console.log(`     Features: ${price.metadata?.features || 'N/A'}`);
    });

    console.log('\n3. Annual pricing example:');

    const annualPrice = await client.payment.addPriceId(
      orgId,
      projectId,
      'price_pro_annual',
      {
        name: 'Pro Annual (Save 20%)',
        description: 'Pro plan billed annually with 20% discount',
        interval: 'year',
        intervalCount: 1,
        amount: 28788, // $287.88 (20% discount from $359.88)
        currency: 'usd',
        metadata: {
          tier: 'pro',
          discount: '20%',
          savings: '$71.88'
        }
      }
    );

    console.log('✅ Annual plan added:', {
      name: annualPrice.name,
      amount: `$${(annualPrice.amount / 100).toFixed(2)}/year`,
      savings: annualPrice.metadata?.savings
    });

  } catch (error) {
    console.error('❌ Price management failed:', error.message);
  }
}

async function demonstrateCustomerManagement(client, orgId, projectId) {
  console.log('\n👤 Customer Management\n');
  console.log('==========================================');

  try {
    console.log('1. Creating customers:');

    // Create customer 1
    const customer1 = await client.payment.createCustomer(orgId, projectId, {
      email: 'john.doe@example.com',
      name: 'John Doe',
      phone: '+1234567890',
      description: 'Pro plan customer',
      metadata: {
        userId: 'user_john_123',
        companyName: 'Acme Corp',
        signupDate: new Date().toISOString(),
        source: 'website'
      }
    });

    console.log('✅ Customer 1 created:', {
      customerId: customer1.customerId,
      email: customer1.email,
      name: customer1.name
    });

    // Create customer 2
    const customer2 = await client.payment.createCustomer(orgId, projectId, {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      description: 'Enterprise plan customer',
      metadata: {
        userId: 'user_jane_456',
        companyName: 'TechStart Inc',
        employeeCount: '50'
      }
    });

    console.log('✅ Customer 2 created:', {
      customerId: customer2.customerId,
      email: customer2.email,
      name: customer2.name
    });

    console.log('\n2. Getting customer details:');

    const customerDetails = await client.payment.getCustomer(orgId, projectId, customer1.customerId);
    console.log('✅ Customer details retrieved:', {
      customerId: customerDetails.customerId,
      email: customerDetails.email,
      name: customerDetails.name,
      created: customerDetails.created,
      metadata: customerDetails.metadata
    });

    console.log('\n3. Listing customer payment methods:');

    try {
      const paymentMethods = await client.payment.listPaymentMethods(
        orgId,
        projectId,
        customer1.customerId
      );

      if (paymentMethods.length === 0) {
        console.log('⚠️  No payment methods on file (customer needs to add a payment method)');
      } else {
        console.log('✅ Payment methods:', paymentMethods.length);
        paymentMethods.forEach(pm => {
          if (pm.card) {
            console.log(`   - ${pm.card.brand} ending in ${pm.card.last4} (expires ${pm.card.expMonth}/${pm.card.expYear})`);
          }
        });
      }
    } catch (error) {
      console.log('⚠️  Could not retrieve payment methods:', error.message);
    }

    // Return customer IDs for use in other examples
    return {
      customer1: customer1.customerId,
      customer2: customer2.customerId
    };

  } catch (error) {
    console.error('❌ Customer management failed:', error.message);
    return { customer1: null, customer2: null };
  }
}

async function demonstrateSubscriptionManagement(client, orgId, projectId) {
  console.log('\n📋 Subscription Management\n');
  console.log('==========================================');

  try {
    // First, we need a customer
    const customer = await client.payment.createCustomer(orgId, projectId, {
      email: 'subscription.test@example.com',
      name: 'Subscription Test User',
      metadata: { userId: 'user_sub_test_789' }
    });

    console.log('1. Creating subscription:');

    const subscription = await client.payment.createSubscription(orgId, projectId, {
      customerId: customer.customerId,
      priceId: 'price_pro_monthly', // Use actual Stripe price ID
      trialPeriodDays: 14,
      metadata: {
        userId: 'user_sub_test_789',
        plan: 'pro',
        source: 'sdk_demo'
      }
    });

    console.log('✅ Subscription created:', {
      subscriptionId: subscription.subscriptionId,
      customerId: subscription.customerId,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      trialEnd: subscription.trialEnd
    });

    console.log('\n2. Getting subscription details:');

    const subDetails = await client.payment.getSubscription(
      orgId,
      projectId,
      subscription.subscriptionId
    );

    console.log('✅ Subscription details:', {
      status: subDetails.status,
      priceId: subDetails.priceId,
      cancelAtPeriodEnd: subDetails.cancelAtPeriodEnd
    });

    console.log('\n3. Updating subscription (upgrade to Enterprise):');

    const updatedSub = await client.payment.updateSubscription(
      orgId,
      projectId,
      subscription.subscriptionId,
      {
        priceId: 'price_enterprise_monthly', // Upgrade plan
        prorationBehavior: 'create_prorations', // Prorate the charges
        metadata: {
          upgradedAt: new Date().toISOString(),
          previousPlan: 'pro',
          newPlan: 'enterprise'
        }
      }
    );

    console.log('✅ Subscription upgraded:', {
      newPriceId: updatedSub.priceId,
      status: updatedSub.status
    });

    console.log('\n4. Canceling subscription at period end:');

    const canceledSub = await client.payment.cancelSubscription(
      orgId,
      projectId,
      subscription.subscriptionId,
      true // Cancel at period end
    );

    console.log('✅ Subscription will cancel at period end:', {
      cancelAtPeriodEnd: canceledSub.cancelAtPeriodEnd,
      currentPeriodEnd: canceledSub.currentPeriodEnd
    });

    console.log('\n5. Resuming canceled subscription:');

    const resumedSub = await client.payment.resumeSubscription(
      orgId,
      projectId,
      subscription.subscriptionId
    );

    console.log('✅ Subscription resumed:', {
      status: resumedSub.status,
      cancelAtPeriodEnd: resumedSub.cancelAtPeriodEnd
    });

    console.log('\n6. Listing all subscriptions:');

    const subscriptions = await client.payment.listSubscriptions(orgId, projectId, {
      limit: 10
    });

    console.log('✅ Found subscriptions:', subscriptions.data.length);
    subscriptions.data.forEach((sub, index) => {
      console.log(`   ${index + 1}. Status: ${sub.status}, Customer: ${sub.customerId}`);
    });

  } catch (error) {
    console.error('❌ Subscription management failed:', error.message);
  }
}

async function demonstrateCheckoutSessions(client, orgId, projectId) {
  console.log('\n🛒 Checkout Sessions\n');
  console.log('==========================================');

  try {
    console.log('1. Creating subscription checkout session:');

    const subscriptionSession = await client.payment.createCheckoutSession(orgId, projectId, {
      priceId: 'price_pro_monthly',
      successUrl: 'https://yourapp.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancelUrl: 'https://yourapp.com/pricing',
      mode: 'subscription',
      customerEmail: 'checkout.user@example.com',
      allowPromotionCodes: true,
      trialPeriodDays: 14,
      metadata: {
        userId: 'user_checkout_123',
        source: 'pricing_page',
        plan: 'pro'
      }
    });

    console.log('✅ Subscription checkout session created:', {
      sessionId: subscriptionSession.sessionId,
      url: subscriptionSession.url,
      mode: subscriptionSession.mode,
      status: subscriptionSession.status,
      expiresAt: subscriptionSession.expiresAt
    });

    console.log('\n   🔗 Redirect user to:', subscriptionSession.url);

    console.log('\n2. Creating one-time payment checkout session:');

    const paymentSession = await client.payment.createCheckoutSession(orgId, projectId, {
      priceId: 'price_one_time_product',
      successUrl: 'https://yourapp.com/thank-you',
      cancelUrl: 'https://yourapp.com/shop',
      mode: 'payment',
      customerEmail: 'buyer@example.com',
      quantity: 2, // Purchase 2 items
      metadata: {
        orderId: 'order_abc123',
        productId: 'prod_xyz789'
      }
    });

    console.log('✅ One-time payment session created:', {
      sessionId: paymentSession.sessionId,
      mode: paymentSession.mode,
      url: paymentSession.url
    });

    console.log('\n3. Getting checkout session details:');

    const sessionDetails = await client.payment.getCheckoutSession(
      orgId,
      projectId,
      subscriptionSession.sessionId
    );

    console.log('✅ Session details retrieved:', {
      status: sessionDetails.status,
      paymentStatus: sessionDetails.paymentStatus,
      customerEmail: sessionDetails.customerEmail,
      expiresAt: sessionDetails.expiresAt
    });

    console.log('\n4. Creating checkout with existing customer:');

    const customer = await client.payment.createCustomer(orgId, projectId, {
      email: 'existing.customer@example.com',
      name: 'Existing Customer'
    });

    const existingCustomerSession = await client.payment.createCheckoutSession(orgId, projectId, {
      priceId: 'price_pro_monthly',
      successUrl: 'https://yourapp.com/success',
      cancelUrl: 'https://yourapp.com/pricing',
      mode: 'subscription',
      customerId: customer.customerId, // Use existing customer
      allowPromotionCodes: true
    });

    console.log('✅ Checkout for existing customer created:', {
      sessionId: existingCustomerSession.sessionId,
      customerId: existingCustomerSession.customerId
    });

  } catch (error) {
    console.error('❌ Checkout sessions failed:', error.message);
  }
}

async function demonstratePaymentIntents(client, orgId, projectId) {
  console.log('\n💳 Payment Intents\n');
  console.log('==========================================');

  try {
    console.log('1. Creating payment intent:');

    const customer = await client.payment.createCustomer(orgId, projectId, {
      email: 'payment.intent@example.com',
      name: 'Payment Intent User'
    });

    const paymentIntent = await client.payment.createPaymentIntent(orgId, projectId, {
      amount: 4999, // $49.99
      currency: 'usd',
      customerId: customer.customerId,
      description: 'Premium feature unlock',
      metadata: {
        orderId: 'order_premium_001',
        feature: 'advanced_analytics',
        userId: 'user_pi_456'
      }
    });

    console.log('✅ Payment intent created:', {
      id: paymentIntent.id,
      amount: `$${(paymentIntent.amount / 100).toFixed(2)}`,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      clientSecret: paymentIntent.clientSecret.substring(0, 30) + '...'
    });

    console.log('\n   💡 Use clientSecret on frontend with Stripe.js:');
    console.log(`   stripe.confirmCardPayment('${paymentIntent.clientSecret}')`);

    console.log('\n2. Getting payment intent status:');

    const intentStatus = await client.payment.getPaymentIntent(
      orgId,
      projectId,
      paymentIntent.id
    );

    console.log('✅ Payment intent status:', {
      id: intentStatus.id,
      status: intentStatus.status,
      amount: `$${(intentStatus.amount / 100).toFixed(2)}`
    });

    console.log('\n3. Creating payment intent for subscription setup:');

    const setupIntent = await client.payment.createPaymentIntent(orgId, projectId, {
      amount: 0, // $0 for setup
      currency: 'usd',
      customerId: customer.customerId,
      description: 'Payment method setup',
      metadata: {
        type: 'setup',
        purpose: 'future_subscription'
      }
    });

    console.log('✅ Setup intent created:', {
      id: setupIntent.id,
      status: setupIntent.status,
      customerId: setupIntent.customerId
    });

  } catch (error) {
    console.error('❌ Payment intents failed:', error.message);
  }
}

async function demonstrateInvoiceManagement(client, orgId, projectId) {
  console.log('\n🧾 Invoice Management\n');
  console.log('==========================================');

  try {
    console.log('1. Getting invoices:');

    const invoices = await client.payment.getInvoices(orgId, projectId, {
      limit: 10
    });

    if (invoices.data.length === 0) {
      console.log('⚠️  No invoices found (create a subscription to generate invoices)');
    } else {
      console.log('✅ Found invoices:', invoices.data.length);

      invoices.data.forEach((invoice, index) => {
        console.log(`\n   Invoice ${index + 1}:`);
        console.log(`   - Invoice ID: ${invoice.invoiceId}`);
        console.log(`   - Amount: $${(invoice.amount / 100).toFixed(2)} ${invoice.currency.toUpperCase()}`);
        console.log(`   - Status: ${invoice.status}`);
        console.log(`   - Created: ${invoice.created}`);
        if (invoice.invoicePdf) {
          console.log(`   - PDF: ${invoice.invoicePdf}`);
        }
        if (invoice.hostedInvoiceUrl) {
          console.log(`   - Hosted URL: ${invoice.hostedInvoiceUrl}`);
        }
      });
    }

    console.log('\n2. Getting invoices for specific customer:');

    const customer = await client.payment.createCustomer(orgId, projectId, {
      email: 'invoice.test@example.com',
      name: 'Invoice Test User'
    });

    const customerInvoices = await client.payment.getInvoices(orgId, projectId, {
      customerId: customer.customerId,
      limit: 5
    });

    console.log('✅ Customer invoices:', customerInvoices.data.length);

    if (customerInvoices.data.length > 0) {
      console.log('\n3. Getting specific invoice:');

      const specificInvoice = await client.payment.getInvoice(
        orgId,
        projectId,
        customerInvoices.data[0].invoiceId
      );

      console.log('✅ Invoice details:', {
        invoiceId: specificInvoice.invoiceId,
        amount: `$${(specificInvoice.amount / 100).toFixed(2)}`,
        amountPaid: `$${(specificInvoice.amountPaid / 100).toFixed(2)}`,
        amountDue: `$${(specificInvoice.amountDue / 100).toFixed(2)}`,
        status: specificInvoice.status,
        paidAt: specificInvoice.paidAt || 'Not paid yet'
      });
    }

  } catch (error) {
    console.error('❌ Invoice management failed:', error.message);
  }
}

async function demonstrateWebhookHandling(client, orgId, projectId) {
  console.log('\n🔔 Webhook Handling\n');
  console.log('==========================================');

  try {
    console.log('1. Webhook signature verification (conceptual):');

    // This is a conceptual example - in reality, you'd receive this from Stripe
    const mockWebhookPayload = JSON.stringify({
      id: 'evt_test_webhook',
      type: 'customer.subscription.created',
      data: {
        object: {
          id: 'sub_test123',
          customer: 'cus_test456',
          status: 'active'
        }
      },
      created: Math.floor(Date.now() / 1000)
    });

    const mockSignature = 't=1234567890,v1=mock_signature';

    console.log('   📥 Simulating webhook verification...');
    console.log('   Event type: customer.subscription.created');
    console.log('   Signature header: stripe-signature');

    // In a real Express.js app, you would do:
    /*
    app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
      const sig = req.headers['stripe-signature'];

      try {
        const verification = await client.payment.verifyWebhook(
          orgId,
          projectId,
          req.body,
          sig
        );

        if (verification.verified) {
          await client.payment.handleWebhook(orgId, projectId, verification.event);
          res.json({ received: true });
        } else {
          res.status(400).send(`Webhook Error: ${verification.error}`);
        }
      } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
      }
    });
    */

    console.log('\n   ✅ Webhook endpoint example code:');
    console.log(`
    const express = require('express');
    const app = express();

    app.post('/webhooks/stripe',
      express.raw({ type: 'application/json' }),
      async (req, res) => {
        const sig = req.headers['stripe-signature'];

        const verification = await client.payment.verifyWebhook(
          '${orgId}',
          '${projectId}',
          req.body,
          sig
        );

        if (verification.verified) {
          const event = verification.event;

          // Handle different event types
          switch (event.type) {
            case 'customer.subscription.created':
              await handleSubscriptionCreated(event.data.object);
              break;
            case 'customer.subscription.updated':
              await handleSubscriptionUpdated(event.data.object);
              break;
            case 'invoice.payment_succeeded':
              await handlePaymentSucceeded(event.data.object);
              break;
            case 'invoice.payment_failed':
              await handlePaymentFailed(event.data.object);
              break;
          }

          res.json({ received: true });
        } else {
          res.status(400).send('Webhook verification failed');
        }
      }
    );`);

    console.log('\n2. Common webhook events to handle:');

    const webhookEvents = [
      { type: 'customer.subscription.created', description: 'New subscription created' },
      { type: 'customer.subscription.updated', description: 'Subscription modified (plan change, etc.)' },
      { type: 'customer.subscription.deleted', description: 'Subscription canceled' },
      { type: 'invoice.payment_succeeded', description: 'Payment successful' },
      { type: 'invoice.payment_failed', description: 'Payment failed' },
      { type: 'customer.created', description: 'New customer created' },
      { type: 'customer.updated', description: 'Customer information updated' },
      { type: 'payment_intent.succeeded', description: 'One-time payment succeeded' },
      { type: 'payment_intent.payment_failed', description: 'One-time payment failed' },
      { type: 'checkout.session.completed', description: 'Checkout session completed' }
    ];

    webhookEvents.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.type}`);
      console.log(`      → ${event.description}`);
    });

  } catch (error) {
    console.error('❌ Webhook handling demonstration failed:', error.message);
  }
}

async function demonstrateCompletePaymentFlow(client, orgId, projectId) {
  console.log('\n🎯 Complete Payment Flow Example\n');
  console.log('==========================================');

  try {
    console.log('Simulating complete SaaS subscription flow...\n');

    // Step 1: Configure payment
    console.log('Step 1: Configure payment settings');
    await client.payment.createConfig(orgId, projectId, {
      stripePublishableKey: STRIPE_PUBLISHABLE_KEY,
      stripeSecretKey: STRIPE_SECRET_KEY,
      stripeWebhookSecret: STRIPE_WEBHOOK_SECRET,
      currency: 'usd'
    });
    console.log('✅ Payment configured\n');

    // Step 2: Add pricing plans
    console.log('Step 2: Add subscription plans');
    const starterPlan = await client.payment.addPriceId(orgId, projectId, 'price_starter', {
      name: 'Starter',
      interval: 'month',
      amount: 999
    });
    console.log('✅ Starter plan: $9.99/month');

    const proPlan = await client.payment.addPriceId(orgId, projectId, 'price_pro', {
      name: 'Pro',
      interval: 'month',
      amount: 2999
    });
    console.log('✅ Pro plan: $29.99/month\n');

    // Step 3: User signs up and selects plan
    console.log('Step 3: User signs up and selects Pro plan');
    const newUser = {
      userId: 'user_complete_flow_999',
      email: 'complete.flow@example.com',
      name: 'Complete Flow User',
      selectedPlan: 'pro'
    };
    console.log(`✅ User: ${newUser.name} (${newUser.email})\n`);

    // Step 4: Create Stripe customer
    console.log('Step 4: Create Stripe customer');
    const customer = await client.payment.createCustomer(orgId, projectId, {
      email: newUser.email,
      name: newUser.name,
      metadata: {
        userId: newUser.userId,
        signupDate: new Date().toISOString()
      }
    });
    console.log(`✅ Customer created: ${customer.customerId}\n`);

    // Step 5: Create checkout session
    console.log('Step 5: Create Stripe Checkout session');
    const checkoutSession = await client.payment.createCheckoutSession(orgId, projectId, {
      priceId: proPlan.priceId,
      customerId: customer.customerId,
      successUrl: `https://yourapp.com/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: 'https://yourapp.com/pricing',
      mode: 'subscription',
      allowPromotionCodes: true,
      trialPeriodDays: 14,
      metadata: {
        userId: newUser.userId,
        plan: 'pro'
      }
    });
    console.log(`✅ Checkout session created: ${checkoutSession.sessionId}`);
    console.log(`   Redirect URL: ${checkoutSession.url}\n`);

    // Step 6: Simulate webhook (subscription created)
    console.log('Step 6: Handle webhook events');
    console.log('   Event: customer.subscription.created');
    console.log('   → Update user record in database');
    console.log('   → Grant access to Pro features');
    console.log('   → Send welcome email');
    console.log('   ✅ User activated with Pro access\n');

    // Step 7: User management
    console.log('Step 7: Ongoing subscription management');
    console.log('   ✅ Monitor subscription status');
    console.log('   ✅ Handle failed payments');
    console.log('   ✅ Process upgrades/downgrades');
    console.log('   ✅ Manage cancellations\n');

    console.log('🎉 Complete payment flow demonstration finished!');
    console.log('\nNext steps for production implementation:');
    console.log('1. Set up Stripe webhook endpoint at /webhooks/stripe');
    console.log('2. Configure webhook in Stripe dashboard');
    console.log('3. Implement payment success/cancel pages');
    console.log('4. Add subscription management UI');
    console.log('5. Handle edge cases (failed payments, disputes, refunds)');

  } catch (error) {
    console.error('❌ Complete payment flow failed:', error.message);
  }
}

// Run the examples
if (require.main === module) {
  console.log('🌟 Running Fluxez SDK Payment Examples\n');

  paymentExamplesMain()
    .catch(console.error);
}

// Export for use in other files
module.exports = {
  paymentExamplesMain,
  demonstratePaymentConfiguration,
  demonstratePriceManagement,
  demonstrateCustomerManagement,
  demonstrateSubscriptionManagement,
  demonstrateCheckoutSessions,
  demonstratePaymentIntents,
  demonstrateInvoiceManagement,
  demonstrateWebhookHandling,
  demonstrateCompletePaymentFlow
};
