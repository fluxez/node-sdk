'use client';

import { useState } from 'react';
import { FluxezClient } from '@fluxez/node-sdk';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MonacoEditor from '@monaco-editor/react';
import ReactJson from 'react-json-view';
import { Play, Copy, Download, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface QueryBuilderPlaygroundProps {
  config: {
    baseUrl: string;
    apiKey: string;
    projectId: string;
  };
}

export function QueryBuilderPlayground({ config }: QueryBuilderPlaygroundProps) {
  const [table, setTable] = useState('users');
  const [queryType, setQueryType] = useState<'select' | 'insert' | 'update' | 'delete'>('select');
  const [queryCode, setQueryCode] = useState(`// Example: Simple SELECT query
const result = await client.query
  .from('users')
  .select('id', 'name', 'email')
  .where('status', 'active')
  .orderBy('created_at', 'DESC')
  .limit(10)
  .get();`);
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryExamples = {
    select: {
      simple: `// Simple SELECT
const result = await client.query
  .from('${table}')
  .select('*')
  .limit(10)
  .get();`,
      
      withWhere: `// SELECT with WHERE conditions
const result = await client.query
  .from('${table}')
  .select('id', 'name', 'email')
  .where('status', 'active')
  .where('age', '>', 18)
  .orderBy('created_at', 'DESC')
  .limit(20)
  .get();`,
      
      withJoin: `// SELECT with JOIN
const result = await client.query
  .from('${table}')
  .select('users.*', 'posts.title')
  .leftJoin('posts', 'users.id', '=', 'posts.user_id')
  .where('users.status', 'active')
  .get();`,
      
      aggregate: `// Aggregation query
const result = await client.query
  .from('${table}')
  .select('status')
  .count('id')
  .groupBy('status')
  .get();`,
      
      pagination: `// Paginated query
const page = 2;
const perPage = 20;

const result = await client.query
  .from('${table}')
  .select('*')
  .paginate(page, perPage)
  .get();`,
    },
    
    insert: {
      single: `// Insert single record
const result = await client.query
  .from('${table}')
  .insert({
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active'
  })
  .returning('*')
  .execute();`,
      
      multiple: `// Insert multiple records
const result = await client.query
  .from('${table}')
  .insert([
    { name: 'John', email: 'john@example.com' },
    { name: 'Jane', email: 'jane@example.com' },
    { name: 'Bob', email: 'bob@example.com' }
  ])
  .returning('id', 'name')
  .execute();`,
    },
    
    update: {
      simple: `// Update records
const result = await client.query
  .from('${table}')
  .update({ status: 'inactive' })
  .where('last_login', '<', '2024-01-01')
  .returning('*')
  .execute();`,
      
      conditional: `// Conditional update
const result = await client.query
  .from('${table}')
  .update({ 
    verified: true,
    verified_at: new Date().toISOString()
  })
  .where('email_confirmed', true)
  .whereNotNull('phone')
  .execute();`,
    },
    
    delete: {
      simple: `// Delete records
const result = await client.query
  .from('${table}')
  .delete()
  .where('status', 'deleted')
  .returning('id')
  .execute();`,
      
      conditional: `// Conditional delete
const result = await client.query
  .from('${table}')
  .delete()
  .where('created_at', '<', '2023-01-01')
  .where('status', 'inactive')
  .execute();`,
    },
  };

  const executeQuery = async () => {
    if (!config.apiKey) {
      toast({
        title: 'Configuration Required',
        description: 'Please set your API key in the configuration section',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const client = new FluxezClient(config);
      
      // Create a function wrapper to execute the code
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const executeCode = new AsyncFunction('client', queryCode);
      
      const queryResult = await executeCode(client);
      setResult(queryResult);
      
      toast({
        title: 'Query Executed',
        description: 'Query completed successfully',
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      toast({
        title: 'Query Failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (example: string) => {
    setQueryCode(example);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(queryCode);
    toast({
      title: 'Copied',
      description: 'Code copied to clipboard',
    });
  };

  const downloadResult = () => {
    if (!result) return;
    
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query-result.json';
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Query Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Table</Label>
              <Input
                value={table}
                onChange={(e) => setTable(e.target.value)}
                placeholder="Enter table name"
              />
            </div>
            <div>
              <Label>Query Type</Label>
              <Select value={queryType} onValueChange={(v: any) => setQueryType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select">SELECT</SelectItem>
                  <SelectItem value="insert">INSERT</SelectItem>
                  <SelectItem value="update">UPDATE</SelectItem>
                  <SelectItem value="delete">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Example Templates */}
          <div>
            <Label>Load Example</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(queryExamples[queryType]).map(([name, code]) => (
                <Button
                  key={name}
                  variant="outline"
                  size="sm"
                  onClick={() => loadExample(code)}
                >
                  {name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor and Result */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Code Editor */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Query Code</CardTitle>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" onClick={copyCode}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setQueryCode('')}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button onClick={executeQuery} disabled={loading}>
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Execute
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <MonacoEditor
              height="400px"
              language="javascript"
              theme="vs-dark"
              value={queryCode}
              onChange={(value) => setQueryCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          </CardContent>
        </Card>

        {/* Result */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Result</CardTitle>
              {result && (
                <Button size="icon" variant="ghost" onClick={downloadResult}>
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] overflow-auto">
              {error ? (
                <div className="text-red-500 p-4 bg-red-50 rounded">
                  <pre className="text-sm">{error}</pre>
                </div>
              ) : result ? (
                <ReactJson
                  src={result}
                  theme="monokai"
                  collapsed={2}
                  displayDataTypes={false}
                  displayObjectSize={true}
                />
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Execute a query to see results
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}