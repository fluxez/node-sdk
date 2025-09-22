import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
export interface RealtimeConfig {
    url?: string;
    reconnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
}
export interface RealtimeMessage {
    type: string;
    channel: string;
    data: any;
    timestamp: number;
    id?: string;
}
export interface ChannelSubscription {
    channel: string;
    callback: (message: RealtimeMessage) => void;
    filter?: (message: RealtimeMessage) => boolean;
}
export interface PresenceData {
    user_id: string;
    metadata?: Record<string, any>;
    joined_at: string;
}
export interface RealtimeOptions {
    apiKey: string;
    baseURL?: string;
    debug?: boolean;
}
export declare class RealtimeClient {
    private httpClient;
    private config;
    private logger;
    private ws;
    private subscriptions;
    private reconnectTimer;
    private reconnectAttempts;
    private isConnected;
    private apiKey;
    private realtimeConfig;
    constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger);
    /**
     * Connect to the realtime server
     */
    connect(config?: RealtimeConfig): Promise<void>;
    /**
     * Disconnect from the realtime server
     */
    disconnect(): void;
    /**
     * Subscribe to a channel
     */
    subscribe(channel: string, callback: (message: RealtimeMessage) => void, filter?: (message: RealtimeMessage) => boolean): void;
    /**
     * Unsubscribe from a channel
     */
    unsubscribe(channel: string, callback?: (message: RealtimeMessage) => void): void;
    /**
     * Send a message to a channel
     */
    send(message: Omit<RealtimeMessage, 'timestamp'> & {
        timestamp?: number;
    }): void;
    /**
     * Join a presence channel
     */
    joinPresence(channel: string, presenceData: PresenceData): Promise<void>;
    /**
     * Leave a presence channel
     */
    leavePresence(channel: string): Promise<void>;
    /**
     * Get presence data for a channel
     */
    getPresence(channel: string): Promise<PresenceData[]>;
    /**
     * Publish message to channel
     */
    publish(channel: string, data: any): Promise<void>;
    /**
     * Check if connected
     */
    isConnectedToRealtime(): boolean;
    /**
     * Get connection status
     */
    getStatus(): {
        connected: boolean;
        reconnectAttempts: number;
        subscriptions: number;
    };
    private getWebSocketUrl;
    private onOpen;
    private onMessage;
    private onClose;
    private onError;
}
//# sourceMappingURL=realtime.d.ts.map