import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  ChevronRight, 
  Home,
  Building2,
  GitBranch,
  Workflow,
  Copy,
  Check
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { showInfoToast } from '@/lib/toast';

export interface BreadcrumbLevel {
  id: string;
  name: string;
  level: 'applications' | 'application-nodes' | 'node-group-details' | 'workflow-instance';
  progress?: number;
  metadata?: {
    appId?: string;
    configId?: string;
    groupId?: string;
    isUsedForWorkflowInstance?: boolean;
  };
}

interface DynamicWorkflowBreadcrumbProps {
  levels: BreadcrumbLevel[];
  currentWorkflowTitle?: string;
  onNavigate?: (level: BreadcrumbLevel, index: number) => void;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  className?: string;
}

const DynamicWorkflowBreadcrumb: React.FC<DynamicWorkflowBreadcrumbProps> = ({
  levels,
  currentWorkflowTitle,
  onNavigate,
  showBackButton = true,
  showHomeButton = true,
  className = ""
}) => {
  const router = useRouter();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Get the appropriate icon for each level
  const getLevelIcon = (level: BreadcrumbLevel['level']) => {
    switch (level) {
      case 'applications':
        return Home;
      case 'application-nodes':
        return Building2;
      case 'node-group-details':
        return GitBranch;
      case 'workflow-instance':
        return Workflow;
      default:
        return ChevronRight;
    }
  };

  // Handle navigation to a specific level
  const handleLevelClick = (level: BreadcrumbLevel, index: number) => {
    try {
      console.log(`[DynamicWorkflowBreadcrumb] Navigating to ${level.level}:`, level);

      if (onNavigate) {
        onNavigate(level, index);
        return;
      }

      // Default navigation logic based on level type
      switch (level.level) {
        case 'applications':
          // Navigate to applications view (home)
          router.push('/');
          break;
          
        case 'application-nodes':
          // Navigate to application detail view
          if (level.metadata?.appId) {
            router.push(`/application/${level.metadata.appId}`);
          } else {
            router.push('/');
          }
          break;
          
        case 'node-group-details':
          // Navigate to hierarchy view for this node group
          if (level.metadata?.appId && level.metadata?.configId) {
            router.push(`/hierarchy/${level.metadata.appId}?configId=${level.metadata.configId}`);
          } else if (level.metadata?.appId) {
            router.push(`/hierarchy/${level.metadata.appId}`);
          } else {
            router.push('/hierarchy');
          }
          break;
          
        case 'workflow-instance':
          // Stay on current workflow instance view (no navigation needed)
          showInfoToast(`Already viewing workflow instance: ${level.name}`);
          break;
          
        default:
          console.warn(`[DynamicWorkflowBreadcrumb] Unknown level type: ${level.level}`);
          break;
      }
    } catch (error) {
      console.error('[DynamicWorkflowBreadcrumb] Navigation error:', error);
    }
  };

  // Handle back button click
  const handleBackClick = () => {
    try {
      if (levels.length > 1) {
        // Navigate to the previous level
        const previousLevel = levels[levels.length - 2];
        handleLevelClick(previousLevel, levels.length - 2);
      } else {
        // Navigate to home if no previous level
        router.push('/');
      }
    } catch (error) {
      console.error('[DynamicWorkflowBreadcrumb] Back navigation error:', error);
    }
  };

  // Handle home button click
  const handleHomeClick = () => {
    router.push('/');
  };

  // Copy breadcrumb path to clipboard
  const copyPath = (upToIndex: number) => {
    const pathString = levels
      .slice(0, upToIndex + 1)
      .map(level => level.name)
      .join(' › ');
    
    navigator.clipboard.writeText(pathString);
    setCopiedIndex(upToIndex);
    setTimeout(() => setCopiedIndex(null), 2000);
    showInfoToast('Path copied to clipboard');
  };

  // Don't render if no levels
  if (!levels || levels.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {/* Back Button */}
      {showBackButton && (
        <>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 flex items-center gap-1 hover:bg-secondary/50"
            onClick={handleBackClick}
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Back</span>
          </Button>
          <Separator orientation="vertical" className="h-4" />
        </>
      )}

      {/* Home Button */}
      {showHomeButton && (
        <>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={handleHomeClick}
                >
                  <Home className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Go to Applications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {levels.length > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
        </>
      )}

      {/* Breadcrumb Levels */}
      {levels.map((level, index) => {
        const Icon = getLevelIcon(level.level);
        const isLast = index === levels.length - 1;
        const isClickable = !isLast; // Last level (current) is not clickable

        return (
          <React.Fragment key={level.id}>
            <div className="flex items-center gap-1">
              {/* Level Button */}
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 px-2 flex items-center gap-1 hover:bg-secondary/50 ${
                  isLast ? 'font-medium text-foreground cursor-default' : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={isClickable ? () => handleLevelClick(level, index) : undefined}
                disabled={!isClickable}
              >
                <Icon className="h-3 w-3" />
                <span>{level.name}</span>
                {level.progress !== undefined && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({level.progress}%)
                  </span>
                )}
              </Button>

              {/* Copy Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyPath(index);
                      }}
                    >
                      {copiedIndex === index ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copiedIndex === index ? "Copied!" : "Copy path"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Separator */}
            {!isLast && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          </React.Fragment>
        );
      })}

      {/* Current Workflow Title (if different from last breadcrumb level) */}
      {currentWorkflowTitle && currentWorkflowTitle !== levels[levels.length - 1]?.name && (
        <>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium text-foreground">{currentWorkflowTitle}</span>
        </>
      )}
    </div>
  );
};

export default DynamicWorkflowBreadcrumb;