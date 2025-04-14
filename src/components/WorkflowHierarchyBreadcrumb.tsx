import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface HierarchyNode {
  id: string;
  name: string;
  progress: number;
  level: 'app' | 'workflow' | 'hierarchy';
}

interface WorkflowHierarchyBreadcrumbProps {
  nodes: HierarchyNode[];
  onNodeClick: (node: HierarchyNode) => void;
}

const WorkflowHierarchyBreadcrumb: React.FC<WorkflowHierarchyBreadcrumbProps> = ({
  nodes,
  onNodeClick,
}) => {
  if (!nodes || nodes.length === 0) return null;

  return (
    <div className="flex items-center flex-wrap gap-1 mb-4 p-2 bg-secondary/20 rounded-md">
      {nodes.map((node, index) => (
        <React.Fragment key={node.id}>
          {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 flex items-center gap-2 hover:bg-secondary/50"
            onClick={() => onNodeClick(node)}
          >
            <span className="font-medium">{node.name}</span>
            <Badge variant="secondary" className="ml-1">{node.progress}%</Badge>
          </Button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default WorkflowHierarchyBreadcrumb;