import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, BarChart2, Brain, Table as TableIcon, Maximize2, Minimize2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FileData {
  id: string;
  name: string;
  sheets: {
    [key: string]: {
      headers: string[];
      rows: any[][];
    }
  };
}

interface AdvancedFilePreviewProps {
  fileId: string;
  fileName: string;
  onClose: () => void;
}

const AdvancedFilePreview: React.FC<AdvancedFilePreviewProps> = ({
  fileId,
  fileName,
  onClose
}) => {
  const [activeSection, setActiveSection] = useState<'data' | 'pivot' | 'ai'>('data');
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  useEffect(() => {
    const fetchFileData = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would be an API call
        // For now, we'll simulate a response with mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockData: FileData = {
          id: fileId,
          name: fileName,
          sheets: {
            'Sheet1': {
              headers: ['Date', 'Region', 'Product', 'Sales', 'Profit'],
              rows: [
                ['2023-01-01', 'North', 'Widget A', 1200, 240],
                ['2023-01-02', 'South', 'Widget B', 950, 190],
                ['2023-01-03', 'East', 'Widget A', 1100, 220],
                ['2023-01-04', 'West', 'Widget C', 1300, 260],
                ['2023-01-05', 'North', 'Widget B', 1000, 200],
              ]
            },
            'Details': {
              headers: ['Property', 'Value', 'Description'],
              rows: [
                ['File Type', 'Excel', 'Microsoft Excel Spreadsheet'],
                ['Created Date', '2023-01-15', 'Date the file was created'],
                ['Modified Date', '2023-05-10', 'Last modification date'],
                ['Owner', 'John Smith', 'File owner'],
                ['Size', '256 KB', 'File size in kilobytes'],
              ]
            },
            'Logs': {
              headers: ['Timestamp', 'User', 'Action', 'Details'],
              rows: [
                ['2023-05-10 14:32:45', 'jsmith', 'EDIT', 'Updated sales figures'],
                ['2023-05-09 11:15:22', 'agarcia', 'VIEW', 'Viewed file contents'],
                ['2023-05-08 09:45:11', 'jsmith', 'EDIT', 'Added new product data'],
                ['2023-05-07 16:20:33', 'bwilson', 'VIEW', 'Viewed file contents'],
                ['2023-05-06 10:05:17', 'jsmith', 'CREATE', 'Created initial file'],
              ]
            }
          }
        };
        
        setFileData(mockData);
        setActiveSheet(Object.keys(mockData.sheets)[0]);
      } catch (error) {
        console.error('Error fetching file data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileData();
  }, [fileId, fileName]);

  const handleRunAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAiAnalysis(`
        ## File Analysis: ${fileName}
        
        ### Key Insights
        - Sales are trending upward in the North and West regions
        - Widget A is the top-performing product by volume
        - Profit margins are consistent across products (approximately 20%)
        
        ### Recommendations
        1. Increase marketing efforts in the South region to boost sales
        2. Consider expanding the Widget A product line given its popularity
        3. Investigate opportunities to improve profit margins across all products
        
        ### Anomalies Detected
        - No significant anomalies detected in the current dataset
      `);
    } catch (error) {
      console.error('Error running AI analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderDataSection = () => {
    if (!fileData || !activeSheet) return <div>No data available</div>;
    
    const sheetData = fileData.sheets[activeSheet];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {Object.keys(fileData.sheets).map(sheetName => (
            <Button
              key={sheetName}
              variant={activeSheet === sheetName ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveSheet(sheetName)}
            >
              {sheetName}
            </Button>
          ))}
        </div>
        
        <ScrollArea className="h-[calc(100vh-300px)]">
          <Table>
            <TableHeader>
              <TableRow>
                {sheetData.headers.map((header, index) => (
                  <TableHead key={index}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sheetData.rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    );
  };

  const renderPivotSection = () => {
    return (
      <div className="space-y-4">
        <div className="bg-muted p-4 rounded-md text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <BarChart2 className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">Pivot Table View</h3>
            <p className="text-sm text-muted-foreground">
              Interactive pivot table functionality would be implemented here, allowing users to:
            </p>
            <ul className="text-sm text-muted-foreground text-left list-disc pl-6">
              <li>Select dimensions for rows and columns</li>
              <li>Choose measures to aggregate</li>
              <li>Apply filters to the dataset</li>
              <li>Sort and format the results</li>
            </ul>
          </div>
        </div>
        
        {/* Mockup of a pivot table */}
        <div className="border rounded-md">
          <div className="p-2 bg-muted flex justify-between items-center">
            <div className="flex space-x-2">
              <Badge>Rows: Region</Badge>
              <Badge>Columns: Product</Badge>
              <Badge>Values: Sum of Sales</Badge>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Region / Product</TableHead>
                <TableHead>Widget A</TableHead>
                <TableHead>Widget B</TableHead>
                <TableHead>Widget C</TableHead>
                <TableHead>Grand Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">North</TableCell>
                <TableCell>1,200</TableCell>
                <TableCell>1,000</TableCell>
                <TableCell>0</TableCell>
                <TableCell>2,200</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">South</TableCell>
                <TableCell>0</TableCell>
                <TableCell>950</TableCell>
                <TableCell>0</TableCell>
                <TableCell>950</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">East</TableCell>
                <TableCell>1,100</TableCell>
                <TableCell>0</TableCell>
                <TableCell>0</TableCell>
                <TableCell>1,100</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">West</TableCell>
                <TableCell>0</TableCell>
                <TableCell>0</TableCell>
                <TableCell>1,300</TableCell>
                <TableCell>1,300</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Grand Total</TableCell>
                <TableCell>2,300</TableCell>
                <TableCell>1,950</TableCell>
                <TableCell>1,300</TableCell>
                <TableCell>5,550</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const renderAISection = () => {
    return (
      <div className="space-y-4">
        {!aiAnalysis && !isAnalyzing ? (
          <div className="bg-muted p-8 rounded-md text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Brain className="h-16 w-16 text-muted-foreground" />
              <h3 className="text-xl font-medium">AI Analysis</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Generate insights, detect patterns, and receive recommendations based on the file data.
              </p>
              <Button onClick={handleRunAIAnalysis}>
                Run AI Analysis
              </Button>
            </div>
          </div>
        ) : isAnalyzing ? (
          <div className="bg-muted p-8 rounded-md text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-pulse">
                <Brain className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-xl font-medium">Analyzing Data...</h3>
              <p className="text-muted-foreground">
                Our AI is examining patterns and generating insights from your file.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between">
              <h3 className="text-xl font-medium">AI Analysis Results</h3>
              <Button variant="outline" size="sm" onClick={() => setAiAnalysis(null)}>
                Reset
              </Button>
            </div>
            <div className="prose max-w-none dark:prose-invert">
              {aiAnalysis?.split('\n').map((line, index) => {
                if (line.startsWith('##')) {
                  return <h2 key={index}>{line.replace('##', '').trim()}</h2>;
                } else if (line.startsWith('###')) {
                  return <h3 key={index}>{line.replace('###', '').trim()}</h3>;
                } else if (line.startsWith('-')) {
                  return <li key={index}>{line.replace('-', '').trim()}</li>;
                } else if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) {
                  return <div key={index}>{line}</div>;
                } else if (line.trim() === '') {
                  return <br key={index} />;
                } else {
                  return <p key={index}>{line}</p>;
                }
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="w-[90%] max-w-4xl">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Loading Preview: {fileName}</CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[60vh] flex items-center justify-center">
              <div className="animate-pulse text-center">
                <div className="h-12 w-12 rounded-full bg-muted mx-auto mb-4"></div>
                <div className="h-4 w-48 bg-muted rounded mx-auto"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className={`${isFullscreen ? 'fixed inset-0 bg-background z-50' : 'relative w-full'}`}
    >
      <Card className={`${isFullscreen ? 'h-screen rounded-none' : 'w-full'}`}>
        <CardHeader className="pb-2 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-xl">{fileName}</CardTitle>
              <Badge variant="outline">{fileId}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? 
                  <Minimize2 className="h-4 w-4" /> : 
                  <Maximize2 className="h-4 w-4" />
                }
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <div className="p-4">
          <Tabs 
            defaultValue="data" 
            value={activeSection}
            onValueChange={(value) => setActiveSection(value as 'data' | 'pivot' | 'ai')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="data" className="flex items-center space-x-2">
                <TableIcon className="h-4 w-4" />
                <span>Data</span>
              </TabsTrigger>
              <TabsTrigger value="pivot" className="flex items-center space-x-2">
                <BarChart2 className="h-4 w-4" />
                <span>Pivot Table</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>AI Analysis</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="data" className="mt-0">
              {renderDataSection()}
            </TabsContent>
            
            <TabsContent value="pivot" className="mt-0">
              {renderPivotSection()}
            </TabsContent>
            
            <TabsContent value="ai" className="mt-0">
              {renderAISection()}
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default AdvancedFilePreview;