import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Shrink,
  Eye,
  EyeOff
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
  showSubStagePanel?: boolean;
  onToggleSubStagePanel?: () => void;
  subStageInfo?: {
    name: string;
    processId: string;
    status: string;
    message?: string;
    actions?: React.ReactNode;
  };
}

const EnhancedFileViewer: React.FC<EnhancedFileViewerProps> = ({
  files,
  processName,
  processId,
  onFileUpload,
  onFileDownload: onFileDownloadProp,
  className = "",
  showSubStagePanel = false,
  onToggleSubStagePanel,
  subStageInfo
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

  const handleDownload = useCallback((file: FileItem | 'all') => {
    const download = (item: FileItem) => {
      if (onFileDownloadProp) {
        onFileDownloadProp(item);
      } else {
        const baseUrl = process.env.NEXT_PUBLIC_FILE_API_BASE_URL;
        if (!baseUrl) {
          console.error("NEXT_PUBLIC_FILE_API_BASE_URL is not set.");
          return;
        }
        const url = `${baseUrl}/DownloadNew?id=${processId}&FileName=${item.name}`;
        console.log(`Downloading from URL: ${url}`);
        window.open(url, '_blank');
      }
    };

    if (file === 'all') {
      files.filter(f => f.param_Type === 'download').forEach(download);
    } else {
      download(file);
    }
  }, [files, processId, onFileDownloadProp]);

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

  if (files.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 text-muted-foreground", className)}>
        <FileText className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No files found</p>
        <p className="text-sm">No files available for process: {processName}</p>
      </div>
    );
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            {activeFile && getFileIcon(activeFile.name)}
            <h2 className="text-lg font-semibold">{activeFile?.name}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(false)}>
            <Shrink className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 p-4" style={{ height: 'calc(100vh - 80px)' }}>
          <ScrollArea className="h-full">
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
          </ScrollArea>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col w-full", className)}>
      {/* Sub-stage info bar - only shown when file preview is active and sub-stage info is provided */}
      {subStageInfo && (
        <div className="flex items-center justify-between p-3 bg-muted/40 border-b">
          <div className="flex items-center gap-3">
            <div className={`w-1.5 h-6 rounded-sm ${
              subStageInfo.status === 'completed' ? 'bg-green-500' :
              subStageInfo.status === 'in-progress' ? 'bg-blue-500' :
              subStageInfo.status === 'failed' ? 'bg-red-500' :
              'bg-gray-300'
            }`} />
            <div className="text-sm font-medium">{subStageInfo.name}</div>
            <div className="text-xs text-muted-foreground font-mono">{subStageInfo.processId}</div>
            {subStageInfo.message && (
              <div className="text-xs text-muted-foreground">
                {subStageInfo.message.length > 50 
                  ? `${subStageInfo.message.substring(0, 50)}...` 
                  : subStageInfo.message}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {subStageInfo.actions}
            {onToggleSubStagePanel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSubStagePanel}
                className="h-8 px-2"
              >
                {showSubStagePanel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="ml-1 text-xs">
                  {showSubStagePanel ? 'Hide' : 'Show'} Sub-Stage Panel
                </span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* File preview container with proper sizing and responsive layout */}
      <div className={cn(
        "flex flex-col border rounded-lg bg-card w-full",
        isFullscreen ? "h-full" : "h-[calc(100vh-200px)] max-h-[800px] min-h-[500px]"
      )}>
        <Tabs
          value={activeFileId || ""}
          onValueChange={setActiveFileId}
          className="flex-grow flex flex-col h-full w-full"
        >
          <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2 flex-shrink-0">
            <ScrollArea className="flex-1 mr-4">
              <TabsList className="h-auto p-1 bg-transparent">
                {files.map((file) => (
                  <TabsTrigger 
                    key={file.id} 
                    value={file.id} 
                    className="flex-shrink-0 px-3 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.name)}
                      <span className="truncate max-w-[120px]">{file.name}</span>
                      <Badge 
                        variant={file.param_Type === 'upload' ? 'default' : 'secondary'}
                        className="text-xs ml-1 flex items-center"
                      >
                        {file.param_Type === 'upload' ? 'UP' : <Download className="h-3 w-3" />}
                      </Badge>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {activeFile?.param_Type === 'upload' && activeFile.processStatus === 'IN PROGRESS' && (
                <Button size="sm" variant="outline" onClick={() => handleUpload(activeFile)}>
                  <Upload className="h-4 w-4 mr-1" />
                  Upload
                </Button>
              )}
              {activeFile?.param_Type === 'download' && (
                <Button size="sm" variant="outline" onClick={() => handleDownload(activeFile)}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              )}
              {files.some(f => f.param_Type === 'download') && (
                <Button size="sm" variant="outline" onClick={() => handleDownload('all')}>
                  <Download className="h-4 w-4 mr-1" />
                  All
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(true)}>
                <Expand className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* File preview content with contained scrolling and responsive grid */}
          <div className="flex-1 min-h-0 overflow-hidden w-full p-4">
            {activeFile && (
              <TabsContent value={activeFileId || ""} className="mt-0 h-full w-full">
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
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedFileViewer;