'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QueryBuilderPlayground } from '@/components/QueryBuilderPlayground';
import { TenantAuthPlayground } from '@/components/TenantAuthPlayground';
import { SchemaManagementPlayground } from '@/components/SchemaManagementPlayground';
import { TenantManagementPlayground } from '@/components/TenantManagementPlayground';
import { StoragePlayground } from '@/components/StoragePlayground';
import { SearchPlayground } from '@/components/SearchPlayground';
import { AnalyticsPlayground } from '@/components/AnalyticsPlayground';
import { CachePlayground } from '@/components/CachePlayground';
import { ApiExplorer } from '@/components/ApiExplorer';
import { SDKConfig } from '@/components/SDKConfig';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, Book, FileCode, Zap } from 'lucide-react';

export default function Home() {
  const [config, setConfig] = useState({
    baseUrl: 'http://localhost:3000',
    apiKey: '',
    projectId: '',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Fluxez SDK Playground
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Interactive testing environment for the Fluxez Node SDK
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <a href="https://github.com/fluxez/node-sdk" target="_blank" rel="noopener noreferrer">
                  <Github className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="/docs" target="_blank" rel="noopener noreferrer">
                  <Book className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="/api-docs" target="_blank" rel="noopener noreferrer">
                  <FileCode className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Configuration */}
        <Card className="mb-8">
          <SDKConfig config={config} onConfigChange={setConfig} />
        </Card>

        {/* Playground Tabs */}
        <Tabs defaultValue="tenant-auth" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-6 lg:grid-cols-9 lg:w-auto lg:inline-grid">
            <TabsTrigger value="tenant-auth">Tenant Auth</TabsTrigger>
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="tenant-mgmt">Tenant Mgmt</TabsTrigger>
            <TabsTrigger value="query">Query Builder</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="cache">Cache</TabsTrigger>
            <TabsTrigger value="api">API Explorer</TabsTrigger>
          </TabsList>

          <TabsContent value="tenant-auth" className="space-y-4">
            <TenantAuthPlayground config={config} />
          </TabsContent>

          <TabsContent value="schema" className="space-y-4">
            <SchemaManagementPlayground config={config} />
          </TabsContent>

          <TabsContent value="tenant-mgmt" className="space-y-4">
            <TenantManagementPlayground config={config} />
          </TabsContent>

          <TabsContent value="query" className="space-y-4">
            <QueryBuilderPlayground config={config} />
          </TabsContent>

          <TabsContent value="storage" className="space-y-4">
            <StoragePlayground config={config} />
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <SearchPlayground config={config} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsPlayground config={config} />
          </TabsContent>

          <TabsContent value="cache" className="space-y-4">
            <CachePlayground config={config} />
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <ApiExplorer config={config} />
          </TabsContent>
        </Tabs>

        {/* Features Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">🔐 Tenant Authentication</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Complete user auth system with registration, login, social auth, teams, and email verification.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">🗃️ Schema Management</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Database schema registration, migrations, table configuration for search, analytics, and cache.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">🏢 Tenant Management</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Multi-tenant architecture with Organizations → Projects → Apps and isolated databases.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">🔍 Advanced Query Builder</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Build complex SQL queries with an intuitive fluent interface. Supports joins, aggregations, and more.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">☁️ S3 Storage Integration</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Upload, download, and manage files with built-in S3 support. Signed URLs and direct uploads included.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">🎯 Full-Text & Vector Search</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Elasticsearch integration for full-text search and Qdrant for vector similarity search.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">📊 Real-Time Analytics</h3>
            <p className="text-gray-600 dark:text-gray-400">
              ClickHouse-powered analytics for fast aggregations and time-series data analysis.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">⚡ Intelligent Caching</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Redis-based caching with multiple strategies: lazy, eager, write-through, and write-behind.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">🔑 API Management</h3>
            <p className="text-gray-600 dark:text-gray-400">
              API key generation, permissions, rotation, and comprehensive request/response exploration.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}