/**
 * Fluxez SDK - AI Examples
 *
 * This example demonstrates AI capabilities using the Fluxez SDK.
 * Perfect for AI-powered content generation, text processing, and media creation.
 *
 * Features demonstrated:
 * - Text generation (chat, completion, code, summarization)
 * - Image generation with multiple models
 * - Audio processing (TTS, STT)
 * - Video generation
 * - AI job queue management
 *
 * Time to complete: ~15 minutes
 */

const { FluxezClient } = require('@fluxez/node-sdk');
const fs = require('fs');
const path = require('path');

// Configuration
const API_KEY = process.env.FLUXEZ_API_KEY || 'service_your_api_key_here';

async function aiExamplesMain() {
  console.log('Fluxez SDK AI Examples\n');

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

    await demonstrateTextGeneration(client);
    await demonstrateChatCompletion(client);
    await demonstrateCodeGeneration(client);
    await demonstrateTextProcessing(client);
    await demonstrateImageGeneration(client);
    await demonstrateAudioOperations(client);
    await demonstrateVideoGeneration(client);
    await demonstrateJobQueueManagement(client);

    console.log('\nAI Examples Complete!');
  } catch (error) {
    console.error('AI examples failed:', error);
    console.log('\nTroubleshooting:');
    console.log('- Ensure your backend has AI services configured');
    console.log('- Check that OpenAI/other AI provider API keys are set');
    console.log('- Verify your API key has AI permissions');
  }
}

async function demonstrateTextGeneration(client) {
  console.log('Text Generation\n');
  console.log('==========================================');

  try {
    console.log('1. Basic text generation:');

    const result = await client.ai.generateText(
      'Write a short paragraph about the benefits of cloud computing',
      { saveToDatabase: false }
    );

    console.log('Generated text:', result.text?.substring(0, 200) + '...');
    if (result.contentId) {
      console.log('Content ID:', result.contentId);
    }

    console.log('\n2. Text generation with system message:');

    const technicalResult = await client.ai.generateText(
      'Explain RESTful APIs',
      {
        systemMessage: 'You are a technical writer who explains concepts clearly and concisely.',
        saveToDatabase: true,
      }
    );

    console.log('Technical explanation:', technicalResult.text?.substring(0, 200) + '...');
  } catch (error) {
    console.error('Text generation failed:', error.message);
  }
}

async function demonstrateChatCompletion(client) {
  console.log('\n\nChat Completion\n');
  console.log('==========================================');

  try {
    console.log('1. Simple chat conversation:');

    const chatResult = await client.ai.chat([
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'What are the main programming paradigms?' },
    ]);

    console.log('Assistant response:', chatResult.message?.substring(0, 200) + '...');

    console.log('\n2. Multi-turn conversation:');

    const multiTurnResult = await client.ai.chat([
      { role: 'system', content: 'You are a programming tutor.' },
      { role: 'user', content: 'What is a variable?' },
      {
        role: 'assistant',
        content:
          'A variable is a named storage location in a program that holds a value which can be changed during execution.',
      },
      { role: 'user', content: 'Can you give me an example in JavaScript?' },
    ]);

    console.log('Follow-up response:', multiTurnResult.message?.substring(0, 200) + '...');
  } catch (error) {
    console.error('Chat completion failed:', error.message);
  }
}

async function demonstrateCodeGeneration(client) {
  console.log('\n\nCode Generation\n');
  console.log('==========================================');

  try {
    console.log('1. Generate TypeScript code:');

    const tsCode = await client.ai.generateCode(
      'Create a function that validates email addresses using regex',
      {
        language: 'typescript',
        saveToDatabase: false,
      }
    );

    console.log('Generated TypeScript:');
    console.log(tsCode.code?.substring(0, 300) + '...');

    console.log('\n2. Generate React component:');

    const reactCode = await client.ai.generateCode('Create a simple button component with hover effect', {
      language: 'typescript',
      framework: 'react',
      saveToDatabase: false,
    });

    console.log('Generated React component:');
    console.log(reactCode.code?.substring(0, 300) + '...');

    console.log('\n3. Generate Python code:');

    const pythonCode = await client.ai.generateCode('Create a function to find prime numbers up to n', {
      language: 'python',
      saveToDatabase: false,
    });

    console.log('Generated Python:');
    console.log(pythonCode.code?.substring(0, 300) + '...');
  } catch (error) {
    console.error('Code generation failed:', error.message);
  }
}

