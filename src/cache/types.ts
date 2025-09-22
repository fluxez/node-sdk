export type CachePattern = 'lazy' | 'eager' | 'write-through' | 'write-behind';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Tags for invalidation
  pattern?: CachePattern; // Caching pattern
  namespace?: string; // Cache namespace
}

export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  memory: number;
  hitRate: number;
  evictions?: number;
  connections?: number;
  commands?: number;
}

export interface CacheOperation {
  operation: 'get' | 'set' | 'delete' | 'exists' | 'ttl' | 'expire' | 
             'incr' | 'decr' | 'mget' | 'mset' | 'sadd' | 'smembers' |
             'hget' | 'hset' | 'hdel' | 'hgetall' | 'lpush' | 'rpush' | 
             'lpop' | 'rpop' | 'lrange';
  key?: string;
  keys?: string[];
  value?: any;
  values?: any[];
  field?: string;
  fields?: string[];
  members?: any[];
  ttl?: number;
  pattern?: string;
  tags?: string[];
}

export interface CacheResult {
  success: boolean;
  value?: any;
  values?: any[];
  exists?: boolean;
  ttl?: number;
  added?: number;
  deleted?: number;
  members?: any[];
}