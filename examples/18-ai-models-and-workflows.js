/**
 * Fluxez SDK - AI Models & Multi-Step Workflows Example
 *
 * This example demonstrates advanced AI features including:
 * - Multiple image generation models (Flux, SDXL)
 * - Multi-step video generation workflow
 * - Custom audio and image inputs for video generation
 * - Model-specific parameters and optimizations
 *
 * Time to complete: ~15 minutes
 */

const { FluxezClient } = require('@fluxez/node-sdk');
const fs = require('fs');
const path = require('path');

// Configuration
const API_KEY = process.env.FLUXEZ_API_KEY || 'cgx_your_api_key_here';

async function aiModelsWorkflowsMain() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  AI Models & Multi-Step Workflows Examples');
  console.log('═══════════════════════════════════════════════════════\n');

  const client = new FluxezClient(API_KEY, {
    debug: true,
    timeout: 180000, // 3 minutes for video generation
  });

  try {
    // Test connection
    const connectionTest = await client.testConnection();
    if (!connectionTest.connected) {
      throw new Error('Cannot connect to backend. Please ensure the Fluxez backend is running.');
    }
    console.log('✅ Connected to Fluxez backend\n');

    // Set context
    client.setOrganization('org_ai_models');
    client.setProject('proj_ai_models');

    await demonstrateImageModels(client);
    await demonstrateVideoWorkflow(client);
    await demonstrateVideoWithCustomAssets(client);

    console.log('\n✅ All Examples Complete!');

  } catch (error) {
    console.error('❌ Examples failed:', error);
    console.log('\n📋 Troubleshooting:');
    console.log('- Ensure backend has MediaServer configured');
    console.log('- Check that queue system is enabled');
    console.log('- Verify MediaServer is running and accessible');
  }
}

/**
 * Demonstrate different image generation models
 */
async function demonstrateImageModels(client) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Image Generation Models');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const prompt = 'A majestic lion in the African savanna at golden hour';

    // 1. Flux Model (default, fast generation)
    console.log('🎨 1. Flux Model Generation (Fast & High Quality)');
    console.log('────────────────────────────────────────────────\n');

    const fluxResult = await client.ai.generateImage(prompt, {
      model: 'flux',  // or 'flux-schnell'
      size: '1024x1024',
      quality: 'hd',
      style: 'vivid',
      steps: 20
    });

    console.log('Flux Result:', {
      jobId: fluxResult.data?.images?.[0]?.queueJobId,
      status: fluxResult.data?.images?.[0]?.queued ? 'queued' : 'completed',
      model: 'flux'
    });
    console.log('✨ Flux is optimized for speed and modern aesthetics\n');

    // 2. SDXL Model (Stable Diffusion XL, more realistic)
    console.log('🎨 2. SDXL Model Generation (Photorealistic)');
    console.log('────────────────────────────────────────────────\n');

    const sdxlResult = await client.ai.generateImage(prompt, {
      model: 'sdxl',  // Stable Diffusion XL
      size: '1024x1024',
      quality: 'hd',
      steps: 30,  // SDXL benefits from more steps
      negativePrompt: 'blurry, cartoon, anime, low quality'
    });

    console.log('SDXL Result:', {
      jobId: sdxlResult.data?.images?.[0]?.queueJobId,
      status: sdxlResult.data?.images?.[0]?.queued ? 'queued' : 'completed',
      model: 'sdxl'
    });
    console.log('✨ SDXL excels at photorealistic and detailed images\n');

    // 3. SDXL Refined (Enhanced version)
    console.log('🎨 3. SDXL Refined Model (Maximum Quality)');
    console.log('────────────────────────────────────────────────\n');

    const sdxlRefinedResult = await client.ai.generateImage(prompt, {
      model: 'sdxl-refined',
      size: '1024x1024',
      quality: 'hd',
      steps: 40,  // More steps for refined version
      CFGScale: 7.5,  // Classifier-free guidance scale
      negativePrompt: 'blurry, distorted, low resolution, artifacts'
    });

    console.log('SDXL Refined Result:', {
      jobId: sdxlRefinedResult.data?.images?.[0]?.queueJobId,
      status: sdxlRefinedResult.data?.images?.[0]?.queued ? 'queued' : 'completed',
      model: 'sdxl-refined'
    });
    console.log('✨ SDXL Refined provides the highest quality output\n');

    // 4. Model Comparison Summary
    console.log('📊 Model Comparison');
    console.log('────────────────────────────────────────────────\n');

    const modelComparison = [
      {
        model: 'flux',
        speed: '⚡⚡⚡ Very Fast',
        quality: '⭐⭐⭐⭐ High',
        style: 'Modern, Artistic',
        bestFor: 'Quick generations, creative content'
      },
      {
        model: 'sdxl',
        speed: '⚡⚡ Fast',
        quality: '⭐⭐⭐⭐⭐ Excellent',
        style: 'Photorealistic, Detailed',
        bestFor: 'Product photos, portraits, realistic scenes'
      },
      {
        model: 'sdxl-refined',
        speed: '⚡ Moderate',
        quality: '⭐⭐⭐⭐⭐ Maximum',
        style: 'Ultra-realistic, Fine details',
        bestFor: 'Professional work, print-ready images'
      }
    ];

    modelComparison.forEach(model => {
      console.log(`${model.model.toUpperCase()}:`);
      console.log(`  Speed:     ${model.speed}`);
      console.log(`  Quality:   ${model.quality}`);
      console.log(`  Style:     ${model.style}`);
      console.log(`  Best For:  ${model.bestFor}\n`);
    });

    // 5. Track job status
    if (sdxlResult.data?.images?.[0]?.queueJobId) {
      console.log('📊 Tracking SDXL Job Status');
      console.log('────────────────────────────────────────────────\n');

      const jobId = sdxlResult.data.images[0].queueJobId;
      const jobDetails = await client.ai.getJobDetails(jobId);

      console.log('Job Details:', {
        jobId: jobDetails.data?.jobId,
        type: jobDetails.data?.jobType,
        status: jobDetails.data?.status,
        progress: jobDetails.data?.progress,
        model: jobDetails.data?.jobData?.model
      });
    }

  } catch (error) {
    console.error('❌ Image generation failed:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
  }
}

/**
 * Demonstrate multi-step video generation workflow
 */
async function demonstrateVideoWorkflow(client) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Multi-Step Video Generation Workflow');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📝 About the Workflow:');
  console.log('────────────────────────────────────────────────');
  console.log('Video generation uses a 3-step pipeline:');
  console.log('  Step 1: 🎤 Generate TTS audio from text prompt');
  console.log('  Step 2: 🖼️  Generate avatar image');
  console.log('  Step 3: 🎬 Combine audio + image into video\n');
  console.log('All steps are queued and processed asynchronously!');
  console.log('────────────────────────────────────────────────\n');

  try {
    console.log('🎬 1. Basic Video Generation (Full Pipeline)');
    console.log('────────────────────────────────────────────────\n');

    const videoPrompt = 'Explaining how machine learning algorithms work in simple terms';

    const videoResult = await client.ai.generateVideo(videoPrompt, {
      duration: 5,
      aspectRatio: '16:9',
      frameRate: 24,
      webhookUrl: 'https://your-app.com/webhook/video-complete'
    });

    console.log('Video Job Created:', {
      taskId: videoResult.data?.taskId,
      jobId: videoResult.data?.jobId,
      status: videoResult.data?.status,
      duration: videoResult.data?.duration,
      dimensions: videoResult.data?.dimensions
    });

    console.log('\n💡 Behind the Scenes:');
    console.log('  ✓ Job queued for processing');
    console.log('  ✓ Step 1 will generate audio from your prompt');
    console.log('  ✓ Step 2 will generate an avatar image');
    console.log('  ✓ Step 3 will combine them into a video');
    console.log('  ✓ Webhook will notify you when complete\n');

    // Track progress
    if (videoResult.data?.taskId || videoResult.data?.jobId) {
      const jobId = videoResult.data.taskId || videoResult.data.jobId;

      console.log('📊 Checking Video Job Status');
      console.log('────────────────────────────────────────────────\n');

      const jobDetails = await client.ai.getJobDetails(jobId);

      console.log('Job Status:', {
        jobId: jobDetails.data?.jobId,
        status: jobDetails.data?.status,
        currentStep: jobDetails.data?.currentStep || 'queued',
        progress: jobDetails.data?.progress || 0
      });

      if (jobDetails.data?.currentStep) {
        const stepNames = {
          'tts': '🎤 Generating Audio',
          'image': '🖼️  Generating Image',
          'video': '🎬 Compositing Video'
        };
        console.log(`\nCurrent Step: ${stepNames[jobDetails.data.currentStep] || jobDetails.data.currentStep}`);
      }

      if (jobDetails.data?.audioUrl) {
        console.log('Audio URL:', jobDetails.data.audioUrl);
      }

      if (jobDetails.data?.imageUrl) {
        console.log('Image URL:', jobDetails.data.imageUrl);
      }
    }

    console.log('\n🔔 Webhook Notification:');
    console.log('────────────────────────────────────────────────');
    console.log('When the video is complete, you\'ll receive:');
    console.log(JSON.stringify({
      jobId: 'job-abc-123',
      jobType: 'video',
      status: 'completed',
      currentStep: 'video',
      result: {
        videoUrl: 'https://cdn.fluxez.com/videos/final-video.mp4',
        audioUrl: 'https://cdn.fluxez.com/audio/tts-audio.wav',
        imageUrl: 'https://cdn.fluxez.com/images/avatar.png',
        duration: 5,
        fileSize: 2048000
      },
      progress: 100
    }, null, 2));

  } catch (error) {
    console.error('❌ Video generation failed:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
  }
}

/**
 * Demonstrate video generation with custom audio and image
 */
