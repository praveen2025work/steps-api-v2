import React, { useState } from 'react';
import { HierarchyLevel } from '@/data/hierarchicalWorkflowData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SubStagesList from './SubStagesList';
import DocumentsList from './DocumentsList';

interface HierarchyLevelDetailProps {
  level: HierarchyLevel | null;
  onBack: () => void;
}

const HierarchyLevelDetail: React.FC<HierarchyLevelDetailProps> = ({ 
  level, 
  onBack 
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  if (!level) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-40">
            <p className="text-muted-foreground">Select a workflow level to view details</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Determine level type label
  const getLevelTypeLabel = () => {
    switch (level.level) {
      case 0:
        return 'Application';
      case 1:
        return 'Asset Class';
      case 2:
        return 'Workflow Level 2';
      case 3:
        return 'Workflow Level 3';
      case 4:
        return 'Workflow Level 4';
      default:
        return `Workflow Level ${level.level}`;
    }
  };
  
  // Determine status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'in-progress':
        return 'bg-blue-500 text-white';
      case 'rejected':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };
  
  // Mock data for the detail view
  const mockMetrics = [
    { label: 'Tasks Completed', value: `${Math.round(level.progress / 10)}/${Math.round(10)}`, icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
    { label: 'Average Duration', value: '45 minutes', icon: <Clock className="h-4 w-4 text-blue-500" /> },
    { label: 'Issues', value: '2', icon: <AlertCircle className="h-4 w-4 text-red-500" /> }
  ];

  // Mock data for sub-stages with enhanced properties
  const mockSubStages = [
    { 
      id: 'sub-1', 
      name: 'Data Collection', 
      status: 'completed', 
      progress: 100,
      sequence: 1,
      message: 'Data collection completed successfully',
      processId: 'PROC-001',
      updatedBy: 'John Doe',
      lockedBy: 'System',
      duration: 15,
      type: 'auto',
      avgDuration: 12,
      avgStartTime: '06:00 AM',
      dependencies: [
        { name: 'Market Data Load', status: 'completed' }
      ],
      fileInfo: [
        { name: 'market_data.xlsx', type: 'Input' },
        { name: 'collection_log.txt', type: 'Log' }
      ],
      config: {
        canTrigger: true,
        canRerun: true,
        canForceStart: false,
        canSkip: false,
        canSendEmail: true
      }
    },
    { 
      id: 'sub-2', 
      name: 'Validation', 
      status: 'completed', 
      progress: 100,
      sequence: 2,
      message: 'All validation checks passed',
      processId: 'PROC-002',
      updatedBy: 'System',
      duration: 8,
      type: 'auto',
      avgDuration: 10,
      avgStartTime: '06:15 AM',
      dependencies: [
        { name: 'Data Collection', status: 'completed' }
      ],
      fileInfo: [
        { name: 'validation_report.pdf', type: 'Output' }
      ],
      config: {
        canTrigger: true,
        canRerun: true,
        canForceStart: true,
        canSkip: false,
        canSendEmail: true
      }
    },
    { 
      id: 'sub-3', 
      name: 'Processing', 
      status: 'in-progress', 
      progress: 60,
      sequence: 3,
      message: 'Processing data batch 6/10',
      processId: 'PROC-003',
      updatedBy: 'System',
      lockedBy: 'System',
      duration: 22,
      type: 'auto',
      avgDuration: 25,
      avgStartTime: '06:25 AM',
      dependencies: [
        { name: 'Validation', status: 'completed' }
      ],
      config: {
        canTrigger: false,
        canRerun: false,
        canForceStart: true,
        canSkip: true,
        canSendEmail: true
      }
    },
    { 
      id: 'sub-4', 
      name: 'Review', 
      status: 'not-started', 
      progress: 0,
      sequence: 4,
      processId: 'PROC-004',
      type: 'manual',
      avgDuration: 30,
      avgStartTime: '07:00 AM',
      expectedUser: 'Jane Smith',
      dependencies: [
        { name: 'Processing', status: 'in-progress' }
      ],
      config: {
        canTrigger: false,
        canRerun: false,
        canForceStart: false,
        canSkip: false,
        canSendEmail: true
      }
    }
  ];

  // Mock data for documents
  const mockDocuments = [
    { 
      id: 'doc-1', 
      name: 'input_data.xlsx', 
      type: 'excel', 
      size: '2.4 MB', 
      updatedAt: '2025-04-14 02:30', 
      updatedBy: 'John Doe',
      category: 'download',
      subStage: 'Data Collection'
    },
    { 
      id: 'doc-2', 
      name: 'validation_report.pdf', 
      type: 'pdf', 
      size: '1.2 MB', 
      updatedAt: '2025-04-14 02:45', 
      updatedBy: 'System',
      category: 'download',
      subStage: 'Validation'
    },
    { 
      id: 'doc-3', 
      name: 'process_log.txt', 
      type: 'text', 
      size: '450 KB', 
      updatedAt: '2025-04-14 03:00', 
      updatedBy: 'System',
      category: 'download',
      subStage: 'Processing'
    },
    { 
      id: 'doc-4', 
      name: 'corrections.xlsx', 
      type: 'excel', 
      size: '1.8 MB', 
      updatedAt: '2025-04-14 03:15', 
      updatedBy: 'Jane Smith',
      category: 'upload',
      subStage: 'Review'
    },
    { 
      id: 'doc-5', 
      name: 'approval_form.pdf', 
      type: 'pdf', 
      size: '500 KB', 
      updatedAt: '2025-04-14 03:30', 
      updatedBy: 'Mike Johnson',
      category: 'upload',
      subStage: 'Review'
    }
  ];

  // Mock data for parameters
  const mockParameters = {
    app: [
      { name: 'APP_TIMEOUT', value: '3600', description: 'Application timeout in seconds' },
      { name: 'MAX_RETRIES', value: '3', description: 'Maximum number of retries' },
      { name: 'BATCH_SIZE', value: '100', description: 'Number of records to process in a batch' },
      { name: 'NOTIFICATION_ENABLED', value: 'true', description: 'Enable email notifications' },
    ],
    global: [
      { name: 'ENV', value: 'PRODUCTION', description: 'Environment' },
      { name: 'LOG_LEVEL', value: 'INFO', description: 'Logging level' },
      { name: 'REGION', value: 'US-EAST', description: 'Processing region' },
      { name: 'DATA_RETENTION_DAYS', value: '90', description: 'Number of days to retain data' },
    ],
    workflow: [
      { name: 'WORKFLOW_ID', value: 'WF-12345', description: 'Unique workflow identifier' },
      { name: 'PRIORITY', value: 'HIGH', description: 'Workflow priority' },
      { name: 'MAX_RUNTIME', value: '120', description: 'Maximum runtime in minutes' },
    ]
  };

  // Mock data for audit info
  const mockAuditInfo = [
    { action: 'Process Started', timestamp: '2025-04-14 06:45', user: 'System' },
    { action: 'Manual Intervention', timestamp: '2025-04-14 07:15', user: 'John Doe' },
    { action: 'Process Resumed', timestamp: '2025-04-14 07:20', user: 'John Doe' },
  ];
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>{level.name}</CardTitle>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline">{getLevelTypeLabel()}</Badge>
          <Badge className={getStatusColor(level.status)}>{level.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks & Sub-Stages</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="audit">Audit Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Progress</h3>
                <div className="flex items-center gap-2">
                  <Progress value={level.progress} className="h-2 flex-1" />
                  <span className="text-sm font-medium">{level.progress}%</span>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-3">Metrics</h3>
                <div className="grid grid-cols-3 gap-4">
                  {mockMetrics.map((metric, index) => (
                    <div key={index} className="flex flex-col items-center p-3 bg-accent/50 rounded-md">
                      <div className="flex items-center gap-1 mb-1">
                        {metric.icon}
                        <span className="text-xs text-muted-foreground">{metric.label}</span>
                      </div>
                      <span className="text-lg font-semibold">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-3">Recent Activity</h3>
                <div className="space-y-2">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-accent/30 rounded-md">
                      <div>
                        <p className="text-sm font-medium">Task {index + 1} {index === 0 ? 'completed' : index === 1 ? 'in progress' : 'pending'}</p>
                        <p className="text-xs text-muted-foreground">User: {index === 0 ? 'John Doe' : index === 1 ? 'Jane Smith' : 'Unassigned'}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{index === 0 ? '10 min ago' : index === 1 ? '1 hour ago' : 'Scheduled'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tasks">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Tasks & Sub-Stages</h3>
              </div>
              <SubStagesList subStages={mockSubStages} />
            </div>
          </TabsContent>
          
          <TabsContent value="documents">
            <DocumentsList documents={mockDocuments} />
          </TabsContent>
          
          <TabsContent value="parameters">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Application Parameters</h3>
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Value</th>
                        <th className="text-left p-2">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockParameters.app.map((param, index) => (
                        <tr key={index} className={index < mockParameters.app.length - 1 ? "border-b" : ""}>
                          <td className="p-2 font-mono text-sm">{param.name}</td>
                          <td className="p-2 font-mono text-sm">{param.value}</td>
                          <td className="p-2 text-sm text-muted-foreground">{param.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Global Parameters</h3>
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Value</th>
                        <th className="text-left p-2">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockParameters.global.map((param, index) => (
                        <tr key={index} className={index < mockParameters.global.length - 1 ? "border-b" : ""}>
                          <td className="p-2 font-mono text-sm">{param.name}</td>
                          <td className="p-2 font-mono text-sm">{param.value}</td>
                          <td className="p-2 text-sm text-muted-foreground">{param.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Workflow Instance Parameters</h3>
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Value</th>
                        <th className="text-left p-2">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockParameters.workflow.map((param, index) => (
                        <tr key={index} className={index < mockParameters.workflow.length - 1 ? "border-b" : ""}>
                          <td className="p-2 font-mono text-sm">{param.name}</td>
                          <td className="p-2 font-mono text-sm">{param.value}</td>
                          <td className="p-2 text-sm text-muted-foreground">{param.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="audit">
            <div className="border rounded-md">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Action</th>
                    <th className="text-left p-2">Timestamp</th>
                    <th className="text-left p-2">User</th>
                  </tr>
                </thead>
                <tbody>
                  {mockAuditInfo.map((audit, index) => (
                    <tr key={index} className={index < mockAuditInfo.length - 1 ? "border-b" : ""}>
                      <td className="p-2">{audit.action}</td>
                      <td className="p-2 text-sm">{audit.timestamp}</td>
                      <td className="p-2 text-sm">{audit.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default HierarchyLevelDetail;