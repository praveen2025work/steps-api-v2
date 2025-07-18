import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ExcelDataViewer from '@/components/files/ExcelDataViewer';
import DashboardLayout from '@/components/DashboardLayout';

const ExcelViewerPage: React.FC = () => {
  const [location, setLocation] = useState<string>('\\\\Intranet.barcapint.com\\DFS-EMEA\\GROUP\\Ldn\\Risk\\PCon\\GCD\\EUROPE\\FAS\\UAT\\FICREDITGCFSASIA\\2025-06-27\\');
  const [name, setName] = useState<string>('');
  const [showViewer, setShowViewer] = useState<boolean>(false);

  const handleLoadData = () => {
    if (location.trim()) {
      setShowViewer(true);
    }
  };

  const handleReset = () => {
    setShowViewer(false);
    setLocation('\\\\Intranet.barcapint.com\\DFS-EMEA\\GROUP\\Ldn\\Risk\\PCon\\GCD\\EUROPE\\FAS\\UAT\\FICREDITGCFSASIA\\2025-06-27\\');
    setName('');
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Excel Data Viewer</h1>
            <p className="text-muted-foreground">
              View Excel/XLSX data from Java API endpoints in a tabbed interface
            </p>
          </div>
        </div>

        <Separator />

        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              Configure the parameters for fetching Excel data from the Java API endpoint
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location (Required)</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter file location path..."
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  The file path or location parameter for the API request
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Name (Optional)</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter optional name parameter..."
                />
                <p className="text-xs text-muted-foreground">
                  Optional name parameter for the API request
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleLoadData} disabled={!location.trim()}>
                Load Excel Data
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">API Endpoint Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Endpoint:</Label>
                <code className="block mt-1 p-2 bg-muted rounded text-sm">
                  POST http://api-java.com/api/process/data
                </code>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Request Body:</Label>
                <pre className="mt-1 p-2 bg-muted rounded text-sm overflow-x-auto">
{`{
  "location": "${location || '<location_value>'}",
  "name": ${name ? `"${name}"` : 'null'}
}`}
                </pre>
              </div>

              <div>
                <Label className="text-sm font-medium">Expected Response Structure:</Label>
                <pre className="mt-1 p-2 bg-muted rounded text-sm overflow-x-auto">
{`{
  "fileName": "string",
  "sheets": [
    {
      "name": "string",
      "data": [
        ["header1", "header2", "..."],
        ["row1col1", "row1col2", "..."],
        ["row2col1", "row2col2", "..."]
      ],
      "maxCols": number
    }
  ]
}`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Excel Data Viewer */}
        {showViewer && (
          <ExcelDataViewer 
            location={location} 
            name={name || null}
            className="w-full"
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ExcelViewerPage;