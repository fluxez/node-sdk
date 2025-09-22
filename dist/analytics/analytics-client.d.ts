import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import { AnalyticsQuery, AnalyticsResult, EventData, TimeSeriesQuery, TimeSeriesResult, FunnelQuery, FunnelResult, CohortQuery, CohortResult, MetricQuery, MetricResult } from './types';
export declare class AnalyticsClient {
    private httpClient;
    private config;
    private logger;
    private eventQueue;
    private flushTimer?;
    constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger);
    /**
     * Track an analytics event
     */
    track(event: EventData): Promise<void>;
    /**
     * Track multiple events
     */
    trackBatch(events: EventData[]): Promise<void>;
    /**
     * Flush queued events
     */
    flush(): Promise<void>;
    /**
     * Execute analytics query
     */
    query(query: AnalyticsQuery): Promise<AnalyticsResult>;
    /**
     * Get time series data
     */
    timeSeries(query: TimeSeriesQuery): Promise<TimeSeriesResult>;
    /**
     * Get funnel analysis
     */
    funnel(query: FunnelQuery): Promise<FunnelResult>;
    /**
     * Get cohort analysis
     */
    cohort(query: CohortQuery): Promise<CohortResult>;
    /**
     * Get metric value
     */
    metric(query: MetricQuery): Promise<MetricResult>;
    /**
     * Get real-time analytics
     */
    realtime(metric: string): Promise<any>;
    /**
     * Get user analytics
     */
    userAnalytics(userId: string, options?: {
        metrics?: string[];
        timeRange?: {
            start: string;
            end: string;
        };
    }): Promise<any>;
    /**
     * Get session analytics
     */
    sessionAnalytics(sessionId: string): Promise<any>;
    /**
     * Get page analytics
     */
    pageAnalytics(page: string, options?: {
        timeRange?: {
            start: string;
            end: string;
        };
        metrics?: string[];
    }): Promise<any>;
    /**
     * Get conversion rate
     */
    conversionRate(startEvent: string, endEvent: string, options?: {
        timeRange?: {
            start: string;
            end: string;
        };
        filters?: Record<string, any>;
    }): Promise<number>;
    /**
     * Get retention analysis
     */
    retention(options: {
        cohortEvent: string;
        returnEvent: string;
        timeRange: {
            start: string;
            end: string;
        };
        interval: 'day' | 'week' | 'month';
    }): Promise<any>;
    /**
     * Export analytics data
     */
    export(query: AnalyticsQuery, format?: 'csv' | 'json'): Promise<any>;
    private startAutoFlush;
    private generateSessionId;
    /**
     * Clean up resources
     */
    destroy(): Promise<void>;
}
//# sourceMappingURL=analytics-client.d.ts.map