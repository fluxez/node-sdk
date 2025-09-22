"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueClient = void 0;
class QueueClient {
    constructor(httpClient, config, logger) {
        this.httpClient = httpClient;
        this.config = config;
        this.logger = logger;
    }
    /**
     * Send a message to a queue
     */
    async send(queueUrl, message, options = {}) {
        try {
            this.logger.debug('Sending message to queue', { queueUrl, messageType: typeof message });
            const messageData = {
                queueUrl,
                messageBody: typeof message === 'string' ? message : JSON.stringify(message),
                ...options,
            };
            const response = await this.httpClient.post('/queue/send', messageData);
            this.logger.debug('Message sent successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to send message', error);
            throw error;
        }
    }
    /**
     * Send multiple messages to a queue
     */
    async sendBatch(queueUrl, messages) {
        try {
            this.logger.debug('Sending batch messages to queue', { queueUrl, messageCount: messages.length });
            const batchData = {
                queueUrl,
                entries: messages.map((msg, index) => ({
                    id: msg.id || `msg-${index}`,
                    messageBody: typeof msg.body === 'string' ? msg.body : JSON.stringify(msg.body),
                    delaySeconds: msg.delaySeconds,
                    messageAttributes: msg.messageAttributes,
                    messageGroupId: msg.messageGroupId,
                    messageDeduplicationId: msg.messageDeduplicationId,
                })),
            };
            const response = await this.httpClient.post('/queue/send-batch', batchData);
            this.logger.debug('Batch messages sent', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to send batch messages', error);
            throw error;
        }
    }
    /**
     * Receive messages from a queue
     */
    async receive(queueUrl, options = {}) {
        try {
            this.logger.debug('Receiving messages from queue', { queueUrl, options });
            const response = await this.httpClient.post('/queue/receive', {
                queueUrl,
                maxMessages: options.maxMessages || 1,
                waitTimeSeconds: options.waitTimeSeconds || 0,
                visibilityTimeoutSeconds: options.visibilityTimeoutSeconds,
                messageAttributeNames: options.messageAttributeNames || ['All'],
                receiveRequestAttemptId: options.receiveRequestAttemptId,
            });
            const messages = response.data.data;
            this.logger.debug('Messages received', { count: messages.length });
            // Parse JSON message bodies
            return messages.map(msg => ({
                ...msg,
                body: this.parseMessageBody(msg.body),
            }));
        }
        catch (error) {
            this.logger.error('Failed to receive messages', error);
            throw error;
        }
    }
    /**
     * Delete a message from a queue
     */
    async delete(queueUrl, receiptHandle) {
        try {
            this.logger.debug('Deleting message from queue', { queueUrl, receiptHandle });
            await this.httpClient.post('/queue/delete', {
                queueUrl,
                receiptHandle,
            });
            this.logger.debug('Message deleted successfully');
        }
        catch (error) {
            this.logger.error('Failed to delete message', error);
            throw error;
        }
    }
    /**
     * Delete multiple messages from a queue
     */
    async deleteBatch(queueUrl, entries) {
        try {
            this.logger.debug('Deleting batch messages from queue', { queueUrl, count: entries.length });
            const response = await this.httpClient.post('/queue/delete-batch', {
                queueUrl,
                entries,
            });
            this.logger.debug('Batch delete completed', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to delete batch messages', error);
            throw error;
        }
    }
    /**
     * Create a new queue
     */
    async createQueue(queueName, options = {}) {
        try {
            this.logger.debug('Creating queue', { queueName, options });
            const queueData = {
                queueName,
                attributes: {
                    DelaySeconds: options.delaySeconds?.toString(),
                    MaxReceiveCount: options.maxReceiveCount?.toString(),
                    MessageRetentionPeriod: options.messageRetentionPeriod?.toString(),
                    ReceiveMessageWaitTimeSeconds: options.receiveMessageWaitTimeSeconds?.toString(),
                    VisibilityTimeout: options.visibilityTimeoutSeconds?.toString(),
                    FifoQueue: options.fifoQueue?.toString(),
                    ContentBasedDeduplication: options.contentBasedDeduplication?.toString(),
                    KmsMasterKeyId: options.kmsKeyId,
                },
                tags: options.tags,
                deadLetterQueue: options.deadLetterQueue,
            };
            // Remove undefined values
            Object.keys(queueData.attributes).forEach(key => {
                if (queueData.attributes[key] === undefined) {
                    delete queueData.attributes[key];
                }
            });
            const response = await this.httpClient.post('/queue/create', queueData);
            this.logger.debug('Queue created successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to create queue', error);
            throw error;
        }
    }
    /**
     * Delete a queue
     */
    async deleteQueue(queueUrl) {
        try {
            this.logger.debug('Deleting queue', { queueUrl });
            await this.httpClient.delete('/queue/delete-queue', {
                data: { queueUrl },
            });
            this.logger.debug('Queue deleted successfully');
        }
        catch (error) {
            this.logger.error('Failed to delete queue', error);
            throw error;
        }
    }
    /**
     * List all queues
     */
    async listQueues(prefix) {
        try {
            this.logger.debug('Listing queues', { prefix });
            const response = await this.httpClient.get('/queue/list', { params: { prefix } });
            return response.data.data.queueUrls;
        }
        catch (error) {
            this.logger.error('Failed to list queues', error);
            throw error;
        }
    }
    /**
     * Get queue URL by name
     */
    async getQueueUrl(queueName) {
        try {
            this.logger.debug('Getting queue URL', { queueName });
            const response = await this.httpClient.get(`/queue/url/${queueName}`);
            return response.data.data.queueUrl;
        }
        catch (error) {
            this.logger.error('Failed to get queue URL', error);
            throw error;
        }
    }
    /**
     * Get queue attributes
     */
    async getQueueAttributes(queueUrl) {
        try {
            this.logger.debug('Getting queue attributes', { queueUrl });
            const response = await this.httpClient.get('/queue/attributes', { params: { queueUrl } });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get queue attributes', error);
            throw error;
        }
    }
    /**
     * Set queue attributes
     */
    async setQueueAttributes(queueUrl, attributes) {
        try {
            this.logger.debug('Setting queue attributes', { queueUrl, attributes });
            const attributeMap = {
                DelaySeconds: attributes.delaySeconds?.toString(),
                MaxReceiveCount: attributes.maxReceiveCount?.toString(),
                MessageRetentionPeriod: attributes.messageRetentionPeriod?.toString(),
                ReceiveMessageWaitTimeSeconds: attributes.receiveMessageWaitTimeSeconds?.toString(),
                VisibilityTimeout: attributes.visibilityTimeoutSeconds?.toString(),
            };
            // Remove undefined values
            Object.keys(attributeMap).forEach(key => {
                if (attributeMap[key] === undefined) {
                    delete attributeMap[key];
                }
            });
            await this.httpClient.put('/queue/attributes', {
                queueUrl,
                attributes: attributeMap,
            });
            this.logger.debug('Queue attributes updated successfully');
        }
        catch (error) {
            this.logger.error('Failed to set queue attributes', error);
            throw error;
        }
    }
    /**
     * Purge queue (delete all messages)
     */
    async purgeQueue(queueUrl) {
        try {
            this.logger.debug('Purging queue', { queueUrl });
            await this.httpClient.post('/queue/purge', {
                queueUrl,
            });
            this.logger.debug('Queue purged successfully');
        }
        catch (error) {
            this.logger.error('Failed to purge queue', error);
            throw error;
        }
    }
    /**
     * Change message visibility timeout
     */
    async changeMessageVisibility(queueUrl, receiptHandle, visibilityTimeoutSeconds) {
        try {
            this.logger.debug('Changing message visibility', {
                queueUrl,
                receiptHandle,
                visibilityTimeoutSeconds
            });
            await this.httpClient.post('/queue/change-visibility', {
                queueUrl,
                receiptHandle,
                visibilityTimeout: visibilityTimeoutSeconds,
            });
            this.logger.debug('Message visibility changed successfully');
        }
        catch (error) {
            this.logger.error('Failed to change message visibility', error);
            throw error;
        }
    }
    /**
     * Get queue statistics
     */
    async getQueueStats(queueUrl) {
        try {
            const response = await this.httpClient.get('/queue/stats', {
                params: { queueUrl },
            });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get queue stats', error);
            throw error;
        }
    }
    // Helper methods
    parseMessageBody(body) {
        if (typeof body === 'string') {
            try {
                return JSON.parse(body);
            }
            catch {
                return body; // Return as string if not valid JSON
            }
        }
        return body;
    }
}
exports.QueueClient = QueueClient;
//# sourceMappingURL=queue.js.map