/**
 * Tenant Management Types for Fluxez SDK
 */
export interface Organization {
    id: string;
    name: string;
    slug: string;
    description?: string;
    ownerId: string;
    ownerEmail?: string;
    settings?: OrganizationSettings;
    subscription?: SubscriptionInfo;
    createdAt: string;
    updatedAt: string;
}
export interface Project {
    id: string;
    organizationId: string;
    name: string;
    description?: string;
    databaseName: string;
    serviceRoleKey?: string;
    anonKey?: string;
    settings?: ProjectSettings;
    status: 'active' | 'inactive' | 'suspended';
    createdAt: string;
    updatedAt: string;
}
export interface App {
    id: string;
    projectId: string;
    organizationId: string;
    name: string;
    description?: string;
    databaseName: string;
    serviceRoleKey?: string;
    anonKey?: string;
    settings?: AppSettings;
    status: 'active' | 'inactive' | 'suspended';
    deploymentUrl?: string;
    createdAt: string;
    updatedAt: string;
}
export interface ApiKey {
    id: string;
    key: string;
    name: string;
    type: 'service_role' | 'anon' | 'user';
    organizationId?: string;
    projectId?: string;
    appId?: string;
    permissions?: string[];
    scopes?: string[];
    expiresAt?: string;
    lastUsedAt?: string;
    isActive: boolean;
    usage?: ApiKeyUsage;
    createdAt: string;
    updatedAt: string;
}
export interface OrganizationSettings {
    timezone?: string;
    currency?: string;
    dateFormat?: string;
    theme?: 'light' | 'dark' | 'system';
    features?: {
        analytics: boolean;
        workflows: boolean;
        brain: boolean;
        multiTenant: boolean;
    };
    limits?: {
        projects: number;
        apps: number;
        apiCalls: number;
        storage: number;
    };
    billing?: {
        plan: string;
        interval: 'monthly' | 'yearly';
        customerId?: string;
        subscriptionId?: string;
    };
}
export interface ProjectSettings {
    database?: {
        maxConnections: number;
        connectionTimeout: number;
        queryTimeout: number;
    };
    auth?: {
        enableSignups: boolean;
        requireEmailVerification: boolean;
        sessionTimeout: number;
        providers: string[];
    };
    storage?: {
        maxFileSize: number;
        allowedFileTypes: string[];
        bucket?: string;
    };
    features?: {
        realtime: boolean;
        search: boolean;
        analytics: boolean;
        cache: boolean;
    };
    security?: {
        rateLimiting: boolean;
        ipWhitelist?: string[];
        corsOrigins?: string[];
    };
}
export interface AppSettings {
    frontend?: {
        framework: 'react' | 'vue' | 'angular' | 'svelte' | 'nextjs' | 'nuxt';
        typescript: boolean;
        tailwind: boolean;
        theme?: string;
    };
    backend?: {
        framework: 'nestjs' | 'express' | 'fastify' | 'koa';
        typescript: boolean;
        swagger: boolean;
        validation: boolean;
    };
    deployment?: {
        provider: 'vercel' | 'netlify' | 'aws' | 'gcp' | 'azure' | 'docker';
        domain?: string;
        environment: 'development' | 'staging' | 'production';
        autoDeployment: boolean;
    };
    integrations?: {
        stripe?: {
            publicKey: string;
            secretKey?: string;
        };
        sendgrid?: {
            apiKey?: string;
        };
        twilio?: {
            accountSid?: string;
            authToken?: string;
        };
        github?: {
            token?: string;
            repo?: string;
        };
    };
}
export interface SubscriptionInfo {
    plan: string;
    interval: 'monthly' | 'yearly';
    status: 'active' | 'past_due' | 'canceled' | 'unpaid';
    currentPeriodStart: string;
    currentPeriodEnd: string;
    customerId: string;
    subscriptionId: string;
    usage?: {
        apiCalls: number;
        storage: number;
        bandwidth: number;
    };
    limits?: {
        apiCalls: number;
        storage: number;
        bandwidth: number;
        projects: number;
        apps: number;
    };
}
export interface ApiKeyUsage {
    totalRequests: number;
    requestsThisMonth: number;
    lastRequestAt?: string;
    topEndpoints?: Array<{
        endpoint: string;
        count: number;
        lastUsed: string;
    }>;
    errorRate?: number;
}
export interface CreateTenantRequest {
    organizationName: string;
    organizationSlug?: string;
    projectName: string;
    description?: string;
    ownerEmail: string;
    settings?: {
        organization?: Partial<OrganizationSettings>;
        project?: Partial<ProjectSettings>;
    };
}
export interface CreateTenantResponse {
    success: boolean;
    organization: Organization;
    project: Project;
    serviceRoleKey: string;
    anonKey: string;
    message: string;
}
export interface CreateProjectRequest {
    organizationId: string;
    name: string;
    description?: string;
    settings?: Partial<ProjectSettings>;
}
export interface CreateProjectResponse {
    success: boolean;
    project: Project;
    serviceRoleKey: string;
    anonKey: string;
    message: string;
}
export interface CreateAppRequest {
    projectId: string;
    name: string;
    description?: string;
    settings?: Partial<AppSettings>;
}
export interface CreateAppResponse {
    success: boolean;
    app: App;
    serviceRoleKey: string;
    anonKey: string;
    message: string;
}
export interface CreateApiKeyRequest {
    name: string;
    type: 'service_role' | 'anon' | 'user';
    organizationId?: string;
    projectId?: string;
    appId?: string;
    permissions?: string[];
    scopes?: string[];
    expiresIn?: string;
}
export interface CreateApiKeyResponse {
    success: boolean;
    apiKey: ApiKey;
    message: string;
}
export interface ListProjectsOptions {
    organizationId?: string;
    status?: 'active' | 'inactive' | 'suspended';
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'name' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
    includeStats?: boolean;
}
export interface ListProjectsResponse {
    projects: Project[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}
export interface ListAppsOptions {
    projectId?: string;
    organizationId?: string;
    status?: 'active' | 'inactive' | 'suspended';
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'name' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
    includeStats?: boolean;
}
export interface ListAppsResponse {
    apps: App[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}
export interface ProjectDetails extends Project {
    organization: Organization;
    apps?: App[];
    apiKeys?: ApiKey[];
    stats?: ProjectStats;
    databases?: DatabaseInfo[];
}
export interface AppDetails extends App {
    organization: Organization;
    project: Project;
    apiKeys?: ApiKey[];
    stats?: AppStats;
    deployments?: DeploymentInfo[];
}
export interface ProjectStats {
    totalApps: number;
    totalApiKeys: number;
    totalRequests: number;
    requestsThisMonth: number;
    storageUsed: number;
    databaseSize: number;
    lastActivity?: string;
}
export interface AppStats {
    totalApiKeys: number;
    totalRequests: number;
    requestsThisMonth: number;
    averageResponseTime: number;
    errorRate: number;
    deployments: number;
    lastDeployment?: string;
    uptime: number;
}
export interface DatabaseInfo {
    name: string;
    size: string;
    tables: number;
    connections: number;
    status: 'healthy' | 'warning' | 'error';
    lastBackup?: string;
}
export interface DeploymentInfo {
    id: string;
    version: string;
    status: 'pending' | 'building' | 'success' | 'failed';
    url?: string;
    deployedAt: string;
    buildTime?: number;
    commit?: {
        sha: string;
        message: string;
        author: string;
    };
}
export interface UpdateProjectRequest {
    projectId: string;
    updates: {
        name?: string;
        description?: string;
        settings?: Partial<ProjectSettings>;
        status?: 'active' | 'inactive' | 'suspended';
    };
}
export interface UpdateAppRequest {
    appId: string;
    updates: {
        name?: string;
        description?: string;
        settings?: Partial<AppSettings>;
        status?: 'active' | 'inactive' | 'suspended';
    };
}
export interface UpdateApiKeyRequest {
    apiKeyId: string;
    updates: {
        name?: string;
        permissions?: string[];
        scopes?: string[];
        expiresAt?: string;
        isActive?: boolean;
    };
}
export interface DeleteProjectRequest {
    projectId: string;
    options?: {
        force?: boolean;
        backupData?: boolean;
        deleteApps?: boolean;
    };
}
export interface DeleteAppRequest {
    appId: string;
    options?: {
        force?: boolean;
        backupData?: boolean;
        deleteDeployments?: boolean;
    };
}
export interface DeleteApiKeyRequest {
    apiKeyId: string;
    options?: {
        revokeImmediately?: boolean;
    };
}
export interface TenantOperationResponse {
    success: boolean;
    message: string;
    affectedResources?: string[];
    backupLocations?: string[];
}
export interface TenantContext {
    organizationId: string;
    projectId?: string;
    appId?: string;
    userId?: string;
    permissions?: string[];
    scopes?: string[];
}
export interface TenantError extends Error {
    code: string;
    organizationId?: string;
    projectId?: string;
    appId?: string;
    details?: any;
}
export interface TenantValidationError extends TenantError {
    field?: string;
    constraint?: string;
    value?: any;
}
export interface ResourceQuota {
    organizationId: string;
    projectId?: string;
    appId?: string;
    limits: {
        apiCallsPerMonth: number;
        storageGB: number;
        bandwidthGB: number;
        projects: number;
        apps: number;
        apiKeys: number;
        databases: number;
    };
    usage: {
        apiCallsThisMonth: number;
        storageUsedGB: number;
        bandwidthUsedGB: number;
        projectsCount: number;
        appsCount: number;
        apiKeysCount: number;
        databasesCount: number;
    };
    warnings?: Array<{
        resource: string;
        threshold: number;
        current: number;
        message: string;
    }>;
}
export interface BillingInfo {
    customerId: string;
    subscriptionId: string;
    plan: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    upcomingInvoice?: {
        amount: number;
        currency: string;
        date: string;
    };
    paymentMethod?: {
        type: string;
        last4?: string;
        expiryMonth?: number;
        expiryYear?: number;
    };
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
//# sourceMappingURL=tenant.types.d.ts.map