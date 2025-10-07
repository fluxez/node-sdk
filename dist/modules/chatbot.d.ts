import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
export interface ChatbotConfig {
    id?: string;
    name: string;
    description?: string;
    enabled: boolean;
    welcomeMessage?: string;
    placeholder?: string;
    primaryColor?: string;
    secondaryColor?: string;
    position?: 'bottom-right' | 'bottom-left';
    model?: string;
    temperature?: number;
    maxTokens?: number;
    language?: string;
    enableMultilingual?: boolean;
    enableFileUpload?: boolean;
    enableVoice?: boolean;
    customInstructions?: string;
    trainingData?: string;
    createdAt?: string;
    updatedAt?: string;
}
export interface ChatbotConversation {
    id: string;
    sessionId?: string;
    userId?: string;
    status: 'active' | 'closed' | 'archived';
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}
export interface ChatbotMessage {
    id: string;
    conversationId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata?: Record<string, any>;
    timestamp: string;
    createdAt: string;
}
export interface ChatbotSendMessageOptions {
    sessionId?: string;
    userId?: string;
    metadata?: Record<string, any>;
}
export interface ChatbotSendMessageResponse {
    message: ChatbotMessage;
    conversationId: string;
}
export interface ChatbotDocument {
    id: string;
    name: string;
    type: 'file' | 'url' | 'text';
    content?: string;
    url?: string;
    size?: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    metadata?: Record<string, any>;
    createdAt: string;
}
export interface UploadDocumentOptions {
    type: 'file' | 'url' | 'text';
    content?: string | Buffer;
    url?: string;
    fileName?: string;
    metadata?: Record<string, any>;
}
export interface ChatbotStats {
    totalConversations: number;
    totalMessages: number;
    activeConversations: number;
    averageResponseTime: number;
    satisfactionRate?: number;
    topQuestions?: Array<{
        question: string;
        count: number;
    }>;
}
export interface MessageFeedback {
    messageId: string;
    rating: 'positive' | 'negative';
    comment?: string;
}
export interface ListOptions {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, any>;
}
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
export declare class ChatbotClient {
    private httpClient;
    private config;
    private logger;
    constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger);
    /**
     * Get all chatbot configurations
     */
    getConfigs(options?: ListOptions): Promise<ChatbotConfig[]>;
    /**
     * Get a specific chatbot configuration
     */
    getConfig(configId?: string): Promise<ChatbotConfig>;
    /**
     * Create a new chatbot configuration
     */
    createConfig(config: Omit<ChatbotConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChatbotConfig>;
    /**
     * Update an existing chatbot configuration
     */
    updateConfig(configId: string, updates: Partial<Omit<ChatbotConfig, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ChatbotConfig>;
    /**
     * Delete a chatbot configuration
     */
    deleteConfig(configId: string): Promise<{
        success: boolean;
    }>;
    /**
     * Get all conversations
     */
    getConversations(options?: ListOptions): Promise<ChatbotConversation[]>;
    /**
     * Create a new conversation
     */
    createConversation(data: {
        sessionId?: string;
        userId?: string;
        metadata?: Record<string, any>;
    }): Promise<ChatbotConversation>;
    /**
     * Send a message to the chatbot
     */
    sendMessage(message: string, options?: ChatbotSendMessageOptions): Promise<ChatbotSendMessageResponse>;
    /**
     * Get messages from a conversation
     */
    getMessages(conversationId: string, options?: ListOptions): Promise<ChatbotMessage[]>;
    /**
     * Send a message in a specific conversation
     */
    sendMessageInConversation(conversationId: string, message: string, metadata?: Record<string, any>): Promise<ChatbotMessage>;
    /**
     * Get conversation history
     */
    getHistory(conversationId: string): Promise<{
        conversation: ChatbotConversation;
        messages: ChatbotMessage[];
    }>;
    /**
     * Provide feedback on a message
     */
    provideFeedback(feedback: MessageFeedback): Promise<{
        success: boolean;
    }>;
    /**
     * Upload a document to the chatbot knowledge base
     */
    uploadDocument(options: UploadDocumentOptions): Promise<ChatbotDocument>;
    /**
     * Get all documents in the knowledge base
     */
    getDocuments(options?: ListOptions): Promise<ChatbotDocument[]>;
    /**
     * Delete a document from the knowledge base
     */
    deleteDocument(documentId: string): Promise<{
        success: boolean;
    }>;
    /**
     * Process URLs for the knowledge base
     */
    processUrls(urls: string[]): Promise<{
        processed: number;
        failed: number;
        documents: ChatbotDocument[];
    }>;
    /**
     * Upload avatar for the chatbot
     */
    uploadAvatar(file: Buffer | Blob, fileName?: string): Promise<{
        url: string;
    }>;
    /**
     * Get training data for the chatbot
     */
    getTrainingData(): Promise<{
        data: string;
        documentCount: number;
    }>;
    /**
     * Get chatbot statistics
     */
    getStats(filters?: {
        startDate?: string;
        endDate?: string;
        userId?: string;
    }): Promise<ChatbotStats>;
}
//# sourceMappingURL=chatbot.d.ts.map