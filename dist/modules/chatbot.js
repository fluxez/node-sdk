"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbotClient = void 0;
/**
 * Chatbot Client for Fluxez SDK
 *
 * Provides chatbot functionality including:
 * - Configuration management
 * - Conversation management
 * - Messaging
 * - Document/knowledge base management
 * - Analytics
 */
class ChatbotClient {
    constructor(httpClient, config, logger) {
        this.httpClient = httpClient;
        this.config = config;
        this.logger = logger;
    }
    // ==================== Configuration Management ====================
    /**
     * Get all chatbot configurations
     */
    async getConfigs(options = {}) {
        try {
            this.logger.debug('Fetching chatbot configurations');
            const params = new URLSearchParams();
            if (options.limit)
                params.append('limit', options.limit.toString());
            if (options.offset)
                params.append('offset', options.offset.toString());
            if (options.sortBy)
                params.append('sortBy', options.sortBy);
            if (options.sortOrder)
                params.append('sortOrder', options.sortOrder);
            const response = await this.httpClient.get(`/chatbot/configs?${params.toString()}`);
            this.logger.debug('Chatbot configurations fetched', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to fetch chatbot configurations', error);
            throw error;
        }
    }
    /**
     * Get a specific chatbot configuration
     */
    async getConfig(configId) {
        try {
            this.logger.debug('Fetching chatbot configuration', { configId });
            const endpoint = configId ? `/chatbot/config/${configId}` : '/chatbot/config';
            const response = await this.httpClient.get(endpoint);
            this.logger.debug('Chatbot configuration fetched', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to fetch chatbot configuration', error);
            throw error;
        }
    }
    /**
     * Create a new chatbot configuration
     */
    async createConfig(config) {
        try {
            this.logger.debug('Creating chatbot configuration', config);
            const response = await this.httpClient.post('/chatbot/config', config);
            this.logger.debug('Chatbot configuration created', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to create chatbot configuration', error);
            throw error;
        }
    }
    /**
     * Update an existing chatbot configuration
     */
    async updateConfig(configId, updates) {
        try {
            this.logger.debug('Updating chatbot configuration', { configId, updates });
            const response = await this.httpClient.put(`/chatbot/config/${configId}`, updates);
            this.logger.debug('Chatbot configuration updated', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to update chatbot configuration', error);
            throw error;
        }
    }
    /**
     * Delete a chatbot configuration
     */
    async deleteConfig(configId) {
        try {
            this.logger.debug('Deleting chatbot configuration', { configId });
            const response = await this.httpClient.delete(`/chatbot/config/${configId}`);
            this.logger.debug('Chatbot configuration deleted', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to delete chatbot configuration', error);
            throw error;
        }
    }
    // ==================== Conversation Management ====================
    /**
     * Get all conversations
     */
    async getConversations(options = {}) {
        try {
            this.logger.debug('Fetching conversations');
            const params = new URLSearchParams();
            if (options.limit)
                params.append('limit', options.limit.toString());
            if (options.offset)
                params.append('offset', options.offset.toString());
            if (options.sortBy)
                params.append('sortBy', options.sortBy);
            if (options.sortOrder)
                params.append('sortOrder', options.sortOrder);
            if (options.filters) {
                Object.entries(options.filters).forEach(([key, value]) => {
                    params.append(key, String(value));
                });
            }
            const response = await this.httpClient.get(`/chatbot/conversations?${params.toString()}`);
            this.logger.debug('Conversations fetched', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to fetch conversations', error);
            throw error;
        }
    }
    /**
     * Create a new conversation
     */
    async createConversation(data) {
        try {
            this.logger.debug('Creating conversation', data);
            const response = await this.httpClient.post('/chatbot/conversation', data);
            this.logger.debug('Conversation created', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to create conversation', error);
            throw error;
        }
    }
    // ==================== Messaging ====================
    /**
     * Send a message to the chatbot
     */
    async sendMessage(message, options = {}) {
        try {
            this.logger.debug('Sending message to chatbot', { message, options });
            const response = await this.httpClient.post('/chatbot/send', {
                message,
                sessionId: options.sessionId,
                userId: options.userId,
                metadata: options.metadata,
            });
            this.logger.debug('Message sent successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to send message', error);
            throw error;
        }
    }
    /**
     * Get messages from a conversation
     */
    async getMessages(conversationId, options = {}) {
        try {
            this.logger.debug('Fetching messages', { conversationId });
            const params = new URLSearchParams();
            if (options.limit)
                params.append('limit', options.limit.toString());
            if (options.offset)
                params.append('offset', options.offset.toString());
            if (options.sortBy)
                params.append('sortBy', options.sortBy);
            if (options.sortOrder)
                params.append('sortOrder', options.sortOrder);
            const response = await this.httpClient.get(`/chatbot/conversation/${conversationId}/messages?${params.toString()}`);
            this.logger.debug('Messages fetched', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to fetch messages', error);
            throw error;
        }
    }
    /**
     * Send a message in a specific conversation
     */
    async sendMessageInConversation(conversationId, message, metadata) {
        try {
            this.logger.debug('Sending message in conversation', { conversationId, message });
            const response = await this.httpClient.post(`/chatbot/conversation/${conversationId}/message`, {
                message,
                metadata,
            });
            this.logger.debug('Message sent in conversation', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to send message in conversation', error);
            throw error;
        }
    }
    /**
     * Get conversation history
     */
    async getHistory(conversationId) {
        try {
            this.logger.debug('Fetching conversation history', { conversationId });
            const response = await this.httpClient.get(`/chatbot/conversation/${conversationId}/history`);
            this.logger.debug('Conversation history fetched', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to fetch conversation history', error);
            throw error;
        }
    }
    /**
     * Provide feedback on a message
     */
    async provideFeedback(feedback) {
        try {
            this.logger.debug('Providing message feedback', feedback);
            const response = await this.httpClient.post('/chatbot/feedback', feedback);
            this.logger.debug('Feedback submitted', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to submit feedback', error);
            throw error;
        }
    }
    // ==================== Document Management ====================
    /**
     * Upload a document to the chatbot knowledge base
     */
    async uploadDocument(options) {
        try {
            this.logger.debug('Uploading document', options);
            const formData = new FormData();
            if (options.type === 'file' && options.content) {
                formData.append('file', options.content, options.fileName);
            }
            else if (options.type === 'url' && options.url) {
                formData.append('url', options.url);
            }
            else if (options.type === 'text' && options.content) {
                formData.append('content', options.content);
            }
            formData.append('type', options.type);
            if (options.metadata) {
                formData.append('metadata', JSON.stringify(options.metadata));
            }
            const response = await this.httpClient.post('/chatbot/document', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            this.logger.debug('Document uploaded', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to upload document', error);
            throw error;
        }
    }
    /**
     * Get all documents in the knowledge base
     */
    async getDocuments(options = {}) {
        try {
            this.logger.debug('Fetching documents');
            const params = new URLSearchParams();
            if (options.limit)
                params.append('limit', options.limit.toString());
            if (options.offset)
                params.append('offset', options.offset.toString());
            if (options.sortBy)
                params.append('sortBy', options.sortBy);
            if (options.sortOrder)
                params.append('sortOrder', options.sortOrder);
            const response = await this.httpClient.get(`/chatbot/documents?${params.toString()}`);
            this.logger.debug('Documents fetched', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to fetch documents', error);
            throw error;
        }
    }
    /**
     * Delete a document from the knowledge base
     */
    async deleteDocument(documentId) {
        try {
            this.logger.debug('Deleting document', { documentId });
            const response = await this.httpClient.delete(`/chatbot/document/${documentId}`);
            this.logger.debug('Document deleted', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to delete document', error);
            throw error;
        }
    }
    /**
     * Process URLs for the knowledge base
     */
    async processUrls(urls) {
        try {
            this.logger.debug('Processing URLs', { urls });
            const response = await this.httpClient.post('/chatbot/process-urls', { urls });
            this.logger.debug('URLs processed', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to process URLs', error);
            throw error;
        }
    }
    /**
     * Upload avatar for the chatbot
     */
    async uploadAvatar(file, fileName) {
        try {
            this.logger.debug('Uploading chatbot avatar');
            const formData = new FormData();
            formData.append('avatar', file, fileName);
            const response = await this.httpClient.post('/chatbot/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            this.logger.debug('Avatar uploaded', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to upload avatar', error);
            throw error;
        }
    }
    /**
     * Get training data for the chatbot
     */
    async getTrainingData() {
        try {
            this.logger.debug('Fetching training data');
            const response = await this.httpClient.get('/chatbot/training-data');
            this.logger.debug('Training data fetched', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to fetch training data', error);
            throw error;
        }
    }
    // ==================== Analytics ====================
    /**
     * Get chatbot statistics
     */
    async getStats(filters) {
        try {
            this.logger.debug('Fetching chatbot stats', filters);
            const params = new URLSearchParams();
            if (filters?.startDate)
                params.append('startDate', filters.startDate);
            if (filters?.endDate)
                params.append('endDate', filters.endDate);
            if (filters?.userId)
                params.append('userId', filters.userId);
            const response = await this.httpClient.get(`/chatbot/stats?${params.toString()}`);
            this.logger.debug('Chatbot stats fetched', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to fetch chatbot stats', error);
            throw error;
        }
    }
}
exports.ChatbotClient = ChatbotClient;
//# sourceMappingURL=chatbot.js.map