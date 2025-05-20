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
  BarChart, 
  FileText,
  Layers,
  RefreshCw
} from 'lucide-react';

interface StageOverviewProps {
  stageId: string;
  stageName: string;
}

const StageOverview: React.FC<StageOverviewProps> = ({ stageId, stageName }) => {
  // Mock data for stage overview
  const stageDetails = {
    id: stageId,
    name: stageName,
    status: 'in-progress',
    progress: 65,
    startTime: '2025-05-19 08:00:00',
    expectedEndTime: '2025-05-19 12:00:00',
    owner: 'Jane Smith',
    priority: 'high',
    businessDate: '2025-05-19',
    description: 'This stage encompasses all processes related to the daily PnL calculation workflow, including data preparation, validation, and reporting.',
    metrics: {
      successRate: '92%',
      averageDuration: '240 minutes',
      lastRunDuration: '235 minutes',
      completionTrend: 'stable',
    },
    processes: {
      total: 8,
      completed: 3,
      inProgress: 1,
      notStarted: 4,
      failed: 0,
    },
    documents: {
      total: 12,
      inputs: 5,
      outputs: 7,
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
        <CardTitle className="text-lg font-medium">Stage Overview</CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {stageId} - {stageName}
          </p>
          <div className="flex items-center gap-2">
            {getStatusBadge(stageDetails.status)}
            {getPriorityBadge(stageDetails.priority)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm">{stageDetails.progress}%</span>
          </div>
          <Progress value={stageDetails.progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Start Time:</span>
              <span className="text-sm">{stageDetails.startTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Expected End:</span>
              <span className="text-sm">{stageDetails.expectedEndTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Business Date:</span>
              <span className="text-sm">{stageDetails.businessDate}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Owner:</span>
              <span className="text-sm">{stageDetails.owner}</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Processes:</span>
              <span className="text-sm">{stageDetails.processes.total}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Documents:</span>
              <span className="text-sm">{stageDetails.documents.total}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-medium mb-2">Description</h3>
          <p className="text-sm text-muted-foreground">{stageDetails.description}</p>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-medium mb-2">Performance Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Success Rate:</span>
                <span className="text-sm">{stageDetails.metrics.successRate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Avg. Duration:</span>
                <span className="text-sm">{stageDetails.metrics.averageDuration}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Last Run:</span>
                <span className="text-sm">{stageDetails.metrics.lastRunDuration}</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Trend:</span>
                <span className="text-sm capitalize">{stageDetails.metrics.completionTrend}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-medium mb-2">Process Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Processes</span>
                <span className="text-sm">{stageDetails.processes.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Completed</span>
                <span className="text-sm text-green-500">{stageDetails.processes.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">In Progress</span>
                <span className="text-sm text-blue-500">{stageDetails.processes.inProgress}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Not Started</span>
                <span className="text-sm text-gray-500">{stageDetails.processes.notStarted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Failed</span>
                <span className="text-sm text-red-500">{stageDetails.processes.failed}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StageOverview;