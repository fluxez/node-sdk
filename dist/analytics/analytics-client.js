"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsClient = void 0;
class AnalyticsClient {
    constructor(httpClient, config, logger) {
        this.eventQueue = [];
        this.httpClient = httpClient;
        this.config = config;
        this.logger = logger;
        // Start auto-flush if configured
        if (config.analytics?.flushInterval) {
            this.startAutoFlush(config.analytics.flushInterval);
        }
    }
    /**
     * Track an analytics event
     */
    async track(event) {
        this.logger.debug('Tracking event', event);
        // Add to queue
        this.eventQueue.push({
            ...event,
            timestamp: event.timestamp || new Date().toISOString(),
            sessionId: event.sessionId || this.generateSessionId(),
        });
        // Auto-flush if batch size reached
        const batchSize = this.config.analytics?.batchSize || 100;
        if (this.eventQueue.length >= batchSize) {
            await this.flush();
        }
    }
    /**
     * Track multiple events
     */
    async trackBatch(events) {
        for (const event of events) {
            await this.track(event);
        }
    }
    /**
     * Flush queued events
     */
    async flush() {
        if (this.eventQueue.length === 0)
            return;
        const events = [...this.eventQueue];
        this.eventQueue = [];
        try {
            await this.httpClient.post('/api/v1/analytics/track', { events });
            this.logger.info(`Flushed ${events.length} analytics events`);
        }
        catch (error) {
            // Re-queue events on failure
            this.eventQueue = events.concat(this.eventQueue);
            this.logger.error('Failed to flush analytics events', error);
            throw error;
        }
    }
    /**
     * Execute analytics query
     */
    async query(query) {
        this.logger.debug('Executing analytics query', query);
        const response = await this.httpClient.post('/api/v1/analytics/query', query);
        return response.data;
    }
    /**
     * Get time series data
     */
    async timeSeries(query) {
        const analyticsQuery = {
            metric: query.metric,
            timeRange: query.timeRange,
            interval: query.interval,
            groupBy: query.groupBy,
            filters: query.filters,
            aggregation: query.aggregation || 'count',
        };
        const result = await this.query(analyticsQuery);
        return {
            data: result.data.map((item) => ({
                timestamp: item.timestamp,
                value: item.value,
                dimensions: item.dimensions,
            })),
            metadata: result.metadata,
        };
    }
    /**
     * Get funnel analysis
     */
    async funnel(query) {
        const response = await this.httpClient.post('/api/v1/analytics/funnel', query);
        return response.data;
    }
    /**
     * Get cohort analysis
     */
    async cohort(query) {
        const response = await this.httpClient.post('/api/v1/analytics/cohort', query);
        return response.data;
    }
    /**
     * Get metric value
     */
    async metric(query) {
        const response = await this.httpClient.post('/api/v1/analytics/metric', query);
        return response.data;
    }
    /**
     * Get real-time analytics
     */
    async realtime(metric) {
        const response = await this.httpClient.get(`/api/v1/analytics/realtime/${metric}`);
        return response.data;
    }
    /**
     * Get user analytics
     */
    async userAnalytics(userId, options) {
        const response = await this.httpClient.get(`/api/v1/analytics/user/${userId}`, {
            params: options,
        });
        return response.data;
    }
    /**
     * Get session analytics
     */
    async sessionAnalytics(sessionId) {
        const response = await this.httpClient.get(`/api/v1/analytics/session/${sessionId}`);
        return response.data;
    }
    /**
     * Get page analytics
     */
    async pageAnalytics(page, options) {
        const response = await this.httpClient.post('/api/v1/analytics/page', {
            page,
            ...options,
        });
        return response.data;
    }
    /**
     * Get conversion rate
     */
    async conversionRate(startEvent, endEvent, options) {
        const response = await this.httpClient.post('/api/v1/analytics/conversion', {
            startEvent,
            endEvent,
            ...options,
        });
        return response.data.rate;
    }
    /**
     * Get retention analysis
     */
    async retention(options) {
        const response = await this.httpClient.post('/api/v1/analytics/retention', options);
        return response.data;
    }
    /**
     * Export analytics data
     */
    async export(query, format = 'json') {
        const response = await this.httpClient.post('/api/v1/analytics/export', {
            ...query,
            format,
        }, {
            responseType: format === 'csv' ? 'blob' : 'json',
        });
        return response.data;
    }
    // Helper methods
    startAutoFlush(interval) {
        this.flushTimer = setInterval(() => {
            this.flush().catch(error => {
                this.logger.error('Auto-flush failed', error);
            });
        }, interval);
    }
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Clean up resources
     */
    async destroy() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        await this.flush();
    }
}
exports.AnalyticsClient = AnalyticsClient;
//# sourceMappingURL=analytics-client.js.map