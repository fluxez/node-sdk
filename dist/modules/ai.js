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
     */
    async generateImage(prompt, options) {
        const response = await this.httpClient.post('/ai/image/generate', {
            prompt,
            size: options?.size || '1024x1024',
            quality: options?.quality || 'standard',
            n: options?.n || 1,
            style: options?.style || 'natural',
        });
        return response.data.data;
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
     * Transcribe audio to text
     */
    async transcribeAudio(audioFile, options) {
        const formData = new FormData();
        formData.append('audio', audioFile);
        if (options?.language)
            formData.append('language', options.language);
        if (options?.responseFormat)
            formData.append('responseFormat', options.responseFormat);
        const response = await this.httpClient.post('/ai/audio/transcribe', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    }
    /**
     * Convert text to speech
     */
    async textToSpeech(text, options) {
        const response = await this.httpClient.post('/ai/audio/text-to-speech', {
            text,
            voice: options?.voice || 'alloy',
            speed: options?.speed || 1.0,
            responseFormat: options?.responseFormat || 'mp3',
        }, {
            responseType: 'arraybuffer',
        });
        return response.data;
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
     */
    async generateVideo(prompt, options) {
        const response = await this.httpClient.post('/ai/video/generate', {
            prompt,
            duration: options?.duration || 4,
            aspectRatio: options?.aspectRatio || '16:9',
            frameRate: options?.frameRate || 24,
        });
        return response.data.data;
    }
    /**
     * Check video generation job status
     */
    async getVideoJobStatus(jobId) {
        const response = await this.httpClient.get(`/ai/video/job/${jobId}`);
        return response.data.data;
    }
}
exports.AIModule = AIModule;
//# sourceMappingURL=ai.js.map