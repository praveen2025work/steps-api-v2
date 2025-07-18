import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Eye, 
  Download, 
  Upload, 
  FileText, 
  FileSpreadsheet, 
  File, 
  Loader2, 
  X,
  AlertCircle,
  Database
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useExcelData } from '@/hooks/useExcelData';

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
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [loadingPreview, setLoadingPreview] = useState<string | null>(null);

  // Use Excel data hook for the selected file
  const { data: excelData, loading: excelLoading, error: excelError } = useExcelData({
    location: selectedFile?.location || null,
    name: null, // Always send name as null as per requirement
    autoFetch: previewMode && !!selectedFile
  });

  // Get file icon based on type
  const getFileIcon = (fileName: string, paramType: 'upload' | 'download') => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    if (['xlsx', 'xls', 'csv'].includes(extension)) {
      return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
    } else if (['txt', 'log', 'json', 'xml'].includes(extension)) {
      return <FileText className="h-4 w-4 text-blue-600" />;
    } else {
      return <File className="h-4 w-4 text-gray-600" />;
    }
  };

  // Handle file preview
  const handlePreview = async (file: FileItem) => {
    console.log('[EnhancedFileViewer] Preview clicked for file:', {
      fileName: file.name,
      location: file.location,
      paramType: file.param_Type,
      processId,
      processName
    });

    setLoadingPreview(file.id);
    
    try {
      // Set selected file and enable preview mode
      setSelectedFile(file);
      setPreviewMode(true);
    } catch (error) {
      console.error('Error initiating preview:', error);
    } finally {
      setLoadingPreview(null);
    }
  };

  // Handle file upload
  const handleUpload = (file: FileItem) => {
    console.log('[EnhancedFileViewer] Upload clicked for file:', file);
    onFileUpload?.(file);
  };

  // Handle file download
  const handleDownload = (file: FileItem) => {
    console.log('[EnhancedFileViewer] Download clicked for file:', file);
    onFileDownload?.(file);
  };

  // Close preview
  const closePreview = () => {
    setSelectedFile(null);
    setPreviewMode(false);
  };

  // Render file preview content
  const renderPreviewContent = () => {
    if (!selectedFile) return null;

    const isExcelFile = ['xlsx', 'xls', 'csv'].includes(
      selectedFile.name.split('.').pop()?.toLowerCase() || ''
    );

    if (isExcelFile && excelData) {
      // Find the first sheet with data to set as default
      const firstDataSheet = excelData.sheets.find(sheet => 
        !(sheet.data.length === 1 && sheet.data[0][0] === "NO DATA FOUND")
      );
      const defaultSheetName = firstDataSheet?.name || excelData.sheets[0]?.name;

      return (
        <div className="space-y-4">
          <Tabs defaultValue={defaultSheetName} className="w-full">
            {/* Horizontal sheet cards instead of vertical tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
              {excelData.sheets.map((sheet) => {
                const isEmpty = sheet.data.length === 1 && sheet.data[0][0] === "NO DATA FOUND";
                return (
                  <TabsTrigger 
                    key={sheet.name} 
                    value={sheet.name}
                    className="flex-shrink-0 px-4 py-2 rounded-lg border bg-card hover:bg-accent transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <div className="flex items-center gap-2">
                      <span className="whitespace-nowrap font-medium">{sheet.name}</span>
                      {isEmpty ? (
                        <Badge variant="secondary" className="h-4 px-1 text-xs">
                          No Data
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="h-4 px-1 text-xs">
                          {sheet.data.length - 1} rows
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                );
              })}
            </div>
            
            {excelData.sheets.map((sheet) => (
              <TabsContent key={sheet.name} value={sheet.name} className="mt-0">
                {sheet.data.length === 1 && sheet.data[0][0] === "NO DATA FOUND" ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Database className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No data available</p>
                    <p className="text-sm">This sheet contains no data to display</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Show record count at the top */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Showing {sheet.data.length - 1} records</span>
                      <span>Sheet: {sheet.name}</span>
                    </div>
                    <ScrollArea className="w-full h-96 border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {sheet.data[0]?.map((header, index) => (
                              <TableHead key={index} className="whitespace-nowrap font-semibold bg-muted/50">
                                {header || `Column ${index + 1}`}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sheet.data.slice(1).map((row, rowIndex) => (
                            <TableRow key={rowIndex} className="hover:bg-muted/30">
                              {sheet.data[0]?.map((_, colIndex) => (
                                <TableCell key={colIndex} className="whitespace-nowrap">
                                  {row[colIndex] || ''}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Preview not available</p>
          <p className="text-sm">This file type cannot be previewed</p>
        </div>
      );
    }
  };

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

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Files - {processName}
            </div>
            <Badge variant="outline">{files.length} files</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {files.map((file) => (
              <div 
                key={file.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(file.name, file.param_Type)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{file.name}</h4>
                      <Badge 
                        variant={file.param_Type === 'upload' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {file.param_Type === 'upload' ? (
                          <>
                            <Upload className="h-3 w-3 mr-1" />
                            Upload
                          </>
                        ) : (
                          <>
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </>
                        )}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{file.size}</span>
                      <Separator orientation="vertical" className="h-4" />
                      <span>{file.type.toUpperCase()}</span>
                      {file.updatedAt && (
                        <>
                          <Separator orientation="vertical" className="h-4" />
                          <span>Updated: {file.updatedAt}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Preview Button */}
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handlePreview(file)}
                    disabled={loadingPreview === file.id}
                    title="Preview file"
                  >
                    {loadingPreview === file.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  
                  {/* Upload Button - Only for upload type files in IN PROGRESS processes */}
                  {file.param_Type === 'upload' && file.processStatus === 'IN PROGRESS' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleUpload(file)}
                      title="Upload file"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Upload
                    </Button>
                  )}
                  
                  {/* Download Button - Always available for download type files */}
                  {file.param_Type === 'download' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDownload(file)}
                      title="Download file"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* File Preview Panel */}
      {previewMode && selectedFile && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getFileIcon(selectedFile.name, selectedFile.param_Type)}
                <CardTitle className="text-lg">
                  Preview: {selectedFile.name}
                </CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={closePreview}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground break-all">
              Location: {selectedFile.location}
            </div>
          </CardHeader>
          <CardContent>
            {excelLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>Loading file data...</span>
              </div>
            ) : excelError && !excelData ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load file data: {excelError}
                </AlertDescription>
              </Alert>
            ) : (
              renderPreviewContent()
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedFileViewer;