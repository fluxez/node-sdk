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
  
  /**
   * Full-text search
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
   * Vector similarity search
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
   * Search with simple string query
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
   * Multi-match search across multiple fields
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
   * Match phrase search
   */
  public async matchPhrase<T = any>(
    field: string,
    phrase: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<T>> {
    const { highlight, ...rest } = options;
    const searchQuery: SearchQuery = {
      query: phrase,
      fields: [field],
      type: 'match_phrase',
      ...rest,
    };
    
    if (highlight === true) {
      searchQuery.highlight = {
        fields: { [field]: {} },
        preTags: ['<mark>'],
        postTags: ['</mark>'],
      };
    } else if (highlight && typeof highlight === 'object') {
      searchQuery.highlight = highlight;
    }
    
    return this.search<T>(searchQuery);
  }
  
  /**
   * Term search (exact match)
   */
  public async term<T = any>(
    field: string,
    value: any,
    options: SearchOptions = {}
  ): Promise<SearchResult<T>> {
    const { highlight, ...rest } = options;
    const searchQuery: SearchQuery = {
      query: value.toString(),
      fields: [field],
      type: 'term',
      ...rest,
    };
    return this.search<T>(searchQuery);
  }
  
  /**
   * Terms search (match any of the values)
   */
  public async terms<T = any>(
    field: string,
    values: any[],
    options: SearchOptions = {}
  ): Promise<SearchResult<T>> {
    const { highlight, ...rest } = options;
    const searchQuery: SearchQuery = {
      query: values.join(' OR '),
      fields: [field],
      type: 'terms',
      ...rest,
    };
    return this.search<T>(searchQuery);
  }
  
  /**
   * Range search
   */
  public async range<T = any>(
    field: string,
    range: { gte?: any; gt?: any; lte?: any; lt?: any },
    options: SearchOptions = {}
  ): Promise<SearchResult<T>> {
    const { highlight, ...rest } = options;
    const searchQuery: SearchQuery = {
      query: JSON.stringify(range),
      fields: [field],
      type: 'range',
      ...rest,
    };
    return this.search<T>(searchQuery);
  }
  
  /**
   * Prefix search
   */
  public async prefix<T = any>(
    field: string,
    prefix: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<T>> {
    const { highlight, ...rest } = options;
    const searchQuery: SearchQuery = {
      query: prefix,
      fields: [field],
      type: 'prefix',
      ...rest,
    };
    return this.search<T>(searchQuery);
  }
  
  /**
   * Wildcard search
   */
  public async wildcard<T = any>(
    field: string,
    pattern: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<T>> {
    const { highlight, ...rest } = options;
    const searchQuery: SearchQuery = {
      query: pattern,
      fields: [field],
      type: 'wildcard',
      ...rest,
    };
    return this.search<T>(searchQuery);
  }
  
  /**
   * Fuzzy search
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
   * Boolean search with must, should, must_not clauses
   */
  public async bool<T = any>(
    clauses: {
      must?: SearchQuery[];
      should?: SearchQuery[];
      mustNot?: SearchQuery[];
      filter?: SearchQuery[];
    },
    options: SearchOptions = {}
  ): Promise<SearchResult<T>> {
    const { highlight, ...rest } = options;
    const searchQuery: SearchQuery = {
      query: JSON.stringify(clauses),
      type: 'bool',
      ...rest,
    };
    return this.search<T>(searchQuery);
  }
  
  /**
   * Aggregation query
   */
  public async aggregate(query: AggregationQuery): Promise<AggregationResult> {
    const response = await this.httpClient.post('/search/aggregate', query);
    return response.data;
  }
  
  /**
   * Get search suggestions
   */
  public async suggest(query: SuggestQuery): Promise<SuggestResult> {
    const response = await this.httpClient.post('/search/suggest', query);
    return response.data;
  }
  
  /**
   * Autocomplete search
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
  
  /**
   * More like this - find similar documents
   */
  public async moreLikeThis<T = any>(
    documentId: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<T>> {
    const { highlight, ...rest } = options;
    const searchQuery: SearchQuery = {
      query: documentId,
      type: 'more_like_this',
      ...rest,
    };
    return this.search<T>(searchQuery);
  }
  
  /**
   * Highlight search terms in results
   */
  public async searchWithHighlight<T = any>(
    query: string,
    fields: string[],
    options: SearchOptions = {}
  ): Promise<SearchResult<T>> {
    return this.search<T>({
      query,
      fields,
      highlight: {
        fields: fields.reduce((acc, field) => ({ ...acc, [field]: {} }), {}),
        preTags: ['<mark>'],
        postTags: ['</mark>'],
      } as any,
      ...options,
    });
  }
  
  /**
   * Count matching documents
   */
  public async count(query: SearchQuery): Promise<number> {
    const result = await this.search({
      ...query,
      size: 0,
    });
    
    return result.total;
  }
  
  /**
   * Delete documents by query
   */
  public async deleteByQuery(query: SearchQuery): Promise<{ deleted: number }> {
    const response = await this.httpClient.post('/search/delete-by-query', query);
    return response.data;
  }
  
  /**
   * Reindex documents
   */
  public async reindex(
    source: string,
    destination: string,
    query?: SearchQuery
  ): Promise<{ indexed: number }> {
    const response = await this.httpClient.post('/search/reindex', {
      source,
      destination,
      query,
    });
    return response.data;
  }
  
  /**
   * Create a search index
   */
  public async createIndex(
    name: string,
    mappings?: any,
    settings?: any
  ): Promise<{ created: boolean }> {
    const response = await this.httpClient.post('/search/index', {
      name,
      mappings,
      settings,
    });
    return response.data;
  }
  
  /**
   * Delete a search index
   */
  public async deleteIndex(name: string): Promise<{ deleted: boolean }> {
    const response = await this.httpClient.delete(`/search/index/${name}`);
    return response.data;
  }
  
  /**
   * Get index information
   */
  public async getIndex(name: string): Promise<any> {
    const response = await this.httpClient.get(`/search/index/${name}`);
    return response.data;
  }
}