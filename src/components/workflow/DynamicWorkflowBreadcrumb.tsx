import React, { useState, useEffect } from 'react';
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
import SafeRouter from '@/components/SafeRouter';

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
  const handleLevelClick = (router: any, level: BreadcrumbLevel, index: number) => {
    try {
      if (onNavigate) {
        onNavigate(level, index);
        return;
      }

      // Check if we're on a complex page that needs forced reload
      const currentRoute = router.asPath || '';
      const currentPathname = router.pathname || '';
      const isComplexPage = currentPathname.includes('/workflow/') || 
                           currentPathname.includes('/hierarchy/') ||
                           currentPathname.includes('/stages/') ||
                           currentRoute.includes('/workflow/') ||
                           currentRoute.includes('/hierarchy/') ||
                           currentRoute.includes('/stages/');

      // Default navigation logic based on level type
      switch (level.level) {
        case 'applications':
          // Navigate to applications view (home)
          if (isComplexPage) {
            window.location.href = `/?_t=${Date.now()}`;
          } else {
            router.push('/');
          }
          break;
          
        case 'application-nodes':
          // Navigate to application detail view
          const appUrl = level.metadata?.appId ? `/application/${level.metadata.appId}` : '/';
          if (isComplexPage) {
            window.location.href = `${appUrl}?_t=${Date.now()}`;
          } else {
            router.push(appUrl);
          }
          break;
          
        case 'node-group-details':
          // Navigate to hierarchy view for this node group
          let hierarchyUrl = '/hierarchy';
          if (level.metadata?.appId && level.metadata?.configId) {
            hierarchyUrl = `/hierarchy/${level.metadata.appId}?configId=${level.metadata.configId}`;
          } else if (level.metadata?.appId) {
            hierarchyUrl = `/hierarchy/${level.metadata.appId}`;
          }
          
          if (isComplexPage) {
            const separator = hierarchyUrl.includes('?') ? '&' : '?';
            window.location.href = `${hierarchyUrl}${separator}_t=${Date.now()}`;
          } else {
            router.push(hierarchyUrl);
          }
          break;
          
        case 'workflow-instance':
          // Stay on current workflow instance view (no navigation needed)
          showInfoToast(`Already viewing workflow instance: ${level.name}`);
          break;
          
        default:
          break;
      }
    } catch (error) {
      // Navigation error handled silently
    }
  };

  // Handle back button click
  const handleBackClick = (router: any) => {
    try {
      if (onNavigate && levels.length > 1) {
        // Use the provided navigation handler for the previous level
        const previousLevel = levels[levels.length - 2];
        onNavigate(previousLevel, levels.length - 2);
      } else if (levels.length > 1) {
        // Navigate to the previous level
        const previousLevel = levels[levels.length - 2];
        handleLevelClick(router, previousLevel, levels.length - 2);
      } else {
        // Navigate to home if no previous level
        // Check if we're on a complex page that needs forced reload
        const currentRoute = router.asPath || '';
        const currentPathname = router.pathname || '';
        const isComplexPage = currentPathname.includes('/workflow/') || 
                             currentPathname.includes('/hierarchy/') ||
                             currentPathname.includes('/stages/') ||
                             currentRoute.includes('/workflow/') ||
                             currentRoute.includes('/hierarchy/') ||
                             currentRoute.includes('/stages/');
        
        if (isComplexPage) {
          window.location.href = `/?_t=${Date.now()}`;
        } else {
          router.push('/');
        }
      }
    } catch (error) {
      // Back navigation error handled silently
    }
  };

  // Handle home button click
  const handleHomeClick = (router: any) => {
    // Check if we're on a complex page that needs forced reload
    const currentRoute = router.asPath || '';
    const currentPathname = router.pathname || '';
    const isComplexPage = currentPathname.includes('/workflow/') || 
                         currentPathname.includes('/hierarchy/') ||
                         currentPathname.includes('/stages/') ||
                         currentRoute.includes('/workflow/') ||
                         currentRoute.includes('/hierarchy/') ||
                         currentRoute.includes('/stages/');
    
    if (isComplexPage) {
      // Force a complete page reload to Task Center with cache busting
      const url = `/workflow-inbox?_t=${Date.now()}`;
      window.location.href = url;
      return;
    }
    
    if (onNavigate) {
      // Create a dummy applications level for navigation to Task Center
      const applicationsLevel: BreadcrumbLevel = {
        id: 'task-center',
        name: 'Task Center',
        level: 'applications'
      };
      onNavigate(applicationsLevel, -1);
    } else {
      router.push('/workflow-inbox');
    }
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
    <SafeRouter>
      {(router) => (
        <div className={`flex items-center gap-2 text-sm ${className}`}>
          {/* Back Button - Removed text, only icon */}
          {showBackButton && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 flex items-center justify-center hover:bg-secondary/50"
                onClick={() => handleBackClick(router)}
                title="Go back"
              >
                <ArrowLeft className="h-3 w-3" />
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
                      onClick={() => handleHomeClick(router)}
                    >
                      <Home className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Go to Task Center</p>
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
                    onClick={isClickable ? () => handleLevelClick(router, level, index) : undefined}
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
      )}
    </SafeRouter>
  );
};

export default DynamicWorkflowBreadcrumb;