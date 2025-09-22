export type StorageProvider = 'local' | 'cloud' | 'fluxez';

export interface UploadOptions {
  // File info
  fileName?: string;
  mimeType?: string;

  // Storage settings
  provider?: StorageProvider;
  bucket?: string;
  public?: boolean;

  // Storage class settings (generic for any provider)
  storageClass?: string;

  // Metadata
  metadata?: Record<string, string>;
  tags?: Record<string, string>;

  // Validation
  maxSize?: number;
  allowedMimeTypes?: string[];
}

export interface UploadResult {
  url: string;
  key: string;
  bucket?: string;
  size: number;
  mimeType: string;
  metadata?: Record<string, string>;
  etag?: string;
}

export interface SignedUrlOptions {
  bucket?: string;
  expiresIn?: number; // seconds
  contentType?: string;
  contentDisposition?: string;
  
  // For upload URLs
  maxSize?: number;
  conditions?: Record<string, any>;
}

export interface ListFilesOptions {
  bucket?: string;
  prefix?: string;
  delimiter?: string;
  limit?: number;
  continuationToken?: string;
  
  // Filtering
  startAfter?: string;
  
  // Include options
  includeMetadata?: boolean;
  includeVersions?: boolean;
}

export interface FileMetadata {
  key: string;
  size: number;
  lastModified: Date;
  etag?: string;
  contentType?: string;
  storageClass?: string;
  metadata?: Record<string, string>;
  versionId?: string;
}

export interface DeleteOptions {
  bucket?: string;
  versionId?: string;
  bypassGovernanceRetention?: boolean;
}

export interface CopyOptions {
  bucket?: string;
  sourceBucket?: string;
  destinationBucket?: string;
  metadata?: Record<string, string>;
  tagging?: Record<string, string>;
}

export interface MoveOptions extends CopyOptions {
  deleteSource?: boolean;
}

export interface DownloadOptions {
  bucket?: string;
  versionId?: string;
  range?: { start: number; end: number };
}