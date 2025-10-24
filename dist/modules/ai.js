"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIModule = void 0;
/**
 * AI Module - Comprehensive AI capabilities
 *
 * Provides text, image, audio, and video AI operations
 */
class AIModule {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    // ============= TEXT AI OPERATIONS =============
    /**
     * Generate text using AI
     */
    async generateText(prompt, options) {
        const response = await this.httpClient.post('/ai/text/generate', {
            prompt,
            ...options,
        });
        return response.data.data;
    }
    /**
     * Chat with AI using message history
     */
    async chat(messages, options) {
        const response = await this.httpClient.post('/ai/text/chat', {
            messages,
            ...options,
        });
        return response.data.data;
    }
    /**
     * Generate code in various programming languages
     */
    async generateCode(prompt, options) {
        const response = await this.httpClient.post('/ai/text/code/generate', {
            prompt,
            language: options?.language || 'typescript',
            framework: options?.framework,
            saveToDatabase: options?.saveToDatabase,
        });
        return response.data.data;
    }
    /**
     * Summarize text content
     */
    async summarizeText(text, options) {
        const response = await this.httpClient.post('/ai/text/summarize', {
            text,
            length: options?.length || 'medium',
        });
        return response.data.data;
    }
    /**
     * Translate text from one language to another
     */
    async translateText(text, targetLanguage, options) {
        const response = await this.httpClient.post('/ai/text/translate', {
            text,
            targetLanguage,
            sourceLanguage: options?.sourceLanguage,
        });
        return response.data.data;
    }
    // ============= IMAGE AI OPERATIONS =============
    /**
     * Generate images from text prompts
     * Now supports queue system with webhook notifications
     */
    async generateImage(prompt, options) {
        const response = await this.httpClient.post('/ai/image/generate', {
            prompt,
            model: options?.model,
            size: options?.size || '1024x1024',
            quality: options?.quality || 'standard',
            n: options?.n || 1,
            style: options?.style || 'natural',
            negativePrompt: options?.negativePrompt,
            steps: options?.steps,
            webhookUrl: options?.webhookUrl,
        });
        return response.data;
    }
    /**
     * Analyze image content
     */
    async analyzeImage(imageUrl, options) {
        const response = await this.httpClient.post('/ai/image/analyze', {
            imageUrl,
            question: options?.question || 'What is in this image?',
            detail: options?.detail || 'auto',
        });
        return response.data.data;
    }
    /**
     * Edit images using AI
     */
    async editImage(imageData, prompt, options) {
        const response = await this.httpClient.post('/ai/image/edit', {
            image: imageData,
            prompt,
            mask: options?.mask,
        });
        return response.data.data;
    }
    /**
     * Create variations of an image
     */
    async createImageVariation(imageData, options) {
        const response = await this.httpClient.post('/ai/image/variations', {
            image: imageData,
            n: options?.n || 1,
        });
        return response.data.data;
    }
    // ============= AUDIO AI OPERATIONS =============
    /**
     * Transcribe audio to text (Speech-to-Text)
     * Now supports async processing with webhook notifications
     */
    async transcribeAudio(audioFile, options) {
        const formData = new FormData();
        formData.append('audio', audioFile);
        if (options?.language)
            formData.append('language', options.language);
        if (options?.prompt)
            formData.append('prompt', options.prompt);
        if (options?.responseFormat)
            formData.append('responseFormat', options.responseFormat);
        if (options?.webhookUrl)
            formData.append('webhookUrl', options.webhookUrl);
        const response = await this.httpClient.post('/ai/audio/stt/transcribe', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
    /**
     * Check STT (Speech-to-Text) job status
     */
    async getSTTJobStatus(jobId) {
        const response = await this.httpClient.get(`/ai/audio/stt/status/${jobId}`);
        return response.data;
    }
    /**
     * Convert text to speech (TTS)
     * Now supports async processing with webhook notifications
     */
    async textToSpeech(text, options) {
        const response = await this.httpClient.post('/ai/audio/tts/generate', {
            text,
            voice: options?.voice || 'alloy',
            model: options?.model,
            instructions: options?.instructions,
            responseFormat: options?.responseFormat || 'mp3',
            speed: options?.speed || 1.0,
            webhookUrl: options?.webhookUrl,
        });
        // If response is binary data (Buffer), return it directly
        if (response.data instanceof Buffer) {
            return response.data;
        }
        // Otherwise, it's a job response
        return response.data;
    }
    /**
     * Check TTS (Text-to-Speech) job status
     */
    async getTTSJobStatus(jobId) {
        const response = await this.httpClient.get(`/ai/audio/tts/status/${jobId}`);
        return response.data;
    }
    /**
     * Download TTS generated audio file
     */
    async downloadTTSAudio(jobId) {
        const response = await this.httpClient.get(`/ai/audio/tts/download/${jobId}`, {
            responseType: 'arraybuffer',
        });
        return Buffer.from(response.data);
    }
    /**
     * Translate audio from one language to another
     */
    async translateAudio(audioFile, targetLanguage) {
        const formData = new FormData();
        formData.append('audio', audioFile);
        formData.append('targetLanguage', targetLanguage);
        const response = await this.httpClient.post('/ai/audio/translate', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    }
    /**
     * Get available voices for text-to-speech
     */
    async getAvailableVoices() {
        const response = await this.httpClient.get('/ai/audio/voices');
        return response.data.data;
    }
    // ============= VIDEO AI OPERATIONS =============
    /**
     * Generate video from text prompt
     * Now supports async processing with webhook notifications
     */
    async generateVideo(prompt, options) {
        const response = await this.httpClient.post('/ai/video/generate', {
            prompt,
            duration: options?.duration || 4,
            aspectRatio: options?.aspectRatio || '16:9',
            frameRate: options?.frameRate || 24,
            webhookUrl: options?.webhookUrl,
        });
        return response.data;
    }
    /**
     * Check video generation job status
     */
    async getVideoJobStatus(jobId) {
        const response = await this.httpClient.get(`/ai/video/job/${jobId}`);
        return response.data;
    }
    // ============= AI JOB QUEUE MANAGEMENT =============
    /**
     * Enqueue a new AI job to the processing queue
     */
    async enqueueJob(jobType, jobData, options) {
        const response = await this.httpClient.post('/ai/queue/enqueue', {
            jobType,
            jobData,
            priority: options?.priority || 'normal',
            webhookUrl: options?.webhookUrl,
            autoRetry: options?.autoRetry !== undefined ? options.autoRetry : true,
            maxRetries: options?.maxRetries || 3,
        });
        return response.data;
    }
    /**
     * Get overall queue status and statistics
     */
    async getQueueStatus() {
        const response = await this.httpClient.get('/ai/queue/status');
        return response.data;
    }
    /**
     * Get detailed information about a specific job
     */
    async getJobDetails(jobId) {
        const response = await this.httpClient.get(`/ai/queue/job/${jobId}`);
        return response.data;
    }
    /**
     * Cancel a pending or processing job
     */
    async cancelJob(jobId) {
        const response = await this.httpClient.delete(`/ai/queue/job/${jobId}`);
        return response.data;
    }
    /**
     * List jobs with optional filters
     */
    async listJobs(filters) {
        const params = new URLSearchParams();
        if (filters?.type)
            params.append('type', filters.type);
        if (filters?.status)
            params.append('status', filters.status);
        if (filters?.limit)
            params.append('limit', filters.limit.toString());
        const queryString = params.toString();
        const url = queryString ? `/ai/queue/jobs?${queryString}` : '/ai/queue/jobs';
        const response = await this.httpClient.get(url);
        return response.data;
    }
}
exports.AIModule = AIModule;
//# sourceMappingURL=ai.js.map