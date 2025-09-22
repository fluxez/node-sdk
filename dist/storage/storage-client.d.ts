import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
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
export declare class StorageClient {
    private httpClient;
    private config;
    private logger;
    constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger);
    /**
     * Upload a file to storage through the backend API
     * @param content - File path, Buffer, or Readable stream to upload
     * @param filePath - Destination path for the uploaded file
     * @param options - Upload options (contentType, metadata, etc.)
     */
    upload(content: string | Buffer | Readable, filePath: string, options?: {
        contentType?: string;
        metadata?: Record<string, any>;
    }): Promise<UploadResult>;
    /**
     * Get a file from storage through the backend API
     * @param filePath - Path of the file to retrieve
     */
    getFile(filePath: string): Promise<StorageFile>;
    /**
     * Download a file from storage
     * @param filePath - Path of the file to download
     */
    download(filePath: string): Promise<Buffer>;
    /**
     * Delete a file from storage through the backend API
     * @param filePath - Path of the file to delete
     */
    delete(filePath: string): Promise<boolean>;
    /**
     * Get public URL for a file
     * @param filePath - Path of the file
     */
    getPublicUrl(filePath: string): {
        publicUrl: string;
    };
    /**
     * Create a signed URL for temporary access
     * @param filePath - Path of the file
     * @param expiresIn - Expiration time in seconds
     */
    createSignedUrl(filePath: string, expiresIn?: number): Promise<{
        signedUrl: string;
    }>;
    /**
     * List files in a directory
     * @param prefix - Directory prefix to list files from
     */
    list(prefix?: string): Promise<StorageFile[]>;
}
//# sourceMappingURL=storage-client.d.ts.map