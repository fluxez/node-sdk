import { FluxezConfig } from '../types/config';
import { QueryBuilder } from '../query/query-builder';
import { StorageClient } from '../storage/storage-client';
import { SearchClient } from '../search/search-client';
import { AnalyticsClient } from '../analytics/analytics-client';
import { CacheClient } from '../cache/cache-client';
import { AuthClient } from '../auth/auth-client';
export declare class FluxezClient {
    private config;
    private httpClient;
    private logger;
    query: QueryBuilder;
    storage: StorageClient;
    search: SearchClient;
    analytics: AnalyticsClient;
    cache: CacheClient;
    auth: AuthClient;
    constructor(config: FluxezConfig);
    private validateConfig;
    private createHttpClient;
    /**
     * Update authentication credentials
     */
    setAuth(apiKey: string): void;
    /**
     * Set project context
     */
    setProject(projectId: string): void;
    /**
     * Set organization context
     */
    setOrganization(organizationId: string): void;
    /**
     * Execute raw SQL query
     */
    raw(sql: string, params?: any[]): Promise<any>;
    /**
     * Execute natural language query
     */
    natural(query: string): Promise<any>;
    /**
     * Health check
     */
    health(): Promise<{
        status: string;
        version: string;
    }>;
}
//# sourceMappingURL=client.d.ts.map