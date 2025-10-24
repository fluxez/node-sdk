import { HttpClient } from '../core/http-client';

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
    const response = await this.httpClient.post('/ai/text/generate', {
      prompt,
      ...options,
    });
    return response.data.data;
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
    const response = await this.httpClient.post('/ai/text/chat', {
      messages,
      ...options,
    });
    return response.data.data;
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
    const response = await this.httpClient.post('/ai/text/summarize', {
      text,
      length: options?.length || 'medium',
    });
    return response.data.data;
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
  async createImageVariation(
    imageData: string,
    options?: {
      n?: number;
    }
  ): Promise<{
    images: Array<{ url: string }>;
  }> {
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
  async getSTTJobStatus(jobId: string): Promise<{
    success: boolean;
    status: string;
    text?: string;
    language?: string;
    duration?: number;
    error?: string;
  }> {
    const response = await this.httpClient.get(`/ai/audio/stt/status/${jobId}`);
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
  async getTTSJobStatus(jobId: string): Promise<{
    success: boolean;
    status: string;
    audioUrl?: string;
    error?: string;
  }> {
    const response = await this.httpClient.get(`/ai/audio/tts/status/${jobId}`);
    return response.data;
  }

  /**
   * Download TTS generated audio file
   */
  async downloadTTSAudio(jobId: string): Promise<Buffer> {
    const response = await this.httpClient.get(`/ai/audio/tts/download/${jobId}`, {
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
    return response.data.data;
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
    return response.data.data;
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
    const response = await this.httpClient.get(`/ai/video/job/${jobId}`);
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
    const response = await this.httpClient.get('/ai/queue/status');
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
    const response = await this.httpClient.get(`/ai/queue/job/${jobId}`);
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
    const response = await this.httpClient.delete(`/ai/queue/job/${jobId}`);
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
    const url = queryString ? `/ai/queue/jobs?${queryString}` : '/ai/queue/jobs';

    const response = await this.httpClient.get(url);
    return response.data;
  }
}
