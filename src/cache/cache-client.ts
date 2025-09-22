import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import {
  CacheOptions,
  CacheStats,
  CacheOperation,
  CachePattern,
  CacheResult,
} from './types';

export class CacheClient {
  private httpClient: AxiosInstance;
  private config: FluxezConfig;
  private logger: Logger;
  private keyPrefix: string;
  
  constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger) {
    this.httpClient = httpClient;
    this.config = config;
    this.logger = logger;
    this.keyPrefix = config.cache?.prefix || '';
  }
  
  /**
   * Get value from cache
   */
  public async get<T = any>(key: string): Promise<T | null> {
    const fullKey = this.buildKey(key);
    this.logger.debug('Getting cache', { key: fullKey });
    
    try {
      const response = await this.httpClient.post('/api/v1/cache/operation', {
        operation: 'get',
        key: fullKey,
      });
      
      return response.data.value || null;
    } catch (error) {
      this.logger.error('Cache get failed', error);
      return null;
    }
  }
  
  /**
   * Set value in cache
   */
  public async set<T = any>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<boolean> {
    const fullKey = this.buildKey(key);
    const ttl = options.ttl || this.config.cache?.ttl || 3600;
    
    this.logger.debug('Setting cache', { key: fullKey, ttl });
    
    try {
      const response = await this.httpClient.post('/api/v1/cache/operation', {
        operation: 'set',
        key: fullKey,
        value,
        ttl,
        tags: options.tags,
        pattern: options.pattern,
      });
      
      return response.data.success === true;
    } catch (error) {
      this.logger.error('Cache set failed', error);
      return false;
    }
  }
  
  /**
   * Delete value from cache
   */
  public async delete(key: string): Promise<boolean> {
    const fullKey = this.buildKey(key);
    this.logger.debug('Deleting cache', { key: fullKey });
    
    try {
      const response = await this.httpClient.delete('/api/v1/cache/invalidate', {
        data: { keys: [fullKey] },
      });
      
      return response.data.deleted > 0;
    } catch (error) {
      this.logger.error('Cache delete failed', error);
      return false;
    }
  }
  
  /**
   * Delete multiple keys
   */
  public async deleteMany(keys: string[]): Promise<number> {
    const fullKeys = keys.map(key => this.buildKey(key));
    
    try {
      const response = await this.httpClient.delete('/api/v1/cache/invalidate', {
        data: { keys: fullKeys },
      });
      
      return response.data.deleted || 0;
    } catch (error) {
      this.logger.error('Cache delete many failed', error);
      return 0;
    }
  }
  
  /**
   * Check if key exists
   */
  public async exists(key: string): Promise<boolean> {
    const fullKey = this.buildKey(key);
    
    try {
      const response = await this.httpClient.post('/api/v1/cache/operation', {
        operation: 'exists',
        key: fullKey,
      });
      
      return response.data.exists === true;
    } catch (error) {
      this.logger.error('Cache exists check failed', error);
      return false;
    }
  }
  
  /**
   * Get TTL for a key
   */
  public async ttl(key: string): Promise<number> {
    const fullKey = this.buildKey(key);
    
    try {
      const response = await this.httpClient.post('/api/v1/cache/operation', {
        operation: 'ttl',
        key: fullKey,
      });
      
      return response.data.ttl || -1;
    } catch (error) {
      this.logger.error('Cache TTL check failed', error);
      return -1;
    }
  }
  
  /**
   * Set expiration for a key
   */
  public async expire(key: string, seconds: number): Promise<boolean> {
    const fullKey = this.buildKey(key);
    
    try {
      const response = await this.httpClient.post('/api/v1/cache/operation', {
        operation: 'expire',
        key: fullKey,
        ttl: seconds,
      });
      
      return response.data.success === true;
    } catch (error) {
      this.logger.error('Cache expire failed', error);
      return false;
    }
  }
  
  /**
   * Get multiple values
   */
  public async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    const fullKeys = keys.map(key => this.buildKey(key));
    
    try {
      const response = await this.httpClient.post('/api/v1/cache/operation', {
        operation: 'mget',
        keys: fullKeys,
      });
      
      return response.data.values || [];
    } catch (error) {
      this.logger.error('Cache mget failed', error);
      return keys.map(() => null);
    }
  }
  
  /**
   * Set multiple values
   */
  public async mset<T = any>(
    items: Array<{ key: string; value: T }>,
    ttl?: number
  ): Promise<boolean> {
    const fullItems = items.map(item => ({
      key: this.buildKey(item.key),
      value: item.value,
    }));
    
    try {
      const response = await this.httpClient.post('/api/v1/cache/operation', {
        operation: 'mset',
        items: fullItems,
        ttl: ttl || this.config.cache?.ttl,
      });
      
      return response.data.success === true;
    } catch (error) {
      this.logger.error('Cache mset failed', error);
      return false;
    }
  }
  
  /**
   * Increment a counter
   */
  public async incr(key: string, by: number = 1): Promise<number> {
    const fullKey = this.buildKey(key);
    
    try {
      const response = await this.httpClient.post('/api/v1/cache/operation', {
        operation: 'incr',
        key: fullKey,
        value: by,
      });
      
      return response.data.value || 0;
    } catch (error) {
      this.logger.error('Cache incr failed', error);
      return 0;
    }
  }
  
  /**
   * Decrement a counter
   */
  public async decr(key: string, by: number = 1): Promise<number> {
    const fullKey = this.buildKey(key);
    
    try {
      const response = await this.httpClient.post('/api/v1/cache/operation', {
        operation: 'decr',
        key: fullKey,
        value: by,
      });
      
      return response.data.value || 0;
    } catch (error) {
      this.logger.error('Cache decr failed', error);
      return 0;
    }
  }
  
  /**
   * Add to set
   */
  public async sadd(key: string, members: any[]): Promise<number> {
    const fullKey = this.buildKey(key);
    
    try {
      const response = await this.httpClient.post('/api/v1/cache/operation', {
        operation: 'sadd',
        key: fullKey,
        members,
      });
      
      return response.data.added || 0;
    } catch (error) {
      this.logger.error('Cache sadd failed', error);
      return 0;
    }
  }
  
  /**
   * Get set members
   */
  public async smembers<T = any>(key: string): Promise<T[]> {
    const fullKey = this.buildKey(key);
    
    try {
      const response = await this.httpClient.post('/api/v1/cache/operation', {
        operation: 'smembers',
        key: fullKey,
      });
      
      return response.data.members || [];
    } catch (error) {
      this.logger.error('Cache smembers failed', error);
      return [];
    }
  }
  
  /**
   * Invalidate cache by pattern
   */
  public async invalidateByPattern(pattern: string): Promise<number> {
    try {
      const response = await this.httpClient.delete('/api/v1/cache/invalidate', {
        data: { pattern: this.buildKey(pattern) },
      });
      
      return response.data.deleted || 0;
    } catch (error) {
      this.logger.error('Cache invalidate by pattern failed', error);
      return 0;
    }
  }
  
  /**
   * Invalidate cache by tags
   */
  public async invalidateByTags(tags: string[]): Promise<number> {
    try {
      const response = await this.httpClient.delete('/api/v1/cache/invalidate', {
        data: { tags },
      });
      
      return response.data.deleted || 0;
    } catch (error) {
      this.logger.error('Cache invalidate by tags failed', error);
      return 0;
    }
  }
  
  /**
   * Clear all cache
   */
  public async clear(): Promise<boolean> {
    try {
      const response = await this.httpClient.delete('/api/v1/cache/invalidate', {
        data: { all: true },
      });
      
      return response.data.success === true;
    } catch (error) {
      this.logger.error('Cache clear failed', error);
      return false;
    }
  }
  
  /**
   * Get cache statistics
   */
  public async stats(): Promise<CacheStats> {
    try {
      const response = await this.httpClient.get('/api/v1/cache/stats');
      return response.data;
    } catch (error) {
      this.logger.error('Cache stats failed', error);
      return {
        hits: 0,
        misses: 0,
        keys: 0,
        memory: 0,
        hitRate: 0,
      };
    }
  }
  
  /**
   * Get or set with callback
   */
  public async remember<T = any>(
    key: string,
    ttl: number,
    callback: () => Promise<T>
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    // Generate value
    const value = await callback();
    
    // Store in cache
    await this.set(key, value, { ttl });
    
    return value;
  }
  
  /**
   * Get or set forever
   */
  public async forever<T = any>(key: string, value: T): Promise<boolean> {
    return this.set(key, value, { ttl: 0 });
  }
  
  // Helper methods
  
  private buildKey(key: string): string {
    if (!this.keyPrefix) return key;
    return `${this.keyPrefix}:${key}`;
  }
}