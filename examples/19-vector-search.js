/**
 * Fluxez SDK - Vector Search (Qdrant) Examples
 *
 * This example demonstrates vector database operations using the Fluxez SDK.
 * Perfect for similarity search, embeddings storage, recommendation systems, and RAG applications.
 *
 * Features demonstrated:
 * - Collection management (create, list, delete, stats)
 * - Vector operations (upsert, search, delete)
 * - Similarity search with filters
 * - Recommendations based on positive/negative examples
 * - Health monitoring
 *
 * Time to complete: ~15 minutes
 */

const { FluxezClient } = require('@fluxez/node-sdk');

// Configuration
const API_KEY = process.env.FLUXEZ_API_KEY || 'service_your_api_key_here';

async function vectorSearchExamplesMain() {
  console.log('Fluxez SDK Vector Search Examples\n');

  const client = new FluxezClient(API_KEY, {
    debug: true,
    timeout: 60000,
  });

  try {
    // Test connection
    const connectionTest = await client.testConnection();
    if (!connectionTest.connected) {
      throw new Error('Cannot connect to backend. Please ensure the Fluxez backend is running.');
    }
    console.log('Connected to Fluxez backend\n');

    await demonstrateHealthCheck(client);
    await demonstrateCollectionManagement(client);
    await demonstrateVectorOperations(client);
    await demonstrateSimilaritySearch(client);
    await demonstrateFilteredSearch(client);
    await demonstrateRecommendations(client);
    await demonstrateRAGWorkflow(client);

    console.log('\nVector Search Examples Complete!');
  } catch (error) {
    console.error('Vector search examples failed:', error);
    console.log('\nTroubleshooting:');
    console.log('- Ensure Qdrant is running and accessible');
    console.log('- Check that your API key has vector permissions');
    console.log('- Verify the collection exists before searching');
  }
}

async function demonstrateHealthCheck(client) {
  console.log('Vector Database Health Check\n');
  console.log('==========================================');

  try {
    const health = await client.vector.getHealth();

    console.log('Health status:', {
      status: health.status,
      configured: health.configured,
      collections: health.collections?.length || 0,
    });

    if (health.collections?.length > 0) {
      console.log('Existing collections:', health.collections);
    }
  } catch (error) {
    console.error('Health check failed:', error.message);
  }
}

async function demonstrateCollectionManagement(client) {
  console.log('\n\nCollection Management\n');
  console.log('==========================================');

  try {
    console.log('1. Create a collection:');

    // Create a collection for storing document embeddings
    const createResult = await client.vector.createCollection({
      name: 'documents',
      vectorSize: 1536, // OpenAI embedding dimension
      distance: 'cosine', // cosine, euclid, or dot
    });

    console.log('Collection created:', {
      success: createResult.success,
      collection: createResult.collection,
    });

    console.log('\n2. List all collections:');

    const collections = await client.vector.listCollections();
    console.log('Collections:', collections.collections);

    console.log('\n3. Get collection statistics:');

    const stats = await client.vector.getCollectionStats('documents');
    console.log('Collection stats:', stats.stats);

    console.log('\n4. Check if collection exists:');

    const exists = await client.vector.collectionExists('documents');
    console.log('Collection "documents" exists:', exists);

    console.log('\n5. Ensure collection exists (create if not):');

    const created = await client.vector.ensureCollection({
      name: 'products',
      vectorSize: 768,
      distance: 'cosine',
    });

    console.log('Collection ensured, was created:', created);
  } catch (error) {
    console.error('Collection management failed:', error.message);
  }
}

async function demonstrateVectorOperations(client) {
  console.log('\n\nVector Operations\n');
  console.log('==========================================');

  try {
    // Ensure collection exists
    await client.vector.ensureCollection({
      name: 'documents',
      vectorSize: 1536,
      distance: 'cosine',
    });

    console.log('1. Insert a single vector:');

    // Generate a sample embedding (in practice, use AI embeddings)
    const sampleVector = generateSampleVector(1536);

    const insertResult = await client.vector.insert('documents', {
      id: 'doc_001',
      vector: sampleVector,
      payload: {
        title: 'Introduction to Machine Learning',
        content: 'Machine learning is a subset of artificial intelligence...',
        category: 'technology',
        author: 'John Doe',
        createdAt: new Date().toISOString(),
      },
    });

    console.log('Single vector inserted:', {
      success: insertResult.success,
      count: insertResult.count,
    });

    console.log('\n2. Upsert multiple vectors:');

    const documents = [
      {
        id: 'doc_002',
        vector: generateSampleVector(1536),
        payload: {
          title: 'Deep Learning Fundamentals',
          content: 'Deep learning uses neural networks with multiple layers...',
          category: 'technology',
          author: 'Jane Smith',
        },
      },
      {
        id: 'doc_003',
        vector: generateSampleVector(1536),
        payload: {
          title: 'Natural Language Processing',
          content: 'NLP enables computers to understand human language...',
          category: 'technology',
          author: 'Bob Johnson',
        },
      },
      {
        id: 'doc_004',
        vector: generateSampleVector(1536),
        payload: {
          title: 'Computer Vision Applications',
          content: 'Computer vision allows machines to interpret visual data...',
          category: 'technology',
          author: 'Alice Brown',
        },
      },
      {
        id: 'doc_005',
        vector: generateSampleVector(1536),
        payload: {
          title: 'Cooking with AI',
          content: 'How artificial intelligence is changing the culinary world...',
          category: 'lifestyle',
          author: 'Chef Mike',
        },
      },
    ];

    const upsertResult = await client.vector.upsert('documents', documents);

    console.log('Batch upsert result:', {
      success: upsertResult.success,
      count: upsertResult.count,
    });

    console.log('\n3. Delete a vector:');

    const deleteResult = await client.vector.delete('documents', 'doc_005');

    console.log('Delete result:', {
      success: deleteResult.success,
    });

    console.log('\n4. Delete multiple vectors:');

    // First, let's add some temporary vectors
    await client.vector.upsert('documents', [
      { id: 'temp_001', vector: generateSampleVector(1536), payload: { temp: true } },
      { id: 'temp_002', vector: generateSampleVector(1536), payload: { temp: true } },
    ]);

    const deleteMany = await client.vector.deleteMany('documents', ['temp_001', 'temp_002']);

    console.log('Delete many result:', {
      success: deleteMany.success,
      count: deleteMany.count,
    });
  } catch (error) {
    console.error('Vector operations failed:', error.message);
  }
}

async function demonstrateSimilaritySearch(client) {
  console.log('\n\nSimilarity Search\n');
  console.log('==========================================');

  try {
    console.log('1. Basic similarity search:');

    // Generate a query vector (in practice, embed the search query)
    const queryVector = generateSampleVector(1536);

    const searchResult = await client.vector.search('documents', {
      vector: queryVector,
      limit: 5,
    });

    console.log('Search results:', {
      success: searchResult.success,
      count: searchResult.count,
      results: searchResult.results?.map((r) => ({
        id: r.id,
        score: r.score.toFixed(4),
        title: r.payload?.title,
      })),
    });

    console.log('\n2. Simple search by vector:');

    const simpleResults = await client.vector.searchByVector('documents', queryVector, 3);

    console.log(
      'Simple search results:',
      simpleResults.map((r) => ({
        id: r.id,
        score: r.score.toFixed(4),
      }))
    );

    console.log('\n3. Search with score threshold:');

    const thresholdResult = await client.vector.search('documents', {
      vector: queryVector,
      limit: 10,
      threshold: 0.5, // Only return results with score > 0.5
    });

    console.log('Threshold search results:', {
      count: thresholdResult.count,
      aboveThreshold: thresholdResult.results?.filter((r) => r.score > 0.5).length,
    });
  } catch (error) {
    console.error('Similarity search failed:', error.message);
  }
}

async function demonstrateFilteredSearch(client) {
  console.log('\n\nFiltered Search\n');
  console.log('==========================================');

  try {
    const queryVector = generateSampleVector(1536);

    console.log('1. Search with category filter:');

    const filteredResults = await client.vector.searchWithFilter(
      'documents',
      queryVector,
      { category: 'technology' },
      5
    );

    console.log(
      'Technology category results:',
      filteredResults.map((r) => ({
        id: r.id,
        score: r.score.toFixed(4),
        category: r.payload?.category,
      }))
    );

    console.log('\n2. Search with author filter:');

    const authorResults = await client.vector.search('documents', {
      vector: queryVector,
      limit: 5,
      filter: { author: 'John Doe' },
    });

    console.log('Author filter results:', {
      count: authorResults.count,
      results: authorResults.results?.map((r) => ({
        id: r.id,
        author: r.payload?.author,
      })),
    });

    console.log('\n3. Search with multiple filters:');

    const multiFilterResults = await client.vector.search('documents', {
      vector: queryVector,
      limit: 10,
      filter: {
        category: 'technology',
        // author: ['John Doe', 'Jane Smith'], // Array for IN filter
      },
    });

    console.log('Multi-filter results:', {
      count: multiFilterResults.count,
    });
  } catch (error) {
    console.error('Filtered search failed:', error.message);
  }
}

async function demonstrateRecommendations(client) {
  console.log('\n\nRecommendations\n');
  console.log('==========================================');

  try {
    console.log('1. Get recommendations based on positive examples:');

    // Recommend items similar to doc_001 and doc_002
    const recommendations = await client.vector.recommend('documents', {
      positive: ['doc_001', 'doc_002'],
      limit: 5,
    });

    console.log('Recommendations:', {
      success: recommendations.success,
      count: recommendations.count,
      results: recommendations.results?.map((r) => ({
        id: r.id,
        score: r.score.toFixed(4),
        title: r.payload?.title,
      })),
    });

    console.log('\n2. Recommendations with negative examples:');

    // Recommend items similar to doc_001 but NOT similar to doc_003
    const refinedRecs = await client.vector.recommend('documents', {
      positive: ['doc_001'],
      negative: ['doc_003'],
      limit: 5,
    });

    console.log('Refined recommendations:', {
      count: refinedRecs.count,
      results: refinedRecs.results?.map((r) => ({
        id: r.id,
        score: r.score.toFixed(4),
      })),
    });

    console.log('\n3. Recommendations with filter:');

    const filteredRecs = await client.vector.recommend('documents', {
      positive: ['doc_001'],
      limit: 5,
      filter: { category: 'technology' },
    });

    console.log('Filtered recommendations:', {
      count: filteredRecs.count,
    });
  } catch (error) {
    console.error('Recommendations failed:', error.message);
  }
}

async function demonstrateRAGWorkflow(client) {
  console.log('\n\nRAG (Retrieval-Augmented Generation) Workflow\n');
  console.log('==========================================');

  console.log('Example RAG workflow using vector search:\n');

  console.log('Step 1: Store document embeddings');
  console.log('--------------------------------');
  console.log(`
    // Get embeddings from AI using generateEmbeddings
    const embedding = await client.ai.generateEmbeddings(documentText);

    // Store in vector database
    await client.vector.upsert('knowledge_base', [{
      id: 'doc_' + docId,
      vector: embedding.embeddings[0],  // Get first embedding vector
      payload: {
        title: document.title,
        content: document.content,
        source: document.source,
        metadata: document.metadata
      }
    }]);
  `);

  console.log('\nStep 2: Query with user question');
  console.log('--------------------------------');
  console.log(`
    // Embed the user's question using generateEmbeddings
    const questionEmbedding = await client.ai.generateEmbeddings(userQuestion);

    // Search for relevant documents
    const relevantDocs = await client.vector.search('knowledge_base', {
      vector: questionEmbedding.embeddings[0],  // Get first embedding vector
      limit: 5,
      threshold: 0.7
    });
  `);

  console.log('\nStep 3: Generate answer with context');
  console.log('--------------------------------');
  console.log(`
    // Build context from retrieved documents
    const context = relevantDocs.results
      .map(doc => doc.payload.content)
      .join('\\n\\n');

    // Generate answer using AI with context
    const answer = await client.ai.chat([
      { role: 'system', content: 'Answer based on the provided context.' },
      { role: 'user', content: \`Context: \${context}\\n\\nQuestion: \${userQuestion}\` }
    ]);

    console.log('Answer:', answer.message);
  `);

  console.log('\nStep 4: Track sources');
  console.log('--------------------------------');
  console.log(`
    // Include sources in response
    const sources = relevantDocs.results.map(doc => ({
      title: doc.payload.title,
      source: doc.payload.source,
      relevanceScore: doc.score
    }));

    return {
      answer: answer.message,
      sources: sources
    };
  `);

  console.log('\nComplete RAG Example:');
  console.log('--------------------------------');

  try {
    // Ensure collection exists
    await client.vector.ensureCollection({
      name: 'knowledge_base',
      vectorSize: 1536,
      distance: 'cosine',
    });

    // Add sample knowledge
    const knowledgeBase = [
      {
        id: 'kb_001',
        vector: generateSampleVector(1536),
        payload: {
          title: 'Fluxez SDK Overview',
          content: 'Fluxez SDK provides a comprehensive set of tools for building modern applications...',
          source: 'docs/overview.md',
        },
      },
      {
        id: 'kb_002',
        vector: generateSampleVector(1536),
        payload: {
          title: 'Vector Search Guide',
          content: 'Vector search enables semantic similarity matching using embeddings...',
          source: 'docs/vector-search.md',
        },
      },
      {
        id: 'kb_003',
        vector: generateSampleVector(1536),
        payload: {
          title: 'AI Integration',
          content: 'The AI module supports text generation, image creation, and more...',
          source: 'docs/ai-module.md',
        },
      },
    ];

    await client.vector.upsert('knowledge_base', knowledgeBase);
    console.log('Knowledge base populated with', knowledgeBase.length, 'documents');

    // Simulate a search
    const queryVector = generateSampleVector(1536);
    const results = await client.vector.search('knowledge_base', {
      vector: queryVector,
      limit: 3,
    });

    console.log(
      '\nRetrieved relevant documents:',
      results.results?.map((r) => ({
        title: r.payload?.title,
        score: r.score.toFixed(4),
      }))
    );

    // Clean up
    await client.vector.deleteCollection('knowledge_base');
    console.log('\nKnowledge base collection cleaned up');
  } catch (error) {
    console.error('RAG workflow example failed:', error.message);
  }
}

/**
 * Generate a sample vector for demonstration purposes
 * In production, use actual embeddings from an AI model
 */
function generateSampleVector(dimensions) {
  const vector = [];
  for (let i = 0; i < dimensions; i++) {
    vector.push(Math.random() * 2 - 1); // Random values between -1 and 1
  }
  // Normalize the vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map((val) => val / magnitude);
}

// Clean up function
async function cleanupCollections(client) {
  console.log('\n\nCleanup\n');
  console.log('==========================================');

  try {
    // Delete test collections
    await client.vector.deleteCollection('documents');
    console.log('Deleted collection: documents');

    await client.vector.deleteCollection('products');
    console.log('Deleted collection: products');
  } catch (error) {
    console.log('Cleanup note:', error.message);
  }
}

// Run the examples
if (require.main === module) {
  console.log('Running Fluxez SDK Vector Search Examples\n');

  vectorSearchExamplesMain()
    .then(async () => {
      console.log('\n' + '='.repeat(50));
      console.log('\nNext Steps:');
      console.log('1. Integrate with AI embeddings (OpenAI, Cohere, etc.)');
      console.log('2. Build a RAG-powered chatbot');
      console.log('3. Create a semantic search feature');
      console.log('4. Implement recommendation systems');
      console.log('\nDocumentation:');
      console.log('- Vector Search: https://docs.fluxez.com/vector-search');
      console.log('- Qdrant: https://qdrant.tech/documentation');
    })
    .catch(console.error);
}

// Export for use in other files
module.exports = {
  vectorSearchExamplesMain,
  demonstrateHealthCheck,
  demonstrateCollectionManagement,
  demonstrateVectorOperations,
  demonstrateSimilaritySearch,
  demonstrateFilteredSearch,
  demonstrateRecommendations,
  demonstrateRAGWorkflow,
  generateSampleVector,
};
