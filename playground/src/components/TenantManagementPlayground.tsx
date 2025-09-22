'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Config {
  baseUrl: string;
  apiKey: string;
  projectId: string;
}

export function TenantManagementPlayground({ config }: { config: Config }) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [organizationName, setOrganizationName] = useState('Acme Corporation');
  const [projectName, setProjectName] = useState('Main Application');
  const [appName, setAppName] = useState('Web Dashboard');

  const handleTenantOperation = async (endpoint: string, data?: any, method = 'POST') => {
    if (!config.apiKey) {
      setResult({ error: 'Please configure your platform JWT token first' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${config.baseUrl}/api/v1${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      const result = await response.json();
      setResult(result);
    } catch (error) {
      setResult({ error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tenant Management Playground</h2>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
        <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
          🏗️ Multi-Tenant Architecture: Organization → Project → App
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Each level gets its own isolated database and API keys. Organizations contain projects, projects contain apps.
          Complete data isolation between tenants with automatic sync to Elasticsearch, ClickHouse, Qdrant, and Redis.
        </p>
      </div>

      <Tabs defaultValue="organizations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="apps">Apps</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Organizations */}
        <TabsContent value="organizations" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Organization Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Organization Name</label>
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Acme Corporation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Project Name</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Main Application"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Owner Email</label>
                  <input
                    type="email"
                    defaultValue="admin@acme.com"
                    className="w-full p-2 border rounded-md"
                    placeholder="admin@acme.com"
                  />
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleTenantOperation('/tenant/create', {
                      organizationName,
                      organizationSlug: organizationName.toLowerCase().replace(/\s+/g, '-'),
                      projectName,
                      description: `Primary application project for ${organizationName}`,
                      ownerEmail: 'admin@acme.com',
                      metadata: {
                        industry: 'Technology',
                        plan: 'Enterprise',
                        source: 'playground'
                      }
                    })}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Creating...' : 'Create Complete Tenant'}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">What Gets Created:</h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Organization record in platform DB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Initial project with isolated database</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Service role API key (backend access)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Anonymous API key (frontend auth)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Database triggers for real-time sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Resource quotas and billing setup</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Organization Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => handleTenantOperation('/tenant/create', {
                  organizationName: 'SaaS Startup',
                  organizationSlug: 'saas-startup',
                  projectName: 'MVP Platform',
                  description: 'Minimum viable product development',
                  ownerEmail: 'founder@startup.com',
                  metadata: {
                    industry: 'SaaS',
                    plan: 'Startup',
                    expectedUsers: 1000,
                    features: ['analytics', 'api_access']
                  }
                })}
                disabled={loading}
                variant="outline"
                className="h-auto p-4 flex-col items-start text-left"
              >
                <strong>🚀 SaaS Startup</strong>
                <span className="text-sm text-gray-600 mt-1">
                  MVP platform with analytics and API access
                </span>
              </Button>

              <Button
                onClick={() => handleTenantOperation('/tenant/create', {
                  organizationName: 'E-commerce Store',
                  organizationSlug: 'ecommerce-store',
                  projectName: 'Online Store',
                  description: 'Multi-vendor e-commerce platform',
                  ownerEmail: 'admin@store.com',
                  metadata: {
                    industry: 'E-commerce',
                    plan: 'Professional',
                    storeType: 'multi_vendor',
                    features: ['payments', 'inventory', 'shipping']
                  }
                })}
                disabled={loading}
                variant="outline"
                className="h-auto p-4 flex-col items-start text-left"
              >
                <strong>🛒 E-commerce</strong>
                <span className="text-sm text-gray-600 mt-1">
                  Multi-vendor store with payments and inventory
                </span>
              </Button>

              <Button
                onClick={() => handleTenantOperation('/tenant/create', {
                  organizationName: 'Enterprise Corp',
                  organizationSlug: 'enterprise-corp',
                  projectName: 'Internal Systems',
                  description: 'Enterprise internal applications',
                  ownerEmail: 'it@enterprise.com',
                  metadata: {
                    industry: 'Enterprise',
                    plan: 'Enterprise',
                    employees: 10000,
                    compliance: ['SOX', 'GDPR', 'HIPAA']
                  }
                })}
                disabled={loading}
                variant="outline"
                className="h-auto p-4 flex-col items-start text-left"
              >
                <strong>🏢 Enterprise</strong>
                <span className="text-sm text-gray-600 mt-1">
                  Large-scale with compliance and security
                </span>
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Projects */}
        <TabsContent value="projects" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Project Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Organization ID</label>
                  <input
                    type="text"
                    placeholder="org_abc123"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Project Name</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    defaultValue="Real-time analytics and reporting system"
                    className="w-full p-2 border rounded-md"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleTenantOperation('/tenant/project', {
                      organizationId: 'org_demo_123',
                      name: projectName,
                      description: 'Real-time analytics and reporting system',
                      metadata: {
                        type: 'analytics',
                        features: ['dashboards', 'reports', 'alerts'],
                        environment: 'production'
                      }
                    })}
                    disabled={loading}
                    className="w-full"
                  >
                    Create Project
                  </Button>
                  <Button
                    onClick={() => handleTenantOperation('/tenant/projects?organizationId=org_demo_123', null, 'GET')}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    List Projects
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Project Types:</h4>
                <div className="space-y-2">
                  <Button
                    onClick={() => setResult({
                      example: 'Project isolation',
                      description: 'Each project gets its own isolated database',
                      isolation: {
                        database: 'tenant_proj_abc123',
                        schema: 'Completely isolated from other projects',
                        apiKeys: 'Project-specific service role and anon keys',
                        sync: 'Independent sync to analytics and search services'
                      },
                      benefits: [
                        'Complete data isolation',
                        'Independent scaling',
                        'Separate backups and recovery',
                        'Custom configurations per project'
                      ]
                    })}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Show Project Isolation
                  </Button>
                  <Button
                    onClick={() => setResult({
                      example: 'Environment projects',
                      environments: [
                        {
                          name: 'Development',
                          purpose: 'Feature development and testing',
                          database: 'tenant_proj_dev_123',
                          features: ['debug_mode', 'test_data', 'hot_reload']
                        },
                        {
                          name: 'Staging',
                          purpose: 'Pre-production testing',
                          database: 'tenant_proj_staging_123',
                          features: ['production_mirror', 'qa_testing', 'performance_testing']
                        },
                        {
                          name: 'Production',
                          purpose: 'Live application',
                          database: 'tenant_proj_prod_123',
                          features: ['high_availability', 'monitoring', 'backups']
                        }
                      ]
                    })}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Show Environment Setup
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Apps */}
        <TabsContent value="apps" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">App Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Project ID</label>
                  <input
                    type="text"
                    placeholder="proj_xyz789"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">App Name</label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">App Type</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="web">Web Application</option>
                    <option value="mobile">Mobile App</option>
                    <option value="api">API Service</option>
                    <option value="admin">Admin Dashboard</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleTenantOperation('/tenant/app', {
                      projectId: 'proj_demo_123',
                      name: appName,
                      description: `${appName} for customer interaction`,
                      metadata: {
                        type: 'web',
                        framework: 'React',
                        features: ['authentication', 'real_time', 'responsive'],
                        deployment: {
                          environment: 'production',
                          domain: 'app.acme.com'
                        }
                      }
                    })}
                    disabled={loading}
                    className="w-full"
                  >
                    Create App
                  </Button>
                  <Button
                    onClick={() => handleTenantOperation('/tenant/apps?projectId=proj_demo_123', null, 'GET')}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    List Apps
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">App Examples:</h4>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleTenantOperation('/tenant/app', {
                      projectId: 'proj_demo_123',
                      name: 'Mobile App',
                      description: 'iOS and Android mobile application',
                      metadata: {
                        type: 'mobile',
                        platforms: ['iOS', 'Android'],
                        features: ['offline_sync', 'push_notifications', 'biometric_auth'],
                        versions: { ios: '1.0.0', android: '1.0.0' }
                      }
                    })}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    📱 Create Mobile App
                  </Button>
                  <Button
                    onClick={() => handleTenantOperation('/tenant/app', {
                      projectId: 'proj_demo_123',
                      name: 'Public API',
                      description: 'RESTful API for third-party integrations',
                      metadata: {
                        type: 'api',
                        version: 'v1',
                        features: ['rate_limiting', 'authentication', 'webhooks'],
                        endpoints: { base: 'https://api.acme.com/v1' }
                      }
                    })}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    🔌 Create API Service
                  </Button>
                  <Button
                    onClick={() => handleTenantOperation('/tenant/app', {
                      projectId: 'proj_demo_123',
                      name: 'Admin Dashboard',
                      description: 'Administrative control panel',
                      metadata: {
                        type: 'admin',
                        features: ['user_management', 'analytics', 'settings'],
                        access: 'restricted'
                      }
                    })}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    ⚙️ Create Admin Panel
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api-keys" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">API Key Management</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">Key Type</label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="service_role">Service Role</option>
                      <option value="anon">Anonymous</option>
                      <option value="user">User Token</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Expires In</label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="1y">1 Year</option>
                      <option value="6m">6 Months</option>
                      <option value="3m">3 Months</option>
                      <option value="1m">1 Month</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Key Name</label>
                  <input
                    type="text"
                    defaultValue="Production API Key"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Permissions</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm">Read Access</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm">Write Access</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Delete Access</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Admin Access</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleTenantOperation('/tenant/api-key', {
                      name: 'Production API Key',
                      type: 'service_role',
                      projectId: 'proj_demo_123',
                      permissions: ['read', 'write'],
                      expiresIn: '1y',
                      metadata: {
                        purpose: 'Backend services',
                        environment: 'production'
                      }
                    })}
                    disabled={loading}
                    className="w-full"
                  >
                    Create API Key
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Key Types & Usage:</h4>
                <div className="space-y-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                    <strong className="text-blue-800 dark:text-blue-200">Service Role Key</strong>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Backend services, full database access, server-side operations
                    </p>
                    <code className="text-xs text-blue-600 dark:text-blue-400">cgx_service_...</code>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                    <strong className="text-green-800 dark:text-green-200">Anonymous Key</strong>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Frontend apps, user registration/login, row-level security
                    </p>
                    <code className="text-xs text-green-600 dark:text-green-400">cgx_anon_...</code>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md">
                    <strong className="text-purple-800 dark:text-purple-200">User Token</strong>
                    <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                      Individual user sessions, personalized access, JWT tokens
                    </p>
                    <code className="text-xs text-purple-600 dark:text-purple-400">cgx_user_...</code>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button
                    onClick={() => setResult({
                      example: 'API key scoping hierarchy',
                      hierarchy: {
                        platform: {
                          description: 'Platform-wide access for admins',
                          permissions: ['all_organizations', 'billing', 'system_admin']
                        },
                        organization: {
                          description: 'Organization-level management',
                          permissions: ['org_projects', 'org_users', 'org_settings']
                        },
                        project: {
                          description: 'Project database and apps',
                          permissions: ['project_data', 'project_apps', 'project_keys']
                        },
                        app: {
                          description: 'App-specific operations',
                          permissions: ['app_data', 'app_users', 'app_settings']
                        }
                      }
                    })}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Show Key Scoping
                  </Button>
                  <Button
                    onClick={() => handleTenantOperation('/tenant/api-keys?projectId=proj_demo_123', null, 'GET')}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    List Project Keys
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Resources */}
        <TabsContent value="resources" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Resource Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Organization ID</label>
                  <input
                    type="text"
                    placeholder="org_abc123"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => setResult({
                      example: 'Resource quotas',
                      organization: 'org_demo_123',
                      quotas: {
                        projects: { used: 3, limit: 10, percentage: 30 },
                        storage: { used: 2.5, limit: 100, unit: 'GB', percentage: 2.5 },
                        apiCalls: { used: 15420, limit: 100000, period: 'monthly', percentage: 15.4 },
                        databases: { used: 5, limit: 25, percentage: 20 },
                        users: { used: 156, limit: 1000, percentage: 15.6 }
                      },
                      status: 'healthy'
                    })}
                    disabled={loading}
                    className="w-full"
                  >
                    Get Resource Quotas
                  </Button>
                  <Button
                    onClick={() => setResult({
                      example: 'Billing information',
                      organization: 'org_demo_123',
                      billing: {
                        plan: { name: 'Enterprise', price: 299, currency: 'USD' },
                        status: 'active',
                        currentPeriod: {
                          start: '2024-03-01',
                          end: '2024-03-31',
                          amount: 299,
                          currency: 'USD'
                        },
                        usage: {
                          apiCalls: 15420,
                          storage: '2.5 GB',
                          bandwidth: '15.2 GB'
                        },
                        nextBilling: '2024-04-01'
                      }
                    })}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    Get Billing Info
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Resource Monitoring:</h4>
                <div className="space-y-3">
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">API Calls</span>
                      <span className="text-sm text-green-600">15.4%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '15.4%'}}></div>
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Storage</span>
                      <span className="text-sm text-blue-600">2.5%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '2.5%'}}></div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Projects</span>
                      <span className="text-sm text-yellow-600">30%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: '30%'}}></div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button
                    onClick={() => setResult({
                      example: 'Tenant health dashboard',
                      metrics: {
                        overallHealth: 92,
                        status: 'healthy',
                        lastCheck: new Date().toISOString(),
                        details: {
                          resourceUtilization: 85,
                          apiPerformance: 98,
                          databaseHealth: 94,
                          errorRate: 0.2
                        },
                        alerts: [],
                        recommendations: [
                          'Consider upgrading storage plan within 2 months',
                          'API usage trending upward - monitor closely'
                        ]
                      }
                    })}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Show Health Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Architecture Overview</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-blue-800 dark:text-blue-200">
                    fluxez_platform
                  </span>
                  <span>→ Platform metadata (orgs, projects, apps, keys)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-green-800 dark:text-green-200">
                    tenant_proj_123
                  </span>
                  <span>→ Project isolated database</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded text-purple-800 dark:text-purple-200">
                    tenant_app_456
                  </span>
                  <span>→ App isolated database</span>
                </div>
                <div className="border-l-2 border-gray-300 pl-4 ml-4">
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div>• PostgreSQL triggers → MCP Server</div>
                    <div>• Real-time sync to Elasticsearch, ClickHouse, Qdrant, Redis</div>
                    <div>• WebSocket notifications</div>
                    <div>• Automatic backup and monitoring</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results */}
      {result && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Result</h3>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}