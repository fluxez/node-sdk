/**
 * Fluxez SDK - Search & Analytics Examples
 * 
 * This example demonstrates comprehensive search and analytics capabilities using the Fluxez SDK.
 * Perfect for implementing search features, business intelligence, and data analysis.
 * 
 * Features demonstrated:
 * - Full-text search with Elasticsearch
 * - Vector search with semantic similarity
 * - Advanced search filters and facets
 * - Search result ranking and scoring
 * - Analytics queries and aggregations
 * - Real-time analytics and dashboards
 * - Event tracking and metrics
 * - Custom analytics pipelines
 * 
 * Time to complete: ~15 minutes
 */

const { FluxezClient } = require('@fluxez/node-sdk');

// Configuration
const API_KEY = process.env.FLUXEZ_API_KEY || 'cgx_your_api_key_here';

async function searchAnalyticsExamplesMain() {
  console.log('🔍 Fluxez SDK Search & Analytics Examples\n');

  const client = new FluxezClient(API_KEY, {
    
    debug: true,
    timeout: 90000, // Longer timeout for search operations
  });

  try {
    // Test connection
    const connectionTest = await client.testConnection();
    if (!connectionTest.connected) {
      throw new Error('Cannot connect to backend. Please ensure the Fluxez backend is running.');
    }
    console.log('✅ Connected to Fluxez backend\n');

    // Set context
    client.setOrganization('org_search_demo');
    client.setProject('proj_search_demo');

    await demonstrateFullTextSearch(client);
    await demonstrateVectorSearch(client);
    await demonstrateAdvancedSearch(client);
    await demonstrateSearchAnalytics(client);
    await demonstrateBusinessAnalytics(client);
    await demonstrateEventTracking(client);
    await demonstrateRealTimeAnalytics(client);
    await demonstrateCustomAnalytics(client);

    console.log('\n🎉 Search & Analytics Examples Complete!');

  } catch (error) {
    console.error('❌ Search & Analytics examples failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Ensure your backend has Elasticsearch configured');
    console.log('- Check that Qdrant vector database is accessible');
    console.log('- Verify ClickHouse analytics database is running');
    console.log('- Confirm your API key has search/analytics permissions');
  }
}

async function demonstrateFullTextSearch(client) {
  console.log('📝 Full-Text Search\n');
  console.log('==========================================');

  try {
    console.log('1. Index sample documents:');
    
    // Sample documents to index for searching
    const sampleDocuments = [
      {
        id: 'doc_1',
        title: 'Getting Started with Fluxez SDK',
        content: 'The Fluxez SDK provides powerful tools for building modern applications. It includes features for data management, real-time search, analytics, and more.',
        category: 'documentation',
        tags: ['sdk', 'getting-started', 'tutorial'],
        author: 'John Doe',
        publishedAt: '2024-01-15T10:00:00Z',
        views: 1250,
        rating: 4.8
      },
      {
        id: 'doc_2',
        title: 'Advanced Search Techniques',
        content: 'Learn how to implement sophisticated search functionality using Elasticsearch integration. Cover faceted search, autocomplete, and result ranking.',
        category: 'guide',
        tags: ['search', 'elasticsearch', 'advanced'],
        author: 'Jane Smith',
        publishedAt: '2024-01-20T14:30:00Z',
        views: 890,
        rating: 4.6
      },
      {
        id: 'doc_3',
        title: 'Building Analytics Dashboards',
        content: 'Create interactive dashboards with real-time data visualization. Use ClickHouse for fast analytics queries and beautiful charts.',
        category: 'tutorial',
        tags: ['analytics', 'dashboards', 'clickhouse'],
        author: 'Bob Johnson',
        publishedAt: '2024-01-25T09:15:00Z',
        views: 567,
        rating: 4.9
      },
      {
        id: 'doc_4',
        title: 'Vector Search and AI',
        content: 'Implement semantic search using vector embeddings. Find similar content based on meaning rather than just keywords.',
        category: 'advanced',
        tags: ['ai', 'vector-search', 'semantic'],
        author: 'Alice Wilson',
        publishedAt: '2024-02-01T16:45:00Z',
        views: 423,
        rating: 4.7
      },
      {
        id: 'doc_5',
        title: 'Email Integration Guide',
        content: 'Send transactional emails, newsletters, and automated campaigns. Handle templates, attachments, and delivery tracking.',
        category: 'integration',
        tags: ['email', 'automation', 'templates'],
        author: 'Charlie Brown',
        publishedAt: '2024-02-05T11:20:00Z',
        views: 234,
        rating: 4.5
      }
    ];

    // Index documents for search
    for (const doc of sampleDocuments) {
      await client.search.indexDocument('articles', doc.id, doc);
    }

    console.log(`✅ Indexed ${sampleDocuments.length} documents for search`);

    console.log('\n2. Basic text search:');
    
    const basicSearch = await client.search.search({
      index: 'articles',
      query: 'Fluxez SDK tutorial',
      limit: 10
    });

    console.log('✅ Basic search results:', {
      total: basicSearch.total,
      maxScore: basicSearch.maxScore,
      results: basicSearch.hits.map(hit => ({
        id: hit._id,
        title: hit._source.title,
        score: hit._score
      }))
    });

    console.log('\n3. Advanced search with filters:');
    
    const filteredSearch = await client.search.search({
      index: 'articles',
      query: 'search analytics',
      filters: {
        category: ['tutorial', 'guide'],
        rating: { min: 4.5 },
        publishedAt: {
          start: '2024-01-01',
          end: '2024-12-31'
        }
      },
      sort: [
        { rating: 'desc' },
        { views: 'desc' }
      ],
      limit: 5
    });

    console.log('✅ Filtered search results:', {
      total: filteredSearch.total,
      results: filteredSearch.hits.map(hit => ({
        title: hit._source.title,
        category: hit._source.category,
        rating: hit._source.rating,
        views: hit._source.views
      }))
    });

    console.log('\n4. Search with highlighting:');
    
    const highlightedSearch = await client.search.search({
      index: 'articles',
      query: 'dashboard visualization',
      highlight: {
        fields: ['title', 'content'],
        preTag: '<mark>',
        postTag: '</mark>',
        fragmentSize: 100
      },
      limit: 3
    });

    console.log('✅ Highlighted search results:');
    highlightedSearch.hits.forEach(hit => {
      console.log(`  Title: ${hit._source.title}`);
      if (hit.highlight?.title) {
        console.log(`  Highlighted title: ${hit.highlight.title[0]}`);
      }
      if (hit.highlight?.content) {
        console.log(`  Highlighted content: ${hit.highlight.content[0]}`);
      }
      console.log('');
    });

    console.log('\n5. Faceted search:');
    
    const facetedSearch = await client.search.search({
      index: 'articles',
      query: '*',
      facets: {
        category: { field: 'category', size: 10 },
        author: { field: 'author', size: 5 },
        tags: { field: 'tags', size: 15 },
        rating_ranges: {
          field: 'rating',
          ranges: [
            { from: 0, to: 3.0, label: 'Low' },
            { from: 3.0, to: 4.0, label: 'Medium' },
            { from: 4.0, to: 4.5, label: 'High' },
            { from: 4.5, to: 5.0, label: 'Excellent' }
          ]
        }
      },
      limit: 0 // Only get facets, no documents
    });

    console.log('✅ Faceted search results:', facetedSearch.facets);

    console.log('\n6. Autocomplete/suggestions:');
    
    const suggestions = await client.search.suggest({
      index: 'articles',
      field: 'title',
      text: 'analyt',
      size: 5
    });

    console.log('✅ Search suggestions:', suggestions);

    return sampleDocuments;

  } catch (error) {
    console.error('❌ Full-text search failed:', error.message);
    return [];
  }
}

async function demonstrateVectorSearch(client) {
  console.log('\n🧠 Vector Search (Semantic Similarity)\n');
  console.log('==========================================');

  try {
    console.log('1. Create vector embeddings:');
    
    // Sample documents with vector embeddings (simulated - in real usage, these would be generated by AI models)
    const vectorDocuments = [
      {
        id: 'vec_1',
        title: 'Machine Learning Basics',
        content: 'Introduction to artificial intelligence and machine learning concepts.',
        embedding: generateMockEmbedding('machine learning AI artificial intelligence'),
        metadata: {
          topic: 'ai',
          difficulty: 'beginner',
          readTime: 10
        }
      },
      {
        id: 'vec_2',
        title: 'Deep Learning Neural Networks',
        content: 'Understanding neural networks, backpropagation, and deep learning architectures.',
        embedding: generateMockEmbedding('neural networks deep learning backpropagation'),
        metadata: {
          topic: 'ai',
          difficulty: 'advanced',
          readTime: 25
        }
      },
      {
        id: 'vec_3',
        title: 'Database Design Principles',
        content: 'Best practices for designing relational and NoSQL databases.',
        embedding: generateMockEmbedding('database design relational NoSQL'),
        metadata: {
          topic: 'database',
          difficulty: 'intermediate',
          readTime: 15
        }
      },
      {
        id: 'vec_4',
        title: 'API Development Guidelines',
        content: 'How to build RESTful APIs with proper authentication and documentation.',
        embedding: generateMockEmbedding('API REST authentication documentation'),
        metadata: {
          topic: 'backend',
          difficulty: 'intermediate',
          readTime: 20
        }
      },
      {
        id: 'vec_5',
        title: 'Natural Language Processing',
        content: 'Text analysis, sentiment analysis, and language understanding with AI.',
        embedding: generateMockEmbedding('natural language processing text analysis sentiment'),
        metadata: {
          topic: 'ai',
          difficulty: 'advanced',
          readTime: 30
        }
      }
    ];

    // Index vectors in Qdrant
    for (const doc of vectorDocuments) {
      await client.search.indexVector('knowledge_base', doc.id, {
        vector: doc.embedding,
        payload: {
          title: doc.title,
          content: doc.content,
          metadata: doc.metadata
        }
      });
    }

    console.log(`✅ Indexed ${vectorDocuments.length} vector documents`);

    console.log('\n2. Semantic similarity search:');
    
    // Search for documents similar to "AI and machine learning"
    const queryEmbedding = generateMockEmbedding('artificial intelligence machine learning');
    
    const vectorSearchResults = await client.search.vectorSearch({
      collection: 'knowledge_base',
      vector: queryEmbedding,
      limit: 3,
      threshold: 0.7 // Minimum similarity score
    });

    console.log('✅ Vector search results:');
    vectorSearchResults.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.payload.title} (similarity: ${result.score.toFixed(3)})`);
      console.log(`     Topic: ${result.payload.metadata.topic}, Difficulty: ${result.payload.metadata.difficulty}`);
    });

    console.log('\n3. Hybrid search (text + vector):');
    
    const hybridSearchResults = await client.search.hybridSearch({
      textQuery: {
        index: 'articles',
        query: 'learning tutorial',
        boost: 0.3
      },
      vectorQuery: {
        collection: 'knowledge_base',
        vector: generateMockEmbedding('learning tutorial education'),
        boost: 0.7
      },
      limit: 5
    });

    console.log('✅ Hybrid search results:', hybridSearchResults);

    console.log('\n4. Vector search with filters:');
    
    const filteredVectorSearch = await client.search.vectorSearch({
      collection: 'knowledge_base',
      vector: queryEmbedding,
      filters: {
        'metadata.topic': 'ai',
        'metadata.difficulty': ['beginner', 'intermediate']
      },
      limit: 3
    });

    console.log('✅ Filtered vector search results:');
    filteredVectorSearch.forEach(result => {
      console.log(`  - ${result.payload.title} (${result.payload.metadata.difficulty})`);
    });

    console.log('\n5. Find similar documents:');
    
    const similarDocs = await client.search.findSimilar('knowledge_base', 'vec_1', {
      limit: 3,
      includeOriginal: false
    });

    console.log('✅ Similar documents to "Machine Learning Basics":');
    similarDocs.forEach(doc => {
      console.log(`  - ${doc.payload.title} (similarity: ${doc.score.toFixed(3)})`);
    });

  } catch (error) {
    console.error('❌ Vector search failed:', error.message);
  }
}

// Helper function to generate mock embeddings (in real usage, use OpenAI, Cohere, etc.)
function generateMockEmbedding(text, dimensions = 384) {
  // Generate a consistent embedding based on text content
  const hash = text.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const embedding = [];
  for (let i = 0; i < dimensions; i++) {
    embedding.push(Math.sin(hash + i) * 0.5 + Math.cos(hash * i) * 0.5);
  }
  
  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
}

async function demonstrateAdvancedSearch(client) {
  console.log('\n🎯 Advanced Search Features\n');
  console.log('==========================================');

  try {
    console.log('1. Multi-field search:');
    
    const multiFieldSearch = await client.search.search({
      index: 'articles',
      multiMatch: {
        query: 'search tutorial',
        fields: ['title^2', 'content', 'tags^1.5'], // Boost title and tags
        type: 'best_fields'
      },
      limit: 5
    });

    console.log('✅ Multi-field search results:', {
      total: multiFieldSearch.total,
      results: multiFieldSearch.hits.map(hit => ({
        title: hit._source.title,
        score: hit._score
      }))
    });

    console.log('\n2. Fuzzy search (handle typos):');
    
    const fuzzySearch = await client.search.search({
      index: 'articles',
      query: 'anaytlics dashbord', // Intentional typos
      fuzzy: {
        enabled: true,
        fuzziness: 2, // Allow up to 2 character differences
        prefixLength: 1
      },
      limit: 3
    });

    console.log('✅ Fuzzy search results (correcting typos):');
    fuzzySearch.hits.forEach(hit => {
      console.log(`  - ${hit._source.title} (score: ${hit._score.toFixed(3)})`);
    });

    console.log('\n3. Geo-spatial search:');
    
    // Index some location-based documents
    const locationDocs = [
      {
        id: 'loc_1',
        name: 'Coffee Shop Downtown',
        location: { lat: 40.7128, lon: -74.0060 }, // New York
        category: 'cafe'
      },
      {
        id: 'loc_2',
        name: 'Tech Meetup Space',
        location: { lat: 40.7589, lon: -73.9851 }, // Times Square
        category: 'event'
      },
      {
        id: 'loc_3',
        name: 'Coworking Hub',
        location: { lat: 40.6892, lon: -74.0445 }, // Brooklyn
        category: 'workspace'
      }
    ];

    for (const doc of locationDocs) {
      await client.search.indexDocument('locations', doc.id, doc);
    }

    // Search within 5km radius of Times Square
    const geoSearch = await client.search.search({
      index: 'locations',
      geoDistance: {
        field: 'location',
        distance: '5km',
        lat: 40.7589,
        lon: -73.9851
      },
      sort: [
        {
          _geo_distance: {
            location: { lat: 40.7589, lon: -73.9851 },
            order: 'asc',
            unit: 'km'
          }
        }
      ]
    });

    console.log('✅ Geo-spatial search results (within 5km):');
    geoSearch.hits.forEach(hit => {
      console.log(`  - ${hit._source.name} (${hit.sort[0].toFixed(2)} km away)`);
    });

    console.log('\n4. Date range and aggregation search:');
    
    const dateRangeSearch = await client.search.search({
      index: 'articles',
      filters: {
        publishedAt: {
          start: '2024-01-01',
          end: '2024-02-28'
        }
      },
      aggregations: {
        byMonth: {
          type: 'date_histogram',
          field: 'publishedAt',
          interval: 'month'
        },
        byCategory: {
          type: 'terms',
          field: 'category',
          size: 10
        },
        avgRating: {
          type: 'avg',
          field: 'rating'
        },
        viewsStats: {
          type: 'stats',
          field: 'views'
        }
      }
    });

    console.log('✅ Date range search with aggregations:', {
      total: dateRangeSearch.total,
      aggregations: dateRangeSearch.aggregations
    });

    console.log('\n5. Complex boolean search:');
    
    const booleanSearch = await client.search.search({
      index: 'articles',
      query: {
        bool: {
          must: [
            { match: { content: 'search' } }
          ],
          should: [
            { match: { title: 'advanced' } },
            { match: { tags: 'tutorial' } }
          ],
          must_not: [
            { match: { category: 'deprecated' } }
          ],
          filter: [
            { range: { rating: { gte: 4.0 } } }
          ]
        }
      },
      minimumShouldMatch: 1
    });

    console.log('✅ Boolean search results:', {
      total: booleanSearch.total,
      results: booleanSearch.hits.map(hit => ({
        title: hit._source.title,
        category: hit._source.category,
        rating: hit._source.rating
      }))
    });

    console.log('\n6. Search result personalization:');
    
    const personalizedSearch = await client.search.search({
      index: 'articles',
      query: 'tutorial',
      personalization: {
        userId: 'user_123',
        preferences: {
          categories: ['tutorial', 'guide'],
          difficulty: 'intermediate',
          topics: ['search', 'analytics']
        },
        boostFactors: {
          categoryMatch: 2.0,
          difficultyMatch: 1.5,
          topicMatch: 1.8
        }
      },
      limit: 5
    });

    console.log('✅ Personalized search results:', {
      userId: 'user_123',
      results: personalizedSearch.hits?.map(hit => ({
        title: hit._source.title,
        category: hit._source.category,
        personalizedScore: hit._score
      })) || []
    });

  } catch (error) {
    console.error('❌ Advanced search failed:', error.message);
  }
}

async function demonstrateSearchAnalytics(client) {
  console.log('\n📊 Search Analytics\n');
  console.log('==========================================');

  try {
    console.log('1. Track search queries:');
    
    // Simulate user search queries
    const searchQueries = [
      { query: 'machine learning tutorial', userId: 'user_1', results: 15 },
      { query: 'analytics dashboard', userId: 'user_2', results: 8 },
      { query: 'api documentation', userId: 'user_3', results: 23 },
      { query: 'vector search', userId: 'user_1', results: 6 },
      { query: 'elasticsearch guide', userId: 'user_4', results: 12 }
    ];

    for (const searchQuery of searchQueries) {
      await client.analytics.trackEvent('search_performed', {
        query: searchQuery.query,
        userId: searchQuery.userId,
        resultsCount: searchQuery.results,
        timestamp: new Date().toISOString(),
        searchType: 'full_text'
      });
    }

    console.log(`✅ Tracked ${searchQueries.length} search queries`);

    console.log('\n2. Search performance analytics:');
    
    const searchPerformance = await client.analytics.query({
      table: 'search_events',
      select: [
        'query',
        'COUNT(*) as search_count',
        'AVG(results_count) as avg_results',
        'AVG(response_time_ms) as avg_response_time'
      ],
      where: {
        event_type: 'search_performed',
        timestamp: { 
          start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          end: new Date()
        }
      },
      groupBy: ['query'],
      orderBy: [{ column: 'search_count', direction: 'desc' }],
      limit: 10
    });

    console.log('✅ Search performance analytics:', searchPerformance);

    console.log('\n3. Zero-result queries analysis:');
    
    const zeroResultQueries = await client.analytics.query({
      table: 'search_events',
      select: [
        'query',
        'COUNT(*) as frequency',
        'user_id'
      ],
      where: {
        event_type: 'search_performed',
        results_count: 0
      },
      groupBy: ['query', 'user_id'],
      orderBy: [{ column: 'frequency', direction: 'desc' }],
      limit: 5
    });

    console.log('✅ Zero-result queries:', zeroResultQueries);

    console.log('\n4. Search trends analysis:');
    
    const searchTrends = await client.analytics.query({
      table: 'search_events',
      select: [
        'DATE_TRUNC(\'hour\', timestamp) as hour',
        'COUNT(*) as search_count',
        'COUNT(DISTINCT user_id) as unique_users'
      ],
      where: {
        event_type: 'search_performed',
        timestamp: {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000),
          end: new Date()
        }
      },
      groupBy: ['hour'],
      orderBy: [{ column: 'hour', direction: 'asc' }]
    });

    console.log('✅ Search trends by hour:', searchTrends);

    console.log('\n5. Popular search terms:');
    
    const popularTerms = await client.analytics.getPopularSearchTerms({
      timeRange: 'last_7_days',
      limit: 15,
      minFrequency: 2
    });

    console.log('✅ Popular search terms:', popularTerms);

    console.log('\n6. Search conversion analytics:');
    
    // Track search-to-action conversions
    await client.analytics.trackEvent('search_click', {
      query: 'machine learning tutorial',
      documentId: 'doc_1',
      position: 1,
      userId: 'user_1'
    });

    const conversionAnalytics = await client.analytics.getSearchConversions({
      timeRange: 'last_30_days',
      conversionEvents: ['search_click', 'document_view', 'download']
    });

    console.log('✅ Search conversion analytics:', conversionAnalytics);

  } catch (error) {
    console.error('❌ Search analytics failed:', error.message);
  }
}

async function demonstrateBusinessAnalytics(client) {
  console.log('\n📈 Business Analytics\n');
  console.log('==========================================');

  try {
    console.log('1. User engagement analytics:');
    
    // Track various user engagement events
    const engagementEvents = [
      { event: 'page_view', userId: 'user_1', page: '/dashboard', duration: 120 },
      { event: 'feature_used', userId: 'user_1', feature: 'search', count: 5 },
      { event: 'document_downloaded', userId: 'user_2', documentId: 'doc_1' },
      { event: 'session_start', userId: 'user_3', sessionDuration: 1800 },
      { event: 'api_call', userId: 'user_1', endpoint: '/search', responseTime: 45 }
    ];

    for (const event of engagementEvents) {
      await client.analytics.trackEvent(event.event, {
        ...event,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`✅ Tracked ${engagementEvents.length} engagement events`);

    const engagementMetrics = await client.analytics.getUserEngagement({
      timeRange: 'last_30_days',
      metrics: ['active_users', 'session_duration', 'feature_usage', 'retention'],
      groupBy: 'day'
    });

    console.log('✅ User engagement metrics:', engagementMetrics);

    console.log('\n2. Feature usage analytics:');
    
    const featureUsage = await client.analytics.query({
      table: 'events',
      select: [
        'feature',
        'COUNT(*) as usage_count',
        'COUNT(DISTINCT user_id) as unique_users',
        'AVG(duration) as avg_duration'
      ],
      where: {
        event_type: 'feature_used',
        timestamp: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last week
          end: new Date()
        }
      },
      groupBy: ['feature'],
      orderBy: [{ column: 'usage_count', direction: 'desc' }]
    });

    console.log('✅ Feature usage analytics:', featureUsage);

    console.log('\n3. Performance metrics:');
    
    const performanceMetrics = await client.analytics.query({
      table: 'performance_metrics',
      select: [
        'endpoint',
        'AVG(response_time_ms) as avg_response_time',
        'PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_response_time',
        'COUNT(*) as request_count',
        'SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as error_count'
      ],
      where: {
        timestamp: {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000),
          end: new Date()
        }
      },
      groupBy: ['endpoint'],
      having: 'COUNT(*) > 10' // Only endpoints with significant traffic
    });

    console.log('✅ Performance metrics:', performanceMetrics);

    console.log('\n4. Revenue analytics (if applicable):');
    
    const revenueData = [
      { plan: 'basic', amount: 29.99, userId: 'user_1' },
      { plan: 'premium', amount: 99.99, userId: 'user_2' },
      { plan: 'enterprise', amount: 299.99, userId: 'user_3' }
    ];

    for (const revenue of revenueData) {
      await client.analytics.trackEvent('subscription_payment', {
        ...revenue,
        timestamp: new Date().toISOString(),
        currency: 'USD'
      });
    }

    const revenueAnalytics = await client.analytics.query({
      table: 'revenue_events',
      select: [
        'plan',
        'COUNT(*) as subscription_count',
        'SUM(amount) as total_revenue',
        'AVG(amount) as avg_revenue_per_user'
      ],
      where: {
        event_type: 'subscription_payment',
        timestamp: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          end: new Date()
        }
      },
      groupBy: ['plan']
    });

    console.log('✅ Revenue analytics:', revenueAnalytics);

    console.log('\n5. Custom cohort analysis:');
    
    const cohortAnalysis = await client.analytics.getCohortAnalysis({
      cohortType: 'registration_date',
      timeUnit: 'week',
      metric: 'retention_rate',
      timeRange: 'last_12_weeks'
    });

    console.log('✅ Cohort analysis:', cohortAnalysis);

    console.log('\n6. A/B test analytics:');
    
    const abTestData = [
      { variant: 'A', userId: 'user_1', converted: true },
      { variant: 'B', userId: 'user_2', converted: false },
      { variant: 'A', userId: 'user_3', converted: true },
      { variant: 'B', userId: 'user_4', converted: true }
    ];

    for (const testData of abTestData) {
      await client.analytics.trackEvent('ab_test_exposure', {
        ...testData,
        testName: 'search_ui_test',
        timestamp: new Date().toISOString()
      });
    }

    const abTestResults = await client.analytics.getABTestResults('search_ui_test', {
      metrics: ['conversion_rate', 'confidence_interval'],
      timeRange: 'last_30_days'
    });

    console.log('✅ A/B test results:', abTestResults);

  } catch (error) {
    console.error('❌ Business analytics failed:', error.message);
  }
}

async function demonstrateEventTracking(client) {
  console.log('\n📡 Event Tracking\n');
  console.log('==========================================');

  try {
    console.log('1. Custom event tracking:');
    
    // Define custom events for your application
    const customEvents = [
      {
        name: 'document_shared',
        properties: {
          documentId: 'doc_123',
          shareMethod: 'email',
          recipientCount: 3,
          userId: 'user_456'
        }
      },
      {
        name: 'search_filter_applied',
        properties: {
          filterType: 'category',
          filterValue: 'tutorial',
          resultsCount: 12,
          userId: 'user_789'
        }
      },
      {
        name: 'export_initiated',
        properties: {
          exportFormat: 'pdf',
          documentCount: 5,
          fileSize: 2048576, // bytes
          userId: 'user_456'
        }
      }
    ];

    for (const event of customEvents) {
      await client.analytics.trackEvent(event.name, {
        ...event.properties,
        timestamp: new Date().toISOString(),
        sessionId: `session_${Math.random().toString(36).substr(2, 9)}`
      });
    }

    console.log(`✅ Tracked ${customEvents.length} custom events`);

    console.log('\n2. Event funnel analysis:');
    
    const funnelSteps = [
      'page_visit',
      'search_performed',
      'result_clicked',
      'document_viewed',
      'action_completed'
    ];

    const funnelAnalysis = await client.analytics.getFunnelAnalysis({
      steps: funnelSteps,
      timeRange: 'last_7_days',
      groupBy: 'user_id'
    });

    console.log('✅ Funnel analysis:', funnelAnalysis);

    console.log('\n3. Real-time event streaming:');
    
    // Set up real-time event processing
    const eventStream = await client.analytics.createEventStream({
      events: ['search_performed', 'document_viewed', 'user_action'],
      filters: {
        userId: { exists: true },
        timestamp: { within: '5m' }
      },
      aggregations: {
        countByEvent: { type: 'count', groupBy: 'event_type' },
        uniqueUsers: { type: 'cardinality', field: 'user_id' }
      },
      windowSize: '1m' // 1-minute windows
    });

    console.log('✅ Real-time event stream created:', eventStream);

    console.log('\n4. Event attribution:');
    
    const attributionAnalysis = await client.analytics.getAttributionAnalysis({
      conversionEvent: 'subscription_purchased',
      touchpointEvents: ['ad_clicked', 'page_visited', 'feature_demo_viewed'],
      attributionModel: 'last_touch', // or 'first_touch', 'linear', 'time_decay'
      lookbackWindow: '30d'
    });

    console.log('✅ Attribution analysis:', attributionAnalysis);

    console.log('\n5. Event validation and quality:');
    
    const eventQuality = await client.analytics.getEventQuality({
      timeRange: 'last_24_hours',
      metrics: [
        'event_volume',
        'schema_violations',
        'missing_required_fields',
        'duplicate_events',
        'processing_errors'
      ]
    });

    console.log('✅ Event quality metrics:', eventQuality);

    console.log('\n6. Custom dashboards:');
    
    const dashboardConfig = {
      name: 'Search & Analytics Dashboard',
      widgets: [
        {
          type: 'metric',
          title: 'Total Searches Today',
          query: {
            table: 'events',
            select: 'COUNT(*)',
            where: {
              event_type: 'search_performed',
              timestamp: { within: '1d' }
            }
          }
        },
        {
          type: 'line_chart',
          title: 'Search Volume Over Time',
          query: {
            table: 'events',
            select: ['DATE_TRUNC(\'hour\', timestamp) as hour', 'COUNT(*) as searches'],
            where: { event_type: 'search_performed' },
            groupBy: ['hour'],
            orderBy: [{ column: 'hour', direction: 'asc' }]
          }
        },
        {
          type: 'pie_chart',
          title: 'Search Categories',
          query: {
            table: 'events',
            select: ['category', 'COUNT(*) as count'],
            where: { event_type: 'search_performed' },
            groupBy: ['category']
          }
        }
      ],
      refreshInterval: 60 // seconds
    };

    const dashboard = await client.analytics.createDashboard(dashboardConfig);
    console.log('✅ Custom dashboard created:', dashboard);

  } catch (error) {
    console.error('❌ Event tracking failed:', error.message);
  }
}

async function demonstrateRealTimeAnalytics(client) {
  console.log('\n⚡ Real-Time Analytics\n');
  console.log('==========================================');

  try {
    console.log('1. Real-time metrics:');
    
    const realTimeMetrics = await client.analytics.getRealTimeMetrics({
      metrics: [
        'active_users_now',
        'searches_per_minute',
        'avg_response_time',
        'error_rate'
      ],
      refreshInterval: 5 // seconds
    });

    console.log('✅ Real-time metrics:', realTimeMetrics);

    console.log('\n2. Live activity feed:');
    
    const activityFeed = await client.analytics.getLiveActivityFeed({
      events: ['search_performed', 'document_viewed', 'user_registered'],
      limit: 10,
      includeUserDetails: true
    });

    console.log('✅ Live activity feed:', activityFeed);

    console.log('\n3. Alert system setup:');
    
    const alertRules = [
      {
        name: 'High Error Rate Alert',
        condition: {
          metric: 'error_rate',
          operator: 'greater_than',
          threshold: 0.05, // 5%
          timeWindow: '5m'
        },
        actions: [
          {
            type: 'email',
            recipients: ['admin@example.com'],
            template: 'high_error_rate'
          },
          {
            type: 'slack',
            channel: '#alerts',
            message: 'Error rate exceeded 5% in the last 5 minutes'
          }
        ]
      },
      {
        name: 'Search Volume Spike',
        condition: {
          metric: 'search_volume',
          operator: 'greater_than',
          threshold: 1000, // searches per minute
          timeWindow: '1m'
        },
        actions: [
          {
            type: 'webhook',
            url: 'https://api.example.com/scale-up',
            payload: { service: 'search', action: 'scale_up' }
          }
        ]
      }
    ];

    for (const rule of alertRules) {
      await client.analytics.createAlert(rule);
    }

    console.log(`✅ Created ${alertRules.length} alert rules`);

    console.log('\n4. Performance monitoring:');
    
    const performanceMonitoring = await client.analytics.getPerformanceMonitoring({
      services: ['search', 'analytics', 'storage'],
      metrics: ['response_time', 'throughput', 'error_rate', 'cpu_usage'],
      timeRange: 'last_hour',
      granularity: 'minute'
    });

    console.log('✅ Performance monitoring:', performanceMonitoring);

    console.log('\n5. Anomaly detection:');
    
    const anomalies = await client.analytics.detectAnomalies({
      metrics: ['search_volume', 'user_activity', 'error_rate'],
      sensitivity: 'medium', // low, medium, high
      timeRange: 'last_24_hours',
      algorithm: 'isolation_forest' // or 'z_score', 'iqr'
    });

    console.log('✅ Detected anomalies:', anomalies);

    console.log('\n6. Capacity planning:');
    
    const capacityForecasting = await client.analytics.getCapacityForecast({
      metrics: ['search_requests', 'storage_usage', 'bandwidth'],
      forecastPeriod: '7d',
      confidence: 0.95,
      includeSeasonality: true
    });

    console.log('✅ Capacity forecasting:', capacityForecasting);

  } catch (error) {
    console.error('❌ Real-time analytics failed:', error.message);
  }
}

async function demonstrateCustomAnalytics(client) {
  console.log('\n🔧 Custom Analytics Pipelines\n');
  console.log('==========================================');

  try {
    console.log('1. Custom analytics pipeline:');
    
    const analyticsPipeline = {
      name: 'Search Performance Pipeline',
      sources: [
        {
          type: 'elasticsearch',
          index: 'search_logs',
          query: {
            range: {
              timestamp: { gte: 'now-1h' }
            }
          }
        },
        {
          type: 'database',
          table: 'user_sessions',
          query: 'SELECT * FROM user_sessions WHERE created_at >= NOW() - INTERVAL 1 HOUR'
        }
      ],
      transformations: [
        {
          type: 'join',
          leftSource: 'search_logs',
          rightSource: 'user_sessions',
          joinKey: 'session_id'
        },
        {
          type: 'aggregate',
          groupBy: ['user_type', 'search_category'],
          metrics: {
            total_searches: 'COUNT(*)',
            avg_response_time: 'AVG(response_time)',
            unique_users: 'COUNT(DISTINCT user_id)'
          }
        },
        {
          type: 'filter',
          condition: 'total_searches > 5'
        }
      ],
      destinations: [
        {
          type: 'clickhouse',
          table: 'search_analytics',
          mode: 'append'
        },
        {
          type: 'elasticsearch',
          index: 'search_insights',
          mode: 'upsert'
        }
      ],
      schedule: '*/15 * * * *' // Every 15 minutes
    };

    const pipeline = await client.analytics.createPipeline(analyticsPipeline);
    console.log('✅ Analytics pipeline created:', pipeline);

    console.log('\n2. Custom metric definitions:');
    
    const customMetrics = [
      {
        name: 'search_success_rate',
        description: 'Percentage of searches that return results',
        calculation: {
          numerator: 'COUNT(*) WHERE results_count > 0',
          denominator: 'COUNT(*)',
          formula: '(numerator / denominator) * 100'
        },
        aggregation: 'avg',
        unit: 'percentage'
      },
      {
        name: 'user_engagement_score',
        description: 'Composite score based on user activity',
        calculation: {
          formula: '(page_views * 1) + (searches * 2) + (downloads * 3) + (shares * 5)'
        },
        aggregation: 'sum',
        unit: 'score'
      },
      {
        name: 'content_popularity_index',
        description: 'Weighted popularity score for content',
        calculation: {
          formula: '(views * 0.3) + (shares * 0.4) + (downloads * 0.3) + (rating * 10)'
        },
        aggregation: 'avg',
        unit: 'index'
      }
    ];

    for (const metric of customMetrics) {
      await client.analytics.defineCustomMetric(metric);
    }

    console.log(`✅ Defined ${customMetrics.length} custom metrics`);

    console.log('\n3. Data export and integration:');
    
    const exportConfig = {
      name: 'Weekly Analytics Export',
      query: {
        table: 'search_analytics',
        select: '*',
        where: {
          timestamp: { within: '7d' }
        }
      },
      format: 'json', // or 'csv', 'parquet'
      destinations: [
        {
          type: 'fluxez',
          bucket: 'analytics-exports',
          path: 'weekly-reports/{YYYY}/{MM}/{DD}/',
          compression: 'gzip'
        },
        {
          type: 'webhook',
          url: 'https://api.example.com/analytics-webhook',
          authentication: {
            type: 'bearer',
            token: 'your-webhook-token'
          }
        }
      ],
      schedule: '0 9 * * 1' // Every Monday at 9 AM
    };

    const exportJob = await client.analytics.createExportJob(exportConfig);
    console.log('✅ Data export job created:', exportJob);

    console.log('\n4. Advanced visualization:');
    
    const visualizationConfig = {
      type: 'interactive_dashboard',
      title: 'Search & Analytics Insights',
      layout: {
        rows: 3,
        columns: 2
      },
      charts: [
        {
          type: 'time_series',
          title: 'Search Volume Trend',
          position: { row: 1, col: 1 },
          query: {
            table: 'search_events',
            x_axis: 'timestamp',
            y_axis: 'COUNT(*)',
            group_by: 'search_type'
          },
          options: {
            smoothing: true,
            showDataPoints: true
          }
        },
        {
          type: 'heatmap',
          title: 'Search Activity by Hour',
          position: { row: 1, col: 2 },
          query: {
            table: 'search_events',
            x_axis: 'EXTRACT(hour FROM timestamp)',
            y_axis: 'EXTRACT(dow FROM timestamp)',
            value: 'COUNT(*)'
          }
        },
        {
          type: 'funnel',
          title: 'Search to Action Funnel',
          position: { row: 2, col: 1, colspan: 2 },
          steps: [
            { name: 'Search', query: 'SELECT COUNT(*) FROM events WHERE event_type = \'search\'' },
            { name: 'Results Viewed', query: 'SELECT COUNT(*) FROM events WHERE event_type = \'results_view\'' },
            { name: 'Item Clicked', query: 'SELECT COUNT(*) FROM events WHERE event_type = \'item_click\'' },
            { name: 'Action Completed', query: 'SELECT COUNT(*) FROM events WHERE event_type = \'action_complete\'' }
          ]
        },
        {
          type: 'sankey',
          title: 'User Journey Flow',
          position: { row: 3, col: 1, colspan: 2 },
          query: {
            table: 'user_journey_events',
            source: 'from_page',
            target: 'to_page',
            value: 'COUNT(*)'
          }
        }
      ],
      filters: [
        {
          type: 'date_range',
          field: 'timestamp',
          default: 'last_7_days'
        },
        {
          type: 'multi_select',
          field: 'user_type',
          options: ['premium', 'free', 'trial']
        }
      ],
      autoRefresh: 300 // 5 minutes
    };

    const visualization = await client.analytics.createVisualization(visualizationConfig);
    console.log('✅ Interactive visualization created:', visualization);

    console.log('\n5. Machine learning analytics:');
    
    const mlAnalytics = {
      models: [
        {
          name: 'search_intent_classifier',
          type: 'classification',
          features: ['query_text', 'user_history', 'time_of_day'],
          target: 'search_intent',
          algorithm: 'random_forest'
        },
        {
          name: 'user_churn_predictor',
          type: 'binary_classification',
          features: ['activity_score', 'last_login', 'feature_usage'],
          target: 'will_churn',
          algorithm: 'gradient_boosting'
        },
        {
          name: 'content_recommender',
          type: 'recommendation',
          features: ['user_profile', 'content_features', 'interaction_history'],
          algorithm: 'collaborative_filtering'
        }
      ],
      training: {
        dataSource: 'user_analytics',
        splitRatio: 0.8,
        validation: 'cross_validation',
        hyperparameterTuning: true
      },
      deployment: {
        endpoint: '/api/ml/predict',
        scalingPolicy: 'auto',
        monitoring: true
      }
    };

    const mlPipeline = await client.analytics.createMLPipeline(mlAnalytics);
    console.log('✅ ML analytics pipeline created:', mlPipeline);

  } catch (error) {
    console.error('❌ Custom analytics failed:', error.message);
  }
}

// Promise-based search and analytics example
function promiseBasedSearchAnalyticsExample() {
  console.log('\n🔄 Promise-based Search & Analytics\n');

  const client = new FluxezClient(API_KEY, {
    
    debug: false
  });

  return client.search.search({
    index: 'articles',
    query: 'tutorial guide',
    limit: 3
  })
  .then(searchResults => {
    console.log('✅ Promise search results:', searchResults.total, 'found');
    return client.analytics.trackEvent('search_performed', {
      query: 'tutorial guide',
      resultsCount: searchResults.total,
      timestamp: new Date().toISOString()
    });
  })
  .then(trackingResult => {
    console.log('✅ Search event tracked');
    return client.analytics.query({
      table: 'events',
      select: ['COUNT(*) as total_searches'],
      where: { event_type: 'search_performed' }
    });
  })
  .then(analyticsResult => {
    console.log('✅ Total searches:', analyticsResult);
  })
  .catch(error => {
    console.error('❌ Promise chain failed:', error.message);
  });
}

// Run the examples
if (require.main === module) {
  console.log('🌟 Running Fluxez SDK Search & Analytics Examples\n');
  
  searchAnalyticsExamplesMain()
    .then(() => {
      setTimeout(() => {
        console.log('\n' + '='.repeat(50));
        promiseBasedSearchAnalyticsExample();
      }, 2000);
    })
    .catch(console.error);
}

// Export for use in other files
module.exports = {
  searchAnalyticsExamplesMain,
  demonstrateFullTextSearch,
  demonstrateVectorSearch,
  demonstrateAdvancedSearch,
  demonstrateSearchAnalytics,
  demonstrateBusinessAnalytics,
  demonstrateEventTracking,
  demonstrateRealTimeAnalytics,
  demonstrateCustomAnalytics,
  promiseBasedSearchAnalyticsExample,
  generateMockEmbedding
};