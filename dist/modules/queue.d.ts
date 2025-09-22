import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
export interface QueueMessage {
    id?: string;
    body: any;
    attributes?: Record<string, string>;
    messageGroupId?: string;
    messageDeduplicationId?: string;
    delaySeconds?: number;
}
export interface SendMessageOptions {
    delaySeconds?: number;
    messageAttributes?: Record<string, {
        stringValue?: string;
        binaryValue?: Buffer;
        dataType: 'String' | 'Number' | 'Binary';
    }>;
    messageGroupId?: string;
    messageDeduplicationId?: string;
}
export interface ReceiveMessageOptions {
    maxMessages?: number;
    waitTimeSeconds?: number;
    visibilityTimeoutSeconds?: number;
    messageAttributeNames?: string[];
    receiveRequestAttemptId?: string;
}
export interface ReceivedMessage {
    messageId: string;
    receiptHandle: string;
    body: any;
    attributes?: Record<string, string>;
    messageAttributes?: Record<string, any>;
    md5OfBody: string;
    md5OfMessageAttributes?: string;
}
export interface CreateQueueOptions {
    delaySeconds?: number;
    maxReceiveCount?: number;
    messageRetentionPeriod?: number;
    receiveMessageWaitTimeSeconds?: number;
    visibilityTimeoutSeconds?: number;
    fifoQueue?: boolean;
    contentBasedDeduplication?: boolean;
    kmsKeyId?: string;
    tags?: Record<string, string>;
    deadLetterQueue?: {
        targetArn: string;
        maxReceiveCount: number;
    };
}
export interface QueueAttributes {
    approximateNumberOfMessages: number;
    approximateNumberOfMessagesNotVisible: number;
    approximateNumberOfMessagesDelayed: number;
    createdTimestamp: string;
    lastModifiedTimestamp: string;
    queueArn: string;
    approximateAgeOfOldestMessage?: number;
}
export interface QueueInfo {
    queueUrl: string;
    queueName: string;
    attributes: QueueAttributes;
    tags?: Record<string, string>;
}
export declare class QueueClient {
    private httpClient;
    private config;
    private logger;
    constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger);
    /**
     * Send a message to a queue
     */
    send(queueUrl: string, message: any, options?: SendMessageOptions): Promise<{
        messageId: string;
        md5OfBody: string;
        md5OfMessageAttributes?: string;
        sequenceNumber?: string;
    }>;
    /**
     * Send multiple messages to a queue
     */
    sendBatch(queueUrl: string, messages: Array<QueueMessage & SendMessageOptions>): Promise<{
        successful: Array<{
            id: string;
            messageId: string;
            md5OfBody: string;
            md5OfMessageAttributes?: string;
            sequenceNumber?: string;
        }>;
        failed: Array<{
            id: string;
            senderFault: boolean;
            code: string;
            message: string;
        }>;
    }>;
    /**
     * Receive messages from a queue
     */
    receive(queueUrl: string, options?: ReceiveMessageOptions): Promise<ReceivedMessage[]>;
    /**
     * Delete a message from a queue
     */
    delete(queueUrl: string, receiptHandle: string): Promise<void>;
    /**
     * Delete multiple messages from a queue
     */
    deleteBatch(queueUrl: string, entries: Array<{
        id: string;
        receiptHandle: string;
    }>): Promise<{
        successful: Array<{
            id: string;
        }>;
        failed: Array<{
            id: string;
            senderFault: boolean;
            code: string;
            message: string;
        }>;
    }>;
    /**
     * Create a new queue
     */
    createQueue(queueName: string, options?: CreateQueueOptions): Promise<{
        queueUrl: string;
    }>;
    /**
     * Delete a queue
     */
    deleteQueue(queueUrl: string): Promise<void>;
    /**
     * List all queues
     */
    listQueues(prefix?: string): Promise<string[]>;
    /**
     * Get queue URL by name
     */
    getQueueUrl(queueName: string): Promise<string>;
    /**
     * Get queue attributes
     */
    getQueueAttributes(queueUrl: string): Promise<QueueAttributes>;
    /**
     * Set queue attributes
     */
    setQueueAttributes(queueUrl: string, attributes: Partial<{
        delaySeconds: number;
        maxReceiveCount: number;
        messageRetentionPeriod: number;
        receiveMessageWaitTimeSeconds: number;
        visibilityTimeoutSeconds: number;
    }>): Promise<void>;
    /**
     * Purge queue (delete all messages)
     */
    purgeQueue(queueUrl: string): Promise<void>;
    /**
     * Change message visibility timeout
     */
    changeMessageVisibility(queueUrl: string, receiptHandle: string, visibilityTimeoutSeconds: number): Promise<void>;
    /**
     * Get queue statistics
     */
    getQueueStats(queueUrl: string): Promise<{
        messageCount: number;
        messagesInFlight: number;
        messagesDelayed: number;
        oldestMessageAge: number;
        averageMessageSize: number;
        messagesPerSecond: number;
    }>;
    private parseMessageBody;
}
//# sourceMappingURL=queue.d.ts.map