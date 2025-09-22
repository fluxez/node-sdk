'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Config {
  baseUrl: string;
  apiKey: string;
  projectId: string;
}

export function ApiExplorer({ config }: { config: Config }) {
  const [result, setResult] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">API Explorer</h2>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">REST API Explorer</h3>
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Interactive API explorer for testing endpoints, viewing responses, and understanding the API structure.
            Complete documentation with examples and authentication testing.
          </p>
          <Button
            onClick={() => setResult({
              example: 'API endpoints',
              categories: ['tenant_auth', 'schema', 'tenant_management', 'data', 'search', 'analytics']
            })}
            variant="outline"
          >
            Show API Categories
          </Button>
        </div>
      </Card>

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