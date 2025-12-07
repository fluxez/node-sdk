import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import { SearchQuery, SearchResult, VectorSearchQuery, VectorSearchResult, SearchOptions, AggregationQuery, AggregationResult, SuggestQuery, SuggestResult, UnifiedSearchResponse, SearchMode, ConfigureSearchOptions, SearchConfig, BulkIndexOptions } from './types';
export declare class SearchClient {
    private httpClient;
    private config;
    private logger;
    constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger);
    /**
     * Unified search - supports keyword, semantic (vector), and hybrid search modes
     * @param table - Table name to search in
     * @param query - Search query text
     * @param options - Search options including mode, columns, filters, etc.
     */
    unifiedSearch<T = any>(table: string, query: string, options?: {
        mode?: SearchMode;
        columns?: string[];
        limit?: number;
        offset?: number;
        filters?: Record<string, any>;
        highlight?: boolean;
        threshold?: number;
    }): Promise<UnifiedSearchResponse<T>>;
    /**
     * Keyword search - uses PostgreSQL pg_trgm for fuzzy text matching
     * @param table - Table name to search in
     * @param query - Search query text
     * @param options - Search options
     */
    keywordSearch<T = any>(table: string, query: string, options?: Omit<Parameters<typeof this.unifiedSearch>[2], 'mode'>): Promise<UnifiedSearchResponse<T>>;
    /**
     * Semantic search - uses PostgreSQL pgvector for AI-powered similarity search
     * @param table - Table name to search in
     * @param query - Search query text (will be converted to embedding)
     * @param options - Search options
     */
    semanticSearch<T = any>(table: string, query: string, options?: Omit<Parameters<typeof this.unifiedSearch>[2], 'mode'>): Promise<UnifiedSearchResponse<T>>;
    /**
     * Hybrid search - combines keyword and semantic search with RRF ranking
     * @param table - Table name to search in
     * @param query - Search query text
     * @param options - Search options
     */
    hybridSearch<T = any>(table: string, query: string, options?: Omit<Parameters<typeof this.unifiedSearch>[2], 'mode'>): Promise<UnifiedSearchResponse<T>>;
    /**
     * Configure search for a table - sets up indexes for full-text and vector search
     * @param table - Table name to configure
     * @param options - Configuration options
     */
    configureSearch(table: string, options: ConfigureSearchOptions): Promise<{
        success: boolean;
        config: SearchConfig;
    }>;
    /**
     * Get search configuration for a table
     * @param table - Table name
     */
    getSearchConfig(table: string): Promise<SearchConfig | null>;
    /**
     * Index a single document for semantic search
     * @param table - Table name
     * @param recordId - Record ID to index
     * @param content - Optional content to index (auto-extracted if not provided)
     */
    indexDocument(table: string, recordId: string, content?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Bulk index all unindexed documents in a table
     * @param table - Table name
     * @param options - Bulk index options
     */
    bulkIndex(table: string, options?: BulkIndexOptions): Promise<{
        success: boolean;
        indexed: number;
        failed: number;
    }>;
    /**
     * Get search service status
     */
    getStatus(): Promise<{
        keywordSearchAvailable: boolean;
        semanticSearchAvailable: boolean;
        extensions: {
            pg_trgm: boolean;
            pgvector: boolean;
            unaccent: boolean;
        };
    }>;
    /**
     * Full-text search (legacy Elasticsearch-style)
     * @deprecated Use unifiedSearch() instead
     */
    search<T = any>(query: SearchQuery): Promise<SearchResult<T>>;
    /**
     * Vector similarity search (legacy)
     * @deprecated Use semanticSearch() instead
     */
    vectorSearch<T = any>(query: VectorSearchQuery): Promise<VectorSearchResult<T>>;
    /**
     * Search with simple string query (legacy)
     * @deprecated Use keywordSearch() instead
     */
    query<T = any>(q: string, options?: SearchOptions): Promise<SearchResult<T>>;
    /**
     * Multi-match search across multiple fields (legacy)
     * @deprecated Use unifiedSearch() with columns option instead
     */
    multiMatch<T = any>(query: string, fields: string[], options?: SearchOptions): Promise<SearchResult<T>>;
    /**
     * Fuzzy search (legacy)
     * @deprecated Use keywordSearch() instead - pg_trgm provides fuzzy matching
     */
    fuzzy<T = any>(field: string, value: string, fuzziness?: number | 'AUTO', options?: SearchOptions): Promise<SearchResult<T>>;
    /**
     * Aggregation query (legacy)
     */
    aggregate(query: AggregationQuery): Promise<AggregationResult>;
    /**
     * Get search suggestions (legacy)
     */
    suggest(query: SuggestQuery): Promise<SuggestResult>;
    /**
     * Autocomplete search (legacy)
     */
    autocomplete(field: string, prefix: string, options?: {
        size?: number;
        fuzzy?: boolean;
    }): Promise<string[]>;
}
//# sourceMappingURL=search-client.d.ts.map