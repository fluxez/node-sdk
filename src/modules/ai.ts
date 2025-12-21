import { HttpClient } from '../core/http-client';
import { API_ENDPOINTS } from '../constants';

/**
 * AI Module - Comprehensive AI capabilities
 *
 * Provides text, image, audio, and video AI operations
 */
export class AIModule {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  // ============= TEXT AI OPERATIONS =============

  /**
   * Generate text using AI
   */
  async generateText(
    prompt: string,
    options?: {
      systemMessage?: string;
      saveToDatabase?: boolean;
    }
  ): Promise<{
    text: string;
    contentId?: string;
  }> {
    const response = await this.httpClient.post(API_ENDPOINTS.AI_TEXT.GENERATE, {
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
  async chat(
    messages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>,
    options?: {
      saveToDatabase?: boolean;
    }
  ): Promise<{
    message: string;
    contentId?: string;
  }> {
    const response = await this.httpClient.post(API_ENDPOINTS.AI_TEXT.CHAT, {
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
  async generateCode(
    prompt: string,
    options?: {
      language?: string;
      framework?: string;
      saveToDatabase?: boolean;
    }
  ): Promise<{
    code: string;
    contentId?: string;
  }> {
    const response = await this.httpClient.post(API_ENDPOINTS.AI_TEXT.CODE_GENERATE, {
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
  async summarizeText(
    text: string,
    options?: {
      length?: 'short' | 'medium' | 'long';
    }
  ): Promise<{
    summary: string;
    originalLength: number;
    summaryLength: number;
    compressionRatio: number;
  }> {
    const response = await this.httpClient.post(API_ENDPOINTS.AI_TEXT.SUMMARIZE, {
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
  async translateText(
    text: string,
    targetLanguage: string,
    options?: {
      sourceLanguage?: string;
    }
  ): Promise<{
    translatedText: string;
    detectedSourceLanguage: string;
    targetLanguage: string;
    confidence: number;
  }> {
    const response = await this.httpClient.post(API_ENDPOINTS.AI_TEXT.TRANSLATE, {
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
  async generateEmbeddings(
    text: string | string[],
    options?: {
      model?: string;
    }
  ): Promise<{
    embeddings: number[][];
    model: string;
    dimensions: number;
    count: number;
    texts: Array<{ index: number; text: string }>;
  }> {
    const response = await this.httpClient.post(API_ENDPOINTS.AI_TEXT.EMBEDDINGS, {
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
  async generateImage(
    prompt: string,
    options?: {
      model?: string;
      size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
      quality?: 'standard' | 'hd';
      n?: number;
      style?: 'vivid' | 'natural';
      negativePrompt?: string;
      steps?: number;
      webhookUrl?: string;
    }
  ): Promise<{
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
  }> {
    const response = await this.httpClient.post(API_ENDPOINTS.AI_IMAGE.GENERATE, {
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
  async analyzeImage(
    imageUrl: string,
    options?: {
      question?: string;
      detail?: 'low' | 'high' | 'auto';
    }
  ): Promise<{
    description: string;
    labels?: string[];
    objects?: Array<{ name: string; confidence: number }>;
    confidence: number;
  }> {
    const response = await this.httpClient.post(API_ENDPOINTS.AI_IMAGE.ANALYZE, {
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
  async editImage(
    imageData: string,
    prompt: string,
    options?: {
      mask?: string;
    }
  ): Promise<{
    imageUrl: string;
    cost?: number;
  }> {
    const response = await this.httpClient.post(API_ENDPOINTS.AI_IMAGE.EDIT, {
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
  async createImageVariation(
    imageData: string,
    options?: {
      n?: number;
    }
  ): Promise<{
    images: Array<{ url: string }>;
  }> {
    const response = await this.httpClient.post(API_ENDPOINTS.AI_IMAGE.VARIATION, {
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
  async transcribeAudio(
    audioFile: File | Buffer | string,
    options?: {
      language?: string;
      prompt?: string;
      responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
      webhookUrl?: string;
    }
  ): Promise<{
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
  }> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    if (options?.language) formData.append('language', options.language);
    if (options?.prompt) formData.append('prompt', options.prompt);
    if (options?.responseFormat) formData.append('responseFormat', options.responseFormat);
    if (options?.webhookUrl) formData.append('webhookUrl', options.webhookUrl);

    const response = await this.httpClient.post(API_ENDPOINTS.AI_AUDIO_STT.TRANSCRIBE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Check STT (Speech-to-Text) job status
   */
  async getSTTJobStatus(jobId: string): Promise<{
    success: boolean;
    status: string;
    text?: string;
    language?: string;
    duration?: number;
    error?: string;
  }> {
    const url = API_ENDPOINTS.AI_AUDIO_STT.STATUS.replace(':jobId', jobId);
    const response = await this.httpClient.get(url);
    return response.data;
  }

  /**
   * Convert text to speech (TTS)
   * Now supports async processing with webhook notifications
   */
  async textToSpeech(
    text: string,
    options?: {
      voice?: string;
      model?: string;
      instructions?: string;
      responseFormat?: 'mp3' | 'opus' | 'aac' | 'flac';
      speed?: number;
      webhookUrl?: string;
    }
  ): Promise<Buffer | {
    success: boolean;
    jobId?: string;
    status?: string;
    stored?: boolean;
    contentId?: string;
  }> {
    const response = await this.httpClient.post(API_ENDPOINTS.AI_AUDIO_TTS.GENERATE, {
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
  async getTTSJobStatus(jobId: string): Promise<{
    success: boolean;
    status: string;
    audioUrl?: string;
    error?: string;
  }> {
    const url = API_ENDPOINTS.AI_AUDIO_TTS.STATUS.replace(':jobId', jobId);
    const response = await this.httpClient.get(url);
    return response.data;
  }

  /**
   * Download TTS generated audio file
   */
  async downloadTTSAudio(jobId: string): Promise<Buffer> {
    const url = API_ENDPOINTS.AI_AUDIO_TTS.DOWNLOAD.replace(':jobId', jobId);
    const response = await this.httpClient.get(url, {
      responseType: 'arraybuffer',
    });
    return Buffer.from(response.data);
  }

  /**
   * Translate audio from one language to another
   */
  async translateAudio(
    audioFile: File | Buffer,
    targetLanguage: string
  ): Promise<{
    translatedText: string;
    originalText?: string;
    detectedLanguage?: string;
    duration?: number;
  }> {
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
  async getAvailableVoices(): Promise<Array<{
    id: string;
    name: string;
    gender?: string;
  }>> {
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
  async generateVideo(
    prompt: string,
    options?: {
      duration?: number;
      aspectRatio?: '16:9' | '9:16' | '1:1';
      frameRate?: number;
      webhookUrl?: string;
    }
  ): Promise<{
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
  }> {
    const response = await this.httpClient.post(API_ENDPOINTS.AI_VIDEO.GENERATE, {
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
  async getVideoJobStatus(jobId: string): Promise<{
    success: boolean;
    data?: {
      jobId: string;
      status: string;
      videoUrl?: string;
      error?: string;
      cost?: number;
    };
    error?: string;
  }> {
    const url = API_ENDPOINTS.AI_VIDEO.JOB_STATUS.replace(':jobId', jobId);
    const response = await this.httpClient.get(url);
    return response.data;
  }

  // ============= AI JOB QUEUE MANAGEMENT =============

  /**
   * Enqueue a new AI job to the processing queue
   */
  async enqueueJob(
    jobType: 'video' | 'image' | 'audio' | 'tts' | 'stt',
    jobData: any,
    options?: {
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      webhookUrl?: string;
      autoRetry?: boolean;
      maxRetries?: number;
    }
  ): Promise<{
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
  }> {
    const response = await this.httpClient.post(API_ENDPOINTS.AI_QUEUE.ENQUEUE, {
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
  async getQueueStatus(): Promise<{
    success: boolean;
    data?: {
      totalJobs: number;
      jobsByType: Record<string, number>;
      jobsByStatus: Record<string, number>;
      capacity?: any;
      processingStatus?: any;
    };
    error?: string;
  }> {
    const response = await this.httpClient.get(API_ENDPOINTS.AI_QUEUE.STATUS);
    return response.data;
  }

  /**
   * Get detailed information about a specific job
   */
  async getJobDetails(jobId: string): Promise<{
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
  }> {
    const url = API_ENDPOINTS.AI_QUEUE.JOB_DETAILS.replace(':jobId', jobId);
    const response = await this.httpClient.get(url);
    return response.data;
  }

  /**
   * Cancel a pending or processing job
   */
  async cancelJob(jobId: string): Promise<{
    success: boolean;
    data?: {
      jobId: string;
      status: 'cancelled';
      message: string;
    };
    error?: string;
  }> {
    const url = API_ENDPOINTS.AI_QUEUE.CANCEL_JOB.replace(':jobId', jobId);
    const response = await this.httpClient.delete(url);
    return response.data;
  }

  /**
   * List jobs with optional filters
   */
  async listJobs(filters?: {
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
  }> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.AI_QUEUE.LIST_JOBS}?${queryString}` : API_ENDPOINTS.AI_QUEUE.LIST_JOBS;

    const response = await this.httpClient.get(url);
    return response.data;
  }
}
