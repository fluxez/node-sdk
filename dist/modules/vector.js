"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorClient = void 0;
const constants_1 = require("../constants");
/**
 * Vector Client - Qdrant vector database operations
 *
 * Provides vector search, similarity matching, and collection management
 *
 * @example
 * ```typescript
 * const client = new FluxezClient('your_api_key');
 *
 * // Create a collection
 * await client.vector.createCollection({
 *   name: 'documents',
 *   vectorSize: 1536,
 *   distance: 'cosine'
 * });
 *
 * // Upsert vectors
 * await client.vector.upsert('documents', [
 *   { id: 'doc1', vector: [...], payload: { title: 'Hello' } }
 * ]);
 *
 * // Search for similar vectors
 * const results = await client.vector.search('documents', {
 *   vector: [...],
 *   limit: 10
 * });
 * ```
 */
class VectorClient {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    // ============= COLLECTION OPERATIONS =============
    /**
     * Create a new vector collection
     *
     * @param options Collection creation options
     * @returns Created collection info
     */
    async createCollection(options) {
        const response = await this.httpClient.post(constants_1.API_ENDPOINTS.VECTORS.COLLECTIONS, {
            name: options.name,
            vectorSize: options.vectorSize,
            distance: options.distance || 'cosine',
        });
        return response.data;
    }
    /**
     * List all vector collections for the current project
     *
     * @returns Array of collection names
     */
    async listCollections() {
        const response = await this.httpClient.get(constants_1.API_ENDPOINTS.VECTORS.COLLECTIONS);
        return response.data;
    }
    /**
     * Delete a vector collection
     *
     * @param name Collection name
     * @returns Deletion result
     */
    async deleteCollection(name) {
        const response = await this.httpClient.delete(`${constants_1.API_ENDPOINTS.VECTORS.COLLECTIONS}/${name}`);
        return response.data;
    }
    /**
     * Get collection statistics
     *
     * @param name Collection name
     * @returns Collection statistics
     */
    async getCollectionStats(name) {
        const response = await this.httpClient.get(`${constants_1.API_ENDPOINTS.VECTORS.COLLECTIONS}/${name}/stats`);
        return response.data;
    }
    // ============= VECTOR OPERATIONS =============
    /**
     * Upsert vectors into a collection
     *
     * @param collection Collection name
     * @param vectors Array of vector documents
     * @returns Upsert result
     */
    async upsert(collection, vectors) {
        const response = await this.httpClient.post(constants_1.API_ENDPOINTS.VECTORS.UPSERT, {
            collection,
            vectors,
        });
        return response.data;
    }
    /**
     * Search for similar vectors
     *
     * @param collection Collection name
     * @param query Search query
     * @returns Search results
     */
    async search(collection, query) {
        const response = await this.httpClient.post(constants_1.API_ENDPOINTS.VECTORS.SEARCH, {
            collection,
            query,
        });
        return response.data;
    }
    /**
     * Delete a vector by ID
     *
     * @param collection Collection name
     * @param id Vector ID
     * @returns Deletion result
     */
    async delete(collection, id) {
        const response = await this.httpClient.delete(`${constants_1.API_ENDPOINTS.VECTORS.DELETE}/${collection}/${id}`);
        return response.data;
    }
    /**
     * Delete multiple vectors by IDs
     *
     * @param collection Collection name
     * @param ids Array of vector IDs
     * @returns Deletion result
     */
    async deleteMany(collection, ids) {
        const response = await this.httpClient.post(`${constants_1.API_ENDPOINTS.VECTORS.DELETE}/${collection}`, {
            ids,
        });
        return response.data;
    }
    // ============= RECOMMENDATION =============
    /**
     * Get vector recommendations (find similar to positive examples, dissimilar to negative)
     *
     * @param collection Collection name
     * @param options Recommendation options
     * @returns Recommended vectors
     */
    async recommend(collection, options) {
        const response = await this.httpClient.post(constants_1.API_ENDPOINTS.VECTORS.RECOMMEND, {
            collection,
            positive: options.positive,
            negative: options.negative || [],
            limit: options.limit || 10,
            filter: options.filter,
        });
        return response.data;
    }
    // ============= HEALTH & STATUS =============
    /**
     * Check vector database health status
     *
     * @returns Health status
     */
    async getHealth() {
        const response = await this.httpClient.get(constants_1.API_ENDPOINTS.VECTORS.HEALTH);
        return response.data;
    }
    // ============= CONVENIENCE METHODS =============
    /**
     * Insert a single vector
     *
     * @param collection Collection name
     * @param document Vector document
     * @returns Insert result
     */
    async insert(collection, document) {
        return this.upsert(collection, [document]);
    }
    /**
     * Search by vector with simple parameters
     *
     * @param collection Collection name
     * @param vector Query vector
     * @param limit Maximum results
     * @returns Search results
     */
    async searchByVector(collection, vector, limit = 10) {
        const result = await this.search(collection, { vector, limit });
        return result.results;
    }
    /**
     * Search with payload filter
     *
     * @param collection Collection name
     * @param vector Query vector
     * @param filter Payload filter
     * @param limit Maximum results
     * @returns Search results
     */
    async searchWithFilter(collection, vector, filter, limit = 10) {
        const result = await this.search(collection, { vector, filter, limit });
        return result.results;
    }
    /**
     * Check if a collection exists
     *
     * @param name Collection name
     * @returns True if collection exists
     */
    async collectionExists(name) {
        try {
            const { collections } = await this.listCollections();
            return collections.some((c) => c === name || c.endsWith(`_${name}`));
        }
        catch {
            return false;
        }
    }
    /**
     * Ensure a collection exists, create if it doesn't
     *
     * @param options Collection options
     * @returns True if created, false if already existed
     */
    async ensureCollection(options) {
        const exists = await this.collectionExists(options.name);
        if (!exists) {
            await this.createCollection(options);
            return true;
        }
        return false;
    }
}
exports.VectorClient = VectorClient;
//# sourceMappingURL=vector.js.map