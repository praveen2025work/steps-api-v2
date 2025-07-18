import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FileLocationDebuggerProps {
  className?: string;
}

const FileLocationDebugger: React.FC<FileLocationDebuggerProps> = ({ className = "" }) => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [rawApiData, setRawApiData] = useState<any>(null);

  useEffect(() => {
    // Get the raw workflow summary data from global storage
    const summaryData = (window as any).currentWorkflowSummary;
    setRawApiData(summaryData);
    
    if (summaryData && summaryData.fileData) {
      const fileData = summaryData.fileData;
      
      // Analyze each file entry
      const analysis = fileData.map((file: any, index: number) => {
        return {
          index,
          fileName: file.name,
          hasNameProperty: 'name' in file,
          hasValueProperty: 'value' in file,
          nameValue: file.name,
          valueValue: file.value,
          valueType: typeof file.value,
          valueIsNull: file.value === null,
          valueIsUndefined: file.value === undefined,
          valueIsEmptyString: file.value === '',
          allProperties: Object.keys(file),
          rawFileObject: file
        };
      });
      
      setDebugInfo({
        totalFiles: fileData.length,
        filesWithName: analysis.filter(f => f.hasNameProperty).length,
        filesWithValue: analysis.filter(f => f.hasValueProperty).length,
        filesWithNullValue: analysis.filter(f => f.valueIsNull).length,
        filesWithValidValue: analysis.filter(f => f.hasValueProperty && !f.valueIsNull && !f.valueIsUndefined && f.valueValue !== '').length,
        analysis
      });
    }
  }, []);

  const testApiCall = async (file: any) => {
    try {
      const javaBaseUrl = process.env.NEXT_PUBLIC_JAVA_BASE_URL || 'http://api-java.com';
      const apiUrl = `${javaBaseUrl}/api/process/data`;
      
      const payload = {
        location: file.value,
        name: null
      };
      
      console.log('[FileLocationDebugger] Testing API call with:', {
        url: apiUrl,
        payload,
        fileObject: file
      });
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      console.log('[FileLocationDebugger] API Response:', {
        status: response.status,
        ok: response.ok
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('[FileLocationDebugger] API Success:', result);
      } else {
        const error = await response.text();
        console.log('[FileLocationDebugger] API Error:', error);
      }
    } catch (error) {
      console.error('[FileLocationDebugger] API Call Failed:', error);
    }
  };

  if (!debugInfo) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <p>Loading debug information...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>File Location Debug Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Badge variant="outline">Total Files: {debugInfo.totalFiles}</Badge>
              </div>
              <div>
                <Badge variant="outline">Files with Name: {debugInfo.filesWithName}</Badge>
              </div>
              <div>
                <Badge variant="outline">Files with Value Property: {debugInfo.filesWithValue}</Badge>
              </div>
              <div>
                <Badge variant="outline">Files with NULL Value: {debugInfo.filesWithNullValue}</Badge>
              </div>
              <div>
                <Badge variant="secondary">Files with Valid Value: {debugInfo.filesWithValidValue}</Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Individual File Analysis:</h4>
              {debugInfo.analysis.map((file: any) => (
                <div key={file.index} className="border rounded p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>File {file.index + 1}:</strong> {file.fileName || 'No Name'}
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => testApiCall(file.rawFileObject)}
                      disabled={!file.hasValueProperty || file.valueIsNull}
                    >
                      Test API Call
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Has Name: {file.hasNameProperty ? '✅' : '❌'}</div>
                    <div>Has Value: {file.hasValueProperty ? '✅' : '❌'}</div>
                    <div>Value is NULL: {file.valueIsNull ? '❌' : '✅'}</div>
                    <div>Value Type: {file.valueType}</div>
                  </div>
                  
                  <div className="text-sm">
                    <div><strong>Name:</strong> {JSON.stringify(file.nameValue)}</div>
                    <div><strong>Value:</strong> {JSON.stringify(file.valueValue)}</div>
                    <div><strong>All Properties:</strong> {file.allProperties.join(', ')}</div>
                  </div>
                  
                  <details className="text-xs">
                    <summary>Raw File Object</summary>
                    <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
                      {JSON.stringify(file.rawFileObject, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Raw API Data</CardTitle>
        </CardHeader>
        <CardContent>
          <details>
            <summary>Full Workflow Summary Data</summary>
            <pre className="mt-2 p-2 bg-muted rounded overflow-auto text-xs">
              {JSON.stringify(rawApiData, null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileLocationDebugger;