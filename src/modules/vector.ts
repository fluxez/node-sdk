import { HttpClient } from '../core/http-client';
import { API_ENDPOINTS } from '../constants';

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
export class VectorClient {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  // ============= COLLECTION OPERATIONS =============

  /**
   * Create a new vector collection
   *
   * @param options Collection creation options
   * @returns Created collection info
   */
  async createCollection(options: CreateCollectionOptions): Promise<{
    success: boolean;
    collection: string;
    message: string;
  }> {
    const response = await this.httpClient.post(API_ENDPOINTS.VECTORS.COLLECTIONS, {
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
  async listCollections(): Promise<{
    success: boolean;
    collections: string[];
  }> {
    const response = await this.httpClient.get(API_ENDPOINTS.VECTORS.COLLECTIONS);
    return response.data;
  }

  /**
   * Delete a vector collection
   *
   * @param name Collection name
   * @returns Deletion result
   */
  async deleteCollection(name: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await this.httpClient.delete(`${API_ENDPOINTS.VECTORS.COLLECTIONS}/${name}`);
    return response.data;
  }

  /**
   * Get collection statistics
   *
   * @param name Collection name
   * @returns Collection statistics
   */
  async getCollectionStats(name: string): Promise<{
    success: boolean;
    stats: CollectionStats;
  }> {
    const response = await this.httpClient.get(`${API_ENDPOINTS.VECTORS.COLLECTIONS}/${name}/stats`);
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
  async upsert(
    collection: string,
    vectors: VectorDocument[]
  ): Promise<{
    success: boolean;
    count: number;
    message: string;
  }> {
    const response = await this.httpClient.post(API_ENDPOINTS.VECTORS.UPSERT, {
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
  async search(
    collection: string,
    query: QdrantSearchQuery
  ): Promise<{
    success: boolean;
    results: VectorSearchResult[];
    count: number;
  }> {
    const response = await this.httpClient.post(API_ENDPOINTS.VECTORS.SEARCH, {
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
  async delete(
    collection: string,
    id: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await this.httpClient.delete(
      `${API_ENDPOINTS.VECTORS.DELETE}/${collection}/${id}`
    );
    return response.data;
  }

  /**
   * Delete multiple vectors by IDs
   *
   * @param collection Collection name
   * @param ids Array of vector IDs
   * @returns Deletion result
   */
  async deleteMany(
    collection: string,
    ids: string[]
  ): Promise<{
    success: boolean;
    count: number;
    message: string;
  }> {
    const response = await this.httpClient.post(`${API_ENDPOINTS.VECTORS.DELETE}/${collection}`, {
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
  async recommend(
    collection: string,
    options: RecommendOptions
  ): Promise<{
    success: boolean;
    results: VectorSearchResult[];
    count: number;
  }> {
    const response = await this.httpClient.post(API_ENDPOINTS.VECTORS.RECOMMEND, {
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
  async getHealth(): Promise<{
    success: boolean;
    status: 'healthy' | 'unhealthy' | 'disabled';
    configured: boolean;
    collections?: string[];
    error?: string;
  }> {
    const response = await this.httpClient.get(API_ENDPOINTS.VECTORS.HEALTH);
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
  async insert(
    collection: string,
    document: VectorDocument
  ): Promise<{
    success: boolean;
    count: number;
    message: string;
  }> {
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
  async searchByVector(
    collection: string,
    vector: number[],
    limit: number = 10
  ): Promise<VectorSearchResult[]> {
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
  async searchWithFilter(
    collection: string,
    vector: number[],
    filter: Record<string, any>,
    limit: number = 10
  ): Promise<VectorSearchResult[]> {
    const result = await this.search(collection, { vector, filter, limit });
    return result.results;
  }

  /**
   * Check if a collection exists
   *
   * @param name Collection name
   * @returns True if collection exists
   */
  async collectionExists(name: string): Promise<boolean> {
    try {
      const { collections } = await this.listCollections();
      return collections.some((c) => c === name || c.endsWith(`_${name}`));
    } catch {
      return false;
    }
  }

  /**
   * Ensure a collection exists, create if it doesn't
   *
   * @param options Collection options
   * @returns True if created, false if already existed
   */
  async ensureCollection(options: CreateCollectionOptions): Promise<boolean> {
    const exists = await this.collectionExists(options.name);
    if (!exists) {
      await this.createCollection(options);
      return true;
    }
    return false;
  }
}
