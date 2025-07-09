import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CorsTestUtil, CorsTestResult } from '@/lib/cors-troubleshoot';
import { workflowService } from '@/services/workflowService';

export const CorsDebugger: React.FC = () => {
  const [testResults, setTestResults] = useState<CorsTestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [report, setReport] = useState<string>('');

  const envInfo = workflowService.getEnvironmentInfo();

  const runCorsTests = async () => {
    setTesting(true);
    setTestResults([]);
    setReport('');

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';
      
      // Run multiple tests
      const results: CorsTestResult[] = [];
      
      // Test 1: Direct endpoint test
      console.log('Testing direct endpoint...');
      const directTest = await CorsTestUtil.testEndpoint(baseUrl);
      results.push(directTest);
      
      // Test 2: OPTIONS preflight test
      console.log('Testing CORS preflight...');
      const optionsTest = await CorsTestUtil.testWithOptions(baseUrl);
      results.push(optionsTest);
      
      setTestResults(results);
      
      // Generate report
      const generatedReport = CorsTestUtil.generateCorsReport(results);
      setReport(generatedReport);
      
    } catch (error: any) {
      console.error('Error running CORS tests:', error);
      setReport(`Error running tests: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const testApiConnection = async () => {
    setTesting(true);
    try {
      const result = await workflowService.testConnection();
      console.log('API Connection Test Result:', result);
      
      const testResult: CorsTestResult = {
        url: `${envInfo.baseUrl}/api/WF/GetWorkflowApplicationDetails/false`,
        accessible: result.success,
        corsEnabled: result.success,
        error: result.error,
        statusCode: result.success ? 200 : undefined,
      };
      
      setTestResults([testResult]);
      setReport(result.success ? 'API connection successful!' : `API connection failed: ${result.error}`);
    } catch (error: any) {
      console.error('API connection test failed:', error);
      setReport(`API connection test failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const getStatusBadge = (result: CorsTestResult) => {
    if (result.accessible && result.corsEnabled) {
      return <Badge variant="default" className="bg-green-500">Success</Badge>;
    } else if (result.accessible && !result.corsEnabled) {
      return <Badge variant="destructive">CORS Issue</Badge>;
    } else {
      return <Badge variant="secondary">Not Accessible</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CORS Troubleshooting Tool</CardTitle>
          <CardDescription>
            Diagnose and resolve CORS issues with your backend API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                <strong>Current Configuration:</strong><br />
                Mode: {envInfo.isMock ? 'Mock Data' : 'Live API'}<br />
                Base URL: {envInfo.baseUrl}<br />
                Force Real API: {process.env.NEXT_PUBLIC_FORCE_REAL_API}
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button 
                onClick={runCorsTests} 
                disabled={testing}
                variant="default"
              >
                {testing ? 'Testing...' : 'Run CORS Tests'}
              </Button>
              
              <Button 
                onClick={testApiConnection} 
                disabled={testing}
                variant="outline"
              >
                {testing ? 'Testing...' : 'Test API Connection'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Tabs defaultValue="results" className="w-full">
          <TabsList>
            <TabsTrigger value="results">Test Results</TabsTrigger>
            <TabsTrigger value="report">Detailed Report</TabsTrigger>
            <TabsTrigger value="solutions">Solutions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="results">
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Test {index + 1}</CardTitle>
                      {getStatusBadge(result)}
                    </div>
                    <CardDescription className="text-xs font-mono">
                      {result.url}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Accessible:</strong> {result.accessible ? 'Yes' : 'No'}
                      </div>
                      <div>
                        <strong>CORS Enabled:</strong> {result.corsEnabled ? 'Yes' : 'No'}
                      </div>
                      {result.statusCode && (
                        <div>
                          <strong>Status Code:</strong> {result.statusCode}
                        </div>
                      )}
                      {result.error && (
                        <div className="text-red-600">
                          <strong>Error:</strong> {result.error}
                        </div>
                      )}
                      {result.headers && Object.keys(result.headers).length > 0 && (
                        <div>
                          <strong>CORS Headers:</strong>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
                            {Object.entries(result.headers)
                              .filter(([key]) => key.toLowerCase().includes('access-control'))
                              .map(([key, value]) => `${key}: ${value}`)
                              .join('\n') || 'No CORS headers found'}
                          </pre>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="report">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Report</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-4 rounded whitespace-pre-wrap">
                  {report || 'No report generated yet. Run tests first.'}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="solutions">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Solutions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold">1. Switch to Mock Mode (Temporary)</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      If you need to continue development while fixing CORS:
                    </p>
                    <pre className="text-xs bg-gray-100 p-2 rounded">
                      {`# Update .env.local
NEXT_PUBLIC_FORCE_REAL_API=false
NEXT_PUBLIC_API_MODE=mock`}
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold">2. Use Development Proxy</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      The app is configured to use a proxy in development. Restart your dev server:
                    </p>
                    <pre className="text-xs bg-gray-100 p-2 rounded">
                      npm run dev
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold">3. Backend CORS Configuration</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Configure your .NET backend to allow CORS from localhost:3000:
                    </p>
                    <pre className="text-xs bg-gray-100 p-2 rounded">
                      {`// In Startup.cs or Program.cs
services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost",
        builder =>
        {
            builder.WithOrigins("http://localhost:3000")
                   .AllowAnyHeader()
                   .AllowAnyMethod()
                   .AllowCredentials();
        });
});

app.UseCors("AllowLocalhost");`}
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold">4. Check Backend Server</h4>
                    <p className="text-sm text-gray-600">
                      Ensure your backend server is running on the configured port (localhost:8080) and is accessible.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};