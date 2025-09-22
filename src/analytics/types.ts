export type AggregationType = 'count' | 'sum' | 'avg' | 'min' | 'max' | 
                              'median' | 'percentile' | 'cardinality' | 'stddev';

export interface EventData {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp?: string;
  context?: {
    ip?: string;
    userAgent?: string;
    referrer?: string;
    page?: string;
    browser?: string;
    os?: string;
    device?: string;
    country?: string;
    city?: string;
  };
}

export interface AnalyticsQuery {
  metric: string;
  dimensions?: string[];
  timeRange?: {
    start?: string;
    end?: string;
    days?: number;
    hours?: number;
  };
  interval?: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
  aggregation?: AggregationType;
  filters?: Record<string, any>;
  groupBy?: string[];
  orderBy?: { [field: string]: 'asc' | 'desc' };
  limit?: number;
  offset?: number;
}

export interface AnalyticsResult {
  data: Array<{
    timestamp?: string;
    value: number;
    dimensions?: Record<string, any>;
  }>;
  metadata?: {
    query: AnalyticsQuery;
    executionTime: number;
    totalRows: number;
  };
}

export interface TimeSeriesQuery {
  metric: string;
  timeRange: {
    start?: string;
    end?: string;
    days?: number;
  };
  interval: 'minute' | 'hour' | 'day' | 'week' | 'month';
  aggregation?: AggregationType;
  groupBy?: string[];
  filters?: Record<string, any>;
}

export interface TimeSeriesResult {
  data: Array<{
    timestamp: string;
    value: number;
    dimensions?: Record<string, any>;
  }>;
  metadata?: Record<string, any>;
}

export interface FunnelQuery {
  steps: Array<{
    event: string;
    filters?: Record<string, any>;
  }>;
  timeRange: {
    start: string;
    end: string;
  };
  windowSize?: number;
  windowUnit?: 'minutes' | 'hours' | 'days';
}

export interface FunnelResult {
  steps: Array<{
    event: string;
    count: number;
    conversionRate: number;
    dropoffRate: number;
  }>;
  overallConversion: number;
}

export interface CohortQuery {
  cohortEvent: string;
  returnEvent: string;
  timeRange: {
    start: string;
    end: string;
  };
  cohortSize: 'day' | 'week' | 'month';
  periods: number;
}

export interface CohortResult {
  cohorts: Array<{
    date: string;
    size: number;
    retention: number[];
  }>;
}

export interface MetricQuery {
  name: string;
  aggregation: AggregationType;
  timeRange?: {
    start?: string;
    end?: string;
    days?: number;
  };
  filters?: Record<string, any>;
}

export interface MetricResult {
  value: number;
  change?: {
    absolute: number;
    percentage: number;
  };
  metadata?: Record<string, any>;
}