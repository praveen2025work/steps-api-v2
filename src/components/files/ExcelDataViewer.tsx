import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, FileSpreadsheet, Database } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useExcelData, ExcelSheet } from '@/hooks/useExcelData';

interface ExcelDataViewerProps {
  location: string;
  name?: string | null;
  className?: string;
}

const ExcelDataViewer: React.FC<ExcelDataViewerProps> = ({ 
  location, 
  name = null, 
  className = "" 
}) => {
  const { data, loading, error, isEmptySheet, getNonEmptySheetCount } = useExcelData({
    location,
    name,
    autoFetch: true
  });
  const [activeTab, setActiveTab] = useState<string>('');

  // Set the first sheet as active tab when data loads
  useEffect(() => {
    if (data && data.sheets && data.sheets.length > 0 && !activeTab) {
      setActiveTab(data.sheets[0].name);
    }
  }, [data, activeTab]);

  // Render table for a sheet
  const renderSheetTable = (sheet: ExcelSheet) => {
    if (isEmptySheet(sheet)) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Database className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm">This sheet contains no data to display</p>
        </div>
      );
    }

    const headers = sheet.data[0] || [];
    const rows = sheet.data.slice(1) || [];

    return (
      <ScrollArea className="w-full">
        <div className="min-w-full">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header, index) => (
                  <TableHead 
                    key={index} 
                    className="whitespace-nowrap font-semibold bg-muted/50"
                  >
                    {header || `Column ${index + 1}`}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-muted/30">
                  {headers.map((_, colIndex) => (
                    <TableCell 
                      key={colIndex} 
                      className="whitespace-nowrap"
                    >
                      {row[colIndex] || ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-24" />
              ))}
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load Excel data: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!data || !data.sheets || data.sheets.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FileSpreadsheet className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No Excel data available</p>
            <p className="text-sm">No sheets found in the response</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Excel Data Viewer</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {data.sheets.length} sheet{data.sheets.length !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="outline">
              {getNonEmptySheetCount()} with data
            </Badge>
          </div>
        </div>
        <CardDescription className="text-sm break-all">
          <strong>File:</strong> {data.fileName}
        </CardDescription>
        {error && (
          <Alert className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              API Error (showing mock data): {error}
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-auto overflow-x-auto">
            {data.sheets.map((sheet) => (
              <TabsTrigger 
                key={sheet.name} 
                value={sheet.name}
                className="whitespace-nowrap relative"
              >
                {sheet.name}
                {isEmptySheet(sheet) && (
                  <Badge 
                    variant="secondary" 
                    className="ml-2 h-4 px-1 text-xs"
                  >
                    Empty
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {data.sheets.map((sheet) => (
            <TabsContent key={sheet.name} value={sheet.name} className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{sheet.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    {!isEmptySheet(sheet) && (
                      <>
                        <span>{sheet.data.length - 1} rows</span>
                        <span>•</span>
                        <span>{sheet.maxCols} columns</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  {renderSheetTable(sheet)}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ExcelDataViewer;