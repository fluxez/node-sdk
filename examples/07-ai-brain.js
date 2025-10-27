/**
 * Fluxez SDK - AI/Brain Examples
 * 
 * This example demonstrates AI-powered app generation and brain capabilities using the Fluxez SDK.
 * Perfect for AI-powered development, rapid prototyping, and intelligent automation.
 * 
 * Features demonstrated:
 * - Natural language app generation
 * - Prompt understanding and analysis
 * - Pattern matching and similarity search
 * - Architecture design automation
 * - Component selection and optimization
 * - Code generation orchestration
 * - Learning from user feedback
 * - Brain training and improvement
 * 
 * Time to complete: ~15 minutes
 */

const { FluxezClient } = require('@fluxez/node-sdk');

// Configuration
const API_KEY = process.env.FLUXEZ_API_KEY || 'cgx_your_api_key_here';

async function aiBrainExamplesMain() {
  console.log('🧠 Fluxez SDK AI/Brain Examples\n');

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
    console.log('✅ Connected to Fluxez backend\n');

    // Set context
    client.setOrganization('org_ai_demo');
    client.setProject('proj_ai_demo');

    await demonstratePromptUnderstanding(client);
    await demonstrateAppGeneration(client);
    await demonstratePatternMatching(client);
    await demonstrateArchitectureDesign(client);
    await demonstrateCodeGeneration(client);
    await demonstrateLearningSystem(client);
    await demonstrateBrainTraining(client);
    await demonstrateAdvancedAI(client);

    console.log('\n🎉 AI/Brain Examples Complete!');

  } catch (error) {
    console.error('❌ AI/Brain examples failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Ensure your backend has AI services configured');
    console.log('- Check that OpenAI API key is properly set');
    console.log('- Verify Qdrant vector database is accessible');
    console.log('- Confirm your API key has AI/Brain permissions');
  }
}

async function demonstratePromptUnderstanding(client) {
  console.log('🎯 Prompt Understanding & Analysis\n');
  console.log('==========================================');

  try {
    console.log('1. Basic prompt analysis:');
    
    const simplePrompt = "Create a simple blog application with user authentication";
    const basicAnalysis = await client.brain.understand(simplePrompt);

    console.log('✅ Basic prompt analysis:', {
      appType: basicAnalysis.appType,
      complexity: basicAnalysis.complexity,
      features: basicAnalysis.features,
      technologies: basicAnalysis.technologies
    });

    console.log('\n2. Complex prompt understanding:');
    
    const complexPrompt = `Build a comprehensive e-commerce platform with the following requirements:
    - Multi-vendor marketplace functionality
    - Real-time inventory management
    - Advanced search with filters and facets
    - Payment processing with multiple gateways (Stripe, PayPal)
    - Order tracking and notifications
    - Admin dashboard with analytics
    - Mobile-responsive design
    - Social media integration
    - Review and rating system
    - Wishlist and cart functionality
    - Email marketing integration
    - RESTful API for mobile apps`;

    const complexAnalysis = await client.brain.understand(complexPrompt, {
      includeArchitecture: true,
      includeDatabase: true,
      includeWorkflows: true,
      includeDeployment: true
    });

    console.log('✅ Complex prompt analysis:', {
      appType: complexAnalysis.appType,
      complexity: complexAnalysis.complexity,
      estimatedTime: complexAnalysis.estimatedTime,
      features: complexAnalysis.features.slice(0, 5), // Show first 5
      architecture: complexAnalysis.architecture,
      database: complexAnalysis.database
    });

    console.log('\n3. Industry-specific prompt analysis:');
    
    const industryPrompts = [
      {
        prompt: "Healthcare patient management system with HIPAA compliance",
        industry: "healthcare"
      },
      {
        prompt: "Fintech payment processing app with fraud detection",
        industry: "fintech"
      },
      {
        prompt: "Educational learning management system with video streaming",
        industry: "education"
      },
      {
        prompt: "Real estate property listing platform with virtual tours",
        industry: "real-estate"
      }
    ];

    for (const { prompt, industry } of industryPrompts) {
      const industryAnalysis = await client.brain.understand(prompt, {
        industry: industry,
        includeCompliance: true,
        includeIndustryBestPractices: true
      });

      console.log(`✅ ${industry} analysis:`, {
        appType: industryAnalysis.appType,
        compliance: industryAnalysis.compliance,
        specialRequirements: industryAnalysis.specialRequirements
      });
    }

    console.log('\n4. Prompt refinement and suggestions:');
    
    const vaguePrompt = "Make an app for my business";
    const refinementSuggestions = await client.brain.refinePrompt(vaguePrompt);

    console.log('✅ Prompt refinement suggestions:', refinementSuggestions);

    console.log('\n5. Feature extraction and prioritization:');
    
    const featureAnalysis = await client.brain.extractFeatures(complexPrompt, {
      prioritize: true,
      categorize: true,
      estimateEffort: true
    });

    console.log('✅ Feature analysis:', {
      coreFeatures: featureAnalysis.coreFeatures,
      additionalFeatures: featureAnalysis.additionalFeatures,
      niceToHave: featureAnalysis.niceToHave,
      totalEstimatedHours: featureAnalysis.totalEstimatedHours
    });

  } catch (error) {
    console.error('❌ Prompt understanding failed:', error.message);
  }
}

async function demonstrateAppGeneration(client) {
  console.log('\n🚀 AI-Powered App Generation\n');
  console.log('==========================================');

  try {
    console.log('1. Generate simple React app:');
    
    const simpleAppPrompt = "Create a personal task management app with categories and due dates";
    
    const simpleApp = await client.brain.generate(simpleAppPrompt, {
      framework: 'react',
      includeBackend: true,
      includeDatabase: true,
      includeAuthentication: true,
      outputFormat: 'files'
    });

    console.log('✅ Simple app generated:', {
      framework: simpleApp.framework,
      fileCount: simpleApp.files?.length || 0,
      components: simpleApp.components?.map(c => c.name) || [],
      databaseTables: simpleApp.database?.tables?.length || 0
    });

    console.log('\n2. Generate full-stack application:');
    
    const fullStackPrompt = `Create a social media scheduling tool that allows users to:
    - Connect multiple social media accounts (Twitter, LinkedIn, Instagram)
    - Schedule posts for optimal times
    - View analytics and engagement metrics
    - Collaborate with team members
    - Generate content suggestions using AI`;

    const fullStackApp = await client.brain.generate(fullStackPrompt, {
      framework: 'react',
      backend: 'nestjs',
      database: 'postgresql',
      includeAuthentication: true,
      includePayments: true,
      includeAnalytics: true,
      includeWorkflows: true,
      deploymentTarget: 'cloud'
    });

    console.log('✅ Full-stack app generated:', {
      frontend: fullStackApp.frontend,
      backend: fullStackApp.backend,
      database: fullStackApp.database,
      integrations: fullStackApp.integrations,
      deploymentConfig: fullStackApp.deployment
    });

    console.log('\n3. Generate mobile app:');
    
    const mobileAppPrompt = "Fitness tracking app with workout plans, progress tracking, and social features";
    
    const mobileApp = await client.brain.generate(mobileAppPrompt, {
      framework: 'flutter',
      includeBackend: true,
      includeOfflineSupport: true,
      includeNotifications: true,
      includeSocialFeatures: true
    });

    console.log('✅ Mobile app generated:', {
      platform: mobileApp.platform,
      screens: mobileApp.screens?.length || 0,
      features: mobileApp.features,
      offline: mobileApp.offlineSupport
    });

    console.log('\n4. Generate API-first application:');
    
    const apiPrompt = "REST API for a restaurant ordering system with menu management, orders, and delivery tracking";
    
    const apiApp = await client.brain.generate(apiPrompt, {
      type: 'api',
      framework: 'nestjs',
      includeDocumentation: true,
      includeAuthentication: true,
      includeRateLimiting: true,
      includeMonitoring: true
    });

    console.log('✅ API application generated:', {
      endpoints: apiApp.endpoints?.length || 0,
      authentication: apiApp.authentication,
      documentation: apiApp.documentation,
      monitoring: apiApp.monitoring
    });

    console.log('\n5. Generate with custom requirements:');
    
    const customApp = await client.brain.generate("AI-powered content creation platform", {
      requirements: {
        scalability: 'high',
        security: 'enterprise',
        performance: 'optimized',
        accessibility: 'wcag-aa',
        internationalization: true,
        monitoring: 'comprehensive'
      },
      constraints: {
        budget: 'medium',
        timeline: '3-months',
        teamSize: 5,
        experienceLevel: 'senior'
      }
    });

    console.log('✅ Custom app generated:', {
      architecture: customApp.architecture,
      securityFeatures: customApp.security,
      scalabilityFeatures: customApp.scalability,
      timeline: customApp.timeline
    });

  } catch (error) {
    console.error('❌ App generation failed:', error.message);
  }
}

async function demonstratePatternMatching(client) {
  console.log('\n🔍 Pattern Matching & Similarity\n');
  console.log('==========================================');

  try {
    console.log('1. Find similar apps:');
    
    const targetPrompt = "E-commerce marketplace with multiple vendors";
    const similarApps = await client.brain.findSimilar(targetPrompt, {
      limit: 5,
      threshold: 0.7,
      includeScore: true
    });

    console.log('✅ Similar apps found:');
    similarApps.forEach((app, index) => {
      console.log(`  ${index + 1}. ${app.name} (similarity: ${app.score.toFixed(3)})`);
      console.log(`     Type: ${app.type}, Features: ${app.features?.slice(0, 3).join(', ')}`);
    });

    console.log('\n2. Pattern-based recommendations:');
    
    const recommendations = await client.brain.getRecommendations(targetPrompt, {
      includeArchitecture: true,
      includeFeatures: true,
      includeTechnologies: true,
      includeWorkflows: true
    });

    console.log('✅ Pattern-based recommendations:', {
      architecturePatterns: recommendations.architecture,
      recommendedFeatures: recommendations.features,
      suggestedTechnologies: recommendations.technologies,
      workflowPatterns: recommendations.workflows
    });

    console.log('\n3. Anti-pattern detection:');
    
    const antiPatterns = await client.brain.detectAntiPatterns(targetPrompt, {
      categories: ['security', 'performance', 'scalability', 'maintainability'],
      includeAlternatives: true
    });

    console.log('✅ Anti-patterns detected:', antiPatterns);

    console.log('\n4. Best practice suggestions:');
    
    const bestPractices = await client.brain.getBestPractices(targetPrompt, {
      domains: ['architecture', 'security', 'performance', 'ux', 'development'],
      prioritize: true
    });

    console.log('✅ Best practice suggestions:', bestPractices);

    console.log('\n5. Technology compatibility analysis:');
    
    const techCompatibility = await client.brain.analyzeTechCompatibility({
      frontend: 'react',
      backend: 'nestjs',
      database: 'mongodb',
      cache: 'redis',
      queue: 'rabbitmq',
      storage: 'fluxez'
    });

    console.log('✅ Technology compatibility:', techCompatibility);

    console.log('\n6. Success pattern analysis:');
    
    const successPatterns = await client.brain.analyzeSuccessPatterns(targetPrompt, {
      metrics: ['user_satisfaction', 'performance', 'scalability', 'maintainability'],
      includeFailurePatterns: true
    });

    console.log('✅ Success patterns:', successPatterns);

  } catch (error) {
    console.error('❌ Pattern matching failed:', error.message);
  }
}

async function demonstrateArchitectureDesign(client) {
  console.log('\n🏗️  Architecture Design Automation\n');
  console.log('==========================================');

  try {
    console.log('1. Generate microservices architecture:');
    
    const microservicesPrompt = "Large-scale social media platform with real-time features";
    
    const microservicesArch = await client.brain.designArchitecture(microservicesPrompt, {
      style: 'microservices',
      scale: 'large',
      includeInfrastructure: true,
      includeDeployment: true,
      includeMonitoring: true
    });

    console.log('✅ Microservices architecture:', {
      services: microservicesArch.services?.map(s => s.name) || [],
      communication: microservicesArch.communication,
      infrastructure: microservicesArch.infrastructure,
      scalability: microservicesArch.scalability
    });

    console.log('\n2. Design serverless architecture:');
    
    const serverlessArch = await client.brain.designArchitecture("Event-driven document processing system", {
      style: 'serverless',
      provider: 'fluxez',
      includeEventSourcing: true,
      includeCQRS: true
    });

    console.log('✅ Serverless architecture:', {
      functions: serverlessArch.functions?.map(f => f.name) || [],
      events: serverlessArch.events,
      storage: serverlessArch.storage,
      costs: serverlessArch.estimatedCosts
    });

    console.log('\n3. Monolithic architecture design:');
    
    const monolithicArch = await client.brain.designArchitecture("Small business CRM system", {
      style: 'monolithic',
      modular: true,
      includeUpgradePath: true
    });

    console.log('✅ Monolithic architecture:', {
      modules: monolithicArch.modules?.map(m => m.name) || [],
      database: monolithicArch.database,
      upgradePath: monolithicArch.upgradePath
    });

    console.log('\n4. Hybrid architecture design:');
    
    const hybridArch = await client.brain.designArchitecture("E-commerce platform with AI recommendations", {
      style: 'hybrid',
      coreStyle: 'monolithic',
      serviceStyles: ['microservices', 'serverless'],
      includeDataMesh: true
    });

    console.log('✅ Hybrid architecture:', {
      coreServices: hybridArch.core,
      microservices: hybridArch.microservices,
      serverlessFunctions: hybridArch.serverless,
      dataMesh: hybridArch.dataMesh
    });

    console.log('\n5. Database architecture design:');
    
    const dbArchitecture = await client.brain.designDatabase(microservicesPrompt, {
      includeSharding: true,
      includeReplication: true,
      includeCaching: true,
      includeSearch: true,
      includeAnalytics: true
    });

    console.log('✅ Database architecture:', {
      primaryDb: dbArchitecture.primary,
      sharding: dbArchitecture.sharding,
      replication: dbArchitecture.replication,
      caching: dbArchitecture.caching,
      search: dbArchitecture.search
    });

    console.log('\n6. Security architecture:');
    
    const securityArch = await client.brain.designSecurity(microservicesPrompt, {
      complianceStandards: ['gdpr', 'ccpa', 'sox'],
      threatModel: true,
      zeroTrust: true,
      includeMonitoring: true
    });

    console.log('✅ Security architecture:', {
      authentication: securityArch.authentication,
      authorization: securityArch.authorization,
      encryption: securityArch.encryption,
      monitoring: securityArch.monitoring,
      compliance: securityArch.compliance
    });

  } catch (error) {
    console.error('❌ Architecture design failed:', error.message);
  }
}

async function demonstrateCodeGeneration(client) {
  console.log('\n💻 Code Generation & Orchestration\n');
  console.log('==========================================');

  try {
    console.log('1. Generate React components:');
    
    const componentPrompt = "User profile component with avatar, bio, and social links";
    
    const reactComponent = await client.brain.generateComponent(componentPrompt, {
      framework: 'react',
      typescript: true,
      styling: 'tailwind',
      includeTests: true,
      includeStorybook: true
    });

    console.log('✅ React component generated:', {
      componentName: reactComponent.name,
      props: reactComponent.props,
      hooks: reactComponent.hooks,
      styling: reactComponent.styling,
      testsIncluded: !!reactComponent.tests
    });

    console.log('\n2. Generate API endpoints:');
    
    const apiPrompt = "REST API for blog management with CRUD operations";
    
    const apiEndpoints = await client.brain.generateAPI(apiPrompt, {
      framework: 'nestjs',
      database: 'postgresql',
      includeAuthentication: true,
      includeValidation: true,
      includeDocumentation: true,
      includeTests: true
    });

    console.log('✅ API endpoints generated:', {
      endpoints: apiEndpoints.endpoints?.map(e => `${e.method} ${e.path}`) || [],
      controllers: apiEndpoints.controllers,
      services: apiEndpoints.services,
      entities: apiEndpoints.entities
    });

    console.log('\n3. Generate database schema:');
    
    const schemaPrompt = "Database schema for online course platform";
    
    const dbSchema = await client.brain.generateSchema(schemaPrompt, {
      database: 'postgresql',
      includeIndexes: true,
      includeConstraints: true,
      includeSeedData: true,
      includeMigrations: true
    });

    console.log('✅ Database schema generated:', {
      tables: dbSchema.tables?.map(t => t.name) || [],
      relationships: dbSchema.relationships?.length || 0,
      indexes: dbSchema.indexes?.length || 0,
      migrations: dbSchema.migrations?.length || 0
    });

    console.log('\n4. Generate test suites:');
    
    const testPrompt = "Comprehensive test suite for user authentication system";
    
    const testSuite = await client.brain.generateTests(testPrompt, {
      testTypes: ['unit', 'integration', 'e2e'],
      framework: 'jest',
      includeSnapshots: true,
      includeMocks: true,
      coverageThreshold: 90
    });

    console.log('✅ Test suite generated:', {
      unitTests: testSuite.unit?.length || 0,
      integrationTests: testSuite.integration?.length || 0,
      e2eTests: testSuite.e2e?.length || 0,
      coverage: testSuite.coverage
    });

    console.log('\n5. Generate deployment configuration:');
    
    const deploymentPrompt = "Kubernetes deployment for scalable web application";
    
    const deployment = await client.brain.generateDeployment(deploymentPrompt, {
      platform: 'kubernetes',
      includeIngress: true,
      includeMonitoring: true,
      includeLogging: true,
      includeSecrets: true,
      includeHPA: true
    });

    console.log('✅ Deployment configuration generated:', {
      manifests: deployment.manifests?.map(m => m.kind) || [],
      services: deployment.services,
      ingress: deployment.ingress,
      monitoring: deployment.monitoring
    });

    console.log('\n6. Generate documentation:');
    
    const docsPrompt = "API documentation for e-commerce platform";
    
    const documentation = await client.brain.generateDocumentation(docsPrompt, {
      format: 'markdown',
      includeExamples: true,
      includeSDK: true,
      includeArchitecture: true,
      includeDeployment: true
    });

    console.log('✅ Documentation generated:', {
      sections: documentation.sections?.map(s => s.title) || [],
      examples: documentation.examples?.length || 0,
      diagrams: documentation.diagrams?.length || 0,
      sdkExamples: documentation.sdk?.length || 0
    });

  } catch (error) {
    console.error('❌ Code generation failed:', error.message);
  }
}

async function demonstrateLearningSystem(client) {
  console.log('\n📚 Learning System & Feedback\n');
  console.log('==========================================');

  try {
    console.log('1. Submit user feedback:');
    
    const feedbackData = [
      {
        appId: 'app_123',
        rating: 4.5,
        feedback: 'Great architecture but could use better error handling',
        categories: ['architecture', 'error-handling'],
        improvements: ['Add more try-catch blocks', 'Implement global error handler']
      },
      {
        appId: 'app_456',
        rating: 5.0,
        feedback: 'Perfect component structure and clean code',
        categories: ['components', 'code-quality'],
        improvements: []
      },
      {
        appId: 'app_789',
        rating: 3.0,
        feedback: 'Good functionality but performance could be better',
        categories: ['performance', 'optimization'],
        improvements: ['Add lazy loading', 'Optimize database queries', 'Implement caching']
      }
    ];

    for (const feedback of feedbackData) {
      await client.brain.submitFeedback(feedback);
    }

    console.log(`✅ Submitted ${feedbackData.length} feedback entries`);

    console.log('\n2. Analyze learning patterns:');
    
    const learningPatterns = await client.brain.analyzeLearningPatterns({
      timeRange: 'last_30_days',
      categories: ['all'],
      includeImprovement: true
    });

    console.log('✅ Learning patterns:', {
      totalFeedback: learningPatterns.totalFeedback,
      averageRating: learningPatterns.averageRating,
      topIssues: learningPatterns.topIssues,
      improvements: learningPatterns.improvements
    });

    console.log('\n3. Update brain knowledge:');
    
    const knowledgeUpdate = await client.brain.updateKnowledge({
      category: 'architecture',
      patterns: [
        {
          name: 'Microservices with Event Sourcing',
          description: 'Use event sourcing for data consistency in microservices',
          applicability: ['e-commerce', 'social-media', 'financial'],
          benefits: ['audit-trail', 'scalability', 'consistency'],
          drawbacks: ['complexity', 'learning-curve']
        }
      ],
      antiPatterns: [
        {
          name: 'Synchronous Microservice Communication',
          description: 'Direct synchronous calls between services',
          problems: ['tight-coupling', 'cascading-failures'],
          alternatives: ['async-messaging', 'event-driven']
        }
      ]
    });

    console.log('✅ Knowledge updated:', knowledgeUpdate);

    console.log('\n4. Retrain with new data:');
    
    const retrainingResult = await client.brain.retrain({
      includeNewFeedback: true,
      includeNewPatterns: true,
      validateImprovement: true,
      backupPrevious: true
    });

    console.log('✅ Brain retrained:', {
      newAccuracy: retrainingResult.accuracy,
      improvement: retrainingResult.improvement,
      validationScore: retrainingResult.validation
    });

    console.log('\n5. Knowledge graph exploration:');
    
    const knowledgeGraph = await client.brain.exploreKnowledge({
      topic: 'react-components',
      depth: 2,
      includeRelated: true,
      includeExamples: true
    });

    console.log('✅ Knowledge graph:', {
      nodes: knowledgeGraph.nodes?.length || 0,
      relationships: knowledgeGraph.relationships?.length || 0,
      examples: knowledgeGraph.examples?.length || 0
    });

    console.log('\n6. Continuous learning metrics:');
    
    const learningMetrics = await client.brain.getLearningMetrics({
      timeRange: 'last_90_days',
      includeProgress: true,
      includeAccuracy: true,
      includeUsage: true
    });

    console.log('✅ Learning metrics:', {
      accuracyTrend: learningMetrics.accuracy,
      usageGrowth: learningMetrics.usage,
      knowledgeExpansion: learningMetrics.knowledge,
      userSatisfaction: learningMetrics.satisfaction
    });

  } catch (error) {
    console.error('❌ Learning system failed:', error.message);
  }
}

async function demonstrateBrainTraining(client) {
  console.log('\n🎯 Brain Training & Optimization\n');
  console.log('==========================================');

  try {
    console.log('1. Generate training data:');
    
    const trainingData = await client.brain.generateTrainingData({
      appTypes: ['e-commerce', 'social-media', 'cms', 'crm', 'marketplace'],
      variationsPerType: 20,
      complexityLevels: ['simple', 'medium', 'complex'],
      includeVariations: true
    });

    console.log('✅ Training data generated:', {
      totalSamples: trainingData.samples?.length || 0,
      appTypes: trainingData.appTypes,
      complexityDistribution: trainingData.distribution
    });

    console.log('\n2. Train specialized models:');
    
    const specializedTraining = await client.brain.trainSpecializedModel({
      specialization: 'e-commerce',
      trainingData: 'e-commerce-specific',
      validationSplit: 0.2,
      epochs: 10,
      includeTransferLearning: true
    });

    console.log('✅ Specialized model trained:', {
      specialization: specializedTraining.specialization,
      accuracy: specializedTraining.accuracy,
      loss: specializedTraining.loss,
      improved: specializedTraining.improved
    });

    console.log('\n3. A/B test brain improvements:');
    
    const abTest = await client.brain.createABTest({
      name: 'Improved Architecture Detection',
      variants: [
        { name: 'current', description: 'Current brain model' },
        { name: 'improved', description: 'Enhanced pattern matching' }
      ],
      metrics: ['accuracy', 'user_satisfaction', 'generation_time'],
      trafficSplit: { current: 50, improved: 50 },
      duration: '14d'
    });

    console.log('✅ A/B test created:', abTest);

    console.log('\n4. Evaluate model performance:');
    
    const evaluation = await client.brain.evaluatePerformance({
      testSet: 'holdout',
      metrics: ['accuracy', 'precision', 'recall', 'f1_score'],
      includeConfusionMatrix: true,
      includeBenchmarks: true
    });

    console.log('✅ Model evaluation:', {
      accuracy: evaluation.accuracy,
      precision: evaluation.precision,
      recall: evaluation.recall,
      f1Score: evaluation.f1Score,
      benchmarkComparison: evaluation.benchmarks
    });

    console.log('\n5. Hyperparameter optimization:');
    
    const hyperparameterOpt = await client.brain.optimizeHyperparameters({
      parameters: {
        learning_rate: { min: 0.0001, max: 0.01, type: 'log' },
        batch_size: { values: [16, 32, 64, 128] },
        hidden_size: { min: 128, max: 1024, step: 128 },
        dropout: { min: 0.1, max: 0.5, step: 0.1 }
      },
      optimization: 'bayesian',
      maxTrials: 50,
      metric: 'validation_accuracy'
    });

    console.log('✅ Hyperparameter optimization:', {
      bestParams: hyperparameterOpt.bestParams,
      bestScore: hyperparameterOpt.bestScore,
      trialsCompleted: hyperparameterOpt.trials
    });

    console.log('\n6. Model interpretability:');
    
    const interpretability = await client.brain.explainDecisions({
      samplePrompts: [
        'E-commerce marketplace with payments',
        'Social media platform with real-time chat',
        'Blog CMS with user management'
      ],
      explanationTypes: ['feature_importance', 'attention_weights', 'decision_path']
    });

    console.log('✅ Model interpretability:', {
      explanations: interpretability.explanations?.length || 0,
      topFeatures: interpretability.topFeatures,
      confidence: interpretability.confidence
    });

  } catch (error) {
    console.error('❌ Brain training failed:', error.message);
  }
}

async function demonstrateAdvancedAI(client) {
  console.log('\n🔬 Advanced AI Features\n');
  console.log('==========================================');

  try {
    console.log('1. Multi-modal app generation:');
    
    const multiModalPrompt = {
      text: "Create a recipe sharing app",
      images: ["mockup-sketch.jpg", "ui-wireframe.png"],
      voice: "audio-description.mp3",
      context: {
        targetAudience: "home cooks",
        platform: "mobile-first",
        monetization: "freemium"
      }
    };

    const multiModalApp = await client.brain.generateMultiModal(multiModalPrompt, {
      analyzeImages: true,
      processVoice: true,
      combineInputs: true
    });

    console.log('✅ Multi-modal app generated:', {
      textAnalysis: multiModalApp.text,
      imageAnalysis: multiModalApp.images,
      voiceAnalysis: multiModalApp.voice,
      combinedInsights: multiModalApp.combined
    });

    console.log('\n2. Conversational app building:');
    
    const conversation = await client.brain.startConversation({
      initialPrompt: "I want to build an app for my restaurant",
      mode: 'guided',
      includeQuestions: true
    });

    console.log('✅ Conversation started:', {
      sessionId: conversation.sessionId,
      questions: conversation.questions,
      suggestions: conversation.suggestions
    });

    // Simulate conversation turns
    const responses = [
      "It's a fine dining restaurant with outdoor seating",
      "We need reservations, menu display, and ordering",
      "Yes, we want to integrate with our POS system"
    ];

    for (const response of responses) {
      const turn = await client.brain.continueConversation(conversation.sessionId, response);
      console.log(`✅ Conversation turn:`, {
        understanding: turn.understanding,
        nextQuestions: turn.nextQuestions?.slice(0, 2) || []
      });
    }

    console.log('\n3. Code review and suggestions:');
    
    const codeReview = await client.brain.reviewCode({
      code: `
function processOrder(order) {
  // TODO: Add validation
  const total = order.items.reduce((sum, item) => sum + item.price, 0);
  return { orderId: Math.random(), total: total };
}
      `,
      language: 'javascript',
      includeSecurityCheck: true,
      includePerformanceCheck: true,
      includeBestPractices: true
    });

    console.log('✅ Code review:', {
      issues: codeReview.issues,
      suggestions: codeReview.suggestions,
      securityScore: codeReview.security,
      performanceScore: codeReview.performance
    });

    console.log('\n4. Automated refactoring:');
    
    const refactoring = await client.brain.suggestRefactoring({
      codebase: 'sample-project',
      refactoringTypes: ['extract-method', 'rename-variable', 'remove-duplication'],
      applyChanges: false, // Just suggestions
      includeTests: true
    });

    console.log('✅ Refactoring suggestions:', {
      suggestions: refactoring.suggestions?.length || 0,
      impact: refactoring.impact,
      confidence: refactoring.confidence
    });

    console.log('\n5. Performance optimization:');
    
    const optimization = await client.brain.optimizePerformance({
      appType: 'e-commerce',
      currentMetrics: {
        loadTime: 3.2,
        bundleSize: 2.5, // MB
        coreWebVitals: { lcp: 2.8, fid: 150, cls: 0.15 }
      },
      targetMetrics: {
        loadTime: 1.5,
        bundleSize: 1.0,
        coreWebVitals: { lcp: 1.5, fid: 50, cls: 0.05 }
      }
    });

    console.log('✅ Performance optimization:', {
      optimizations: optimization.recommendations,
      expectedImprovement: optimization.improvement,
      implementationEffort: optimization.effort
    });

    console.log('\n6. AI-powered debugging:');
    
    const debugging = await client.brain.debugIssue({
      errorMessage: "Cannot read property 'id' of undefined",
      stackTrace: `at UserService.getUser (user.service.ts:45:12)
        at UserController.getProfile (user.controller.ts:23:8)`,
      context: {
        framework: 'nestjs',
        database: 'postgresql',
        recentChanges: ['Updated user schema', 'Added new validation']
      }
    });

    console.log('✅ AI debugging:', {
      diagnosis: debugging.diagnosis,
      solutions: debugging.solutions,
      prevention: debugging.prevention,
      confidence: debugging.confidence
    });

    console.log('\n7. Predictive analytics:');
    
    const predictions = await client.brain.predict({
      scenario: 'app_success',
      features: {
        appType: 'social-media',
        complexity: 'medium',
        team_size: 3,
        timeline: '6-months',
        budget: 'medium',
        market_competition: 'high'
      },
      predictions: ['success_probability', 'timeline_accuracy', 'budget_accuracy']
    });

    console.log('✅ Predictions:', {
      successProbability: predictions.success_probability,
      timelineAccuracy: predictions.timeline_accuracy,
      budgetAccuracy: predictions.budget_accuracy,
      recommendations: predictions.recommendations
    });

  } catch (error) {
    console.error('❌ Advanced AI features failed:', error.message);
  }
}

