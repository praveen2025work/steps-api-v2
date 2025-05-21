import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Eye, RefreshCw, Bot, Sparkles, BarChart, FileText } from 'lucide-react'
import { getFileIcon } from '@/components/DocumentsList'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface FileItem {
  id: string
  name: string
  type: string
  size: string
  category?: 'upload' | 'download' | 'preview'
  updatedAt?: string
  updatedBy?: string
}

interface FileDetails {
  id: string
  name: string
  type: string
  size: string
  content: string
  metadata: Record<string, string>
  aiAnalysis?: {
    summary?: string
    insights?: string[]
    anomalies?: { description: string; confidence: number }[]
    sentiment?: 'positive' | 'negative' | 'neutral'
    entities?: { name: string; type: string; count: number }[]
  }
}

interface EnhancedFilePreviewProps {
  files: FileItem[]
  processId?: string
  onClose: () => void
}

// Mock API call - would be replaced with actual API
const fetchFileDetails = async (fileId: string): Promise<FileDetails> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Mock response based on file extension
  const fileIdParts = fileId.split('-')
  const fileType = fileIdParts[fileIdParts.length - 2] || 'doc' // up or down or doc
  const fileNumber = fileIdParts[fileIdParts.length - 1] || '001' // 001, 002, etc.
  
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
        },
        aiAnalysis: {
          summary: 'This file contains market data for 3 major tech stocks (AAPL, MSFT, GOOGL) for May 18, 2025.',
          insights: [
            'All stocks showed positive movement on this date',
            'MSFT had the highest trading volume',
            'AAPL had the smallest price range (High-Low)'
          ],
          entities: [
            { name: 'AAPL', type: 'stock', count: 1 },
            { name: 'MSFT', type: 'stock', count: 1 },
            { name: 'GOOGL', type: 'stock', count: 1 }
          ]
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
        },
        aiAnalysis: {
          summary: 'This Excel file contains position data across 3 sheets with approximately 500 positions.',
          insights: [
            'Sheet 1 contains equity positions',
            'Sheet 2 contains fixed income positions',
            'Sheet 3 contains derivative positions'
          ],
          anomalies: [
            { description: 'Potential duplicate entries in row 127-129', confidence: 0.85 },
            { description: 'Missing values in column G (Maturity Date)', confidence: 0.92 }
          ]
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
        },
        aiAnalysis: {
          summary: 'Configuration file for process proc-001 with database connection settings.',
          insights: [
            'Process timeout set to 300 seconds',
            'Retry count set to 3',
            'Using PostgreSQL database'
          ]
        }
      }
    }
  } else { // download or doc files
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
        },
        aiAnalysis: {
          summary: 'Daily financial report for May 18, 2025 with performance metrics and risk analysis.',
          insights: [
            'Overall portfolio performance increased by 2.3%',
            'Risk metrics within acceptable thresholds',
            'Three compliance alerts requiring attention'
          ],
          sentiment: 'positive'
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
        },
        aiAnalysis: {
          summary: 'Summary report with key financial metrics across all business units.',
          insights: [
            'EMEA region outperforming other regions by 5.2%',
            'Fixed Income desk showing 3.1% decline',
            'New trading strategy showing promising initial results'
          ],
          anomalies: [
            { description: 'Unusual trading volume in Asian markets', confidence: 0.78 },
            { description: 'Potential reconciliation issue in FX desk', confidence: 0.89 }
          ]
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
        },
        aiAnalysis: {
          summary: 'Audit log for process execution on May 17, 2025, showing successful completion with one warning.',
          insights: [
            'Process completed in approximately 5 minutes',
            'One warning detected regarding missing values',
            'All critical steps completed successfully'
          ],
          anomalies: [
            { description: 'Warning about missing values in row 127', confidence: 0.95 }
          ]
        }
      }
    }
  }
  
  return mockFile
}

