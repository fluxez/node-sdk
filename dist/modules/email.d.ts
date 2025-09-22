import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
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
export declare class EmailClient {
    private httpClient;
    private config;
    private logger;
    constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger);
    /**
     * Send a single email
     */
    send(to: string | string[], subject: string, html: string, options?: Partial<EmailOptions>): Promise<{
        messageId: string;
        status: string;
    }>;
    /**
     * Send templated email
     */
    sendTemplated(templateName: string, to: string | string[], templateData?: Record<string, any>, options?: Partial<EmailOptions>): Promise<{
        messageId: string;
        status: string;
    }>;
    /**
     * Send bulk emails
     */
    sendBulk(recipients: BulkEmailRecipient[], templateName: string, commonData?: Record<string, any>, options?: Partial<EmailOptions>): Promise<{
        jobId: string;
        totalRecipients: number;
        status: string;
    }>;
    /**
     * Queue email for later delivery
     */
    queueEmail(emailOptions: {
        to: string | string[];
        subject?: string;
        html?: string;
        templateName?: string;
        templateData?: Record<string, any>;
    }, delay?: number): Promise<QueuedEmail>;
    /**
     * Verify email address
     */
    verifyEmail(email: string): Promise<EmailVerificationResult>;
    /**
     * Create email template
     */
    createTemplate(name: string, subject: string, htmlTemplate: string, textTemplate?: string, options?: {
        description?: string;
        category?: string;
        variables?: string[];
    }): Promise<EmailTemplate>;
    /**
     * Update email template
     */
    updateTemplate(templateId: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate>;
    /**
     * Get email template
     */
    getTemplate(templateId: string): Promise<EmailTemplate>;
    /**
     * List email templates
     */
    listTemplates(options?: {
        category?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        templates: EmailTemplate[];
        total: number;
    }>;
    /**
     * Delete email template
     */
    deleteTemplate(templateId: string): Promise<void>;
    /**
     * Get email delivery status
     */
    getDeliveryStatus(messageId: string): Promise<{
        messageId: string;
        status: 'sent' | 'delivered' | 'bounced' | 'complained' | 'opened' | 'clicked';
        timestamp: string;
        details?: any;
    }>;
    /**
     * Get email statistics
     */
    getStats(options?: {
        startDate?: string;
        endDate?: string;
        templateName?: string;
    }): Promise<EmailStats>;
    /**
     * Get queued email status
     */
    getQueuedEmailStatus(emailId: string): Promise<QueuedEmail>;
    /**
     * Cancel queued email
     */
    cancelQueuedEmail(emailId: string): Promise<void>;
    /**
     * Send test email
     */
    sendTest(templateName: string, testEmail: string, templateData?: Record<string, any>): Promise<{
        messageId: string;
        status: string;
    }>;
    private extractTextFromHtml;
}
//# sourceMappingURL=email.d.ts.map