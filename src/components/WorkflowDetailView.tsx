import React, { useState } from 'react';
import WorkflowProgressIndicator from './WorkflowProgressIndicator';
import WorkflowStagesBar from './WorkflowStagesBar';
import WorkflowTaskItem, { WorkflowTask } from './WorkflowTaskItem';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  RefreshCw, 
  FastForward, 
  SkipForward, 
  Mail, 
  FileText, 
  Lock, 
  Unlock, 
  CheckCircle, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import SubStagesList from './SubStagesList';
import DocumentsList from './DocumentsList';

interface WorkflowDetailViewProps {
  workflowTitle: string;
  progressSteps: { name: string; progress: number }[];
  stages: { id: string; name: string }[];
  tasks: Record<string, WorkflowTask[]>; // Map of stageId to tasks
}

const WorkflowDetailView: React.FC<WorkflowDetailViewProps> = ({
  workflowTitle,
  progressSteps,
  stages,
  tasks,
}) => {
  const [activeStage, setActiveStage] = useState<string>(stages[0]?.id || '');
  const [activeTab, setActiveTab] = useState<string>('tasks');

  const handleStageClick = (stageId: string) => {
    setActiveStage(stageId);
  };

  const activeStageTasks = tasks[activeStage] || [];
  const activeStageInfo = stages.find(stage => stage.id === activeStage);

  // Mock data for the additional tabs
  const mockSubStages = [
    { id: 'sub-1', name: 'Data Collection', status: 'completed', progress: 100 },
    { id: 'sub-2', name: 'Validation', status: 'completed', progress: 100 },
    { id: 'sub-3', name: 'Processing', status: 'in-progress', progress: 60 },
    { id: 'sub-4', name: 'Review', status: 'not-started', progress: 0 },
  ];

  const mockDocuments = [
    { id: 'doc-1', name: 'input_data.xlsx', type: 'excel', size: '2.4 MB', updatedAt: '2025-04-14 02:30', updatedBy: 'John Doe' },
    { id: 'doc-2', name: 'validation_report.pdf', type: 'pdf', size: '1.2 MB', updatedAt: '2025-04-14 02:45', updatedBy: 'System' },
    { id: 'doc-3', name: 'process_log.txt', type: 'text', size: '450 KB', updatedAt: '2025-04-14 03:00', updatedBy: 'System' },
  ];

  const mockParameters = {
    app: [
      { name: 'APP_TIMEOUT', value: '3600', description: 'Application timeout in seconds' },
      { name: 'MAX_RETRIES', value: '3', description: 'Maximum number of retries' },
    ],
    global: [
      { name: 'ENV', value: 'PRODUCTION', description: 'Environment' },
      { name: 'LOG_LEVEL', value: 'INFO', description: 'Logging level' },
    ],
    process: [
      { name: 'BATCH_SIZE', value: '1000', description: 'Number of records to process in a batch' },
      { name: 'VALIDATION_THRESHOLD', value: '0.95', description: 'Minimum validation score' },
    ],
  };

  const mockDependencies = [
    { name: 'SOD Roll', status: 'completed', completedAt: '2025-04-14 06:15' },
    { name: 'Market Data Load', status: 'completed', completedAt: '2025-04-14 06:30' },
  ];

  const mockAuditInfo = [
    { action: 'Process Started', timestamp: '2025-04-14 06:45', user: 'System' },
    { action: 'Manual Intervention', timestamp: '2025-04-14 07:15', user: 'John Doe' },
    { action: 'Process Resumed', timestamp: '2025-04-14 07:20', user: 'John Doe' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Workflow for {workflowTitle}</h1>
        <WorkflowProgressIndicator steps={progressSteps} />
      </div>

      <WorkflowStagesBar 
        stages={stages} 
        activeStage={activeStage} 
        onStageClick={handleStageClick} 
      />

      <div>
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>{activeStageInfo?.name || 'Tasks'}</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Play className="h-4 w-4 mr-1" />
                  Trigger
                </Button>
                <Button size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Rerun
                </Button>
                <Button size="sm" variant="outline">
                  <FastForward className="h-4 w-4 mr-1" />
                  Force Start
                </Button>
                <Button size="sm" variant="outline">
                  <SkipForward className="h-4 w-4 mr-1" />
                  Skip
                </Button>
                <Button size="sm" variant="outline">
                  <Mail className="h-4 w-4 mr-1" />
                  Send Email
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tasks" onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="substages">Sub-Stages</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="parameters">Parameters</TabsTrigger>
                <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
                <TabsTrigger value="audit">Audit Info</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tasks">
                {activeStageTasks.length > 0 ? (
                  <div className="space-y-4">
                    {activeStageTasks.map(task => (
                      <WorkflowTaskItem key={task.id} task={task} />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No tasks found for this stage.</p>
                )}
              </TabsContent>
              
              <TabsContent value="substages">
                <SubStagesList subStages={mockSubStages} />
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
                    <h3 className="text-sm font-medium mb-2">Process Parameters</h3>
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
                          {mockParameters.process.map((param, index) => (
                            <tr key={index} className={index < mockParameters.process.length - 1 ? "border-b" : ""}>
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
              
              <TabsContent value="dependencies">
                <div className="space-y-4">
                  {mockDependencies.map((dep, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">{dep.name}</p>
                          <p className="text-sm text-muted-foreground">Completed at: {dep.completedAt}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500 text-white">
                        {dep.status}
                      </Badge>
                    </div>
                  ))}
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
          <CardFooter className="border-t pt-4 flex justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last Updated: 2025-04-14 07:20
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Locked
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Sequence: 3/5
              </Badge>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowDetailView;