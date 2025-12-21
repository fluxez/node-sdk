"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIModule = void 0;
const constants_1 = require("../constants");
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
        const response = await this.httpClient.post(constants_1.API_ENDPOINTS.AI_TEXT.GENERATE, {
            prompt,
            ...options,
        });
        // Handle error responses
        if (response.success === false) {
            throw new Error(response.error || 'Failed to generate text');
        }
        // API returns { success: true, data: { text: "..." }, contentId: ... }
        return response.data;
    }
    /**
     * Chat with AI using message history
     */
    async chat(messages, options) {
        const response = await this.httpClient.post(constants_1.API_ENDPOINTS.AI_TEXT.CHAT, {
            messages,
            ...options,
        });
        // Handle error responses
        if (response.success === false) {
            throw new Error(response.error || 'Failed to chat');
        }
        return response.data;
    }
    /**
     * Generate code in various programming languages
     */
    async generateCode(prompt, options) {
        const response = await this.httpClient.post(constants_1.API_ENDPOINTS.AI_TEXT.CODE_GENERATE, {
            prompt,
            language: options?.language || 'typescript',
            framework: options?.framework,
            saveToDatabase: options?.saveToDatabase,
        });
        // Handle error responses
        if (response.success === false) {
            throw new Error(response.error || 'Failed to generate code');
        }
        return response.data;
    }
    /**
     * Summarize text content
     */
    async summarizeText(text, options) {
        const response = await this.httpClient.post(constants_1.API_ENDPOINTS.AI_TEXT.SUMMARIZE, {
            text,
            length: options?.length || 'medium',
        });
        // Handle error responses
        if (response.success === false) {
            throw new Error(response.error || 'Failed to summarize text');
        }
        return response.data;
    }
    /**
     * Translate text from one language to another
     */
    async translateText(text, targetLanguage, options) {
        const response = await this.httpClient.post(constants_1.API_ENDPOINTS.AI_TEXT.TRANSLATE, {
            text,
            targetLanguage,
            sourceLanguage: options?.sourceLanguage,
        });
        // Handle error responses
        if (response.success === false) {
            throw new Error(response.error || 'Failed to translate text');
        }
        return response.data;
    }
    /**
     * Generate embeddings for text
     * Useful for semantic search, similarity comparison, and RAG applications
     */
    async generateEmbeddings(text, options) {
        const response = await this.httpClient.post(constants_1.API_ENDPOINTS.AI_TEXT.EMBEDDINGS, {
            text,
            model: options?.model,
        });
        // Handle error responses from the API
        if (response.success === false) {
            throw new Error(response.error || 'Failed to generate embeddings');
        }
        // API returns { success: true, data: { embeddings, model, ... } }
        return response.data;
    }
    // ============= IMAGE AI OPERATIONS =============
    /**
     * Generate images from text prompts
     * Now supports queue system with webhook notifications
     */
    async generateImage(prompt, options) {
        const response = await this.httpClient.post(constants_1.API_ENDPOINTS.AI_IMAGE.GENERATE, {
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
        const response = await this.httpClient.post(constants_1.API_ENDPOINTS.AI_IMAGE.ANALYZE, {
            imageUrl,
            question: options?.question || 'What is in this image?',
            detail: options?.detail || 'auto',
        });
        // Handle error responses
        if (response.success === false) {
            throw new Error(response.error || 'Failed to analyze image');
        }
        return response.data;
    }
    /**
     * Edit images using AI
     */
    async editImage(imageData, prompt, options) {
        const response = await this.httpClient.post(constants_1.API_ENDPOINTS.AI_IMAGE.EDIT, {
            image: imageData,
            prompt,
            mask: options?.mask,
        });
        // Handle error responses
        if (response.success === false) {
            throw new Error(response.error || 'Failed to edit image');
        }
        return response.data;
    }
    /**
     * Create variations of an image
     */
    async createImageVariation(imageData, options) {
        const response = await this.httpClient.post(constants_1.API_ENDPOINTS.AI_IMAGE.VARIATION, {
            image: imageData,
            n: options?.n || 1,
        });
        // Handle error responses
        if (response.success === false) {
            throw new Error(response.error || 'Failed to create image variation');
        }
        return response.data;
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
        const response = await this.httpClient.post(constants_1.API_ENDPOINTS.AI_AUDIO_STT.TRANSCRIBE, formData, {
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
        const url = constants_1.API_ENDPOINTS.AI_AUDIO_STT.STATUS.replace(':jobId', jobId);
        const response = await this.httpClient.get(url);
        return response.data;
    }
    /**
     * Convert text to speech (TTS)
     * Now supports async processing with webhook notifications
     */
    async textToSpeech(text, options) {
        const response = await this.httpClient.post(constants_1.API_ENDPOINTS.AI_AUDIO_TTS.GENERATE, {
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
        const url = constants_1.API_ENDPOINTS.AI_AUDIO_TTS.STATUS.replace(':jobId', jobId);
        const response = await this.httpClient.get(url);
        return response.data;
    }
    /**
     * Download TTS generated audio file
     */
    async downloadTTSAudio(jobId) {
        const url = constants_1.API_ENDPOINTS.AI_AUDIO_TTS.DOWNLOAD.replace(':jobId', jobId);
        const response = await this.httpClient.get(url, {
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
        // Handle error responses
        if (response.success === false) {
            throw new Error(response.error || 'Failed to translate audio');
        }
        return response.data;
    }
    /**
     * Get available voices for text-to-speech
     */
    async getAvailableVoices() {
        const response = await this.httpClient.get('/ai/audio/voices');
        // Handle error responses
        if (response.success === false) {
            throw new Error(response.error || 'Failed to get available voices');
        }
        return response.data;
    }
    // ============= VIDEO AI OPERATIONS =============
    /**
     * Generate video from text prompt
     * Now supports async processing with webhook notifications
     */
    async generateVideo(prompt, options) {
        const response = await this.httpClient.post(constants_1.API_ENDPOINTS.AI_VIDEO.GENERATE, {
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
        const url = constants_1.API_ENDPOINTS.AI_VIDEO.JOB_STATUS.replace(':jobId', jobId);
        const response = await this.httpClient.get(url);
        return response.data;
    }
    // ============= AI JOB QUEUE MANAGEMENT =============
    /**
     * Enqueue a new AI job to the processing queue
     */
    async enqueueJob(jobType, jobData, options) {
        const response = await this.httpClient.post(constants_1.API_ENDPOINTS.AI_QUEUE.ENQUEUE, {
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
        const response = await this.httpClient.get(constants_1.API_ENDPOINTS.AI_QUEUE.STATUS);
        return response.data;
    }
    /**
     * Get detailed information about a specific job
     */
    async getJobDetails(jobId) {
        const url = constants_1.API_ENDPOINTS.AI_QUEUE.JOB_DETAILS.replace(':jobId', jobId);
        const response = await this.httpClient.get(url);
        return response.data;
    }
    /**
     * Cancel a pending or processing job
     */
    async cancelJob(jobId) {
        const url = constants_1.API_ENDPOINTS.AI_QUEUE.CANCEL_JOB.replace(':jobId', jobId);
        const response = await this.httpClient.delete(url);
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
        const url = queryString ? `${constants_1.API_ENDPOINTS.AI_QUEUE.LIST_JOBS}?${queryString}` : constants_1.API_ENDPOINTS.AI_QUEUE.LIST_JOBS;
        const response = await this.httpClient.get(url);
        return response.data;
    }
}
exports.AIModule = AIModule;
//# sourceMappingURL=ai.js.map