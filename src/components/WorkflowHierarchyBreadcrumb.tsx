import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ChevronRight, Home, LucideIcon, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface HierarchyNode {
  id: string;
  name: string;
  progress?: number;
  level: string;
  metadata?: Record<string, any>;
  icon?: LucideIcon;
  tooltip?: string;
  onClick?: (node: HierarchyNode) => void;
  href?: string;
}

export interface BreadcrumbConfig {
  showHome?: boolean;
  homeIcon?: LucideIcon;
  homeTooltip?: string;
  homeHref?: string;
  separatorIcon?: LucideIcon;
  showProgress?: boolean;
  progressFormat?: (progress: number) => string;
  idFormat?: (id: string) => string;
  nodeFormat?: (node: HierarchyNode) => React.ReactNode;
  onNodeClick?: (node: HierarchyNode) => void;
  onHomeClick?: () => void;
}

interface WorkflowHierarchyBreadcrumbProps {
  nodes: HierarchyNode[];
  config?: BreadcrumbConfig;
}

const defaultConfig: BreadcrumbConfig = {
  showHome: true,
  homeIcon: Home,
  homeTooltip: 'Go to Home',
  homeHref: '/',
  separatorIcon: ChevronRight,
  showProgress: true,
  progressFormat: (progress) => `${progress}%`,
  idFormat: (id) => {
    const match = id.match(/\d+$/);
    return match ? match[0] : id;
  },
  nodeFormat: (node) => (
    <>
      <span className="font-medium">{node.name}</span>
      <span className="text-xs text-muted-foreground">({node.id})</span>
      {node.progress !== undefined && (
        <span className="text-xs text-muted-foreground ml-1">
          {node.progress}%
        </span>
      )}
    </>
  ),
};

const WorkflowHierarchyBreadcrumb: React.FC<WorkflowHierarchyBreadcrumbProps> = ({
  nodes,
  config: customConfig,
}) => {
  const router = useRouter();
  const [cachedNodes, setCachedNodes] = useState<HierarchyNode[]>([]);
  const [copiedNodeIndex, setCopiedNodeIndex] = useState<number | null>(null);
  const config = { ...defaultConfig, ...customConfig };
  
  useEffect(() => {
    if (nodes && nodes.length > 0) {
      setCachedNodes(nodes);
    }
  }, [nodes]);
  
  if (!cachedNodes || cachedNodes.length === 0) return null;

  const handleNodeClick = (node: HierarchyNode, index: number) => {
    if (node.onClick) {
      node.onClick(node);
    } else if (config.onNodeClick) {
      config.onNodeClick(node);
    } else if (node.href) {
      router.push(node.href);
    } else {
      // Default navigation behavior based on node level
      if (node.level === 'app') {
        router.push(`/application/${node.id}`);
      } else if (index < cachedNodes.length - 1) {
        // If not the last node (current level), navigate to application with this level selected
        const appNode = cachedNodes.find(n => n.level === 'app');
        if (appNode) {
          router.push(`/application/${appNode.id}`);
        }
      }
    }
  };
  
  const handleHomeClick = () => {
    if (config.onHomeClick) {
      config.onHomeClick();
    }
    if (config.homeHref) {
      router.push(config.homeHref);
    }
  };
  
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          {config.showHome && config.homeIcon && (
            <>
              <BreadcrumbItem>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 rounded-full"
                        onClick={handleHomeClick}
                      >
                        <config.homeIcon className="h-3 w-3" />
                        <span className="sr-only">Home</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{config.homeTooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          
          {cachedNodes.map((node, index) => (
            <React.Fragment key={node.id}>
              <BreadcrumbItem className="flex items-center">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1.5 flex items-center gap-1 hover:bg-secondary/50 text-xs"
                    onClick={() => handleNodeClick(node, index)}
                  >
                    {config.nodeFormat ? (
                      config.nodeFormat(node)
                    ) : (
                      <>
                        <span className="font-medium">{node.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({config.idFormat?.(node.id) || node.id})
                        </span>
                        {config.showProgress && node.progress !== undefined && (
                          <span className="text-xs text-muted-foreground ml-1">
                            {config.progressFormat?.(node.progress)}
                          </span>
                        )}
                      </>
                    )}
                  </Button>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Create path string from nodes up to this index
                            const pathString = cachedNodes
                              .slice(0, index + 1)
                              .map(n => n.name)
                              .join(' -> ');
                            navigator.clipboard.writeText(pathString);
                            setCopiedNodeIndex(index);
                            setTimeout(() => setCopiedNodeIndex(null), 2000);
                          }}
                        >
                          {copiedNodeIndex === index ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{copiedNodeIndex === index ? "Copied!" : "Copy path"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default WorkflowHierarchyBreadcrumb;