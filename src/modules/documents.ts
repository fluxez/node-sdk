import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import { ApiResponse } from '../types';

// Document Types

/**
 * Options for generating PDF documents
 */
export interface GeneratePDFOptions {
  html?: string;
  url?: string;
  markdown?: string;
  template?: string;
  templateData?: Record<string, any>;
  options?: {
    format?: 'A4' | 'Letter' | 'Legal' | 'A3' | 'A5';
    orientation?: 'portrait' | 'landscape';
    margin?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
    scale?: number;
    displayHeaderFooter?: boolean;
    headerTemplate?: string;
    footerTemplate?: string;
    printBackground?: boolean;
    pageRanges?: string;
    preferCSSPageSize?: boolean;
  };
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    creator?: string;
  };
  storageUrl?: string; // Where to store the generated PDF
}

/**
 * Result from document generation
 */
export interface DocumentResult {
  id: string;
  type: 'pdf' | 'docx' | 'image';
  url: string;
  downloadUrl: string;
  fileSize: number;
  pageCount?: number;
  createdAt: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

/**
 * Text extraction result
 */
export interface TextExtractionResult {
  text: string;
  pageCount: number;
  pages: Array<{
    pageNumber: number;
    text: string;
    wordCount: number;
  }>;
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    createdAt?: string;
    modifiedAt?: string;
  };
  language?: string;
  wordCount: number;
  characterCount: number;
}

/**
 * Page range for PDF operations
 */
export interface PageRange {
  start: number;
  end: number;
}

/**
 * Watermark options
 */
export interface WatermarkOptions {
  text?: string;
  image?: string;
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  opacity?: number;
  rotation?: number;
  fontSize?: number;
  color?: string;
  pages?: number[] | 'all'; // Specific pages or all pages
}

/**
 * OCR provider options
 */
export type OCRProvider = 'tesseract' | 'google-vision' | 'aws-textract' | 'azure-vision';

/**
 * OCR result
 */
export interface OCRResult {
  text: string;
  confidence: number;
  language?: string;
  blocks: OCRBlock[];
  pageNumber?: number;
}

/**
 * OCR text block
 */
export interface OCRBlock {
  text: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  type: 'word' | 'line' | 'paragraph' | 'page';
  words?: OCRWord[];
}

/**
 * OCR word
 */
export interface OCRWord {
  text: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Template filters
 */
export interface TemplateFilters {
  category?: string;
  type?: 'pdf' | 'docx' | 'email' | 'invoice' | 'report';
  tags?: string[];
  limit?: number;
  offset?: number;
}

/**
 * Document template
 */
export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  type: 'pdf' | 'docx' | 'email' | 'invoice' | 'report';
  category?: string;
  tags: string[];
  content: string; // HTML/Markdown content with variables
  variables: TemplateVariable[];
  defaultData?: Record<string, any>;
  settings?: {
    format?: string;
    orientation?: string;
    margin?: Record<string, string>;
  };
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Template variable definition
 */
export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  required: boolean;
  defaultValue?: any;
  description?: string;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    enum?: any[];
  };
}

/**
 * Options for creating a template
 */
export interface CreateTemplateOptions {
  name: string;
  description?: string;
  type: 'pdf' | 'docx' | 'email' | 'invoice' | 'report';
  category?: string;
  tags?: string[];
  content: string;
  variables?: TemplateVariable[];
  defaultData?: Record<string, any>;
  settings?: {
    format?: string;
    orientation?: string;
    margin?: Record<string, string>;
  };
}

/**
 * Processing log filters
 */
export interface LogFilters {
  type?: 'pdf' | 'ocr' | 'conversion' | 'merge' | 'split';
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  startDate?: Date | string;
  endDate?: Date | string;
  limit?: number;
  offset?: number;
}

/**
 * Document processing log
 */
export interface ProcessingLog {
  id: string;
  type: 'pdf' | 'ocr' | 'conversion' | 'merge' | 'split' | 'watermark';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input: {
    sourceUrl?: string;
    sourceUrls?: string[];
    options?: Record<string, any>;
  };
  output?: {
    url: string;
    fileSize: number;
    pageCount?: number;
  };
  error?: string;
  duration?: number; // milliseconds
  createdAt: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

/**
 * PDF merge options
 */
export interface MergePDFOptions {
  outputFilename?: string;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
  };
}

