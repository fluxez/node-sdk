/**
 * Fluxez SDK - OCR Processing Examples
 *
 * This example demonstrates how to use the Documents module for:
 * - Performing OCR on images
 * - Extracting text from scanned PDFs
 * - Using different OCR providers
 * - Processing OCR results
 * - Batch OCR operations
 */

const { FluxezClient } = require('../dist');
require('dotenv').config();

const client = new FluxezClient(process.env.FLUXEZ_API_KEY || 'service_your_key_here');

async function ocrProcessingExamples() {
  console.log('=== Fluxez OCR Processing Examples ===\n');

  try {
    // ============================================
    // 1. Basic OCR on Image (Tesseract)
    // ============================================
    console.log('1. Performing OCR on image with Tesseract...');

    const result1 = await client.documents.performOCR(
      'https://example.com/scanned-document.jpg',
      'tesseract'
    );
    console.log(`✓ OCR completed with Tesseract`);
    console.log(`  Confidence: ${result1.confidence}%`);
    console.log(`  Language: ${result1.language || 'auto-detected'}`);
    console.log(`  Text blocks: ${result1.blocks.length}`);
    console.log('\n  Extracted text (first 200 chars):');
    console.log(`  "${result1.text.substring(0, 200)}..."`);
    console.log();

    // ============================================
    // 2. OCR with Google Vision AI
    // ============================================
    console.log('2. Performing OCR with Google Vision AI...');

    const result2 = await client.documents.performOCR(
      'https://example.com/business-card.jpg',
      'google-vision'
    );
    console.log(`✓ OCR completed with Google Vision`);
    console.log(`  Confidence: ${result2.confidence}%`);
    console.log(`  Detected blocks: ${result2.blocks.length}`);

    // Process blocks by type
    const blocksByType = result2.blocks.reduce((acc, block) => {
      acc[block.type] = (acc[block.type] || 0) + 1;
      return acc;
    }, {});
    console.log('  Block types:');
    Object.entries(blocksByType).forEach(([type, count]) => {
      console.log(`    - ${type}: ${count}`);
    });
    console.log();

    // ============================================
    // 3. OCR with AWS Textract
    // ============================================
    console.log('3. Performing OCR with AWS Textract...');

    const result3 = await client.documents.performOCR(
      'https://example.com/invoice-scan.jpg',
      'aws-textract'
    );
    console.log(`✓ OCR completed with AWS Textract`);
    console.log(`  Confidence: ${result3.confidence}%`);
    console.log(`  Text blocks: ${result3.blocks.length}`);

    // Display high-confidence blocks
    const highConfidenceBlocks = result3.blocks.filter(b => b.confidence > 90);
    console.log(`  High confidence blocks (>90%): ${highConfidenceBlocks.length}`);
    console.log();

    // ============================================
    // 4. OCR with Azure Computer Vision
    // ============================================
    console.log('4. Performing OCR with Azure Computer Vision...');

    const result4 = await client.documents.performOCR(
      'https://example.com/receipt.jpg',
      'azure-vision'
    );
    console.log(`✓ OCR completed with Azure Vision`);
    console.log(`  Confidence: ${result4.confidence}%`);
    console.log(`  Language: ${result4.language || 'auto'}`);
    console.log();

    // ============================================
    // 5. OCR on Scanned PDF
    // ============================================
    console.log('5. Performing OCR on scanned PDF...');

    const pdfResults = await client.documents.ocrPDF(
      'https://example.com/scanned-contract.pdf',
      'google-vision'
    );
    console.log(`✓ OCR completed on PDF`);
    console.log(`  Total pages processed: ${pdfResults.length}`);
    console.log('\n  Page-by-page results:');
    pdfResults.forEach((pageResult, index) => {
      console.log(`    Page ${index + 1}:`);
      console.log(`      Text length: ${pageResult.text.length} characters`);
      console.log(`      Confidence: ${pageResult.confidence}%`);
      console.log(`      Blocks: ${pageResult.blocks.length}`);
    });
    console.log();

    // ============================================
    // 6. Extract Specific Information
    // ============================================
    console.log('6. Extracting specific information from OCR results...');

    // Example: Extract email addresses
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    const emails = result2.text.match(emailRegex) || [];
    console.log(`  Found ${emails.length} email addresses:`);
    emails.forEach(email => console.log(`    - ${email}`));

    // Example: Extract phone numbers
    const phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phones = result2.text.match(phoneRegex) || [];
    console.log(`  Found ${phones.length} phone numbers:`);
    phones.forEach(phone => console.log(`    - ${phone}`));

    // Example: Extract amounts/prices
    const priceRegex = /\$[\d,]+\.?\d*/g;
    const prices = result3.text.match(priceRegex) || [];
    console.log(`  Found ${prices.length} prices:`);
    prices.forEach(price => console.log(`    - ${price}`));
    console.log();

    // ============================================
    // 7. Analyze Block Positions
    // ============================================
    console.log('7. Analyzing text block positions...');

    const topBlocks = result2.blocks
      .filter(b => b.boundingBox.y < 200)
      .sort((a, b) => a.boundingBox.x - b.boundingBox.x);

    console.log(`  Blocks in top region (y < 200): ${topBlocks.length}`);
    console.log('  Top region text (left to right):');
    topBlocks.forEach(block => {
      console.log(`    "${block.text}" at (x: ${block.boundingBox.x}, y: ${block.boundingBox.y})`);
    });
    console.log();

    // ============================================
    // 8. Word-Level Analysis
    // ============================================
    console.log('8. Performing word-level analysis...');

    const wordsWithConfidence = [];
    result2.blocks.forEach(block => {
      if (block.words) {
        block.words.forEach(word => {
          wordsWithConfidence.push({
            text: word.text,
            confidence: word.confidence
          });
        });
      }
    });

    // Sort by confidence
    const lowConfidenceWords = wordsWithConfidence
      .filter(w => w.confidence < 80)
      .sort((a, b) => a.confidence - b.confidence)
      .slice(0, 5);

    console.log(`  Total words analyzed: ${wordsWithConfidence.length}`);
    console.log('  Lowest confidence words:');
    lowConfidenceWords.forEach(word => {
      console.log(`    "${word.text}": ${word.confidence}%`);
    });

    const avgConfidence = wordsWithConfidence.reduce((sum, w) => sum + w.confidence, 0) / wordsWithConfidence.length;
    console.log(`  Average word confidence: ${avgConfidence.toFixed(2)}%`);
    console.log();

    // ============================================
    // 9. Multi-Language OCR
    // ============================================
    console.log('9. Processing multi-language document...');

    const multiLangResult = await client.documents.performOCR(
      'https://example.com/multilingual-doc.jpg',
      'google-vision'
    );
    console.log(`✓ Multi-language OCR completed`);
    console.log(`  Detected language: ${multiLangResult.language || 'multiple'}`);
    console.log(`  Total text length: ${multiLangResult.text.length} characters`);
    console.log();

    // ============================================
    // 10. OCR Quality Metrics
    // ============================================
    console.log('10. Calculating OCR quality metrics...');

    const qualityMetrics = {
      averageConfidence: result2.confidence,
      totalBlocks: result2.blocks.length,
      highQualityBlocks: result2.blocks.filter(b => b.confidence > 90).length,
      mediumQualityBlocks: result2.blocks.filter(b => b.confidence >= 70 && b.confidence <= 90).length,
      lowQualityBlocks: result2.blocks.filter(b => b.confidence < 70).length,
      textLength: result2.text.length
    };

    console.log('  Quality Report:');
    console.log(`    Overall confidence: ${qualityMetrics.averageConfidence}%`);
    console.log(`    Total blocks: ${qualityMetrics.totalBlocks}`);
    console.log(`    High quality (>90%): ${qualityMetrics.highQualityBlocks} (${(qualityMetrics.highQualityBlocks / qualityMetrics.totalBlocks * 100).toFixed(1)}%)`);
    console.log(`    Medium quality (70-90%): ${qualityMetrics.mediumQualityBlocks} (${(qualityMetrics.mediumQualityBlocks / qualityMetrics.totalBlocks * 100).toFixed(1)}%)`);
    console.log(`    Low quality (<70%): ${qualityMetrics.lowQualityBlocks} (${(qualityMetrics.lowQualityBlocks / qualityMetrics.totalBlocks * 100).toFixed(1)}%)`);
    console.log(`    Extracted text: ${qualityMetrics.textLength} characters`);
    console.log();

    console.log('✓ All OCR processing examples completed!');

  } catch (error) {
    console.error('Error in OCR processing examples:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Real-world use case: Invoice data extraction
async function invoiceDataExtraction() {
  console.log('\n=== Real-world Invoice Data Extraction ===\n');

  try {
    console.log('Processing scanned invoice...');

    // Step 1: Perform OCR on invoice
    const ocrResult = await client.documents.performOCR(
      'https://example.com/invoice-12345.jpg',
      'aws-textract' // Use AWS Textract for better structured data extraction
    );
    console.log(`✓ OCR completed with ${ocrResult.confidence}% confidence`);

    // Step 2: Extract structured data
    const invoiceData = {
      invoiceNumber: null,
      date: null,
      total: null,
      vendor: null,
      items: []
    };

    // Extract invoice number
    const invNumberMatch = ocrResult.text.match(/Invoice\s*#?\s*:?\s*(\w+-?\d+)/i);
    if (invNumberMatch) {
      invoiceData.invoiceNumber = invNumberMatch[1];
    }

    // Extract date
    const dateMatch = ocrResult.text.match(/Date\s*:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i);
    if (dateMatch) {
      invoiceData.date = dateMatch[1];
    }

    // Extract total
    const totalMatch = ocrResult.text.match(/Total\s*:?\s*\$?([\d,]+\.?\d{0,2})/i);
    if (totalMatch) {
      invoiceData.total = parseFloat(totalMatch[1].replace(/,/g, ''));
    }

    // Extract vendor (usually in top blocks)
    const topBlocks = ocrResult.blocks
      .filter(b => b.boundingBox.y < 150 && b.type === 'line')
      .sort((a, b) => a.boundingBox.y - b.boundingBox.y);
    if (topBlocks.length > 0) {
      invoiceData.vendor = topBlocks[0].text;
    }

    // Step 3: Display extracted data
    console.log('\nExtracted Invoice Data:');
    console.log(`  Invoice Number: ${invoiceData.invoiceNumber || 'Not found'}`);
    console.log(`  Date: ${invoiceData.date || 'Not found'}`);
    console.log(`  Vendor: ${invoiceData.vendor || 'Not found'}`);
    console.log(`  Total: $${invoiceData.total?.toFixed(2) || 'Not found'}`);

    // Step 4: Confidence check
    console.log('\nData Quality:');
    const extractedFields = Object.values(invoiceData).filter(v => v !== null).length;
    const totalFields = Object.keys(invoiceData).length;
    const completeness = (extractedFields / totalFields * 100).toFixed(1);
    console.log(`  Completeness: ${completeness}% (${extractedFields}/${totalFields} fields)`);
    console.log(`  OCR Confidence: ${ocrResult.confidence}%`);

    if (ocrResult.confidence >= 90 && extractedFields >= totalFields * 0.8) {
      console.log('\n✓ High quality extraction - Ready for automated processing');
    } else if (ocrResult.confidence >= 70) {
      console.log('\n⚠ Medium quality extraction - Manual review recommended');
    } else {
      console.log('\n✗ Low quality extraction - Manual verification required');
    }

    // Step 5: Save results
    console.log('\nSaving extraction results...');
    console.log(`✓ Invoice data saved to database`);
    console.log(`✓ Original image archived`);

    console.log('\n✓ Invoice extraction workflow completed!');

  } catch (error) {
    console.error('Error in invoice extraction workflow:', error.message);
  }
}

// Batch OCR processing example
async function batchOCRProcessing() {
  console.log('\n=== Batch OCR Processing ===\n');

  try {
    const imagesToProcess = [
      { url: 'https://example.com/receipt-001.jpg', type: 'receipt' },
      { url: 'https://example.com/receipt-002.jpg', type: 'receipt' },
      { url: 'https://example.com/receipt-003.jpg', type: 'receipt' },
      { url: 'https://example.com/business-card-001.jpg', type: 'business-card' },
      { url: 'https://example.com/business-card-002.jpg', type: 'business-card' }
    ];

    console.log(`Processing ${imagesToProcess.length} images...`);

    const results = [];
    for (let i = 0; i < imagesToProcess.length; i++) {
      const image = imagesToProcess[i];
      console.log(`\n[${i + 1}/${imagesToProcess.length}] Processing ${image.type}...`);

      try {
        const ocrResult = await client.documents.performOCR(
          image.url,
          'google-vision'
        );

        results.push({
          ...image,
          success: true,
          confidence: ocrResult.confidence,
          textLength: ocrResult.text.length,
          blocks: ocrResult.blocks.length
        });

        console.log(`  ✓ Success - Confidence: ${ocrResult.confidence}%, Text: ${ocrResult.text.length} chars`);
      } catch (error) {
        results.push({
          ...image,
          success: false,
          error: error.message
        });
        console.log(`  ✗ Failed - ${error.message}`);
      }

      // Rate limiting
      if (i < imagesToProcess.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Summary
    console.log('\n=== Batch Processing Summary ===');
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const avgConfidence = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.confidence, 0) / successful;

    console.log(`Total processed: ${results.length}`);
    console.log(`Successful: ${successful} (${(successful / results.length * 100).toFixed(1)}%)`);
    console.log(`Failed: ${failed}`);
    console.log(`Average confidence: ${avgConfidence.toFixed(2)}%`);

    // Group by type
    const byType = results.reduce((acc, r) => {
      if (!acc[r.type]) acc[r.type] = { count: 0, success: 0 };
      acc[r.type].count++;
      if (r.success) acc[r.type].success++;
      return acc;
    }, {});

    console.log('\nBy document type:');
    Object.entries(byType).forEach(([type, stats]) => {
      console.log(`  ${type}: ${stats.success}/${stats.count} successful`);
    });

    console.log('\n✓ Batch OCR processing completed!');

  } catch (error) {
    console.error('Error in batch OCR processing:', error.message);
  }
}

// Run examples
if (require.main === module) {
  ocrProcessingExamples()
    .then(() => invoiceDataExtraction())
    .then(() => batchOCRProcessing())
    .then(() => {
      console.log('\n✓ All examples completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n✗ Example failed:', error);
      process.exit(1);
    });
}

module.exports = { ocrProcessingExamples, invoiceDataExtraction, batchOCRProcessing };