async function demonstrateVideoWithCustomAssets(client) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Video Generation with Custom Assets');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('💡 You can skip workflow steps by providing:');
  console.log('  - audioUrl: Skip TTS generation');
  console.log('  - imageUrl: Skip image generation');
  console.log('  - Both: Only perform video composition\n');

  try {
    // 1. Provide both audio and image (skip Steps 1 and 2)
    console.log('🎬 1. Video with Pre-Generated Assets');
    console.log('────────────────────────────────────────────────\n');

    const videoWithAssets = await client.ai.enqueueJob('video', {
      prompt: 'Marketing video with custom branding',
      duration: 5,
      audioUrl: 'https://your-cdn.com/custom-audio.wav',  // Your audio file
      imageUrl: 'https://your-cdn.com/avatar.png',        // Your image file
      resolution: '768x480',
      modelSize: '1.3B'
    }, {
      priority: 'normal',
      webhookUrl: 'https://your-app.com/webhook/video-ready'
    });

    console.log('Video Job with Custom Assets:', {
      jobId: videoWithAssets.data?.jobId,
      status: videoWithAssets.data?.status
    });

    console.log('\n✨ Benefits:');
    console.log('  ✓ Faster processing (skips Steps 1 & 2)');
    console.log('  ✓ Use your own voiceover');
    console.log('  ✓ Use branded avatar images');
    console.log('  ✓ Full control over audio and visuals\n');

    // 2. Provide only audio (skip Step 1)
    console.log('🎬 2. Video with Custom Audio');
    console.log('────────────────────────────────────────────────\n');

    const videoWithAudio = await client.ai.enqueueJob('video', {
      prompt: 'Professional voiceover video',
      duration: 8,
      audioUrl: 'https://your-cdn.com/professional-voiceover.wav',
      // No imageUrl provided - will generate avatar image
      resolution: '768x480',
      imagePrompt: 'Professional business person in suit, studio lighting',
      modelSize: '1.3B'
    }, {
      priority: 'normal',
      webhookUrl: 'https://your-app.com/webhook/video-ready'
    });

    console.log('Video Job with Custom Audio:', {
      jobId: videoWithAudio.data?.jobId,
      status: videoWithAudio.data?.status
    });

    console.log('\n✨ Workflow:');
    console.log('  ✓ Step 1: Skipped (audio provided)');
    console.log('  → Step 2: Generate avatar image');
    console.log('  → Step 3: Compose video\n');

    // 3. Provide only image (skip Step 2)
    console.log('🎬 3. Video with Custom Image');
    console.log('────────────────────────────────────────────────\n');

    const videoWithImage = await client.ai.enqueueJob('video', {
      prompt: 'Animated character explaining concepts',
      duration: 6,
      imageUrl: 'https://your-cdn.com/animated-character.png',
      // No audioUrl provided - will generate TTS audio
      voice: 'nova',  // TTS voice to use
      speed: 1.0,
      resolution: '768x480',
      modelSize: '1.3B'
    }, {
      priority: 'normal',
      webhookUrl: 'https://your-app.com/webhook/video-ready'
    });

    console.log('Video Job with Custom Image:', {
      jobId: videoWithImage.data?.jobId,
      status: videoWithImage.data?.status
    });

    console.log('\n✨ Workflow:');
    console.log('  → Step 1: Generate TTS audio');
    console.log('  ✓ Step 2: Skipped (image provided)');
    console.log('  → Step 3: Compose video\n');

    // 4. Queue status
    console.log('📊 Queue Overview');
    console.log('────────────────────────────────────────────────\n');

    const queueStatus = await client.ai.getQueueStatus();

    console.log('Queue Statistics:', {
      totalJobs: queueStatus.data?.totalJobs,
      byType: queueStatus.data?.jobsByType,
      byStatus: queueStatus.data?.jobsByStatus
    });

    console.log('\n💡 Tip: Use the queue system to process videos at scale!');

  } catch (error) {
    console.error('❌ Custom assets video failed:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
  }
}

// Helper: Sleep function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run examples
if (require.main === module) {
  console.log('');
  aiModelsWorkflowsMain()
    .then(() => {
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('  Next Steps');
      console.log('═══════════════════════════════════════════════════════\n');
      console.log('1. 📸 Try different image models for your use case');
      console.log('2. 🎬 Create videos with your own audio/images');
      console.log('3. 🔔 Set up webhook endpoints to receive notifications');
      console.log('4. 📊 Monitor queue status for large-scale processing');
      console.log('5. 🚀 Build production workflows with retry logic\n');
      console.log('📚 Documentation:');
      console.log('   - Image Models: https://docs.fluxez.com/ai/image-models');
      console.log('   - Video Workflow: https://docs.fluxez.com/ai/video-workflow');
      console.log('   - Job Queue: https://docs.fluxez.com/ai/queue');
      console.log('');
    })
    .catch(error => {
      console.error('\n❌ Fatal error:', error);
      process.exit(1);
    });
}

// Export functions
module.exports = {
  aiModelsWorkflowsMain,
  demonstrateImageModels,
  demonstrateVideoWorkflow,
  demonstrateVideoWithCustomAssets
};
