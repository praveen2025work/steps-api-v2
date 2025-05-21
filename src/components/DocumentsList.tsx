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
  Archive 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AdvancedFilePreview from './files/AdvancedFilePreview';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  updatedAt: string;
  updatedBy: string;
  category?: 'download' | 'upload';
  subStage?: string;
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

  const handlePreview = (document: Document) => {
    console.log(`Previewing document ${document.id}`);
    setPreviewFile(document);
    
    // If an external preview handler is provided, call it too
    if (onPreview) {
      onPreview(document);
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
  if (documents.length === 0) {
    return <p className="text-muted-foreground">No documents found.</p>;
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <div 
          key={document.id} 
          className="flex items-center justify-between p-3 border rounded-lg"
        >
          <div className="flex items-center gap-3">
            {getFileIcon(document.type, document.name)}
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
  );
};

export default DocumentsList;