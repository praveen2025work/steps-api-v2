import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Download, 
  Upload, 
  FileText, 
  FileSpreadsheet, 
  File, 
  Loader2, 
  AlertCircle,
  Database,
  Expand,
  Shrink
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useExcelData } from '@/hooks/useExcelData';
import { DataGrid } from './DataGrid';
import { ColumnDef } from '@tanstack/react-table';
import { cn } from '@/lib/utils';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  location: string;
  param_Type: 'upload' | 'download';
  processStatus: 'IN PROGRESS' | 'COMPLETED' | 'NOT STARTED' | 'FAILED';
  updatedAt?: string;
  updatedBy?: string;
}

interface EnhancedFileViewerProps {
  files: FileItem[];
  processName: string;
  processId: string;
  onFileUpload?: (file: FileItem) => void;
  onFileDownload?: (file: FileItem) => void;
  className?: string;
}

const EnhancedFileViewer: React.FC<EnhancedFileViewerProps> = ({
  files,
  processName,
  processId,
  onFileUpload,
  onFileDownload,
  className = ""
}) => {
  const [activeFileId, setActiveFileId] = useState<string | null>(files.length > 0 ? files[0].id : null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeFile = useMemo(() => {
    if (!activeFileId) return null;
    return files.find(f => f.id === activeFileId) || null;
  }, [files, activeFileId]);

  const { data: excelData, loading: excelLoading, error: excelError } = useExcelData({
    location: activeFile?.location || null,
    name: null,
    autoFetch: !!activeFile,
  });

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    if (['xlsx', 'xls', 'csv'].includes(extension)) {
      return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
    } else if (['txt', 'log', 'json', 'xml'].includes(extension)) {
      return <FileText className="h-4 w-4 text-blue-600" />;
    } else {
      return <File className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleUpload = useCallback((file: FileItem) => {
    onFileUpload?.(file);
  }, [onFileUpload]);

  const handleDownload = useCallback((file: FileItem) => {
    onFileDownload?.(file);
  }, [onFileDownload]);

  const renderGridForSheet = useCallback((sheetData: any[]) => {
    if (!sheetData || sheetData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Database className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm">This sheet contains no data to display.</p>
        </div>
      );
    }

    let headers: string[];
    let dataRows: any[];

    if (Array.isArray(sheetData[0])) {
      headers = sheetData[0].map((header: any, index: number) => 
        header != null ? String(header) : `Column_${index + 1}`
      );
      dataRows = sheetData.slice(1);
    } else {
      headers = Object.keys(sheetData[0]);
      dataRows = sheetData;
    }

    const data = dataRows.map((row: any) => {
      if (Array.isArray(row)) {
        return headers.reduce((obj, header, index) => {
          obj[header] = row[index] != null ? String(row[index]) : '';
          return obj;
        }, {} as Record<string, any>);
      }
      return row;
    });

    const columns: ColumnDef<any>[] = headers.map((header: string, index: number) => ({
      accessorKey: header,
      header: header,
      id: header || `column_${index}`,
    }));

    return <DataGrid columns={columns} data={data} />;
  }, []);

  const previewContent = useMemo(() => {
    if (!activeFile) return null;

    const fileExtension = activeFile.name.split('.').pop()?.toLowerCase() || '';
    const isSupported = ['xlsx', 'xls', 'csv'].includes(fileExtension);

    if (!isSupported || !excelData) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <FileText className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Preview not available</p>
          <p className="text-sm">This file type cannot be previewed or data is empty.</p>
        </div>
      );
    }

    if (fileExtension === 'csv' && Array.isArray(excelData)) {
      return renderGridForSheet(excelData);
    }

    if (['xlsx', 'xls'].includes(fileExtension) && excelData.sheets) {
      const firstDataSheet = excelData.sheets.find(sheet => 
        !(sheet.data.length === 1 && sheet.data[0][0] === "NO DATA FOUND")
      );
      const defaultSheetName = firstDataSheet?.name || excelData.sheets[0]?.name;

      return (
        <Tabs defaultValue={defaultSheetName} className="w-full flex flex-col h-full">
          <TabsList className="flex-shrink-0">
            {excelData.sheets.map((sheet) => (
              <TabsTrigger key={sheet.name} value={sheet.name}>{sheet.name}</TabsTrigger>
            ))}
          </TabsList>
          {excelData.sheets.map((sheet) => (
            <TabsContent key={sheet.name} value={sheet.name} className="flex-grow mt-2 h-full">
              {renderGridForSheet(sheet.data)}
            </TabsContent>
          ))}
        </Tabs>
      );
    }

    return null;
  }, [activeFile, excelData, renderGridForSheet]);

  const filePreviewPanel = (
    <div className={cn(
      "flex flex-col h-full bg-card border rounded-lg",
      isFullscreen && "fixed inset-0 z-50"
    )}>
      <div className="flex items-center justify-between p-2 border-b flex-shrink-0">
        {activeFile && (
          <div className="flex items-center gap-3 min-w-0">
            {getFileIcon(activeFile.name)}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{activeFile.name}</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{activeFile.size}</span>
                <Separator orientation="vertical" className="h-4" />
                <span>{activeFile.type.toUpperCase()}</span>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          {activeFile?.param_Type === 'upload' && activeFile.processStatus === 'IN PROGRESS' && (
            <Button size="sm" variant="outline" onClick={() => handleUpload(activeFile)} title="Upload file">
              <Upload className="h-4 w-4 mr-1" /> Upload
            </Button>
          )}
          {activeFile?.param_Type === 'download' && (
            <Button size="sm" variant="outline" onClick={() => handleDownload(activeFile)} title="Download file">
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)} title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
            {isFullscreen ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="flex-grow relative">
        <ScrollArea className="absolute inset-0">
          <div className="p-4">
            {excelLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>Loading file data...</span>
              </div>
            ) : excelError && !excelData ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Failed to load file data: {excelError}</AlertDescription>
              </Alert>
            ) : (
              previewContent
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );

  if (files.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No files found</p>
            <p className="text-sm">No files available for process: {processName}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isFullscreen) {
    return filePreviewPanel;
  }

  return (
    <Card className={cn("h-[700px] flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            <span>Files - {processName}</span>
          </div>
          <Badge variant="outline">{files.length} files</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-0">
        <Tabs
          value={activeFileId || ""}
          onValueChange={setActiveFileId}
          className="flex-grow flex flex-col"
        >
          <div className="px-6 pt-4 border-b">
            <ScrollArea orientation="horizontal" className="pb-2">
              <TabsList>
                {files.map((file) => (
                  <TabsTrigger key={file.id} value={file.id} className="flex-shrink-0">
                    <div className="flex items-center">
                      {getFileIcon(file.name)}
                      <span className="ml-2 truncate">{file.name}</span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
          <div className="flex-grow p-6 h-0">
            {activeFile && (
              <TabsContent value={activeFileId || ""} className="mt-0 h-full">
                {filePreviewPanel}
              </TabsContent>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedFileViewer;