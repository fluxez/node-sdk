/**
 * Fluxez SDK - Storage Examples
 * 
 * This example demonstrates comprehensive file storage and management using the Fluxez SDK.
 * Perfect for file management, content delivery, and media handling scenarios.
 * 
 * Features demonstrated:
 * - File upload (various types and sizes)
 * - File download and streaming
 * - Presigned URL generation
 * - File listing and search
 * - File metadata management
 * - Folder/directory operations
 * - File versioning
 * - Storage analytics
 * 
 * Time to complete: ~10 minutes
 */

const { FluxezClient } = require('@fluxez/node-sdk');
const fs = require('fs');
const path = require('path');

// Configuration
const API_KEY = process.env.FLUXEZ_API_KEY || 'cgx_your_api_key_here';
const API_URL = process.env.FLUXEZ_API_URL || 'https://api.fluxez.com/api/v1';

async function storageExamplesMain() {
  console.log('📁 Fluxez SDK Storage Examples\n');

  const client = new FluxezClient(API_KEY, {
    apiUrl: API_URL,
    debug: true,
    timeout: 120000, // Longer timeout for file operations
  });

  try {
    // Test connection
    const connectionTest = await client.testConnection();
    if (!connectionTest.connected) {
      throw new Error('Cannot connect to backend. Please ensure the Fluxez backend is running.');
    }
    console.log('✅ Connected to Fluxez backend\n');

    // Set context
    client.setOrganization('org_storage_demo');
    client.setProject('proj_storage_demo');

    await demonstrateBasicUpload(client);
    await demonstrateFileTypes(client);
    await demonstratePresignedUrls(client);
    await demonstrateFileManagement(client);
    await demonstrateDirectoryOperations(client);
    await demonstrateFileSearch(client);
    await demonstrateFileVersioning(client);
    await demonstrateStorageAnalytics(client);
    await demonstrateAdvancedFeatures(client);

    console.log('\n🎉 Storage Examples Complete!');

  } catch (error) {
    console.error('❌ Storage examples failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Ensure your backend has storage service configured');
    console.log('- Check that cloud storage credentials are properly set');
    console.log('- Verify your API key has storage permissions');
  }
}

async function demonstrateBasicUpload(client) {
  console.log('📤 Basic File Upload\n');
  console.log('==========================================');

  try {
    console.log('1. Upload text file:');
    
    // Create a simple text file
    const textContent = `Fluxez SDK Storage Demo
======================

This is a test file uploaded using the Fluxez SDK storage module.

Features:
- Secure file storage
- Automatic metadata extraction
- CDN integration
- Version control
- Access control

Uploaded at: ${new Date().toISOString()}
File size: ${Buffer.byteLength('Sample content', 'utf8')} bytes

Thank you for using Fluxez!`;

    const textUploadResult = await client.storage.upload(
      Buffer.from(textContent, 'utf-8'),
      {
        fileName: `demo-text-${Date.now()}.txt`,
        contentType: 'text/plain',
        metadata: {
          description: 'Demo text file from SDK examples',
          category: 'documentation',
          source: 'fluxez-sdk-examples'
        }
      }
    );

    console.log('✅ Text file uploaded:', {
      url: textUploadResult.url,
      fileName: textUploadResult.fileName,
      size: textUploadResult.size,
      key: textUploadResult.key
    });

    console.log('\n2. Upload with custom path:');
    
    const customPathResult = await client.storage.upload(
      Buffer.from('Custom path file content'),
      {
        fileName: 'custom-file.txt',
        path: 'documents/examples/',
        contentType: 'text/plain',
        metadata: {
          folder: 'examples',
          type: 'sample'
        }
      }
    );

    console.log('✅ Custom path file uploaded:', customPathResult);

    console.log('\n3. Upload with access control:');
    
    const privateUploadResult = await client.storage.upload(
      Buffer.from('This is private content'),
      {
        fileName: 'private-document.txt',
        path: 'private/',
        contentType: 'text/plain',
        isPublic: false, // Private file
        accessControl: {
          read: ['user_123', 'user_456'],
          write: ['user_123']
        },
        metadata: {
          classification: 'private',
          owner: 'user_123'
        }
      }
    );

    console.log('✅ Private file uploaded:', privateUploadResult);

    return {
      textFile: textUploadResult,
      customPathFile: customPathResult,
      privateFile: privateUploadResult
    };

  } catch (error) {
    console.error('❌ Basic upload failed:', error.message);
    return null;
  }
}

