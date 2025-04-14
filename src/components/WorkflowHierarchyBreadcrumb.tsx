import React, { useState } from 'react';
import { ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  const [showPreviousLevels, setShowPreviousLevels] = useState<boolean>(true);

  if (!nodes || nodes.length === 0) return null;

  // Get the active node (last in the array)
  const activeNode = nodes[nodes.length - 1];
  
  // Get previous levels (all except the active node)
  const previousLevels = nodes.slice(0, nodes.length - 1);

  return (
    <div className="space-y-2">
      {/* Previous Levels Section (Collapsible) */}
      {previousLevels.length > 0 && (
        <Collapsible open={showPreviousLevels} onOpenChange={setShowPreviousLevels}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Previous Levels</span>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                {showPreviousLevels ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent>
            <div className="flex items-center flex-wrap gap-1 p-2 bg-secondary/20 rounded-md">
              {previousLevels.map((node, index) => (
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
          </CollapsibleContent>
        </Collapsible>
      )}
      
      {/* Active Level (Highlighted) */}
      <h1 className="text-2xl font-bold">{activeNode.name}</h1>
    </div>
  );
};

export default WorkflowHierarchyBreadcrumb;