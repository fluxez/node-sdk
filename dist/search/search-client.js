"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchClient = void 0;
class SearchClient {
    constructor(httpClient, config, logger) {
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
    async unifiedSearch(table, query, options = {}) {
        this.logger.debug('Executing unified search', { table, query, options });
        const searchQuery = {
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
    async keywordSearch(table, query, options = {}) {
        return this.unifiedSearch(table, query, { ...options, mode: 'keyword' });
    }
    /**
     * Semantic search - uses PostgreSQL pgvector for AI-powered similarity search
     * @param table - Table name to search in
     * @param query - Search query text (will be converted to embedding)
     * @param options - Search options
     */
    async semanticSearch(table, query, options = {}) {
        return this.unifiedSearch(table, query, { ...options, mode: 'semantic' });
    }
    /**
     * Hybrid search - combines keyword and semantic search with RRF ranking
     * @param table - Table name to search in
     * @param query - Search query text
     * @param options - Search options
     */
    async hybridSearch(table, query, options = {}) {
        return this.unifiedSearch(table, query, { ...options, mode: 'hybrid' });
    }
    /**
     * Configure search for a table - sets up indexes for full-text and vector search
     * @param table - Table name to configure
     * @param options - Configuration options
     */
    async configureSearch(table, options) {
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
    async getSearchConfig(table) {
        const response = await this.httpClient.get(`/search/config/${table}`);
        return response.data?.config || null;
    }
    /**
     * Index a single document for semantic search
     * @param table - Table name
     * @param recordId - Record ID to index
     * @param content - Optional content to index (auto-extracted if not provided)
     */
    async indexDocument(table, recordId, content) {
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
    async bulkIndex(table, options = {}) {
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
    async getStatus() {
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
    async search(query) {
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
    async vectorSearch(query) {
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
    async query(q, options = {}) {
        const { highlight, ...rest } = options;
        const searchQuery = {
            query: q,
            ...rest,
        };
        if (highlight === true) {
            searchQuery.highlight = {
                fields: options.fields?.reduce((acc, field) => ({ ...acc, [field]: {} }), {}) || {},
                preTags: ['<mark>'],
                postTags: ['</mark>'],
            };
        }
        else if (highlight && typeof highlight === 'object') {
            searchQuery.highlight = highlight;
        }
        return this.search(searchQuery);
    }
    /**
     * Multi-match search across multiple fields (legacy)
     * @deprecated Use unifiedSearch() with columns option instead
     */
    async multiMatch(query, fields, options = {}) {
        const { highlight, ...rest } = options;
        const searchQuery = {
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
        }
        else if (highlight && typeof highlight === 'object') {
            searchQuery.highlight = highlight;
        }
        return this.search(searchQuery);
    }
    /**
     * Fuzzy search (legacy)
     * @deprecated Use keywordSearch() instead - pg_trgm provides fuzzy matching
     */
    async fuzzy(field, value, fuzziness = 'AUTO', options = {}) {
        const { highlight, ...rest } = options;
        const searchQuery = {
            query: value,
            fields: [field],
            type: 'fuzzy',
            fuzziness,
            ...rest,
        };
        return this.search(searchQuery);
    }
    /**
     * Aggregation query (legacy)
     */
    async aggregate(query) {
        const response = await this.httpClient.post('/search/aggregate', query);
        return response.data;
    }
    /**
     * Get search suggestions (legacy)
     */
    async suggest(query) {
        const response = await this.httpClient.post('/search/suggest', query);
        return response.data;
    }
    /**
     * Autocomplete search (legacy)
     */
    async autocomplete(field, prefix, options = {}) {
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
exports.SearchClient = SearchClient;
//# sourceMappingURL=search-client.js.map