import { AxiosInstance } from 'axios';
import FormData from 'form-data';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import { ApiResponse } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';

export interface UploadResult {
  id: string;
  url: string;
  path: string;
  size: number;
  contentType: string;
}

export interface StorageFile {
  id: string;
  url: string;
  path: string;
  filename: string;
  size: number;
  contentType: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class StorageClient {
  private httpClient: AxiosInstance;
  private config: FluxezConfig;
  private logger: Logger;

  constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger) {
    this.httpClient = httpClient;
    this.config = config;
    this.logger = logger;
  }

  /**
   * Upload a file to storage through the backend API
   * @param content - File path, Buffer, or Readable stream to upload
   * @param filePath - Destination path for the uploaded file
   * @param options - Upload options (contentType, metadata, etc.)
   */
  public async upload(
    content: string | Buffer | Readable,
    filePath: string,
    options: {
      contentType?: string;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<UploadResult> {
    try {
      const formData = new FormData();

      // Handle different input types
      if (typeof content === 'string') {
        // File path provided
        if (!fs.existsSync(content)) {
          throw new Error(`File not found: ${content}`);
        }
        const fileStream = fs.createReadStream(content);
        const filename = path.basename(content);
        formData.append('file', fileStream, {
          filename,
          contentType: options.contentType || 'application/octet-stream'
        });
      } else if (Buffer.isBuffer(content)) {
        // Buffer provided
        const filename = path.basename(filePath) || 'file';
        formData.append('file', content, {
          filename,
          contentType: options.contentType || 'application/octet-stream'
        });
      } else {
        // Stream provided
        const filename = path.basename(filePath) || 'file';
        formData.append('file', content, {
          filename,
          contentType: options.contentType || 'application/octet-stream'
        });
      }

      // Add file path and metadata
      formData.append('path', filePath);
      if (options.metadata) {
        formData.append('metadata', JSON.stringify(options.metadata));
      }

      // Upload through backend API
      // Check if we're in Node.js environment (formData.getHeaders exists) or Web/Workers environment
      const headers: any = {};

      // Only call getHeaders() if it exists (Node.js environment)
      if (typeof (formData as any).getHeaders === 'function') {
        Object.assign(headers, (formData as any).getHeaders());
      }
      // In Web/Workers environment, axios/fetch will automatically set Content-Type with boundary

      const response = await this.httpClient.post<ApiResponse<UploadResult>>(
        '/storage/upload',
        formData,
        {
          headers,
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }
      );

      // Handle both response formats: with success wrapper and direct data
      if (response.data && (response.data.success === false)) {
        throw new Error(response.data.message || 'Upload failed');
      }

      this.logger.debug('File uploaded successfully', { path: filePath });

      // Return data directly if no success wrapper, otherwise return data.data
      return response.data.data || response.data;

    } catch (error: any) {
      this.logger.error('Upload failed', { error: error.message, path: filePath });
      throw error;
    }
  }

  /**
   * Get a file from storage through the backend API
   * @param filePath - Path of the file to retrieve
   */
  public async getFile(filePath: string): Promise<StorageFile> {
    try {
      const response = await this.httpClient.get<ApiResponse<StorageFile>>(
        `/storage/file`,
        {
          params: { path: filePath }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to get file');
      }

      return response.data.data!;

    } catch (error: any) {
      this.logger.error('Failed to get file', { error: error.message, path: filePath });
      throw error;
    }
  }

  /**
   * Download a file from storage
   * @param filePath - Path of the file to download
   */
  public async download(filePath: string): Promise<Buffer> {
    try {
      const response = await this.httpClient.get(
        `/storage/download`,
        {
          params: { path: filePath },
          responseType: 'arraybuffer'
        }
      );

      return Buffer.from(response.data);

    } catch (error: any) {
      this.logger.error('Download failed', { error: error.message, path: filePath });
      throw error;
    }
  }

  /**
   * Delete a file from storage through the backend API
   * @param filePath - Path of the file to delete
   */
  public async delete(filePath: string): Promise<boolean> {
    try {
      const response = await this.httpClient.delete<ApiResponse<{ success: boolean }>>(
        `/storage/file`,
        {
          params: { path: filePath }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Delete failed');
      }

      this.logger.debug('File deleted successfully', { path: filePath });
      return true;

    } catch (error: any) {
      this.logger.error('Delete failed', { error: error.message, path: filePath });
      throw error;
    }
  }

  /**
   * Get public URL for a file
   * @param filePath - Path of the file
   */
  public getPublicUrl(filePath: string): { publicUrl: string } {
    // Construct the public URL through the backend
    const baseUrl = this.httpClient.defaults.baseURL || 'http://localhost:3000';
    const publicUrl = `${baseUrl}/storage/public/${encodeURIComponent(filePath)}`;
    return { publicUrl };
  }

  /**
   * Create a signed URL for temporary access
   * @param filePath - Path of the file
   * @param expiresIn - Expiration time in seconds
   */
  public async createSignedUrl(
    filePath: string,
    expiresIn: number = 3600
  ): Promise<{ signedUrl: string }> {
    try {
      const response = await this.httpClient.post<ApiResponse<{ signedUrl: string }>>(
        '/storage/signed-url',
        {
          path: filePath,
          expiresIn
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create signed URL');
      }

      return response.data.data!;

    } catch (error: any) {
      this.logger.error('Failed to create signed URL', { error: error.message, path: filePath });
      throw error;
    }
  }

  /**
   * List files in a directory
   * @param prefix - Directory prefix to list files from
   */
  public async list(prefix?: string): Promise<StorageFile[]> {
    try {
      const response = await this.httpClient.get<ApiResponse<StorageFile[]>>(
        '/storage/list',
        {
          params: { prefix }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to list files');
      }

      return response.data.data!;

    } catch (error: any) {
      this.logger.error('Failed to list files', { error: error.message, prefix });
      throw error;
    }
  }
}