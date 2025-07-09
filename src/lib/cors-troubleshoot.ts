// CORS Troubleshooting Utility
export interface CorsTestResult {
  url: string;
  accessible: boolean;
  corsEnabled: boolean;
  error?: string;
  statusCode?: number;
  headers?: Record<string, string>;
}

export class CorsTestUtil {
  static async testEndpoint(baseUrl: string): Promise<CorsTestResult> {
    const testUrl = `${baseUrl}/api/WF/GetWorkflowApplicationDetails/false`;
    
    try {
      // First, try a simple fetch to see if the endpoint is accessible
      const response = await fetch(testUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      return {
        url: testUrl,
        accessible: true,
        corsEnabled: response.ok,
        statusCode: response.status,
        headers,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
      };

    } catch (error: any) {
      // Check if it's a CORS error
      const isCorsError = error.message.includes('CORS') || 
                         error.message.includes('Cross-Origin') ||
                         error.name === 'TypeError' && error.message.includes('Failed to fetch');

      return {
        url: testUrl,
        accessible: false,
        corsEnabled: false,
        error: error.message,
      };
    }
  }

  static async testWithOptions(baseUrl: string): Promise<CorsTestResult> {
    const testUrl = `${baseUrl}/api/WF/GetWorkflowApplicationDetails/false`;
    
    try {
      // Try an OPTIONS request to check CORS preflight
      const response = await fetch(testUrl, {
        method: 'OPTIONS',
        mode: 'cors',
        headers: {
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type',
        },
      });

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      const corsEnabled = headers['access-control-allow-origin'] !== undefined;

      return {
        url: testUrl,
        accessible: true,
        corsEnabled,
        statusCode: response.status,
        headers,
        error: corsEnabled ? undefined : 'CORS headers not found in response',
      };

    } catch (error: any) {
      return {
        url: testUrl,
        accessible: false,
        corsEnabled: false,
        error: error.message,
      };
    }
  }

  static generateCorsReport(results: CorsTestResult[]): string {
    let report = '=== CORS Troubleshooting Report ===\n\n';
    
    results.forEach((result, index) => {
      report += `Test ${index + 1}: ${result.url}\n`;
      report += `- Accessible: ${result.accessible}\n`;
      report += `- CORS Enabled: ${result.corsEnabled}\n`;
      
      if (result.statusCode) {
        report += `- Status Code: ${result.statusCode}\n`;
      }
      
      if (result.error) {
        report += `- Error: ${result.error}\n`;
      }
      
      if (result.headers && Object.keys(result.headers).length > 0) {
        report += '- Response Headers:\n';
        Object.entries(result.headers).forEach(([key, value]) => {
          if (key.toLowerCase().includes('access-control') || 
              key.toLowerCase().includes('cors') ||
              key.toLowerCase() === 'server') {
            report += `  ${key}: ${value}\n`;
          }
        });
      }
      
      report += '\n';
    });

    report += '=== Recommendations ===\n';
    report += '1. Ensure your backend server is running on the configured port\n';
    report += '2. Configure CORS on your backend to allow requests from http://localhost:3000\n';
    report += '3. Check if Windows authentication is properly configured\n';
    report += '4. Verify the API endpoint URLs are correct\n';
    report += '5. Consider using a proxy configuration for development\n';

    return report;
  }
}