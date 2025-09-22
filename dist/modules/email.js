"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailClient = void 0;
class EmailClient {
    constructor(httpClient, config, logger) {
        this.httpClient = httpClient;
        this.config = config;
        this.logger = logger;
    }
    /**
     * Send a single email
     */
    async send(to, subject, html, options = {}) {
        try {
            this.logger.debug('Sending email', { to, subject });
            const emailData = {
                to: Array.isArray(to) ? to : [to],
                subject,
                html,
                text: this.extractTextFromHtml(html),
                ...options,
            };
            const response = await this.httpClient.post('/email/send', emailData);
            this.logger.debug('Email sent successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to send email', error);
            throw error;
        }
    }
    /**
     * Send templated email
     */
    async sendTemplated(templateName, to, templateData = {}, options = {}) {
        try {
            this.logger.debug('Sending templated email', { templateName, to });
            const emailData = {
                templateName,
                to: Array.isArray(to) ? to : [to],
                templateData,
                ...options,
            };
            const response = await this.httpClient.post('/email/send-templated', emailData);
            this.logger.debug('Templated email sent successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to send templated email', error);
            throw error;
        }
    }
    /**
     * Send bulk emails
     */
    async sendBulk(recipients, templateName, commonData = {}, options = {}) {
        try {
            this.logger.debug('Sending bulk emails', { templateName, recipientCount: recipients.length });
            const bulkData = {
                templateName,
                recipients,
                commonData,
                ...options,
            };
            const response = await this.httpClient.post('/email/send-bulk', bulkData);
            this.logger.debug('Bulk email job created successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to send bulk emails', error);
            throw error;
        }
    }
    /**
     * Queue email for later delivery
     */
    async queueEmail(emailOptions, delay) {
        try {
            this.logger.debug('Queuing email', { emailOptions, delay });
            const queueData = {
                ...emailOptions,
                delay,
            };
            const response = await this.httpClient.post('/email/queue', queueData);
            this.logger.debug('Email queued successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to queue email', error);
            throw error;
        }
    }
    /**
     * Verify email address
     */
    async verifyEmail(email) {
        try {
            this.logger.debug('Verifying email', { email });
            const response = await this.httpClient.post('/email/verify', { email });
            this.logger.debug('Email verification completed', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to verify email', error);
            throw error;
        }
    }
    /**
     * Create email template
     */
    async createTemplate(name, subject, htmlTemplate, textTemplate, options = {}) {
        try {
            this.logger.debug('Creating email template', { name, subject });
            const templateData = {
                name,
                subject,
                htmlTemplate,
                textTemplate: textTemplate || this.extractTextFromHtml(htmlTemplate),
                ...options,
            };
            const response = await this.httpClient.post('/email/templates', templateData);
            this.logger.debug('Email template created successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to create email template', error);
            throw error;
        }
    }
    /**
     * Update email template
     */
    async updateTemplate(templateId, updates) {
        try {
            this.logger.debug('Updating email template', { templateId, updates });
            const response = await this.httpClient.put(`/email/templates/${templateId}`, updates);
            this.logger.debug('Email template updated successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to update email template', error);
            throw error;
        }
    }
    /**
     * Get email template
     */
    async getTemplate(templateId) {
        try {
            const response = await this.httpClient.get(`/email/templates/${templateId}`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get email template', error);
            throw error;
        }
    }
    /**
     * List email templates
     */
    async listTemplates(options = {}) {
        try {
            const response = await this.httpClient.get('/email/templates', { params: options });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to list email templates', error);
            throw error;
        }
    }
    /**
     * Delete email template
     */
    async deleteTemplate(templateId) {
        try {
            await this.httpClient.delete(`/email/templates/${templateId}`);
            this.logger.debug('Email template deleted successfully', { templateId });
        }
        catch (error) {
            this.logger.error('Failed to delete email template', error);
            throw error;
        }
    }
    /**
     * Get email delivery status
     */
    async getDeliveryStatus(messageId) {
        try {
            const response = await this.httpClient.get(`/email/status/${messageId}`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get delivery status', error);
            throw error;
        }
    }
    /**
     * Get email statistics
     */
    async getStats(options = {}) {
        try {
            const response = await this.httpClient.get('/email/stats', { params: options });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get email stats', error);
            throw error;
        }
    }
    /**
     * Get queued email status
     */
    async getQueuedEmailStatus(emailId) {
        try {
            const response = await this.httpClient.get(`/email/queue/${emailId}`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get queued email status', error);
            throw error;
        }
    }
    /**
     * Cancel queued email
     */
    async cancelQueuedEmail(emailId) {
        try {
            await this.httpClient.delete(`/email/queue/${emailId}`);
            this.logger.debug('Queued email cancelled successfully', { emailId });
        }
        catch (error) {
            this.logger.error('Failed to cancel queued email', error);
            throw error;
        }
    }
    /**
     * Send test email
     */
    async sendTest(templateName, testEmail, templateData = {}) {
        try {
            this.logger.debug('Sending test email', { templateName, testEmail });
            const testData = {
                templateName,
                testEmail,
                templateData,
            };
            const response = await this.httpClient.post('/email/test', testData);
            this.logger.debug('Test email sent successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to send test email', error);
            throw error;
        }
    }
    // Helper methods
    extractTextFromHtml(html) {
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
exports.EmailClient = EmailClient;
//# sourceMappingURL=email.js.map