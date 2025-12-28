import WebSocket from 'ws';
import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import { ApiResponse } from '../types';

// === TYPES ===

export enum ChannelType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  PRESENCE = 'presence',
  DIRECT = 'direct',
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: ChannelType;
  memberCount: number;
  members?: ChannelMember[];
  metadata?: Record<string, any>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelMember {
  userId: string;
  role: string;
  joinedAt: string;
  user?: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
}

export interface ChannelMessage {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  type: string;
  attachments?: string[];
  mentions?: string[];
  replyTo?: string;
  reactions?: Record<string, string[]>;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface CreateChannelOptions {
  name: string;
  description?: string;
  type?: ChannelType;
  members?: string[];
  metadata?: Record<string, any>;
}

export interface SendMessageOptions {
  content: string;
  type?: string;
  attachments?: string[];
  mentions?: string[];
  replyTo?: string;
  metadata?: Record<string, any>;
}

export interface PublishEventOptions {
  event: string;
  data: Record<string, any>;
  excludeUserIds?: string[];
}

export interface ChannelQueryOptions {
  type?: ChannelType;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface MessageQueryOptions {
  limit?: number;
  cursor?: string;
  direction?: 'before' | 'after';
}

export interface ChannelsConnectionConfig {
  url?: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onConnect?: () => void;
  onDisconnect?: (code: number, reason: string) => void;
  onError?: (error: Error) => void;
}

export interface ChannelEventCallback<T = any> {
  (data: T): void;
}

export interface PresenceUser {
  userId: string;
  socketId: string;
  data?: Record<string, any>;
}

// === CHANNELS CLIENT ===

export class ChannelsClient {
  private httpClient: AxiosInstance;
  private config: FluxezConfig;
  private logger: Logger;
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, Map<string, ChannelEventCallback[]>> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private isConnected: boolean = false;
  private apiKey: string;
  private token: string | null = null;
  private connectionConfig: ChannelsConnectionConfig = {
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

  // === REST API METHODS ===

  /**
   * Create a new channel
   */
  async create(options: CreateChannelOptions): Promise<Channel> {
    try {
      this.logger.debug('Creating channel', { name: options.name });
      const response = await this.httpClient.post<ApiResponse<Channel>>(
        '/api/v1/channels',
        options
      );
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to create channel', error);
      throw error;
    }
  }

  /**
   * Get channel by ID
   */
  async get(channelId: string): Promise<Channel> {
    try {
      const response = await this.httpClient.get<ApiResponse<Channel>>(
        `/api/v1/channels/${channelId}`
      );
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get channel', error);
      throw error;
    }
  }

  /**
   * List channels
   */
  async list(options?: ChannelQueryOptions): Promise<{ channels: Channel[]; total: number }> {
    try {
      const response = await this.httpClient.get<ApiResponse<{ channels: Channel[]; total: number }>>(
        '/api/v1/channels',
        { params: options }
      );
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to list channels', error);
      throw error;
    }
  }

  /**
   * Update channel
   */
  async update(channelId: string, updates: Partial<CreateChannelOptions>): Promise<Channel> {
    try {
      this.logger.debug('Updating channel', { channelId });
      const response = await this.httpClient.put<ApiResponse<Channel>>(
        `/api/v1/channels/${channelId}`,
        updates
      );
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to update channel', error);
      throw error;
    }
  }

  /**
   * Delete channel
   */
  async delete(channelId: string): Promise<void> {
    try {
      await this.httpClient.delete(`/api/v1/channels/${channelId}`);
      this.logger.debug('Channel deleted', { channelId });
    } catch (error) {
      this.logger.error('Failed to delete channel', error);
      throw error;
    }
  }

  // === MEMBERS ===

  /**
   * Add member to channel
   */
  async addMember(channelId: string, userId: string, role?: string): Promise<Channel> {
    try {
      this.logger.debug('Adding member to channel', { channelId, userId });
      const response = await this.httpClient.post<ApiResponse<Channel>>(
        `/api/v1/channels/${channelId}/members`,
        { userId, role }
      );
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to add member', error);
      throw error;
    }
  }

  /**
   * Remove member from channel
   */
  async removeMember(channelId: string, userId: string): Promise<Channel> {
    try {
      this.logger.debug('Removing member from channel', { channelId, userId });
      const response = await this.httpClient.delete<ApiResponse<Channel>>(
        `/api/v1/channels/${channelId}/members/${userId}`
      );
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to remove member', error);
      throw error;
    }
  }

  /**
   * Join a public channel
   */
  async join(channelId: string): Promise<Channel> {
    try {
      this.logger.debug('Joining channel', { channelId });
      const response = await this.httpClient.post<ApiResponse<Channel>>(
        `/api/v1/channels/${channelId}/join`
      );
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to join channel', error);
      throw error;
    }
  }

  /**
   * Leave channel
   */
  async leave(channelId: string): Promise<void> {
    try {
      await this.httpClient.post(`/api/v1/channels/${channelId}/leave`);
      this.logger.debug('Left channel', { channelId });
    } catch (error) {
      this.logger.error('Failed to leave channel', error);
      throw error;
    }
  }

  // === MESSAGES ===

  /**
   * Send message to channel
   */
  async sendMessage(channelId: string, options: SendMessageOptions): Promise<ChannelMessage> {
    try {
      this.logger.debug('Sending message', { channelId });
      const response = await this.httpClient.post<ApiResponse<ChannelMessage>>(
        `/api/v1/channels/${channelId}/messages`,
        options
      );
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to send message', error);
      throw error;
    }
  }

  /**
   * Get channel messages
   */
  async getMessages(channelId: string, options?: MessageQueryOptions): Promise<{ messages: ChannelMessage[]; hasMore: boolean }> {
    try {
      const response = await this.httpClient.get<ApiResponse<{ messages: ChannelMessage[]; hasMore: boolean }>>(
        `/api/v1/channels/${channelId}/messages`,
        { params: options }
      );
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get messages', error);
      throw error;
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<void> {
    try {
      await this.httpClient.delete(`/api/v1/channels/messages/${messageId}`);
      this.logger.debug('Message deleted', { messageId });
    } catch (error) {
      this.logger.error('Failed to delete message', error);
      throw error;
    }
  }

  /**
   * Add reaction to message
   */
  async addReaction(messageId: string, reaction: string): Promise<void> {
    try {
      await this.httpClient.post(`/api/v1/channels/messages/${messageId}/reactions/${reaction}`);
    } catch (error) {
      this.logger.error('Failed to add reaction', error);
      throw error;
    }
  }

  /**
   * Remove reaction from message
   */
  async removeReaction(messageId: string, reaction: string): Promise<void> {
    try {
      await this.httpClient.delete(`/api/v1/channels/messages/${messageId}/reactions/${reaction}`);
    } catch (error) {
      this.logger.error('Failed to remove reaction', error);
      throw error;
    }
  }

  // === PUSHER-LIKE PUBLISH/SUBSCRIBE ===

  /**
   * Publish event to channel (REST API)
   */
  async publish(channelName: string, options: PublishEventOptions): Promise<{ success: boolean; sentTo: number }> {
    try {
      this.logger.debug('Publishing event', { channel: channelName, event: options.event });
      const response = await this.httpClient.post<ApiResponse<{ success: boolean; sentTo: number }>>(
        `/api/v1/channels/publish/${channelName}`,
        options
      );
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to publish event', error);
      throw error;
    }
  }

  /**
   * Generate channel access token
   */
  async generateToken(channel: string, expiresIn?: number): Promise<{ token: string; channel: string; expiresAt: string }> {
    try {
      const response = await this.httpClient.post<ApiResponse<{ token: string; channel: string; expiresAt: string }>>(
        '/api/v1/channels/auth/token',
        { channel, expiresIn }
      );
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to generate token', error);
      throw error;
    }
  }

  // === DIRECT MESSAGES ===

  /**
   * Get or create direct message channel with another user
   */
  async getDirectChannel(otherUserId: string): Promise<Channel> {
    try {
      const response = await this.httpClient.post<ApiResponse<Channel>>(
        `/api/v1/channels/direct/${otherUserId}`
      );
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get direct channel', error);
      throw error;
    }
  }

  // === PRESENCE ===

  /**
   * Get online users in channel
   */
  async getPresence(channelId: string): Promise<{ users: PresenceUser[] }> {
    try {
      const response = await this.httpClient.get<ApiResponse<{ users: PresenceUser[] }>>(
        `/api/v1/channels/${channelId}/presence`
      );
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get presence', error);
      throw error;
    }
  }

  /**
   * Send typing indicator
   */
  async sendTyping(channelId: string, isTyping: boolean): Promise<void> {
    try {
      await this.httpClient.post(`/api/v1/channels/${channelId}/typing`, { isTyping });
    } catch (error) {
      this.logger.error('Failed to send typing indicator', error);
      throw error;
    }
  }

  // === WEBSOCKET CONNECTION ===

  /**
   * Connect to channels WebSocket server
   */
  async connect(config?: ChannelsConnectionConfig): Promise<void> {
    if (config) {
      this.connectionConfig = { ...this.connectionConfig, ...config };
    }

    // Get token if not provided
    if (!this.token) {
      const tokenData = await this.generateToken('*');
      this.token = tokenData.token;
    }

    const wsUrl = this.connectionConfig.url || this.getWebSocketUrl();

    this.logger.debug('Connecting to channels server', { url: wsUrl });

    try {
      this.ws = new WebSocket(wsUrl, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      this.ws.on('open', () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.logger.info('Connected to channels server');
        this.connectionConfig.onConnect?.();
        this.resubscribeAll();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(message);
        } catch (error) {
          this.logger.error('Failed to parse message', error);
        }
      });

      this.ws.on('close', (code: number, reason: Buffer) => {
        this.isConnected = false;
        const reasonStr = reason.toString();
        this.logger.warn('Connection closed', { code, reason: reasonStr });
        this.connectionConfig.onDisconnect?.(code, reasonStr);
        this.handleReconnect();
      });

      this.ws.on('error', (error: Error) => {
        this.logger.error('Connection error', error);
        this.connectionConfig.onError?.(error);
      });

    } catch (error) {
      this.logger.error('Failed to connect', error);
      throw error;
    }
  }

  /**
   * Disconnect from channels server
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
    this.token = null;
  }

  /**
   * Subscribe to channel events (WebSocket)
   */
  subscribe(channel: string, event: string, callback: ChannelEventCallback): () => void {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Map());

      // Send subscribe message if connected
      if (this.isConnected && this.ws) {
        this.wsSend({ type: 'subscribe', channel });
      }
    }

    const channelSubs = this.subscriptions.get(channel)!;
    if (!channelSubs.has(event)) {
      channelSubs.set(event, []);
    }

    channelSubs.get(event)!.push(callback);
    this.logger.debug('Subscribed to channel event', { channel, event });

    // Return unsubscribe function
    return () => {
      const eventCallbacks = channelSubs.get(event);
      if (eventCallbacks) {
        const index = eventCallbacks.indexOf(callback);
        if (index !== -1) {
          eventCallbacks.splice(index, 1);
        }
        if (eventCallbacks.length === 0) {
          channelSubs.delete(event);
        }
      }
      if (channelSubs.size === 0) {
        this.subscriptions.delete(channel);
        if (this.isConnected && this.ws) {
          this.wsSend({ type: 'unsubscribe', channel });
        }
      }
    };
  }

  /**
   * Subscribe to channel by ID
   */
  subscribeToChannel(channelId: string, callback: ChannelEventCallback<ChannelMessage>): () => void {
    return this.subscribe(channelId, 'message:new', callback);
  }

  /**
   * Publish event via WebSocket
   */
  trigger(channel: string, event: string, data: any): void {
    if (!this.isConnected || !this.ws) {
      this.logger.warn('Cannot trigger: not connected');
      return;
    }

    this.wsSend({
      type: 'publish',
      channel,
      event,
      data,
    });
  }

  /**
   * Send message via WebSocket
   */
  sendMessageWs(channelId: string, content: string, type?: string, metadata?: any): void {
    if (!this.isConnected || !this.ws) {
      this.logger.warn('Cannot send message: not connected');
      return;
    }

    this.wsSend({
      type: 'message',
      channelId,
      content,
      messageType: type,
      metadata,
    });
  }

  /**
   * Send typing indicator via WebSocket
   */
  sendTypingWs(channelId: string, isTyping: boolean): void {
    if (!this.isConnected || !this.ws) {
      return;
    }

    this.wsSend({
      type: 'typing',
      channelId,
      isTyping,
    });
  }

  /**
   * Check if connected
   */
  isConnectedToChannels(): boolean {
    return this.isConnected;
  }

  /**
   * Get connection status
   */
  getStatus(): { connected: boolean; subscriptions: number } {
    return {
      connected: this.isConnected,
      subscriptions: this.subscriptions.size,
    };
  }

  // === PRIVATE METHODS ===

  private getWebSocketUrl(): string {
    const baseUrl = (this.config as any).baseURL || 'http://localhost:3000';
    const wsUrl = baseUrl.replace(/^http/, 'ws');
    return `${wsUrl}/channels`;
  }

  private wsSend(data: any): void {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private handleMessage(message: any): void {
    const { channel, event, channelId } = message;
    const targetChannel = channelId || channel;

    if (!targetChannel) {
      // System message
      if (message.type === 'connected') {
        this.logger.debug('Received connection confirmation');
      } else if (message.type === 'subscribed') {
        this.logger.debug('Subscription confirmed', message);
      } else if (message.type === 'error') {
        this.logger.error('Server error', message);
      }
      return;
    }

    const channelSubs = this.subscriptions.get(targetChannel);
    if (!channelSubs) {
      return;
    }

    const eventName = event || message.type;
    const callbacks = channelSubs.get(eventName) || [];
    const wildcardCallbacks = channelSubs.get('*') || [];

    const allCallbacks = [...callbacks, ...wildcardCallbacks];

    for (const callback of allCallbacks) {
      try {
        callback(message);
      } catch (error) {
        this.logger.error('Error in callback', error);
      }
    }
  }

  private handleReconnect(): void {
    if (
      this.connectionConfig.reconnect &&
      this.reconnectAttempts < (this.connectionConfig.maxReconnectAttempts || 10)
    ) {
      this.reconnectAttempts++;
      this.reconnectTimer = setTimeout(() => {
        this.logger.info(`Reconnecting (attempt ${this.reconnectAttempts})`);
        this.connect();
      }, this.connectionConfig.reconnectInterval);
    } else {
      this.logger.error('Max reconnection attempts reached');
    }
  }

  private resubscribeAll(): void {
    for (const channel of this.subscriptions.keys()) {
      this.wsSend({ type: 'subscribe', channel });
    }
  }
}
