#!/usr/bin/env node
/**
 * Fluxez Webhook Server Example
 *
 * This is a complete, runnable Express server that receives webhook notifications
 * from Fluxez AI job queue system.
 *
 * Usage:
 *   1. Install dependencies: npm install express
 *   2. Run this server: node webhook-server.js
 *   3. The server will start on http://localhost:4000
 *   4. Use ngrok to expose it publicly: ngrok http 4000
 *   5. Use the ngrok URL as your webhook URL in Fluxez
 *
 * Example webhook URLs to use:
 *   - Image: https://your-ngrok-url.ngrok.io/webhook/image
 *   - Video: https://your-ngrok-url.ngrok.io/webhook/video
 *   - TTS:   https://your-ngrok-url.ngrok.io/webhook/tts
 *   - STT:   https://your-ngrok-url.ngrok.io/webhook/stt
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

// Store received webhooks for demonstration
const receivedWebhooks = [];

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    webhooksReceived: receivedWebhooks.length
  });
});

// View all received webhooks
app.get('/webhooks', (req, res) => {
  res.json({
    total: receivedWebhooks.length,
    webhooks: receivedWebhooks.slice(-50) // Last 50 webhooks
  });
});

// Clear webhooks history
app.post('/webhooks/clear', (req, res) => {
  const count = receivedWebhooks.length;
  receivedWebhooks.length = 0;
  res.json({ cleared: count, message: 'Webhook history cleared' });
});

// ============================================================================
// WEBHOOK ENDPOINTS
// ============================================================================

/**
 * Image Generation Webhook
 * Receives notifications when image generation completes
 */
app.post('/webhook/image', (req, res) => {
  const {
    jobId,
    jobType,
    status,
    currentStep,
    result,
    error,
    progress,
    createdAt,
    completedAt
  } = req.body;

  console.log('\n🖼️  IMAGE WEBHOOK RECEIVED');
  console.log('━'.repeat(60));
  console.log('Job ID:', jobId);
  console.log('Status:', status);
  console.log('Progress:', progress ? `${progress}%` : 'N/A');

  if (status === 'completed') {
    console.log('✅ Image generated successfully!');
    console.log('📦 Result:', JSON.stringify(result, null, 2));

    if (result?.storageUrl) {
      console.log('🔗 Image URL:', result.storageUrl);
    }
    if (result?.fileSize) {
      console.log('📊 File Size:', (result.fileSize / 1024).toFixed(2), 'KB');
    }
  } else if (status === 'failed') {
    console.log('❌ Image generation failed!');
    console.log('Error:', error);
  }

  // Store webhook
  receivedWebhooks.push({
    type: 'image',
    timestamp: new Date().toISOString(),
    data: req.body
  });

  // Always respond 200 to acknowledge receipt
  res.status(200).json({
    received: true,
    timestamp: new Date().toISOString(),
    jobId
  });
});

/**
 * Video Generation Webhook
 * Receives notifications for multi-step video generation
 */
app.post('/webhook/video', (req, res) => {
  const {
    jobId,
    jobType,
    status,
    currentStep,
    result,
    error,
    progress,
    audioUrl,
    imageUrl,
    ttsJobId,
    imageJobId
  } = req.body;

  console.log('\n🎬 VIDEO WEBHOOK RECEIVED');
  console.log('━'.repeat(60));
  console.log('Job ID:', jobId);
  console.log('Status:', status);
  console.log('Current Step:', currentStep || 'N/A');
  console.log('Progress:', progress ? `${progress}%` : 'N/A');

  // Show workflow steps
  if (currentStep) {
    const stepEmojis = {
      tts: '🎤 Generating Audio',
      image: '🖼️  Generating Image',
      video: '🎬 Compositing Video'
    };
    console.log('Workflow Step:', stepEmojis[currentStep] || currentStep);
  }

  // Show intermediate results
  if (audioUrl) {
    console.log('🎤 Audio URL:', audioUrl);
  }
  if (imageUrl) {
    console.log('🖼️  Image URL:', imageUrl);
  }

  if (status === 'completed') {
    console.log('✅ Video generation completed!');
    console.log('📦 Result:', JSON.stringify(result, null, 2));

    if (result?.storageUrl) {
      console.log('🔗 Video URL:', result.storageUrl);
    }
    if (result?.fileSize) {
      console.log('📊 File Size:', (result.fileSize / 1024 / 1024).toFixed(2), 'MB');
    }
  } else if (status === 'failed') {
    console.log('❌ Video generation failed!');
    console.log('Error:', error);
  }

  // Store webhook
  receivedWebhooks.push({
    type: 'video',
    timestamp: new Date().toISOString(),
    data: req.body
  });

  res.status(200).json({
    received: true,
    timestamp: new Date().toISOString(),
    jobId
  });
});

/**
 * Text-to-Speech Webhook
 */
app.post('/webhook/tts', (req, res) => {
  const { jobId, status, result, error, progress } = req.body;

  console.log('\n🎤 TTS WEBHOOK RECEIVED');
  console.log('━'.repeat(60));
  console.log('Job ID:', jobId);
  console.log('Status:', status);

  if (status === 'completed') {
    console.log('✅ TTS generation completed!');
    if (result?.storageUrl) {
      console.log('🔗 Audio URL:', result.storageUrl);
    }
    if (result?.duration) {
      console.log('⏱️  Duration:', result.duration, 'seconds');
    }
  } else if (status === 'failed') {
    console.log('❌ TTS generation failed!');
    console.log('Error:', error);
  }

  receivedWebhooks.push({
    type: 'tts',
    timestamp: new Date().toISOString(),
    data: req.body
  });

  res.status(200).json({
    received: true,
    timestamp: new Date().toISOString(),
    jobId
  });
});

/**
 * Speech-to-Text Webhook
 */
app.post('/webhook/stt', (req, res) => {
  const { jobId, status, result, error } = req.body;

  console.log('\n🎙️  STT WEBHOOK RECEIVED');
  console.log('━'.repeat(60));
  console.log('Job ID:', jobId);
  console.log('Status:', status);

  if (status === 'completed') {
    console.log('✅ Transcription completed!');
    if (result?.text) {
      console.log('📝 Text:', result.text);
    }
    if (result?.language) {
      console.log('🌐 Language:', result.language);
    }
  } else if (status === 'failed') {
    console.log('❌ Transcription failed!');
    console.log('Error:', error);
  }

  receivedWebhooks.push({
    type: 'stt',
    timestamp: new Date().toISOString(),
    data: req.body
  });

  res.status(200).json({
    received: true,
    timestamp: new Date().toISOString(),
    jobId
  });
});

/**
 * Generic webhook endpoint (catches all job types)
 */
app.post('/webhook', (req, res) => {
  console.log('\n📨 GENERIC WEBHOOK RECEIVED');
  console.log('━'.repeat(60));
  console.log('Data:', JSON.stringify(req.body, null, 2));

  receivedWebhooks.push({
    type: 'generic',
    timestamp: new Date().toISOString(),
    data: req.body
  });

  res.status(200).json({
    received: true,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Endpoint ${req.method} ${req.path} not found`,
    availableEndpoints: [
      'GET  /health',
      'GET  /webhooks',
      'POST /webhooks/clear',
      'POST /webhook/image',
      'POST /webhook/video',
      'POST /webhook/tts',
      'POST /webhook/stt',
      'POST /webhook'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.clear();
  console.log('═'.repeat(60));
  console.log('  🚀 Fluxez Webhook Server Started');
  console.log('═'.repeat(60));
  console.log(`\n📍 Server running on: http://localhost:${PORT}`);
  console.log('\n📋 Available Endpoints:');
  console.log('   GET  http://localhost:' + PORT + '/health');
  console.log('   GET  http://localhost:' + PORT + '/webhooks');
  console.log('   POST http://localhost:' + PORT + '/webhooks/clear');
  console.log('   POST http://localhost:' + PORT + '/webhook/image');
  console.log('   POST http://localhost:' + PORT + '/webhook/video');
  console.log('   POST http://localhost:' + PORT + '/webhook/tts');
  console.log('   POST http://localhost:' + PORT + '/webhook/stt');
  console.log('   POST http://localhost:' + PORT + '/webhook');
  console.log('\n🌐 To test with Fluxez:');
  console.log('   1. Install ngrok: npm install -g ngrok');
  console.log('   2. Run: ngrok http ' + PORT);
  console.log('   3. Copy the ngrok HTTPS URL (e.g., https://abc123.ngrok.io)');
  console.log('   4. Use it in your Fluxez code:');
  console.log('');
  console.log('      const result = await client.ai.generateVideo(prompt, {');
  console.log('        webhookUrl: "https://YOUR_NGROK_URL.ngrok.io/webhook/video"');
  console.log('      });');
  console.log('');
  console.log('═'.repeat(60));
  console.log('\n✅ Waiting for webhooks...\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n\n📊 Webhook Statistics:');
  console.log('   Total webhooks received:', receivedWebhooks.length);
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n\n📊 Webhook Statistics:');
  console.log('   Total webhooks received:', receivedWebhooks.length);

  if (receivedWebhooks.length > 0) {
    const types = {};
    receivedWebhooks.forEach(wh => {
      types[wh.type] = (types[wh.type] || 0) + 1;
    });
    console.log('   By type:', types);
  }

  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});
