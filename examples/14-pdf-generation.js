/**
 * Fluxez SDK - PDF Generation & Document Processing Examples
 *
 * This example demonstrates how to use the Documents module for:
 * - Generating PDFs from HTML, URLs, and templates
 * - Extracting text from PDFs
 * - Merging and splitting PDFs
 * - Adding watermarks
 * - Compressing and protecting PDFs
 * - Document template management
 * - PDF conversion
 */

const { FluxezClient } = require('../dist');
require('dotenv').config();

const client = new FluxezClient(process.env.FLUXEZ_API_KEY || 'service_your_key_here');

async function pdfGenerationExamples() {
  console.log('=== Fluxez PDF Generation Examples ===\n');

  try {
    // ============================================
    // 1. Generate PDF from HTML
    // ============================================
    console.log('1. Generating PDF from HTML...');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; }
            .invoice { border: 1px solid #ddd; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
            .total { font-weight: bold; text-align: right; }
          </style>
        </head>
        <body>
          <div class="invoice">
            <h1>Invoice #INV-2024-001</h1>
            <p><strong>Date:</strong> January 15, 2024</p>
            <p><strong>Customer:</strong> Acme Corporation</p>
            <table>
              <thead>
                <tr><th>Description</th><th>Quantity</th><th>Price</th><th>Total</th></tr>
              </thead>
              <tbody>
                <tr><td>Website Development</td><td>1</td><td>$5,000</td><td>$5,000</td></tr>
                <tr><td>Mobile App Development</td><td>1</td><td>$8,000</td><td>$8,000</td></tr>
                <tr><td>Consulting Services</td><td>10 hrs</td><td>$200/hr</td><td>$2,000</td></tr>
              </tbody>
            </table>
            <p class="total">Total: $15,000</p>
          </div>
        </body>
      </html>
    `;

    const pdf1 = await client.documents.generatePDF({
      html: htmlContent,
      options: {
        format: 'A4',
        orientation: 'portrait',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%;">Invoice</div>',
        footerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
      },
      metadata: {
        title: 'Invoice INV-2024-001',
        author: 'Acme Corp',
        subject: 'Invoice for Services Rendered',
        keywords: ['invoice', 'billing', 'payment']
      }
    });
    console.log(`✓ PDF generated from HTML: ${pdf1.id}`);
    console.log(`  Download URL: ${pdf1.downloadUrl}`);
    console.log(`  File size: ${(pdf1.fileSize / 1024).toFixed(2)} KB`);
    console.log(`  Pages: ${pdf1.pageCount}`);
    console.log();

    // ============================================
    // 2. Generate PDF from URL
    // ============================================
    console.log('2. Generating PDF from URL...');

    const pdf2 = await client.documents.generatePDF({
      url: 'https://example.com',
      options: {
        format: 'A4',
        orientation: 'portrait',
        scale: 1,
        printBackground: true
      },
      metadata: {
        title: 'Example Website Screenshot',
        author: 'Fluxez PDF Generator'
      }
    });
    console.log(`✓ PDF generated from URL: ${pdf2.id}`);
    console.log(`  Download URL: ${pdf2.downloadUrl}`);
    console.log();

    // ============================================
    // 3. Generate PDF from Markdown
    // ============================================
    console.log('3. Generating PDF from Markdown...');

    const markdownContent = `
# Project Report

## Executive Summary
This report provides an overview of the Q1 2024 project deliverables.

## Key Achievements
- Completed website redesign
- Launched mobile application
- Increased user engagement by 45%

## Next Steps
1. Implement user feedback
2. Scale infrastructure
3. Expand to new markets

---
*Report generated on: ${new Date().toLocaleDateString()}*
    `;

    const pdf3 = await client.documents.generatePDF({
      markdown: markdownContent,
      options: {
        format: 'A4',
        orientation: 'portrait',
        margin: { top: '25mm', bottom: '25mm' }
      },
      metadata: {
        title: 'Q1 2024 Project Report',
        author: 'Project Team'
      }
    });
    console.log(`✓ PDF generated from Markdown: ${pdf3.id}`);
    console.log(`  Download URL: ${pdf3.downloadUrl}`);
    console.log();

    // ============================================
    // 4. Merge Multiple PDFs
    // ============================================
    console.log('4. Merging multiple PDFs...');

    const mergedPdf = await client.documents.mergePDFs(
      [pdf1.url, pdf2.url, pdf3.url],
      {
        outputFilename: 'combined-documents.pdf',
        metadata: {
          title: 'Combined Documents',
          author: 'Fluxez Document Processor'
        }
      }
    );
    console.log(`✓ PDFs merged: ${mergedPdf.id}`);
    console.log(`  Total pages: ${mergedPdf.pageCount}`);
    console.log(`  File size: ${(mergedPdf.fileSize / 1024).toFixed(2)} KB`);
    console.log();

    // ============================================
    // 5. Add Watermark to PDF
    // ============================================
    console.log('5. Adding watermark to PDF...');

    const watermarkedPdf = await client.documents.addWatermark(
      pdf1.url,
      'CONFIDENTIAL',
      {
        position: 'center',
        opacity: 0.3,
        rotation: 45,
        fontSize: 48,
        color: '#FF0000',
        pages: 'all'
      }
    );
    console.log(`✓ Watermark added: ${watermarkedPdf.id}`);
    console.log(`  Download URL: ${watermarkedPdf.downloadUrl}`);
    console.log();

    // ============================================
    // 6. Split PDF into Multiple Documents
    // ============================================
    console.log('6. Splitting PDF...');

    const splitPdfs = await client.documents.splitPDF(
      mergedPdf.url,
      [
        { start: 1, end: 1 },   // First page
        { start: 2, end: 3 },   // Pages 2-3
        { start: 4, end: mergedPdf.pageCount }  // Remaining pages
      ],
      {
        outputPrefix: 'split-document',
        storageFolder: 'split-pdfs/'
      }
    );
    console.log(`✓ PDF split into ${splitPdfs.length} documents:`);
    splitPdfs.forEach((pdf, index) => {
      console.log(`  ${index + 1}. ${pdf.id} (${pdf.pageCount} pages)`);
    });
    console.log();

    // ============================================
    // 7. Extract Text from PDF
    // ============================================
    console.log('7. Extracting text from PDF...');

    const extractedText = await client.documents.extractText(pdf1.url);
    console.log(`✓ Text extracted: ${extractedText.pageCount} pages`);
    console.log(`  Total words: ${extractedText.wordCount}`);
    console.log(`  Total characters: ${extractedText.characterCount}`);
    console.log(`  Language: ${extractedText.language || 'auto-detected'}`);
    console.log('\n  First 200 characters:');
    console.log(`  "${extractedText.text.substring(0, 200)}..."`);
    console.log('\n  Page breakdown:');
    extractedText.pages.forEach(page => {
      console.log(`    Page ${page.pageNumber}: ${page.wordCount} words`);
    });
    console.log();

    // ============================================
    // 8. Compress PDF
    // ============================================
    console.log('8. Compressing PDF...');

    const originalSize = mergedPdf.fileSize;
    const compressedPdf = await client.documents.compressPDF(mergedPdf.url, 70);
    const compressionRatio = ((1 - compressedPdf.fileSize / originalSize) * 100).toFixed(1);

    console.log(`✓ PDF compressed: ${compressedPdf.id}`);
    console.log(`  Original size: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`  Compressed size: ${(compressedPdf.fileSize / 1024).toFixed(2)} KB`);
    console.log(`  Compression ratio: ${compressionRatio}%`);
    console.log();

    // ============================================
    // 9. Protect PDF with Password
    // ============================================
    console.log('9. Protecting PDF with password...');

    const protectedPdf = await client.documents.protectPDF(
      pdf1.url,
      'SecurePassword123!',
      {
        allowPrinting: false,
        allowCopying: false,
        allowModification: false,
        allowAnnotations: true
      }
    );
    console.log(`✓ PDF protected: ${protectedPdf.id}`);
    console.log(`  Printing: disabled`);
    console.log(`  Copying: disabled`);
    console.log(`  Modification: disabled`);
    console.log(`  Annotations: enabled`);
    console.log();

    // ============================================
    // 10. Document Template Management
    // ============================================
    console.log('10. Managing document templates...');

    // Create template
    const template = await client.documents.createTemplate({
      name: 'Invoice Template',
      description: 'Standard invoice template for services',
      type: 'pdf',
      category: 'invoice',
      tags: ['billing', 'finance', 'invoice'],
      content: `
        <html>
          <head><style>body { font-family: Arial; margin: 40px; }</style></head>
          <body>
            <h1>Invoice #{{invoiceNumber}}</h1>
            <p><strong>Customer:</strong> {{customerName}}</p>
            <p><strong>Date:</strong> {{date}}</p>
            <p><strong>Total:</strong> ${{total}}</p>
          </body>
        </html>
      `,
      variables: [
        { name: 'invoiceNumber', type: 'string', required: true, description: 'Invoice number' },
        { name: 'customerName', type: 'string', required: true, description: 'Customer name' },
        { name: 'date', type: 'date', required: true, description: 'Invoice date' },
        { name: 'total', type: 'number', required: true, description: 'Total amount', validation: { min: 0 } }
      ],
      settings: {
        format: 'A4',
        orientation: 'portrait',
        margin: { top: '20mm', bottom: '20mm' }
      }
    });
    console.log(`✓ Template created: ${template.id}`);
    console.log(`  Name: ${template.name}`);
    console.log(`  Variables: ${template.variables.map(v => v.name).join(', ')}`);

    // List templates
    const templates = await client.documents.listTemplates({
      category: 'invoice',
      type: 'pdf'
    });
    console.log(`✓ Found ${templates.length} invoice templates`);

    // Generate PDF from template
    const templatePdf = await client.documents.generatePDF({
      template: template.id,
      templateData: {
        invoiceNumber: 'INV-2024-042',
        customerName: 'Tech Startup Inc.',
        date: new Date().toLocaleDateString(),
        total: 25000
      }
    });
    console.log(`✓ PDF generated from template: ${templatePdf.id}`);
    console.log();

    // ============================================
    // 11. Document Conversion
    // ============================================
    console.log('11. Converting documents...');

    const converted = await client.documents.convertDocument({
      sourceUrl: 'https://example.com/document.html',
      sourceFormat: 'html',
      targetFormat: 'pdf',
      options: {
        format: 'A4',
        orientation: 'portrait'
      }
    });
    console.log(`✓ Document converted: ${converted.id}`);
    console.log(`  Format: HTML → PDF`);
    console.log(`  Download URL: ${converted.downloadUrl}`);
    console.log();

    // ============================================
    // 12. Processing Logs
    // ============================================
    console.log('12. Checking processing logs...');

    const logs = await client.documents.getProcessingLogs({
      type: 'pdf',
      status: 'completed',
      limit: 5
    });
    console.log(`✓ Found ${logs.length} completed PDF operations:`);
    logs.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log.type}: ${log.status} (${log.duration}ms)`);
      if (log.output) {
        console.log(`     Output: ${(log.output.fileSize / 1024).toFixed(2)} KB, ${log.output.pageCount || 0} pages`);
      }
    });
    console.log();

    console.log('✓ All PDF generation examples completed!');

  } catch (error) {
    console.error('Error in PDF generation examples:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Real-world use case: Invoice generation workflow
async function invoiceGenerationWorkflow() {
  console.log('\n=== Real-world Invoice Generation Workflow ===\n');

  try {
    // Step 1: Create invoice template
    console.log('1. Creating invoice template...');
    const invoiceTemplate = await client.documents.createTemplate({
      name: 'Professional Invoice',
      type: 'pdf',
      category: 'invoice',
      content: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; margin: 0; padding: 40px; }
              .header { background: #2c3e50; color: white; padding: 20px; margin: -40px -40px 20px; }
              .company-name { font-size: 24px; font-weight: bold; }
              .invoice-details { margin: 20px 0; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th { background: #ecf0f1; padding: 10px; text-align: left; }
              td { padding: 10px; border-bottom: 1px solid #ecf0f1; }
              .total-section { text-align: right; margin-top: 20px; font-size: 18px; }
              .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #2c3e50; text-align: center; color: #7f8c8d; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">{{companyName}}</div>
              <div>{{companyAddress}}</div>
            </div>
            <div class="invoice-details">
              <h2>INVOICE #{{invoiceNumber}}</h2>
              <p><strong>Date:</strong> {{invoiceDate}}</p>
              <p><strong>Due Date:</strong> {{dueDate}}</p>
              <p><strong>Bill To:</strong><br>{{customerName}}<br>{{customerAddress}}</p>
            </div>
            <table>
              <thead>
                <tr><th>Description</th><th>Quantity</th><th>Rate</th><th>Amount</th></tr>
              </thead>
              <tbody>
                {{#items}}
                <tr><td>{{description}}</td><td>{{quantity}}</td><td>${{rate}}</td><td>${{amount}}</td></tr>
                {{/items}}
              </tbody>
            </table>
            <div class="total-section">
              <p>Subtotal: ${{subtotal}}</p>
              <p>Tax ({{taxRate}}%): ${{taxAmount}}</p>
              <p><strong>Total: ${{total}}</strong></p>
            </div>
            <div class="footer">
              <p>Thank you for your business!</p>
              <p>Payment terms: {{paymentTerms}}</p>
            </div>
          </body>
        </html>
      `,
      variables: [
        { name: 'companyName', type: 'string', required: true },
        { name: 'companyAddress', type: 'string', required: true },
        { name: 'invoiceNumber', type: 'string', required: true },
        { name: 'invoiceDate', type: 'date', required: true },
        { name: 'dueDate', type: 'date', required: true },
        { name: 'customerName', type: 'string', required: true },
        { name: 'customerAddress', type: 'string', required: true },
        { name: 'items', type: 'array', required: true },
        { name: 'subtotal', type: 'number', required: true },
        { name: 'taxRate', type: 'number', required: true },
        { name: 'taxAmount', type: 'number', required: true },
        { name: 'total', type: 'number', required: true },
        { name: 'paymentTerms', type: 'string', required: false }
      ]
    });
    console.log(`✓ Template created: ${invoiceTemplate.id}`);

    // Step 2: Generate invoice from template
    console.log('\n2. Generating invoice from template...');
    const invoice = await client.documents.generatePDF({
      template: invoiceTemplate.id,
      templateData: {
        companyName: 'Acme Software Solutions',
        companyAddress: '123 Tech Street, San Francisco, CA 94105',
        invoiceNumber: 'INV-2024-0042',
        invoiceDate: new Date().toLocaleDateString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        customerName: 'Tech Startup Inc.',
        customerAddress: '456 Innovation Ave, Austin, TX 78701',
        items: [
          { description: 'Web Application Development', quantity: 1, rate: 15000, amount: 15000 },
          { description: 'API Integration', quantity: 1, rate: 5000, amount: 5000 },
          { description: 'Testing & QA', quantity: 1, rate: 3000, amount: 3000 },
          { description: 'Deployment & Training', quantity: 1, rate: 2000, amount: 2000 }
        ],
        subtotal: 25000,
        taxRate: 8.5,
        taxAmount: 2125,
        total: 27125,
        paymentTerms: 'Net 30 days'
      }
    });
    console.log(`✓ Invoice generated: ${invoice.id}`);
    console.log(`  Download URL: ${invoice.downloadUrl}`);

    // Step 3: Add company watermark
    console.log('\n3. Adding watermark...');
    const watermarked = await client.documents.addWatermark(
      invoice.url,
      'PAID',
      {
        position: 'center',
        opacity: 0.2,
        rotation: 45,
        fontSize: 72,
        color: '#27ae60'
      }
    );
    console.log(`✓ Watermark added: ${watermarked.id}`);

    // Step 4: Compress for email
    console.log('\n4. Compressing for email delivery...');
    const compressed = await client.documents.compressPDF(watermarked.url, 75);
    console.log(`✓ Compressed: ${(compressed.fileSize / 1024).toFixed(2)} KB`);

    console.log('\n✓ Invoice generation workflow completed!');
    console.log(`\nFinal invoice: ${compressed.downloadUrl}`);

  } catch (error) {
    console.error('Error in invoice generation workflow:', error.message);
  }
}

// Run examples
if (require.main === module) {
  pdfGenerationExamples()
    .then(() => invoiceGenerationWorkflow())
    .then(() => {
      console.log('\n✓ All examples completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n✗ Example failed:', error);
      process.exit(1);
    });
}

module.exports = { pdfGenerationExamples, invoiceGenerationWorkflow };