async function demonstrateFileTypes(client) {
  console.log('\n📄 Different File Types\n');
  console.log('==========================================');

  try {
    console.log('1. Upload JSON configuration:');
    
    const jsonConfig = {
      appName: 'Fluxez Demo',
      version: '1.0.0',
      environment: 'development',
      features: {
        storage: true,
        email: true,
        analytics: true,
        ai: true
      },
      settings: {
        maxFileSize: '100MB',
        allowedTypes: ['image/*', 'application/pdf', 'text/*'],
        autoBackup: true
      },
      createdAt: new Date().toISOString()
    };

    const jsonUploadResult = await client.storage.upload(
      Buffer.from(JSON.stringify(jsonConfig, null, 2)),
      {
        fileName: 'app-config.json',
        path: 'config/',
        contentType: 'application/json',
        metadata: {
          type: 'configuration',
          format: 'json',
          version: '1.0'
        }
      }
    );

    console.log('✅ JSON file uploaded:', jsonUploadResult);

    console.log('\n2. Upload CSV data:');
    
    const csvData = `Name,Email,Department,Join Date,Salary
John Doe,john@example.com,Engineering,2024-01-15,75000
Jane Smith,jane@example.com,Design,2024-02-01,70000
Bob Johnson,bob@example.com,Marketing,2024-01-08,65000
Alice Brown,alice@example.com,Sales,2024-02-10,68000
Charlie Wilson,charlie@example.com,Engineering,2024-01-22,78000`;

    const csvUploadResult = await client.storage.upload(
      Buffer.from(csvData),
      {
        fileName: `employee-data-${new Date().toISOString().split('T')[0]}.csv`,
        path: 'data/hr/',
        contentType: 'text/csv',
        metadata: {
          type: 'dataset',
          format: 'csv',
          records: 5,
          department: 'hr'
        }
      }
    );

    console.log('✅ CSV file uploaded:', csvUploadResult);

    console.log('\n3. Upload HTML document:');
    
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fluxez Storage Demo Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { background: #4A90E2; color: white; padding: 20px; text-align: center; border-radius: 10px; }
        .content { margin: 20px 0; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #4A90E2; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 40px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Storage Usage Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div class="content">
        <h2>Storage Statistics</h2>
        <div class="stats">
            <div class="stat-card">
                <h3>Total Files</h3>
                <p style="font-size: 24px; color: #4A90E2;">1,247</p>
            </div>
            <div class="stat-card">
                <h3>Storage Used</h3>
                <p style="font-size: 24px; color: #4A90E2;">2.3 GB</p>
            </div>
            <div class="stat-card">
                <h3>Files This Month</h3>
                <p style="font-size: 24px; color: #4A90E2;">156</p>
            </div>
            <div class="stat-card">
                <h3>Bandwidth Used</h3>
                <p style="font-size: 24px; color: #4A90E2;">45.2 GB</p>
            </div>
        </div>
        
        <h2>File Type Distribution</h2>
        <ul>
            <li>Images: 45% (562 files)</li>
            <li>Documents: 30% (374 files)</li>
            <li>Videos: 15% (187 files)</li>
            <li>Other: 10% (124 files)</li>
        </ul>
    </div>
    
    <div class="footer">
        <p>Generated by Fluxez Storage Analytics • Powered by Fluxez SDK</p>
    </div>
</body>
</html>`;

    const htmlUploadResult = await client.storage.upload(
      Buffer.from(htmlContent),
      {
        fileName: 'storage-report.html',
        path: 'reports/',
        contentType: 'text/html',
        metadata: {
          type: 'report',
          format: 'html',
          reportType: 'storage-analytics',
          generatedAt: new Date().toISOString()
        }
      }
    );

    console.log('✅ HTML file uploaded:', htmlUploadResult);

    console.log('\n4. Upload image file (simulated):');
    
    // Create a simple SVG image
    const svgImage = `<svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7B68EE;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="100" fill="url(#gradient)" rx="10"/>
  <text x="100" y="55" font-family="Arial" font-size="16" fill="white" text-anchor="middle">Fluxez Logo</text>
</svg>`;

    const imageUploadResult = await client.storage.upload(
      Buffer.from(svgImage),
      {
        fileName: 'fluxez-logo.svg',
        path: 'assets/images/',
        contentType: 'image/svg+xml',
        metadata: {
          type: 'image',
          format: 'svg',
          width: 200,
          height: 100,
          category: 'logo'
        }
      }
    );

    console.log('✅ Image file uploaded:', imageUploadResult);

    return {
      jsonFile: jsonUploadResult,
      csvFile: csvUploadResult,
      htmlFile: htmlUploadResult,
      imageFile: imageUploadResult
    };

  } catch (error) {
    console.error('❌ File type uploads failed:', error.message);
    return null;
  }
}

async function demonstratePresignedUrls(client) {
  console.log('\n🔗 Presigned URLs\n');
  console.log('==========================================');

  try {
    // First upload a file to work with
    const testFile = await client.storage.upload(
      Buffer.from('Content for presigned URL demo'),
      {
        fileName: 'presigned-demo.txt',
        contentType: 'text/plain'
      }
    );

    console.log('1. Generate download URL:');
    
    const downloadUrl = await client.storage.getSignedUrl(testFile.key, {
      operation: 'download',
      expiresIn: 3600, // 1 hour
      responseContentType: 'text/plain',
      responseContentDisposition: 'attachment; filename="downloaded-file.txt"'
    });

    console.log('✅ Download URL generated:', {
      url: downloadUrl,
      expiresIn: '1 hour',
      operation: 'download'
    });

    console.log('\n2. Generate upload URL for direct client upload:');
    
    const uploadUrl = await client.storage.getSignedUrl('direct-upload-demo.txt', {
      operation: 'upload',
      expiresIn: 1800, // 30 minutes
      contentType: 'text/plain',
      maxContentLength: 1024 * 1024, // 1MB max
      metadata: {
        uploadedVia: 'presigned-url',
        source: 'client-direct'
      }
    });

    console.log('✅ Upload URL generated:', {
      url: uploadUrl,
      expiresIn: '30 minutes',
      maxSize: '1MB',
      operation: 'upload'
    });

    console.log('\n3. Generate temporary view URL:');
    
    const viewUrl = await client.storage.getSignedUrl(testFile.key, {
      operation: 'view',
      expiresIn: 300, // 5 minutes
      responseContentType: 'text/plain',
      responseContentDisposition: 'inline'
    });

    console.log('✅ View URL generated:', {
      url: viewUrl,
      expiresIn: '5 minutes',
      operation: 'view (inline)'
    });

    console.log('\n4. Generate batch URLs:');
    
    // Upload a few more files for batch demo
    const batchFiles = [];
    for (let i = 1; i <= 3; i++) {
      const file = await client.storage.upload(
        Buffer.from(`Batch file ${i} content`),
        {
          fileName: `batch-file-${i}.txt`,
          contentType: 'text/plain'
        }
      );
      batchFiles.push(file);
    }

    const batchUrls = await client.storage.getBatchSignedUrls(
      batchFiles.map(f => f.key),
      {
        operation: 'download',
        expiresIn: 1200 // 20 minutes
      }
    );

    console.log('✅ Batch URLs generated:', {
      count: batchUrls.length,
      expiresIn: '20 minutes',
      urls: batchUrls.map(u => ({ key: u.key, url: u.url.substring(0, 50) + '...' }))
    });

    console.log('\n5. URL with custom conditions:');
    
    const conditionalUrl = await client.storage.getSignedUrl(testFile.key, {
      operation: 'download',
      expiresIn: 7200, // 2 hours
      conditions: {
        ipAddress: '192.168.1.0/24', // Only allow from specific IP range
        userAgent: 'FluxezApp/*', // Only allow specific user agents
        referer: 'https://myapp.com' // Only allow from specific referer
      },
      responseHeaders: {
        'Cache-Control': 'no-cache',
        'Content-Disposition': 'attachment'
      }
    });

    console.log('✅ Conditional URL generated:', {
      url: conditionalUrl,
      conditions: 'IP, UserAgent, Referer restrictions',
      expiresIn: '2 hours'
    });

  } catch (error) {
    console.error('❌ Presigned URLs failed:', error.message);
  }
}

async function demonstrateFileManagement(client) {
  console.log('\n🗂️  File Management Operations\n');
  console.log('==========================================');

  try {
    console.log('1. List files:');
    
    const fileList = await client.storage.listFiles({
      path: '',
      limit: 10,
      includeMetadata: true,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    console.log('✅ File list retrieved:', {
      totalFiles: fileList.totalCount,
      filesShown: fileList.files.length,
      files: fileList.files.map(f => ({
        name: f.fileName,
        size: f.size,
        createdAt: f.createdAt
      }))
    });

    console.log('\n2. Get file metadata:');
    
    if (fileList.files.length > 0) {
      const fileKey = fileList.files[0].key;
      const metadata = await client.storage.getFileMetadata(fileKey);
      console.log('✅ File metadata:', metadata);
    }

    console.log('\n3. Update file metadata:');
    
    if (fileList.files.length > 0) {
      const fileKey = fileList.files[0].key;
      const updatedMetadata = await client.storage.updateFileMetadata(fileKey, {
        metadata: {
          description: 'Updated via SDK example',
          lastModified: new Date().toISOString(),
          tags: ['updated', 'sdk-example']
        }
      });
      console.log('✅ Metadata updated:', updatedMetadata);
    }

    console.log('\n4. Copy file:');
    
    if (fileList.files.length > 0) {
      const sourceKey = fileList.files[0].key;
      const copyResult = await client.storage.copyFile(sourceKey, {
        destinationPath: 'copies/',
        destinationFileName: `copy-of-${fileList.files[0].fileName}`,
        preserveMetadata: true,
        metadata: {
          originalFile: sourceKey,
          copyReason: 'SDK example demonstration'
        }
      });
      console.log('✅ File copied:', copyResult);
    }

    console.log('\n5. Move file:');
    
    // First create a file to move
    const tempFile = await client.storage.upload(
      Buffer.from('Temporary file for move demo'),
      {
        fileName: 'temp-move-demo.txt',
        contentType: 'text/plain'
      }
    );

    const moveResult = await client.storage.moveFile(tempFile.key, {
      destinationPath: 'moved/',
      destinationFileName: 'moved-file.txt',
      preserveMetadata: true
    });

    console.log('✅ File moved:', moveResult);

    console.log('\n6. File operations with versioning:');
    
    // Upload initial version
    const versionedFile = await client.storage.upload(
      Buffer.from('Version 1 content'),
      {
        fileName: 'versioned-document.txt',
        contentType: 'text/plain',
        enableVersioning: true,
        metadata: {
          version: '1.0',
          description: 'Initial version'
        }
      }
    );

    // Upload new version
    const newVersion = await client.storage.upload(
      Buffer.from('Version 2 content - updated!'),
      {
        fileName: 'versioned-document.txt',
        contentType: 'text/plain',
        enableVersioning: true,
        metadata: {
          version: '2.0',
          description: 'Updated version with new content'
        }
      }
    );

    console.log('✅ Versioned file created:', {
      originalVersion: versionedFile.version,
      newVersion: newVersion.version
    });

  } catch (error) {
    console.error('❌ File management operations failed:', error.message);
  }
}

async function demonstrateDirectoryOperations(client) {
  console.log('\n📂 Directory Operations\n');
  console.log('==========================================');

  try {
    console.log('1. Create directory structure:');
    
    // Create multiple directories by uploading files to them
    const directories = [
      'projects/web-apps/',
      'projects/mobile-apps/',
      'assets/images/',
      'assets/documents/',
      'backups/daily/',
      'backups/weekly/'
    ];

    for (const dir of directories) {
      await client.storage.upload(
        Buffer.from(`Directory marker for ${dir}`),
        {
          fileName: '.directory',
          path: dir,
          contentType: 'text/plain',
          metadata: {
            type: 'directory-marker',
            createdAt: new Date().toISOString()
          }
        }
      );
    }

    console.log('✅ Directory structure created:', directories);

    console.log('\n2. List directory contents:');
    
    const projectsDir = await client.storage.listFiles({
      path: 'projects/',
      recursive: false,
      includeDirectories: true
    });

    console.log('✅ Projects directory:', {
      totalItems: projectsDir.totalCount,
      items: projectsDir.files.map(f => ({
        name: f.fileName,
        type: f.isDirectory ? 'directory' : 'file',
        path: f.path
      }))
    });

    console.log('\n3. Recursive directory listing:');
    
    const allAssets = await client.storage.listFiles({
      path: 'assets/',
      recursive: true,
      includeDirectories: true,
      sortBy: 'path'
    });

    console.log('✅ All assets (recursive):', {
      totalItems: allAssets.totalCount,
      structure: allAssets.files.map(f => f.path + f.fileName)
    });

    console.log('\n4. Directory statistics:');
    
    const dirStats = await client.storage.getDirectoryStats('projects/');
    console.log('✅ Directory stats:', dirStats);

    console.log('\n5. Bulk operations on directory:');
    
    // Upload multiple files to a directory
    const bulkFiles = [];
    for (let i = 1; i <= 5; i++) {
      const file = await client.storage.upload(
        Buffer.from(`Bulk file ${i} content`),
        {
          fileName: `bulk-file-${i}.txt`,
          path: 'bulk-demo/',
          contentType: 'text/plain',
          metadata: {
            batch: 'bulk-demo',
            index: i
          }
        }
      );
      bulkFiles.push(file);
    }

    console.log('✅ Bulk files uploaded:', bulkFiles.length);

    // Bulk metadata update
    const bulkUpdateResult = await client.storage.bulkUpdateMetadata('bulk-demo/', {
      metadata: {
        bulkUpdated: true,
        updatedAt: new Date().toISOString()
      }
    });

    console.log('✅ Bulk metadata updated:', bulkUpdateResult);

    console.log('\n6. Directory cleanup:');
    
    const cleanupResult = await client.storage.deleteDirectory('bulk-demo/', {
      recursive: true,
      confirmDeletion: true
    });

    console.log('✅ Directory cleaned up:', cleanupResult);

  } catch (error) {
    console.error('❌ Directory operations failed:', error.message);
  }
}

async function demonstrateFileSearch(client) {
  console.log('\n🔍 File Search & Filtering\n');
  console.log('==========================================');

  try {
    console.log('1. Search by filename:');
    
    const filenameSearch = await client.storage.searchFiles({
      query: 'demo',
      searchFields: ['fileName'],
      limit: 10
    });

    console.log('✅ Filename search results:', {
      totalFound: filenameSearch.totalCount,
      files: filenameSearch.files.map(f => f.fileName)
    });

    console.log('\n2. Search by content type:');
    
    const contentTypeSearch = await client.storage.searchFiles({
      filters: {
        contentType: 'text/plain'
      },
      sortBy: 'size',
      sortOrder: 'desc',
      limit: 5
    });

    console.log('✅ Content type search results:', {
      totalFound: contentTypeSearch.totalCount,
      files: contentTypeSearch.files.map(f => ({
        name: f.fileName,
        size: f.size,
        contentType: f.contentType
      }))
    });

    console.log('\n3. Advanced search with metadata:');
    
    const metadataSearch = await client.storage.searchFiles({
      query: 'sdk-example',
      searchFields: ['metadata', 'tags'],
      filters: {
        size: { min: 0, max: 1024 * 1024 }, // Up to 1MB
        createdAt: {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          end: new Date()
        }
      },
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    console.log('✅ Metadata search results:', {
      totalFound: metadataSearch.totalCount,
      files: metadataSearch.files.map(f => ({
        name: f.fileName,
        tags: f.metadata?.tags,
        createdAt: f.createdAt
      }))
    });

    console.log('\n4. Search with faceted results:');
    
    const facetedSearch = await client.storage.searchFiles({
      query: '*',
      facets: ['contentType', 'path', 'metadata.category'],
      limit: 0 // Only get facets, no files
    });

    console.log('✅ Faceted search results:', facetedSearch.facets);

    console.log('\n5. Full-text content search:');
    
    const contentSearch = await client.storage.searchFiles({
      query: 'Fluxez SDK',
      searchFields: ['content'], // Search inside file content
      filters: {
        contentType: ['text/plain', 'text/html', 'application/json']
      },
      highlightResults: true,
      limit: 10
    });

    console.log('✅ Content search results:', {
      totalFound: contentSearch.totalCount,
      files: contentSearch.files.map(f => ({
        name: f.fileName,
        highlights: f.highlights
      }))
    });

    console.log('\n6. Saved search queries:');
    
    const savedSearch = await client.storage.saveSearchQuery({
      name: 'Recent SDK Examples',
      query: 'sdk-example',
      filters: {
        createdAt: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last week
        }
      },
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    console.log('✅ Search query saved:', savedSearch);

    // Execute saved search
    const savedSearchResults = await client.storage.executeSavedSearch(savedSearch.id);
    console.log('✅ Saved search executed:', {
      totalFound: savedSearchResults.totalCount,
      queryName: savedSearch.name
    });

  } catch (error) {
    console.error('❌ File search failed:', error.message);
  }
}

async function demonstrateFileVersioning(client) {
  console.log('\n📋 File Versioning\n');
  console.log('==========================================');

  try {
    console.log('1. Create versioned file:');
    
    // Upload initial version
    const v1 = await client.storage.upload(
      Buffer.from('Document version 1.0\n\nThis is the initial version of the document.'),
      {
        fileName: 'important-document.txt',
        contentType: 'text/plain',
        enableVersioning: true,
        metadata: {
          version: '1.0',
          author: 'John Doe',
          description: 'Initial draft'
        }
      }
    );

    console.log('✅ Version 1.0 created:', {
      versionId: v1.versionId,
      fileName: v1.fileName
    });

    // Upload version 2
    const v2 = await client.storage.upload(
      Buffer.from('Document version 2.0\n\nThis is the updated version with new content.\n\nAdded: New section about features.'),
      {
        fileName: 'important-document.txt',
        contentType: 'text/plain',
        enableVersioning: true,
        metadata: {
          version: '2.0',
          author: 'Jane Smith',
          description: 'Added features section'
        }
      }
    );

    console.log('✅ Version 2.0 created:', {
      versionId: v2.versionId,
      fileName: v2.fileName
    });

    // Upload version 3
    const v3 = await client.storage.upload(
      Buffer.from('Document version 3.0\n\nThis is the final version.\n\nAdded: Features section\nAdded: FAQ section\nUpdated: Introduction'),
      {
        fileName: 'important-document.txt',
        contentType: 'text/plain',
        enableVersioning: true,
        metadata: {
          version: '3.0',
          author: 'Bob Johnson',
          description: 'Final version with FAQ'
        }
      }
    );

    console.log('✅ Version 3.0 created:', {
      versionId: v3.versionId,
      fileName: v3.fileName
    });

    console.log('\n2. List file versions:');
    
    const versions = await client.storage.listFileVersions(v3.key);
    console.log('✅ File versions:', {
      totalVersions: versions.length,
      versions: versions.map(v => ({
        versionId: v.versionId,
        version: v.metadata?.version,
        author: v.metadata?.author,
        createdAt: v.createdAt,
        size: v.size
      }))
    });

    console.log('\n3. Download specific version:');
    
    const v1Content = await client.storage.downloadFileVersion(v3.key, v1.versionId);
    console.log('✅ Version 1.0 content downloaded:', {
      size: v1Content.length,
      preview: v1Content.toString().substring(0, 50) + '...'
    });

    console.log('\n4. Compare versions:');
    
    const versionComparison = await client.storage.compareVersions(v3.key, v1.versionId, v3.versionId);
    console.log('✅ Version comparison:', versionComparison);

    console.log('\n5. Restore previous version:');
    
    const restoredVersion = await client.storage.restoreVersion(v3.key, v2.versionId, {
      createNewVersion: true,
      metadata: {
        version: '2.1',
        author: 'System',
        description: 'Restored version 2.0 as 2.1'
      }
    });

    console.log('✅ Version restored:', restoredVersion);

    console.log('\n6. Version management:');
    
    // Set version retention policy
    const retentionPolicy = await client.storage.setVersionRetentionPolicy(v3.key, {
      maxVersions: 10,
      retentionDays: 30,
      deleteOldVersions: true
    });

    console.log('✅ Retention policy set:', retentionPolicy);

    // Get version analytics
    const versionAnalytics = await client.storage.getVersionAnalytics(v3.key);
    console.log('✅ Version analytics:', versionAnalytics);

  } catch (error) {
    console.error('❌ File versioning failed:', error.message);
  }
}

async function demonstrateStorageAnalytics(client) {
  console.log('\n📊 Storage Analytics\n');
  console.log('==========================================');

  try {
    console.log('1. Storage usage statistics:');
    
    const usageStats = await client.storage.getUsageStats({
      period: 'last_30_days',
      groupBy: 'day'
    });

    console.log('✅ Usage statistics:', {
      totalFiles: usageStats.totalFiles,
      totalSize: usageStats.totalSize,
      dailyStats: usageStats.dailyStats?.slice(0, 5) // Show first 5 days
    });

    console.log('\n2. File type distribution:');
    
    const typeDistribution = await client.storage.getFileTypeDistribution();
    console.log('✅ File type distribution:', typeDistribution);

    console.log('\n3. Storage bandwidth analytics:');
    
    const bandwidthStats = await client.storage.getBandwidthStats({
      period: 'last_7_days',
      includeOperations: ['upload', 'download', 'view']
    });

    console.log('✅ Bandwidth statistics:', bandwidthStats);

    console.log('\n4. Popular files analytics:');
    
    const popularFiles = await client.storage.getPopularFiles({
      period: 'last_30_days',
      metric: 'downloads',
      limit: 10
    });

    console.log('✅ Popular files:', popularFiles);

    console.log('\n5. Storage cost analytics:');
    
    const costAnalytics = await client.storage.getCostAnalytics({
      period: 'current_month',
      breakdown: ['storage', 'bandwidth', 'operations']
    });

    console.log('✅ Cost analytics:', costAnalytics);

    console.log('\n6. Storage optimization suggestions:');
    
    const optimizationSuggestions = await client.storage.getOptimizationSuggestions();
    console.log('✅ Optimization suggestions:', optimizationSuggestions);

  } catch (error) {
    console.error('❌ Storage analytics failed:', error.message);
  }
}

async function demonstrateAdvancedFeatures(client) {
  console.log('\n🚀 Advanced Storage Features\n');
  console.log('==========================================');

  try {
    console.log('1. Image processing and thumbnails:');
    
    // Upload an SVG image for processing
    const svgImage = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#4A90E2"/>
  <text x="200" y="150" font-family="Arial" font-size="24" fill="white" text-anchor="middle">Fluxez Storage</text>
  <text x="200" y="180" font-family="Arial" font-size="16" fill="white" text-anchor="middle">Advanced Features Demo</text>
</svg>`;

    const imageUpload = await client.storage.upload(
      Buffer.from(svgImage),
      {
        fileName: 'demo-image.svg',
        path: 'images/',
        contentType: 'image/svg+xml',
        processImage: true,
        generateThumbnails: true,
        thumbnailSizes: [
          { width: 150, height: 150, name: 'thumbnail' },
          { width: 300, height: 225, name: 'medium' },
          { width: 800, height: 600, name: 'large' }
        ]
      }
    );

    console.log('✅ Image uploaded with processing:', {
      originalUrl: imageUpload.url,
      thumbnails: imageUpload.thumbnails
    });

    console.log('\n2. File compression:');
    
    // Upload a large text file and compress it
    const largeContent = 'This is a large file content. '.repeat(1000);
    const compressedUpload = await client.storage.upload(
      Buffer.from(largeContent),
      {
        fileName: 'large-document.txt',
        contentType: 'text/plain',
        compress: true,
        compressionLevel: 9 // Maximum compression
      }
    );

    console.log('✅ Compressed file uploaded:', {
      originalSize: Buffer.from(largeContent).length,
      compressedSize: compressedUpload.size,
      compressionRatio: (compressedUpload.size / Buffer.from(largeContent).length * 100).toFixed(2) + '%'
    });

    console.log('\n3. Content delivery network (CDN):');
    
    const cdnConfig = await client.storage.configureCDN({
      enabled: true,
      cacheControl: 'public, max-age=3600',
      customDomain: 'cdn.myapp.com',
      geoReplication: true,
      regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1']
    });

    console.log('✅ CDN configured:', cdnConfig);

    console.log('\n4. Backup and sync:');
    
    const backupConfig = await client.storage.setupBackup({
      enabled: true,
      schedule: 'daily',
      retention: 30, // 30 days
      destinations: [
        { type: 'cloud', provider: 'fluxez', bucket: 'backup-primary' },
        { type: 'cloud', provider: 'fluxez', bucket: 'backup-secondary' }
      ],
      encryptBackups: true
    });

    console.log('✅ Backup configured:', backupConfig);

    console.log('\n5. File transformation pipeline:');
    
    const transformationPipeline = await client.storage.createTransformationPipeline({
      name: 'Document Processing Pipeline',
      triggers: [
        { fileType: 'application/pdf', action: 'extract-text' },
        { fileType: 'image/*', action: 'generate-thumbnails' },
        { fileType: 'text/*', action: 'index-content' }
      ],
      transformations: [
        { type: 'ocr', enabled: true },
        { type: 'virus-scan', enabled: true },
        { type: 'metadata-extraction', enabled: true },
        { type: 'auto-tagging', enabled: true }
      ]
    });

    console.log('✅ Transformation pipeline created:', transformationPipeline);

    console.log('\n6. Access control and permissions:');
    
    // Set up fine-grained access control
    const accessControl = await client.storage.setAccessControl('sensitive-docs/', {
      permissions: {
        read: ['role:admin', 'role:manager', 'user:john@example.com'],
        write: ['role:admin', 'user:john@example.com'],
        delete: ['role:admin']
      },
      ipRestrictions: ['192.168.1.0/24', '10.0.0.0/8'],
      timeRestrictions: {
        allowedHours: '09:00-17:00',
        timezone: 'UTC',
        weekdaysOnly: true
      },
      encryptionRequired: true
    });

    console.log('✅ Access control configured:', accessControl);

    console.log('\n7. Storage lifecycle management:');
    
    const lifecyclePolicy = await client.storage.setLifecyclePolicy({
      rules: [
        {
          name: 'Archive old files',
          filter: { olderThan: 90, path: 'documents/' },
          action: 'archive',
          archiveStorage: 'glacier'
        },
        {
          name: 'Delete temp files',
          filter: { olderThan: 7, path: 'temp/' },
          action: 'delete'
        },
        {
          name: 'Compress large files',
          filter: { sizeGreaterThan: '10MB', olderThan: 30 },
          action: 'compress'
        }
      ]
    });

    console.log('✅ Lifecycle policy configured:', lifecyclePolicy);

  } catch (error) {
    console.error('❌ Advanced features failed:', error.message);
  }
}

// Promise-based storage example
function promiseBasedStorageExample() {
  console.log('\n🔄 Promise-based Storage Operations\n');

  const client = new FluxezClient(API_KEY, {
    apiUrl: API_URL,
    debug: false
  });

  return client.storage.upload(
    Buffer.from('Promise-based upload example'),
    {
      fileName: 'promise-example.txt',
      contentType: 'text/plain'
    }
  )
  .then(result => {
    console.log('✅ Promise upload successful:', result);
    return client.storage.getSignedUrl(result.key, { operation: 'download' });
  })
  .then(downloadUrl => {
    console.log('✅ Download URL generated:', downloadUrl);
    return client.storage.listFiles({ limit: 5 });
  })
  .then(fileList => {
    console.log('✅ File list retrieved:', fileList.files.length, 'files');
  })
  .catch(error => {
    console.error('❌ Promise chain failed:', error.message);
  });
}

// Run the examples
if (require.main === module) {
  console.log('🌟 Running Fluxez SDK Storage Examples\n');
  
  storageExamplesMain()
    .then(() => {
      setTimeout(() => {
        console.log('\n' + '='.repeat(50));
        promiseBasedStorageExample();
      }, 2000);
    })
    .catch(console.error);
}

// Export for use in other files
module.exports = {
  storageExamplesMain,
  demonstrateBasicUpload,
  demonstrateFileTypes,
  demonstratePresignedUrls,
  demonstrateFileManagement,
  demonstrateDirectoryOperations,
  demonstrateFileSearch,
  demonstrateFileVersioning,
  demonstrateStorageAnalytics,
  demonstrateAdvancedFeatures,
  promiseBasedStorageExample
};