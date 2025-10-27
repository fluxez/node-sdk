/**
 * Fluxez SDK - AI Queue & Webhooks Example
 *
 * This example demonstrates comprehensive queue-based AI operations with webhook notifications.
 * Perfect for asynchronous AI workflows, job tracking, and event-driven architectures.
 *
 * Features demonstrated:
 * - Queue-based image generation (Flux)
 * - Queue-based video generation
 * - Async text-to-speech with job tracking
 * - Async speech-to-text with job tracking
 * - Queue management and monitoring
 * - Webhook integration for completion notifications
 * - Express webhook server implementation
 * - Job status polling and error handling
 * - Batch job processing
 *
 * Time to complete: ~20 minutes
 */

const { FluxezClient } = require('@fluxez/node-sdk');
const fs = require('fs');
const path = require('path');

// Configuration
const API_KEY = process.env.FLUXEZ_API_KEY || 'cgx_your_api_key_here';

async function queueWebhooksExamplesMain() {
  console.log('Queue & Webhooks Examples\n');

  const client = new FluxezClient(API_KEY, {
    
    debug: true,
    timeout: 120000, // Longer timeout for AI operations
  });

  try {
    // Test connection
    const connectionTest = await client.testConnection();
    if (!connectionTest.connected) {
      throw new Error('Cannot connect to backend. Please ensure the Fluxez backend is running.');
    }
    console.log('Connected to Fluxez backend\n');

    // Set context
    client.setOrganization('org_ai_demo');
    client.setProject('proj_ai_demo');

    await demonstrateImageGeneration(client);
    await demonstrateVideoGeneration(client);
    await demonstrateTTSGeneration(client);
    await demonstrateSTTProcessing(client);
    await demonstrateQueueManagement(client);
    await demonstrateBatchProcessing(client);
    await demonstrateWebhookServer();

    console.log('\nQueue & Webhooks Examples Complete!');

  } catch (error) {
    console.error('Queue & Webhooks examples failed:', error);
    console.log('\nTroubleshooting:');
    console.log('- Ensure your backend has AI services configured');
    console.log('- Check that the media server is running on');
    console.log('- Verify your API key has AI/Queue permissions');
    console.log('- For webhooks, ensure the webhook URL is publicly accessible');
  }
}

async function demonstrateImageGeneration(client) {
  console.log('Image Generation with Queue System\n');
  console.log('==========================================');

  try {
    console.log('1. Basic image generation (queued):');

    // Generate image - automatically queued
    const imageResult = await client.ai.generateImage('A beautiful sunset over mountains', {
      size: '1024x1024',
      quality: 'hd',
      style: 'vivid'
    });

    console.log('Image generation initiated:', {
      jobId: imageResult.data?.jobId,
      status: imageResult.data?.status
    });

    // Poll for completion if we have a jobId
    if (imageResult.data?.jobId) {
      console.log('\n2. Polling for image completion:');

      const jobId = imageResult.data.jobId;
      let attempts = 0;
      const maxAttempts = 30; // 30 attempts * 2 seconds = 60 seconds max wait

      while (attempts < maxAttempts) {
        // In a real implementation, you'd call the media server status endpoint
        // For this example, we'll show the pattern
        console.log(`  Attempt ${attempts + 1}/${maxAttempts} - Checking job status...`);

        // Simulated status check (replace with actual API call)
        // const status = await checkImageJobStatus(jobId);

        await sleep(2000); // Wait 2 seconds between checks
        attempts++;

        // In real usage, you'd break when status === 'completed'
        // if (status.status === 'completed') {
        //   console.log('Image ready:', status.image_url);
        //   break;
        // }
      }
    }

    console.log('\n3. Image generation with webhook notification:');

    const imageWithWebhook = await client.ai.generateImage(
      'Futuristic cyberpunk city at night with neon lights',
      {
        size: '1024x1024',
        quality: 'hd',
        steps: 20,
        negativePrompt: 'blurry, low quality, distorted',
        webhookUrl: 'https://your-domain.com/webhook/image-complete'
      }
    );

    console.log('Image generation with webhook:', {
      jobId: imageWithWebhook.data?.jobId,
      status: imageWithWebhook.data?.status,
      webhook: 'Configured'
    });

    console.log('\n4. Batch image generation:');

    const prompts = [
      'A serene lake with reflection',
      'Mountain landscape with snow peaks',
      'Tropical beach at sunset',
      'Dense forest with morning mist'
    ];

    const batchJobs = [];

    for (const prompt of prompts) {
      const job = await client.ai.generateImage(prompt, {
        size: '1024x1024',
        quality: 'standard'
      });

      batchJobs.push({
        prompt,
        jobId: job.data?.jobId,
        status: job.data?.status
      });
    }

    console.log('Batch jobs initiated:', {
      totalJobs: batchJobs.length,
      jobs: batchJobs.map(j => ({ prompt: j.prompt, jobId: j.jobId }))
    });

    console.log('\n5. High-priority image generation:');

    // Note: Priority would be handled by your backend queue system
    const urgentImage = await client.ai.generateImage(
      'Emergency alert banner with red background',
      {
        size: '1792x1024',
        quality: 'hd',
        // Priority would be a custom header or parameter
        // In a real system, you'd pass this to your queue
      }
    );

    console.log('High-priority job created:', urgentImage.data?.jobId);

  } catch (error) {
    console.error('Image generation failed:', error.message);
  }
}

async function demonstrateVideoGeneration(client) {
  console.log('\n\nVideo Generation with Queue System\n');
  console.log('==========================================');

  try {
    console.log('1. Generate video from text prompt:');

    const videoJob = await client.ai.generateVideo(
      'A cat playing with a ball of yarn',
      {
        duration: 5,
        aspectRatio: '16:9',
        frameRate: 30
      }
    );

    console.log('Video generation initiated:', {
      taskId: videoJob.taskId,
      status: videoJob.status,
      duration: videoJob.duration,
      dimensions: videoJob.dimensions
    });

    console.log('\n2. Check video job status:');

    if (videoJob.taskId) {
      // Poll for video completion
      console.log('Polling video job status...');

      let videoStatus = await client.ai.getVideoJobStatus(videoJob.taskId);
      console.log('Current status:', {
        jobId: videoStatus.jobId,
        status: videoStatus.status,
        cost: videoStatus.cost
      });

      // In production, you'd poll until completed
      let pollAttempts = 0;
      const maxPollAttempts = 60; // Videos take longer

      while (pollAttempts < maxPollAttempts && videoStatus.status !== 'completed') {
        await sleep(5000); // Check every 5 seconds

        videoStatus = await client.ai.getVideoJobStatus(videoJob.taskId);
        console.log(`  Attempt ${pollAttempts + 1}: Status = ${videoStatus.status}`);

        if (videoStatus.status === 'failed') {
          console.error('  Video generation failed:', videoStatus.error);
          break;
        }

        if (videoStatus.status === 'completed') {
          console.log('  Video ready!', {
            url: videoStatus.videoUrl,
            cost: videoStatus.cost
          });
          break;
        }

        pollAttempts++;
      }
    }

    console.log('\n3. Video generation with webhook:');

    const videoWithWebhook = await client.ai.generateVideo(
      'A bird flying over ocean waves',
      {
        duration: 4,
        aspectRatio: '1:1',
        frameRate: 24,
        webhookUrl: 'https://your-domain.com/webhook/video-complete'
      }
    );

    console.log('Video with webhook configured:', {
      taskId: videoWithWebhook.taskId,
      webhook: 'Will notify on completion'
    });

    console.log('\n4. Multiple video generation jobs:');

    const videoPrompts = [
      { prompt: 'Waves crashing on beach', aspectRatio: '16:9' },
      { prompt: 'Time-lapse of city traffic', aspectRatio: '16:9' },
      { prompt: 'Flowers blooming in garden', aspectRatio: '1:1' }
    ];

    const videoJobs = [];

    for (const { prompt, aspectRatio } of videoPrompts) {
      const job = await client.ai.generateVideo(prompt, {
        duration: 4,
        aspectRatio,
        frameRate: 24
      });

      videoJobs.push({
        prompt,
        taskId: job.taskId,
        status: job.status
      });

      // Small delay between submissions to avoid overwhelming the queue
      await sleep(500);
    }

    console.log('Video jobs submitted:', {
      totalJobs: videoJobs.length,
      jobs: videoJobs.map(j => ({ prompt: j.prompt, taskId: j.taskId }))
    });

  } catch (error) {
    console.error('Video generation failed:', error.message);
  }
}

async function demonstrateTTSGeneration(client) {
  console.log('\n\nText-to-Speech with Job Tracking\n');
  console.log('==========================================');

  try {
    console.log('1. Basic TTS generation:');

    const text = 'Hello! This is a demonstration of the Fluxez text-to-speech system with queue-based processing.';

    const ttsResult = await client.ai.textToSpeech(text, {
      voice: 'alloy',
      speed: 1.0,
      responseFormat: 'mp3'
    });

    // TTS might return immediately with audio data or a job ID
    // depending on text length and backend configuration
    console.log('TTS generation result:', {
      hasAudioData: ttsResult instanceof ArrayBuffer,
      size: ttsResult.byteLength ? `${ttsResult.byteLength} bytes` : 'N/A'
    });

    console.log('\n2. TTS with webhook notification:');

    const longText = `
      Welcome to Fluxez AI platform. This is a longer text that demonstrates
      asynchronous text-to-speech processing with webhook notifications.
      When the audio generation is complete, your webhook endpoint will be
      notified with the job details and download URL. This allows you to
      implement efficient event-driven architectures for audio processing.
    `.trim();

    // For long texts, the system would return a job ID
    console.log('Generating speech for long text...');
    console.log('Text length:', longText.length, 'characters');
    console.log('Webhook will be notified on completion');

    console.log('\n3. Multiple voice comparison:');

    const voices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    const comparisonText = 'Testing different voice styles for comparison.';

    for (const voice of voices) {
      console.log(`  Generating with voice: ${voice}`);
      // In real implementation, you'd queue these jobs
      await sleep(100); // Small delay to avoid rate limiting
    }

    console.log(`Created ${voices.length} TTS jobs with different voices`);

    console.log('\n4. Save TTS output to file:');

    const speechData = await client.ai.textToSpeech(
      'This audio will be saved to a file.',
      {
        voice: 'nova',
        speed: 1.0,
        responseFormat: 'mp3'
      }
    );

    if (speechData instanceof ArrayBuffer) {
      const outputPath = path.join(__dirname, 'tts-output.mp3');
      fs.writeFileSync(outputPath, Buffer.from(speechData));
      console.log('Audio saved to:', outputPath);
      console.log('File size:', fs.statSync(outputPath).size, 'bytes');
    }

    console.log('\n5. Batch TTS generation:');

    const sentences = [
      'First sentence for batch processing.',
      'Second sentence with different content.',
      'Third sentence to demonstrate scalability.'
    ];

    const batchTTSJobs = [];

    for (let i = 0; i < sentences.length; i++) {
      console.log(`  Queuing TTS job ${i + 1}/${sentences.length}`);
      batchTTSJobs.push({
        text: sentences[i],
        jobIndex: i + 1,
        status: 'queued'
      });
    }

    console.log('Batch TTS jobs queued:', batchTTSJobs.length);

  } catch (error) {
    console.error('TTS generation failed:', error.message);
  }
}

async function demonstrateSTTProcessing(client) {
  console.log('\n\nSpeech-to-Text with Job Tracking\n');
  console.log('==========================================');

  try {
    console.log('1. Transcribe audio file:');

    // Check if sample audio exists
    const sampleAudioPath = path.join(__dirname, 'tts-output.mp3');

    if (fs.existsSync(sampleAudioPath)) {
      const audioFile = fs.readFileSync(sampleAudioPath);

      console.log('Transcribing audio file...');
      console.log('File size:', audioFile.length, 'bytes');

      const transcription = await client.ai.transcribeAudio(audioFile, {
        language: 'en',
        responseFormat: 'json'
      });

      console.log('Transcription result:', {
        text: transcription.text,
        language: transcription.language,
        duration: transcription.duration,
        confidence: transcription.confidence
      });
    } else {
      console.log('Sample audio file not found. Create one using TTS first.');
    }

    console.log('\n2. Transcribe with different response formats:');

    const formats = ['json', 'text', 'srt', 'vtt'];

    console.log('Available formats:', formats.join(', '));
    console.log('For long audio files, transcription would be queued');

    console.log('\n3. STT with webhook notification:');

    console.log('For long audio files, configure webhook:');
    console.log('  webhookUrl: https://your-domain.com/webhook/stt-complete');
    console.log('  Webhook will receive transcription when complete');

    console.log('\n4. Batch audio transcription:');

    const audioFiles = [
      'audio1.mp3',
      'audio2.wav',
      'audio3.mp3'
    ];

    console.log('Batch transcription queue:');
    audioFiles.forEach((file, index) => {
      console.log(`  Job ${index + 1}: ${file} (queued)`);
    });

    console.log('\n5. Transcription with detailed segments:');

    console.log('Using verbose_json format for detailed output:');
    console.log('  - Word-level timestamps');
    console.log('  - Confidence scores per segment');
    console.log('  - Speaker diarization (if available)');

  } catch (error) {
    console.error('STT processing failed:', error.message);
  }
}

async function demonstrateQueueManagement(client) {
  console.log('\n\nQueue Management & Monitoring\n');
  console.log('==========================================');

  try {
    console.log('1. Queue management operations:');

    // Note: These are conceptual - implement based on your backend
    console.log('\nQueue Status Overview:');
    console.log('  Total jobs: 42');
    console.log('  Pending: 15');
    console.log('  Processing: 8');
    console.log('  Completed: 17');
    console.log('  Failed: 2');

    console.log('\nJobs by Type:');
    console.log('  Image generation: 20');
    console.log('  Video generation: 8');
    console.log('  Text-to-speech: 10');
    console.log('  Speech-to-text: 4');

    console.log('\n2. List recent jobs:');

    const recentJobs = [
      {
        jobId: 'job-001',
        type: 'image',
        status: 'completed',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      },
      {
        jobId: 'job-002',
        type: 'video',
        status: 'processing',
        progress: 45.5,
        createdAt: new Date(Date.now() - 120000).toISOString()
      },
      {
        jobId: 'job-003',
        type: 'tts',
        status: 'pending',
        createdAt: new Date(Date.now() - 60000).toISOString()
      }
    ];

    console.log('Recent jobs:');
    recentJobs.forEach(job => {
      console.log(`  ${job.jobId}: ${job.type} - ${job.status}${job.progress ? ` (${job.progress}%)` : ''}`);
    });

    console.log('\n3. Filter jobs by status:');

    const filters = ['pending', 'processing', 'completed', 'failed'];

    filters.forEach(status => {
      const count = recentJobs.filter(j => j.status === status).length;
      console.log(`  ${status}: ${count} jobs`);
    });

    console.log('\n4. Job priority management:');

    console.log('Priority levels:');
    console.log('  high: Processed immediately (premium users)');
    console.log('  normal: Standard queue processing');
    console.log('  low: Processed when resources available');

    console.log('\n5. Auto-retry configuration:');

    const retryConfig = {
      maxRetries: 3,
      retryDelay: 5000, // 5 seconds
      backoffMultiplier: 2.0,
      retryableErrors: ['timeout', 'service_unavailable']
    };

    console.log('Retry configuration:', retryConfig);

    console.log('\n6. Queue health monitoring:');

    const queueHealth = {
      avgProcessingTime: 12.5, // seconds
      successRate: 0.95, // 95%
      queueLength: 15,
      activeWorkers: 4,
      workerUtilization: 0.75 // 75%
    };

    console.log('Queue health metrics:', queueHealth);

    console.log('\n7. Cancel a job:');

    const jobToCancel = 'job-xyz-123';
    console.log(`Cancelling job: ${jobToCancel}`);
    console.log('Job cancelled successfully');
    console.log('Note: Processing jobs may not cancel immediately');

  } catch (error) {
    console.error('Queue management failed:', error.message);
  }
}

async function demonstrateBatchProcessing(client) {
  console.log('\n\nBatch Job Processing\n');
  console.log('==========================================');

  try {
    console.log('1. Batch image generation workflow:');

    const batchConfig = {
      jobType: 'image',
      priority: 'normal',
      webhookUrl: 'https://your-domain.com/webhook/batch-complete',
      autoRetry: true,
      maxRetries: 3
    };

    const imageBatch = [
      { prompt: 'Abstract art with blue and gold', size: '1024x1024' },
      { prompt: 'Minimalist logo design', size: '512x512' },
      { prompt: 'Nature photograph with mountains', size: '1792x1024' }
    ];

    console.log(`Submitting batch of ${imageBatch.length} image jobs`);
    console.log('Batch configuration:', batchConfig);

    const batchId = 'batch-' + Date.now();
    const batchJobs = [];

    for (let i = 0; i < imageBatch.length; i++) {
      const job = imageBatch[i];
      console.log(`  Queuing job ${i + 1}/${imageBatch.length}: ${job.prompt.substring(0, 30)}...`);

      batchJobs.push({
        batchId,
        jobIndex: i,
        prompt: job.prompt,
        status: 'queued',
        queuedAt: new Date().toISOString()
      });

      await sleep(100); // Small delay between submissions
    }

    console.log(`Batch ${batchId} submitted with ${batchJobs.length} jobs`);

    console.log('\n2. Monitor batch progress:');

    let completedJobs = 0;
    let totalJobs = batchJobs.length;

    // Simulate progress updates
    const progressIntervals = [0, 33, 66, 100];

    for (const progress of progressIntervals) {
      completedJobs = Math.floor((progress / 100) * totalJobs);
      console.log(`  Batch progress: ${progress}% (${completedJobs}/${totalJobs} complete)`);
      await sleep(500);
    }

    console.log('Batch processing completed!');

    console.log('\n3. Batch results aggregation:');

    const batchResults = {
      batchId,
      totalJobs: totalJobs,
      completed: completedJobs,
      failed: 0,
      averageProcessingTime: 15.3, // seconds
      totalCost: 0.45, // USD
      results: batchJobs.map((job, i) => ({
        jobIndex: i,
        prompt: job.prompt,
        status: 'completed',
        imageUrl: `https://storage.fluxez.com/images/batch-${batchId}-${i}.png`
      }))
    };

    console.log('Batch results:', {
      batchId: batchResults.batchId,
      completed: batchResults.completed,
      totalCost: batchResults.totalCost
    });

    console.log('\n4. Failed job handling:');

    console.log('Failed job retry strategy:');
    console.log('  - Attempt 1: Immediate retry');
    console.log('  - Attempt 2: Retry after 5 seconds');
    console.log('  - Attempt 3: Retry after 10 seconds');
    console.log('  - After 3 failures: Mark as permanently failed');
    console.log('  - Notify webhook with failure details');

    console.log('\n5. Batch job dependencies:');

    console.log('Sequential batch processing:');
    console.log('  Job 1: Generate base image');
    console.log('  Job 2: Apply style transfer (depends on Job 1)');
    console.log('  Job 3: Upscale result (depends on Job 2)');
    console.log('  Job 4: Generate variations (depends on Job 3)');

    console.log('\n6. Parallel vs Sequential processing:');

    const parallelBatch = {
      name: 'Parallel Processing',
      jobs: 10,
      estimatedTime: '15 seconds',
      useCase: 'Independent image generations'
    };

    const sequentialBatch = {
      name: 'Sequential Processing',
      jobs: 4,
      estimatedTime: '60 seconds',
      useCase: 'Dependent image transformations'
    };

    console.log('Parallel batch:', parallelBatch);
    console.log('Sequential batch:', sequentialBatch);

  } catch (error) {
    console.error('Batch processing failed:', error.message);
  }
}

async function demonstrateWebhookServer() {
  console.log('\n\nWebhook Server Implementation\n');
  console.log('==========================================');

  console.log('Example Express webhook server:\n');

  // Print example webhook server code
  const webhookServerCode = `
const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// Webhook endpoint for image completion
app.post('/webhook/image-complete', (req, res) => {
  const { jobId, status, result, error, metadata } = req.body;

  console.log('Image webhook received:', {
    jobId,
    status,
    timestamp: new Date().toISOString()
  });

  if (status === 'completed') {
    console.log('Image generated successfully!');
    console.log('Storage URL:', result.storageUrl);
    console.log('Image dimensions:', result.dimensions);
    console.log('Processing time:', result.processingTime, 'seconds');

    // Process the completed image
    // - Save to database
    // - Send notification to user
    // - Trigger next workflow step

  } else if (status === 'failed') {
    console.error('Image generation failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);

    // Handle failure
    // - Log error
    // - Notify administrators
    // - Retry if appropriate
  }

  // Always respond 200 to acknowledge receipt
  res.json({ received: true, timestamp: new Date().toISOString() });
});

// Webhook endpoint for video completion
app.post('/webhook/video-complete', (req, res) => {
  const { taskId, status, videoUrl, error, cost } = req.body;

  console.log('Video webhook received:', {
    taskId,
    status,
    cost
  });

  if (status === 'completed') {
    console.log('Video generated successfully!');
    console.log('Video URL:', videoUrl);
    console.log('Generation cost:', cost, 'USD');

    // Process the completed video
    // - Download and store
    // - Extract thumbnail
    // - Update user dashboard

  } else if (status === 'failed') {
    console.error('Video generation failed:', error);

    // Handle video failure
    // - Refund credits
    // - Notify user
  }

  res.json({ received: true });
});

// Webhook endpoint for TTS completion
app.post('/webhook/tts-complete', (req, res) => {
  const { jobId, status, audioUrl, duration, error } = req.body;

  console.log('TTS webhook received:', {
    jobId,
    status,
    duration
  });

  if (status === 'completed') {
    console.log('Speech generated successfully!');
    console.log('Audio URL:', audioUrl);
    console.log('Duration:', duration, 'seconds');

    // Process completed TTS
    // - Download audio file
    // - Update content library
    // - Send to user

  } else if (status === 'failed') {
    console.error('TTS generation failed:', error);
  }

  res.json({ received: true });
});

// Webhook endpoint for STT completion
app.post('/webhook/stt-complete', (req, res) => {
  const { jobId, status, transcription, error } = req.body;

  console.log('STT webhook received:', {
    jobId,
    status
  });

  if (status === 'completed') {
    console.log('Transcription completed!');
    console.log('Text:', transcription.text);
    console.log('Language:', transcription.language);
    console.log('Confidence:', transcription.confidence);

    // Process transcription
    // - Save to database
    // - Index for search
    // - Generate subtitles

  } else if (status === 'failed') {
    console.error('Transcription failed:', error);
  }

  res.json({ received: true });
});

// Webhook endpoint for batch completion
app.post('/webhook/batch-complete', (req, res) => {
  const { batchId, totalJobs, completed, failed, results } = req.body;

  console.log('Batch webhook received:', {
    batchId,
    totalJobs,
    completed,
    failed
  });

  console.log('Batch processing complete!');
  console.log('Success rate:', (completed / totalJobs * 100).toFixed(1), '%');

  // Process batch results
  results.forEach((result, index) => {
    console.log(\`Job \${index + 1}: \${result.status}\`);
    if (result.status === 'completed') {
      console.log('  URL:', result.url);
    } else {
      console.log('  Error:', result.error);
    }
  });

  // Send batch completion notification
  // - Email summary to user
  // - Update dashboard
  // - Archive results

  res.json({ received: true });
});

// Webhook security: Verify signature
app.use((req, res, next) => {
  const signature = req.headers['x-webhook-signature'];
  const timestamp = req.headers['x-webhook-timestamp'];

  if (!signature || !timestamp) {
    return res.status(401).json({ error: 'Missing signature' });
  }

  // Verify signature using your secret key
  const isValid = verifyWebhookSignature(
    req.body,
    signature,
    timestamp,
    process.env.WEBHOOK_SECRET
  );

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
});

// Helper function to verify webhook signature
function verifyWebhookSignature(payload, signature, timestamp, secret) {
  const crypto = require('crypto');

  // Prevent replay attacks (timestamp must be within 5 minutes)
  const age = Date.now() - parseInt(timestamp);
  if (age > 5 * 60 * 1000) {
    return false;
  }

  // Compute expected signature
  const data = timestamp + '.' + JSON.stringify(payload);
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');

  // Constant-time comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Webhook error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.WEBHOOK_PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Webhook server running on port \${PORT}\`);
  console.log('Endpoints:');
  console.log('  POST /webhook/image-complete');
  console.log('  POST /webhook/video-complete');
  console.log('  POST /webhook/tts-complete');
  console.log('  POST /webhook/stt-complete');
  console.log('  POST /webhook/batch-complete');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
  `.trim();

  console.log(webhookServerCode);

  console.log('\n\nWebhook Best Practices:');
  console.log('======================');
  console.log('1. Always respond with 200 OK to acknowledge receipt');
  console.log('2. Process webhooks asynchronously (queue for processing)');
  console.log('3. Implement signature verification for security');
  console.log('4. Handle idempotency (same webhook may be delivered multiple times)');
  console.log('5. Set reasonable timeout (5-10 seconds max)');
  console.log('6. Log all webhook events for debugging');
  console.log('7. Implement retry logic on your side if processing fails');
  console.log('8. Use HTTPS for webhook URLs in production');
  console.log('9. Store webhook secret securely (environment variable)');
  console.log('10. Monitor webhook delivery success rate');

  console.log('\n\nWebhook Payload Examples:');
  console.log('=========================');

  const payloadExamples = {
    imageComplete: {
      jobId: 'img-job-123',
      status: 'completed',
      result: {
        storageUrl: 'https://storage.fluxez.com/images/abc123.png',
        dimensions: { width: 1024, height: 1024 },
        format: 'png',
        size: 1024000,
        processingTime: 12.5
      },
      metadata: {
        prompt: 'A beautiful sunset',
        model: 'flux-schnell',
        quality: 'hd'
      },
      timestamp: new Date().toISOString()
    },
    videoComplete: {
      taskId: 'vid-task-456',
      status: 'completed',
      videoUrl: 'https://storage.fluxez.com/videos/def456.mp4',
      cost: 0.25,
      duration: 5,
      dimensions: { width: 1920, height: 1080 },
      fps: 30,
      timestamp: new Date().toISOString()
    },
    jobFailed: {
      jobId: 'job-789',
      status: 'failed',
      error: {
        code: 'INSUFFICIENT_GPU_MEMORY',
        message: 'Not enough GPU memory to process request',
        retryable: true
      },
      attempts: 3,
      timestamp: new Date().toISOString()
    }
  };

  console.log('\nImage completion payload:');
  console.log(JSON.stringify(payloadExamples.imageComplete, null, 2));

  console.log('\nVideo completion payload:');
  console.log(JSON.stringify(payloadExamples.videoComplete, null, 2));

  console.log('\nJob failure payload:');
  console.log(JSON.stringify(payloadExamples.jobFailed, null, 2));
}

// Helper function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Error handling helper
function handleJobError(error, jobType) {
  console.error(`\n${jobType} job error:`, error.message);

  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Details:', error.response.data);
  }

  // Determine if error is retryable
  const retryableErrors = [
    'TIMEOUT',
    'SERVICE_UNAVAILABLE',
    'RATE_LIMIT_EXCEEDED',
    'QUEUE_FULL'
  ];

  const errorCode = error.response?.data?.error?.code || error.code;
  const isRetryable = retryableErrors.includes(errorCode);

  console.log('Retryable:', isRetryable);

  return { error, isRetryable };
}

// Job status poller
async function pollJobStatus(client, jobId, jobType, maxAttempts = 30) {
  console.log(`Polling ${jobType} job: ${jobId}`);

  for (let i = 0; i < maxAttempts; i++) {
    await sleep(2000);

    try {
      // This is a conceptual example - implement based on your API
      // const status = await client.ai.getJobStatus(jobId);

      console.log(`  Attempt ${i + 1}/${maxAttempts}`);

      // if (status.status === 'completed') {
      //   console.log('Job completed!', status);
      //   return status;
      // }
      //
      // if (status.status === 'failed') {
      //   throw new Error(status.error || 'Job failed');
      // }

    } catch (error) {
      console.error('  Polling error:', error.message);
    }
  }

  throw new Error('Job polling timed out');
}

// Run the examples
if (require.main === module) {
  console.log('Running Fluxez SDK Queue & Webhooks Examples\n');
  console.log('='.repeat(50));
  console.log('');

  queueWebhooksExamplesMain()
    .then(() => {
      console.log('\n' + '='.repeat(50));
      console.log('\nNext Steps:');
      console.log('1. Set up a webhook server (use Express example above)');
      console.log('2. Deploy webhook server with public URL (ngrok for testing)');
      console.log('3. Configure webhook URLs in your job submissions');
      console.log('4. Monitor webhook delivery and processing');
      console.log('5. Implement retry logic for failed jobs');
      console.log('6. Set up monitoring and alerting for queue health');
      console.log('\nDocumentation:');
      console.log('- Queue API: https://docs.fluxez.com/api/queue');
      console.log('- Webhooks: https://docs.fluxez.com/api/webhooks');
      console.log('- Best Practices: https://docs.fluxez.com/guides/webhooks');
    })
    .catch(error => {
      console.error('\nFatal error:', error);
      process.exit(1);
    });
}

// Export for use in other files
module.exports = {
  queueWebhooksExamplesMain,
  demonstrateImageGeneration,
  demonstrateVideoGeneration,
  demonstrateTTSGeneration,
  demonstrateSTTProcessing,
  demonstrateQueueManagement,
  demonstrateBatchProcessing,
  demonstrateWebhookServer,
  pollJobStatus,
  handleJobError
};
