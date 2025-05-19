import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileList } from './FileList'
import { FilePreview } from './FilePreview'

interface FileManagementProps {
  selectedProcess: string | null
  onProcessSelect: (processId: string) => void
}

// Mock data - would be replaced with API calls
const mockProcesses = [
  { id: 'proc-001', name: 'End of Day Processing' },
  { id: 'proc-002', name: 'Market Data Import' },
  { id: 'proc-003', name: 'Risk Calculation' },
  { id: 'proc-004', name: 'Regulatory Reporting' },
]

export function FileManagement({ selectedProcess, onProcessSelect }: FileManagementProps) {
  const [fileType, setFileType] = useState<'upload' | 'download'>('upload')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  
  // Reset selected file when process or file type changes
  useEffect(() => {
    setSelectedFile(null)
    setIsPreviewOpen(false)
  }, [selectedProcess, fileType])

  const handleProcessChange = (value: string) => {
    onProcessSelect(value)
  }

  const handleFileSelect = (fileId: string) => {
    setSelectedFile(fileId)
  }

  const handlePreviewOpen = () => {
    if (selectedFile) {
      setIsPreviewOpen(true)
    }
  }

  const handlePreviewClose = () => {
    setIsPreviewOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Process Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedProcess || ''} onValueChange={handleProcessChange}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select a process" />
            </SelectTrigger>
            <SelectContent>
              {mockProcesses.map((process) => (
                <SelectItem key={process.id} value={process.id}>
                  {process.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedProcess && (
        <Tabs defaultValue="upload" value={fileType} onValueChange={(value) => setFileType(value as 'upload' | 'download')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="download">Download Files</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <FileList 
              processId={selectedProcess}
              fileType="upload"
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onPreviewRequest={handlePreviewOpen}
            />
          </TabsContent>
          
          <TabsContent value="download">
            <FileList 
              processId={selectedProcess}
              fileType="download"
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onPreviewRequest={handlePreviewOpen}
            />
          </TabsContent>
        </Tabs>
      )}

      {isPreviewOpen && selectedFile && (
        <FilePreview 
          fileId={selectedFile}
          processId={selectedProcess!}
          fileType={fileType}
          onClose={handlePreviewClose}
        />
      )}
    </div>
  )
}