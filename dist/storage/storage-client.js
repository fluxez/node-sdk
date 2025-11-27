"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageClient = void 0;
const form_data_1 = __importDefault(require("form-data"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Detect if we're in a Cloudflare Workers/Web environment
// This enables proper FormData handling across different runtime environments
const isWorkersEnvironment = typeof globalThis !== 'undefined' &&
    typeof globalThis.FormData !== 'undefined' &&
    typeof fs.existsSync === 'undefined';
class StorageClient {
    constructor(httpClient, config, logger) {
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
    async upload(content, filePath, options = {}) {
        try {
            let formData;
            const headers = {};
            // In Cloudflare Workers/Web environment, use Web API FormData with Blob
            if (isWorkersEnvironment && Buffer.isBuffer(content)) {
                formData = new FormData(); // Web API FormData
                // Create Blob from Buffer for Workers environment
                const blob = new Blob([content], {
                    type: options.contentType || 'application/octet-stream'
                });
                const filename = path.basename(filePath) || 'file';
                formData.append('file', blob, filename);
                formData.append('path', filePath);
                if (options.metadata) {
                    formData.append('metadata', JSON.stringify(options.metadata));
                }
                // Don't set Content-Type header - let browser/Workers set it with boundary
            }
            else {
                // Node.js environment - use form-data package
                formData = new form_data_1.default();
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
                }
                else if (Buffer.isBuffer(content)) {
                    // Buffer provided
                    const filename = path.basename(filePath) || 'file';
                    formData.append('file', content, {
                        filename,
                        contentType: options.contentType || 'application/octet-stream'
                    });
                }
                else {
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
                // Get headers for Node.js FormData
                if (typeof formData.getHeaders === 'function') {
                    Object.assign(headers, formData.getHeaders());
                }
            }
            const response = await this.httpClient.post('/storage/upload', formData, {
                headers,
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
            });
            // Handle both response formats: with success wrapper and direct data
            if (response.data && (response.data.success === false)) {
                throw new Error(response.data.message || 'Upload failed');
            }
            this.logger.debug('File uploaded successfully', { path: filePath });
            // Return data directly if no success wrapper, otherwise return data.data
            return response.data.data || response.data;
        }
        catch (error) {
            this.logger.error('Upload failed', { error: error.message, path: filePath });
            throw error;
        }
    }
    /**
     * Get a file from storage through the backend API
     * @param filePath - Path of the file to retrieve
     */
    async getFile(filePath) {
        try {
            const response = await this.httpClient.get(`/storage/file`, {
                params: { path: filePath }
            });
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to get file');
            }
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to get file', { error: error.message, path: filePath });
            throw error;
        }
    }
    /**
     * Download a file from storage
     * @param filePath - Path of the file to download
     */
    async download(filePath) {
        try {
            const response = await this.httpClient.get(`/storage/download`, {
                params: { path: filePath },
                responseType: 'arraybuffer'
            });
            return Buffer.from(response.data);
        }
        catch (error) {
            this.logger.error('Download failed', { error: error.message, path: filePath });
            throw error;
        }
    }
    /**
     * Delete a file from storage through the backend API
     * @param filePath - Path of the file to delete
     */
    async delete(filePath) {
        try {
            const response = await this.httpClient.delete(`/storage/file`, {
                params: { path: filePath }
            });
            if (!response.data.success) {
                throw new Error(response.data.message || 'Delete failed');
            }
            this.logger.debug('File deleted successfully', { path: filePath });
            return true;
        }
        catch (error) {
            this.logger.error('Delete failed', { error: error.message, path: filePath });
            throw error;
        }
    }
    /**
     * Get public URL for a file
     * @param filePath - Path of the file
     */
    getPublicUrl(filePath) {
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
    async createSignedUrl(filePath, expiresIn = 3600) {
        try {
            const response = await this.httpClient.post('/storage/signed-url', {
                path: filePath,
                expiresIn
            });
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to create signed URL');
            }
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to create signed URL', { error: error.message, path: filePath });
            throw error;
        }
    }
    /**
     * List files in a directory
     * @param prefix - Directory prefix to list files from
     */
    async list(prefix) {
        try {
            const response = await this.httpClient.get('/storage/list', {
                params: { prefix }
            });
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to list files');
            }
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to list files', { error: error.message, prefix });
            throw error;
        }
    }
}
exports.StorageClient = StorageClient;
//# sourceMappingURL=storage-client.js.map