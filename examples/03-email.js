/**
 * Fluxez SDK - Email Examples
 * 
 * This example demonstrates comprehensive email functionality using the Fluxez SDK.
 * Perfect for email automation, marketing campaigns, and notification systems.
 * 
 * Features demonstrated:
 * - Simple email sending
 * - HTML and plain text emails
 * - Email templates and variables
 * - Bulk email sending
 * - Email attachments
 * - Queued email processing
 * - Email verification
 * - Email tracking and analytics
 * 
 * Time to complete: ~10 minutes
 */

const { FluxezClient } = require('@fluxez/node-sdk');
const fs = require('fs');
const path = require('path');

// Configuration
const API_KEY = process.env.FLUXEZ_API_KEY || 'cgx_your_api_key_here';
const API_URL = process.env.FLUXEZ_API_URL || 'https://api.fluxez.com/api/v1';

async function emailExamplesMain() {
  console.log('📧 Fluxez SDK Email Examples\n');

  const client = new FluxezClient(API_KEY, {
    apiUrl: API_URL,
    debug: true,
    timeout: 60000, // Longer timeout for email operations
  });

  try {
    // Test connection
    const connectionTest = await client.testConnection();
    if (!connectionTest.connected) {
      throw new Error('Cannot connect to backend. Please ensure the Fluxez backend is running.');
    }
    console.log('✅ Connected to Fluxez backend\n');

    // Set context
    client.setOrganization('org_email_demo');
    client.setProject('proj_email_demo');

    await demonstrateSimpleEmail(client);
    await demonstrateHTMLEmail(client);
    await demonstrateEmailTemplates(client);
    await demonstrateEmailAttachments(client);
    await demonstrateBulkEmail(client);
    await demonstrateQueuedEmail(client);
    await demonstrateEmailVerification(client);
    await demonstrateEmailTracking(client);
    await demonstrateAdvancedEmailFeatures(client);

    console.log('\n🎉 Email Examples Complete!');

  } catch (error) {
    console.error('❌ Email examples failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Ensure your backend has email service configured');
    console.log('- Check that SMTP settings are properly configured');
    console.log('- Verify your API key has email permissions');
  }
}

async function demonstrateSimpleEmail(client) {
  console.log('📬 Simple Email Sending\n');
  console.log('==========================================');

  try {
    console.log('1. Basic text email:');
    const basicEmailResult = await client.email.send({
      to: 'user@example.com',
      subject: 'Hello from Fluxez SDK!',
      text: `Hello there!

This is a simple text email sent using the Fluxez SDK.

Time sent: ${new Date().toISOString()}

Best regards,
The Fluxez Team`,
      tags: ['sdk-example', 'basic'],
      metadata: {
        source: 'email-examples',
        type: 'basic-text'
      }
    });

    console.log('✅ Basic email sent:', {
      messageId: basicEmailResult.messageId,
      status: basicEmailResult.status
    });

    console.log('\n2. Email with CC and BCC:');
    const ccBccEmailResult = await client.email.send({
      to: 'primary@example.com',
      cc: ['manager@example.com', 'team@example.com'],
      bcc: 'audit@example.com',
      subject: 'Team Notification - SDK Demo',
      text: 'This email demonstrates CC and BCC functionality.',
      tags: ['sdk-example', 'cc-bcc'],
      priority: 'normal'
    });

    console.log('✅ CC/BCC email sent:', ccBccEmailResult);

    console.log('\n3. Email with custom headers:');
    const customHeadersResult = await client.email.send({
      to: 'user@example.com',
      subject: 'Custom Headers Demo',
      text: 'This email includes custom headers for tracking.',
      headers: {
        'X-Campaign-ID': 'campaign_123',
        'X-Source': 'fluxez-sdk',
        'X-Priority': 'high'
      },
      replyTo: 'noreply@fluxez.com',
      tags: ['sdk-example', 'custom-headers']
    });

    console.log('✅ Custom headers email sent:', customHeadersResult);

  } catch (error) {
    console.error('❌ Simple email sending failed:', error.message);
  }
}

