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
export declare class PushClient {
    private httpClient;
    private config;
    private logger;
    constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger);
    /**
     * Send push notification to specific targets
     */
    send(options: SendPushOptions): Promise<{
        success: boolean;
        message_id: string;
        sent_count: number;
        failed_count: number;
        errors?: string[];
    }>;
    /**
     * Send push to specific user
     */
    sendToUser(userId: string, notification: PushNotification): Promise<{
        success: boolean;
        message_id: string;
    }>;
    /**
     * Send push to device token
     */
    sendToDevice(deviceToken: string, notification: PushNotification): Promise<{
        success: boolean;
        message_id: string;
    }>;
    /**
     * Send push to segment
     */
    sendToSegment(segments: string[], notification: PushNotification): Promise<{
        success: boolean;
        message_id: string;
        sent_count: number;
    }>;
    /**
     * Send push to users with tags
     */
    sendToTags(tags: string[], notification: PushNotification): Promise<{
        success: boolean;
        message_id: string;
        sent_count: number;
    }>;
    /**
     * Schedule a push notification
     */
    schedule(options: SendPushOptions & {
        schedule: Date | string;
    }): Promise<{
        success: boolean;
        campaign_id: string;
        scheduled_at: string;
    }>;
    /**
     * Create a push campaign
     */
    createCampaign(campaign: {
        name: string;
        notification: PushNotification;
        targets: PushTarget[];
        scheduled_at?: Date | string;
    }): Promise<PushCampaign>;
    /**
     * Get push campaigns
     */
    getCampaigns(options?: {
        status?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        campaigns: PushCampaign[];
        total: number;
    }>;
    /**
     * Get specific campaign
     */
    getCampaign(campaignId: string): Promise<PushCampaign>;
    /**
     * Cancel a scheduled campaign
     */
    cancelCampaign(campaignId: string): Promise<{
        success: boolean;
    }>;
    /**
     * Register a device for push notifications
     */
    registerDevice(registration: DeviceRegistration): Promise<{
        success: boolean;
        device_id: string;
    }>;
    /**
     * Unregister a device
     */
    unregisterDevice(deviceToken: string): Promise<{
        success: boolean;
    }>;
    /**
     * Update device tags
     */
    updateDeviceTags(deviceToken: string, tags: string[]): Promise<{
        success: boolean;
    }>;
    /**
     * Create push template
     */
    createTemplate(template: {
        name: string;
        title: string;
        body: string;
        icon?: string;
        variables?: string[];
    }): Promise<PushTemplate>;
    /**
     * Get push templates
     */
    getTemplates(): Promise<PushTemplate[]>;
    /**
     * Send push using template
     */
    sendWithTemplate(templateId: string, options: {
        targets: PushTarget[];
        variables?: Record<string, string>;
        schedule?: Date | string;
    }): Promise<{
        success: boolean;
        message_id: string;
        sent_count: number;
    }>;
    /**
     * Get push notification statistics
     */
    getStats(options?: {
        start_date?: string;
        end_date?: string;
        campaign_id?: string;
    }): Promise<PushStats>;
    /**
     * Test push notification (sends to test devices only)
     */
    test(notification: PushNotification, testDevices: string[]): Promise<{
        success: boolean;
        results: Array<{
            device_token: string;
            success: boolean;
            error?: string;
        }>;
    }>;
}
//# sourceMappingURL=push.d.ts.map