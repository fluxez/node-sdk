"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorClient = void 0;
// ============= Connector Client =============
class ConnectorClient {
    constructor(httpClient, config, logger) {
        this.httpClient = httpClient;
        this.config = config;
        this.logger = logger;
    }
    // ============= CRUD Operations =============
    /**
     * Create a new connector configuration
     */
    async create(data) {
        try {
            this.logger.debug('Creating connector configuration', {
                type: data.connector_type,
                name: data.name
            });
            const response = await this.httpClient.post('/connectors', data);
            this.logger.debug('Connector created successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to create connector', error);
            throw error;
        }
    }
    /**
     * List connector configurations with filtering
     */
    async list(options = {}) {
        try {
            this.logger.debug('Listing connectors', { options });
            const queryParams = {
                connector_type: options.connector_type,
                enabled: options.enabled,
                status: options.status,
                limit: options.limit || 50,
                offset: options.offset || 0,
            };
            const response = await this.httpClient.get('/connectors', { params: queryParams });
            console.log('[ConnectorClient] Raw response:', JSON.stringify(response));
            console.log('[ConnectorClient] response.data:', JSON.stringify(response.data));
            // Handle response - backend returns data directly, not wrapped in data.data
            return response.data;
        }
        catch (error) {
            console.log('[ConnectorClient] Error in list():', error);
            this.logger.error('Failed to list connectors', error);
            throw error;
        }
    }
    /**
     * Get connector configuration by ID
     */
    async get(connectorId) {
        try {
            this.logger.debug('Getting connector', { connectorId });
            const response = await this.httpClient.get(`/connectors/${connectorId}`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get connector', error);
            throw error;
        }
    }
    /**
     * Update connector configuration
     */
    async update(connectorId, updates) {
        try {
            this.logger.debug('Updating connector', { connectorId, updates });
            const response = await this.httpClient.put(`/connectors/${connectorId}`, updates);
            this.logger.debug('Connector updated successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to update connector', error);
            throw error;
        }
    }
    /**
     * Delete connector configuration
     */
    async delete(connectorId) {
        try {
            this.logger.debug('Deleting connector', { connectorId });
            await this.httpClient.delete(`/connectors/${connectorId}`);
            this.logger.debug('Connector deleted successfully', { connectorId });
        }
        catch (error) {
            this.logger.error('Failed to delete connector', error);
            throw error;
        }
    }
    // ============= Discovery & Metadata =============
    /**
     * Get list of available connector types
     */
    async getAvailableConnectors(options = {}) {
        try {
            this.logger.debug('Getting available connectors', { options });
            const response = await this.httpClient.get('/connectors/available', { params: options });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get available connectors', error);
            throw error;
        }
    }
    /**
     * Get metadata for a specific connector type
     */
    async getConnectorMetadata(connectorType) {
        try {
            this.logger.debug('Getting connector metadata', { connectorType });
            const response = await this.httpClient.get(`/connectors/available/${connectorType}`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get connector metadata', error);
            throw error;
        }
    }
    /**
     * Get available actions for a connector type
     */
    async getActions(connectorType) {
        try {
            this.logger.debug('Getting connector actions', { connectorType });
            const response = await this.httpClient.get(`/connectors/available/${connectorType}/actions`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get connector actions', error);
            throw error;
        }
    }
    /**
     * Get available triggers for a connector type
     */
    async getTriggers(connectorType) {
        try {
            this.logger.debug('Getting connector triggers', { connectorType });
            const response = await this.httpClient.get(`/connectors/available/${connectorType}/triggers`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get connector triggers', error);
            throw error;
        }
    }
    // ============= Testing & Execution =============
    /**
     * Test connector connection
     */
    async test(connectorId, testData) {
        try {
            this.logger.debug('Testing connector', { connectorId });
            const response = await this.httpClient.post(`/connectors/${connectorId}/test`, { test_data: testData });
            this.logger.debug('Connector test completed', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to test connector', error);
            throw error;
        }
    }
    /**
     * Execute an action on the connector
     */
    async executeAction(connectorId, actionId, params) {
        try {
            this.logger.debug('Executing connector action', { connectorId, actionId, params });
            const response = await this.httpClient.post(`/connectors/${connectorId}/execute`, {
                action: actionId,
                params
            });
            this.logger.debug('Connector action executed', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to execute connector action', error);
            throw error;
        }
    }
    // ============= Webhooks =============
    /**
     * Setup webhook for connector triggers
     */
    async setupWebhook(connectorId, config) {
        try {
            this.logger.debug('Setting up webhook', { connectorId, config });
            const response = await this.httpClient.post(`/connectors/${connectorId}/webhooks/setup`, config);
            this.logger.debug('Webhook setup completed', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to setup webhook', error);
            throw error;
        }
    }
    // ============= Resource Discovery (Google Drive) =============
    /**
     * Get list of Google Drives (My Drive + Shared Drives)
     */
    async getGoogleDrives(connectorId) {
        try {
            this.logger.debug('Getting Google Drives', { connectorId });
            const response = await this.httpClient.get(`/connectors/${connectorId}/resources/drives`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get Google Drives', error);
            throw error;
        }
    }
    /**
     * Get list of folders from Google Drive
     */
    async getGoogleFolders(connectorId, options = {}) {
        try {
            this.logger.debug('Getting Google Drive folders', { connectorId, options });
            const response = await this.httpClient.get(`/connectors/${connectorId}/resources/folders`, { params: options });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get Google Drive folders', error);
            throw error;
        }
    }
    /**
     * Get list of files from Google Drive
     */
    async getGoogleFiles(connectorId, options = {}) {
        try {
            this.logger.debug('Getting Google Drive files', { connectorId, options });
            const response = await this.httpClient.get(`/connectors/${connectorId}/resources/files`, { params: options });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get Google Drive files', error);
            throw error;
        }
    }
    /**
     * Get list of Google Spreadsheets
     */
    async getGoogleSpreadsheets(connectorId, options = {}) {
        try {
            this.logger.debug('Getting Google Spreadsheets', { connectorId, options });
            const response = await this.httpClient.get(`/connectors/${connectorId}/resources/spreadsheets`, { params: options });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get Google Spreadsheets', error);
            throw error;
        }
    }
    /**
     * Get list of sheets from a Google Spreadsheet
     */
    async getGoogleSheets(connectorId, spreadsheetId) {
        try {
            this.logger.debug('Getting Google Sheets', { connectorId, spreadsheetId });
            const response = await this.httpClient.get(`/connectors/${connectorId}/resources/sheets`, { params: { spreadsheet_id: spreadsheetId } });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get Google Sheets', error);
            throw error;
        }
    }
    /**
     * Get column headers from a Google Sheet
     */
    async getGoogleSheetColumns(connectorId, spreadsheetId, sheetName) {
        try {
            this.logger.debug('Getting Google Sheet columns', {
                connectorId,
                spreadsheetId,
                sheetName
            });
            const response = await this.httpClient.get(`/connectors/${connectorId}/resources/columns`, {
                params: {
                    spreadsheet_id: spreadsheetId,
                    sheet_name: sheetName
                }
            });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get Google Sheet columns', error);
            throw error;
        }
    }
    /**
     * Get list of Google Calendars
     */
    async getGoogleCalendars(connectorId) {
        try {
            this.logger.debug('Getting Google Calendars', { connectorId });
            const response = await this.httpClient.get(`/connectors/${connectorId}/resources/calendars`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get Google Calendars', error);
            throw error;
        }
    }
    // ============= Resource Discovery (Notion) =============
    /**
     * Get list of Notion databases
     */
    async getNotionDatabases(connectorId, options = {}) {
        try {
            this.logger.debug('Getting Notion databases', { connectorId, options });
            const response = await this.httpClient.get(`/connectors/${connectorId}/resources/databases`, { params: options });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get Notion databases', error);
            throw error;
        }
    }
    /**
     * Get list of Notion pages
     */
    async getNotionPages(connectorId, options = {}) {
        try {
            this.logger.debug('Getting Notion pages', { connectorId, options });
            const response = await this.httpClient.get(`/connectors/${connectorId}/resources/pages`, { params: options });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get Notion pages', error);
            throw error;
        }
    }
    // ============= AI Models =============
    /**
     * Get available AI models for a connector (e.g., OpenAI, Anthropic)
     */
    async getAIModels(connectorId) {
        try {
            this.logger.debug('Getting AI models', { connectorId });
            const response = await this.httpClient.get(`/connectors/${connectorId}/models`);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get AI models', error);
            throw error;
        }
    }
    // ============= Usage & Analytics =============
    /**
     * Get connector usage statistics
     */
    async getUsageStats(connectorId, options = {}) {
        try {
            this.logger.debug('Getting connector usage stats', { connectorId, options });
            const response = await this.httpClient.get(`/connectors/${connectorId}/usage`, { params: options });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get connector usage stats', error);
            throw error;
        }
    }
    // ============= Helper Methods =============
    /**
     * Check if connector supports OAuth
     */
    async supportsOAuth(connectorType) {
        try {
            const metadata = await this.getConnectorMetadata(connectorType);
            return metadata.requiresOAuth || false;
        }
        catch (error) {
            this.logger.error('Failed to check OAuth support', error);
            return false;
        }
    }
    /**
     * Get OAuth authorization URL
     */
    getOAuthUrl(connectorType, redirectUri, state) {
        const baseUrl = this.config.baseURL || 'http://localhost:3000/api/v1';
        const params = new URLSearchParams({
            connector_type: connectorType,
            redirect_uri: redirectUri,
            ...(state && { state })
        });
        return `${baseUrl}/connectors/oauth/authorize?${params.toString()}`;
    }
    /**
     * Search connectors by category
     */
    async searchByCategory(category) {
        return this.getAvailableConnectors({ category });
    }
    /**
     * Get all configured connectors grouped by category
     */
    async getByCategory() {
        try {
            const { connectors } = await this.list({ limit: 1000 });
            const grouped = {};
            for (const connector of connectors) {
                const metadata = await this.getConnectorMetadata(connector.connector_type);
                const category = metadata.category || 'other';
                if (!grouped[category]) {
                    grouped[category] = [];
                }
                grouped[category].push(connector);
            }
            return grouped;
        }
        catch (error) {
            this.logger.error('Failed to get connectors by category', error);
            throw error;
        }
    }
}
exports.ConnectorClient = ConnectorClient;
//# sourceMappingURL=connectors.js.map