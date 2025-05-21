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
  RefreshCw
} from 'lucide-react';

interface ProcessOverviewProps {
  processId: string;
  processName: string;
}

const ProcessOverview: React.FC<ProcessOverviewProps> = ({ processId, processName }) => {
  // Mock data for process overview
  const processDetails = {
    id: processId,
    name: processName,
    status: 'in-progress',
    progress: 45,
    startTime: '2025-05-19 08:30:00',
    expectedEndTime: '2025-05-19 10:30:00',
    owner: 'John Doe',
    priority: 'high',
    type: 'manual',
    businessDate: '2025-05-19',
    region: 'EMEA',
    description: 'This process handles the daily PnL calculation for the EMEA region, including data validation, adjustments, and reporting.',
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-500/10 text-blue-500">In Progress</Badge>;
      case 'not-started':
        return <Badge className="bg-gray-500/10 text-gray-500">Not Started</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500">Failed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-500/10 text-red-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/10 text-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-500/10 text-green-500">Low</Badge>;
      default:
        return <Badge>Unknown</Badge>;
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