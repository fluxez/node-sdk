import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
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
    storageUrl?: string;
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
    pages?: number[] | 'all';
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
    content: string;
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
    duration?: number;
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
export declare class DocumentsClient {
    private httpClient;
    private config;
    private logger;
    constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger);
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
    generatePDF(options: GeneratePDFOptions): Promise<DocumentResult>;
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
    extractText(pdfUrl: string): Promise<TextExtractionResult>;
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
    mergePDFs(pdfUrls: string[], options?: MergePDFOptions): Promise<DocumentResult>;
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
    addWatermark(pdfUrl: string, watermark: string, options?: WatermarkOptions): Promise<DocumentResult>;
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
    splitPDF(pdfUrl: string, ranges: PageRange[], options?: SplitPDFOptions): Promise<DocumentResult[]>;
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
    compressPDF(pdfUrl: string, quality?: number): Promise<DocumentResult>;
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
    protectPDF(pdfUrl: string, password: string, permissions?: {
        allowPrinting?: boolean;
        allowCopying?: boolean;
        allowModification?: boolean;
        allowAnnotations?: boolean;
    }): Promise<DocumentResult>;
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
    performOCR(imageUrl: string, provider?: OCRProvider): Promise<OCRResult>;
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
    ocrPDF(pdfUrl: string, provider?: OCRProvider): Promise<OCRResult[]>;
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
    listTemplates(filters?: TemplateFilters): Promise<DocumentTemplate[]>;
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
    getTemplate(templateId: string): Promise<DocumentTemplate>;
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
    createTemplate(template: CreateTemplateOptions): Promise<DocumentTemplate>;
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
    updateTemplate(templateId: string, updates: Partial<CreateTemplateOptions>): Promise<DocumentTemplate>;
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
    deleteTemplate(templateId: string): Promise<void>;
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
    convertDocument(options: ConvertDocumentOptions): Promise<DocumentResult>;
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
    getProcessingLogs(filters?: LogFilters): Promise<ProcessingLog[]>;
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
    getProcessingLog(logId: string): Promise<ProcessingLog>;
}
//# sourceMappingURL=documents.d.ts.map