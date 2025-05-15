import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, FileText, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusIcon } from './WorkflowStatusIcons';

interface FileConfigCardProps {
  type: 'upload' | 'download';
  fileName: string;
  fileType: string;
  isValid?: boolean;
  description?: string;
  onEdit?: () => void;
  onRemove?: () => void;
  className?: string;
}

export const FileConfigCard: React.FC<FileConfigCardProps> = ({
  type,
  fileName,
  fileType,
  isValid = true,
  description,
  onEdit,
  onRemove,
  className
}) => {
  return (
    <Card className={cn("overflow-hidden border-l-4", {
      "border-l-sky-500": type === 'upload',
      "border-l-emerald-500": type === 'download'
    }, className)}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={cn("p-2 rounded-md", {
              "bg-sky-50": type === 'upload',
              "bg-emerald-50": type === 'download'
            })}>
              <StatusIcon 
                type={type} 
                size="md" 
              />
            </div>
            <div>
              <div className="font-medium">{fileName}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {fileType}
                </Badge>
                {isValid !== undefined && (
                  isValid ? 
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" /> Valid
                    </Badge> : 
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                      <XCircle className="h-3 w-3 mr-1" /> Invalid
                    </Badge>
                )}
              </div>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
          <div className="flex space-x-1">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
            )}
            {onRemove && (
              <Button variant="ghost" size="sm" onClick={onRemove}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const FileConfigGrid: React.FC<{
  files: FileConfigCardProps[];
  className?: string;
}> = ({ files, className }) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-3", className)}>
      {files.map((file, index) => (
        <FileConfigCard key={index} {...file} />
      ))}
    </div>
  );
};