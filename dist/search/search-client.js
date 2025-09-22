"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchClient = void 0;
class SearchClient {
    constructor(httpClient, config, logger) {
        this.httpClient = httpClient;
        this.config = config;
        this.logger = logger;
    }
    /**
     * Full-text search
     */
    async search(query) {
        this.logger.debug('Executing search', query);
        const response = await this.httpClient.post('/api/v1/search', query);
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
    async vectorSearch(query) {
        this.logger.debug('Executing vector search', query);
        const response = await this.httpClient.post('/api/v1/search/vector', query);
        return {
            hits: response.data.hits || [],
            total: response.data.total || 0,
            took: response.data.took,
        };
    }
    /**
     * Search with simple string query
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
     * Multi-match search across multiple fields
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
     * Match phrase search
     */
    async matchPhrase(field, phrase, options = {}) {
        const { highlight, ...rest } = options;
        const searchQuery = {
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
        }
        else if (highlight && typeof highlight === 'object') {
            searchQuery.highlight = highlight;
        }
        return this.search(searchQuery);
    }
    /**
     * Term search (exact match)
     */
    async term(field, value, options = {}) {
        const { highlight, ...rest } = options;
        const searchQuery = {
            query: value.toString(),
            fields: [field],
            type: 'term',
            ...rest,
        };
        return this.search(searchQuery);
    }
    /**
     * Terms search (match any of the values)
     */
    async terms(field, values, options = {}) {
        const { highlight, ...rest } = options;
        const searchQuery = {
            query: values.join(' OR '),
            fields: [field],
            type: 'terms',
            ...rest,
        };
        return this.search(searchQuery);
    }
    /**
     * Range search
     */
    async range(field, range, options = {}) {
        const { highlight, ...rest } = options;
        const searchQuery = {
            query: JSON.stringify(range),
            fields: [field],
            type: 'range',
            ...rest,
        };
        return this.search(searchQuery);
    }
    /**
     * Prefix search
     */
    async prefix(field, prefix, options = {}) {
        const { highlight, ...rest } = options;
        const searchQuery = {
            query: prefix,
            fields: [field],
            type: 'prefix',
            ...rest,
        };
        return this.search(searchQuery);
    }
    /**
     * Wildcard search
     */
    async wildcard(field, pattern, options = {}) {
        const { highlight, ...rest } = options;
        const searchQuery = {
            query: pattern,
            fields: [field],
            type: 'wildcard',
            ...rest,
        };
        return this.search(searchQuery);
    }
    /**
     * Fuzzy search
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
     * Boolean search with must, should, must_not clauses
     */
    async bool(clauses, options = {}) {
        const { highlight, ...rest } = options;
        const searchQuery = {
            query: JSON.stringify(clauses),
            type: 'bool',
            ...rest,
        };
        return this.search(searchQuery);
    }
    /**
     * Aggregation query
     */
    async aggregate(query) {
        const response = await this.httpClient.post('/api/v1/search/aggregate', query);
        return response.data;
    }
    /**
     * Get search suggestions
     */
    async suggest(query) {
        const response = await this.httpClient.post('/api/v1/search/suggest', query);
        return response.data;
    }
    /**
     * Autocomplete search
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
    /**
     * More like this - find similar documents
     */
    async moreLikeThis(documentId, options = {}) {
        const { highlight, ...rest } = options;
        const searchQuery = {
            query: documentId,
            type: 'more_like_this',
            ...rest,
        };
        return this.search(searchQuery);
    }
    /**
     * Highlight search terms in results
     */
    async searchWithHighlight(query, fields, options = {}) {
        return this.search({
            query,
            fields,
            highlight: {
                fields: fields.reduce((acc, field) => ({ ...acc, [field]: {} }), {}),
                preTags: ['<mark>'],
                postTags: ['</mark>'],
            },
            ...options,
        });
    }
    /**
     * Count matching documents
     */
    async count(query) {
        const result = await this.search({
            ...query,
            size: 0,
        });
        return result.total;
    }
    /**
     * Delete documents by query
     */
    async deleteByQuery(query) {
        const response = await this.httpClient.post('/api/v1/search/delete-by-query', query);
        return response.data;
    }
    /**
     * Reindex documents
     */
    async reindex(source, destination, query) {
        const response = await this.httpClient.post('/api/v1/search/reindex', {
            source,
            destination,
            query,
        });
        return response.data;
    }
    /**
     * Create a search index
     */
    async createIndex(name, mappings, settings) {
        const response = await this.httpClient.post('/api/v1/search/index', {
            name,
            mappings,
            settings,
        });
        return response.data;
    }
    /**
     * Delete a search index
     */
    async deleteIndex(name) {
        const response = await this.httpClient.delete(`/api/v1/search/index/${name}`);
        return response.data;
    }
    /**
     * Get index information
     */
    async getIndex(name) {
        const response = await this.httpClient.get(`/api/v1/search/index/${name}`);
        return response.data;
    }
}
exports.SearchClient = SearchClient;
//# sourceMappingURL=search-client.js.map