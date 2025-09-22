"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrainClient = void 0;
class BrainClient {
    constructor(httpClient, config, logger) {
        this.httpClient = httpClient;
        this.config = config;
        this.logger = logger;
    }
    /**
     * Generate a complete app from natural language prompt
     */
    async generate(prompt, options = {}) {
        try {
            this.logger.debug('Generating app from prompt', { prompt, options });
            const generateData = {
                prompt,
                options: {
                    includeWorkflows: options.includeWorkflows || false,
                    includeAuth: options.includeAuth || true,
                    includePayments: options.includePayments || false,
                    complexity: options.complexity || 'standard',
                    framework: options.framework || 'react',
                    styling: options.styling || 'tailwind',
                    database: options.database || 'postgresql',
                    deployment: options.deployment || 'vercel',
                    features: options.features || [],
                    ...options,
                },
            };
            const response = await this.httpClient.post('/brain/generate', generateData);
            this.logger.debug('App generated successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to generate app', error);
            throw error;
        }
    }
    /**
     * Analyze and understand app requirements from prompt
     */
    async understand(prompt) {
        try {
            this.logger.debug('Understanding prompt', { prompt });
            const response = await this.httpClient.post('/brain/understand', { prompt });
            this.logger.debug('Prompt understanding completed', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to understand prompt', error);
            throw error;
        }
    }
    /**
     * Find similar app patterns using vector search
     */
    async findPatterns(query, options = {}) {
        try {
            this.logger.debug('Finding similar patterns', { query, options });
            const searchData = {
                query,
                limit: options.limit || 10,
                threshold: options.threshold || 0.7,
                appType: options.appType,
            };
            const response = await this.httpClient.post('/brain/patterns', searchData);
            this.logger.debug('Pattern search completed', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to find patterns', error);
            throw error;
        }
    }
    /**
     * Get architecture recommendations for requirements
     */
    async suggestArchitecture(requirements) {
        try {
            this.logger.debug('Suggesting architecture', { requirements });
            const response = await this.httpClient.post('/brain/architecture', requirements);
            this.logger.debug('Architecture suggestion completed', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to suggest architecture', error);
            throw error;
        }
    }
    /**
     * Get recommended UI components for app type
     */
    async selectComponents(appType, options = {}) {
        try {
            this.logger.debug('Selecting components', { appType, options });
            const selectionData = {
                appType,
                framework: options.framework || 'react',
                complexity: options.complexity || 'standard',
                features: options.features || [],
            };
            const response = await this.httpClient.post('/brain/components', selectionData);
            this.logger.debug('Component selection completed', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to select components', error);
            throw error;
        }
    }
    /**
     * Train the brain with new patterns and feedback
     */
    async train(trainingData) {
        try {
            this.logger.debug('Training brain with new data', { count: trainingData.length });
            const response = await this.httpClient.post('/brain/train', { trainingData });
            this.logger.debug('Brain training completed', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to train brain', error);
            throw error;
        }
    }
    /**
     * Get brain performance metrics and statistics
     */
    async getStats() {
        try {
            this.logger.debug('Getting brain stats');
            const response = await this.httpClient.get('/brain/stats');
            this.logger.debug('Brain stats retrieved', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get brain stats', error);
            throw error;
        }
    }
    /**
     * Generate synthetic training data for pre-launch preparation
     */
    async generateTrainingData(options) {
        try {
            this.logger.debug('Generating synthetic training data', { options });
            const response = await this.httpClient.post('/brain/training-data/generate', options);
            this.logger.debug('Synthetic training data generated', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to generate training data', error);
            throw error;
        }
    }
    /**
     * Validate generated app quality
     */
    async validateApp(appData) {
        try {
            this.logger.debug('Validating generated app', { appId: appData.id });
            const response = await this.httpClient.post('/brain/validate', { appData });
            this.logger.debug('App validation completed', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to validate app', error);
            throw error;
        }
    }
    /**
     * Get suggested improvements for an app
     */
    async suggestImprovements(appData, feedback) {
        try {
            this.logger.debug('Getting improvement suggestions', { appId: appData.id });
            const response = await this.httpClient.post('/brain/improvements', { appData, feedback });
            this.logger.debug('Improvement suggestions retrieved', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get improvement suggestions', error);
            throw error;
        }
    }
    /**
     * Generate text content using AI
     */
    async generateText(prompt, options) {
        try {
            this.logger.debug('Generating text', { prompt, options });
            const response = await this.httpClient.post('/brain/text/generate', { prompt, ...options });
            this.logger.debug('Text generated successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to generate text', error);
            throw error;
        }
    }
    /**
     * Generate image using AI
     */
    async generateImage(prompt, options) {
        try {
            this.logger.debug('Generating image', { prompt, options });
            const response = await this.httpClient.post('/brain/image/generate', { prompt, ...options });
            this.logger.debug('Image generated successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to generate image', error);
            throw error;
        }
    }
    /**
     * Generate audio from text
     */
    async generateAudio(text, options) {
        try {
            this.logger.debug('Generating audio', { text, options });
            const response = await this.httpClient.post('/brain/audio/generate', { text, ...options });
            this.logger.debug('Audio generated successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to generate audio', error);
            throw error;
        }
    }
    /**
     * Generate video from prompt
     */
    async generateVideo(prompt, options) {
        try {
            this.logger.debug('Generating video', { prompt, options });
            const response = await this.httpClient.post('/brain/video/generate', { prompt, ...options });
            this.logger.debug('Video generated successfully', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to generate video', error);
            throw error;
        }
    }
    /**
     * Generate embeddings for text
     */
    async generateEmbeddings(text) {
        try {
            this.logger.debug('Generating embeddings', { text });
            const response = await this.httpClient.post('/brain/embeddings/generate', { text });
            this.logger.debug('Embeddings generated successfully');
            return response.data.data.embeddings;
        }
        catch (error) {
            this.logger.error('Failed to generate embeddings', error);
            throw error;
        }
    }
    /**
     * Analyze content using AI
     */
    async analyzeContent(content, analysisType) {
        try {
            this.logger.debug('Analyzing content', { analysisType });
            const response = await this.httpClient.post('/brain/analyze/content', { content, analysisType });
            this.logger.debug('Content analysis completed', response.data);
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to analyze content', error);
            throw error;
        }
    }
}
exports.BrainClient = BrainClient;
//# sourceMappingURL=brain.js.map