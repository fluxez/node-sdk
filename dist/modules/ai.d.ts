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
     * Generate images from text prompts
     */
    generateImage(prompt: string, options?: {
        size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
        quality?: 'standard' | 'hd';
        n?: number;
        style?: 'vivid' | 'natural';
    }): Promise<{
        images: Array<{
            url: string;
            cost?: number;
            taskUUID?: string;
            stored?: boolean;
            contentId?: string;
        }>;
        prompt: string;
        cost?: number;
        taskUUID?: string;
        size?: string;
        quality?: string;
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
     * Transcribe audio to text
     */
    transcribeAudio(audioFile: File | Buffer, options?: {
        language?: string;
        responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
    }): Promise<{
        text: string;
        language?: string;
        duration?: number;
        segments?: Array<any>;
        confidence?: number;
    }>;
    /**
     * Convert text to speech
     */
    textToSpeech(text: string, options?: {
        voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
        speed?: number;
        responseFormat?: 'mp3' | 'opus' | 'aac' | 'flac';
    }): Promise<ArrayBuffer>;
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
     */
    generateVideo(prompt: string, options?: {
        duration?: number;
        aspectRatio?: '16:9' | '9:16' | '1:1';
        frameRate?: number;
    }): Promise<{
        taskId: string;
        status: string;
        videoUrl?: string;
        cost?: number;
        duration?: number;
        dimensions?: {
            width: number;
            height: number;
        };
        fps?: number;
    }>;
    /**
     * Check video generation job status
     */
    getVideoJobStatus(jobId: string): Promise<{
        jobId: string;
        status: string;
        videoUrl?: string;
        error?: string;
        cost?: number;
    }>;
}
//# sourceMappingURL=ai.d.ts.map