// Promise-based AI example
function promiseBasedAIExample() {
  console.log('\n🔄 Promise-based AI Operations\n');

  const client = new FluxezClient(API_KEY, {
    
    debug: false
  });

  return client.brain.understand('Simple todo app with drag and drop')
    .then(understanding => {
      console.log('✅ Promise understanding:', understanding.appType);
      return client.brain.findSimilar('Simple todo app with drag and drop');
    })
    .then(similar => {
      console.log('✅ Similar apps found:', similar.length);
      return client.brain.generate('Simple todo app with drag and drop', {
        framework: 'react',
        includeBackend: false
      });
    })
    .then(generated => {
      console.log('✅ App generated:', generated.components?.length || 0, 'components');
    })
    .catch(error => {
      console.error('❌ Promise chain failed:', error.message);
    });
}

// Run the examples
if (require.main === module) {
  console.log('🌟 Running Fluxez SDK AI/Brain Examples\n');
  
  aiBrainExamplesMain()
    .then(() => {
      setTimeout(() => {
        console.log('\n' + '='.repeat(50));
        promiseBasedAIExample();
      }, 2000);
    })
    .catch(console.error);
}

// Export for use in other files
module.exports = {
  aiBrainExamplesMain,
  demonstratePromptUnderstanding,
  demonstrateAppGeneration,
  demonstratePatternMatching,
  demonstrateArchitectureDesign,
  demonstrateCodeGeneration,
  demonstrateLearningSystem,
  demonstrateBrainTraining,
  demonstrateAdvancedAI,
  promiseBasedAIExample
};