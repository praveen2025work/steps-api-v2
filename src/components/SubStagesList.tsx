import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface SubStage {
  id: string;
  name: string;
  status: 'completed' | 'in-progress' | 'not-started' | 'skipped';
  progress: number;
}

interface SubStagesListProps {
  subStages: SubStage[];
}

const SubStagesList: React.FC<SubStagesListProps> = ({ subStages }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'not-started':
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      case 'skipped':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">In Progress</Badge>;
      case 'not-started':
        return <Badge variant="outline">Not Started</Badge>;
      case 'skipped':
        return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">Skipped</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {subStages.map((subStage) => (
        <div 
          key={subStage.id} 
          className="border rounded-lg p-4"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="mt-1">{getStatusIcon(subStage.status)}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{subStage.name}</h3>
                {getStatusBadge(subStage.status)}
              </div>
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm font-medium">{subStage.progress}%</span>
                </div>
                <Progress value={subStage.progress} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubStagesList;