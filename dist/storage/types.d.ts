export type StorageProvider = 'local' | 'cloud' | 'fluxez';
export interface UploadOptions {
    fileName?: string;
    mimeType?: string;
    provider?: StorageProvider;
    bucket?: string;
    public?: boolean;
    storageClass?: string;
    metadata?: Record<string, string>;
    tags?: Record<string, string>;
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
    expiresIn?: number;
    contentType?: string;
    contentDisposition?: string;
    maxSize?: number;
    conditions?: Record<string, any>;
}
export interface ListFilesOptions {
    bucket?: string;
    prefix?: string;
    delimiter?: string;
    limit?: number;
    continuationToken?: string;
    startAfter?: string;
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
    range?: {
        start: number;
        end: number;
    };
}
//# sourceMappingURL=types.d.ts.map