async function demonstrateHTMLEmail(client) {
  console.log('\n🎨 HTML Email Sending\n');
  console.log('==========================================');

  try {
    console.log('1. Rich HTML email:');
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to Fluxez</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 10px; }
        .header { background: #4A90E2; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: white; padding: 30px; }
        .footer { background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        .button { display: inline-block; background: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .highlight { background: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Welcome to Fluxez!</h1>
        </div>
        <div class="content">
            <h2>Hello there!</h2>
            <p>Welcome to the Fluxez platform! This HTML email was sent using the Fluxez SDK.</p>
            
            <div class="highlight">
                <strong>SDK Demo:</strong> This email demonstrates rich HTML formatting capabilities.
            </div>
            
            <h3>What's Next?</h3>
            <ul>
                <li>✅ Explore the Fluxez dashboard</li>
                <li>✅ Create your first project</li>
                <li>✅ Integrate the SDK into your app</li>
                <li>✅ Build amazing features</li>
            </ul>
            
            <p>Ready to get started?</p>
            <a href="https://dashboard.fluxez.com" class="button">Go to Dashboard</a>
            
            <p><small>Generated at: ${new Date().toLocaleString()}</small></p>
        </div>
        <div class="footer">
            <p>This email was sent by Fluxez SDK • <a href="#">Unsubscribe</a> • <a href="#">Privacy Policy</a></p>
        </div>
    </div>
</body>
</html>`;

    const plainTextContent = `Welcome to Fluxez!

Hello there!

Welcome to the Fluxez platform! This email was sent using the Fluxez SDK.

What's Next?
- Explore the Fluxez dashboard
- Create your first project  
- Integrate the SDK into your app
- Build amazing features

Ready to get started? Visit: https://dashboard.fluxez.com

Generated at: ${new Date().toLocaleString()}

This email was sent by Fluxez SDK`;

    const htmlEmailResult = await client.email.send({
      to: 'user@example.com',
      subject: '🚀 Welcome to Fluxez - Rich HTML Email',
      html: htmlContent,
      text: plainTextContent, // Fallback for clients that don't support HTML
      tags: ['sdk-example', 'html', 'welcome'],
      trackOpens: true,
      trackClicks: true,
      metadata: {
        campaign: 'welcome-series',
        template: 'welcome-html',
        version: '1.0'
      }
    });

    console.log('✅ HTML email sent:', htmlEmailResult);

    console.log('\n2. Email with embedded images (inline):');
    
    // Create a simple SVG image as demonstration
    const svgImage = `<svg width="100" height="50" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="50" fill="#4A90E2"/>
      <text x="50" y="30" font-family="Arial" font-size="12" fill="white" text-anchor="middle">Fluxez</text>
    </svg>`;

    const inlineImageEmail = `
<!DOCTYPE html>
<html>
<body>
    <h2>Email with Inline Image</h2>
    <p>Here's an embedded image:</p>
    <img src="cid:fluxez-logo" alt="Fluxez Logo" width="100" height="50">
    <p>This image is embedded directly in the email.</p>
</body>
</html>`;

    const inlineEmailResult = await client.email.send({
      to: 'user@example.com',
      subject: 'Email with Inline Images',
      html: inlineImageEmail,
      text: 'This email contains an inline image (not visible in text version).',
      attachments: [{
        name: 'fluxez-logo.svg',
        content: Buffer.from(svgImage),
        contentType: 'image/svg+xml',
        inline: true,
        contentId: 'fluxez-logo'
      }],
      tags: ['sdk-example', 'inline-images']
    });

    console.log('✅ Inline image email sent:', inlineEmailResult);

  } catch (error) {
    console.error('❌ HTML email sending failed:', error.message);
  }
}

async function demonstrateEmailTemplates(client) {
  console.log('\n📋 Email Templates\n');
  console.log('==========================================');

  try {
    console.log('1. Creating email template:');
    
    const welcomeTemplate = {
      name: 'Welcome Email Template',
      subject: 'Welcome to {{companyName}}, {{firstName}}!',
      htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
    <style>
        .template-container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: {{brandColor}}; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: white; }
        .personalized { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="template-container">
        <div class="header">
            <h1>Welcome to {{companyName}}!</h1>
        </div>
        <div class="content">
            <h2>Hi {{firstName}} {{lastName}},</h2>
            <p>Welcome to {{companyName}}! We're excited to have you on board.</p>
            
            <div class="personalized">
                <strong>Your Account Details:</strong><br>
                Email: {{email}}<br>
                Account Type: {{accountType}}<br>
                Registration Date: {{registrationDate}}
            </div>
            
            <p>{{customMessage}}</p>
            
            <p>Best regards,<br>The {{companyName}} Team</p>
        </div>
    </div>
</body>
</html>`,
      textTemplate: `Welcome to {{companyName}}, {{firstName}}!

Hi {{firstName}} {{lastName}},

Welcome to {{companyName}}! We're excited to have you on board.

Your Account Details:
- Email: {{email}}
- Account Type: {{accountType}}
- Registration Date: {{registrationDate}}

{{customMessage}}

Best regards,
The {{companyName}} Team`,
      description: 'Welcome email template for new users',
      variables: ['companyName', 'firstName', 'lastName', 'email', 'accountType', 'registrationDate', 'customMessage', 'brandColor'],
      category: 'onboarding'
    };

    const templateResult = await client.email.createTemplate(welcomeTemplate);
    console.log('✅ Email template created:', {
      id: templateResult.id,
      name: templateResult.name
    });

    console.log('\n2. Sending email using template:');
    
    const templateEmailResult = await client.email.sendTemplate({
      templateId: templateResult.id,
      to: 'newuser@example.com',
      templateData: {
        companyName: 'Fluxez Technologies',
        firstName: 'John',
        lastName: 'Doe',
        email: 'newuser@example.com',
        accountType: 'Premium',
        registrationDate: new Date().toLocaleDateString(),
        customMessage: 'As a premium member, you get access to all advanced features including AI-powered app generation!',
        brandColor: '#4A90E2'
      },
      tags: ['welcome', 'template', 'sdk-example'],
      metadata: {
        templateVersion: '1.0',
        userSegment: 'premium'
      }
    });

    console.log('✅ Template email sent:', templateEmailResult);

    console.log('\n3. Listing available templates:');
    const templates = await client.email.listTemplates({
      category: 'onboarding',
      limit: 10
    });
    console.log('✅ Available templates:', templates.map(t => ({
      id: t.id,
      name: t.name,
      category: t.category
    })));

    console.log('\n4. Updating template:');
    const updatedTemplate = await client.email.updateTemplate(templateResult.id, {
      subject: 'Welcome to {{companyName}}, {{firstName}}! 🎉',
      description: 'Updated welcome email template with emoji'
    });
    console.log('✅ Template updated:', updatedTemplate.name);

  } catch (error) {
    console.error('❌ Email templates failed:', error.message);
  }
}

async function demonstrateEmailAttachments(client) {
  console.log('\n📎 Email Attachments\n');
  console.log('==========================================');

  try {
    console.log('1. Email with text file attachment:');
    
    // Create a sample text file
    const textFileContent = `Fluxez SDK Email Attachment Demo
=====================================

This is a sample text file attached to an email sent via the Fluxez SDK.

Features demonstrated:
- File attachments
- Custom content types
- Multiple attachment types

Generated at: ${new Date().toISOString()}

Thank you for using Fluxez!`;

    const textAttachmentResult = await client.email.send({
      to: 'user@example.com',
      subject: 'Email with Text Attachment',
      text: 'Please find the attached text file.',
      html: '<p>Please find the attached text file.</p><p><strong>File:</strong> fluxez-demo.txt</p>',
      attachments: [{
        name: 'fluxez-demo.txt',
        content: Buffer.from(textFileContent),
        contentType: 'text/plain'
      }],
      tags: ['sdk-example', 'attachment', 'text-file']
    });

    console.log('✅ Text attachment email sent:', textAttachmentResult);

    console.log('\n2. Email with CSV data attachment:');
    
    // Create sample CSV data
    const csvData = `Name,Email,Role,Join Date
John Doe,john@example.com,Developer,2024-01-15
Jane Smith,jane@example.com,Designer,2024-02-01
Bob Johnson,bob@example.com,Manager,2024-01-08
Alice Brown,alice@example.com,Analyst,2024-02-10`;

    const csvAttachmentResult = await client.email.send({
      to: 'admin@example.com',
      subject: 'Monthly User Report',
      html: `
<h2>Monthly User Report</h2>
<p>Please find attached the monthly user report in CSV format.</p>
<ul>
  <li>Total Users: 4</li>
  <li>Report Period: ${new Date().toLocaleDateString()}</li>
  <li>Generated by: Fluxez SDK</li>
</ul>
<p>Best regards,<br>Automated Reporting System</p>`,
      attachments: [{
        name: `user-report-${new Date().toISOString().split('T')[0]}.csv`,
        content: Buffer.from(csvData),
        contentType: 'text/csv'
      }],
      tags: ['report', 'csv', 'automated']
    });

    console.log('✅ CSV attachment email sent:', csvAttachmentResult);

    console.log('\n3. Email with multiple attachments:');
    
    // Create JSON config file
    const jsonConfig = {
      appName: 'Fluxez Demo App',
      version: '1.0.0',
      environment: 'production',
      features: ['email', 'storage', 'analytics'],
      settings: {
        emailProvider: 'fluxez',
        maxAttachmentSize: '10MB',
        enableTracking: true
      },
      generatedAt: new Date().toISOString()
    };

    // Create a simple HTML report
    const htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <title>Fluxez Usage Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Fluxez Usage Report</h1>
    <table>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Emails Sent</td><td>150</td></tr>
        <tr><td>Files Uploaded</td><td>25</td></tr>
        <tr><td>API Calls</td><td>1,250</td></tr>
        <tr><td>Users Active</td><td>45</td></tr>
    </table>
    <p>Generated: ${new Date().toLocaleString()}</p>
</body>
</html>`;

    const multipleAttachmentsResult = await client.email.send({
      to: 'stakeholder@example.com',
      subject: 'Weekly Report Package',
      html: `
<h2>Weekly Report Package</h2>
<p>Please find attached this week's reports and configuration files:</p>
<ul>
  <li><strong>config.json</strong> - Current application configuration</li>
  <li><strong>usage-report.html</strong> - Usage statistics report</li>
  <li><strong>summary.txt</strong> - Executive summary</li>
</ul>
<p>Please review and let us know if you have any questions.</p>`,
      attachments: [
        {
          name: 'config.json',
          content: Buffer.from(JSON.stringify(jsonConfig, null, 2)),
          contentType: 'application/json'
        },
        {
          name: 'usage-report.html',
          content: Buffer.from(htmlReport),
          contentType: 'text/html'
        },
        {
          name: 'summary.txt',
          content: Buffer.from('Executive Summary: All systems operational. Email delivery at 99.5% success rate.'),
          contentType: 'text/plain'
        }
      ],
      tags: ['weekly-report', 'multiple-attachments', 'stakeholder']
    });

    console.log('✅ Multiple attachments email sent:', multipleAttachmentsResult);

  } catch (error) {
    console.error('❌ Email attachments failed:', error.message);
  }
}

async function demonstrateBulkEmail(client) {
  console.log('\n📮 Bulk Email Sending\n');
  console.log('==========================================');

  try {
    console.log('1. Bulk email to multiple recipients:');
    
    // Create recipient list with personalization data
    const recipients = [
      {
        email: 'john@example.com',
        name: 'John Doe',
        templateData: {
          firstName: 'John',
          plan: 'Premium',
          expiryDate: '2024-12-31',
          features: ['AI Generation', 'Advanced Analytics', 'Priority Support']
        }
      },
      {
        email: 'jane@example.com',
        name: 'Jane Smith',
        templateData: {
          firstName: 'Jane',
          plan: 'Starter',
          expiryDate: '2024-11-30',
          features: ['Basic Generation', 'Standard Analytics']
        }
      },
      {
        email: 'bob@example.com',
        name: 'Bob Johnson',
        templateData: {
          firstName: 'Bob',
          plan: 'Enterprise',
          expiryDate: '2025-06-30',
          features: ['AI Generation', 'Advanced Analytics', 'White Label', 'Custom Integrations']
        }
      }
    ];

    const bulkEmailResult = await client.email.sendBulk({
      recipients: recipients,
      subject: 'Your {{plan}} Plan Update - Important Information',
      htmlTemplate: `
<h2>Hi {{firstName}},</h2>
<p>We wanted to update you on your <strong>{{plan}}</strong> plan status.</p>
<h3>Your Plan Features:</h3>
<ul>
{{#each features}}
  <li>✅ {{this}}</li>
{{/each}}
</ul>
<p><strong>Plan Expiry:</strong> {{expiryDate}}</p>
<p>Thank you for being a valued Fluxez customer!</p>`,
      textTemplate: `Hi {{firstName}},

We wanted to update you on your {{plan}} plan status.

Your Plan Features:
{{#each features}}
- {{this}}
{{/each}}

Plan Expiry: {{expiryDate}}

Thank you for being a valued Fluxez customer!`,
      tags: ['bulk', 'plan-update', 'automated'],
      batchSize: 10, // Send in batches of 10
      delayBetweenBatches: 1000, // 1 second delay between batches
      metadata: {
        campaign: 'plan-update-2024',
        segment: 'active-users'
      }
    });

    console.log('✅ Bulk email sent:', {
      totalRecipients: bulkEmailResult.totalRecipients,
      successCount: bulkEmailResult.successCount,
      failureCount: bulkEmailResult.failureCount,
      batchId: bulkEmailResult.batchId
    });

    console.log('\n2. Newsletter-style bulk email:');
    
    const newsletterRecipients = [
      { email: 'subscriber1@example.com', name: 'Alice Wilson' },
      { email: 'subscriber2@example.com', name: 'Charlie Brown' },
      { email: 'subscriber3@example.com', name: 'Diana Prince' }
    ];

    const newsletterContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        .newsletter { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .article { padding: 20px; border-bottom: 1px solid #eee; }
        .article h3 { color: #333; margin-top: 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="newsletter">
        <div class="header">
            <h1>📡 Fluxez Weekly</h1>
            <p>Your weekly dose of innovation and updates</p>
        </div>
        
        <div class="article">
            <h3>🚀 New Feature: AI-Powered Workflows</h3>
            <p>We've just released our most requested feature - AI-powered workflow generation! Now you can describe what you want in plain English and watch as Fluxez creates the perfect automation workflow for you.</p>
        </div>
        
        <div class="article">
            <h3>📊 Performance Update</h3>
            <p>This week we've improved our email delivery speed by 40% and reduced API response times across all endpoints. Your apps are now faster than ever!</p>
        </div>
        
        <div class="article">
            <h3>🎓 Tutorial: Building Your First App</h3>
            <p>Check out our new step-by-step tutorial series on building a complete e-commerce app with Fluxez. From database setup to deployment, we cover it all.</p>
        </div>
        
        <div class="footer">
            <p>Thanks for being part of the Fluxez community!</p>
            <p><a href="#">Update Preferences</a> | <a href="#">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>`;

    const newsletterResult = await client.email.sendBulk({
      recipients: newsletterRecipients,
      subject: '📡 Fluxez Weekly - AI Workflows & Performance Updates',
      html: newsletterContent,
      text: `Fluxez Weekly Newsletter

🚀 New Feature: AI-Powered Workflows
We've just released AI-powered workflow generation! Describe what you want in plain English and watch Fluxez create the perfect automation workflow.

📊 Performance Update  
This week we improved email delivery speed by 40% and reduced API response times across all endpoints.

🎓 Tutorial: Building Your First App
Check out our new tutorial series on building a complete e-commerce app with Fluxez.

Thanks for being part of the Fluxez community!`,
      tags: ['newsletter', 'weekly', 'announcement'],
      trackOpens: true,
      trackClicks: true
    });

    console.log('✅ Newsletter sent:', newsletterResult);

  } catch (error) {
    console.error('❌ Bulk email sending failed:', error.message);
  }
}

async function demonstrateQueuedEmail(client) {
  console.log('\n⏰ Queued Email Processing\n');
  console.log('==========================================');

  try {
    console.log('1. Scheduling email for later delivery:');
    
    const futureDate = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now
    
    const queuedEmailResult = await client.email.queue({
      to: 'user@example.com',
      subject: 'Scheduled Email - Future Delivery',
      html: `
<h2>This email was scheduled!</h2>
<p>This email was queued at <strong>${new Date().toLocaleString()}</strong> and delivered at <strong>${futureDate.toLocaleString()}</strong>.</p>
<p>The Fluxez email queue system allows you to:</p>
<ul>
  <li>Schedule emails for future delivery</li>
  <li>Process emails in the background</li>
  <li>Handle high-volume email sending</li>
  <li>Retry failed deliveries automatically</li>
</ul>`,
      scheduledFor: futureDate,
      priority: 'normal',
      maxRetries: 3,
      tags: ['scheduled', 'queued', 'demo']
    });

    console.log('✅ Email queued for delivery:', {
      queueId: queuedEmailResult.queueId,
      scheduledFor: queuedEmailResult.scheduledFor,
      status: queuedEmailResult.status
    });

    console.log('\n2. High-priority immediate queue:');
    
    const priorityEmailResult = await client.email.queue({
      to: 'urgent@example.com',
      subject: '🚨 High Priority Alert',
      text: 'This is a high-priority email that should be processed immediately.',
      priority: 'high',
      maxRetries: 5,
      retryDelay: 30000, // 30 seconds between retries
      tags: ['priority', 'alert', 'immediate']
    });

    console.log('✅ Priority email queued:', priorityEmailResult);

    console.log('\n3. Batch processing queue:');
    
    // Queue multiple emails for batch processing
    const batchEmails = [
      {
        to: 'batch1@example.com',
        subject: 'Batch Email 1',
        text: 'This is batch email #1'
      },
      {
        to: 'batch2@example.com', 
        subject: 'Batch Email 2',
        text: 'This is batch email #2'
      },
      {
        to: 'batch3@example.com',
        subject: 'Batch Email 3', 
        text: 'This is batch email #3'
      }
    ];

    const batchQueueResult = await client.email.queueBatch({
      emails: batchEmails,
      batchSize: 2, // Process 2 at a time
      delayBetweenBatches: 5000, // 5 seconds between batches
      priority: 'normal',
      tags: ['batch-processing', 'demo']
    });

    console.log('✅ Batch emails queued:', batchQueueResult);

    console.log('\n4. Queue status monitoring:');
    
    // Check queue status
    const queueStatus = await client.email.getQueueStatus();
    console.log('✅ Queue status:', queueStatus);

    // Get specific queued email status
    if (queuedEmailResult.queueId) {
      const emailStatus = await client.email.getQueuedEmailStatus(queuedEmailResult.queueId);
      console.log('✅ Scheduled email status:', emailStatus);
    }

  } catch (error) {
    console.error('❌ Queued email processing failed:', error.message);
  }
}

async function demonstrateEmailVerification(client) {
  console.log('\n✅ Email Verification\n');
  console.log('==========================================');

  try {
    console.log('1. Single email verification:');
    
    const verifyResult = await client.email.verify('user@example.com');
    console.log('✅ Email verification result:', verifyResult);

    console.log('\n2. Bulk email verification:');
    
    const emailsToVerify = [
      'valid@gmail.com',
      'invalid@invaliddomain.xyz',
      'test@example.com',
      'disposable@10minutemail.com'
    ];

    const bulkVerifyResult = await client.email.verifyBulk(emailsToVerify);
    console.log('✅ Bulk verification results:', bulkVerifyResult);

    console.log('\n3. Domain verification:');
    
    const domainVerifyResult = await client.email.verifyDomain('example.com');
    console.log('✅ Domain verification result:', domainVerifyResult);

    console.log('\n4. Email list cleaning:');
    
    // This would typically be used before sending bulk emails
    const emailList = [
      'john@gmail.com',
      'invalid@fakeddomain.test',
      'jane@outlook.com',
      'throwaway@tempmail.com'
    ];

    const cleanedList = await client.email.cleanEmailList(emailList, {
      removeInvalid: true,
      removeDisposable: true,
      removeRisky: true
    });

    console.log('✅ Cleaned email list:', {
      original: emailList.length,
      cleaned: cleanedList.validEmails.length,
      removed: cleanedList.removedEmails.length,
      validEmails: cleanedList.validEmails
    });

  } catch (error) {
    console.error('❌ Email verification failed:', error.message);
  }
}

async function demonstrateEmailTracking(client) {
  console.log('\n📈 Email Tracking & Analytics\n');
  console.log('==========================================');

  try {
    console.log('1. Sending trackable email:');
    
    const trackableEmailResult = await client.email.send({
      to: 'tracking@example.com',
      subject: 'Trackable Email Demo',
      html: `
<h2>Email Tracking Demo</h2>
<p>This email demonstrates tracking capabilities:</p>
<ul>
  <li><strong>Open Tracking:</strong> We'll know when you open this email</li>
  <li><strong>Click Tracking:</strong> We'll track clicks on links</li>
  <li><strong>Bounce Tracking:</strong> We'll detect if the email bounces</li>
</ul>
<p><a href="https://fluxez.com/docs">Click here to visit our docs</a></p>
<p><a href="https://fluxez.com/pricing">Check out our pricing</a></p>
<p>Sent at: ${new Date().toLocaleString()}</p>`,
      trackOpens: true,
      trackClicks: true,
      trackBounces: true,
      tags: ['tracking-demo', 'analytics'],
      metadata: {
        campaign: 'tracking-test',
        userSegment: 'demo-users'
      }
    });

    console.log('✅ Trackable email sent:', {
      messageId: trackableEmailResult.messageId,
      trackingEnabled: {
        opens: true,
        clicks: true,
        bounces: true
      }
    });

    console.log('\n2. Email analytics:');
    
    // Get email statistics
    const emailStats = await client.email.getStats({
      period: 'last_7_days',
      groupBy: 'day'
    });
    console.log('✅ Email statistics:', emailStats);

    console.log('\n3. Campaign analytics:');
    
    const campaignStats = await client.email.getCampaignStats('tracking-test', {
      includeClicks: true,
      includeOpens: true,
      includeBounces: true
    });
    console.log('✅ Campaign statistics:', campaignStats);

    console.log('\n4. Tag-based analytics:');
    
    const tagStats = await client.email.getTagStats(['sdk-example', 'demo'], {
      period: 'last_30_days'
    });
    console.log('✅ Tag-based statistics:', tagStats);

    console.log('\n5. Real-time tracking events:');
    
    // Set up webhook listener (conceptual - in real app you'd have a webhook endpoint)
    console.log('📡 Webhook events that would be received:');
    console.log('- email.sent: When email is successfully sent');
    console.log('- email.delivered: When email is delivered to recipient');
    console.log('- email.opened: When recipient opens the email');
    console.log('- email.clicked: When recipient clicks a tracked link');
    console.log('- email.bounced: When email bounces');
    console.log('- email.unsubscribed: When recipient unsubscribes');

  } catch (error) {
    console.error('❌ Email tracking failed:', error.message);
  }
}

async function demonstrateAdvancedEmailFeatures(client) {
  console.log('\n🔬 Advanced Email Features\n');
  console.log('==========================================');

  try {
    console.log('1. A/B testing emails:');
    
    const abTestResult = await client.email.sendABTest({
      recipients: [
        'test1@example.com',
        'test2@example.com',
        'test3@example.com',
        'test4@example.com'
      ],
      variants: [
        {
          name: 'Version A - Friendly',
          subject: 'Hey there! Check out our new features 😊',
          html: '<h2>Hey!</h2><p>We have some exciting new features to show you!</p>',
          weight: 50 // 50% of recipients get this version
        },
        {
          name: 'Version B - Professional',
          subject: 'New Feature Announcement - Fluxez Platform',
          html: '<h2>Feature Announcement</h2><p>We are pleased to announce new platform capabilities.</p>',
          weight: 50 // 50% of recipients get this version
        }
      ],
      tags: ['ab-test', 'feature-announcement'],
      testDuration: 3600, // 1 hour test duration
      winnerCriteria: 'open_rate' // or 'click_rate'
    });

    console.log('✅ A/B test started:', abTestResult);

    console.log('\n2. Drip campaign setup:');
    
    const dripCampaignResult = await client.email.createDripCampaign({
      name: 'New User Onboarding',
      triggerEvent: 'user.registered',
      emails: [
        {
          delay: 0, // Immediate
          subject: 'Welcome to Fluxez!',
          template: 'welcome-email',
          tags: ['drip', 'welcome']
        },
        {
          delay: 24 * 60 * 60 * 1000, // 24 hours later
          subject: 'Getting Started Guide',
          template: 'getting-started',
          tags: ['drip', 'guide']
        },
        {
          delay: 72 * 60 * 60 * 1000, // 72 hours later
          subject: 'Pro Tips for Success',
          template: 'pro-tips',
          tags: ['drip', 'tips']
        }
      ],
      conditions: {
        stopIfUnsubscribed: true,
        stopIfGoalAchieved: true,
        maxEmails: 3
      }
    });

    console.log('✅ Drip campaign created:', dripCampaignResult);

    console.log('\n3. Email personalization with AI:');
    
    const aiPersonalizedResult = await client.email.sendAIPersonalized({
      recipients: [
        {
          email: 'user1@example.com',
          userData: {
            name: 'John',
            industry: 'E-commerce',
            interests: ['automation', 'analytics'],
            behaviorData: { lastLogin: '2024-01-15', featureUsage: ['email', 'storage'] }
          }
        }
      ],
      baseTemplate: {
        subject: 'Personalized recommendations for {{name}}',
        prompt: 'Create a personalized email for {{name}} in the {{industry}} industry who is interested in {{interests}} and has been using {{featureUsage}} features.'
      },
      aiModel: 'gpt-4',
      tags: ['ai-personalized', 'recommendations']
    });

    console.log('✅ AI personalized email sent:', aiPersonalizedResult);

    console.log('\n4. Email automation rules:');
    
    const automationResult = await client.email.createAutomation({
      name: 'Welcome Series Automation',
      triggers: [
        { event: 'user.registered', conditions: { plan: 'premium' } }
      ],
      actions: [
        {
          type: 'send_email',
          template: 'premium-welcome',
          delay: 0
        },
        {
          type: 'add_to_segment',
          segment: 'premium-users',
          delay: 1000
        },
        {
          type: 'send_email',
          template: 'premium-features-guide',
          delay: 24 * 60 * 60 * 1000 // 24 hours
        }
      ],
      isActive: true
    });

    console.log('✅ Email automation created:', automationResult);

  } catch (error) {
    console.error('❌ Advanced email features failed:', error.message);
  }
}

// Promise-based email example
function promiseBasedEmailExample() {
  console.log('\n🔄 Promise-based Email Operations\n');

  const client = new FluxezClient(API_KEY, {
    apiUrl: API_URL,
    debug: false
  });

  return client.email.send({
    to: 'promise@example.com',
    subject: 'Promise-based Email',
    text: 'This email was sent using promises instead of async/await.'
  })
  .then(result => {
    console.log('✅ Promise email sent:', result);
    return client.email.getStats({ period: 'today' });
  })
  .then(stats => {
    console.log('✅ Email stats retrieved:', stats);
  })
  .catch(error => {
    console.error('❌ Promise chain failed:', error.message);
  });
}

// Run the examples
if (require.main === module) {
  console.log('🌟 Running Fluxez SDK Email Examples\n');
  
  emailExamplesMain()
    .then(() => {
      setTimeout(() => {
        console.log('\n' + '='.repeat(50));
        promiseBasedEmailExample();
      }, 2000);
    })
    .catch(console.error);
}

// Export for use in other files
module.exports = {
  emailExamplesMain,
  demonstrateSimpleEmail,
  demonstrateHTMLEmail,
  demonstrateEmailTemplates,
  demonstrateEmailAttachments,
  demonstrateBulkEmail,
  demonstrateQueuedEmail,
  demonstrateEmailVerification,
  demonstrateEmailTracking,
  demonstrateAdvancedEmailFeatures,
  promiseBasedEmailExample
};