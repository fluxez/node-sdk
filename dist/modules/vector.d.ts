import { HttpClient } from '../core/http-client';
/**
 * Vector document for Qdrant operations
 */
export interface VectorDocument {
    id: string;
    vector: number[];
    payload?: Record<string, any>;
}
/**
 * Vector search query parameters for Qdrant
 */
export interface QdrantSearchQuery {
    vector: number[];
    limit?: number;
    offset?: number;
    filter?: Record<string, any>;
    threshold?: number;
    withPayload?: boolean;
}
/**
 * Vector search result
 */
export interface VectorSearchResult {
    id: string;
    score: number;
    payload?: Record<string, any>;
}
/**
 * Collection info
 */
export interface CollectionInfo {
    name: string;
    vectorSize: number;
    distance: 'cosine' | 'euclid' | 'dot';
    points: number;
    status: string;
}
/**
 * Collection statistics
 */
export interface CollectionStats {
    name: string;
    status: string;
    vectorSize: number;
    distance: string;
    pointsCount: number;
    indexedVectorsCount: number;
    segmentsCount: number;
}
/**
 * Health status response
 */
export interface VectorHealthStatus {
    status: 'healthy' | 'unhealthy' | 'disabled';
    configured: boolean;
    collections?: string[];
    error?: string;
}
/**
 * Scroll result
 */
export interface ScrollResult {
    vectors: VectorDocument[];
    nextOffset?: string;
}
/**
 * Create collection options
 */
export interface CreateCollectionOptions {
    name: string;
    vectorSize: number;
    distance?: 'cosine' | 'euclid' | 'dot';
}
/**
 * Recommend vectors options
 */
export interface RecommendOptions {
    positive: string[];
    negative?: string[];
    limit?: number;
    filter?: Record<string, any>;
}
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
export declare class VectorClient {
    private httpClient;
    constructor(httpClient: HttpClient);
    /**
     * Create a new vector collection
     *
     * @param options Collection creation options
     * @returns Created collection info
     */
    createCollection(options: CreateCollectionOptions): Promise<{
        success: boolean;
        collection: string;
        message: string;
    }>;
    /**
     * List all vector collections for the current project
     *
     * @returns Array of collection names
     */
    listCollections(): Promise<{
        success: boolean;
        collections: string[];
    }>;
    /**
     * Delete a vector collection
     *
     * @param name Collection name
     * @returns Deletion result
     */
    deleteCollection(name: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Get collection statistics
     *
     * @param name Collection name
     * @returns Collection statistics
     */
    getCollectionStats(name: string): Promise<{
        success: boolean;
        stats: CollectionStats;
    }>;
    /**
     * Upsert vectors into a collection
     *
     * @param collection Collection name
     * @param vectors Array of vector documents
     * @returns Upsert result
     */
    upsert(collection: string, vectors: VectorDocument[]): Promise<{
        success: boolean;
        count: number;
        message: string;
    }>;
    /**
     * Search for similar vectors
     *
     * @param collection Collection name
     * @param query Search query
     * @returns Search results
     */
    search(collection: string, query: QdrantSearchQuery): Promise<{
        success: boolean;
        results: VectorSearchResult[];
        count: number;
    }>;
    /**
     * Delete a vector by ID
     *
     * @param collection Collection name
     * @param id Vector ID
     * @returns Deletion result
     */
    delete(collection: string, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Delete multiple vectors by IDs
     *
     * @param collection Collection name
     * @param ids Array of vector IDs
     * @returns Deletion result
     */
    deleteMany(collection: string, ids: string[]): Promise<{
        success: boolean;
        count: number;
        message: string;
    }>;
    /**
     * Get vector recommendations (find similar to positive examples, dissimilar to negative)
     *
     * @param collection Collection name
     * @param options Recommendation options
     * @returns Recommended vectors
     */
    recommend(collection: string, options: RecommendOptions): Promise<{
        success: boolean;
        results: VectorSearchResult[];
        count: number;
    }>;
    /**
     * Check vector database health status
     *
     * @returns Health status
     */
    getHealth(): Promise<{
        success: boolean;
        status: 'healthy' | 'unhealthy' | 'disabled';
        configured: boolean;
        collections?: string[];
        error?: string;
    }>;
    /**
     * Insert a single vector
     *
     * @param collection Collection name
     * @param document Vector document
     * @returns Insert result
     */
    insert(collection: string, document: VectorDocument): Promise<{
        success: boolean;
        count: number;
        message: string;
    }>;
    /**
     * Search by vector with simple parameters
     *
     * @param collection Collection name
     * @param vector Query vector
     * @param limit Maximum results
     * @returns Search results
     */
    searchByVector(collection: string, vector: number[], limit?: number): Promise<VectorSearchResult[]>;
    /**
     * Search with payload filter
     *
     * @param collection Collection name
     * @param vector Query vector
     * @param filter Payload filter
     * @param limit Maximum results
     * @returns Search results
     */
    searchWithFilter(collection: string, vector: number[], filter: Record<string, any>, limit?: number): Promise<VectorSearchResult[]>;
    /**
     * Check if a collection exists
     *
     * @param name Collection name
     * @returns True if collection exists
     */
    collectionExists(name: string): Promise<boolean>;
    /**
     * Ensure a collection exists, create if it doesn't
     *
     * @param options Collection options
     * @returns True if created, false if already existed
     */
    ensureCollection(options: CreateCollectionOptions): Promise<boolean>;
}
//# sourceMappingURL=vector.d.ts.map