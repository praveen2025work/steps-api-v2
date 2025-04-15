import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export interface HierarchyNode {
  id: string;
  name: string;
  progress: number;
  level: 'app' | 'workflow' | 'hierarchy';
}

interface WorkflowHierarchyBreadcrumbProps {
  nodes: HierarchyNode[];
  onNodeClick: (node: HierarchyNode) => void;
  onHomeClick?: () => void;
}

const WorkflowHierarchyBreadcrumb: React.FC<WorkflowHierarchyBreadcrumbProps> = ({
  nodes,
  onNodeClick,
  onHomeClick = () => console.log('Navigate to home'),
}) => {
  const router = useRouter();
  const [cachedNodes, setCachedNodes] = useState<HierarchyNode[]>([]);
  
  // Store nodes in state to prevent issues when clicking breadcrumb
  useEffect(() => {
    if (nodes && nodes.length > 0) {
      setCachedNodes(nodes);
    }
  }, [nodes]);
  
  if (!cachedNodes || cachedNodes.length === 0) return null;

  // Get the active node (last in the array)
  const activeNode = cachedNodes[cachedNodes.length - 1];
  
  // Enhanced navigation handler for breadcrumb nodes
  const handleNodeClick = (node: HierarchyNode) => {
    // Call the original handler for state updates
    onNodeClick(node);
    
    // Add actual navigation based on the node level
    if (node.level === 'app') {
      // Navigate to application view
      router.push(`/application/${node.id}`);
    } else if (node.level === 'workflow') {
      // Navigate to workflow level
      router.push(`/workflow/${node.id}`);
    } else if (node.level === 'hierarchy') {
      // Navigate to hierarchy level
      router.push(`/workflow/${node.id}`);
    }
  };
  
  // Enhanced home button handler
  const handleHomeClick = () => {
    // Call the original handler
    onHomeClick();
    
    // Navigate to dashboard
    router.push('/');
  };
  
  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-2">
        <BreadcrumbList>
          {/* Home Icon */}
          <BreadcrumbItem>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-full"
              onClick={handleHomeClick}
            >
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </Button>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator />
          
          {/* Hierarchy Nodes */}
          {cachedNodes.map((node, index) => (
            <React.Fragment key={node.id}>
              <BreadcrumbItem>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 flex items-center gap-2 hover:bg-secondary/50"
                  onClick={() => handleNodeClick(node)}
                >
                  <span className="font-medium">{node.name}</span>
                  <Badge variant="secondary" className="ml-1">{node.progress}%</Badge>
                </Button>
              </BreadcrumbItem>
              
              {/* Add separator between nodes, but not after the last one */}
              {index < cachedNodes.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      
      {/* Active Level (Highlighted) */}
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">{activeNode.name}</h1>
        <Badge variant="outline" className="text-sm">
          in-progress
        </Badge>
        <Badge variant="secondary" className="text-sm">
          Progress: {activeNode.progress}%
        </Badge>
      </div>
    </div>
  );
};

export default WorkflowHierarchyBreadcrumb;