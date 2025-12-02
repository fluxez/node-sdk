import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import { ApiResponse } from '../types';

// ============= Connector Types =============

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
  options?: Array<{ label: string; value: any }>;
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
  pollingInterval?: number; // in seconds, for polling triggers
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

// ============= Google Drive Resources =============

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

// ============= Notion Resources =============

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

// ============= Connector Client =============

export class ConnectorClient {
  private httpClient: AxiosInstance;
  private config: FluxezConfig;
  private logger: Logger;

  constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger) {
    this.httpClient = httpClient;
    this.config = config;
    this.logger = logger;
  }

  // ============= CRUD Operations =============

  /**
   * Create a new connector configuration
   */
  async create(data: {
    connector_type: string;
    name: string;
    config: Record<string, any>;
    enabled?: boolean;
    user_id?: string; // Optional user/owner ID (e.g., workspace ID from external apps)
  }): Promise<ConnectorConfig> {
    try {
      this.logger.debug('Creating connector configuration', {
        type: data.connector_type,
        name: data.name
      });

      const response = await this.httpClient.post<ApiResponse<ConnectorConfig>>(
        '/connectors',
        data
      );

      this.logger.debug('Connector created successfully', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to create connector', error);
      throw error;
    }
  }

  /**
   * List connector configurations with filtering
   */
  async list(options: ConnectorListOptions = {}): Promise<{
    connectors: ConnectorConfig[];
    total: number;
  }> {
    try {
      this.logger.debug('Listing connectors', { options });

      const queryParams = {
        connector_type: options.connector_type,
        enabled: options.enabled,
        status: options.status,
        limit: options.limit || 50,
        offset: options.offset || 0,
      };

      const response = await this.httpClient.get<ApiResponse<{
        connectors: ConnectorConfig[];
        total: number;
      }>>(
        '/connectors',
        { params: queryParams }
      );

      console.log('[ConnectorClient] response.data:', JSON.stringify(response.data));
      console.log('[ConnectorClient] response.status:', response.status);
      console.log('[ConnectorClient] response.data type:', typeof response.data);

      // Handle response - backend returns data directly, not wrapped in data.data
      return response.data as any;
    } catch (error) {
      console.log('[ConnectorClient] Error in list():', error);
      this.logger.error('Failed to list connectors', error);
      throw error;
    }
  }

  /**
   * Get connector configuration by ID
   */
  async get(connectorId: string): Promise<ConnectorConfig> {
    try {
      this.logger.debug('Getting connector', { connectorId });

      const response = await this.httpClient.get<ApiResponse<ConnectorConfig>>(
        `/connectors/${connectorId}`
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get connector', error);
      throw error;
    }
  }

  /**
   * Update connector configuration
   */
  async update(
    connectorId: string,
    updates: {
      name?: string;
      config?: Record<string, any>;
      enabled?: boolean;
    }
  ): Promise<ConnectorConfig> {
    try {
      this.logger.debug('Updating connector', { connectorId, updates });

      const response = await this.httpClient.put<ApiResponse<ConnectorConfig>>(
        `/connectors/${connectorId}`,
        updates
      );

      this.logger.debug('Connector updated successfully', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to update connector', error);
      throw error;
    }
  }

  /**
   * Delete connector configuration
   */
  async delete(connectorId: string): Promise<void> {
    try {
      this.logger.debug('Deleting connector', { connectorId });

      await this.httpClient.delete(`/connectors/${connectorId}`);

      this.logger.debug('Connector deleted successfully', { connectorId });
    } catch (error) {
      this.logger.error('Failed to delete connector', error);
      throw error;
    }
  }

  // ============= Discovery & Metadata =============

  /**
   * Get list of available connector types
   */
  async getAvailableConnectors(options: {
    category?: string;
    search?: string;
  } = {}): Promise<ConnectorMetadata[]> {
    try {
      this.logger.debug('Getting available connectors', { options });

      const response = await this.httpClient.get<ApiResponse<ConnectorMetadata[]>>(
        '/connectors/available',
        { params: options }
      );

      // Backend returns data directly, not wrapped in data.data
      return response.data as any;
    } catch (error) {
      this.logger.error('Failed to get available connectors', error);
      throw error;
    }
  }

  /**
   * Get metadata for a specific connector type
   */
  async getConnectorMetadata(connectorType: string): Promise<ConnectorMetadata> {
    try {
      this.logger.debug('Getting connector metadata', { connectorType });

      const response = await this.httpClient.get<ApiResponse<ConnectorMetadata>>(
        `/connectors/available/${connectorType}`
      );

      // Backend returns data directly, not wrapped in data.data
      return response.data as any;
    } catch (error) {
      this.logger.error('Failed to get connector metadata', error);
      throw error;
    }
  }

  /**
   * Get available actions for a connector type
   */
  async getActions(connectorType: string): Promise<ConnectorAction[]> {
    try {
      this.logger.debug('Getting connector actions', { connectorType });

      const response = await this.httpClient.get<ApiResponse<ConnectorAction[]>>(
        `/connectors/available/${connectorType}/actions`
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get connector actions', error);
      throw error;
    }
  }

  /**
   * Get available triggers for a connector type
   */
  async getTriggers(connectorType: string): Promise<ConnectorTrigger[]> {
    try {
      this.logger.debug('Getting connector triggers', { connectorType });

      const response = await this.httpClient.get<ApiResponse<ConnectorTrigger[]>>(
        `/connectors/available/${connectorType}/triggers`
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get connector triggers', error);
      throw error;
    }
  }

  // ============= Testing & Execution =============

  /**
   * Test connector connection
   */
  async test(connectorId: string, testData?: Record<string, any>): Promise<ConnectorTestResult> {
    try {
      this.logger.debug('Testing connector', { connectorId });

      const response = await this.httpClient.post<ApiResponse<ConnectorTestResult>>(
        `/connectors/${connectorId}/test`,
        { test_data: testData }
      );

      this.logger.debug('Connector test completed', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to test connector', error);
      throw error;
    }
  }

  /**
   * Execute an action on the connector
   */
  async executeAction(
    connectorId: string,
    actionId: string,
    params: Record<string, any>
  ): Promise<ConnectorActionResult> {
    try {
      this.logger.debug('Executing connector action', { connectorId, actionId, params });

      const response = await this.httpClient.post<ApiResponse<ConnectorActionResult>>(
        `/connectors/${connectorId}/execute`,
        {
          action: actionId,
          params
        }
      );

      this.logger.debug('Connector action executed', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to execute connector action', error);
      throw error;
    }
  }

  // ============= Webhooks =============

  /**
   * Setup webhook for connector triggers
   */
  async setupWebhook(
    connectorId: string,
    config: {
      events?: string[];
      callback_url?: string;
    }
  ): Promise<WebhookSetupResult> {
    try {
      this.logger.debug('Setting up webhook', { connectorId, config });

      const response = await this.httpClient.post<ApiResponse<WebhookSetupResult>>(
        `/connectors/${connectorId}/webhooks/setup`,
        config
      );

      this.logger.debug('Webhook setup completed', response.data);
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to setup webhook', error);
      throw error;
    }
  }

  // ============= Resource Discovery (Google Drive) =============

  /**
   * Get list of Google Drives (My Drive + Shared Drives)
   */
  async getGoogleDrives(connectorId: string): Promise<GoogleDrive[]> {
    try {
      this.logger.debug('Getting Google Drives', { connectorId });

      const response = await this.httpClient.get<ApiResponse<GoogleDrive[]>>(
        `/connectors/${connectorId}/resources/drives`
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get Google Drives', error);
      throw error;
    }
  }

  /**
   * Get list of folders from Google Drive
   */
  async getGoogleFolders(
    connectorId: string,
    options: {
      drive_id?: string;
      parent_id?: string;
      limit?: number;
    } = {}
  ): Promise<GoogleFolder[]> {
    try {
      this.logger.debug('Getting Google Drive folders', { connectorId, options });

      const response = await this.httpClient.get<ApiResponse<GoogleFolder[]>>(
        `/connectors/${connectorId}/resources/folders`,
        { params: options }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get Google Drive folders', error);
      throw error;
    }
  }

  /**
   * Get list of files from Google Drive
   */
  async getGoogleFiles(
    connectorId: string,
    options: {
      drive_id?: string;
      folder_id?: string;
      mime_type?: string;
      search?: string;
      limit?: number;
    } = {}
  ): Promise<GoogleFile[]> {
    try {
      this.logger.debug('Getting Google Drive files', { connectorId, options });

      const response = await this.httpClient.get<ApiResponse<GoogleFile[]>>(
        `/connectors/${connectorId}/resources/files`,
        { params: options }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get Google Drive files', error);
      throw error;
    }
  }

  /**
   * Get list of Google Spreadsheets
   */
  async getGoogleSpreadsheets(
    connectorId: string,
    options: {
      drive_id?: string;
      folder_id?: string;
      limit?: number;
    } = {}
  ): Promise<GoogleSpreadsheet[]> {
    try {
      this.logger.debug('Getting Google Spreadsheets', { connectorId, options });

      const response = await this.httpClient.get<ApiResponse<GoogleSpreadsheet[]>>(
        `/connectors/${connectorId}/resources/spreadsheets`,
        { params: options }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get Google Spreadsheets', error);
      throw error;
    }
  }

  /**
   * Get list of sheets from a Google Spreadsheet
   */
  async getGoogleSheets(
    connectorId: string,
    spreadsheetId: string
  ): Promise<GoogleSheet[]> {
    try {
      this.logger.debug('Getting Google Sheets', { connectorId, spreadsheetId });

      const response = await this.httpClient.get<ApiResponse<GoogleSheet[]>>(
        `/connectors/${connectorId}/resources/sheets`,
        { params: { spreadsheet_id: spreadsheetId } }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get Google Sheets', error);
      throw error;
    }
  }

  /**
   * Get column headers from a Google Sheet
   */
  async getGoogleSheetColumns(
    connectorId: string,
    spreadsheetId: string,
    sheetName: string
  ): Promise<GoogleSheetColumn[]> {
    try {
      this.logger.debug('Getting Google Sheet columns', {
        connectorId,
        spreadsheetId,
        sheetName
      });

      const response = await this.httpClient.get<ApiResponse<GoogleSheetColumn[]>>(
        `/connectors/${connectorId}/resources/columns`,
        {
          params: {
            spreadsheet_id: spreadsheetId,
            sheet_name: sheetName
          }
        }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get Google Sheet columns', error);
      throw error;
    }
  }

  /**
   * Get list of Google Calendars
   */
  async getGoogleCalendars(connectorId: string): Promise<GoogleCalendar[]> {
    try {
      this.logger.debug('Getting Google Calendars', { connectorId });

      const response = await this.httpClient.get<ApiResponse<GoogleCalendar[]>>(
        `/connectors/${connectorId}/resources/calendars`
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get Google Calendars', error);
      throw error;
    }
  }

  // ============= Resource Discovery (Notion) =============

  /**
   * Get list of Notion databases
   */
  async getNotionDatabases(
    connectorId: string,
    options: {
      search?: string;
      limit?: number;
    } = {}
  ): Promise<NotionDatabase[]> {
    try {
      this.logger.debug('Getting Notion databases', { connectorId, options });

      const response = await this.httpClient.get<ApiResponse<NotionDatabase[]>>(
        `/connectors/${connectorId}/resources/databases`,
        { params: options }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get Notion databases', error);
      throw error;
    }
  }

  /**
   * Get list of Notion pages
   */
  async getNotionPages(
    connectorId: string,
    options: {
      parent_id?: string;
      search?: string;
      limit?: number;
    } = {}
  ): Promise<NotionPage[]> {
    try {
      this.logger.debug('Getting Notion pages', { connectorId, options });

      const response = await this.httpClient.get<ApiResponse<NotionPage[]>>(
        `/connectors/${connectorId}/resources/pages`,
        { params: options }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get Notion pages', error);
      throw error;
    }
  }

  // ============= AI Models =============

  /**
   * Get available AI models for a connector (e.g., OpenAI, Anthropic)
   */
  async getAIModels(connectorId: string): Promise<Array<{
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
  }>> {
    try {
      this.logger.debug('Getting AI models', { connectorId });

      const response = await this.httpClient.get<ApiResponse<any[]>>(
        `/connectors/${connectorId}/models`
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get AI models', error);
      throw error;
    }
  }

  // ============= Usage & Analytics =============

  /**
   * Get connector usage statistics
   */
  async getUsageStats(
    connectorId: string,
    options: {
      start_date?: string;
      end_date?: string;
    } = {}
  ): Promise<ConnectorUsageStats> {
    try {
      this.logger.debug('Getting connector usage stats', { connectorId, options });

      const response = await this.httpClient.get<ApiResponse<ConnectorUsageStats>>(
        `/connectors/${connectorId}/usage`,
        { params: options }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get connector usage stats', error);
      throw error;
    }
  }

  // ============= Helper Methods =============

  /**
   * Check if connector supports OAuth
   */
  async supportsOAuth(connectorType: string): Promise<boolean> {
    try {
      const metadata = await this.getConnectorMetadata(connectorType);
      return metadata.requiresOAuth || false;
    } catch (error) {
      this.logger.error('Failed to check OAuth support', error);
      return false;
    }
  }

  /**
   * Get OAuth authorization URL (simple string URL)
   */
  getOAuthUrl(
    connectorType: string,
    redirectUri: string,
    state?: string
  ): string {
    const baseUrl = (this.config as any).baseURL || 'http://localhost:3000/api/v1';
    const params = new URLSearchParams({
      connector_type: connectorType,
      redirect_uri: redirectUri,
      ...(state && { state })
    });

    return `${baseUrl}/connectors/oauth/authorize?${params.toString()}`;
  }

  // ============= OAuth Integration (One-Click Flow) =============

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
  async initiateOAuth(
    connectorId: string,
    options: {
      redirectUri?: string;
    } = {}
  ): Promise<{
    authorization_url: string;
    state: string;
    code_verifier?: string;
  }> {
    try {
      this.logger.debug('Initiating OAuth flow', { connectorId, options });

      const params: Record<string, string> = {};
      if (options.redirectUri) {
        params.redirect_uri = options.redirectUri;
      }

      const response = await this.httpClient.get<ApiResponse<{
        authorization_url: string;
        state: string;
        code_verifier?: string;
      }>>(
        `/connectors/${connectorId}/oauth/url`,
        { params }
      );

      this.logger.debug('OAuth URL generated', response.data);
      // Backend returns data directly
      return response.data as any;
    } catch (error) {
      this.logger.error('Failed to initiate OAuth', error);
      throw error;
    }
  }

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
  async getOAuthStatus(connectorId: string): Promise<{
    connected: boolean;
    email?: string;
    expiresAt?: string;
    scopes?: string[];
    connectorType: string;
    lastRefreshedAt?: string;
  }> {
    try {
      this.logger.debug('Getting OAuth status', { connectorId });

      const response = await this.httpClient.get<ApiResponse<{
        connected: boolean;
        email?: string;
        expiresAt?: string;
        scopes?: string[];
        connectorType: string;
        lastRefreshedAt?: string;
      }>>(
        `/connectors/${connectorId}/oauth/status`
      );

      // Backend returns data directly
      return response.data as any;
    } catch (error) {
      this.logger.error('Failed to get OAuth status', error);
      throw error;
    }
  }

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
  async revokeOAuth(connectorId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      this.logger.debug('Revoking OAuth', { connectorId });

      const response = await this.httpClient.post<ApiResponse<{
        success: boolean;
        message: string;
      }>>(
        `/connectors/${connectorId}/oauth/revoke`
      );

      this.logger.debug('OAuth revoked', response.data);
      // Backend returns data directly
      return response.data as any;
    } catch (error) {
      this.logger.error('Failed to revoke OAuth', error);
      throw error;
    }
  }

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
  async refreshOAuthToken(connectorId: string): Promise<{
    success: boolean;
    expiresAt: string;
    message: string;
  }> {
    try {
      this.logger.debug('Refreshing OAuth token', { connectorId });

      const response = await this.httpClient.post<ApiResponse<{
        success: boolean;
        expiresAt: string;
        message: string;
      }>>(
        `/connectors/${connectorId}/oauth/refresh`
      );

      this.logger.debug('OAuth token refreshed', response.data);
      // Backend returns data directly
      return response.data as any;
    } catch (error) {
      this.logger.error('Failed to refresh OAuth token', error);
      throw error;
    }
  }

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
  async handleOAuthCallback(
    connectorId: string,
    code: string,
    state: string,
    codeVerifier?: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      this.logger.debug('Handling OAuth callback', { connectorId });

      const response = await this.httpClient.post<ApiResponse<{
        success: boolean;
        message: string;
      }>>(
        `/connectors/${connectorId}/oauth/callback`,
        {
          code,
          state,
          ...(codeVerifier && { code_verifier: codeVerifier })
        }
      );

      this.logger.debug('OAuth callback handled', response.data);
      // Backend returns data directly
      return response.data as any;
    } catch (error) {
      this.logger.error('Failed to handle OAuth callback', error);
      throw error;
    }
  }

  /**
   * Search connectors by category
   */
  async searchByCategory(category: string): Promise<ConnectorMetadata[]> {
    return this.getAvailableConnectors({ category });
  }

  /**
   * Get all configured connectors grouped by category
   */
  async getByCategory(): Promise<Record<string, ConnectorConfig[]>> {
    try {
      const { connectors } = await this.list({ limit: 1000 });
      const grouped: Record<string, ConnectorConfig[]> = {};

      for (const connector of connectors) {
        const metadata = await this.getConnectorMetadata(connector.connector_type);
        const category = metadata.category || 'other';

        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(connector);
      }

      return grouped;
    } catch (error) {
      this.logger.error('Failed to get connectors by category', error);
      throw error;
    }
  }
}
