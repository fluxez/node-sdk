export interface SearchQuery {
  query: string;
  fields?: string[];
  type?: 'match' | 'multi_match' | 'match_phrase' | 'term' | 'terms' | 'prefix' | 
         'wildcard' | 'fuzzy' | 'range' | 'bool' | 'more_like_this';
  fuzziness?: number | 'AUTO';
  boost?: number;
  analyzer?: string;
  operator?: 'AND' | 'OR';
  minimumShouldMatch?: string | number;
  highlight?: {
    fields: Record<string, any>;
    preTags?: string[];
    postTags?: string[];
  };
  size?: number;
  from?: number;
  sort?: Array<{ [field: string]: 'asc' | 'desc' }>;
  aggregations?: Record<string, any>;
}

export interface SearchHit<T = any> {
  _id: string;
  _index: string;
  _score: number;
  _source: T;
  highlight?: Record<string, string[]>;
}

export interface SearchResult<T = any> {
  hits: SearchHit<T>[];
  total: number;
  took?: number;
  aggregations?: Record<string, any>;
  suggestions?: string[];
}

export interface VectorSearchQuery {
  vector: number[];
  collection: string;
  limit?: number;
  threshold?: number;
  filter?: Record<string, any>;
  includeVector?: boolean;
  includePayload?: boolean;
}

export interface VectorSearchHit<T = any> {
  id: string;
  score: number;
  payload?: T;
  vector?: number[];
}

export interface VectorSearchResult<T = any> {
  hits: VectorSearchHit<T>[];
  total: number;
  took?: number;
}

export interface SearchOptions {
  index?: string;
  fields?: string[];
  size?: number;
  from?: number;
  sort?: Array<{ [field: string]: 'asc' | 'desc' }>;
  highlight?: boolean | {
    fields: Record<string, any>;
    preTags?: string[];
    postTags?: string[];
  };
  aggregations?: Record<string, any>;
  filters?: Record<string, any>;
}

export interface AggregationQuery {
  field: string;
  type: 'terms' | 'sum' | 'avg' | 'min' | 'max' | 'count' | 
        'cardinality' | 'percentiles' | 'histogram' | 'date_histogram';
  size?: number;
  interval?: string | number;
  ranges?: Array<{ from?: number; to?: number; key?: string }>;
  subAggregations?: Record<string, AggregationQuery>;
}

export interface AggregationResult {
  buckets?: Array<{
    key: any;
    docCount: number;
    subAggregations?: Record<string, any>;
  }>;
  value?: number;
  values?: Record<string, number>;
}

export interface SuggestQuery {
  text: string;
  field: string;
  type?: 'term' | 'phrase' | 'completion';
  size?: number;
  fuzzy?: boolean;
  confidence?: number;
  maxEdits?: number;
  prefixLength?: number;
}

export interface SuggestResult {
  suggestions: string[];
  scores?: number[];
}

// ============================================
// UNIFIED SEARCH TYPES (PostgreSQL pg_trgm + pgvector)
// ============================================

export type SearchMode = 'keyword' | 'semantic' | 'hybrid';

export interface UnifiedSearchQuery {
  table: string;
  query: string;
  mode?: SearchMode;
  columns?: string[];
  limit?: number;
  offset?: number;
  filters?: Record<string, any>;
  highlight?: boolean;
  threshold?: number;
}

export interface UnifiedSearchHit<T = any> {
  id: string;
  score: number;
  data: T;
  highlights?: Record<string, string>;
  matchType: 'keyword' | 'semantic' | 'both';
}

export interface UnifiedSearchResponse<T = any> {
  success: boolean;
  results: UnifiedSearchHit<T>[];
  total: number;
  query: string;
  mode: SearchMode;
  executionTimeMs: number;
}

export interface ConfigureSearchOptions {
  fullTextColumns: string[];
  semanticColumns?: string[];
  vectorDimension?: number;
}

export interface SearchConfig {
  table: string;
  fullTextColumns: string[];
  semanticColumns: string[];
  vectorColumn: string;
  vectorDimension: number;
  hasFullTextIndex: boolean;
  hasVectorIndex: boolean;
}

export interface BulkIndexOptions {
  columns?: string[];
  reindex?: boolean;
}