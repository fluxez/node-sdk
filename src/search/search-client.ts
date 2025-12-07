import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import {
  SearchQuery,
  SearchResult,
  VectorSearchQuery,
  VectorSearchResult,
  SearchOptions,
  AggregationQuery,
  AggregationResult,
  SuggestQuery,
  SuggestResult,
  UnifiedSearchQuery,
  UnifiedSearchResponse,
  SearchMode,
  ConfigureSearchOptions,
  SearchConfig,
  BulkIndexOptions,
} from './types';

export class SearchClient {
  private httpClient: AxiosInstance;
  private config: FluxezConfig;
  private logger: Logger;

  constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger) {
    this.httpClient = httpClient;
    this.config = config;
    this.logger = logger;
  }

  // ============================================
  // UNIFIED SEARCH (PostgreSQL pg_trgm + pgvector)
  // ============================================

  /**
   * Unified search - supports keyword, semantic (vector), and hybrid search modes
   * @param table - Table name to search in
   * @param query - Search query text
   * @param options - Search options including mode, columns, filters, etc.
   */
  public async unifiedSearch<T = any>(
    table: string,
    query: string,
    options: {
      mode?: SearchMode;
      columns?: string[];
      limit?: number;
      offset?: number;
      filters?: Record<string, any>;
      highlight?: boolean;
      threshold?: number;
    } = {}
  ): Promise<UnifiedSearchResponse<T>> {
    this.logger.debug('Executing unified search', { table, query, options });

    const searchQuery: UnifiedSearchQuery = {
      table,
      query,
      mode: options.mode || 'hybrid',
      columns: options.columns,
      limit: options.limit || 20,
      offset: options.offset || 0,
      filters: options.filters,
      highlight: options.highlight !== false,
      threshold: options.threshold || 0.3,
    };

    const response = await this.httpClient.post('/search/query', searchQuery);

    return {
      success: response.data.success,
      results: response.data.results || [],
      total: response.data.total || 0,
      query: response.data.query,
      mode: response.data.mode,
      executionTimeMs: response.data.executionTimeMs,
    };
  }

  /**
   * Keyword search - uses PostgreSQL pg_trgm for fuzzy text matching
   * @param table - Table name to search in
   * @param query - Search query text
   * @param options - Search options
   */
  public async keywordSearch<T = any>(
    table: string,
    query: string,
    options: Omit<Parameters<typeof this.unifiedSearch>[2], 'mode'> = {}
  ): Promise<UnifiedSearchResponse<T>> {
    return this.unifiedSearch<T>(table, query, { ...options, mode: 'keyword' });
  }

  /**
   * Semantic search - uses PostgreSQL pgvector for AI-powered similarity search
   * @param table - Table name to search in
   * @param query - Search query text (will be converted to embedding)
   * @param options - Search options
   */
  public async semanticSearch<T = any>(
    table: string,
    query: string,
    options: Omit<Parameters<typeof this.unifiedSearch>[2], 'mode'> = {}
  ): Promise<UnifiedSearchResponse<T>> {
    return this.unifiedSearch<T>(table, query, { ...options, mode: 'semantic' });
  }

  /**
   * Hybrid search - combines keyword and semantic search with RRF ranking
   * @param table - Table name to search in
   * @param query - Search query text
   * @param options - Search options
   */
  public async hybridSearch<T = any>(
    table: string,
    query: string,
    options: Omit<Parameters<typeof this.unifiedSearch>[2], 'mode'> = {}
  ): Promise<UnifiedSearchResponse<T>> {
    return this.unifiedSearch<T>(table, query, { ...options, mode: 'hybrid' });
  }

  /**
   * Configure search for a table - sets up indexes for full-text and vector search
   * @param table - Table name to configure
   * @param options - Configuration options
   */
  public async configureSearch(
    table: string,
    options: ConfigureSearchOptions
  ): Promise<{ success: boolean; config: SearchConfig }> {
    this.logger.debug('Configuring search', { table, options });

    const response = await this.httpClient.post('/search/configure', {
      table,
      fullTextColumns: options.fullTextColumns,
      semanticColumns: options.semanticColumns,
      vectorDimension: options.vectorDimension || 1536,
    });

    return response.data;
  }

  /**
   * Get search configuration for a table
   * @param table - Table name
   */
  public async getSearchConfig(table: string): Promise<SearchConfig | null> {
    const response = await this.httpClient.get(`/search/config/${table}`);
    return response.data?.config || null;
  }

  /**
   * Index a single document for semantic search
   * @param table - Table name
   * @param recordId - Record ID to index
   * @param content - Optional content to index (auto-extracted if not provided)
   */
  public async indexDocument(
    table: string,
    recordId: string,
    content?: string
  ): Promise<{ success: boolean; message: string }> {
    this.logger.debug('Indexing document', { table, recordId });

    const response = await this.httpClient.post('/search/index', {
      table,
      recordId,
      content,
    });

    return response.data;
  }

  /**
   * Bulk index all unindexed documents in a table
   * @param table - Table name
   * @param options - Bulk index options
   */
  public async bulkIndex(
    table: string,
    options: BulkIndexOptions = {}
  ): Promise<{ success: boolean; indexed: number; failed: number }> {
    this.logger.debug('Bulk indexing', { table, options });

    const response = await this.httpClient.post('/search/bulk-index', {
      table,
      columns: options.columns,
      reindex: options.reindex || false,
    });

    return response.data;
  }

  /**
   * Get search service status
   */
  public async getStatus(): Promise<{
    keywordSearchAvailable: boolean;
    semanticSearchAvailable: boolean;
    extensions: {
      pg_trgm: boolean;
      pgvector: boolean;
      unaccent: boolean;
    };
  }> {
    const response = await this.httpClient.get('/search/status');
    return response.data;
  }

  // ============================================
  // LEGACY ELASTICSEARCH-STYLE SEARCH
  // (Kept for backward compatibility)
  // ============================================

  /**
   * Full-text search (legacy Elasticsearch-style)
   * @deprecated Use unifiedSearch() instead
   */
  public async search<T = any>(query: SearchQuery): Promise<SearchResult<T>> {
    this.logger.debug('Executing search', query);

    const response = await this.httpClient.post('/search', query);

    return {
      hits: response.data.hits || [],
      total: response.data.total || 0,
      took: response.data.took,
      aggregations: response.data.aggregations,
      suggestions: response.data.suggestions,
    };
  }

  /**
   * Vector similarity search (legacy)
   * @deprecated Use semanticSearch() instead
   */
  public async vectorSearch<T = any>(query: VectorSearchQuery): Promise<VectorSearchResult<T>> {
    this.logger.debug('Executing vector search', query);

    const response = await this.httpClient.post('/search/vector', query);

    return {
      hits: response.data.hits || [],
      total: response.data.total || 0,
      took: response.data.took,
    };
  }

  /**
   * Search with simple string query (legacy)
   * @deprecated Use keywordSearch() instead
   */
  public async query<T = any>(
    q: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<T>> {
    const { highlight, ...rest } = options;
    const searchQuery: SearchQuery = {
      query: q,
      ...rest,
    };

    if (highlight === true) {
      searchQuery.highlight = {
        fields: options.fields?.reduce((acc, field) => ({ ...acc, [field]: {} }), {}) || {},
        preTags: ['<mark>'],
        postTags: ['</mark>'],
      };
    } else if (highlight && typeof highlight === 'object') {
      searchQuery.highlight = highlight;
    }

    return this.search<T>(searchQuery);
  }

  /**
   * Multi-match search across multiple fields (legacy)
   * @deprecated Use unifiedSearch() with columns option instead
   */
  public async multiMatch<T = any>(
    query: string,
    fields: string[],
    options: SearchOptions = {}
  ): Promise<SearchResult<T>> {
    const { highlight, ...rest } = options;
    const searchQuery: SearchQuery = {
      query,
      fields,
      type: 'multi_match',
      ...rest,
    };

    if (highlight === true) {
      searchQuery.highlight = {
        fields: fields.reduce((acc, field) => ({ ...acc, [field]: {} }), {}),
        preTags: ['<mark>'],
        postTags: ['</mark>'],
      };
    } else if (highlight && typeof highlight === 'object') {
      searchQuery.highlight = highlight;
    }

    return this.search<T>(searchQuery);
  }

  /**
   * Fuzzy search (legacy)
   * @deprecated Use keywordSearch() instead - pg_trgm provides fuzzy matching
   */
  public async fuzzy<T = any>(
    field: string,
    value: string,
    fuzziness: number | 'AUTO' = 'AUTO',
    options: SearchOptions = {}
  ): Promise<SearchResult<T>> {
    const { highlight, ...rest } = options;
    const searchQuery: SearchQuery = {
      query: value,
      fields: [field],
      type: 'fuzzy',
      fuzziness,
      ...rest,
    };
    return this.search<T>(searchQuery);
  }

  /**
   * Aggregation query (legacy)
   */
  public async aggregate(query: AggregationQuery): Promise<AggregationResult> {
    const response = await this.httpClient.post('/search/aggregate', query);
    return response.data;
  }

  /**
   * Get search suggestions (legacy)
   */
  public async suggest(query: SuggestQuery): Promise<SuggestResult> {
    const response = await this.httpClient.post('/search/suggest', query);
    return response.data;
  }

  /**
   * Autocomplete search (legacy)
   */
  public async autocomplete(
    field: string,
    prefix: string,
    options: { size?: number; fuzzy?: boolean } = {}
  ): Promise<string[]> {
    const result = await this.suggest({
      text: prefix,
      field,
      type: 'completion',
      size: options.size || 10,
      fuzzy: options.fuzzy,
    });

    return result.suggestions || [];
  }
}
