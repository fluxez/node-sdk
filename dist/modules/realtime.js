"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeClient = void 0;
const ws_1 = __importDefault(require("ws"));
class RealtimeClient {
    constructor(httpClient, config, logger) {
        this.ws = null;
        this.subscriptions = new Map();
        this.reconnectTimer = null;
        this.reconnectAttempts = 0;
        this.isConnected = false;
        this.realtimeConfig = {
            reconnect: true,
            reconnectInterval: 5000,
            maxReconnectAttempts: 10,
        };
        this.httpClient = httpClient;
        this.config = config;
        this.logger = logger;
        this.apiKey = config.apiKey || '';
    }
    /**
     * Connect to the realtime server
     */
    async connect(config) {
        if (config) {
            this.realtimeConfig = { ...this.realtimeConfig, ...config };
        }
        const wsUrl = this.realtimeConfig.url || this.getWebSocketUrl();
        this.logger.debug('Connecting to realtime server', { url: wsUrl });
        try {
            this.ws = new ws_1.default(wsUrl, {
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
            this.ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.onMessage(message);
                }
                catch (error) {
                    this.logger.error('Failed to parse realtime message', error);
                }
            });
            this.ws.on('close', (code, reason) => {
                this.isConnected = false;
                this.logger.warn('Realtime connection closed', { code, reason: reason.toString() });
                this.onClose(code, reason.toString());
            });
            this.ws.on('error', (error) => {
                this.logger.error('Realtime connection error', error);
                this.onError(error);
            });
        }
        catch (error) {
            this.logger.error('Failed to connect to realtime server', error);
            throw error;
        }
    }
    /**
     * Disconnect from the realtime server
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
    }
    /**
     * Subscribe to a channel
     */
    subscribe(channel, callback, filter) {
        if (!this.subscriptions.has(channel)) {
            this.subscriptions.set(channel, []);
        }
        const subscription = {
            channel,
            callback,
            filter,
        };
        this.subscriptions.get(channel).push(subscription);
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
    unsubscribe(channel, callback) {
        if (!this.subscriptions.has(channel)) {
            return;
        }
        if (callback) {
            // Remove specific callback
            const subs = this.subscriptions.get(channel);
            const index = subs.findIndex(sub => sub.callback === callback);
            if (index !== -1) {
                subs.splice(index, 1);
            }
            if (subs.length === 0) {
                this.subscriptions.delete(channel);
            }
        }
        else {
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
    send(message) {
        if (!this.isConnected || !this.ws) {
            this.logger.warn('Cannot send message: not connected');
            return;
        }
        const fullMessage = {
            ...message,
            timestamp: message.timestamp || Date.now(),
        };
        this.ws.send(JSON.stringify(fullMessage));
        this.logger.debug('Sent realtime message', fullMessage);
    }
    /**
     * Join a presence channel
     */
    async joinPresence(channel, presenceData) {
        try {
            await this.httpClient.post('/api/v1/realtime/presence/join', {
                channel,
                presence_data: presenceData,
            });
            this.subscribe(channel, (message) => {
                this.logger.debug('Presence message received', message);
            });
            this.logger.info('Joined presence channel', { channel });
        }
        catch (error) {
            this.logger.error('Failed to join presence channel', error);
            throw error;
        }
    }
    /**
     * Leave a presence channel
     */
    async leavePresence(channel) {
        try {
            await this.httpClient.post('/api/v1/realtime/presence/leave', {
                channel,
            });
            this.unsubscribe(channel);
            this.logger.info('Left presence channel', { channel });
        }
        catch (error) {
            this.logger.error('Failed to leave presence channel', error);
            throw error;
        }
    }
    /**
     * Get presence data for a channel
     */
    async getPresence(channel) {
        try {
            const response = await this.httpClient.get(`/api/v1/realtime/presence/${channel}`);
            return response.data || [];
        }
        catch (error) {
            this.logger.error('Failed to get presence data', error);
            throw error;
        }
    }
    /**
     * Publish message to channel
     */
    async publish(channel, data) {
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
    isConnectedToRealtime() {
        return this.isConnected;
    }
    /**
     * Get connection status
     */
    getStatus() {
        return {
            connected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            subscriptions: this.subscriptions.size,
        };
    }
    getWebSocketUrl() {
        const baseUrl = this.config.baseURL || 'http://localhost:3000';
        const wsUrl = baseUrl.replace(/^http/, 'ws');
        return `${wsUrl}/realtime`;
    }
    onOpen() {
        // Re-subscribe to all channels
        for (const channel of this.subscriptions.keys()) {
            this.send({
                type: 'subscribe',
                channel,
                data: {},
            });
        }
    }
    onMessage(message) {
        const subscriptions = this.subscriptions.get(message.channel);
        if (!subscriptions) {
            return;
        }
        for (const subscription of subscriptions) {
            try {
                if (!subscription.filter || subscription.filter(message)) {
                    subscription.callback(message);
                }
            }
            catch (error) {
                this.logger.error('Error in subscription callback', error);
            }
        }
    }
    onClose(code, reason) {
        if (this.realtimeConfig.reconnect && this.reconnectAttempts < (this.realtimeConfig.maxReconnectAttempts || 10)) {
            this.reconnectAttempts++;
            this.reconnectTimer = setTimeout(() => {
                this.logger.info(`Reconnecting to realtime server (attempt ${this.reconnectAttempts})`);
                this.connect();
            }, this.realtimeConfig.reconnectInterval);
        }
        else {
            this.logger.error('Max reconnection attempts reached or reconnection disabled');
        }
    }
    onError(error) {
        this.logger.error('Realtime WebSocket error', error);
    }
}
exports.RealtimeClient = RealtimeClient;
//# sourceMappingURL=realtime.js.map