/**
 * PDF split options
 */
export interface SplitPDFOptions {
  outputPrefix?: string;
  storageFolder?: string;
}

/**
 * Convert document options
 */
export interface ConvertDocumentOptions {
  sourceUrl: string;
  sourceFormat: 'html' | 'markdown' | 'docx' | 'txt';
  targetFormat: 'pdf' | 'docx' | 'html';
  options?: GeneratePDFOptions['options'];
}

/**
 * Documents Client for PDF, OCR, and document operations
 */
export class DocumentsClient {
  private httpClient: AxiosInstance;
  private config: FluxezConfig;
  private logger: Logger;

  constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger) {
    this.httpClient = httpClient;
    this.config = config;
    this.logger = logger;
  }

  // ============================================
  // PDF Generation
  // ============================================

  /**
   * Generate PDF from HTML, URL, or template
   *
   * @param options - PDF generation options
   * @returns Generated PDF document result
   *
   * @example
   * ```typescript
   * // Generate from HTML
   * const pdf = await client.documents.generatePDF({
   *   html: '<h1>Invoice</h1><p>Total: $100</p>',
   *   options: {
   *     format: 'A4',
   *     orientation: 'portrait',
   *     margin: { top: '20mm', bottom: '20mm' }
   *   },
   *   metadata: {
   *     title: 'Invoice #1234',
   *     author: 'Acme Corp'
   *   }
   * });
   * console.log(`PDF: ${pdf.downloadUrl}`);
   *
   * // Generate from URL
   * const pdf2 = await client.documents.generatePDF({
   *   url: 'https://example.com/invoice',
   *   options: { format: 'A4' }
   * });
   *
   * // Generate from template
   * const pdf3 = await client.documents.generatePDF({
   *   template: 'invoice-template',
   *   templateData: {
   *     invoiceNumber: '1234',
   *     customer: 'John Doe',
   *     total: 100
   *   }
   * });
   * ```
   */
  async generatePDF(options: GeneratePDFOptions): Promise<DocumentResult> {
    try {
      this.logger.debug('Generating PDF', options);

      const response = await this.httpClient.post<ApiResponse<DocumentResult>>(
        '/documents/pdf/generate',
        options
      );

      this.logger.info('PDF generated', { id: response.data.data.id, url: response.data.data.url });
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to generate PDF', error);
      throw error;
    }
  }

  /**
   * Extract text from PDF
   *
   * @param pdfUrl - URL or path to PDF file
   * @returns Extracted text result
   *
   * @example
   * ```typescript
   * const result = await client.documents.extractText('https://example.com/document.pdf');
   * console.log(`Text: ${result.text}`);
   * console.log(`Pages: ${result.pageCount}`);
   * result.pages.forEach(page => {
   *   console.log(`Page ${page.pageNumber}: ${page.wordCount} words`);
   * });
   * ```
   */
  async extractText(pdfUrl: string): Promise<TextExtractionResult> {
    try {
      this.logger.debug('Extracting text from PDF', { pdfUrl });

      const response = await this.httpClient.post<ApiResponse<TextExtractionResult>>(
        '/documents/pdf/extract-text',
        { pdfUrl }
      );

      this.logger.info('Text extracted from PDF', { pageCount: response.data.data.pageCount });
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to extract text from PDF', error);
      throw error;
    }
  }

  /**
   * Merge multiple PDFs into one
   *
   * @param pdfUrls - Array of PDF URLs to merge
   * @param options - Merge options
   * @returns Merged PDF result
   *
   * @example
   * ```typescript
   * const merged = await client.documents.mergePDFs([
   *   'https://example.com/doc1.pdf',
   *   'https://example.com/doc2.pdf',
   *   'https://example.com/doc3.pdf'
   * ], {
   *   metadata: {
   *     title: 'Combined Document',
   *     author: 'Acme Corp'
   *   }
   * });
   * ```
   */
  async mergePDFs(pdfUrls: string[], options?: MergePDFOptions): Promise<DocumentResult> {
    try {
      this.logger.debug('Merging PDFs', { count: pdfUrls.length });

      const response = await this.httpClient.post<ApiResponse<DocumentResult>>(
        '/documents/pdf/merge',
        {
          pdfUrls,
          ...options,
        }
      );

      this.logger.info('PDFs merged', { id: response.data.data.id, pageCount: response.data.data.pageCount });
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to merge PDFs', error);
      throw error;
    }
  }

  /**
   * Add watermark to PDF
   *
   * @param pdfUrl - URL or path to PDF file
   * @param watermark - Watermark text or image URL
   * @param options - Watermark options
   * @returns Watermarked PDF result
   *
   * @example
   * ```typescript
   * const watermarked = await client.documents.addWatermark(
   *   'https://example.com/document.pdf',
   *   'CONFIDENTIAL',
   *   {
   *     position: 'center',
   *     opacity: 0.3,
   *     rotation: 45,
   *     fontSize: 48,
   *     color: '#FF0000'
   *   }
   * );
   * ```
   */
  async addWatermark(
    pdfUrl: string,
    watermark: string,
    options?: WatermarkOptions
  ): Promise<DocumentResult> {
    try {
      this.logger.debug('Adding watermark to PDF', { pdfUrl, watermark });

      const response = await this.httpClient.post<ApiResponse<DocumentResult>>(
        '/documents/pdf/watermark',
        {
          pdfUrl,
          watermark,
          ...options,
        }
      );

      this.logger.info('Watermark added to PDF', { id: response.data.data.id });
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to add watermark to PDF', error);
      throw error;
    }
  }

  /**
   * Split PDF into multiple documents
   *
   * @param pdfUrl - URL or path to PDF file
   * @param ranges - Array of page ranges to extract
   * @param options - Split options
   * @returns Array of split PDF results
   *
   * @example
   * ```typescript
   * const split = await client.documents.splitPDF(
   *   'https://example.com/document.pdf',
   *   [
   *     { start: 1, end: 5 },   // Pages 1-5
   *     { start: 6, end: 10 },  // Pages 6-10
   *     { start: 11, end: 15 }  // Pages 11-15
   *   ]
   * );
   * console.log(`Created ${split.length} PDFs`);
   * ```
   */
  async splitPDF(pdfUrl: string, ranges: PageRange[], options?: SplitPDFOptions): Promise<DocumentResult[]> {
    try {
      this.logger.debug('Splitting PDF', { pdfUrl, rangeCount: ranges.length });

      const response = await this.httpClient.post<ApiResponse<{ documents: DocumentResult[] }>>(
        '/documents/pdf/split',
        {
          pdfUrl,
          ranges,
          ...options,
        }
      );

      this.logger.info('PDF split completed', { count: response.data.data.documents.length });
      return response.data.data.documents;
    } catch (error) {
      this.logger.error('Failed to split PDF', error);
      throw error;
    }
  }

  /**
   * Compress PDF to reduce file size
   *
   * @param pdfUrl - URL or path to PDF file
   * @param quality - Compression quality (1-100)
   * @returns Compressed PDF result
   *
   * @example
   * ```typescript
   * const compressed = await client.documents.compressPDF(
   *   'https://example.com/large-document.pdf',
   *   70 // 70% quality
   * );
   * console.log(`Original: ${originalSize}MB, Compressed: ${compressed.fileSize}MB`);
   * ```
   */
  async compressPDF(pdfUrl: string, quality: number = 75): Promise<DocumentResult> {
    try {
      this.logger.debug('Compressing PDF', { pdfUrl, quality });

      const response = await this.httpClient.post<ApiResponse<DocumentResult>>(
        '/documents/pdf/compress',
        {
          pdfUrl,
          quality,
        }
      );

      this.logger.info('PDF compressed', { id: response.data.data.id, fileSize: response.data.data.fileSize });
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to compress PDF', error);
      throw error;
    }
  }

  /**
   * Protect PDF with password
   *
   * @param pdfUrl - URL or path to PDF file
   * @param password - Password for encryption
   * @param permissions - Optional permission settings
   * @returns Protected PDF result
   *
   * @example
   * ```typescript
   * const protected = await client.documents.protectPDF(
   *   'https://example.com/document.pdf',
   *   'mySecretPassword',
   *   {
   *     allowPrinting: false,
   *     allowCopying: false,
   *     allowModification: false
   *   }
   * );
   * ```
   */
  async protectPDF(
    pdfUrl: string,
    password: string,
    permissions?: {
      allowPrinting?: boolean;
      allowCopying?: boolean;
      allowModification?: boolean;
      allowAnnotations?: boolean;
    }
  ): Promise<DocumentResult> {
    try {
      this.logger.debug('Protecting PDF', { pdfUrl });

      const response = await this.httpClient.post<ApiResponse<DocumentResult>>(
        '/documents/pdf/protect',
        {
          pdfUrl,
          password,
          permissions,
        }
      );

      this.logger.info('PDF protected', { id: response.data.data.id });
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to protect PDF', error);
      throw error;
    }
  }

  // ============================================
  // OCR Operations
  // ============================================

  /**
   * Perform OCR on image
   *
   * @param imageUrl - URL or path to image file
   * @param provider - OCR provider to use
   * @returns OCR result
   *
   * @example
   * ```typescript
   * const result = await client.documents.performOCR(
   *   'https://example.com/scanned-document.jpg',
   *   'google-vision'
   * );
   * console.log(`Extracted text: ${result.text}`);
   * console.log(`Confidence: ${result.confidence}%`);
   * ```
   */
  async performOCR(imageUrl: string, provider: OCRProvider = 'tesseract'): Promise<OCRResult> {
    try {
      this.logger.debug('Performing OCR', { imageUrl, provider });

      const response = await this.httpClient.post<ApiResponse<OCRResult>>(
        '/documents/ocr/image',
        {
          imageUrl,
          provider,
        }
      );

      this.logger.info('OCR completed', { confidence: response.data.data.confidence });
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to perform OCR', error);
      throw error;
    }
  }

  /**
   * Perform OCR on PDF pages
   *
   * @param pdfUrl - URL or path to PDF file
   * @param provider - OCR provider to use
   * @returns Array of OCR results (one per page)
   *
   * @example
   * ```typescript
   * const results = await client.documents.ocrPDF(
   *   'https://example.com/scanned.pdf',
   *   'aws-textract'
   * );
   * results.forEach((page, index) => {
   *   console.log(`Page ${index + 1}: ${page.text}`);
   * });
   * ```
   */
  async ocrPDF(pdfUrl: string, provider: OCRProvider = 'tesseract'): Promise<OCRResult[]> {
    try {
      this.logger.debug('Performing OCR on PDF', { pdfUrl, provider });

      const response = await this.httpClient.post<ApiResponse<{ results: OCRResult[] }>>(
        '/documents/ocr/pdf',
        {
          pdfUrl,
          provider,
        }
      );

      this.logger.info('PDF OCR completed', { pageCount: response.data.data.results.length });
      return response.data.data.results;
    } catch (error) {
      this.logger.error('Failed to perform PDF OCR', error);
      throw error;
    }
  }

  // ============================================
  // Template Management
  // ============================================

  /**
   * List available document templates
   *
   * @param filters - Optional filters for templates
   * @returns Array of templates
   *
   * @example
   * ```typescript
   * const templates = await client.documents.listTemplates({
   *   category: 'invoice',
   *   type: 'pdf'
   * });
   * ```
   */
  async listTemplates(filters?: TemplateFilters): Promise<DocumentTemplate[]> {
    try {
      this.logger.debug('Listing document templates', filters);

      const response = await this.httpClient.get<ApiResponse<{ templates: DocumentTemplate[] }>>(
        '/documents/templates',
        { params: filters }
      );

      return response.data.data.templates;
    } catch (error) {
      this.logger.error('Failed to list document templates', error);
      throw error;
    }
  }

  /**
   * Get template details
   *
   * @param templateId - Template identifier
   * @returns Template details
   *
   * @example
   * ```typescript
   * const template = await client.documents.getTemplate('tpl_invoice_001');
   * console.log(`Variables: ${template.variables.map(v => v.name).join(', ')}`);
   * ```
   */
  async getTemplate(templateId: string): Promise<DocumentTemplate> {
    try {
      this.logger.debug('Getting document template', { templateId });

      const response = await this.httpClient.get<ApiResponse<DocumentTemplate>>(
        `/documents/templates/${templateId}`
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get document template', error);
      throw error;
    }
  }

  /**
   * Create new document template
   *
   * @param template - Template configuration
   * @returns Created template
   *
   * @example
   * ```typescript
   * const template = await client.documents.createTemplate({
   *   name: 'Invoice Template',
   *   type: 'pdf',
   *   category: 'invoice',
   *   content: '<html><body><h1>Invoice #{{invoiceNumber}}</h1>...</body></html>',
   *   variables: [
   *     { name: 'invoiceNumber', type: 'string', required: true },
   *     { name: 'customerName', type: 'string', required: true },
   *     { name: 'total', type: 'number', required: true }
   *   ]
   * });
   * ```
   */
  async createTemplate(template: CreateTemplateOptions): Promise<DocumentTemplate> {
    try {
      this.logger.debug('Creating document template', { name: template.name });

      const response = await this.httpClient.post<ApiResponse<DocumentTemplate>>(
        '/documents/templates',
        template
      );

      this.logger.info('Document template created', { id: response.data.data.id, name: template.name });
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to create document template', error);
      throw error;
    }
  }

  /**
   * Update document template
   *
   * @param templateId - Template identifier
   * @param updates - Template updates
   * @returns Updated template
   *
   * @example
   * ```typescript
   * const updated = await client.documents.updateTemplate('tpl_001', {
   *   content: '<html>...</html>',
   *   tags: ['invoice', 'v2']
   * });
   * ```
   */
  async updateTemplate(templateId: string, updates: Partial<CreateTemplateOptions>): Promise<DocumentTemplate> {
    try {
      this.logger.debug('Updating document template', { templateId });

      const response = await this.httpClient.put<ApiResponse<DocumentTemplate>>(
        `/documents/templates/${templateId}`,
        updates
      );

      this.logger.info('Document template updated', { templateId });
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to update document template', error);
      throw error;
    }
  }

  /**
   * Delete document template
   *
   * @param templateId - Template identifier
   *
   * @example
   * ```typescript
   * await client.documents.deleteTemplate('tpl_old_invoice');
   * ```
   */
  async deleteTemplate(templateId: string): Promise<void> {
    try {
      this.logger.debug('Deleting document template', { templateId });

      await this.httpClient.delete(`/documents/templates/${templateId}`);

      this.logger.info('Document template deleted', { templateId });
    } catch (error) {
      this.logger.error('Failed to delete document template', error);
      throw error;
    }
  }

  // ============================================
  // Document Conversion
  // ============================================

  /**
   * Convert document from one format to another
   *
   * @param options - Conversion options
   * @returns Converted document result
   *
   * @example
   * ```typescript
   * const converted = await client.documents.convertDocument({
   *   sourceUrl: 'https://example.com/document.docx',
   *   sourceFormat: 'docx',
   *   targetFormat: 'pdf',
   *   options: { format: 'A4', orientation: 'portrait' }
   * });
   * ```
   */
  async convertDocument(options: ConvertDocumentOptions): Promise<DocumentResult> {
    try {
      this.logger.debug('Converting document', options);

      const response = await this.httpClient.post<ApiResponse<DocumentResult>>(
        '/documents/convert',
        options
      );

      this.logger.info('Document converted', { id: response.data.data.id });
      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to convert document', error);
      throw error;
    }
  }

  // ============================================
  // Processing History
  // ============================================

  /**
   * Get document processing logs
   *
   * @param filters - Optional filters for logs
   * @returns Array of processing logs
   *
   * @example
   * ```typescript
   * const logs = await client.documents.getProcessingLogs({
   *   type: 'pdf',
   *   status: 'completed',
   *   startDate: '2024-01-01'
   * });
   * ```
   */
  async getProcessingLogs(filters?: LogFilters): Promise<ProcessingLog[]> {
    try {
      this.logger.debug('Getting processing logs', filters);

      const response = await this.httpClient.get<ApiResponse<{ logs: ProcessingLog[] }>>(
        '/documents/logs',
        { params: filters }
      );

      return response.data.data.logs;
    } catch (error) {
      this.logger.error('Failed to get processing logs', error);
      throw error;
    }
  }

  /**
   * Get specific processing log
   *
   * @param logId - Log identifier
   * @returns Processing log details
   *
   * @example
   * ```typescript
   * const log = await client.documents.getProcessingLog('log_abc123');
   * console.log(`Status: ${log.status}, Duration: ${log.duration}ms`);
   * ```
   */
  async getProcessingLog(logId: string): Promise<ProcessingLog> {
    try {
      const response = await this.httpClient.get<ApiResponse<ProcessingLog>>(
        `/documents/logs/${logId}`
      );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to get processing log', error);
      throw error;
    }
  }
}
