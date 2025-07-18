import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, ExternalLink, Download } from 'lucide-react';
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
}

const FileDataIntegration: React.FC<FileDataIntegrationProps> = ({
  fileData,
  selectedFileIndex,
  onFileSelect,
  className = ""
}) => {
  // Extract location from fileData item
  const getLocationFromItem = (item: FileDataItem): string => {
    try {
      // Parse the item string to extract the "value" property
      const parsed = JSON.parse(item.item);
      return parsed.value || item.item;
    } catch {
      // If parsing fails, use the item string directly
      return item.item;
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

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Selection */}
      {excelFiles.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FileSpreadsheet className="h-5 w-5 mr-2" />
              Available Excel Files
            </CardTitle>
            <CardDescription>
              Select an Excel file to view its contents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {excelFiles.map((file, index) => (
                <Card 
                  key={index}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedFileIndex === index ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => onFileSelect?.(index)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">
                          {file.fileName || `File ${index + 1}`}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {getLocationFromItem(file)}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
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
                      <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected File Info */}
      {selectedFile && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">
                  {selectedFile.fileName || 'Selected Excel File'}
                </CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            <CardDescription className="break-all">
              Location: {selectedLocation}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Excel Data Viewer */}
      {selectedLocation && (
        <ExcelDataViewer 
          location={selectedLocation}
          name={selectedFile?.fileName || null}
        />
      )}
    </div>
  );
};

export default FileDataIntegration;