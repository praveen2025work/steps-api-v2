import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, ExternalLink, Download, Eye, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ExcelDataViewer from './ExcelDataViewer';

interface FileDataItem {
  item: string; // This contains the "value" property that can be used as location
  fileName?: string;
  fileType?: string;
  size?: string;
  lastModified?: string;
  [key: string]: any;
}

interface FileDataIntegrationProps {
  fileData: FileDataItem[];
  selectedFileIndex?: number;
  onFileSelect?: (index: number) => void;
  className?: string;
  showPreviewByDefault?: boolean; // New prop to control default preview behavior
}

const FileDataIntegration: React.FC<FileDataIntegrationProps> = ({
  fileData,
  selectedFileIndex,
  onFileSelect,
  className = "",
  showPreviewByDefault = false // Default to false - no auto-preview
}) => {
  const [showPreview, setShowPreview] = useState<boolean>(showPreviewByDefault);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  
  // Extract location from fileData item
  const getLocationFromItem = (item: FileDataItem): string => {
    try {
      // First try to parse the item string to extract the "value" property
      const parsed = JSON.parse(item.item);
      // Return the value even if it's null - this is important for the API call
      return parsed.value;
    } catch {
      // If parsing fails, check if the item itself has a value property (direct API data)
      if (item && typeof item === 'object' && 'value' in item) {
        return (item as any).value;
      }
      // If no valid location found, return null to indicate no valid location
      return null;
    }
  };

  // Check if file is Excel-compatible
  const isExcelFile = (item: FileDataItem): boolean => {
    const location = getLocationFromItem(item);
    const fileName = item.fileName || location;
    return /\.(xlsx?|csv)$/i.test(fileName) || 
           fileName.toLowerCase().includes('excel') ||
           fileName.toLowerCase().includes('spreadsheet');
  };

  // Get Excel-compatible files
  const excelFiles = fileData.filter(isExcelFile);

  if (excelFiles.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <FileSpreadsheet className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No Excel files found</p>
            <p className="text-sm">No compatible Excel/CSV files in the current file data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedFile = selectedFileIndex !== undefined ? excelFiles[selectedFileIndex] : excelFiles[0];
  const selectedLocation = selectedFile ? getLocationFromItem(selectedFile) : '';

  // Handle preview button click
  const handlePreviewClick = async () => {
    if (!selectedLocation) return;
    
    setLoadingPreview(true);
    try {
      // Just show the preview - the ExcelDataViewer will handle the API call
      setShowPreview(true);
    } catch (error) {
      console.error('Error initiating preview:', error);
    } finally {
      setLoadingPreview(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File List with Preview Icons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <FileSpreadsheet className="h-5 w-5 mr-2" />
            Excel Files ({excelFiles.length})
          </CardTitle>
          <CardDescription>
            Click the preview icon (👁️) to view file contents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {excelFiles.map((file, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors ${
                  selectedFileIndex === index ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileSpreadsheet className="h-5 w-5 text-green-600 flex-shrink-0" />
                  
                  {/* Single Preview Icon - Eye emoji */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="h-6 w-6 p-0 hover:bg-muted flex-shrink-0"
                          onClick={async () => {
                            // Select this file first
                            onFileSelect?.(index);
                            
                            // Get the location for this specific file
                            const location = getLocationFromItem(file);
                            
                            console.log('[FileDataIntegration] Preview button clicked:', {
                              fileIndex: index,
                              fileName: file.fileName,
                              location: location,
                              hasLocation: location !== null && location !== undefined,
                              fileItem: file.item,
                              fileObject: file,
                              parsedItem: (() => {
                                try {
                                  return JSON.parse(file.item);
                                } catch {
                                  return 'Failed to parse';
                                }
                              })(),
                              directValueAccess: file.value,
                              locationExtractionMethod: 'getLocationFromItem',
                              locationResult: location
                            });
                            
                            // Set loading state
                            setLoadingPreview(true);
                            
                            try {
                              // Show preview which will trigger the API call in ExcelDataViewer
                              setShowPreview(true);
                            } catch (error) {
                              console.error('Error initiating preview:', error);
                            } finally {
                              setLoadingPreview(false);
                            }
                          }}
                          disabled={loadingPreview}
                        >
                          {loadingPreview && selectedFileIndex === index ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <span className="text-sm">👁️</span>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Preview file data</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">
                      {file.fileName || `File ${index + 1}`}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {getLocationFromItem(file)}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {file.fileType || 'Excel'}
                      </Badge>
                      {file.size && (
                        <Badge variant="outline" className="text-xs">
                          {file.size}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download file</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Excel Data Viewer - Only shown when preview is requested */}
      {showPreview && selectedLocation && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">
                    File Preview: {selectedFile?.fileName || 'Excel File'}
                  </CardTitle>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowPreview(false)}
                >
                  Close Preview
                </Button>
              </div>
              <CardDescription className="break-all">
                Location: {selectedLocation}
              </CardDescription>
            </CardHeader>
          </Card>
          
          <ExcelDataViewer 
            location={selectedLocation}
            name={selectedFile?.fileName || null}
          />
        </div>
      )}
    </div>
  );
};

export default FileDataIntegration;