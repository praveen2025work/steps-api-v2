import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, X, Loader2 } from 'lucide-react'

interface FilePreviewProps {
  fileId: string
  processId: string
  fileType: 'upload' | 'download'
  onClose: () => void
}

interface FileDetails {
  id: string
  name: string
  type: string
  size: string
  content: string
  metadata: Record<string, string>
}

// Mock API call - would be replaced with actual API
const fetchFileDetails = async (fileId: string): Promise<FileDetails> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Mock response based on file extension
  const fileIdParts = fileId.split('-')
  const fileType = fileIdParts[fileIdParts.length - 2] // up or down
  const fileNumber = fileIdParts[fileIdParts.length - 1] // 001, 002, etc.
  
  let mockFile: FileDetails = {
    id: fileId,
    name: '',
    type: '',
    size: '',
    content: '',
    metadata: {}
  }
  
  if (fileType === 'up') {
    if (fileNumber === '001') {
      mockFile = {
        id: fileId,
        name: 'market_data.csv',
        type: 'csv',
        size: '2.3 MB',
        content: 'Date,Symbol,Open,High,Low,Close,Volume\n2025-05-18,AAPL,185.23,187.45,184.90,186.75,12345678\n2025-05-18,MSFT,390.12,395.67,389.45,394.20,9876543\n2025-05-18,GOOGL,175.34,177.89,174.56,177.23,5432167',
        metadata: {
          'Uploaded By': 'John Doe',
          'Uploaded At': '2025-05-18 14:30',
          'Content Type': 'text/csv',
          'Row Count': '1000',
          'Process': 'Market Data Import'
        }
      }
    } else if (fileNumber === '002') {
      mockFile = {
        id: fileId,
        name: 'positions.xlsx',
        type: 'xlsx',
        size: '1.7 MB',
        content: '[Excel content preview not available]',
        metadata: {
          'Uploaded By': 'Jane Smith',
          'Uploaded At': '2025-05-18 15:45',
          'Content Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Sheets': '3',
          'Process': 'Position Reconciliation'
        }
      }
    } else {
      mockFile = {
        id: fileId,
        name: 'config.json',
        type: 'json',
        size: '45 KB',
        content: '{\n  "processId": "proc-001",\n  "settings": {\n    "timeout": 300,\n    "retryCount": 3,\n    "logLevel": "info"\n  },\n  "connections": [\n    {\n      "name": "database",\n      "type": "postgresql",\n      "host": "db.example.com"\n    }\n  ]\n}',
        metadata: {
          'Uploaded By': 'Mike Johnson',
          'Uploaded At': '2025-05-17 09:15',
          'Content Type': 'application/json',
          'Process': 'System Configuration'
        }
      }
    }
  } else { // download files
    if (fileNumber === '001') {
      mockFile = {
        id: fileId,
        name: 'daily_report.pdf',
        type: 'pdf',
        size: '3.1 MB',
        content: '[PDF content preview not available]',
        metadata: {
          'Generated At': '2025-05-18 16:00',
          'Download Count': '5',
          'Last Downloaded': '2025-05-18 16:20',
          'Content Type': 'application/pdf',
          'Process': 'Daily Reporting'
        }
      }
    } else if (fileNumber === '002') {
      mockFile = {
        id: fileId,
        name: 'summary.xlsx',
        type: 'xlsx',
        size: '890 KB',
        content: '[Excel content preview not available]',
        metadata: {
          'Generated At': '2025-05-18 17:00',
          'Download Count': '12',
          'Last Downloaded': '2025-05-18 17:30',
          'Content Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Process': 'Summary Report'
        }
      }
    } else {
      mockFile = {
        id: fileId,
        name: 'audit_log.txt',
        type: 'txt',
        size: '120 KB',
        content: '2025-05-17 09:00:00 INFO Process started\n2025-05-17 09:01:23 INFO Data import completed\n2025-05-17 09:02:45 WARNING Missing values detected in row 127\n2025-05-17 09:03:12 INFO Calculation completed\n2025-05-17 09:04:30 INFO Report generation started\n2025-05-17 09:05:15 INFO Report generation completed\n2025-05-17 09:05:16 INFO Process completed successfully',
        metadata: {
          'Generated At': '2025-05-17 11:30',
          'Download Count': '3',
          'Last Downloaded': '2025-05-17 11:45',
          'Content Type': 'text/plain',
          'Process': 'Audit Logging'
        }
      }
    }
  }
  
  return mockFile
}

export function FilePreview({ fileId, processId, fileType, onClose }: FilePreviewProps) {
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('preview')
  
  useEffect(() => {
    const loadFileDetails = async () => {
      setLoading(true)
      try {
        const details = await fetchFileDetails(fileId)
        setFileDetails(details)
      } catch (error) {
        console.error('Error loading file details:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadFileDetails()
  }, [fileId])
  
  const handleDownload = () => {
    // Handle download logic
    console.log(`Downloading file: ${fileId}`)
    // In a real implementation, this would trigger a download
  }
  
  const renderPreviewContent = () => {
    if (!fileDetails) return null
    
    const { type, content } = fileDetails
    
    switch (type.toLowerCase()) {
      case 'csv':
      case 'txt':
      case 'json':
        return (
          <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] text-sm">
            {content}
          </pre>
        )
      case 'pdf':
        return (
          <div className="bg-muted p-4 rounded-md text-center">
            <p className="mb-4">PDF preview not available in this view.</p>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download to View
            </Button>
          </div>
        )
      case 'xlsx':
      case 'xls':
        return (
          <div className="bg-muted p-4 rounded-md text-center">
            <p className="mb-4">Excel preview not available in this view.</p>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download to View
            </Button>
          </div>
        )
      default:
        return (
          <div className="bg-muted p-4 rounded-md text-center">
            <p>Preview not available for this file type.</p>
          </div>
        )
    }
  }
  
  const renderMetadata = () => {
    if (!fileDetails) return null
    
    return (
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(fileDetails.metadata).map(([key, value]) => (
          <div key={key} className="border-b pb-2">
            <p className="text-sm font-medium text-muted-foreground">{key}</p>
            <p>{value}</p>
          </div>
        ))}
      </div>
    )
  }
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {loading ? 'Loading file...' : fileDetails?.name}
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading file preview...</span>
          </div>
        ) : (
          <Tabs defaultValue="preview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="py-4">
              {renderPreviewContent()}
            </TabsContent>
            
            <TabsContent value="metadata" className="py-4">
              {renderMetadata()}
            </TabsContent>
          </Tabs>
        )}
        
        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}