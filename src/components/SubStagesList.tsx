import React from 'react';
import { SubStage } from '@/data/mockWorkflows';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface SubStagesListProps {
  substages: SubStage[];
}

const SubStagesList: React.FC<SubStagesListProps> = ({ substages }) => {
  if (!substages || substages.length === 0) {
    return <p className="text-sm text-muted-foreground">No substages defined</p>;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">In Progress</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Substages</h4>
      <div className="space-y-2">
        {substages.map((substage) => (
          <div 
            key={substage.id} 
            className="p-3 border rounded-md bg-background/50"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(substage.status)}
                <span className="font-medium">{substage.name}</span>
              </div>
              {getStatusBadge(substage.status)}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{substage.assignee}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Due: {substage.dueDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubStagesList;