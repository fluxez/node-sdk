"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelsClient = exports.ChannelType = void 0;
const ws_1 = __importDefault(require("ws"));
// === TYPES ===
var ChannelType;
(function (ChannelType) {
    ChannelType["PUBLIC"] = "public";
    ChannelType["PRIVATE"] = "private";
    ChannelType["PRESENCE"] = "presence";
    ChannelType["DIRECT"] = "direct";
})(ChannelType || (exports.ChannelType = ChannelType = {}));
// === CHANNELS CLIENT ===
class ChannelsClient {
    constructor(httpClient, config, logger) {
        this.ws = null;
        this.subscriptions = new Map();
        this.reconnectTimer = null;
        this.reconnectAttempts = 0;
        this.isConnected = false;
        this.token = null;
        this.connectionConfig = {
            reconnect: true,
            reconnectInterval: 5000,
            maxReconnectAttempts: 10,
        };
        this.httpClient = httpClient;
        this.config = config;
        this.logger = logger;
        this.apiKey = config.apiKey || '';
    }
    // === REST API METHODS ===
    /**
     * Create a new channel
     */
    async create(options) {
        try {
            this.logger.debug('Creating channel', { name: options.name });
            const response = await this.httpClient.post('/api/v1/channels', options);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to create channel', error);
            throw error;
        }
    }
    /**
     * Get channel by ID
     */
    async get(channelId) {
        try {
            const response = await this.httpClient.get(`/api/v1/channels/${channelId}`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get channel', error);
            throw error;
        }
    }
    /**
     * List channels
     */
    async list(options) {
        try {
            const response = await this.httpClient.get('/api/v1/channels', { params: options });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to list channels', error);
            throw error;
        }
    }
    /**
     * Update channel
     */
    async update(channelId, updates) {
        try {
            this.logger.debug('Updating channel', { channelId });
            const response = await this.httpClient.put(`/api/v1/channels/${channelId}`, updates);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to update channel', error);
            throw error;
        }
    }
    /**
     * Delete channel
     */
    async delete(channelId) {
        try {
            await this.httpClient.delete(`/api/v1/channels/${channelId}`);
            this.logger.debug('Channel deleted', { channelId });
        }
        catch (error) {
            this.logger.error('Failed to delete channel', error);
            throw error;
        }
    }
    // === MEMBERS ===
    /**
     * Add member to channel
     */
    async addMember(channelId, userId, role) {
        try {
            this.logger.debug('Adding member to channel', { channelId, userId });
            const response = await this.httpClient.post(`/api/v1/channels/${channelId}/members`, { userId, role });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to add member', error);
            throw error;
        }
    }
    /**
     * Remove member from channel
     */
    async removeMember(channelId, userId) {
        try {
            this.logger.debug('Removing member from channel', { channelId, userId });
            const response = await this.httpClient.delete(`/api/v1/channels/${channelId}/members/${userId}`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to remove member', error);
            throw error;
        }
    }
    /**
     * Join a public channel
     */
    async join(channelId) {
        try {
            this.logger.debug('Joining channel', { channelId });
            const response = await this.httpClient.post(`/api/v1/channels/${channelId}/join`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to join channel', error);
            throw error;
        }
    }
    /**
     * Leave channel
     */
    async leave(channelId) {
        try {
            await this.httpClient.post(`/api/v1/channels/${channelId}/leave`);
            this.logger.debug('Left channel', { channelId });
        }
        catch (error) {
            this.logger.error('Failed to leave channel', error);
            throw error;
        }
    }
    // === MESSAGES ===
    /**
     * Send message to channel
     */
    async sendMessage(channelId, options) {
        try {
            this.logger.debug('Sending message', { channelId });
            const response = await this.httpClient.post(`/api/v1/channels/${channelId}/messages`, options);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to send message', error);
            throw error;
        }
    }
    /**
     * Get channel messages
     */
    async getMessages(channelId, options) {
        try {
            const response = await this.httpClient.get(`/api/v1/channels/${channelId}/messages`, { params: options });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get messages', error);
            throw error;
        }
    }
    /**
     * Delete a message
     */
    async deleteMessage(messageId) {
        try {
            await this.httpClient.delete(`/api/v1/channels/messages/${messageId}`);
            this.logger.debug('Message deleted', { messageId });
        }
        catch (error) {
            this.logger.error('Failed to delete message', error);
            throw error;
        }
    }
    /**
     * Add reaction to message
     */
    async addReaction(messageId, reaction) {
        try {
            await this.httpClient.post(`/api/v1/channels/messages/${messageId}/reactions/${reaction}`);
        }
        catch (error) {
            this.logger.error('Failed to add reaction', error);
            throw error;
        }
    }
    /**
     * Remove reaction from message
     */
    async removeReaction(messageId, reaction) {
        try {
            await this.httpClient.delete(`/api/v1/channels/messages/${messageId}/reactions/${reaction}`);
        }
        catch (error) {
            this.logger.error('Failed to remove reaction', error);
            throw error;
        }
    }
    // === PUSHER-LIKE PUBLISH/SUBSCRIBE ===
    /**
     * Publish event to channel (REST API)
     */
    async publish(channelName, options) {
        try {
            this.logger.debug('Publishing event', { channel: channelName, event: options.event });
            const response = await this.httpClient.post(`/api/v1/channels/publish/${channelName}`, options);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to publish event', error);
            throw error;
        }
    }
    /**
     * Generate channel access token
     */
    async generateToken(channel, expiresIn) {
        try {
            const response = await this.httpClient.post('/api/v1/channels/auth/token', { channel, expiresIn });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to generate token', error);
            throw error;
        }
    }
    // === DIRECT MESSAGES ===
    /**
     * Get or create direct message channel with another user
     */
    async getDirectChannel(otherUserId) {
        try {
            const response = await this.httpClient.post(`/api/v1/channels/direct/${otherUserId}`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get direct channel', error);
            throw error;
        }
    }
    // === PRESENCE ===
    /**
     * Get online users in channel
     */
    async getPresence(channelId) {
        try {
            const response = await this.httpClient.get(`/api/v1/channels/${channelId}/presence`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get presence', error);
            throw error;
        }
    }
    /**
     * Send typing indicator
     */
    async sendTyping(channelId, isTyping) {
        try {
            await this.httpClient.post(`/api/v1/channels/${channelId}/typing`, { isTyping });
        }
        catch (error) {
            this.logger.error('Failed to send typing indicator', error);
            throw error;
        }
    }
    // === WEBSOCKET CONNECTION ===
    /**
     * Connect to channels WebSocket server
     */
    async connect(config) {
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
            this.ws = new ws_1.default(wsUrl, {
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
            this.ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.handleMessage(message);
                }
                catch (error) {
                    this.logger.error('Failed to parse message', error);
                }
            });
            this.ws.on('close', (code, reason) => {
                this.isConnected = false;
                const reasonStr = reason.toString();
                this.logger.warn('Connection closed', { code, reason: reasonStr });
                this.connectionConfig.onDisconnect?.(code, reasonStr);
                this.handleReconnect();
            });
            this.ws.on('error', (error) => {
                this.logger.error('Connection error', error);
                this.connectionConfig.onError?.(error);
            });
        }
        catch (error) {
            this.logger.error('Failed to connect', error);
            throw error;
        }
    }
    /**
     * Disconnect from channels server
     */
    disconnect() {
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
    subscribe(channel, event, callback) {
        if (!this.subscriptions.has(channel)) {
            this.subscriptions.set(channel, new Map());
            // Send subscribe message if connected
            if (this.isConnected && this.ws) {
                this.wsSend({ type: 'subscribe', channel });
            }
        }
        const channelSubs = this.subscriptions.get(channel);
        if (!channelSubs.has(event)) {
            channelSubs.set(event, []);
        }
        channelSubs.get(event).push(callback);
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
    subscribeToChannel(channelId, callback) {
        return this.subscribe(channelId, 'message:new', callback);
    }
    /**
     * Publish event via WebSocket
     */
    trigger(channel, event, data) {
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
    sendMessageWs(channelId, content, type, metadata) {
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
    sendTypingWs(channelId, isTyping) {
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
    isConnectedToChannels() {
        return this.isConnected;
    }
    /**
     * Get connection status
     */
    getStatus() {
        return {
            connected: this.isConnected,
            subscriptions: this.subscriptions.size,
        };
    }
    // === PRIVATE METHODS ===
    getWebSocketUrl() {
        const baseUrl = this.config.baseURL || 'http://localhost:3000';
        const wsUrl = baseUrl.replace(/^http/, 'ws');
        return `${wsUrl}/channels`;
    }
    wsSend(data) {
        if (this.ws && this.isConnected) {
            this.ws.send(JSON.stringify(data));
        }
    }
    handleMessage(message) {
        const { channel, event, channelId } = message;
        const targetChannel = channelId || channel;
        if (!targetChannel) {
            // System message
            if (message.type === 'connected') {
                this.logger.debug('Received connection confirmation');
            }
            else if (message.type === 'subscribed') {
                this.logger.debug('Subscription confirmed', message);
            }
            else if (message.type === 'error') {
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
            }
            catch (error) {
                this.logger.error('Error in callback', error);
            }
        }
    }
    handleReconnect() {
        if (this.connectionConfig.reconnect &&
            this.reconnectAttempts < (this.connectionConfig.maxReconnectAttempts || 10)) {
            this.reconnectAttempts++;
            this.reconnectTimer = setTimeout(() => {
                this.logger.info(`Reconnecting (attempt ${this.reconnectAttempts})`);
                this.connect();
            }, this.connectionConfig.reconnectInterval);
        }
        else {
            this.logger.error('Max reconnection attempts reached');
        }
    }
    resubscribeAll() {
        for (const channel of this.subscriptions.keys()) {
            this.wsSend({ type: 'subscribe', channel });
        }
    }
}
exports.ChannelsClient = ChannelsClient;
//# sourceMappingURL=channels.js.map