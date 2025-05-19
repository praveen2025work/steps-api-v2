import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye, Download, Upload, FileText, FileArchive, FileImage } from 'lucide-react'
import { FileUpload } from './FileUpload'

interface File {
  id: string
  name: string
  type: string
  size: string
  uploadedBy?: string
  uploadedAt?: string
  downloadCount?: number
  lastDownloaded?: string
}

interface FileListProps {
  processId: string
  fileType: 'upload' | 'download'
  selectedFile: string | null
  onFileSelect: (fileId: string) => void
  onPreviewRequest: () => void
}

// Mock data - would be replaced with API calls
const getMockFiles = (processId: string, fileType: 'upload' | 'download'): File[] => {
  if (fileType === 'upload') {
    return [
      { id: `${processId}-up-001`, name: 'market_data.csv', type: 'csv', size: '2.3 MB', uploadedBy: 'John Doe', uploadedAt: '2025-05-18 14:30' },
      { id: `${processId}-up-002`, name: 'positions.xlsx', type: 'xlsx', size: '1.7 MB', uploadedBy: 'Jane Smith', uploadedAt: '2025-05-18 15:45' },
      { id: `${processId}-up-003`, name: 'config.json', type: 'json', size: '45 KB', uploadedBy: 'Mike Johnson', uploadedAt: '2025-05-17 09:15' },
    ]
  } else {
    return [
      { id: `${processId}-down-001`, name: 'daily_report.pdf', type: 'pdf', size: '3.1 MB', downloadCount: 5, lastDownloaded: '2025-05-18 16:20' },
      { id: `${processId}-down-002`, name: 'summary.xlsx', type: 'xlsx', size: '890 KB', downloadCount: 12, lastDownloaded: '2025-05-18 17:30' },
      { id: `${processId}-down-003`, name: 'audit_log.txt', type: 'txt', size: '120 KB', downloadCount: 3, lastDownloaded: '2025-05-17 11:45' },
    ]
  }
}

const getFileIcon = (fileType: string) => {
  switch (fileType.toLowerCase()) {
    case 'pdf':
    case 'txt':
    case 'doc':
    case 'docx':
      return <FileText className="h-5 w-5" />
    case 'zip':
    case 'rar':
      return <FileArchive className="h-5 w-5" />
    case 'jpg':
    case 'png':
    case 'gif':
      return <FileImage className="h-5 w-5" />
    default:
      return <FileText className="h-5 w-5" />
  }
}

export function FileList({ processId, fileType, selectedFile, onFileSelect, onPreviewRequest }: FileListProps) {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  useEffect(() => {
    // Simulate API call
    setLoading(true)
    setTimeout(() => {
      const mockFiles = getMockFiles(processId, fileType)
      setFiles(mockFiles)
      setLoading(false)
    }, 500)
  }, [processId, fileType])

  const handleFileSelect = (fileId: string) => {
    onFileSelect(fileId)
  }

  const handleFileAction = (fileId: string, action: 'preview' | 'download' | 'upload') => {
    if (action === 'preview') {
      onFileSelect(fileId)
      onPreviewRequest()
    } else if (action === 'download') {
      // Handle download logic
      console.log(`Downloading file: ${fileId}`)
    } else if (action === 'upload') {
      setIsUploadDialogOpen(true)
    }
  }

  const handleUploadComplete = () => {
    // Refresh the file list
    setLoading(true)
    setTimeout(() => {
      const mockFiles = getMockFiles(processId, fileType)
      // Add a new mock file to simulate upload
      if (fileType === 'upload') {
        const newFile = {
          id: `${processId}-up-${Date.now()}`,
          name: 'new_upload.xlsx',
          type: 'xlsx',
          size: '1.2 MB',
          uploadedBy: 'Current User',
          uploadedAt: new Date().toLocaleString()
        }
        setFiles([newFile, ...mockFiles])
      } else {
        setFiles(mockFiles)
      }
      setLoading(false)
    }, 500)
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading files...</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{fileType === 'upload' ? 'Upload Files' : 'Download Files'}</CardTitle>
        {fileType === 'upload' && (
          <Button size="sm" onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload New File
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No files available for this process.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                {fileType === 'upload' ? (
                  <>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Uploaded At</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>Download Count</TableHead>
                    <TableHead>Last Downloaded</TableHead>
                  </>
                )}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow 
                  key={file.id} 
                  className={selectedFile === file.id ? 'bg-muted/50' : ''}
                  onClick={() => handleFileSelect(file.id)}
                >
                  <TableCell className="font-medium flex items-center gap-2">
                    {getFileIcon(file.type)}
                    {file.name}
                  </TableCell>
                  <TableCell>{file.type.toUpperCase()}</TableCell>
                  <TableCell>{file.size}</TableCell>
                  {fileType === 'upload' ? (
                    <>
                      <TableCell>{file.uploadedBy}</TableCell>
                      <TableCell>{file.uploadedAt}</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{file.downloadCount}</TableCell>
                      <TableCell>{file.lastDownloaded}</TableCell>
                    </>
                  )}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFileAction(file.id, 'preview')
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {fileType === 'download' && (
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFileAction(file.id, 'download')
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      
      {/* File Upload Dialog */}
      <FileUpload 
        processId={processId}
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
    </Card>
  )
}