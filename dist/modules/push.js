"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushClient = void 0;
class PushClient {
    constructor(httpClient, config, logger) {
        this.httpClient = httpClient;
        this.config = config;
        this.logger = logger;
    }
    /**
     * Send push notification to specific targets
     */
    async send(options) {
        try {
            this.logger.debug('Sending push notification', options);
            const response = await this.httpClient.post('/api/v1/push/send', options);
            this.logger.info('Push notification sent successfully', {
                message_id: response.data.message_id,
                sent_count: response.data.sent_count
            });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to send push notification', error);
            throw error;
        }
    }
    /**
     * Send push to specific user
     */
    async sendToUser(userId, notification) {
        return this.send({
            targets: [{ user_id: userId }],
            notification,
        });
    }
    /**
     * Send push to device token
     */
    async sendToDevice(deviceToken, notification) {
        return this.send({
            targets: [{ device_token: deviceToken }],
            notification,
        });
    }
    /**
     * Send push to segment
     */
    async sendToSegment(segments, notification) {
        return this.send({
            targets: [{ segments }],
            notification,
        });
    }
    /**
     * Send push to users with tags
     */
    async sendToTags(tags, notification) {
        return this.send({
            targets: [{ tags }],
            notification,
        });
    }
    /**
     * Schedule a push notification
     */
    async schedule(options) {
        try {
            this.logger.debug('Scheduling push notification', options);
            const response = await this.httpClient.post('/api/v1/push/schedule', options);
            this.logger.info('Push notification scheduled', {
                campaign_id: response.data.campaign_id,
                scheduled_at: response.data.scheduled_at
            });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to schedule push notification', error);
            throw error;
        }
    }
    /**
     * Create a push campaign
     */
    async createCampaign(campaign) {
        try {
            const response = await this.httpClient.post('/api/v1/push/campaigns', campaign);
            this.logger.info('Push campaign created', { id: response.data.id, name: campaign.name });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to create push campaign', error);
            throw error;
        }
    }
    /**
     * Get push campaigns
     */
    async getCampaigns(options) {
        try {
            const response = await this.httpClient.get('/api/v1/push/campaigns', { params: options });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to get push campaigns', error);
            throw error;
        }
    }
    /**
     * Get specific campaign
     */
    async getCampaign(campaignId) {
        try {
            const response = await this.httpClient.get(`/api/v1/push/campaigns/${campaignId}`);
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to get push campaign', error);
            throw error;
        }
    }
    /**
     * Cancel a scheduled campaign
     */
    async cancelCampaign(campaignId) {
        try {
            const response = await this.httpClient.post(`/api/v1/push/campaigns/${campaignId}/cancel`);
            this.logger.info('Push campaign cancelled', { campaignId });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to cancel push campaign', error);
            throw error;
        }
    }
    /**
     * Register a device for push notifications
     */
    async registerDevice(registration) {
        try {
            const response = await this.httpClient.post('/api/v1/push/devices', registration);
            this.logger.info('Device registered for push notifications', {
                device_id: response.data.device_id,
                user_id: registration.user_id
            });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to register device', error);
            throw error;
        }
    }
    /**
     * Unregister a device
     */
    async unregisterDevice(deviceToken) {
        try {
            const response = await this.httpClient.delete(`/api/v1/push/devices/${deviceToken}`);
            this.logger.info('Device unregistered', { deviceToken });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to unregister device', error);
            throw error;
        }
    }
    /**
     * Update device tags
     */
    async updateDeviceTags(deviceToken, tags) {
        try {
            const response = await this.httpClient.put(`/api/v1/push/devices/${deviceToken}/tags`, { tags });
            this.logger.info('Device tags updated', { deviceToken, tags });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to update device tags', error);
            throw error;
        }
    }
    /**
     * Create push template
     */
    async createTemplate(template) {
        try {
            const response = await this.httpClient.post('/api/v1/push/templates', template);
            this.logger.info('Push template created', { id: response.data.id, name: template.name });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to create push template', error);
            throw error;
        }
    }
    /**
     * Get push templates
     */
    async getTemplates() {
        try {
            const response = await this.httpClient.get('/api/v1/push/templates');
            return response.data || [];
        }
        catch (error) {
            this.logger.error('Failed to get push templates', error);
            throw error;
        }
    }
    /**
     * Send push using template
     */
    async sendWithTemplate(templateId, options) {
        try {
            const response = await this.httpClient.post(`/api/v1/push/templates/${templateId}/send`, options);
            this.logger.info('Template push notification sent', {
                template_id: templateId,
                message_id: response.data.message_id
            });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to send template push notification', error);
            throw error;
        }
    }
    /**
     * Get push notification statistics
     */
    async getStats(options) {
        try {
            const response = await this.httpClient.get('/api/v1/push/stats', { params: options });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to get push stats', error);
            throw error;
        }
    }
    /**
     * Test push notification (sends to test devices only)
     */
    async test(notification, testDevices) {
        try {
            const response = await this.httpClient.post('/api/v1/push/test', {
                notification,
                test_devices: testDevices,
            });
            this.logger.info('Test push notification sent', {
                devices: testDevices.length,
                success_count: response.data.results.filter((r) => r.success).length
            });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to send test push notification', error);
            throw error;
        }
    }
}
exports.PushClient = PushClient;
//# sourceMappingURL=push.js.map