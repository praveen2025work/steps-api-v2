import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  PanelLeft, 
  PanelRight, 
  Download, 
  Upload, 
  Eye, 
  FileText, 
  Search,
  Filter,
  Settings,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useExcelData } from '@/hooks/useExcelData';

interface EnhancedWorkflowFilePreviewProps {
  files: any[];
  processName: string;
  processId: string;
  onFileUpload: (file: any) => void;
  onFileDownload: (file: any) => void;
  onClose: () => void;
  showLeftPanel?: boolean;
  showRightPanel?: boolean;
  onToggleLeftPanel?: () => void;
  onToggleRightPanel?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const EnhancedWorkflowFilePreview: React.FC<EnhancedWorkflowFilePreviewProps> = ({
  files,
  processName,
  processId,
  onFileUpload,
  onFileDownload,
  onClose,
  showLeftPanel = true,
  showRightPanel = false,
  onToggleLeftPanel,
  onToggleRightPanel,
  isFullscreen = false,
  onToggleFullscreen
}) => {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [fileStates, setFileStates] = useState<Record<number, any>>({});
  
  const activeFile = files[activeFileIndex];
  
  // Use the Excel data hook for file preview
  const { 
    data: excelData, 
    loading: excelLoading, 
    error: excelError, 
    fetchData: fetchExcelData 
  } = useExcelData();

  // Load file data when active file changes
  useEffect(() => {
    if (activeFile && activeFile.location) {
      console.log('[EnhancedWorkflowFilePreview] Loading file data:', {
        fileName: activeFile.name,
        location: activeFile.location
      });
      
      fetchExcelData(activeFile.location, null);
    }
  }, [activeFile, fetchExcelData]);

  // Save file state when switching files
  const saveFileState = (fileIndex: number, state: any) => {
    setFileStates(prev => ({
      ...prev,
      [fileIndex]: state
    }));
  };

  // Get file state
  const getFileState = (fileIndex: number) => {
    return fileStates[fileIndex] || {};
  };

  // Handle file tab change
  const handleFileChange = (newIndex: number) => {
    // Save current file state
    if (activeFileIndex !== newIndex) {
      saveFileState(activeFileIndex, {
        scrollPosition: window.scrollY,
        // Add other state as needed
      });
    }
    
    setActiveFileIndex(newIndex);
    
    // Restore file state
    const savedState = getFileState(newIndex);
    if (savedState.scrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, savedState.scrollPosition);
      }, 100);
    }
  };

  // Get file icon based on type
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'xlsx':
      case 'xls':
        return '📊';
      case 'csv':
        return '📋';
      case 'pdf':
        return '📄';
      case 'txt':
        return '📝';
      case 'json':
        return '🔧';
      default:
        return '📁';
    }
  };

  // Render file content based on type
  const renderFileContent = () => {
    if (!activeFile) return null;

    if (excelLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading file data...</p>
          </div>
        </div>
      );
    }

    if (excelError) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-sm text-destructive mb-2">Error loading file</p>
            <p className="text-xs text-muted-foreground">{excelError}</p>
          </div>
        </div>
      );
    }

    if (excelData && excelData.length > 0) {
      // Find the first sheet with actual data
      const dataSheet = excelData.find(sheet => 
        sheet.data && sheet.data.length > 0 && 
        !sheet.name.toLowerCase().includes('no data')
      ) || excelData[0];

      return (
        <div className="space-y-4">
          {/* Sheet tabs - horizontal cards */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {excelData.map((sheet, index) => {
              const hasData = sheet.data && sheet.data.length > 0 && 
                            !sheet.name.toLowerCase().includes('no data');
              const recordCount = hasData ? sheet.data.length - 1 : 0; // Subtract header row
              
              return (
                <Card 
                  key={index} 
                  className={`min-w-[200px] cursor-pointer transition-all ${
                    sheet === dataSheet ? 'ring-2 ring-primary' : 'hover:shadow-md'
                  }`}
                  onClick={() => {
                    // Switch to this sheet (you could implement sheet switching here)
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{sheet.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {hasData ? `${recordCount} records` : 'No data'}
                        </p>
                      </div>
                      <Badge variant={hasData ? 'default' : 'secondary'} className="text-xs">
                        {hasData ? recordCount : 'Empty'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Active sheet data */}
          {dataSheet && dataSheet.data && dataSheet.data.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  {dataSheet.name} - {dataSheet.data.length - 1} records
                </h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-1" />
                    Search
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    Filter
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="h-[400px] w-full border rounded-md">
                <div className="p-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {dataSheet.data[0]?.map((header: string, index: number) => (
                          <th key={index} className="text-left p-2 font-medium bg-muted/50">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dataSheet.data.slice(1).map((row: any[], rowIndex: number) => (
                        <tr key={rowIndex} className="border-b hover:bg-muted/30">
                          {row.map((cell: any, cellIndex: number) => (
                            <td key={cellIndex} className="p-2">
                              {cell?.toString() || ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No preview available</p>
          <p className="text-xs text-muted-foreground mt-1">
            File: {activeFile.name}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      {/* Left Panel - Sub-stage cards */}
      {showLeftPanel && (
        <div className="w-80 border-r bg-muted/20 flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-medium text-sm">Process Context</h3>
            <p className="text-xs text-muted-foreground">{processName}</p>
            <p className="text-xs text-muted-foreground font-mono">{processId}</p>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Sub-stage cards would be rendered here in a compact view
              </p>
              {/* This would contain the sub-stage cards in a compact format */}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header with controls */}
        <div className="border-b bg-background p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* File tabs */}
              <div className="flex items-center gap-1">
                {files.map((file, index) => (
                  <Button
                    key={index}
                    variant={index === activeFileIndex ? 'default' : 'ghost'}
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => handleFileChange(index)}
                  >
                    <span>{getFileIcon(file.name)}</span>
                    <span className="max-w-[120px] truncate">{file.name}</span>
                    {file.param_Type === 'upload' && (
                      <Badge variant="secondary" className="text-xs">Upload</Badge>
                    )}
                  </Button>
                ))}
              </div>
              
              {/* Navigation arrows for many files */}
              {files.length > 3 && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={activeFileIndex === 0}
                    onClick={() => handleFileChange(Math.max(0, activeFileIndex - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={activeFileIndex === files.length - 1}
                    onClick={() => handleFileChange(Math.min(files.length - 1, activeFileIndex + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Control buttons */}
            <div className="flex items-center gap-2">
              {onToggleLeftPanel && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onToggleLeftPanel}
                  title={showLeftPanel ? "Hide left panel" : "Show left panel"}
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
              )}
              
              {onToggleRightPanel && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onToggleRightPanel}
                  title={showRightPanel ? "Hide right panel" : "Show right panel"}
                >
                  <PanelRight className="h-4 w-4" />
                </Button>
              )}
              
              {onToggleFullscreen && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onToggleFullscreen}
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              )}
              
              <Separator orientation="vertical" className="h-6" />
              
              {activeFile && (
                <>
                  {activeFile.param_Type === 'upload' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onFileUpload(activeFile)}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Upload
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onFileDownload(activeFile)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* File content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {renderFileContent()}
          </div>
        </div>
      </div>

      {/* Right Panel - Query options, metadata, etc. */}
      {showRightPanel && (
        <div className="w-80 border-l bg-muted/20 flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-medium text-sm">File Tools</h3>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Query Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Search className="h-4 w-4 mr-2" />
                    Search Data
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter Rows
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {activeFile && (
                    <>
                      <div>
                        <span className="text-muted-foreground">Name:</span>
                        <p className="font-mono">{activeFile.name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Size:</span>
                        <p>{activeFile.size}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <p>{activeFile.param_Type}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Updated:</span>
                        <p>{activeFile.updatedAt}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Export Options
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <MoreVertical className="h-4 w-4 mr-2" />
                    More Actions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default EnhancedWorkflowFilePreview;