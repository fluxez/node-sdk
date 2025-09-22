'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Config {
  baseUrl: string;
  apiKey: string;
  projectId: string;
}

export function CachePlayground({ config }: { config: Config }) {
  const [result, setResult] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Cache Playground</h2>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Intelligent Caching</h3>
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Redis-based caching with multiple strategies: lazy, eager, write-through, and write-behind.
            High-performance data caching and session management.
          </p>
          <Button
            onClick={() => setResult({
              example: 'Cache strategies',
              strategies: ['lazy', 'eager', 'write_through', 'write_behind', 'ttl_based']
            })}
            variant="outline"
          >
            Show Cache Features
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