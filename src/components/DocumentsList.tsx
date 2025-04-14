import React from 'react';
import { Document } from '@/data/mockWorkflows';
import { FileText, Download, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DocumentsListProps {
  documents?: Document[];
}

const DocumentsList: React.FC<DocumentsListProps> = ({ documents }) => {
  if (!documents || documents.length === 0) {
    return <p className="text-sm text-muted-foreground">No documents attached</p>;
  }

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'excel':
        return <FileText className="h-8 w-8 text-green-600" />;
      case 'word':
        return <FileText className="h-8 w-8 text-blue-600" />;
      case 'image':
        return <FileText className="h-8 w-8 text-purple-500" />;
      default:
        return <FileText className="h-8 w-8 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Documents</h4>
      <div className="space-y-2">
        {documents.map((document) => (
          <div 
            key={document.id} 
            className="p-3 border rounded-md bg-background/50 flex items-center gap-3"
          >
            {getFileIcon(document.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{document.name}</span>
                {document.required && (
                  <Badge variant="outline" className="text-xs">Required</Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{document.uploadedBy}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{document.uploadedAt}</span>
                </div>
                <span>{document.size}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto">
              <Download className="h-4 w-4" />
              <span className="sr-only">Download</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentsList;