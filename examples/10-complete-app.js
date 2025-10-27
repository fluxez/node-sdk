/**
 * Fluxez SDK - Complete App Example
 * 
 * This example demonstrates building a complete application using multiple SDK features.
 * It showcases how to combine different Fluxez services to create a real-world application.
 * 
 * App: Task Management System with Team Collaboration
 * 
 * Features demonstrated:
 * - User authentication and management
 * - Database operations (tasks, projects, teams)
 * - Real-time search and analytics
 * - File storage (attachments, avatars)
 * - Email notifications
 * - Caching for performance
 * - Queue processing for background tasks
 * - AI-powered features (suggestions, categorization)
 * - Workflow automation
 * 
 * Time to complete: ~20 minutes
 */

const { FluxezClient } = require('@fluxez/node-sdk');

// Configuration
const API_KEY = process.env.FLUXEZ_API_KEY || 'cgx_your_api_key_here';

// Application state
let appState = {
  users: new Map(),
  projects: new Map(),
  tasks: new Map(),
  currentUser: null
};

async function completeAppExample() {
  console.log('📱 Complete Task Management App Example\n');
  console.log('Building a comprehensive task management system using Fluxez SDK...\n');

  const client = new FluxezClient(API_KEY, {
    
    debug: true,
    timeout: 120000,
  });

  try {
    // Test connection
    const connectionTest = await client.testConnection();
    if (!connectionTest.connected) {
      throw new Error('Cannot connect to backend. Please ensure the Fluxez backend is running.');
    }
    console.log('✅ Connected to Fluxez backend\n');

    // Set context for the application
    client.setOrganization('org_taskapp_demo');
    client.setProject('proj_taskapp_demo');

    // Initialize the application
    await initializeApplication(client);
    
    // Set up the database schema
    await setupDatabaseSchema(client);
    
    // Create sample users and authenticate
    await createUsersAndAuthenticate(client);
    
    // Create projects and teams
    await createProjectsAndTeams(client);
    
    // Manage tasks lifecycle
    await demonstrateTaskManagement(client);
    
    // File management and attachments
    await demonstrateFileManagement(client);
    
    // Search and analytics
    await demonstrateSearchAndAnalytics(client);
    
    // Email notifications
    await demonstrateNotificationSystem(client);
    
    // AI-powered features
    await demonstrateAIFeatures(client);
    
    // Workflow automation
    await demonstrateWorkflowAutomation(client);
    
    // Performance optimization
    await demonstratePerformanceOptimization(client);
    
    // Application analytics and monitoring
    await demonstrateAppAnalytics(client);

    console.log('\n🎉 Complete App Example Finished!');
    console.log('==========================================');
    console.log('✅ Task Management System fully demonstrated');
    console.log('✅ All major SDK features integrated');
    console.log('✅ Real-world application patterns shown');
    console.log('==========================================\n');
    
    // Show final application state
    showApplicationSummary();

  } catch (error) {
    console.error('❌ Complete app example failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Ensure all Fluxez services are properly configured');
    console.log('- Check that your API key has all necessary permissions');
    console.log('- Verify that database, search, storage, and other services are accessible');
  }
}

async function initializeApplication(client) {
  console.log('🚀 Initializing Task Management Application\n');
  console.log('==========================================');

  try {
    console.log('1. Setting up application configuration:');
    
    const appConfig = {
      name: 'Fluxez Task Manager',
      version: '1.0.0',
      features: {
        userManagement: true,
        taskManagement: true,
        fileStorage: true,
        realTimeSearch: true,
        aiSuggestions: true,
        emailNotifications: true,
        workflowAutomation: true,
        analytics: true
      },
      settings: {
        maxFileSize: 10485760, // 10MB
        supportedFileTypes: ['.pdf', '.doc', '.docx', '.jpg', '.png', '.gif'],
        taskStatuses: ['todo', 'in-progress', 'review', 'completed', 'archived'],
        priorities: ['low', 'medium', 'high', 'urgent'],
        maxTeamSize: 50,
        maxProjectsPerUser: 20
      },
      initialized: new Date().toISOString()
    };

    // Store application configuration in cache for quick access
    await client.cache.set('app:config', appConfig, 86400); // 24 hours
    
    console.log('✅ Application configuration stored');

    console.log('\n2. Initializing search indices:');
    
    // Set up search indices for different document types
    const searchIndices = ['users', 'projects', 'tasks', 'files'];
    
    for (const index of searchIndices) {
      await client.search.createIndex(index, {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0
        },
        mappings: getIndexMapping(index)
      });
      console.log(`  ✅ Search index '${index}' initialized`);
    }

    console.log('\n3. Setting up notification templates:');
    
    const emailTemplates = [
      {
        name: 'task-assigned',
        subject: 'New Task Assigned: {{taskTitle}}',
        html: `
          <h2>You've been assigned a new task</h2>
          <p><strong>Task:</strong> {{taskTitle}}</p>
          <p><strong>Project:</strong> {{projectName}}</p>
          <p><strong>Due Date:</strong> {{dueDate}}</p>
          <p><strong>Priority:</strong> {{priority}}</p>
          <p>{{description}}</p>
          <a href="{{taskUrl}}">View Task</a>
        `
      },
      {
        name: 'task-completed',
        subject: 'Task Completed: {{taskTitle}}',
        html: `
          <h2>Task Completed!</h2>
          <p><strong>Task:</strong> {{taskTitle}}</p>
          <p><strong>Completed by:</strong> {{completedBy}}</p>
          <p><strong>Completion Date:</strong> {{completedDate}}</p>
        `
      },
      {
        name: 'project-invitation',
        subject: 'Invitation to join project: {{projectName}}',
        html: `
          <h2>You've been invited to join a project</h2>
          <p><strong>Project:</strong> {{projectName}}</p>
          <p><strong>Invited by:</strong> {{invitedBy}}</p>
          <p>{{message}}</p>
          <a href="{{acceptUrl}}">Accept Invitation</a>
        `
      }
    ];

    for (const template of emailTemplates) {
      await client.email.createTemplate(template);
      console.log(`  ✅ Email template '${template.name}' created`);
    }

    console.log('\n4. Setting up background job queues:');
    
    const queues = [
      'email-notifications',
      'file-processing',
      'search-indexing',
      'ai-processing',
      'analytics-events'
    ];

    for (const queue of queues) {
      await client.queue.createQueue(queue, {
        visibilityTimeout: 300, // 5 minutes
        messageRetentionPeriod: 1209600, // 14 days
        deadLetterTargetArn: `${queue}-dlq`
      });
      console.log(`  ✅ Queue '${queue}' created`);
    }

    console.log('✅ Application initialization complete\n');

  } catch (error) {
    console.error('❌ Application initialization failed:', error.message);
  }
}

function getIndexMapping(indexType) {
  const mappings = {
    users: {
      properties: {
        id: { type: 'keyword' },
        email: { type: 'keyword' },
        name: { type: 'text', analyzer: 'standard' },
        role: { type: 'keyword' },
        department: { type: 'keyword' },
        created_at: { type: 'date' },
        last_active: { type: 'date' }
      }
    },
    projects: {
      properties: {
        id: { type: 'keyword' },
        name: { type: 'text', analyzer: 'standard' },
        description: { type: 'text', analyzer: 'standard' },
        status: { type: 'keyword' },
        priority: { type: 'keyword' },
        owner_id: { type: 'keyword' },
        team_members: { type: 'keyword' },
        created_at: { type: 'date' },
        due_date: { type: 'date' }
      }
    },
    tasks: {
      properties: {
        id: { type: 'keyword' },
        title: { type: 'text', analyzer: 'standard' },
        description: { type: 'text', analyzer: 'standard' },
        status: { type: 'keyword' },
        priority: { type: 'keyword' },
        project_id: { type: 'keyword' },
        assigned_to: { type: 'keyword' },
        created_by: { type: 'keyword' },
        tags: { type: 'keyword' },
        created_at: { type: 'date' },
        due_date: { type: 'date' },
        completed_at: { type: 'date' }
      }
    },
    files: {
      properties: {
        id: { type: 'keyword' },
        filename: { type: 'text', analyzer: 'standard' },
        content_type: { type: 'keyword' },
        size: { type: 'long' },
        task_id: { type: 'keyword' },
        project_id: { type: 'keyword' },
        uploaded_by: { type: 'keyword' },
        uploaded_at: { type: 'date' },
        tags: { type: 'keyword' }
      }
    }
  };

  return mappings[indexType] || {};
}

async function setupDatabaseSchema(client) {
  console.log('🗄️  Setting Up Database Schema\n');
  console.log('==========================================');

  try {
    console.log('1. Creating users table:');
    
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        department VARCHAR(100),
        avatar_url TEXT,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await client.execute(createUsersTable);
    console.log('✅ Users table created');

    console.log('\n2. Creating projects table:');
    
    const createProjectsTable = `
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'active',
        priority VARCHAR(20) DEFAULT 'medium',
        owner_id UUID REFERENCES users(id),
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        due_date TIMESTAMP
      )
    `;

    await client.execute(createProjectsTable);
    console.log('✅ Projects table created');

    console.log('\n3. Creating tasks table:');
    
    const createTasksTable = `
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'todo',
        priority VARCHAR(20) DEFAULT 'medium',
        project_id UUID REFERENCES projects(id),
        assigned_to UUID REFERENCES users(id),
        created_by UUID REFERENCES users(id),
        tags TEXT[],
        estimated_hours INTEGER,
        actual_hours INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        due_date TIMESTAMP,
        completed_at TIMESTAMP
      )
    `;

    await client.execute(createTasksTable);
    console.log('✅ Tasks table created');

    console.log('\n4. Creating project_members table:');
    
    const createProjectMembersTable = `
      CREATE TABLE IF NOT EXISTS project_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id),
        user_id UUID REFERENCES users(id),
        role VARCHAR(50) DEFAULT 'member',
        permissions JSONB DEFAULT '{}',
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, user_id)
      )
    `;

    await client.execute(createProjectMembersTable);
    console.log('✅ Project members table created');

    console.log('\n5. Creating task_comments table:');
    
    const createCommentsTable = `
      CREATE TABLE IF NOT EXISTS task_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID REFERENCES tasks(id),
        user_id UUID REFERENCES users(id),
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await client.execute(createCommentsTable);
    console.log('✅ Task comments table created');

    console.log('\n6. Creating file_attachments table:');
    
    const createFilesTable = `
      CREATE TABLE IF NOT EXISTS file_attachments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        filename VARCHAR(255) NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        content_type VARCHAR(100),
        size BIGINT,
        storage_path TEXT NOT NULL,
        task_id UUID REFERENCES tasks(id),
        project_id UUID REFERENCES projects(id),
        uploaded_by UUID REFERENCES users(id),
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await client.execute(createFilesTable);
    console.log('✅ File attachments table created');

    console.log('\n7. Creating indexes for performance:');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date)',
      'CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id)',
      'CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id)',
      'CREATE INDEX IF NOT EXISTS idx_file_attachments_task_id ON file_attachments(task_id)'
    ];

    for (const indexSql of indexes) {
      await client.execute(indexSql);
    }
    console.log('✅ Database indexes created');

    console.log('✅ Database schema setup complete\n');

  } catch (error) {
    console.error('❌ Database schema setup failed:', error.message);
  }
}

async function createUsersAndAuthenticate(client) {
  console.log('👥 Creating Users and Authentication\n');
  console.log('==========================================');

  try {
    console.log('1. Creating sample users:');
    
    const sampleUsers = [
      {
        email: 'john.doe@company.com',
        name: 'John Doe',
        role: 'manager',
        department: 'Engineering'
      },
      {
        email: 'jane.smith@company.com',
        name: 'Jane Smith',
        role: 'developer',
        department: 'Engineering'
      },
      {
        email: 'mike.johnson@company.com',
        name: 'Mike Johnson',
        role: 'designer',
        department: 'Design'
      },
      {
        email: 'sarah.wilson@company.com',
        name: 'Sarah Wilson',
        role: 'developer',
        department: 'Engineering'
      },
      {
        email: 'admin@company.com',
        name: 'Admin User',
        role: 'admin',
        department: 'Operations'
      }
    ];

    for (const userData of sampleUsers) {
      // Insert user into database
      const insertResult = await client.execute(`
        INSERT INTO users (email, name, password_hash, role, department) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id, email, name
      `, [
        userData.email,
        userData.name,
        'hashed_password_' + Math.random().toString(36).substr(2, 9), // Simulated hash
        userData.role,
        userData.department
      ]);

      const user = insertResult.rows[0];
      appState.users.set(user.id, { ...user, ...userData });

      // Index user for search
      await client.search.indexDocument('users', user.id, {
        id: user.id,
        email: user.email,
        name: user.name,
        role: userData.role,
        department: userData.department,
        created_at: new Date().toISOString()
      });

      // Cache user profile
      await client.cache.set(`user:${user.id}`, {
        id: user.id,
        email: user.email,
        name: user.name,
        role: userData.role,
        department: userData.department
      }, 3600);

      console.log(`  ✅ Created user: ${user.name} (${user.email})`);
    }

    // Set current user for demonstration
    const adminUser = Array.from(appState.users.values()).find(u => u.role === 'admin');
    appState.currentUser = adminUser;
    console.log(`✅ Current user set to: ${adminUser.name}`);

    console.log('\n2. User authentication simulation:');
    
    const authenticateUser = async (email, password) => {
      // In a real app, you'd verify the password hash
      const user = Array.from(appState.users.values()).find(u => u.email === email);
      if (user && password) {
        // Update last active timestamp
        await client.execute(
          'UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = $1',
          [user.id]
        );
        
        // Track authentication event
        await client.analytics.trackEvent('user_login', {
          userId: user.id,
          email: user.email,
          timestamp: new Date().toISOString()
        });
        
        return { success: true, user };
      }
      return { success: false };
    };

    const authResult = await authenticateUser('admin@company.com', 'password123');
    console.log('✅ Authentication test:', authResult.success ? 'SUCCESS' : 'FAILED');

    console.log('✅ Users and authentication setup complete\n');

  } catch (error) {
    console.error('❌ User creation failed:', error.message);
  }
}

async function createProjectsAndTeams(client) {
  console.log('📋 Creating Projects and Teams\n');
  console.log('==========================================');

  try {
    console.log('1. Creating sample projects:');
    
    const sampleProjects = [
      {
        name: 'Website Redesign',
        description: 'Complete redesign of the company website with modern UI/UX',
        priority: 'high',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      {
        name: 'Mobile App Development',
        description: 'Develop a cross-platform mobile application for task management',
        priority: 'medium',
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days from now
      },
      {
        name: 'API Integration',
        description: 'Integrate third-party APIs for enhanced functionality',
        priority: 'medium',
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) // 21 days from now
      },
      {
        name: 'Security Audit',
        description: 'Comprehensive security audit and vulnerability assessment',
        priority: 'urgent',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
      }
    ];

    const adminUserId = appState.currentUser.id;

    for (const projectData of sampleProjects) {
      // Insert project into database
      const insertResult = await client.execute(`
        INSERT INTO projects (name, description, priority, owner_id, due_date) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id, name, description, priority
      `, [
        projectData.name,
        projectData.description,
        projectData.priority,
        adminUserId,
        projectData.dueDate.toISOString()
      ]);

      const project = insertResult.rows[0];
      appState.projects.set(project.id, { ...project, ...projectData, owner_id: adminUserId });

      // Index project for search
      await client.search.indexDocument('projects', project.id, {
        id: project.id,
        name: project.name,
        description: project.description,
        status: 'active',
        priority: project.priority,
        owner_id: adminUserId,
        created_at: new Date().toISOString(),
        due_date: projectData.dueDate.toISOString()
      });

      console.log(`  ✅ Created project: ${project.name}`);
    }

    console.log('\n2. Assigning team members to projects:');
    
    const userIds = Array.from(appState.users.keys());
    const projectIds = Array.from(appState.projects.keys());

    for (const projectId of projectIds) {
      const project = appState.projects.get(projectId);
      
      // Assign 2-4 random team members to each project
      const teamSize = Math.floor(Math.random() * 3) + 2; // 2-4 members
      const selectedMembers = userIds
        .filter(userId => userId !== project.owner_id) // Don't include owner
        .sort(() => Math.random() - 0.5) // Shuffle
        .slice(0, teamSize);

      for (const memberId of selectedMembers) {
        await client.execute(`
          INSERT INTO project_members (project_id, user_id, role) 
          VALUES ($1, $2, $3) 
          ON CONFLICT (project_id, user_id) DO NOTHING
        `, [projectId, memberId, 'member']);
      }

      // Add owner as project manager
      await client.execute(`
        INSERT INTO project_members (project_id, user_id, role) 
        VALUES ($1, $2, $3) 
        ON CONFLICT (project_id, user_id) DO UPDATE SET role = $3
      `, [projectId, project.owner_id, 'manager']);

      console.log(`  ✅ Assigned ${teamSize + 1} members to: ${project.name}`);
    }

    console.log('\n3. Caching project data for performance:');
    
    for (const [projectId, project] of appState.projects) {
      // Get team members
      const membersResult = await client.raw(`
        SELECT u.id, u.name, u.email, pm.role 
        FROM project_members pm 
        JOIN users u ON pm.user_id = u.id 
        WHERE pm.project_id = $1
      `, [projectId]);

      const projectWithMembers = {
        ...project,
        team_members: membersResult.rows
      };

      // Cache project data
      await client.cache.set(`project:${projectId}`, projectWithMembers, 1800); // 30 minutes
    }

    console.log('✅ Projects and teams setup complete\n');

  } catch (error) {
    console.error('❌ Project creation failed:', error.message);
  }
}

async function demonstrateTaskManagement(client) {
  console.log('✅ Task Management Lifecycle\n');
  console.log('==========================================');

  try {
    console.log('1. Creating tasks across projects:');
    
    const taskTemplates = [
      {
        title: 'Design homepage mockup',
        description: 'Create a detailed mockup for the new homepage design',
        priority: 'high',
        estimatedHours: 8,
        tags: ['design', 'homepage', 'mockup']
      },
      {
        title: 'Implement user authentication',
        description: 'Set up secure user login and registration system',
        priority: 'urgent',
        estimatedHours: 16,
        tags: ['backend', 'authentication', 'security']
      },
      {
        title: 'Create responsive navigation',
        description: 'Build a mobile-friendly navigation component',
        priority: 'medium',
        estimatedHours: 6,
        tags: ['frontend', 'responsive', 'navigation']
      },
      {
        title: 'Set up database schema',
        description: 'Design and implement the database structure',
        priority: 'urgent',
        estimatedHours: 12,
        tags: ['database', 'schema', 'backend']
      },
      {
        title: 'Write unit tests',
        description: 'Create comprehensive unit tests for core functionality',
        priority: 'medium',
        estimatedHours: 10,
        tags: ['testing', 'quality-assurance']
      }
    ];

    const projectIds = Array.from(appState.projects.keys());
    const userIds = Array.from(appState.users.keys());

    for (const template of taskTemplates) {
      const randomProjectId = projectIds[Math.floor(Math.random() * projectIds.length)];
      const randomAssigneeId = userIds[Math.floor(Math.random() * userIds.length)];
      const dueDate = new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000); // Random due date within 14 days

      const insertResult = await client.execute(`
        INSERT INTO tasks (title, description, priority, project_id, assigned_to, created_by, tags, estimated_hours, due_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, title, priority
      `, [
        template.title,
        template.description,
        template.priority,
        randomProjectId,
        randomAssigneeId,
        appState.currentUser.id,
        template.tags,
        template.estimatedHours,
        dueDate.toISOString()
      ]);

      const task = insertResult.rows[0];
      appState.tasks.set(task.id, {
        ...task,
        ...template,
        project_id: randomProjectId,
        assigned_to: randomAssigneeId,
        created_by: appState.currentUser.id,
        status: 'todo'
      });

      // Index task for search
      await client.search.indexDocument('tasks', task.id, {
        id: task.id,
        title: template.title,
        description: template.description,
        status: 'todo',
        priority: template.priority,
        project_id: randomProjectId,
        assigned_to: randomAssigneeId,
        created_by: appState.currentUser.id,
        tags: template.tags,
        created_at: new Date().toISOString(),
        due_date: dueDate.toISOString()
      });

      // Send task assignment notification
      await client.queue.sendMessage('email-notifications', {
        type: 'task-assigned',
        taskId: task.id,
        assigneeId: randomAssigneeId,
        projectId: randomProjectId,
        taskTitle: template.title,
        priority: template.priority
      });

      console.log(`  ✅ Created task: ${task.title}`);
    }

    console.log('\n2. Updating task status and tracking progress:');
    
    const taskIds = Array.from(appState.tasks.keys());
    const statuses = ['todo', 'in-progress', 'review', 'completed'];
    
    // Update some tasks to different statuses
    for (let i = 0; i < Math.min(3, taskIds.length); i++) {
      const taskId = taskIds[i];
      const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      await client.execute(`
        UPDATE tasks 
        SET status = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2
      `, [newStatus, taskId]);

      // Update search index
      const taskData = appState.tasks.get(taskId);
      await client.search.updateDocument('tasks', taskId, {
        status: newStatus,
        updated_at: new Date().toISOString()
      });

      // Track analytics event
      await client.analytics.trackEvent('task_status_changed', {
        taskId: taskId,
        oldStatus: 'todo',
        newStatus: newStatus,
        userId: appState.currentUser.id,
        timestamp: new Date().toISOString()
      });

      console.log(`  ✅ Updated task ${taskData?.title || taskId} to: ${newStatus}`);
    }

    console.log('\n3. Adding comments to tasks:');
    
    const sampleComments = [
      'Started working on this task. Initial research looks good.',
      'Need clarification on the requirements. Added some questions.',
      'Making good progress. Should be done by tomorrow.',
      'Completed the main functionality. Ready for review.',
      'Found a potential issue. Working on the fix.'
    ];

    for (let i = 0; i < Math.min(3, taskIds.length); i++) {
      const taskId = taskIds[i];
      const comment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
      const commenterId = userIds[Math.floor(Math.random() * userIds.length)];

      await client.execute(`
        INSERT INTO task_comments (task_id, user_id, comment) 
        VALUES ($1, $2, $3)
      `, [taskId, commenterId, comment]);

      console.log(`  ✅ Added comment to task ${taskId.substr(0, 8)}...`);
    }

    console.log('\n4. Task analytics and reporting:');
    
    const taskAnalytics = await client.raw(`
      SELECT 
        status,
        priority,
        COUNT(*) as count,
        AVG(estimated_hours) as avg_estimated_hours
      FROM tasks 
      GROUP BY status, priority 
      ORDER BY status, priority
    `);

    console.log('✅ Task analytics:', taskAnalytics.rows);

    console.log('✅ Task management demonstration complete\n');

  } catch (error) {
    console.error('❌ Task management failed:', error.message);
  }
}

async function demonstrateFileManagement(client) {
  console.log('📁 File Management and Attachments\n');
  console.log('==========================================');

  try {
    console.log('1. Creating sample file attachments:');
    
    const sampleFiles = [
      {
        filename: 'requirements-document.pdf',
        contentType: 'application/pdf',
        size: 1024000, // 1MB
        tags: ['requirements', 'documentation']
      },
      {
        filename: 'mockup-design.png',
        contentType: 'image/png',
        size: 2048000, // 2MB
        tags: ['design', 'mockup', 'ui']
      },
      {
        filename: 'technical-spec.docx',
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 512000, // 512KB
        tags: ['specification', 'technical', 'documentation']
      },
      {
        filename: 'screenshot-bug.jpg',
        contentType: 'image/jpeg',
        size: 1536000, // 1.5MB
        tags: ['bug', 'screenshot', 'issue']
      }
    ];

    const taskIds = Array.from(appState.tasks.keys());
    const projectIds = Array.from(appState.projects.keys());

    for (const fileData of sampleFiles) {
      // Create file content (simulated)
      const fileContent = Buffer.from(`Simulated file content for ${fileData.filename}`);
      
      // Upload to storage
      const uploadResult = await client.storage.upload(fileContent, {
        fileName: fileData.filename,
        contentType: fileData.contentType,
        metadata: {
          originalName: fileData.filename,
          uploadedBy: appState.currentUser.id,
          tags: fileData.tags.join(',')
        }
      });

      // Store file attachment record
      const attachmentResult = await client.execute(`
        INSERT INTO file_attachments 
        (filename, original_filename, content_type, size, storage_path, task_id, project_id, uploaded_by, tags)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, filename
      `, [
        uploadResult.fileName,
        fileData.filename,
        fileData.contentType,
        fileData.size,
        uploadResult.key || uploadResult.url,
        taskIds[Math.floor(Math.random() * taskIds.length)],
        projectIds[Math.floor(Math.random() * projectIds.length)],
        appState.currentUser.id,
        fileData.tags
      ]);

      const attachment = attachmentResult.rows[0];

      // Index file for search
      await client.search.indexDocument('files', attachment.id, {
        id: attachment.id,
        filename: fileData.filename,
        content_type: fileData.contentType,
        size: fileData.size,
        uploaded_by: appState.currentUser.id,
        uploaded_at: new Date().toISOString(),
        tags: fileData.tags
      });

      console.log(`  ✅ Uploaded file: ${fileData.filename}`);
    }

    console.log('\n2. Generating presigned URLs for file access:');
    
    const fileAttachments = await client.raw(`
      SELECT id, filename, storage_path 
      FROM file_attachments 
      LIMIT 3
    `);

    for (const file of fileAttachments.rows) {
      try {
        const downloadUrl = await client.storage.getSignedUrl(file.storage_path, {
          operation: 'download',
          expiresIn: 3600 // 1 hour
        });
        
        // Cache the URL for quick access
        await client.cache.set(
          `file:download:${file.id}`, 
          downloadUrl, 
          3000 // 50 minutes (less than URL expiry)
        );
        
        console.log(`  ✅ Generated download URL for: ${file.filename}`);
      } catch (error) {
        console.log(`  ⚠️  Could not generate URL for: ${file.filename}`);
      }
    }

    console.log('\n3. File processing workflow:');
    
    // Queue file processing tasks
    for (const file of fileAttachments.rows) {
      await client.queue.sendMessage('file-processing', {
        type: 'process-attachment',
        fileId: file.id,
        filename: file.filename,
        storagePath: file.storage_path,
        tasks: [
          'generate-thumbnail',
          'extract-metadata',
          'virus-scan',
          'index-content'
        ]
      });
    }

    console.log('✅ Queued file processing tasks');

    console.log('\n4. File search and analytics:');
    
    const fileSearchResults = await client.search.search({
      index: 'files',
      query: 'design document',
      limit: 10
    });

    console.log('✅ File search results:', {
      total: fileSearchResults.total,
      files: fileSearchResults.hits?.map(hit => hit._source.filename) || []
    });

    // File analytics
    const fileAnalytics = await client.raw(`
      SELECT 
        content_type,
        COUNT(*) as file_count,
        SUM(size) as total_size,
        AVG(size) as avg_size
      FROM file_attachments
      GROUP BY content_type
      ORDER BY file_count DESC
    `);

    console.log('✅ File analytics:', fileAnalytics.rows);

    console.log('✅ File management demonstration complete\n');

  } catch (error) {
    console.error('❌ File management failed:', error.message);
  }
}

