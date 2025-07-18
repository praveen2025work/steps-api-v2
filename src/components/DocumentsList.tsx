import React, { useState } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  FilePdf, 
  Download, 
  Upload, 
  Eye, 
  FileCode, 
  Mail, 
  Archive,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AdvancedFilePreview from './files/AdvancedFilePreview';
import SimpleExcelViewer from './files/SimpleExcelViewer';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  updatedAt: string;
  updatedBy: string;
  category?: 'download' | 'upload';
  subStage?: string;
  location?: string; // Location path for API calls (resolved from fileData.value)
  excelData?: any; // For storing Excel data from Java API
  isExcelFile?: boolean; // Flag to indicate if this is an Excel file
}

interface DocumentsListProps {
  documents: Document[];
  onPreview?: (document: Document) => void;
}

// Helper function to get file icon based on file type
export const getFileIcon = (type: string, fileName: string) => {
  // Check file extension
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'xlsx':
    case 'xls':
    case 'csv':
      return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    case 'pdf':
      return <FileText className="h-5 w-5 text-red-600" />;
    case 'html':
    case 'css':
      return <FileCode className="h-5 w-5 text-purple-600" />;
    case 'msg':
      return <Mail className="h-5 w-5 text-blue-600" />;
    case 'zip':
      return <Archive className="h-5 w-5 text-amber-600" />;
    default:
      return <FileText className="h-5 w-5 text-blue-600" />;
  }
};

const DocumentsList: React.FC<DocumentsListProps> = ({ documents, onPreview }) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [previewFile, setPreviewFile] = useState<Document | null>(null);
  
  const handleDownload = (documentId: string) => {
    // In a real application, this would trigger a download
    console.log(`Downloading document ${documentId}`);
  };

  const handleUpload = (documentId: string) => {
    // In a real application, this would trigger an upload
    console.log(`Uploading document ${documentId}`);
  };

  const handlePreview = async (document: Document) => {
    console.log(`Previewing document ${document.id}`);
    
    // Check if this is an Excel/CSV file that should use the Java endpoint
    const isExcelFile = /\.(xlsx?|csv)$/i.test(document.name) || 
                       document.name.toLowerCase().includes('excel') ||
                       document.name.toLowerCase().includes('spreadsheet');
    
    if (isExcelFile) {
      // For Excel files, use the Java endpoint with location from document.location (resolved value)
      try {
        const locationToUse = document.location || document.name; // Fallback to name if location not available
        
        console.log('Making Java API call for Excel file:', {
          location: locationToUse,
          name: null,
          documentInfo: {
            id: document.id,
            name: document.name,
            hasLocation: !!document.location
          }
        });
        
        // Call the Java API endpoint using environment variable
        const baseUrl = process.env.NEXT_PUBLIC_JAVA_BASE_URL;
        if (!baseUrl) {
          throw new Error('NEXT_PUBLIC_JAVA_BASE_URL environment variable is not set');
        }
        
        const response = await fetch(`${baseUrl}/api/process/data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            location: locationToUse, // Use resolved location path from fileData.value
            name: null // Set name to null as requested
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const excelData = await response.json();
        console.log('Excel data received from Java API:', excelData);
        
        // Create a custom document object for Excel preview
        const excelDocument = {
          ...document,
          excelData: excelData,
          isExcelFile: true
        };
        
        // If an external preview handler is provided, call it with Excel data
        if (onPreview) {
          onPreview(excelDocument);
        } else {
          // Set the preview file with Excel data
          setPreviewFile(excelDocument);
        }
        
      } catch (error) {
        console.error('Error fetching Excel data from Java API:', error);
        
        // Fall back to regular preview on error
        if (!onPreview) {
          setPreviewFile(document);
        }
        
        if (onPreview) {
          onPreview(document);
        }
      }
    } else {
      // For non-Excel files, use regular preview
      // Only set the preview file if no external handler is provided
      // This prevents double-preview when used in WorkflowDetailView
      if (!onPreview) {
        setPreviewFile(document);
      }
      
      // If an external preview handler is provided, call it
      if (onPreview) {
        onPreview(document);
      }
    }
  };
  
  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  const downloadDocuments = documents.filter(doc => doc.category === 'download' || !doc.category);
  const uploadDocuments = documents.filter(doc => doc.category === 'upload');
  const displayDocuments = activeTab === 'all' 
    ? documents 
    : activeTab === 'download' 
      ? downloadDocuments 
      : uploadDocuments;

  return (
    <>
      <div className="space-y-4">
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Documents ({documents.length})</TabsTrigger>
            <TabsTrigger value="download">Download ({downloadDocuments.length})</TabsTrigger>
            <TabsTrigger value="upload">Upload ({uploadDocuments.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <DocumentsListGrid 
              documents={displayDocuments} 
              onDownload={handleDownload} 
              onUpload={handleUpload} 
              onPreview={handlePreview} 
            />
          </TabsContent>
          
          <TabsContent value="download" className="mt-4">
            <DocumentsListGrid 
              documents={displayDocuments} 
              onDownload={handleDownload} 
              onUpload={handleUpload} 
              onPreview={handlePreview} 
            />
          </TabsContent>
          
          <TabsContent value="upload" className="mt-4">
            <DocumentsListGrid 
              documents={displayDocuments} 
              onDownload={handleDownload} 
              onUpload={handleUpload} 
              onPreview={handlePreview} 
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {previewFile && (
        <AdvancedFilePreview
          fileId={previewFile.id}
          fileName={previewFile.name}
          onClose={handleClosePreview}
        />
      )}
    </>
  );
};

interface DocumentsListGridProps {
  documents: Document[];
  onDownload: (id: string) => void;
  onUpload: (id: string) => void;
  onPreview: (document: Document) => void;
}

export const DocumentsListGrid: React.FC<DocumentsListGridProps> = ({ documents, onDownload, onUpload, onPreview }) => {
  const [loadingPreview, setLoadingPreview] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showExcelViewer, setShowExcelViewer] = useState<boolean>(false);

  if (documents.length === 0) {
    return <p className="text-muted-foreground">No documents found.</p>;
  }

  // Handle custom preview icon click
  const handleCustomPreview = async (document: Document) => {
    setLoadingPreview(document.id);
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_JAVA_BASE_URL;
      if (!baseUrl) {
        throw new Error('NEXT_PUBLIC_JAVA_BASE_URL environment variable is not set');
      }
      
      const locationToUse = document.location || document.name;
      
      console.log('Making custom preview API call:', {
        url: `${baseUrl}/api/process/data`,
        location: locationToUse,
        name: null
      });
      
      const response = await fetch(`${baseUrl}/api/process/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: locationToUse,
          name: null
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Custom preview data received:', data);
      
      // Check if data contains sheets with "NO DATA FOUND"
      const hasNoData = data.sheets?.every((sheet: any) => 
        sheet.data?.length === 1 && 
        sheet.data[0]?.length === 2 && 
        sheet.data[0][0] === "NO DATA FOUND" && 
        sheet.data[0][1] === null
      );
      
      if (hasNoData) {
        // Show friendly message for no data
        setPreviewData({
          fileName: data.fileName || document.name,
          sheets: [],
          noDataMessage: "No preview available."
        });
      } else {
        setPreviewData(data);
      }
      
      setShowExcelViewer(true);
      
      // Also call the external preview handler if provided
      if (onPreview) {
        const enhancedDocument = {
          ...document,
          excelData: data,
          isExcelFile: true
        };
        onPreview(enhancedDocument);
      }
      
    } catch (error) {
      console.error('Error fetching custom preview data:', error);
      
      // Show error message
      setPreviewData({
        fileName: document.name,
        sheets: [],
        errorMessage: `Failed to load preview: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      setShowExcelViewer(true);
      
    } finally {
      setLoadingPreview(null);
    }
  };

  const handleCloseExcelViewer = () => {
    setShowExcelViewer(false);
    setPreviewData(null);
  };

  return (
    <>
      <div className="space-y-4">
        {documents.map((document) => (
          <div 
            key={document.id} 
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              {getFileIcon(document.type, document.name)}
              <div className="flex items-center gap-2">
                {/* Custom Preview Icon - Eye emoji */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-muted"
                        onClick={() => handleCustomPreview(document)}
                        disabled={loadingPreview === document.id}
                      >
                        {loadingPreview === document.id ? (
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
                
                <div>
                  <p className="font-medium">{document.name}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-muted-foreground">{document.size}</span>
                    <span className="text-xs text-muted-foreground">Updated: {document.updatedAt}</span>
                    <span className="text-xs text-muted-foreground">By: {document.updatedBy}</span>
                    {document.subStage && (
                      <Badge variant="outline" className="text-xs">{document.subStage}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onPreview(document)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {(() => {
                        const extension = document.name.split('.').pop()?.toLowerCase();
                        switch (extension) {
                          case 'xlsx':
                          case 'xls':
                            return 'View Excel document';
                          case 'pdf':
                            return 'View PDF document';
                          case 'html':
                            return 'View HTML document';
                          case 'css':
                            return 'View CSS code';
                          case 'msg':
                            return 'View email message';
                          case 'zip':
                            return 'View archive contents';
                          default:
                            return 'Preview document';
                        }
                      })()}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => document.category === 'upload' ? onUpload(document.id) : onDownload(document.id)}
                    >
                      {document.category === 'upload' ? (
                        <>
                          <Upload className="h-4 w-4 mr-1" />
                          Upload
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{document.category === 'upload' ? 'Upload document' : 'Download document'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ))}
      </div>

      {/* Excel Data Viewer Modal */}
      {showExcelViewer && previewData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">File Preview</h2>
              <Button variant="ghost" size="sm" onClick={handleCloseExcelViewer}>
                ✕
              </Button>
            </div>
            <div className="overflow-auto max-h-[calc(90vh-80px)]">
              {previewData.errorMessage ? (
                <div className="p-6 text-center">
                  <div className="text-red-500 mb-2">⚠️</div>
                  <p className="text-muted-foreground">{previewData.errorMessage}</p>
                </div>
              ) : previewData.noDataMessage ? (
                <div className="p-6 text-center">
                  <div className="text-muted-foreground mb-2">📄</div>
                  <p className="text-muted-foreground">{previewData.noDataMessage}</p>
                </div>
              ) : (
                <SimpleExcelViewer 
                  data={previewData}
                  className="border-0 shadow-none"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentsList;