'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Config {
  baseUrl: string;
  apiKey: string;
  projectId: string;
}

export function StoragePlayground({ config }: { config: Config }) {
  const [result, setResult] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Storage Playground</h2>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">S3 Storage Operations</h3>
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            File upload, download, and management with S3 integration. 
            Supports signed URLs and direct uploads.
          </p>
          <Button
            onClick={() => setResult({
              example: 'Storage operations',
              operations: ['upload', 'download', 'delete', 'list', 'signed_urls']
            })}
            variant="outline"
          >
            Show Storage Features
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