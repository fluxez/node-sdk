import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import { CacheOptions, CacheStats } from './types';
export declare class CacheClient {
    private httpClient;
    private config;
    private logger;
    private keyPrefix;
    constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger);
    /**
     * Get value from cache
     */
    get<T = any>(key: string): Promise<T | null>;
    /**
     * Set value in cache
     */
    set<T = any>(key: string, value: T, options?: CacheOptions): Promise<boolean>;
    /**
     * Delete value from cache
     */
    delete(key: string): Promise<boolean>;
    /**
     * Delete multiple keys
     */
    deleteMany(keys: string[]): Promise<number>;
    /**
     * Check if key exists
     */
    exists(key: string): Promise<boolean>;
    /**
     * Get TTL for a key
     */
    ttl(key: string): Promise<number>;
    /**
     * Set expiration for a key
     */
    expire(key: string, seconds: number): Promise<boolean>;
    /**
     * Get multiple values
     */
    mget<T = any>(keys: string[]): Promise<(T | null)[]>;
    /**
     * Set multiple values
     */
    mset<T = any>(items: Array<{
        key: string;
        value: T;
    }>, ttl?: number): Promise<boolean>;
    /**
     * Increment a counter
     */
    incr(key: string, by?: number): Promise<number>;
    /**
     * Decrement a counter
     */
    decr(key: string, by?: number): Promise<number>;
    /**
     * Add to set
     */
    sadd(key: string, members: any[]): Promise<number>;
    /**
     * Get set members
     */
    smembers<T = any>(key: string): Promise<T[]>;
    /**
     * Invalidate cache by pattern
     */
    invalidateByPattern(pattern: string): Promise<number>;
    /**
     * Invalidate cache by tags
     */
    invalidateByTags(tags: string[]): Promise<number>;
    /**
     * Clear all cache
     */
    clear(): Promise<boolean>;
    /**
     * Get cache statistics
     */
    stats(): Promise<CacheStats>;
    /**
     * Get or set with callback
     */
    remember<T = any>(key: string, ttl: number, callback: () => Promise<T>): Promise<T>;
    /**
     * Get or set forever
     */
    forever<T = any>(key: string, value: T): Promise<boolean>;
    private buildKey;
}
//# sourceMappingURL=cache-client.d.ts.map