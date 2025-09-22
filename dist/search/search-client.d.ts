import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import { SearchQuery, SearchResult, VectorSearchQuery, VectorSearchResult, SearchOptions, AggregationQuery, AggregationResult, SuggestQuery, SuggestResult } from './types';
export declare class SearchClient {
    private httpClient;
    private config;
    private logger;
    constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger);
    /**
     * Full-text search
     */
    search<T = any>(query: SearchQuery): Promise<SearchResult<T>>;
    /**
     * Vector similarity search
     */
    vectorSearch<T = any>(query: VectorSearchQuery): Promise<VectorSearchResult<T>>;
    /**
     * Search with simple string query
     */
    query<T = any>(q: string, options?: SearchOptions): Promise<SearchResult<T>>;
    /**
     * Multi-match search across multiple fields
     */
    multiMatch<T = any>(query: string, fields: string[], options?: SearchOptions): Promise<SearchResult<T>>;
    /**
     * Match phrase search
     */
    matchPhrase<T = any>(field: string, phrase: string, options?: SearchOptions): Promise<SearchResult<T>>;
    /**
     * Term search (exact match)
     */
    term<T = any>(field: string, value: any, options?: SearchOptions): Promise<SearchResult<T>>;
    /**
     * Terms search (match any of the values)
     */
    terms<T = any>(field: string, values: any[], options?: SearchOptions): Promise<SearchResult<T>>;
    /**
     * Range search
     */
    range<T = any>(field: string, range: {
        gte?: any;
        gt?: any;
        lte?: any;
        lt?: any;
    }, options?: SearchOptions): Promise<SearchResult<T>>;
    /**
     * Prefix search
     */
    prefix<T = any>(field: string, prefix: string, options?: SearchOptions): Promise<SearchResult<T>>;
    /**
     * Wildcard search
     */
    wildcard<T = any>(field: string, pattern: string, options?: SearchOptions): Promise<SearchResult<T>>;
    /**
     * Fuzzy search
     */
    fuzzy<T = any>(field: string, value: string, fuzziness?: number | 'AUTO', options?: SearchOptions): Promise<SearchResult<T>>;
    /**
     * Boolean search with must, should, must_not clauses
     */
    bool<T = any>(clauses: {
        must?: SearchQuery[];
        should?: SearchQuery[];
        mustNot?: SearchQuery[];
        filter?: SearchQuery[];
    }, options?: SearchOptions): Promise<SearchResult<T>>;
    /**
     * Aggregation query
     */
    aggregate(query: AggregationQuery): Promise<AggregationResult>;
    /**
     * Get search suggestions
     */
    suggest(query: SuggestQuery): Promise<SuggestResult>;
    /**
     * Autocomplete search
     */
    autocomplete(field: string, prefix: string, options?: {
        size?: number;
        fuzzy?: boolean;
    }): Promise<string[]>;
    /**
     * More like this - find similar documents
     */
    moreLikeThis<T = any>(documentId: string, options?: SearchOptions): Promise<SearchResult<T>>;
    /**
     * Highlight search terms in results
     */
    searchWithHighlight<T = any>(query: string, fields: string[], options?: SearchOptions): Promise<SearchResult<T>>;
    /**
     * Count matching documents
     */
    count(query: SearchQuery): Promise<number>;
    /**
     * Delete documents by query
     */
    deleteByQuery(query: SearchQuery): Promise<{
        deleted: number;
    }>;
    /**
     * Reindex documents
     */
    reindex(source: string, destination: string, query?: SearchQuery): Promise<{
        indexed: number;
    }>;
    /**
     * Create a search index
     */
    createIndex(name: string, mappings?: any, settings?: any): Promise<{
        created: boolean;
    }>;
    /**
     * Delete a search index
     */
    deleteIndex(name: string): Promise<{
        deleted: boolean;
    }>;
    /**
     * Get index information
     */
    getIndex(name: string): Promise<any>;
}
//# sourceMappingURL=search-client.d.ts.map