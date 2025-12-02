import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
export interface ConnectorMetadata {
    type: string;
    name: string;
    category: string;
    description: string;
    icon?: string;
    color?: string;
    requiresOAuth?: boolean;
    oAuthProvider?: string;
    configFields: ConnectorConfigField[];
    actions: ConnectorAction[];
    triggers: ConnectorTrigger[];
    capabilities: string[];
    documentation?: string;
    website?: string;
    pricing?: 'free' | 'freemium' | 'paid';
}
export interface ConnectorConfigField {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'select' | 'password' | 'url' | 'email' | 'json';
    label: string;
    description?: string;
    required?: boolean;
    default?: any;
    options?: Array<{
        label: string;
        value: any;
    }>;
    placeholder?: string;
    validation?: {
        pattern?: string;
        min?: number;
        max?: number;
        message?: string;
    };
}
export interface ConnectorAction {
    id: string;
    name: string;
    description: string;
    category?: string;
    inputSchema: Record<string, any>;
    outputSchema: Record<string, any>;
    requiresAuth?: boolean;
    rateLimit?: {
        maxRequests: number;
        perSeconds: number;
    };
}
export interface ConnectorTrigger {
    id: string;
    name: string;
    description: string;
    type: 'webhook' | 'polling' | 'event';
    outputSchema: Record<string, any>;
    pollingInterval?: number;
    webhookConfig?: {
        supportedEvents: string[];
        requiresSetup: boolean;
    };
}
export interface ConnectorConfig {
    id?: string;
    connector_type: string;
    name: string;
    config: Record<string, any>;
    enabled?: boolean;
    status?: 'active' | 'inactive' | 'error' | 'pending';
    last_tested_at?: string;
    test_status?: 'success' | 'failed' | 'not_tested';
    is_oauth?: boolean;
    oauth_email?: string;
    oauth_expires_at?: string;
    metadata?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
}
export interface ConnectorListOptions {
    connector_type?: string;
    enabled?: boolean;
    status?: 'active' | 'inactive' | 'error' | 'pending';
    limit?: number;
    offset?: number;
}
export interface ConnectorTestResult {
    success: boolean;
    status: string;
    message?: string;
    response_time?: number;
    data?: any;
    error?: any;
    suggestions?: string[];
}
export interface ConnectorActionResult {
    success: boolean;
    data?: any;
    error?: any;
    execution_time?: number;
    metadata?: Record<string, any>;
}
export interface ConnectorResource {
    id: string;
    name: string;
    type?: string;
    metadata?: Record<string, any>;
    url?: string;
    created_at?: string;
    updated_at?: string;
}
export interface ConnectorUsageStats {
    total_calls: number;
    successful_calls: number;
    failed_calls: number;
    average_response_time: number;
    last_used_at?: string;
    error_rate: number;
    daily_usage: Array<{
        date: string;
        calls: number;
        errors: number;
    }>;
}
export interface WebhookSetupResult {
    webhook_url: string;
    webhook_id?: string;
    secret?: string;
    status: string;
    configured_events?: string[];
}
export interface GoogleDrive {
    id: string;
    name: string;
    type: 'my_drive' | 'shared_drive';
}
export interface GoogleFolder {
    id: string;
    name: string;
    parent_id?: string;
    drive_id?: string;
    web_view_link?: string;
    created_at?: string;
    modified_at?: string;
}
export interface GoogleFile {
    id: string;
    name: string;
    mime_type: string;
    size?: number;
    parent_id?: string;
    drive_id?: string;
    web_view_link?: string;
    download_link?: string;
    created_at?: string;
    modified_at?: string;
    thumbnail_link?: string;
}
export interface GoogleSpreadsheet {
    id: string;
    name: string;
    url: string;
    sheets?: GoogleSheet[];
}
export interface GoogleSheet {
    id: string;
    name: string;
    index: number;
    row_count?: number;
    column_count?: number;
}
export interface GoogleSheetColumn {
    index: number;
    letter: string;
    header: string;
}
export interface GoogleCalendar {
    id: string;
    name: string;
    description?: string;
    timezone?: string;
    primary?: boolean;
    access_role?: string;
}
export interface NotionDatabase {
    id: string;
    name: string;
    url: string;
    properties?: Record<string, any>;
    parent?: {
        type: string;
        page_id?: string;
        workspace?: boolean;
    };
    created_at?: string;
    updated_at?: string;
}
export interface NotionPage {
    id: string;
    title: string;
    url: string;
    parent_type?: string;
    parent_id?: string;
    properties?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
}
export declare class ConnectorClient {
    private httpClient;
    private config;
    private logger;
    constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger);
    /**
     * Create a new connector configuration
     */
    create(data: {
        connector_type: string;
        name: string;
        config: Record<string, any>;
        enabled?: boolean;
        user_id?: string;
    }): Promise<ConnectorConfig>;
    /**
     * List connector configurations with filtering
     */
    list(options?: ConnectorListOptions): Promise<{
        connectors: ConnectorConfig[];
        total: number;
    }>;
    /**
     * Get connector configuration by ID
     */
    get(connectorId: string): Promise<ConnectorConfig>;
    /**
     * Update connector configuration
     */
    update(connectorId: string, updates: {
        name?: string;
        config?: Record<string, any>;
        enabled?: boolean;
    }): Promise<ConnectorConfig>;
    /**
     * Delete connector configuration
     */
    delete(connectorId: string): Promise<void>;
    /**
     * Get list of available connector types
     */
    getAvailableConnectors(options?: {
        category?: string;
        search?: string;
    }): Promise<ConnectorMetadata[]>;
    /**
     * Get metadata for a specific connector type
     */
    getConnectorMetadata(connectorType: string): Promise<ConnectorMetadata>;
    /**
     * Get available actions for a connector type
     */
    getActions(connectorType: string): Promise<ConnectorAction[]>;
    /**
     * Get available triggers for a connector type
     */
    getTriggers(connectorType: string): Promise<ConnectorTrigger[]>;
    /**
     * Test connector connection
     */
    test(connectorId: string, testData?: Record<string, any>): Promise<ConnectorTestResult>;
    /**
     * Execute an action on the connector
     */
    executeAction(connectorId: string, actionId: string, params: Record<string, any>): Promise<ConnectorActionResult>;
    /**
     * Setup webhook for connector triggers
     */
    setupWebhook(connectorId: string, config: {
        events?: string[];
        callback_url?: string;
    }): Promise<WebhookSetupResult>;
    /**
     * Get list of Google Drives (My Drive + Shared Drives)
     */
    getGoogleDrives(connectorId: string): Promise<GoogleDrive[]>;
    /**
     * Get list of folders from Google Drive
     */
    getGoogleFolders(connectorId: string, options?: {
        drive_id?: string;
        parent_id?: string;
        limit?: number;
    }): Promise<GoogleFolder[]>;
    /**
     * Get list of files from Google Drive
     */
    getGoogleFiles(connectorId: string, options?: {
        drive_id?: string;
        folder_id?: string;
        mime_type?: string;
        search?: string;
        limit?: number;
    }): Promise<GoogleFile[]>;
    /**
     * Get list of Google Spreadsheets
     */
    getGoogleSpreadsheets(connectorId: string, options?: {
        drive_id?: string;
        folder_id?: string;
        limit?: number;
    }): Promise<GoogleSpreadsheet[]>;
    /**
     * Get list of sheets from a Google Spreadsheet
     */
    getGoogleSheets(connectorId: string, spreadsheetId: string): Promise<GoogleSheet[]>;
    /**
     * Get column headers from a Google Sheet
     */
    getGoogleSheetColumns(connectorId: string, spreadsheetId: string, sheetName: string): Promise<GoogleSheetColumn[]>;
    /**
     * Get list of Google Calendars
     */
    getGoogleCalendars(connectorId: string): Promise<GoogleCalendar[]>;
    /**
     * Get list of Notion databases
     */
    getNotionDatabases(connectorId: string, options?: {
        search?: string;
        limit?: number;
    }): Promise<NotionDatabase[]>;
    /**
     * Get list of Notion pages
     */
    getNotionPages(connectorId: string, options?: {
        parent_id?: string;
        search?: string;
        limit?: number;
    }): Promise<NotionPage[]>;
    /**
     * Get available AI models for a connector (e.g., OpenAI, Anthropic)
     */
    getAIModels(connectorId: string): Promise<Array<{
        id: string;
        name: string;
        description?: string;
        context_length?: number;
        capabilities?: string[];
        pricing?: {
            input: number;
            output: number;
            unit: string;
        };
    }>>;
    /**
     * Get connector usage statistics
     */
    getUsageStats(connectorId: string, options?: {
        start_date?: string;
        end_date?: string;
    }): Promise<ConnectorUsageStats>;
    /**
     * Check if connector supports OAuth
     */
    supportsOAuth(connectorType: string): Promise<boolean>;
    /**
     * Get OAuth authorization URL (simple string URL)
     */
    getOAuthUrl(connectorType: string, redirectUri: string, state?: string): string;
    /**
     * Initiate OAuth flow for a connector
     * Returns the authorization URL to redirect the user to
     *
     * @example
     * ```typescript
     * // Create connector first
     * const connector = await fluxez.connectors.create({
     *   connector_type: 'google_drive',
     *   name: 'My Google Drive',
     *   config: { authMode: 'oneclick' }
     * });
     *
     * // Get OAuth URL
     * const { authorization_url } = await fluxez.connectors.initiateOAuth(connector.id);
     *
     * // Open in popup
     * window.open(authorization_url, 'oauth', 'width=600,height=700');
     * ```
     */
    initiateOAuth(connectorId: string, options?: {
        redirectUri?: string;
    }): Promise<{
        authorization_url: string;
        state: string;
        code_verifier?: string;
    }>;
    /**
     * Get OAuth connection status for a connector
     *
     * @example
     * ```typescript
     * const status = await fluxez.connectors.getOAuthStatus(connectorId);
     * if (status.connected) {
     *   console.log(`Connected as ${status.email}`);
     * }
     * ```
     */
    getOAuthStatus(connectorId: string): Promise<{
        connected: boolean;
        email?: string;
        expiresAt?: string;
        scopes?: string[];
        connectorType: string;
        lastRefreshedAt?: string;
    }>;
    /**
     * Revoke OAuth connection for a connector
     * This will disconnect the OAuth integration and clear stored tokens
     *
     * @example
     * ```typescript
     * await fluxez.connectors.revokeOAuth(connectorId);
     * console.log('Disconnected from Google Drive');
     * ```
     */
    revokeOAuth(connectorId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Manually refresh OAuth token for a connector
     * Usually tokens are auto-refreshed, but this can be used to force a refresh
     *
     * @example
     * ```typescript
     * const result = await fluxez.connectors.refreshOAuthToken(connectorId);
     * console.log(`Token refreshed, expires at ${result.expiresAt}`);
     * ```
     */
    refreshOAuthToken(connectorId: string): Promise<{
        success: boolean;
        expiresAt: string;
        message: string;
    }>;
    /**
     * Handle OAuth callback (used by frontend after redirect)
     * This exchanges the authorization code for tokens
     *
     * @example
     * ```typescript
     * // After OAuth redirect, get code from URL params
     * const urlParams = new URLSearchParams(window.location.search);
     * const code = urlParams.get('code');
     * const state = urlParams.get('state');
     *
     * await fluxez.connectors.handleOAuthCallback(connectorId, code, state);
     * ```
     */
    handleOAuthCallback(connectorId: string, code: string, state: string, codeVerifier?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Search connectors by category
     */
    searchByCategory(category: string): Promise<ConnectorMetadata[]>;
    /**
     * Get all configured connectors grouped by category
     */
    getByCategory(): Promise<Record<string, ConnectorConfig[]>>;
}
//# sourceMappingURL=connectors.d.ts.map