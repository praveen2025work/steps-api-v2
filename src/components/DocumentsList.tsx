import React from 'react';
import { FileText, FileSpreadsheet, FilePdf, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  updatedAt: string;
  updatedBy: string;
}

interface DocumentsListProps {
  documents: Document[];
}

const DocumentsList: React.FC<DocumentsListProps> = ({ documents }) => {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'excel':
        return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
      case 'pdf':
        return <FilePdf className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-blue-600" />;
    }
  };

  const handleDownload = (documentId: string) => {
    // In a real application, this would trigger a download
    console.log(`Downloading document ${documentId}`);
  };

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <div 
          key={document.id} 
          className="flex items-center justify-between p-3 border rounded-lg"
        >
          <div className="flex items-center gap-3">
            {getFileIcon(document.type)}
            <div>
              <p className="font-medium">{document.name}</p>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-xs text-muted-foreground">{document.size}</span>
                <span className="text-xs text-muted-foreground">Updated: {document.updatedAt}</span>
                <span className="text-xs text-muted-foreground">By: {document.updatedBy}</span>
              </div>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleDownload(document.id)}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      ))}
    </div>
  );
};

export default DocumentsList;