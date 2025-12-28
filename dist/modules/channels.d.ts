import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
export declare enum ChannelType {
    PUBLIC = "public",
    PRIVATE = "private",
    PRESENCE = "presence",
    DIRECT = "direct"
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
export declare class ChannelsClient {
    private httpClient;
    private config;
    private logger;
    private ws;
    private subscriptions;
    private reconnectTimer;
    private reconnectAttempts;
    private isConnected;
    private apiKey;
    private token;
    private connectionConfig;
    constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger);
    /**
     * Create a new channel
     */
    create(options: CreateChannelOptions): Promise<Channel>;
    /**
     * Get channel by ID
     */
    get(channelId: string): Promise<Channel>;
    /**
     * List channels
     */
    list(options?: ChannelQueryOptions): Promise<{
        channels: Channel[];
        total: number;
    }>;
    /**
     * Update channel
     */
    update(channelId: string, updates: Partial<CreateChannelOptions>): Promise<Channel>;
    /**
     * Delete channel
     */
    delete(channelId: string): Promise<void>;
    /**
     * Add member to channel
     */
    addMember(channelId: string, userId: string, role?: string): Promise<Channel>;
    /**
     * Remove member from channel
     */
    removeMember(channelId: string, userId: string): Promise<Channel>;
    /**
     * Join a public channel
     */
    join(channelId: string): Promise<Channel>;
    /**
     * Leave channel
     */
    leave(channelId: string): Promise<void>;
    /**
     * Send message to channel
     */
    sendMessage(channelId: string, options: SendMessageOptions): Promise<ChannelMessage>;
    /**
     * Get channel messages
     */
    getMessages(channelId: string, options?: MessageQueryOptions): Promise<{
        messages: ChannelMessage[];
        hasMore: boolean;
    }>;
    /**
     * Delete a message
     */
    deleteMessage(messageId: string): Promise<void>;
    /**
     * Add reaction to message
     */
    addReaction(messageId: string, reaction: string): Promise<void>;
    /**
     * Remove reaction from message
     */
    removeReaction(messageId: string, reaction: string): Promise<void>;
    /**
     * Publish event to channel (REST API)
     */
    publish(channelName: string, options: PublishEventOptions): Promise<{
        success: boolean;
        sentTo: number;
    }>;
    /**
     * Generate channel access token
     */
    generateToken(channel: string, expiresIn?: number): Promise<{
        token: string;
        channel: string;
        expiresAt: string;
    }>;
    /**
     * Get or create direct message channel with another user
     */
    getDirectChannel(otherUserId: string): Promise<Channel>;
    /**
     * Get online users in channel
     */
    getPresence(channelId: string): Promise<{
        users: PresenceUser[];
    }>;
    /**
     * Send typing indicator
     */
    sendTyping(channelId: string, isTyping: boolean): Promise<void>;
    /**
     * Connect to channels WebSocket server
     */
    connect(config?: ChannelsConnectionConfig): Promise<void>;
    /**
     * Disconnect from channels server
     */
    disconnect(): void;
    /**
     * Subscribe to channel events (WebSocket)
     */
    subscribe(channel: string, event: string, callback: ChannelEventCallback): () => void;
    /**
     * Subscribe to channel by ID
     */
    subscribeToChannel(channelId: string, callback: ChannelEventCallback<ChannelMessage>): () => void;
    /**
     * Publish event via WebSocket
     */
    trigger(channel: string, event: string, data: any): void;
    /**
     * Send message via WebSocket
     */
    sendMessageWs(channelId: string, content: string, type?: string, metadata?: any): void;
    /**
     * Send typing indicator via WebSocket
     */
    sendTypingWs(channelId: string, isTyping: boolean): void;
    /**
     * Check if connected
     */
    isConnectedToChannels(): boolean;
    /**
     * Get connection status
     */
    getStatus(): {
        connected: boolean;
        subscriptions: number;
    };
    private getWebSocketUrl;
    private wsSend;
    private handleMessage;
    private handleReconnect;
    private resubscribeAll;
}
//# sourceMappingURL=channels.d.ts.map