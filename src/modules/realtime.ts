import WebSocket from 'ws';
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

export class RealtimeClient {
  private httpClient: AxiosInstance;
  private config: FluxezConfig;
  private logger: Logger;
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, ChannelSubscription[]> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private isConnected: boolean = false;
  private apiKey: string;
  
  private realtimeConfig: RealtimeConfig = {
    reconnect: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
  };

  constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger) {
    this.httpClient = httpClient;
    this.config = config;
    this.logger = logger;
    this.apiKey = config.apiKey || '';
  }

  /**
   * Connect to the realtime server
   */
  async connect(config?: RealtimeConfig): Promise<void> {
    if (config) {
      this.realtimeConfig = { ...this.realtimeConfig, ...config };
    }

    const wsUrl = this.realtimeConfig.url || this.getWebSocketUrl();
    
    this.logger.debug('Connecting to realtime server', { url: wsUrl });

    try {
      this.ws = new WebSocket(wsUrl, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      this.ws.on('open', () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.logger.info('Connected to realtime server');
        this.onOpen();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const message: RealtimeMessage = JSON.parse(data.toString());
          this.onMessage(message);
        } catch (error) {
          this.logger.error('Failed to parse realtime message', error);
        }
      });

      this.ws.on('close', (code: number, reason: Buffer) => {
        this.isConnected = false;
        this.logger.warn('Realtime connection closed', { code, reason: reason.toString() });
        this.onClose(code, reason.toString());
      });

      this.ws.on('error', (error: Error) => {
        this.logger.error('Realtime connection error', error);
        this.onError(error);
      });

    } catch (error) {
      this.logger.error('Failed to connect to realtime server', error);
      throw error;
    }
  }

  /**
   * Disconnect from the realtime server
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
    this.subscriptions.clear();
  }

  /**
   * Subscribe to a channel
   */
  subscribe(channel: string, callback: (message: RealtimeMessage) => void, filter?: (message: RealtimeMessage) => boolean): void {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, []);
    }

    const subscription: ChannelSubscription = {
      channel,
      callback,
      filter,
    };

    this.subscriptions.get(channel)!.push(subscription);

    // Send subscription message to server
    if (this.isConnected && this.ws) {
      this.send({
        type: 'subscribe',
        channel,
        data: {},
        timestamp: Date.now(),
      });
    }

    this.logger.debug('Subscribed to channel', { channel });
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channel: string, callback?: (message: RealtimeMessage) => void): void {
    if (!this.subscriptions.has(channel)) {
      return;
    }

    if (callback) {
      // Remove specific callback
      const subs = this.subscriptions.get(channel)!;
      const index = subs.findIndex(sub => sub.callback === callback);
      if (index !== -1) {
        subs.splice(index, 1);
      }
      
      if (subs.length === 0) {
        this.subscriptions.delete(channel);
      }
    } else {
      // Remove all subscriptions for this channel
      this.subscriptions.delete(channel);
    }

    // Send unsubscribe message to server
    if (this.isConnected && this.ws) {
      this.send({
        type: 'unsubscribe',
        channel,
        data: {},
        timestamp: Date.now(),
      });
    }

    this.logger.debug('Unsubscribed from channel', { channel });
  }

  /**
   * Send a message to a channel
   */
  send(message: Omit<RealtimeMessage, 'timestamp'> & { timestamp?: number }): void {
    if (!this.isConnected || !this.ws) {
      this.logger.warn('Cannot send message: not connected');
      return;
    }

    const fullMessage: RealtimeMessage = {
      ...message,
      timestamp: message.timestamp || Date.now(),
    };

    this.ws.send(JSON.stringify(fullMessage));
    this.logger.debug('Sent realtime message', fullMessage);
  }

  /**
   * Join a presence channel
   */
  async joinPresence(channel: string, presenceData: PresenceData): Promise<void> {
    try {
      await this.httpClient.post('/realtime/presence/join', {
        channel,
        presence_data: presenceData,
      });

      this.subscribe(channel, (message) => {
        this.logger.debug('Presence message received', message);
      });

      this.logger.info('Joined presence channel', { channel });
    } catch (error) {
      this.logger.error('Failed to join presence channel', error);
      throw error;
    }
  }

  /**
   * Leave a presence channel
   */
  async leavePresence(channel: string): Promise<void> {
    try {
      await this.httpClient.post('/realtime/presence/leave', {
        channel,
      });

      this.unsubscribe(channel);
      this.logger.info('Left presence channel', { channel });
    } catch (error) {
      this.logger.error('Failed to leave presence channel', error);
      throw error;
    }
  }

  /**
   * Get presence data for a channel
   */
  async getPresence(channel: string): Promise<PresenceData[]> {
    try {
      const response = await this.httpClient.get(`/realtime/presence/${channel}`);
      return response.data || [];
    } catch (error) {
      this.logger.error('Failed to get presence data', error);
      throw error;
    }
  }

  /**
   * Publish message to channel
   */
  async publish(channel: string, data: any): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to realtime server');
    }
    
    this.send({
      type: 'publish',
      channel,
      data,
    });
  }

  /**
   * Check if connected
   */
  isConnectedToRealtime(): boolean {
    return this.isConnected;
  }

  /**
   * Get connection status
   */
  getStatus(): {
    connected: boolean;
    reconnectAttempts: number;
    subscriptions: number;
  } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      subscriptions: this.subscriptions.size,
    };
  }

  private getWebSocketUrl(): string {
    const baseUrl = (this.config as any).baseURL || 'http://localhost:3000';
    const wsUrl = baseUrl.replace(/^http/, 'ws');
    return `${wsUrl}/realtime`;
  }

  private onOpen(): void {
    // Re-subscribe to all channels
    for (const channel of this.subscriptions.keys()) {
      this.send({
        type: 'subscribe',
        channel,
        data: {},
      });
    }
  }

  private onMessage(message: RealtimeMessage): void {
    const subscriptions = this.subscriptions.get(message.channel);
    if (!subscriptions) {
      return;
    }

    for (const subscription of subscriptions) {
      try {
        if (!subscription.filter || subscription.filter(message)) {
          subscription.callback(message);
        }
      } catch (error) {
        this.logger.error('Error in subscription callback', error);
      }
    }
  }

  private onClose(code: number, reason: string): void {
    if (this.realtimeConfig.reconnect && this.reconnectAttempts < (this.realtimeConfig.maxReconnectAttempts || 10)) {
      this.reconnectAttempts++;
      
      this.reconnectTimer = setTimeout(() => {
        this.logger.info(`Reconnecting to realtime server (attempt ${this.reconnectAttempts})`);
        this.connect();
      }, this.realtimeConfig.reconnectInterval);
    } else {
      this.logger.error('Max reconnection attempts reached or reconnection disabled');
    }
  }

  private onError(error: Error): void {
    this.logger.error('Realtime WebSocket error', error);
  }

}

