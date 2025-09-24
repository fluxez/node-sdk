"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheClient = void 0;
class CacheClient {
    constructor(httpClient, config, logger) {
        this.httpClient = httpClient;
        this.config = config;
        this.logger = logger;
        this.keyPrefix = config.cache?.prefix || '';
    }
    /**
     * Get value from cache
     */
    async get(key) {
        const fullKey = this.buildKey(key);
        this.logger.debug('Getting cache', { key: fullKey });
        try {
            const response = await this.httpClient.post('/cache/operation', {
                operation: 'get',
                key: fullKey,
            });
            return response.data.value || null;
        }
        catch (error) {
            this.logger.error('Cache get failed', error);
            return null;
        }
    }
    /**
     * Set value in cache
     */
    async set(key, value, options = {}) {
        const fullKey = this.buildKey(key);
        const ttl = options.ttl || this.config.cache?.ttl || 3600;
        this.logger.debug('Setting cache', { key: fullKey, ttl });
        try {
            const response = await this.httpClient.post('/cache/operation', {
                operation: 'set',
                key: fullKey,
                value,
                ttl,
                tags: options.tags,
                pattern: options.pattern,
            });
            return response.data.success === true;
        }
        catch (error) {
            this.logger.error('Cache set failed', error);
            return false;
        }
    }
    /**
     * Delete value from cache
     */
    async delete(key) {
        const fullKey = this.buildKey(key);
        this.logger.debug('Deleting cache', { key: fullKey });
        try {
            const response = await this.httpClient.delete('/cache/invalidate', {
                data: { keys: [fullKey] },
            });
            return response.data.deleted > 0;
        }
        catch (error) {
            this.logger.error('Cache delete failed', error);
            return false;
        }
    }
    /**
     * Delete multiple keys
     */
    async deleteMany(keys) {
        const fullKeys = keys.map(key => this.buildKey(key));
        try {
            const response = await this.httpClient.delete('/cache/invalidate', {
                data: { keys: fullKeys },
            });
            return response.data.deleted || 0;
        }
        catch (error) {
            this.logger.error('Cache delete many failed', error);
            return 0;
        }
    }
    /**
     * Check if key exists
     */
    async exists(key) {
        const fullKey = this.buildKey(key);
        try {
            const response = await this.httpClient.post('/cache/operation', {
                operation: 'exists',
                key: fullKey,
            });
            return response.data.exists === true;
        }
        catch (error) {
            this.logger.error('Cache exists check failed', error);
            return false;
        }
    }
    /**
     * Get TTL for a key
     */
    async ttl(key) {
        const fullKey = this.buildKey(key);
        try {
            const response = await this.httpClient.post('/cache/operation', {
                operation: 'ttl',
                key: fullKey,
            });
            return response.data.ttl || -1;
        }
        catch (error) {
            this.logger.error('Cache TTL check failed', error);
            return -1;
        }
    }
    /**
     * Set expiration for a key
     */
    async expire(key, seconds) {
        const fullKey = this.buildKey(key);
        try {
            const response = await this.httpClient.post('/cache/operation', {
                operation: 'expire',
                key: fullKey,
                ttl: seconds,
            });
            return response.data.success === true;
        }
        catch (error) {
            this.logger.error('Cache expire failed', error);
            return false;
        }
    }
    /**
     * Get multiple values
     */
    async mget(keys) {
        const fullKeys = keys.map(key => this.buildKey(key));
        try {
            const response = await this.httpClient.post('/cache/operation', {
                operation: 'mget',
                keys: fullKeys,
            });
            return response.data.values || [];
        }
        catch (error) {
            this.logger.error('Cache mget failed', error);
            return keys.map(() => null);
        }
    }
    /**
     * Set multiple values
     */
    async mset(items, ttl) {
        const fullItems = items.map(item => ({
            key: this.buildKey(item.key),
            value: item.value,
        }));
        try {
            const response = await this.httpClient.post('/cache/operation', {
                operation: 'mset',
                items: fullItems,
                ttl: ttl || this.config.cache?.ttl,
            });
            return response.data.success === true;
        }
        catch (error) {
            this.logger.error('Cache mset failed', error);
            return false;
        }
    }
    /**
     * Increment a counter
     */
    async incr(key, by = 1) {
        const fullKey = this.buildKey(key);
        try {
            const response = await this.httpClient.post('/cache/operation', {
                operation: 'incr',
                key: fullKey,
                value: by,
            });
            return response.data.value || 0;
        }
        catch (error) {
            this.logger.error('Cache incr failed', error);
            return 0;
        }
    }
    /**
     * Decrement a counter
     */
    async decr(key, by = 1) {
        const fullKey = this.buildKey(key);
        try {
            const response = await this.httpClient.post('/cache/operation', {
                operation: 'decr',
                key: fullKey,
                value: by,
            });
            return response.data.value || 0;
        }
        catch (error) {
            this.logger.error('Cache decr failed', error);
            return 0;
        }
    }
    /**
     * Add to set
     */
    async sadd(key, members) {
        const fullKey = this.buildKey(key);
        try {
            const response = await this.httpClient.post('/cache/operation', {
                operation: 'sadd',
                key: fullKey,
                members,
            });
            return response.data.added || 0;
        }
        catch (error) {
            this.logger.error('Cache sadd failed', error);
            return 0;
        }
    }
    /**
     * Get set members
     */
    async smembers(key) {
        const fullKey = this.buildKey(key);
        try {
            const response = await this.httpClient.post('/cache/operation', {
                operation: 'smembers',
                key: fullKey,
            });
            return response.data.members || [];
        }
        catch (error) {
            this.logger.error('Cache smembers failed', error);
            return [];
        }
    }
    /**
     * Invalidate cache by pattern
     */
    async invalidateByPattern(pattern) {
        try {
            const response = await this.httpClient.delete('/cache/invalidate', {
                data: { pattern: this.buildKey(pattern) },
            });
            return response.data.deleted || 0;
        }
        catch (error) {
            this.logger.error('Cache invalidate by pattern failed', error);
            return 0;
        }
    }
    /**
     * Invalidate cache by tags
     */
    async invalidateByTags(tags) {
        try {
            const response = await this.httpClient.delete('/cache/invalidate', {
                data: { tags },
            });
            return response.data.deleted || 0;
        }
        catch (error) {
            this.logger.error('Cache invalidate by tags failed', error);
            return 0;
        }
    }
    /**
     * Clear all cache
     */
    async clear() {
        try {
            const response = await this.httpClient.delete('/cache/invalidate', {
                data: { all: true },
            });
            return response.data.success === true;
        }
        catch (error) {
            this.logger.error('Cache clear failed', error);
            return false;
        }
    }
    /**
     * Get cache statistics
     */
    async stats() {
        try {
            const response = await this.httpClient.get('/cache/stats');
            return response.data;
        }
        catch (error) {
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
    async remember(key, ttl, callback) {
        // Try to get from cache
        const cached = await this.get(key);
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
    async forever(key, value) {
        return this.set(key, value, { ttl: 0 });
    }
    // Helper methods
    buildKey(key) {
        if (!this.keyPrefix)
            return key;
        return `${this.keyPrefix}:${key}`;
    }
}
exports.CacheClient = CacheClient;
//# sourceMappingURL=cache-client.js.map