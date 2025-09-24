import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import {
  AnalyticsQuery,
  AnalyticsResult,
  EventData,
  TimeSeriesQuery,
  TimeSeriesResult,
  FunnelQuery,
  FunnelResult,
  CohortQuery,
  CohortResult,
  MetricQuery,
  MetricResult,
} from './types';

export class AnalyticsClient {
  private httpClient: AxiosInstance;
  private config: FluxezConfig;
  private logger: Logger;
  private eventQueue: EventData[] = [];
  private flushTimer?: NodeJS.Timeout;
  
  constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger) {
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
  public async track(event: EventData): Promise<void> {
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
  public async trackBatch(events: EventData[]): Promise<void> {
    for (const event of events) {
      await this.track(event);
    }
  }
  
  /**
   * Flush queued events
   */
  public async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;
    
    const events = [...this.eventQueue];
    this.eventQueue = [];
    
    try {
      await this.httpClient.post('/analytics/track', { events });
      this.logger.info(`Flushed ${events.length} analytics events`);
    } catch (error) {
      // Re-queue events on failure
      this.eventQueue = events.concat(this.eventQueue);
      this.logger.error('Failed to flush analytics events', error);
      throw error;
    }
  }
  
  /**
   * Execute analytics query
   */
  public async query(query: AnalyticsQuery): Promise<AnalyticsResult> {
    this.logger.debug('Executing analytics query', query);
    
    const response = await this.httpClient.post('/analytics/query', query);
    return response.data;
  }
  
  /**
   * Get time series data
   */
  public async timeSeries(query: TimeSeriesQuery): Promise<TimeSeriesResult> {
    const analyticsQuery: AnalyticsQuery = {
      metric: query.metric,
      timeRange: query.timeRange,
      interval: query.interval,
      groupBy: query.groupBy,
      filters: query.filters,
      aggregation: query.aggregation || 'count',
    };
    
    const result = await this.query(analyticsQuery);
    
    return {
      data: result.data.map((item: any) => ({
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
  public async funnel(query: FunnelQuery): Promise<FunnelResult> {
    const response = await this.httpClient.post('/analytics/funnel', query);
    return response.data;
  }
  
  /**
   * Get cohort analysis
   */
  public async cohort(query: CohortQuery): Promise<CohortResult> {
    const response = await this.httpClient.post('/analytics/cohort', query);
    return response.data;
  }
  
  /**
   * Get metric value
   */
  public async metric(query: MetricQuery): Promise<MetricResult> {
    const response = await this.httpClient.post('/analytics/metric', query);
    return response.data;
  }
  
  /**
   * Get real-time analytics
   */
  public async realtime(metric: string): Promise<any> {
    const response = await this.httpClient.get(`/analytics/realtime/${metric}`);
    return response.data;
  }
  
  /**
   * Get user analytics
   */
  public async userAnalytics(userId: string, options?: {
    metrics?: string[];
    timeRange?: { start: string; end: string };
  }): Promise<any> {
    const response = await this.httpClient.get(`/analytics/user/${userId}`, {
      params: options,
    });
    return response.data;
  }
  
  /**
   * Get session analytics
   */
  public async sessionAnalytics(sessionId: string): Promise<any> {
    const response = await this.httpClient.get(`/analytics/session/${sessionId}`);
    return response.data;
  }
  
  /**
   * Get page analytics
   */
  public async pageAnalytics(page: string, options?: {
    timeRange?: { start: string; end: string };
    metrics?: string[];
  }): Promise<any> {
    const response = await this.httpClient.post('/analytics/page', {
      page,
      ...options,
    });
    return response.data;
  }
  
  /**
   * Get conversion rate
   */
  public async conversionRate(
    startEvent: string,
    endEvent: string,
    options?: {
      timeRange?: { start: string; end: string };
      filters?: Record<string, any>;
    }
  ): Promise<number> {
    const response = await this.httpClient.post('/analytics/conversion', {
      startEvent,
      endEvent,
      ...options,
    });
    return response.data.rate;
  }
  
  /**
   * Get retention analysis
   */
  public async retention(options: {
    cohortEvent: string;
    returnEvent: string;
    timeRange: { start: string; end: string };
    interval: 'day' | 'week' | 'month';
  }): Promise<any> {
    const response = await this.httpClient.post('/analytics/retention', options);
    return response.data;
  }
  
  /**
   * Export analytics data
   */
  public async export(query: AnalyticsQuery, format: 'csv' | 'json' = 'json'): Promise<any> {
    const response = await this.httpClient.post('/analytics/export', {
      ...query,
      format,
    }, {
      responseType: format === 'csv' ? 'blob' : 'json',
    });
    return response.data;
  }
  
  // Helper methods
  
  private startAutoFlush(interval: number): void {
    this.flushTimer = setInterval(() => {
      this.flush().catch(error => {
        this.logger.error('Auto-flush failed', error);
      });
    }, interval);
  }
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Clean up resources
   */
  public async destroy(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    await this.flush();
  }
}