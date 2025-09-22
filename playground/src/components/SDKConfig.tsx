'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Config {
  baseUrl: string;
  apiKey: string;
  projectId: string;
}

interface SDKConfigProps {
  config: Config;
  onConfigChange: (config: Config) => void;
}

export function SDKConfig({ config, onConfigChange }: SDKConfigProps) {
  const handleInputChange = (field: keyof Config, value: string) => {
    onConfigChange({
      ...config,
      [field]: value
    });
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">SDK Configuration</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Base URL</label>
          <input
            type="url"
            value={config.baseUrl}
            onChange={(e) => handleInputChange('baseUrl', e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="http://localhost:3000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">API Key / JWT Token</label>
          <input
            type="password"
            value={config.apiKey}
            onChange={(e) => handleInputChange('apiKey', e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="cgx_... or JWT token"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Project ID (Optional)</label>
          <input
            type="text"
            value={config.projectId}
            onChange={(e) => handleInputChange('projectId', e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="proj_abc123"
          />
        </div>
      </div>
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>API Key Types:</strong> Use service role keys (cgx_service_...) for backend operations, 
          anon keys (cgx_anon_...) for frontend auth, or platform JWT tokens for tenant management.
        </p>
      </div>
    </div>
  );
}