export function EnhancedFilePreview({ files, processId, onClose }: EnhancedFilePreviewProps) {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(files.length > 0 ? files[0].id : null)
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('preview')
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false)
  
  useEffect(() => {
    const loadFileDetails = async () => {
      if (!selectedFileId) return
      
      setLoading(true)
      try {
        const details = await fetchFileDetails(selectedFileId)
        setFileDetails(details)
      } catch (error) {
        console.error('Error loading file details:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadFileDetails()
  }, [selectedFileId])
  
  const handleDownload = () => {
    // Handle download logic
    console.log(`Downloading file: ${selectedFileId}`)
    // In a real implementation, this would trigger a download
  }
  
  const handleFileSelect = (fileId: string) => {
    setSelectedFileId(fileId)
  }
  
  const handleRefreshAnalysis = () => {
    setAiAnalysisLoading(true)
    // Simulate AI analysis refresh
    setTimeout(() => {
      setAiAnalysisLoading(false)
    }, 2000)
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
  
  const renderAiAnalysis = () => {
    if (!fileDetails || !fileDetails.aiAnalysis) {
      return (
        <div className="text-center p-4">
          <p>No AI analysis available for this file.</p>
        </div>
      )
    }
    
    const { aiAnalysis } = fileDetails
    
    return (
      <div className="space-y-6">
        {aiAnalysisLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Bot className="h-12 w-12 text-primary animate-pulse mb-4" />
            <p className="text-center text-muted-foreground">Analyzing file content...</p>
            <Progress value={45} className="w-64 mt-4" />
          </div>
        ) : (
          <>
            {aiAnalysis.summary && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-primary" />
                    AI Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{aiAnalysis.summary}</p>
                </CardContent>
              </Card>
            )}
            
            {aiAnalysis.insights && aiAnalysis.insights.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <BarChart className="h-4 w-4 mr-2 text-primary" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {aiAnalysis.insights.map((insight, index) => (
                      <li key={index} className="text-sm flex items-start">
                        <span className="text-primary mr-2">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            
            {aiAnalysis.anomalies && aiAnalysis.anomalies.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    Detected Anomalies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {aiAnalysis.anomalies.map((anomaly, index) => (
                      <li key={index} className="text-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span>{anomaly.description}</span>
                          <Badge variant={anomaly.confidence > 0.8 ? "destructive" : "outline"}>
                            {Math.round(anomaly.confidence * 100)}% confidence
                          </Badge>
                        </div>
                        <Progress value={anomaly.confidence * 100} className="h-1" />
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            
            {aiAnalysis.entities && aiAnalysis.entities.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    Detected Entities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {aiAnalysis.entities.map((entity, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {entity.name}
                        <span className="text-xs text-muted-foreground">({entity.type})</span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={handleRefreshAnalysis}>
                <RefreshCw className="h-3 w-3 mr-2" />
                Refresh Analysis
              </Button>
            </div>
          </>
        )}
      </div>
    )
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* File List Header */}
      <div className="border-b pb-2 mb-4">
        <h3 className="text-lg font-medium mb-3">Available Files</h3>
        <div className="flex flex-wrap gap-2">
          {files.map((file) => (
            <Button
              key={file.id}
              variant={selectedFileId === file.id ? "secondary" : "outline"}
              size="sm"
              className="flex items-center gap-2"
              onClick={() => handleFileSelect(file.id)}
            >
              {getFileIcon(file.type, file.name)}
              <span className="text-xs">{file.name}</span>
            </Button>
          ))}
        </div>
      </div>
      
      {/* File Preview Content */}
      {selectedFileId ? (
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading file preview...</span>
            </div>
          ) : (
            <Tabs defaultValue="preview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
                <TabsTrigger value="ai-analysis" className="flex items-center gap-1">
                  <Bot className="h-3 w-3" />
                  AI Analysis
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="py-4">
                {renderPreviewContent()}
              </TabsContent>
              
              <TabsContent value="metadata" className="py-4">
                {renderMetadata()}
              </TabsContent>
              
              <TabsContent value="ai-analysis" className="py-4">
                {renderAiAnalysis()}
              </TabsContent>
            </Tabs>
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center py-12 text-muted-foreground">
          <p>Select a file to preview</p>
        </div>
      )}
      
      {/* Footer with actions */}
      <div className="border-t mt-4 pt-4 flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Back to Process View
        </Button>
        
        {selectedFileId && (
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        )}
      </div>
    </div>
  )
}