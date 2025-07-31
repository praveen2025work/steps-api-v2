import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Globe, 
  Server,
  Network,
  Info
} from 'lucide-react';
import { getCurrentEnvironment } from '@/config/api-environments';
import { workflowConfigService } from '@/services/workflowConfigService';

interface TestResult {
  name: string;
  url: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  details?: any;
  responseHeaders?: Record<string, string>;
  requestHeaders?: Record<string, string>;
}

const CorsDebugger: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [environment, setEnvironment] = useState(getCurrentEnvironment());

  useEffect(() => {
    setEnvironment(getCurrentEnvironment());
  }, []);

  const runCorsTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const tests: Omit<TestResult, 'status' | 'message' | 'details'>[] = [
      {
        name: 'Java API - Workflow Apps',
        url: `${environment.javaApiUrl}/workflowapp`,
        requestHeaders: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      },
      {
        name: 'Java API - Alternative URL',
        url: `${environment.javaBaseUrl}/api/workflowapp`,
        requestHeaders: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      },
      {
        name: '.NET API - Workflow Applications',
        url: `${environment.coreApiUrl}/GetWorkflowApplicationDetails`,
        requestHeaders: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    ];

    for (const test of tests) {
      const result: TestResult = {
        ...test,
        status: 'pending',
        message: 'Testing...'
      };
      
      setTestResults(prev => [...prev, result]);

      try {
        const isJavaApi = test.url.includes(environment.javaApiUrl) || test.url.includes(environment.javaBaseUrl);
        
        const response = await fetch(test.url, {
          method: 'GET',
          mode: 'cors',
          credentials: isJavaApi ? 'omit' : 'include',
          headers: test.requestHeaders || {}
        });

        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        if (response.ok) {
          const data = await response.json();
          result.status = 'success';
          result.message = `Success - ${response.status} ${response.statusText}`;
          result.details = {
            dataType: Array.isArray(data) ? `Array (${data.length} items)` : typeof data,
            responseSize: JSON.stringify(data).length
          };
          result.responseHeaders = responseHeaders;
        } else {
          result.status = 'error';
          result.message = `HTTP Error - ${response.status} ${response.statusText}`;
          result.responseHeaders = responseHeaders;
        }
      } catch (error: any) {
        result.status = 'error';
        result.message = `Network Error - ${error.message}`;
        result.details = {
          errorType: error.name,
          errorMessage: error.message,
          stack: error.stack?.split('\n').slice(0, 3).join('\n')
        };
      }

      setTestResults(prev => prev.map(r => r.url === test.url ? result : r));
    }

    setIsRunning(false);
  };

  const testWorkflowConfigService = async () => {
    setIsRunning(true);
    
    const serviceTest: TestResult = {
      name: 'Workflow Config Service - getWorkflowApps()',
      url: 'Service Method Call',
      status: 'pending',
      message: 'Testing service method...'
    };
    
    setTestResults(prev => [...prev, serviceTest]);

    try {
      const apps = await workflowConfigService.getWorkflowApps();
      serviceTest.status = 'success';
      serviceTest.message = `Service call successful`;
      serviceTest.details = {
        appsCount: apps.length,
        sampleApp: apps[0]?.name || 'No apps returned'
      };
    } catch (error: any) {
      serviceTest.status = 'error';
      serviceTest.message = `Service call failed - ${error.message}`;
      serviceTest.details = {
        errorType: error.name,
        errorMessage: error.message
      };
    }

    setTestResults(prev => prev.map(r => r.name === serviceTest.name ? serviceTest : r));
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'pending':
        return <Badge variant="secondary">Testing...</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Network className="h-5 w-5" />
            <span>CORS Debugging Tool</span>
          </CardTitle>
          <CardDescription>
            Test API endpoints to identify CORS configuration issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Environment Info */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div><strong>Current Environment:</strong> {environment.name} ({environment.displayName})</div>
                <div><strong>Java API URL:</strong> {environment.javaApiUrl}</div>
                <div><strong>Core API URL:</strong> {environment.coreApiUrl}</div>
                <div><strong>Auth Type:</strong> {environment.authType}</div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Test Controls */}
          <div className="flex space-x-2">
            <Button 
              onClick={runCorsTests} 
              disabled={isRunning}
              className="flex items-center space-x-2"
            >
              <Globe className="h-4 w-4" />
              <span>Test Direct API Calls</span>
            </Button>
            <Button 
              onClick={testWorkflowConfigService} 
              disabled={isRunning}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Server className="h-4 w-4" />
              <span>Test Service Method</span>
            </Button>
            <Button 
              onClick={() => setTestResults([])} 
              variant="ghost"
              disabled={isRunning}
            >
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Results of CORS and API connectivity tests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.name}</span>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
                
                <div className="text-sm text-muted-foreground mb-2">
                  <strong>URL:</strong> {result.url}
                </div>
                
                <div className="text-sm mb-2">
                  <strong>Message:</strong> {result.message}
                </div>

                {result.details && (
                  <div className="mt-2">
                    <Separator className="my-2" />
                    <div className="text-sm">
                      <strong>Details:</strong>
                      <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {result.requestHeaders && (
                  <div className="mt-2">
                    <div className="text-sm">
                      <strong>Request Headers:</strong>
                      <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                        {JSON.stringify(result.requestHeaders, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {result.responseHeaders && (
                  <div className="mt-2">
                    <div className="text-sm">
                      <strong>Response Headers:</strong>
                      <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                        {JSON.stringify(result.responseHeaders, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Troubleshooting Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>Troubleshooting Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <div><strong>CORS Error:</strong> Check if the server has proper CORS headers configured</div>
            <div><strong>Network Error:</strong> Verify the API server is running and accessible</div>
            <div><strong>401/403 Error:</strong> Check authentication configuration (credentials: include/omit)</div>
            <div><strong>404 Error:</strong> Verify the API endpoint URL is correct</div>
            <div><strong>500 Error:</strong> Check server logs for internal errors</div>
          </div>
          
          <Separator />
          
          <div className="text-sm">
            <strong>Expected CORS Headers for Java API:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Access-Control-Allow-Origin: * (or your domain)</li>
              <li>Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS</li>
              <li>Access-Control-Allow-Headers: Content-Type, Accept</li>
              <li>Access-Control-Allow-Credentials: false</li>
            </ul>
          </div>
          
          <div className="text-sm">
            <strong>Expected CORS Headers for .NET API:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Access-Control-Allow-Origin: your-domain (not *)</li>
              <li>Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS</li>
              <li>Access-Control-Allow-Headers: Content-Type, Accept</li>
              <li>Access-Control-Allow-Credentials: true</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CorsDebugger;