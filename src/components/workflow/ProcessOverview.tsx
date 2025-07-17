import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Calendar, 
  User, 
  CheckCircle, 
  AlertTriangle, 
  BarChart, 
  FileText,
  Network,
  RefreshCw,
  Bot,
  UserCircle,
  Shield,
  Upload,
  Download,
  Database,
  Link,
  MessageSquare,
  Lock,
  Unlock,
  Activity,
  XCircle
} from 'lucide-react';

interface ProcessOverviewProps {
  processId: string;
  processName: string;
}

const ProcessOverview: React.FC<ProcessOverviewProps> = ({ processId, processName }) => {
  // Get enhanced process data from global storage or use mock data
  const getProcessData = () => {
    const summaryData = (window as any).currentWorkflowSummary;
    const applicationData = (window as any).currentWorkflowApplication;
    
    if (summaryData && summaryData.processData) {
      // Find the specific process by ID
      const process = summaryData.processData.find((p: any) => 
        p.workflow_Process_Id.toString() === processId.replace('PROC-', '') ||
        `PROC-${p.workflow_Process_Id}` === processId
      );
      
      if (process) {
        // Map API data to UI format with enhanced fields
        return {
          id: processId,
          name: process.subStage_Name || processName,
          stageName: process.stage_Name,
          status: process.status?.toLowerCase().replace(' ', '-') || 'not-started',
          progress: process.percentage || 0,
          type: (process.auto === 'y' || process.auto === 'Y') ? 'auto' : 'manual',
          duration: process.duration ? `${process.duration}m` : 'N/A',
          startTime: process.updatedon ? new Date(process.updatedon).toLocaleString() : 'N/A',
          expectedEndTime: 'N/A', // Could be calculated
          owner: process.updatedBy || 'System',
          businessDate: process.businessdate,
          region: 'N/A', // Not in API data
          description: process.message || 'No description available',
          
          // Enhanced API fields
          serviceLink: process.serviceLink,
          componentName: process.componentName,
          resolvedComponentName: process.resolvedComponentName,
          isAlteryx: process.isAlteryx === 'Y',
          isRTB: process.isRTB,
          adhoc: process.adhoc === 'Y',
          uploadAllowed: process.upload_Allowed === 'Y',
          downloadAllowed: process.download_Allowed === 'Y',
          attestRequired: process.attest_Reqd === 'Y',
          approvalRequired: process.approval === 'Y',
          isActive: process.isActive === 'y',
          isLocked: process.isLocked === 'Y',
          lockedBy: process.lockedBy,
          lockedOn: process.lockedOn,
          completedBy: process.completedBy,
          completedOn: process.completedon,
          attestedBy: process.attestedBy,
          attestedOn: process.attestedon,
          hasDependencies: process.hasDependencies === 'y',
          partialComplete: process.partialComplete,
          userCommentary: process.userCommentary,
          skipCommentary: process.skipCommentary,
          
          // Get related data counts
          dependencies: {
            total: summaryData.dependencyData?.filter((dep: any) => 
              dep.workflow_Process_Id === process.workflow_Process_Id
            ).length || 0,
            completed: summaryData.dependencyData?.filter((dep: any) => 
              dep.workflow_Process_Id === process.workflow_Process_Id && 
              dep.dep_Status === 'COMPLETED'
            ).length || 0,
            pending: summaryData.dependencyData?.filter((dep: any) => 
              dep.workflow_Process_Id === process.workflow_Process_Id && 
              dep.dep_Status !== 'COMPLETED'
            ).length || 0,
            failed: 0 // Would need to check for failed status
          },
          
          documents: {
            total: summaryData.fileData?.filter((file: any) => 
              file.workflow_Process_Id === process.workflow_Process_Id && file.name
            ).length || 0,
            inputs: summaryData.fileData?.filter((file: any) => 
              file.workflow_Process_Id === process.workflow_Process_Id && 
              file.name && file.file_Upload !== 'Y'
            ).length || 0,
            outputs: summaryData.fileData?.filter((file: any) => 
              file.workflow_Process_Id === process.workflow_Process_Id && 
              file.name && file.file_Upload === 'Y'
            ).length || 0
          },
          
          metrics: {
            successRate: '95%', // Could be calculated from historical data
            averageDuration: process.duration ? `${process.duration} minutes` : 'N/A',
            lastRunDuration: process.duration ? `${process.duration} minutes` : 'N/A',
            completionTrend: 'stable'
          }
        };
      }
    }
    
    // Fallback to mock data
    return {
      id: processId,
      name: processName,
      stageName: 'Unknown Stage',
      status: 'in-progress',
      progress: 45,
      type: 'manual',
      duration: '15m',
      startTime: '2025-05-19 08:30:00',
      expectedEndTime: '2025-05-19 10:30:00',
      owner: 'John Doe',
      businessDate: '2025-05-19',
      region: 'EMEA',
      description: 'This process handles the daily PnL calculation for the EMEA region, including data validation, adjustments, and reporting.',
      serviceLink: null,
      componentName: null,
      isAlteryx: false,
      isRTB: false,
      adhoc: false,
      uploadAllowed: false,
      downloadAllowed: true,
      attestRequired: false,
      approvalRequired: false,
      isActive: true,
      isLocked: false,
      lockedBy: null,
      hasDependencies: true,
      userCommentary: null,
      skipCommentary: null,
      metrics: {
        successRate: '95%',
        averageDuration: '120 minutes',
        lastRunDuration: '118 minutes',
        completionTrend: 'improving',
      },
      dependencies: {
        total: 5,
        completed: 3,
        pending: 2,
        failed: 0,
      },
      documents: {
        total: 7,
        inputs: 3,
        outputs: 4,
      }
    };
  };

  const processDetails = getProcessData();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">In Progress</Badge>;
      case 'not-started':
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Not Started</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Failed</Badge>;
      case 'rejected':
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">Rejected</Badge>;
      case 'skipped':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Skipped</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Process Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm">{processDetails.progress}%</span>
          </div>
          <Progress value={processDetails.progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Start Time:</span>
              <span className="text-sm">{processDetails.startTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Expected End:</span>
              <span className="text-sm">{processDetails.expectedEndTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Business Date:</span>
              <span className="text-sm">{processDetails.businessDate}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Owner:</span>
              <span className="text-sm">{processDetails.owner}</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Type:</span>
              <span className="text-sm capitalize">{processDetails.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Region:</span>
              <span className="text-sm">{processDetails.region}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-medium mb-2">Description</h3>
          <p className="text-sm text-muted-foreground">{processDetails.description}</p>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-medium mb-2">Performance Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Success Rate:</span>
                <span className="text-sm">{processDetails.metrics.successRate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Avg. Duration:</span>
                <span className="text-sm">{processDetails.metrics.averageDuration}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Last Run:</span>
                <span className="text-sm">{processDetails.metrics.lastRunDuration}</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Trend:</span>
                <span className="text-sm capitalize">{processDetails.metrics.completionTrend}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Dependencies</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total</span>
                <span className="text-sm">{processDetails.dependencies.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Completed</span>
                <span className="text-sm text-green-500">{processDetails.dependencies.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending</span>
                <span className="text-sm text-yellow-500">{processDetails.dependencies.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Failed</span>
                <span className="text-sm text-red-500">{processDetails.dependencies.failed}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Documents</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total</span>
                <span className="text-sm">{processDetails.documents.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Input Documents</span>
                <span className="text-sm">{processDetails.documents.inputs}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Output Documents</span>
                <span className="text-sm">{processDetails.documents.outputs}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessOverview;