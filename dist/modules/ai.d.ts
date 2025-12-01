import { HttpClient } from '../core/http-client';
/**
 * AI Module - Comprehensive AI capabilities
 *
 * Provides text, image, audio, and video AI operations
 */
export declare class AIModule {
    private httpClient;
    constructor(httpClient: HttpClient);
    /**
     * Generate text using AI
     */
    generateText(prompt: string, options?: {
        systemMessage?: string;
        saveToDatabase?: boolean;
    }): Promise<{
        text: string;
        contentId?: string;
    }>;
    /**
     * Chat with AI using message history
     */
    chat(messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
    }>, options?: {
        saveToDatabase?: boolean;
    }): Promise<{
        message: string;
        contentId?: string;
    }>;
    /**
     * Generate code in various programming languages
     */
    generateCode(prompt: string, options?: {
        language?: string;
        framework?: string;
        saveToDatabase?: boolean;
    }): Promise<{
        code: string;
        contentId?: string;
    }>;
    /**
     * Summarize text content
     */
    summarizeText(text: string, options?: {
        length?: 'short' | 'medium' | 'long';
    }): Promise<{
        summary: string;
        originalLength: number;
        summaryLength: number;
        compressionRatio: number;
    }>;
    /**
     * Translate text from one language to another
     */
    translateText(text: string, targetLanguage: string, options?: {
        sourceLanguage?: string;
    }): Promise<{
        translatedText: string;
        detectedSourceLanguage: string;
        targetLanguage: string;
        confidence: number;
    }>;
    /**
     * Generate embeddings for text
     * Useful for semantic search, similarity comparison, and RAG applications
     */
    generateEmbeddings(text: string | string[], options?: {
        model?: string;
    }): Promise<{
        embeddings: number[][];
        model: string;
        dimensions: number;
        count: number;
        texts: Array<{
            index: number;
            text: string;
        }>;
    }>;
    /**
     * Generate images from text prompts
     * Now supports queue system with webhook notifications
     */
    generateImage(prompt: string, options?: {
        model?: string;
        size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
        quality?: 'standard' | 'hd';
        n?: number;
        style?: 'vivid' | 'natural';
        negativePrompt?: string;
        steps?: number;
        webhookUrl?: string;
    }): Promise<{
        success: boolean;
        data?: {
            images?: Array<{
                url: string;
                cost?: number;
                taskUUID?: string;
            }>;
            jobId?: string;
            status?: string;
            prompt: string;
            cost?: number;
        };
        error?: string;
    }>;
    /**
     * Analyze image content
     */
    analyzeImage(imageUrl: string, options?: {
        question?: string;
        detail?: 'low' | 'high' | 'auto';
    }): Promise<{
        description: string;
        labels?: string[];
        objects?: Array<{
            name: string;
            confidence: number;
        }>;
        confidence: number;
    }>;
    /**
     * Edit images using AI
     */
    editImage(imageData: string, prompt: string, options?: {
        mask?: string;
    }): Promise<{
        imageUrl: string;
        cost?: number;
    }>;
    /**
     * Create variations of an image
     */
    createImageVariation(imageData: string, options?: {
        n?: number;
    }): Promise<{
        images: Array<{
            url: string;
        }>;
    }>;
    /**
     * Transcribe audio to text (Speech-to-Text)
     * Now supports async processing with webhook notifications
     */
    transcribeAudio(audioFile: File | Buffer | string, options?: {
        language?: string;
        prompt?: string;
        responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
        webhookUrl?: string;
    }): Promise<{
        success: boolean;
        data?: {
            text: string;
            language?: string;
            duration?: number;
            fileName: string;
            fileSize: number;
            mimeType: string;
        };
        jobId?: string;
        status?: string;
        stored?: boolean;
        contentId?: string;
    }>;
    /**
     * Check STT (Speech-to-Text) job status
     */
    getSTTJobStatus(jobId: string): Promise<{
        success: boolean;
        status: string;
        text?: string;
        language?: string;
        duration?: number;
        error?: string;
    }>;
    /**
     * Convert text to speech (TTS)
     * Now supports async processing with webhook notifications
     */
    textToSpeech(text: string, options?: {
        voice?: string;
        model?: string;
        instructions?: string;
        responseFormat?: 'mp3' | 'opus' | 'aac' | 'flac';
        speed?: number;
        webhookUrl?: string;
    }): Promise<Buffer | {
        success: boolean;
        jobId?: string;
        status?: string;
        stored?: boolean;
        contentId?: string;
    }>;
    /**
     * Check TTS (Text-to-Speech) job status
     */
    getTTSJobStatus(jobId: string): Promise<{
        success: boolean;
        status: string;
        audioUrl?: string;
        error?: string;
    }>;
    /**
     * Download TTS generated audio file
     */
    downloadTTSAudio(jobId: string): Promise<Buffer>;
    /**
     * Translate audio from one language to another
     */
    translateAudio(audioFile: File | Buffer, targetLanguage: string): Promise<{
        translatedText: string;
        originalText?: string;
        detectedLanguage?: string;
        duration?: number;
    }>;
    /**
     * Get available voices for text-to-speech
     */
    getAvailableVoices(): Promise<Array<{
        id: string;
        name: string;
        gender?: string;
    }>>;
    /**
     * Generate video from text prompt
     * Now supports async processing with webhook notifications
     */
    generateVideo(prompt: string, options?: {
        duration?: number;
        aspectRatio?: '16:9' | '9:16' | '1:1';
        frameRate?: number;
        webhookUrl?: string;
    }): Promise<{
        success: boolean;
        data?: {
            taskId: string;
            jobId?: string;
            status: string;
            videoUrl?: string;
            prompt: string;
            duration: number;
            dimensions: {
                width: number;
                height: number;
            };
            fps: number;
            cost?: number;
        };
        error?: string;
    }>;
    /**
     * Check video generation job status
     */
    getVideoJobStatus(jobId: string): Promise<{
        success: boolean;
        data?: {
            jobId: string;
            status: string;
            videoUrl?: string;
            error?: string;
            cost?: number;
        };
        error?: string;
    }>;
    /**
     * Enqueue a new AI job to the processing queue
     */
    enqueueJob(jobType: 'video' | 'image' | 'audio' | 'tts' | 'stt', jobData: any, options?: {
        priority?: 'low' | 'normal' | 'high' | 'urgent';
        webhookUrl?: string;
        autoRetry?: boolean;
        maxRetries?: number;
    }): Promise<{
        success: boolean;
        data?: {
            jobId: string;
            jobType: string;
            status: string;
            priority: string;
            createdAt: string;
            message: string;
        };
        error?: string;
    }>;
    /**
     * Get overall queue status and statistics
     */
    getQueueStatus(): Promise<{
        success: boolean;
        data?: {
            totalJobs: number;
            jobsByType: Record<string, number>;
            jobsByStatus: Record<string, number>;
            capacity?: any;
            processingStatus?: any;
        };
        error?: string;
    }>;
    /**
     * Get detailed information about a specific job
     */
    getJobDetails(jobId: string): Promise<{
        success: boolean;
        data?: {
            jobId: string;
            jobType: string;
            status: string;
            priority: string;
            jobData: any;
            createdAt: string;
            dispatchedAt?: string;
            completedAt?: string;
            result?: any;
            error?: string;
            retryCount: number;
            maxRetries: number;
            externalJobId?: string;
            webhookUrl?: string;
            progress?: number;
        };
        error?: string;
    }>;
    /**
     * Cancel a pending or processing job
     */
    cancelJob(jobId: string): Promise<{
        success: boolean;
        data?: {
            jobId: string;
            status: 'cancelled';
            message: string;
        };
        error?: string;
    }>;
    /**
     * List jobs with optional filters
     */
    listJobs(filters?: {
        type?: string;
        status?: string;
        limit?: number;
    }): Promise<{
        success: boolean;
        data?: {
            jobs: any[];
            total: number;
        };
        error?: string;
    }>;
}
//# sourceMappingURL=ai.d.ts.map