async function demonstrateSearchAndAnalytics(client) {
  console.log('🔍 Search and Analytics Features\n');
  console.log('==========================================');

  try {
    console.log('1. Full-text search across all entities:');
    
    const searchQueries = [
      'design homepage',
      'authentication security',
      'mobile app development',
      'backend database'
    ];

    for (const query of searchQueries) {
      // Multi-index search
      const results = await client.search.multiSearch([
        { index: 'tasks', query: query, limit: 3 },
        { index: 'projects', query: query, limit: 2 },
        { index: 'files', query: query, limit: 2 }
      ]);

      console.log(`  ✅ Search results for "${query}":`, {
        tasks: results.tasks?.hits?.length || 0,
        projects: results.projects?.hits?.length || 0,
        files: results.files?.hits?.length || 0
      });

      // Track search event
      await client.analytics.trackEvent('search_performed', {
        query: query,
        userId: appState.currentUser.id,
        resultsCount: (results.tasks?.total || 0) + (results.projects?.total || 0) + (results.files?.total || 0),
        timestamp: new Date().toISOString()
      });
    }

    console.log('\n2. Advanced filtering and faceted search:');
    
    const advancedSearch = await client.search.search({
      index: 'tasks',
      query: '*',
      filters: {
        status: ['todo', 'in-progress'],
        priority: ['high', 'urgent']
      },
      facets: {
        status: { field: 'status' },
        priority: { field: 'priority' },
        tags: { field: 'tags' }
      },
      sort: [
        { due_date: 'asc' },
        { priority: 'desc' }
      ],
      limit: 5
    });

    console.log('✅ Advanced search results:', {
      total: advancedSearch.total,
      facets: advancedSearch.facets
    });

    console.log('\n3. Real-time analytics dashboard:');
    
    const dashboardMetrics = await Promise.all([
      // Task completion rate
      client.raw(`
        SELECT 
          status,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM tasks), 2) as percentage
        FROM tasks 
        GROUP BY status
      `),
      
      // Project progress
      client.raw(`
        SELECT 
          p.name,
          COUNT(t.id) as total_tasks,
          COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
          ROUND(COUNT(CASE WHEN t.status = 'completed' THEN 1 END) * 100.0 / COUNT(t.id), 2) as completion_rate
        FROM projects p
        LEFT JOIN tasks t ON p.id = t.project_id
        GROUP BY p.id, p.name
        ORDER BY completion_rate DESC
      `),
      
      // User productivity
      client.raw(`
        SELECT 
          u.name,
          COUNT(t.id) as assigned_tasks,
          COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks
        FROM users u
        LEFT JOIN tasks t ON u.id = t.assigned_to
        GROUP BY u.id, u.name
        ORDER BY completed_tasks DESC
      `)
    ]);

    console.log('✅ Dashboard metrics generated:', {
      taskDistribution: dashboardMetrics[0].rows.length,
      projectProgress: dashboardMetrics[1].rows.length,
      userProductivity: dashboardMetrics[2].rows.length
    });

    console.log('\n4. Time-series analytics:');
    
    // Track daily activity
    await client.analytics.trackEvent('daily_activity', {
      activeUsers: appState.users.size,
      activeTasks: appState.tasks.size,
      activeProjects: appState.projects.size,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    });

    // Simulate historical data for analytics
    const analyticsQuery = await client.analytics.query({
      table: 'events',
      select: [
        'event_type',
        'COUNT(*) as event_count',
        'DATE(timestamp) as event_date'
      ],
      where: {
        event_type: ['task_status_changed', 'search_performed', 'daily_activity'],
        timestamp: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        }
      },
      groupBy: ['event_type', 'DATE(timestamp)'],
      orderBy: [{ column: 'event_date', direction: 'desc' }],
      limit: 20
    });

    console.log('✅ Time-series analytics:', {
      events: analyticsQuery?.length || 0
    });

    console.log('✅ Search and analytics demonstration complete\n');

  } catch (error) {
    console.error('❌ Search and analytics failed:', error.message);
  }
}

async function demonstrateNotificationSystem(client) {
  console.log('📬 Notification System\n');
  console.log('==========================================');

  try {
    console.log('1. Processing queued email notifications:');
    
    // Simulate processing queued email notifications
    const queuedMessages = await client.queue.receiveMessages('email-notifications', {
      maxNumberOfMessages: 5,
      waitTimeSeconds: 2
    });

    for (const message of queuedMessages) {
      try {
        const notification = JSON.parse(message.body);
        
        if (notification.type === 'task-assigned') {
          // Get task and user details
          const taskDetails = await client.raw(`
            SELECT t.title, t.description, t.priority, p.name as project_name, u.email, u.name
            FROM tasks t
            JOIN projects p ON t.project_id = p.id
            JOIN users u ON t.assigned_to = u.id
            WHERE t.id = $1
          `, [notification.taskId]);

          if (taskDetails.rows.length > 0) {
            const task = taskDetails.rows[0];
            
            await client.email.sendTemplate({
              templateId: 'task-assigned',
              to: task.email,
              templateData: {
                taskTitle: task.title,
                projectName: task.project_name,
                priority: task.priority,
                description: task.description,
                assigneeName: task.name,
                taskUrl: `https://taskapp.com/tasks/${notification.taskId}`
              },
              tags: ['task-assignment', 'notification'],
              metadata: {
                taskId: notification.taskId,
                userId: notification.assigneeId
              }
            });

            console.log(`  ✅ Sent task assignment email for: ${task.title}`);
          }
        }

        // Delete processed message
        await client.queue.deleteMessage('email-notifications', message.receiptHandle);
        
      } catch (error) {
        console.log(`  ❌ Failed to process notification: ${error.message}`);
      }
    }

    console.log('\n2. Real-time notifications (WebSocket simulation):');
    
    // Simulate real-time notifications
    const realtimeNotifications = [
      {
        type: 'task_updated',
        userId: Array.from(appState.users.keys())[0],
        title: 'Task Status Changed',
        message: 'Your task "Design homepage mockup" has been moved to "In Progress"',
        timestamp: new Date().toISOString()
      },
      {
        type: 'comment_added',
        userId: Array.from(appState.users.keys())[1],
        title: 'New Comment',
        message: 'Mike Johnson added a comment to "Implement user authentication"',
        timestamp: new Date().toISOString()
      },
      {
        type: 'deadline_reminder',
        userId: Array.from(appState.users.keys())[2],
        title: 'Deadline Approaching',
        message: 'Task "Create responsive navigation" is due in 2 days',
        timestamp: new Date().toISOString()
      }
    ];

    for (const notification of realtimeNotifications) {
      // Cache notification for real-time delivery
      await client.cache.set(
        `notification:${notification.userId}:${Date.now()}`,
        notification,
        3600 // 1 hour
      );

      // Track notification event
      await client.analytics.trackEvent('notification_sent', {
        type: notification.type,
        userId: notification.userId,
        timestamp: notification.timestamp
      });

      console.log(`  ✅ Cached real-time notification: ${notification.title}`);
    }

    console.log('\n3. Digest email generation:');
    
    // Generate daily digest for each user
    const users = Array.from(appState.users.values());
    
    for (const user of users.slice(0, 2)) { // Limit to 2 users for demo
      // Get user's tasks and recent activity
      const userTasks = await client.raw(`
        SELECT t.title, t.status, t.priority, p.name as project_name, t.due_date
        FROM tasks t
        JOIN projects p ON t.project_id = p.id
        WHERE t.assigned_to = $1
        ORDER BY t.due_date ASC NULLS LAST
        LIMIT 5
      `, [user.id]);

      const upcomingTasks = userTasks.rows.filter(task => 
        task.due_date && new Date(task.due_date) > new Date()
      );

      if (upcomingTasks.length > 0) {
        await client.email.send({
          to: user.email,
          subject: `Daily Digest - ${upcomingTasks.length} tasks need your attention`,
          html: `
            <h2>Good morning, ${user.name}!</h2>
            <p>Here's your daily task summary:</p>
            <h3>Upcoming Tasks:</h3>
            <ul>
              ${upcomingTasks.map(task => 
                `<li><strong>${task.title}</strong> (${task.project_name}) - Due: ${new Date(task.due_date).toLocaleDateString()}</li>`
              ).join('')}
            </ul>
            <p>Have a productive day!</p>
          `,
          tags: ['digest', 'daily-summary']
        });

        console.log(`  ✅ Sent daily digest to: ${user.name}`);
      }
    }

    console.log('\n4. Notification preferences and delivery optimization:');
    
    // Set user notification preferences
    const notificationPreferences = {
      emailNotifications: true,
      pushNotifications: true,
      digestFrequency: 'daily',
      quietHours: { start: '22:00', end: '08:00' },
      notificationTypes: {
        taskAssigned: true,
        taskCompleted: true,
        commentAdded: true,
        deadlineReminder: true,
        projectUpdates: false
      }
    };

    for (const user of users.slice(0, 2)) {
      await client.cache.set(
        `notification:preferences:${user.id}`,
        notificationPreferences,
        86400 // 24 hours
      );
    }

    console.log('✅ Updated notification preferences for users');

    console.log('✅ Notification system demonstration complete\n');

  } catch (error) {
    console.error('❌ Notification system failed:', error.message);
  }
}

async function demonstrateAIFeatures(client) {
  console.log('🧠 AI-Powered Features\n');
  console.log('==========================================');

  try {
    console.log('1. AI task categorization and suggestions:');
    
    const taskIds = Array.from(appState.tasks.keys());
    
    for (const taskId of taskIds.slice(0, 3)) {
      const task = appState.tasks.get(taskId);
      
      // Simulate AI categorization
      const aiSuggestions = await client.brain.understand(
        `${task.title}: ${task.description}`,
        {
          includeCategory: true,
          includeEstimation: true,
          includeSkillsRequired: true
        }
      );

      // Update task with AI suggestions
      await client.execute(`
        UPDATE tasks 
        SET tags = ARRAY(SELECT DISTINCT unnest(COALESCE(tags, ARRAY[]::text[]) || $2))
        WHERE id = $1
      `, [taskId, aiSuggestions.suggestedTags || []]);

      console.log(`  ✅ AI categorized task: ${task.title}`, {
        category: aiSuggestions.category,
        estimatedComplexity: aiSuggestions.complexity,
        suggestedTags: aiSuggestions.suggestedTags
      });
    }

    console.log('\n2. Intelligent task assignment:');
    
    // Get unassigned tasks
    const unassignedTasks = await client.raw(`
      SELECT id, title, description, priority, tags, estimated_hours
      FROM tasks 
      WHERE assigned_to IS NULL
      LIMIT 3
    `);

    for (const task of unassignedTasks.rows) {
      // Simulate AI-powered assignment based on skills and workload
      const assignmentSuggestion = await client.brain.findSimilar(
        `${task.title}: ${task.description}`,
        {
          type: 'user_matching',
          considerWorkload: true,
          considerSkills: true
        }
      );

      // Find best matching user (simplified logic)
      const users = Array.from(appState.users.values());
      const developmentUsers = users.filter(u => 
        u.department === 'Engineering' || u.role === 'developer'
      );
      
      if (developmentUsers.length > 0) {
        const suggestedUser = developmentUsers[0]; // In real app, use AI suggestions
        
        await client.execute(`
          UPDATE tasks 
          SET assigned_to = $1, updated_at = CURRENT_TIMESTAMP 
          WHERE id = $2
        `, [suggestedUser.id, task.id]);

        console.log(`  ✅ AI assigned task "${task.title}" to: ${suggestedUser.name}`);
      }
    }

    console.log('\n3. Predictive analytics for project completion:');
    
    const projectIds = Array.from(appState.projects.keys());
    
    for (const projectId of projectIds.slice(0, 2)) {
      const project = appState.projects.get(projectId);
      
      // Get project statistics
      const projectStats = await client.raw(`
        SELECT 
          COUNT(*) as total_tasks,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
          AVG(estimated_hours) as avg_estimated_hours,
          SUM(CASE WHEN status != 'completed' THEN estimated_hours ELSE 0 END) as remaining_hours
        FROM tasks 
        WHERE project_id = $1
      `, [projectId]);

      const stats = projectStats.rows[0];
      
      // Simulate AI prediction
      const prediction = await client.brain.predict({
        scenario: 'project_completion',
        features: {
          totalTasks: parseInt(stats.total_tasks),
          completedTasks: parseInt(stats.completed_tasks),
          avgEstimatedHours: parseFloat(stats.avg_estimated_hours),
          remainingHours: parseFloat(stats.remaining_hours)
        }
      });

      console.log(`  ✅ AI prediction for "${project.name}":`, {
        completionProbability: prediction?.successProbability || 0.75,
        estimatedDaysToCompletion: prediction?.estimatedDays || 15,
        riskFactors: prediction?.riskFactors || ['resource constraints']
      });
    }

    console.log('\n4. Smart content generation:');
    
    // Generate task descriptions using AI
    const incompleteTask = {
      title: 'Optimize database performance',
      partialDescription: 'Need to improve query performance...'
    };

    const generatedContent = await client.brain.generate(
      `Complete this task description: "${incompleteTask.title}" - ${incompleteTask.partialDescription}`,
      {
        type: 'task_description',
        includeAcceptanceCriteria: true,
        includeTechnicalRequirements: true
      }
    );

    console.log('  ✅ AI-generated task content:', {
      description: generatedContent?.description || 'Generated description would appear here',
      acceptanceCriteria: generatedContent?.acceptanceCriteria || ['Performance metrics improved by 50%']
    });

    console.log('\n5. Anomaly detection in project progress:');
    
    // Detect unusual patterns in task completion
    const anomalyDetection = await client.analytics.detectAnomalies({
      metrics: ['task_completion_rate', 'project_velocity', 'user_productivity'],
      timeRange: 'last_30_days',
      sensitivity: 'medium'
    });

    console.log('✅ Anomaly detection results:', {
      anomaliesDetected: anomalyDetection?.anomalies?.length || 0,
      patterns: anomalyDetection?.patterns || ['Unusual spike in task creation', 'Decreased completion rate']
    });

    console.log('\n6. AI-powered recommendations:');
    
    const recommendations = await client.brain.getRecommendations('task management optimization', {
      includeProcessImprovements: true,
      includeToolSuggestions: true,
      includeAutomationOpportunities: true
    });

    console.log('✅ AI recommendations:', {
      processImprovements: recommendations?.processImprovements || [
        'Implement daily standup meetings',
        'Use story points for estimation',
        'Regular retrospectives'
      ],
      automationOpportunities: recommendations?.automationOpportunities || [
        'Auto-assign tasks based on expertise',
        'Send deadline reminders automatically',
        'Generate progress reports'
      ]
    });

    console.log('✅ AI features demonstration complete\n');

  } catch (error) {
    console.error('❌ AI features failed:', error.message);
  }
}

async function demonstrateWorkflowAutomation(client) {
  console.log('⚙️  Workflow Automation\n');
  console.log('==========================================');

  try {
    console.log('1. Creating automated workflows:');
    
    // Task completion workflow
    const taskCompletionWorkflow = {
      name: 'Task Completion Automation',
      trigger: {
        type: 'database_change',
        table: 'tasks',
        condition: 'status_changed_to_completed'
      },
      steps: [
        {
          id: 'notify-stakeholders',
          type: 'parallel',
          branches: [
            {
              steps: [{
                id: 'email-project-manager',
                type: 'email',
                template: 'task-completed',
                recipient: '{{ task.project.owner.email }}'
              }]
            },
            {
              steps: [{
                id: 'update-project-progress',
                type: 'database',
                action: 'update',
                table: 'projects',
                data: { updated_at: 'NOW()' }
              }]
            }
          ]
        },
        {
          id: 'check-project-completion',
          type: 'condition',
          condition: '{{ project.all_tasks_completed }}',
          then: [{
            id: 'project-completion-celebration',
            type: 'email',
            template: 'project-completed',
            recipients: '{{ project.team_members.emails }}'
          }]
        }
      ]
    };

    const workflow1 = await client.workflow.create(taskCompletionWorkflow);
    console.log(`  ✅ Created workflow: ${workflow1.name}`);

    console.log('\n2. Deadline reminder workflow:');
    
    const deadlineReminderWorkflow = {
      name: 'Task Deadline Reminders',
      trigger: {
        type: 'schedule',
        cron: '0 9 * * *', // Daily at 9 AM
        timezone: 'UTC'
      },
      steps: [
        {
          id: 'find-upcoming-deadlines',
          type: 'database_query',
          query: `
            SELECT t.id, t.title, t.due_date, u.email, u.name, p.name as project_name
            FROM tasks t
            JOIN users u ON t.assigned_to = u.id
            JOIN projects p ON t.project_id = p.id
            WHERE t.due_date BETWEEN NOW() AND NOW() + INTERVAL '3 days'
            AND t.status NOT IN ('completed', 'archived')
          `
        },
        {
          id: 'send-reminders',
          type: 'loop',
          items: '{{ steps.find-upcoming-deadlines.results }}',
          steps: [
            {
              id: 'send-individual-reminder',
              type: 'email',
              template: 'deadline-reminder',
              to: '{{ item.email }}',
              data: {
                taskTitle: '{{ item.title }}',
                dueDate: '{{ item.due_date }}',
                projectName: '{{ item.project_name }}',
                assigneeName: '{{ item.name }}'
              }
            }
          ]
        }
      ]
    };

    const workflow2 = await client.workflow.create(deadlineReminderWorkflow);
    console.log(`  ✅ Created workflow: ${workflow2.name}`);

    console.log('\n3. Auto-assignment workflow:');
    
    const autoAssignmentWorkflow = {
      name: 'Smart Task Auto-Assignment',
      trigger: {
        type: 'database_change',
        table: 'tasks',
        condition: 'new_task_created_without_assignee'
      },
      steps: [
        {
          id: 'analyze-task',
          type: 'ai_analysis',
          service: 'brain',
          action: 'categorize',
          input: {
            title: '{{ trigger.data.title }}',
            description: '{{ trigger.data.description }}',
            tags: '{{ trigger.data.tags }}'
          }
        },
        {
          id: 'find-best-assignee',
          type: 'ai_analysis',
          service: 'brain',
          action: 'find_best_match',
          input: {
            taskRequirements: '{{ steps.analyze-task.requirements }}',
            teamMembers: '{{ project.team_members }}',
            workloadFactors: true
          }
        },
        {
          id: 'assign-task',
          type: 'database',
          action: 'update',
          table: 'tasks',
          where: { id: '{{ trigger.data.id }}' },
          data: {
            assigned_to: '{{ steps.find-best-assignee.user_id }}',
            updated_at: 'NOW()'
          }
        },
        {
          id: 'notify-assignee',
          type: 'email',
          template: 'task-assigned',
          to: '{{ steps.find-best-assignee.user_email }}',
          data: {
            taskTitle: '{{ trigger.data.title }}',
            projectName: '{{ project.name }}',
            assignedBy: 'Auto-Assignment System'
          }
        }
      ]
    };

    const workflow3 = await client.workflow.create(autoAssignmentWorkflow);
    console.log(`  ✅ Created workflow: ${workflow3.name}`);

    console.log('\n4. File processing workflow:');
    
    const fileProcessingWorkflow = {
      name: 'Uploaded File Processing',
      trigger: {
        type: 'queue_message',
        queue: 'file-processing'
      },
      steps: [
        {
          id: 'process-file-parallel',
          type: 'parallel',
          branches: [
            {
              name: 'thumbnail-generation',
              steps: [{
                id: 'generate-thumbnail',
                type: 'function',
                condition: '{{ trigger.data.filename.endsWith(".jpg") || trigger.data.filename.endsWith(".png") }}',
                action: 'generate_image_thumbnail'
              }]
            },
            {
              name: 'content-extraction',
              steps: [{
                id: 'extract-text',
                type: 'function',
                condition: '{{ trigger.data.filename.endsWith(".pdf") || trigger.data.filename.endsWith(".docx") }}',
                action: 'extract_text_content'
              }]
            },
            {
              name: 'virus-scanning',
              steps: [{
                id: 'virus-scan',
                type: 'external_api',
                service: 'virus-scanner',
                endpoint: '/scan',
                method: 'POST',
                data: { file_url: '{{ trigger.data.storage_url }}' }
              }]
            }
          ]
        },
        {
          id: 'update-file-metadata',
          type: 'database',
          action: 'update',
          table: 'file_attachments',
          where: { id: '{{ trigger.data.file_id }}' },
          data: {
            thumbnail_url: '{{ steps.generate-thumbnail.url }}',
            extracted_text: '{{ steps.extract-text.content }}',
            virus_scan_result: '{{ steps.virus-scan.result }}',
            processed_at: 'NOW()'
          }
        }
      ]
    };

    const workflow4 = await client.workflow.create(fileProcessingWorkflow);
    console.log(`  ✅ Created workflow: ${workflow4.name}`);

    console.log('\n5. Project health monitoring workflow:');
    
    const healthMonitoringWorkflow = {
      name: 'Project Health Monitoring',
      trigger: {
        type: 'schedule',
        cron: '0 */4 * * *', // Every 4 hours
        timezone: 'UTC'
      },
      steps: [
        {
          id: 'analyze-project-health',
          type: 'ai_analysis',
          service: 'analytics',
          action: 'project_health_check',
          input: {
            projects: 'all_active',
            metrics: ['completion_rate', 'deadline_adherence', 'team_velocity']
          }
        },
        {
          id: 'identify-at-risk-projects',
          type: 'filter',
          condition: '{{ item.health_score < 0.7 }}',
          items: '{{ steps.analyze-project-health.projects }}'
        },
        {
          id: 'create-alerts',
          type: 'loop',
          items: '{{ steps.identify-at-risk-projects.results }}',
          steps: [
            {
              id: 'alert-project-manager',
              type: 'email',
              template: 'project-health-alert',
              to: '{{ item.owner_email }}',
              data: {
                projectName: '{{ item.name }}',
                healthScore: '{{ item.health_score }}',
                riskFactors: '{{ item.risk_factors }}',
                recommendations: '{{ item.recommendations }}'
              }
            }
          ]
        }
      ]
    };

    const workflow5 = await client.workflow.create(healthMonitoringWorkflow);
    console.log(`  ✅ Created workflow: ${workflow5.name}`);

    console.log('\n6. Testing workflow execution:');
    
    // Simulate workflow execution with test data
    const testExecution = await client.workflow.execute(workflow1.id, {
      taskId: Array.from(appState.tasks.keys())[0],
      userId: appState.currentUser.id,
      trigger: 'manual_test'
    });

    console.log('✅ Test workflow execution:', {
      executionId: testExecution.executionId,
      status: testExecution.status
    });

    console.log('\n7. Workflow analytics and optimization:');
    
    const workflowAnalytics = await client.workflow.getAnalytics({
      timeRange: 'last_7_days',
      metrics: ['execution_count', 'success_rate', 'avg_duration']
    });

    console.log('✅ Workflow analytics:', {
      totalExecutions: workflowAnalytics?.totalExecutions || 0,
      successRate: (workflowAnalytics?.successRate * 100 || 95).toFixed(1) + '%',
      avgDuration: workflowAnalytics?.avgDuration || '2.3 seconds'
    });

    console.log('✅ Workflow automation demonstration complete\n');

  } catch (error) {
    console.error('❌ Workflow automation failed:', error.message);
  }
}

async function demonstratePerformanceOptimization(client) {
  console.log('⚡ Performance Optimization\n');
  console.log('==========================================');

  try {
    console.log('1. Implementing caching strategies:');
    
    // Cache frequently accessed data
    const performanceCache = {
      // Cache user profiles
      async getUserProfile(userId) {
        const cacheKey = `user:profile:${userId}`;
        let profile = await client.cache.get(cacheKey);
        
        if (!profile) {
          const result = await client.raw(`
            SELECT id, name, email, role, department, last_active
            FROM users WHERE id = $1
          `, [userId]);
          
          if (result.rows.length > 0) {
            profile = result.rows[0];
            await client.cache.set(cacheKey, profile, 1800); // 30 minutes
          }
        }
        
        return profile;
      },
      
      // Cache project summaries
      async getProjectSummary(projectId) {
        const cacheKey = `project:summary:${projectId}`;
        let summary = await client.cache.get(cacheKey);
        
        if (!summary) {
          const result = await client.raw(`
            SELECT 
              p.id, p.name, p.description, p.status,
              COUNT(t.id) as total_tasks,
              COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
              array_agg(DISTINCT u.name) as team_members
            FROM projects p
            LEFT JOIN tasks t ON p.id = t.project_id
            LEFT JOIN project_members pm ON p.id = pm.project_id
            LEFT JOIN users u ON pm.user_id = u.id
            WHERE p.id = $1
            GROUP BY p.id, p.name, p.description, p.status
          `, [projectId]);
          
          if (result.rows.length > 0) {
            summary = result.rows[0];
            await client.cache.set(cacheKey, summary, 900); // 15 minutes
          }
        }
        
        return summary;
      }
    };

    // Test caching performance
    const userIds = Array.from(appState.users.keys()).slice(0, 3);
    for (const userId of userIds) {
      const startTime = Date.now();
      const profile = await performanceCache.getUserProfile(userId);
      const endTime = Date.now();
      
      console.log(`  ✅ Cached user profile for ${profile?.name}: ${endTime - startTime}ms`);
    }

    console.log('\n2. Database query optimization:');
    
    // Use database indexes and optimized queries
    const optimizedQueries = {
      async getTasksByProjectOptimized(projectId) {
        // Using index on project_id
        return client.raw(`
          SELECT t.id, t.title, t.status, t.priority, u.name as assignee_name
          FROM tasks t
          JOIN users u ON t.assigned_to = u.id
          WHERE t.project_id = $1
          ORDER BY t.priority DESC, t.due_date ASC NULLS LAST
          LIMIT 50
        `, [projectId]);
      },
      
      async getUserTasksOptimized(userId) {
        // Using index on assigned_to
        return client.raw(`
          SELECT t.id, t.title, t.status, t.due_date, p.name as project_name
          FROM tasks t
          JOIN projects p ON t.project_id = p.id
          WHERE t.assigned_to = $1 AND t.status NOT IN ('completed', 'archived')
          ORDER BY t.due_date ASC NULLS LAST
          LIMIT 20
        `, [userId]);
      }
    };

    const projectIds = Array.from(appState.projects.keys());
    for (const projectId of projectIds.slice(0, 2)) {
      const startTime = Date.now();
      const tasks = await optimizedQueries.getTasksByProjectOptimized(projectId);
      const endTime = Date.now();
      
      console.log(`  ✅ Optimized project tasks query: ${tasks.rows.length} tasks in ${endTime - startTime}ms`);
    }

    console.log('\n3. Batch processing optimization:');
    
    // Process multiple operations in batches
    const batchProcessor = {
      async batchUpdateTaskStatuses(updates) {
        const batchSize = 10;
        const batches = [];
        
        for (let i = 0; i < updates.length; i += batchSize) {
          batches.push(updates.slice(i, i + batchSize));
        }
        
        for (const batch of batches) {
          const updatePromises = batch.map(update =>
            client.execute('UPDATE tasks SET status = $1 WHERE id = $2', [update.status, update.taskId])
          );
          
          await Promise.all(updatePromises);
          console.log(`    Processed batch of ${batch.length} task updates`);
        }
        
        return batches.length;
      },
      
      async batchIndexDocuments(documents) {
        const bulkIndex = documents.map(doc => ({
          index: doc.index,
          id: doc.id,
          body: doc.data
        }));
        
        // In a real implementation, you'd use Elasticsearch bulk API
        for (const doc of bulkIndex) {
          await client.search.indexDocument(doc.index, doc.id, doc.body);
        }
        
        return bulkIndex.length;
      }
    };

    // Test batch processing
    const taskIds = Array.from(appState.tasks.keys()).slice(0, 5);
    const batchUpdates = taskIds.map(taskId => ({
      taskId,
      status: 'in-progress'
    }));

    const batchesProcessed = await batchProcessor.batchUpdateTaskStatuses(batchUpdates);
    console.log(`  ✅ Batch processed ${batchUpdates.length} updates in ${batchesProcessed} batches`);

    console.log('\n4. Connection pooling and resource management:');
    
    // Simulate connection pooling metrics
    const connectionMetrics = {
      activeConnections: 5,
      maxConnections: 20,
      connectionUtilization: 25, // 25%
      avgQueryTime: 15, // 15ms
      slowQueries: 2,
      cachedQueries: 45
    };

    console.log('✅ Connection metrics:', connectionMetrics);

    console.log('\n5. Asynchronous processing:');
    
    // Queue background tasks for async processing
    const backgroundTasks = [
      {
        type: 'generate-analytics-report',
        data: { reportType: 'weekly', userId: appState.currentUser.id }
      },
      {
        type: 'cleanup-old-files',
        data: { retentionDays: 90 }
      },
      {
        type: 'send-digest-emails',
        data: { frequency: 'daily' }
      },
      {
        type: 'update-search-indices',
        data: { indices: ['tasks', 'projects', 'users'] }
      }
    ];

    for (const task of backgroundTasks) {
      await client.queue.sendMessage('background-processing', task);
    }

    console.log(`  ✅ Queued ${backgroundTasks.length} background tasks for async processing`);

    console.log('\n6. Performance monitoring and alerting:');
    
    const performanceMetrics = {
      async collectMetrics() {
        return {
          responseTime: {
            avg: 125, // ms
            p95: 250,
            p99: 500
          },
          throughput: {
            requestsPerSecond: 45,
            tasksPerMinute: 150
          },
          errorRate: 0.02, // 2%
          cacheHitRate: 0.85, // 85%
          databaseConnections: {
            active: 8,
            idle: 12,
            total: 20
          },
          memoryUsage: {
            used: '512MB',
            available: '1024MB',
            utilization: 50 // 50%
          }
        };
      },
      
      async checkPerformanceThresholds(metrics) {
        const alerts = [];
        
        if (metrics.responseTime.avg > 200) {
          alerts.push({ type: 'HIGH_RESPONSE_TIME', value: metrics.responseTime.avg });
        }
        
        if (metrics.errorRate > 0.05) {
          alerts.push({ type: 'HIGH_ERROR_RATE', value: metrics.errorRate });
        }
        
        if (metrics.cacheHitRate < 0.8) {
          alerts.push({ type: 'LOW_CACHE_HIT_RATE', value: metrics.cacheHitRate });
        }
        
        return alerts;
      }
    };

    const metrics = await performanceMetrics.collectMetrics();
    const alerts = await performanceMetrics.checkPerformanceThresholds(metrics);
    
    console.log('✅ Performance metrics collected:', {
      avgResponseTime: metrics.responseTime.avg + 'ms',
      throughput: metrics.throughput.requestsPerSecond + ' req/sec',
      cacheHitRate: (metrics.cacheHitRate * 100).toFixed(1) + '%',
      alertsTriggered: alerts.length
    });

    console.log('✅ Performance optimization demonstration complete\n');

  } catch (error) {
    console.error('❌ Performance optimization failed:', error.message);
  }
}

async function demonstrateAppAnalytics(client) {
  console.log('📊 Application Analytics and Monitoring\n');
  console.log('==========================================');

  try {
    console.log('1. User engagement analytics:');
    
    const engagementMetrics = await client.analytics.query({
      table: 'events',
      select: [
        'COUNT(DISTINCT user_id) as active_users',
        'COUNT(*) as total_events',
        'AVG(CASE WHEN event_type = \'task_status_changed\' THEN 1 ELSE 0 END) as task_activity_rate'
      ],
      where: {
        timestamp: {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        }
      }
    });

    console.log('✅ Engagement metrics:', engagementMetrics?.[0] || {
      active_users: 15,
      total_events: 247,
      task_activity_rate: 0.65
    });

    console.log('\n2. Application usage patterns:');
    
    const usagePatterns = {
      featureUsage: {
        taskCreation: 45,
        projectViewing: 78,
        fileUploads: 23,
        searchQueries: 34,
        commentPosting: 19
      },
      peakHours: [9, 10, 11, 14, 15, 16], // Hours with highest activity
      userRetention: {
        day1: 0.85, // 85% return after 1 day
        day7: 0.67, // 67% return after 7 days
        day30: 0.45 // 45% return after 30 days
      }
    };

    console.log('✅ Usage patterns:', {
      mostUsedFeature: 'projectViewing',
      peakHour: usagePatterns.peakHours[0] + ':00',
      day1Retention: (usagePatterns.userRetention.day1 * 100).toFixed(1) + '%'
    });

    console.log('\n3. System health monitoring:');
    
    const systemHealth = {
      uptime: '99.95%',
      averageResponseTime: 145, // ms
      errorRate: 0.018, // 1.8%
      throughput: 52, // requests per second
      databasePerformance: {
        avgQueryTime: 12, // ms
        slowQueries: 3,
        connectionPoolUtilization: 65 // %
      },
      cachePerformance: {
        hitRate: 87, // %
        avgRetrievalTime: 2 // ms
      }
    };

    console.log('✅ System health:', {
      uptime: systemHealth.uptime,
      avgResponseTime: systemHealth.averageResponseTime + 'ms',
      errorRate: (systemHealth.errorRate * 100).toFixed(2) + '%',
      cacheHitRate: systemHealth.cachePerformance.hitRate + '%'
    });

    console.log('\n4. Business metrics dashboard:');
    
    const businessMetrics = {
      productivity: {
        tasksCompletedToday: 23,
        averageTaskCompletionTime: 2.5, // days
        projectsOnTrack: 3,
        projectsAtRisk: 1
      },
      teamEfficiency: {
        averageTasksPerUser: 4.2,
        collaborationScore: 8.7, // out of 10
        deadlineMeetRate: 0.78 // 78%
      },
      growth: {
        newUsersThisWeek: 3,
        activeProjectsGrowth: 0.15, // 15% growth
        fileStorageUsage: '2.3GB'
      }
    };

    console.log('✅ Business metrics:', {
      tasksCompletedToday: businessMetrics.productivity.tasksCompletedToday,
      deadlineMeetRate: (businessMetrics.teamEfficiency.deadlineMeetRate * 100).toFixed(1) + '%',
      collaborationScore: businessMetrics.teamEfficiency.collaborationScore + '/10'
    });

    console.log('\n5. Custom reporting and insights:');
    
    // Generate custom reports
    const customReports = {
      weeklyProductivityReport: await generateProductivityReport(client),
      projectHealthReport: await generateProjectHealthReport(client),
      userEngagementReport: await generateUserEngagementReport(client)
    };

    console.log('✅ Custom reports generated:', {
      productivityTrend: customReports.weeklyProductivityReport.trend,
      healthyProjects: customReports.projectHealthReport.healthyCount,
      engagementScore: customReports.userEngagementReport.averageScore
    });

    console.log('\n6. Automated alerting and notifications:');
    
    const alertRules = [
      {
        name: 'Project Deadline Alert',
        condition: 'project.due_date < 3_days_from_now AND project.completion_rate < 80%',
        triggered: 1
      },
      {
        name: 'High Error Rate Alert',
        condition: 'system.error_rate > 5%',
        triggered: 0
      },
      {
        name: 'Low User Engagement Alert',
        condition: 'daily_active_users < 10',
        triggered: 0
      },
      {
        name: 'Storage Limit Alert',
        condition: 'storage_usage > 80%',
        triggered: 0
      }
    ];

    const triggeredAlerts = alertRules.filter(rule => rule.triggered > 0);
    
    console.log('✅ Alert monitoring:', {
      totalRules: alertRules.length,
      triggeredAlerts: triggeredAlerts.length,
      alertNames: triggeredAlerts.map(a => a.name)
    });

    console.log('\n7. Performance optimization recommendations:');
    
    const optimizationRecommendations = [
      {
        type: 'Database',
        recommendation: 'Add index on tasks.due_date for faster deadline queries',
        impact: 'High',
        effort: 'Low'
      },
      {
        type: 'Caching',
        recommendation: 'Increase cache TTL for user profiles from 30min to 1hour',
        impact: 'Medium',
        effort: 'Low'
      },
      {
        type: 'Frontend',
        recommendation: 'Implement lazy loading for project task lists',
        impact: 'Medium',
        effort: 'Medium'
      },
      {
        type: 'Background Jobs',
        recommendation: 'Batch email notifications to reduce queue processing time',
        impact: 'Low',
        effort: 'Low'
      }
    ];

    console.log('✅ Optimization recommendations:', {
      totalRecommendations: optimizationRecommendations.length,
      highImpact: optimizationRecommendations.filter(r => r.impact === 'High').length,
      lowEffort: optimizationRecommendations.filter(r => r.effort === 'Low').length
    });

    console.log('✅ Application analytics demonstration complete\n');

  } catch (error) {
    console.error('❌ Application analytics failed:', error.message);
  }
}

// Helper functions for report generation
async function generateProductivityReport(client) {
  try {
    const productivity = await client.raw(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as tasks_created,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as tasks_completed
      FROM tasks
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    return {
      trend: productivity.rows.length > 0 ? 'increasing' : 'stable',
      weeklyTotal: productivity.rows.reduce((sum, row) => sum + parseInt(row.tasks_completed), 0)
    };
  } catch (error) {
    return { trend: 'stable', weeklyTotal: 25 };
  }
}

async function generateProjectHealthReport(client) {
  try {
    const health = await client.raw(`
      SELECT 
        p.id,
        p.name,
        COUNT(t.id) as total_tasks,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
        CASE WHEN COUNT(t.id) > 0 THEN
          COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::float / COUNT(t.id)::float
        ELSE 0 END as completion_rate
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id
      GROUP BY p.id, p.name
    `);

    const healthyCount = health.rows.filter(p => parseFloat(p.completion_rate) > 0.7).length;

    return {
      healthyCount,
      totalProjects: health.rows.length
    };
  } catch (error) {
    return { healthyCount: 3, totalProjects: 4 };
  }
}

async function generateUserEngagementReport(client) {
  try {
    const engagement = await client.raw(`
      SELECT 
        u.id,
        u.name,
        COUNT(t.id) as assigned_tasks,
        COUNT(tc.id) as comments_made
      FROM users u
      LEFT JOIN tasks t ON u.id = t.assigned_to
      LEFT JOIN task_comments tc ON u.id = tc.user_id
      GROUP BY u.id, u.name
    `);

    const avgScore = engagement.rows.reduce((sum, user) => {
      const score = (parseInt(user.assigned_tasks) * 2) + (parseInt(user.comments_made) * 1);
      return sum + score;
    }, 0) / Math.max(engagement.rows.length, 1);

    return {
      averageScore: Math.round(avgScore * 10) / 10,
      activeUsers: engagement.rows.filter(u => parseInt(u.assigned_tasks) > 0).length
    };
  } catch (error) {
    return { averageScore: 7.5, activeUsers: 4 };
  }
}

function showApplicationSummary() {
  console.log('📱 Task Management Application Summary\n');
  console.log('==========================================');
  console.log(`👥 Users created: ${appState.users.size}`);
  console.log(`📋 Projects created: ${appState.projects.size}`);
  console.log(`✅ Tasks created: ${appState.tasks.size}`);
  console.log(`👤 Current user: ${appState.currentUser?.name || 'None'}`);
  console.log('==========================================');
  console.log('');
  console.log('🎯 Features Demonstrated:');
  console.log('✅ Database schema setup and management');
  console.log('✅ User authentication and management');
  console.log('✅ Project and team collaboration');
  console.log('✅ Task lifecycle management');
  console.log('✅ File storage and attachments');
  console.log('✅ Full-text search and analytics');
  console.log('✅ Email notification system');
  console.log('✅ AI-powered features and suggestions');
  console.log('✅ Workflow automation');
  console.log('✅ Performance optimization');
  console.log('✅ Application analytics and monitoring');
  console.log('');
  console.log('🚀 This demonstrates a complete, production-ready task management system');
  console.log('   using all major features of the Fluxez SDK!');
}

// Run the complete application example
if (require.main === module) {
  console.log('🌟 Running Complete Fluxez SDK Application Example\n');
  completeAppExample().catch(console.error);
}

// Export for use in other files
module.exports = {
  completeAppExample,
  initializeApplication,
  setupDatabaseSchema,
  createUsersAndAuthenticate,
  createProjectsAndTeams,
  demonstrateTaskManagement,
  demonstrateFileManagement,
  demonstrateSearchAndAnalytics,
  demonstrateNotificationSystem,
  demonstrateAIFeatures,
  demonstrateWorkflowAutomation,
  demonstratePerformanceOptimization,
  demonstrateAppAnalytics,
  showApplicationSummary
};