async function demonstrateTextProcessing(client) {
  console.log('\n\nText Processing\n');
  console.log('==========================================');

  try {
    console.log('1. Summarize text:');

    const longText = `
      Artificial intelligence (AI) has transformed numerous industries over the past decade.
      From healthcare to finance, AI systems are being deployed to analyze vast amounts of data,
      make predictions, and automate complex tasks. Machine learning, a subset of AI, enables
      systems to learn from data without being explicitly programmed. Deep learning, which uses
      neural networks with multiple layers, has achieved remarkable success in image recognition,
      natural language processing, and game playing. However, the rapid advancement of AI also
      raises important ethical considerations, including concerns about job displacement, privacy,
      and the need for transparent and accountable AI systems.
    `;

    const summary = await client.ai.summarizeText(longText, { length: 'short' });

    console.log('Original length:', longText.length, 'characters');
    console.log('Summary:', summary.summary);
    console.log('Compression ratio:', summary.compressionRatio + 'x');

    console.log('\n2. Translate text:');

    const translation = await client.ai.translateText('Hello, how are you today?', 'es', { sourceLanguage: 'en' });

    console.log('Original: Hello, how are you today?');
    console.log('Spanish:', translation.translatedText);
    console.log('Confidence:', translation.confidence);

    console.log('\n3. Translate to multiple languages:');

    const languages = ['fr', 'de', 'ja', 'zh'];
    const textToTranslate = 'Welcome to our platform!';

    for (const lang of languages) {
      const result = await client.ai.translateText(textToTranslate, lang);
      console.log(`  ${lang}: ${result.translatedText}`);
    }
  } catch (error) {
    console.error('Text processing failed:', error.message);
  }
}

async function demonstrateImageGeneration(client) {
  console.log('\n\nImage Generation\n');
  console.log('==========================================');

  try {
    console.log('1. Generate image with default settings:');

    const imageResult = await client.ai.generateImage('A beautiful sunset over mountains with dramatic clouds', {
      size: '1024x1024',
      quality: 'standard',
    });

    console.log('Image generation result:', {
      success: imageResult.success,
      images: imageResult.data?.images?.length || 0,
      jobId: imageResult.data?.jobId,
      status: imageResult.data?.status,
    });

    if (imageResult.data?.images?.[0]?.url) {
      console.log('Image URL:', imageResult.data.images[0].url);
    }

    console.log('\n2. Generate HD quality image:');

    const hdImage = await client.ai.generateImage('A futuristic cyberpunk city at night with neon lights', {
      size: '1024x1024',
      quality: 'hd',
      style: 'vivid',
    });

    console.log('HD Image result:', {
      success: hdImage.success,
      cost: hdImage.data?.cost,
    });

    console.log('\n3. Generate image with negative prompt:');

    const refinedImage = await client.ai.generateImage('Professional portrait photo of a business person', {
      size: '1024x1024',
      quality: 'hd',
      negativePrompt: 'blurry, distorted, low quality, cartoon',
    });

    console.log('Refined image result:', {
      success: refinedImage.success,
    });
  } catch (error) {
    console.error('Image generation failed:', error.message);
  }
}

async function demonstrateAudioOperations(client) {
  console.log('\n\nAudio Operations\n');
  console.log('==========================================');

  try {
    console.log('1. Text to Speech:');

    const ttsResult = await client.ai.textToSpeech('Hello! This is a demonstration of text to speech capabilities.', {
      voice: 'alloy',
      speed: 1.0,
      responseFormat: 'mp3',
    });

    if (ttsResult instanceof Buffer) {
      console.log('TTS Result: Audio buffer received');
      console.log('Buffer size:', ttsResult.length, 'bytes');

      // Optionally save to file
      // fs.writeFileSync('output.mp3', ttsResult);
      // console.log('Saved to output.mp3');
    } else {
      console.log('TTS Result:', {
        success: ttsResult.success,
        jobId: ttsResult.jobId,
        status: ttsResult.status,
      });
    }

    console.log('\n2. Available voices:');

    const voices = await client.ai.getAvailableVoices();
    console.log(
      'Available voices:',
      voices.map((v) => v.name || v.id).join(', ')
    );

    console.log('\n3. Speech to Text (transcription):');
    console.log('Note: Requires an audio file. Example code:');
    console.log(`
      const audioFile = fs.readFileSync('./audio.mp3');
      const transcription = await client.ai.transcribeAudio(audioFile, {
        language: 'en',
        responseFormat: 'json'
      });
      console.log('Transcription:', transcription.text);
    `);
  } catch (error) {
    console.error('Audio operations failed:', error.message);
  }
}

async function demonstrateVideoGeneration(client) {
  console.log('\n\nVideo Generation\n');
  console.log('==========================================');

  try {
    console.log('1. Generate video from text prompt:');

    const videoResult = await client.ai.generateVideo('A cat playing with a ball of yarn', {
      duration: 4,
      aspectRatio: '16:9',
      frameRate: 24,
    });

    console.log('Video generation result:', {
      success: videoResult.success,
      taskId: videoResult.data?.taskId,
      jobId: videoResult.data?.jobId,
      status: videoResult.data?.status,
      dimensions: videoResult.data?.dimensions,
    });

    console.log('\n2. Check video job status:');

    if (videoResult.data?.taskId || videoResult.data?.jobId) {
      const jobId = videoResult.data.taskId || videoResult.data.jobId;
      const status = await client.ai.getVideoJobStatus(jobId);

      console.log('Video job status:', {
        status: status.data?.status,
        videoUrl: status.data?.videoUrl,
      });
    }

    console.log('\n3. Generate video with webhook notification:');

    const videoWithWebhook = await client.ai.generateVideo('A bird flying over ocean waves', {
      duration: 5,
      aspectRatio: '1:1',
      webhookUrl: 'https://your-domain.com/webhook/video-complete',
    });

    console.log('Video with webhook:', {
      taskId: videoWithWebhook.data?.taskId,
      message: 'Webhook will be called when video is ready',
    });
  } catch (error) {
    console.error('Video generation failed:', error.message);
  }
}

async function demonstrateJobQueueManagement(client) {
  console.log('\n\nJob Queue Management\n');
  console.log('==========================================');

  try {
    console.log('1. Enqueue a job:');

    const job = await client.ai.enqueueJob(
      'image',
      {
        prompt: 'Abstract art with vibrant colors',
        size: '1024x1024',
        quality: 'hd',
      },
      {
        priority: 'normal',
        webhookUrl: 'https://your-domain.com/webhook/ai',
        autoRetry: true,
        maxRetries: 3,
      }
    );

    console.log('Enqueued job:', {
      jobId: job.data?.jobId,
      status: job.data?.status,
      priority: job.data?.priority,
    });

    console.log('\n2. Get queue status:');

    const queueStatus = await client.ai.getQueueStatus();

    console.log('Queue status:', {
      totalJobs: queueStatus.data?.totalJobs,
      byType: queueStatus.data?.jobsByType,
      byStatus: queueStatus.data?.jobsByStatus,
    });

    console.log('\n3. List jobs:');

    const jobs = await client.ai.listJobs({
      type: 'image',
      limit: 5,
    });

    console.log('Recent image jobs:', {
      total: jobs.data?.total,
      jobs: jobs.data?.jobs?.map((j) => ({
        jobId: j.jobId,
        status: j.status,
      })),
    });

    console.log('\n4. Get job details:');

    if (job.data?.jobId) {
      const jobDetails = await client.ai.getJobDetails(job.data.jobId);

      console.log('Job details:', {
        jobId: jobDetails.data?.jobId,
        type: jobDetails.data?.jobType,
        status: jobDetails.data?.status,
        progress: jobDetails.data?.progress,
        createdAt: jobDetails.data?.createdAt,
      });
    }

    console.log('\n5. Cancel a job:');
    console.log('Example: await client.ai.cancelJob(jobId)');
    console.log('Note: Only pending/queued jobs can be cancelled');
  } catch (error) {
    console.error('Job queue management failed:', error.message);
  }
}

// Run the examples
if (require.main === module) {
  console.log('Running Fluxez SDK AI Examples\n');

  aiExamplesMain()
    .then(() => {
      console.log('\n' + '='.repeat(50));
      console.log('\nNext Steps:');
      console.log('1. Check 17-ai-queue-webhooks.js for webhook examples');
      console.log('2. Check 18-ai-models-and-workflows.js for advanced AI workflows');
      console.log('3. Set up webhook endpoints to receive job notifications');
    })
    .catch(console.error);
}

// Export for use in other files
module.exports = {
  aiExamplesMain,
  demonstrateTextGeneration,
  demonstrateChatCompletion,
  demonstrateCodeGeneration,
  demonstrateTextProcessing,
  demonstrateImageGeneration,
  demonstrateAudioOperations,
  demonstrateVideoGeneration,
  demonstrateJobQueueManagement,
};
