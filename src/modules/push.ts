import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';

export interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface PushTarget {
  user_id?: string;
  device_token?: string;
  endpoint?: string;
  subscription?: PushSubscription;
  segments?: string[];
  tags?: string[];
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface SendPushOptions {
  targets: PushTarget[];
  notification: PushNotification;
  schedule?: Date | string;
  ttl?: number;
  priority?: 'normal' | 'high';
  collapse_key?: string;
}

export interface PushCampaign {
  id: string;
  name: string;
  notification: PushNotification;
  targets: PushTarget[];
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'cancelled';
  scheduled_at?: string;
  sent_at?: string;
  stats: {
    sent: number;
    delivered: number;
    clicked: number;
    failed: number;
  };
  created_at: string;
  updated_at: string;
}

export interface PushTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  icon?: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export interface DeviceRegistration {
  user_id: string;
  device_token: string;
  platform: 'web' | 'ios' | 'android';
  endpoint?: string;
  subscription?: PushSubscription;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface PushStats {
  total_sent: number;
  total_delivered: number;
  total_clicked: number;
  total_failed: number;
  campaigns: number;
  active_devices: number;
  delivery_rate: number;
  click_rate: number;
}

export class PushClient {
  private httpClient: AxiosInstance;
  private config: FluxezConfig;
  private logger: Logger;

  constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger) {
    this.httpClient = httpClient;
    this.config = config;
    this.logger = logger;
  }

  /**
   * Send push notification to specific targets
   */
  async send(options: SendPushOptions): Promise<{
    success: boolean;
    message_id: string;
    sent_count: number;
    failed_count: number;
    errors?: string[];
  }> {
    try {
      this.logger.debug('Sending push notification', options);
      
      const response = await this.httpClient.post('/push/send', options);
      
      this.logger.info('Push notification sent successfully', {
        message_id: response.data.message_id,
        sent_count: response.data.sent_count
      });
      
      return response.data;
    } catch (error) {
      this.logger.error('Failed to send push notification', error);
      throw error;
    }
  }

  /**
   * Send push to specific user
   */
  async sendToUser(userId: string, notification: PushNotification): Promise<{
    success: boolean;
    message_id: string;
  }> {
    return this.send({
      targets: [{ user_id: userId }],
      notification,
    });
  }

  /**
   * Send push to device token
   */
  async sendToDevice(deviceToken: string, notification: PushNotification): Promise<{
    success: boolean;
    message_id: string;
  }> {
    return this.send({
      targets: [{ device_token: deviceToken }],
      notification,
    });
  }

  /**
   * Send push to segment
   */
  async sendToSegment(segments: string[], notification: PushNotification): Promise<{
    success: boolean;
    message_id: string;
    sent_count: number;
  }> {
    return this.send({
      targets: [{ segments }],
      notification,
    });
  }

  /**
   * Send push to users with tags
   */
  async sendToTags(tags: string[], notification: PushNotification): Promise<{
    success: boolean;
    message_id: string;
    sent_count: number;
  }> {
    return this.send({
      targets: [{ tags }],
      notification,
    });
  }

  /**
   * Schedule a push notification
   */
  async schedule(options: SendPushOptions & { schedule: Date | string }): Promise<{
    success: boolean;
    campaign_id: string;
    scheduled_at: string;
  }> {
    try {
      this.logger.debug('Scheduling push notification', options);
      
      const response = await this.httpClient.post('/push/schedule', options);
      
      this.logger.info('Push notification scheduled', {
        campaign_id: response.data.campaign_id,
        scheduled_at: response.data.scheduled_at
      });
      
      return response.data;
    } catch (error) {
      this.logger.error('Failed to schedule push notification', error);
      throw error;
    }
  }

  /**
   * Create a push campaign
   */
  async createCampaign(campaign: {
    name: string;
    notification: PushNotification;
    targets: PushTarget[];
    scheduled_at?: Date | string;
  }): Promise<PushCampaign> {
    try {
      const response = await this.httpClient.post('/push/campaigns', campaign);
      
      this.logger.info('Push campaign created', { id: response.data.id, name: campaign.name });
      
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create push campaign', error);
      throw error;
    }
  }

  /**
   * Get push campaigns
   */
  async getCampaigns(options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    campaigns: PushCampaign[];
    total: number;
  }> {
    try {
      const response = await this.httpClient.get('/push/campaigns', { params: options });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get push campaigns', error);
      throw error;
    }
  }

  /**
   * Get specific campaign
   */
  async getCampaign(campaignId: string): Promise<PushCampaign> {
    try {
      const response = await this.httpClient.get(`/push/campaigns/${campaignId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get push campaign', error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled campaign
   */
  async cancelCampaign(campaignId: string): Promise<{ success: boolean }> {
    try {
      const response = await this.httpClient.post(`/push/campaigns/${campaignId}/cancel`);
      
      this.logger.info('Push campaign cancelled', { campaignId });
      
      return response.data;
    } catch (error) {
      this.logger.error('Failed to cancel push campaign', error);
      throw error;
    }
  }

  /**
   * Register a device for push notifications
   */
  async registerDevice(registration: DeviceRegistration): Promise<{
    success: boolean;
    device_id: string;
  }> {
    try {
      const response = await this.httpClient.post('/push/devices', registration);
      
      this.logger.info('Device registered for push notifications', {
        device_id: response.data.device_id,
        user_id: registration.user_id
      });
      
      return response.data;
    } catch (error) {
      this.logger.error('Failed to register device', error);
      throw error;
    }
  }

  /**
   * Unregister a device
   */
  async unregisterDevice(deviceToken: string): Promise<{ success: boolean }> {
    try {
      const response = await this.httpClient.delete(`/push/devices/${deviceToken}`);
      
      this.logger.info('Device unregistered', { deviceToken });
      
      return response.data;
    } catch (error) {
      this.logger.error('Failed to unregister device', error);
      throw error;
    }
  }

  /**
   * Update device tags
   */
  async updateDeviceTags(deviceToken: string, tags: string[]): Promise<{ success: boolean }> {
    try {
      const response = await this.httpClient.put(`/push/devices/${deviceToken}/tags`, { tags });
      
      this.logger.info('Device tags updated', { deviceToken, tags });
      
      return response.data;
    } catch (error) {
      this.logger.error('Failed to update device tags', error);
      throw error;
    }
  }

  /**
   * Create push template
   */
  async createTemplate(template: {
    name: string;
    title: string;
    body: string;
    icon?: string;
    variables?: string[];
  }): Promise<PushTemplate> {
    try {
      const response = await this.httpClient.post('/push/templates', template);
      
      this.logger.info('Push template created', { id: response.data.id, name: template.name });
      
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create push template', error);
      throw error;
    }
  }

  /**
   * Get push templates
   */
  async getTemplates(): Promise<PushTemplate[]> {
    try {
      const response = await this.httpClient.get('/push/templates');
      return response.data || [];
    } catch (error) {
      this.logger.error('Failed to get push templates', error);
      throw error;
    }
  }

  /**
   * Send push using template
   */
  async sendWithTemplate(templateId: string, options: {
    targets: PushTarget[];
    variables?: Record<string, string>;
    schedule?: Date | string;
  }): Promise<{
    success: boolean;
    message_id: string;
    sent_count: number;
  }> {
    try {
      const response = await this.httpClient.post(`/push/templates/${templateId}/send`, options);
      
      this.logger.info('Template push notification sent', {
        template_id: templateId,
        message_id: response.data.message_id
      });
      
      return response.data;
    } catch (error) {
      this.logger.error('Failed to send template push notification', error);
      throw error;
    }
  }

  /**
   * Get push notification statistics
   */
  async getStats(options?: {
    start_date?: string;
    end_date?: string;
    campaign_id?: string;
  }): Promise<PushStats> {
    try {
      const response = await this.httpClient.get('/push/stats', { params: options });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get push stats', error);
      throw error;
    }
  }

  /**
   * Test push notification (sends to test devices only)
   */
  async test(notification: PushNotification, testDevices: string[]): Promise<{
    success: boolean;
    results: Array<{
      device_token: string;
      success: boolean;
      error?: string;
    }>;
  }> {
    try {
      const response = await this.httpClient.post('/push/test', {
        notification,
        test_devices: testDevices,
      });
      
      this.logger.info('Test push notification sent', {
        devices: testDevices.length,
        success_count: response.data.results.filter((r: any) => r.success).length
      });
      
      return response.data;
    } catch (error) {
      this.logger.error('Failed to send test push notification', error);
      throw error;
    }
  }
}

