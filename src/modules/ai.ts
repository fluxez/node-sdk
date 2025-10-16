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
   */
  async generateImage(
    prompt: string,
    options?: {
      size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
      quality?: 'standard' | 'hd';
      n?: number;
      style?: 'vivid' | 'natural';
    }
  ): Promise<{
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
  }> {
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
   * Transcribe audio to text
   */
  async transcribeAudio(
    audioFile: File | Buffer,
    options?: {
      language?: string;
      responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
    }
  ): Promise<{
    text: string;
    language?: string;
    duration?: number;
    segments?: Array<any>;
    confidence?: number;
  }> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    if (options?.language) formData.append('language', options.language);
    if (options?.responseFormat) formData.append('responseFormat', options.responseFormat);

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
  async textToSpeech(
    text: string,
    options?: {
      voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
      speed?: number;
      responseFormat?: 'mp3' | 'opus' | 'aac' | 'flac';
    }
  ): Promise<ArrayBuffer> {
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
   */
  async generateVideo(
    prompt: string,
    options?: {
      duration?: number;
      aspectRatio?: '16:9' | '9:16' | '1:1';
      frameRate?: number;
    }
  ): Promise<{
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
  }> {
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
  async getVideoJobStatus(jobId: string): Promise<{
    jobId: string;
    status: string;
    videoUrl?: string;
    error?: string;
    cost?: number;
  }> {
    const response = await this.httpClient.get(`/ai/video/job/${jobId}`);
    return response.data.data;
  }
}
