import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface WorkflowChild {
  id: string;
  name: string;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
}

interface WorkflowChildrenListProps {
  parentName: string;
  children: WorkflowChild[];
  onViewDetails: (id: string) => void;
}

const WorkflowChildrenList: React.FC<WorkflowChildrenListProps> = ({
  parentName,
  children,
  onViewDetails,
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{parentName} Workflows</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children.map((child) => (
          <Card key={child.id} className="overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium">{child.name}</h3>
                <Badge 
                  variant={
                    child.status === 'completed' ? 'default' : 
                    child.status === 'in-progress' ? 'secondary' : 
                    child.status === 'blocked' ? 'destructive' : 
                    'outline'
                  }
                >
                  {child.status.replace('-', ' ')}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Progress: {child.progress}%
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full" 
                    style={{ width: `${child.progress}%` }}
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="p-4 pt-0 flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => onViewDetails(child.id)}
              >
                <span>View Details</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WorkflowChildrenList;