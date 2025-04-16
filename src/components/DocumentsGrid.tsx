import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileText, FileSpreadsheet, FileImage, FileArchive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Document {
  id: string;
  name: string;
  size: string;
  type: 'document' | 'spreadsheet' | 'image' | 'archive' | 'other';
  status: 'uploaded' | 'downloaded' | 'pending';
  uploadedAt?: string;
  uploadedBy?: string;
  downloadUrl?: string;
}

interface DocumentsGridProps {
  documents: Document[];
  onDownload?: (document: Document) => void;
  onUpload?: (document: Document) => void;
}

const DocumentsGrid: React.FC<DocumentsGridProps> = ({ documents, onDownload, onUpload }) => {
  const getFileIcon = (type: Document['type']) => {
    switch (type) {
      case 'document':
        return <FileText className="h-6 w-6" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="h-6 w-6" />;
      case 'image':
        return <FileImage className="h-6 w-6" />;
      case 'archive':
        return <FileArchive className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  const getStatusBadge = (status: Document['status']) => {
    switch (status) {
      case 'uploaded':
        return <Badge variant="default" className="bg-green-500">Uploaded</Badge>;
      case 'downloaded':
        return <Badge variant="default" className="bg-blue-500">Downloaded</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:bg-accent/5 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(doc.type)}
                      <div>
                        <h3 className="font-medium text-sm truncate max-w-[200px]">{doc.name}</h3>
                        <p className="text-xs text-muted-foreground">{doc.size}</p>
                      </div>
                    </div>
                    {getStatusBadge(doc.status)}
                  </div>
                  
                  {doc.uploadedAt && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <p>Uploaded: {doc.uploadedAt}</p>
                      {doc.uploadedBy && <p>By: {doc.uploadedBy}</p>}
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end gap-2">
                    {doc.status === 'uploaded' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => onDownload?.(doc)}
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </Button>
                    )}
                    {doc.status === 'downloaded' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => onUpload?.(doc)}
                      >
                        <Upload className="h-4 w-4" />
                        <span>Upload</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsGrid; 