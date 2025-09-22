import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import { ApiResponse } from '../types';

export interface EmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
  tags?: string[];
  metadata?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
  trackOpens?: boolean;
  trackClicks?: boolean;
}

export interface EmailAttachment {
  name: string;
  content: Buffer | string;
  contentType?: string;
  inline?: boolean;
  contentId?: string;
}

export interface BulkEmailRecipient {
  email: string;
  name?: string;
  templateData?: Record<string, any>;
}

export interface EmailTemplate {
  id?: string;
  name: string;
  subject: string;
  htmlTemplate: string;
  textTemplate?: string;
  description?: string;
  variables?: string[];
  category?: string;
}

export interface EmailVerificationResult {
  email: string;
  valid: boolean;
  deliverable: boolean;
  reason?: string;
  suggestions?: string[];
}

export interface QueuedEmail {
  id: string;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  scheduledAt: string;
  sentAt?: string;
  error?: string;
}

export interface EmailStats {
  sent: number;
  delivered: number;
  opens: number;
  clicks: number;
  bounces: number;
  complaints: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

export class EmailClient {
  private httpClient: AxiosInstance;
  private config: FluxezConfig;
  private logger: Logger;

  constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger) {
    this.httpClient = httpClient;
    this.config = config;
    this.logger = logger;
  }

  /**
   * Send a single email
   */
  async send(
    to: string | string[],
    subject: string,
    html: string,
    options: Partial<EmailOptions> = {}
  ): Promise<{ messageId: string; status: string }> {
    try {
      this.logger.debug('Sending email', { to, subject });

      const emailData = {
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text: this.extractTextFromHtml(html),
        ...options,
      };

      const response = await this.httpClient.post<ApiResponse<{ messageId: string; status: string }>>(
        '/email/send',
        emailData
      );

      this.logger.debug('Email sent successfully', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to send email', error);
      throw error;
    }
  }

  /**
   * Send templated email
   */
  async sendTemplated(
    templateName: string,
    to: string | string[],
    templateData: Record<string, any> = {},
    options: Partial<EmailOptions> = {}
  ): Promise<{ messageId: string; status: string }> {
    try {
      this.logger.debug('Sending templated email', { templateName, to });

      const emailData = {
        templateName,
        to: Array.isArray(to) ? to : [to],
        templateData,
        ...options,
      };

      const response = await this.httpClient.post<ApiResponse<{ messageId: string; status: string }>>(
        '/email/send-templated',
        emailData
      );

      this.logger.debug('Templated email sent successfully', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to send templated email', error);
      throw error;
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulk(
    recipients: BulkEmailRecipient[],
    templateName: string,
    commonData: Record<string, any> = {},
    options: Partial<EmailOptions> = {}
  ): Promise<{ jobId: string; totalRecipients: number; status: string }> {
    try {
      this.logger.debug('Sending bulk emails', { templateName, recipientCount: recipients.length });

      const bulkData = {
        templateName,
        recipients,
        commonData,
        ...options,
      };

      const response = await this.httpClient.post<ApiResponse<{ jobId: string; totalRecipients: number; status: string }>>(
        '/email/send-bulk',
        bulkData
      );

      this.logger.debug('Bulk email job created successfully', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to send bulk emails', error);
      throw error;
    }
  }

  /**
   * Queue email for later delivery
   */
  async queueEmail(
    emailOptions: {
      to: string | string[];
      subject?: string;
      html?: string;
      templateName?: string;
      templateData?: Record<string, any>;
    },
    delay?: number
  ): Promise<QueuedEmail> {
    try {
      this.logger.debug('Queuing email', { emailOptions, delay });

      const queueData = {
        ...emailOptions,
        delay,
      };

      const response = await this.httpClient.post<ApiResponse<QueuedEmail>>(
        '/email/queue',
        queueData
      );

      this.logger.debug('Email queued successfully', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to queue email', error);
      throw error;
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(email: string): Promise<EmailVerificationResult> {
    try {
      this.logger.debug('Verifying email', { email });

      const response = await this.httpClient.post<ApiResponse<EmailVerificationResult>>(
        '/email/verify',
        { email }
      );

      this.logger.debug('Email verification completed', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to verify email', error);
      throw error;
    }
  }

  /**
   * Create email template
   */
  async createTemplate(
    name: string,
    subject: string,
    htmlTemplate: string,
    textTemplate?: string,
    options: {
      description?: string;
      category?: string;
      variables?: string[];
    } = {}
  ): Promise<EmailTemplate> {
    try {
      this.logger.debug('Creating email template', { name, subject });

      const templateData = {
        name,
        subject,
        htmlTemplate,
        textTemplate: textTemplate || this.extractTextFromHtml(htmlTemplate),
        ...options,
      };

      const response = await this.httpClient.post<ApiResponse<EmailTemplate>>(
        '/email/templates',
        templateData
      );

      this.logger.debug('Email template created successfully', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to create email template', error);
      throw error;
    }
  }

  /**
   * Update email template
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<EmailTemplate>
  ): Promise<EmailTemplate> {
    try {
      this.logger.debug('Updating email template', { templateId, updates });

      const response = await this.httpClient.put<ApiResponse<EmailTemplate>>(
        `/email/templates/${templateId}`,
        updates
      );

      this.logger.debug('Email template updated successfully', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to update email template', error);
      throw error;
    }
  }

  /**
   * Get email template
   */
  async getTemplate(templateId: string): Promise<EmailTemplate> {
    try {
      const response = await this.httpClient.get<ApiResponse<EmailTemplate>>(
        `/email/templates/${templateId}`
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get email template', error);
      throw error;
    }
  }

  /**
   * List email templates
   */
  async listTemplates(options: {
    category?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ templates: EmailTemplate[]; total: number }> {
    try {
      const response = await this.httpClient.get<ApiResponse<{ templates: EmailTemplate[]; total: number }>>(
        '/email/templates',
        { params: options }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to list email templates', error);
      throw error;
    }
  }

  /**
   * Delete email template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    try {
      await this.httpClient.delete(`/email/templates/${templateId}`);
      this.logger.debug('Email template deleted successfully', { templateId });
    } catch (error) {
      this.logger.error('Failed to delete email template', error);
      throw error;
    }
  }

  /**
   * Get email delivery status
   */
  async getDeliveryStatus(messageId: string): Promise<{
    messageId: string;
    status: 'sent' | 'delivered' | 'bounced' | 'complained' | 'opened' | 'clicked';
    timestamp: string;
    details?: any;
  }> {
    try {
      const response = await this.httpClient.get<ApiResponse<any>>(
        `/email/status/${messageId}`
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get delivery status', error);
      throw error;
    }
  }

  /**
   * Get email statistics
   */
  async getStats(options: {
    startDate?: string;
    endDate?: string;
    templateName?: string;
  } = {}): Promise<EmailStats> {
    try {
      const response = await this.httpClient.get<ApiResponse<EmailStats>>(
        '/email/stats',
        { params: options }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get email stats', error);
      throw error;
    }
  }

  /**
   * Get queued email status
   */
  async getQueuedEmailStatus(emailId: string): Promise<QueuedEmail> {
    try {
      const response = await this.httpClient.get<ApiResponse<QueuedEmail>>(
        `/email/queue/${emailId}`
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get queued email status', error);
      throw error;
    }
  }

  /**
   * Cancel queued email
   */
  async cancelQueuedEmail(emailId: string): Promise<void> {
    try {
      await this.httpClient.delete(`/email/queue/${emailId}`);
      this.logger.debug('Queued email cancelled successfully', { emailId });
    } catch (error) {
      this.logger.error('Failed to cancel queued email', error);
      throw error;
    }
  }

  /**
   * Send test email
   */
  async sendTest(
    templateName: string,
    testEmail: string,
    templateData: Record<string, any> = {}
  ): Promise<{ messageId: string; status: string }> {
    try {
      this.logger.debug('Sending test email', { templateName, testEmail });

      const testData = {
        templateName,
        testEmail,
        templateData,
      };

      const response = await this.httpClient.post<ApiResponse<{ messageId: string; status: string }>>(
        '/email/test',
        testData
      );

      this.logger.debug('Test email sent successfully', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to send test email', error);
      throw error;
    }
  }

  // Helper methods

  private extractTextFromHtml(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
      .replace(/&amp;/g, '&') // Replace HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
}