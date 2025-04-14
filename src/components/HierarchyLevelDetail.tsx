import React from 'react';
import { HierarchyLevel } from '@/data/hierarchicalWorkflowData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HierarchyLevelDetailProps {
  level: HierarchyLevel | null;
  onBack: () => void;
}

const HierarchyLevelDetail: React.FC<HierarchyLevelDetailProps> = ({ 
  level, 
  onBack 
}) => {
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
      </CardContent>
    </Card>
  );
};

export default HierarchyLevelDetail;