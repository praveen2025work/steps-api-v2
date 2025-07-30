import React, { useEffect, useCallback } from 'react';
import { useBreadcrumb, BreadcrumbNode } from '@/contexts/BreadcrumbContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, ChevronRight, Loader2 } from 'lucide-react';
import { SafeRouter } from './SafeRouter';

interface EnhancedWorkflowBreadcrumbProps {
  onNavigate?: (level: number, node?: BreadcrumbNode) => void;
  onHomeClick?: () => void;
  showHome?: boolean;
  className?: string;
}

const EnhancedWorkflowBreadcrumb: React.FC<EnhancedWorkflowBreadcrumbProps> = ({
  onNavigate,
  onHomeClick,
  showHome = true,
  className = ''
}) => {
  return (
    <SafeRouter>
      {(router) => (
        <EnhancedWorkflowBreadcrumbContent
          router={router}
          onNavigate={onNavigate}
          onHomeClick={onHomeClick}
          showHome={showHome}
          className={className}
        />
      )}
    </SafeRouter>
  );
};

const EnhancedWorkflowBreadcrumbContent: React.FC<EnhancedWorkflowBreadcrumbProps & { router: any }> = ({
  router,
  onNavigate,
  onHomeClick,
  showHome = true,
  className = ''
}) => {
  const { state, navigateToLevel } = useBreadcrumb();

  // Handle breadcrumb node click
  const handleNodeClick = useCallback((level: number, node?: BreadcrumbNode) => {
    // Update breadcrumb state
    navigateToLevel(level);
    
    // Call external navigation handler if provided
    if (onNavigate) {
      onNavigate(level, node);
    }
  }, [navigateToLevel, onNavigate]);

  // Handle home click
  const handleHomeClick = useCallback(() => {
    // Navigate to level -1 (home)
    navigateToLevel(-1);
    
    // Call external home handler if provided
    if (onHomeClick) {
      onHomeClick();
    } else {
      // Default navigation to dashboard
      router.push('/');
    }
  }, [navigateToLevel, onHomeClick, router]);

  // Don't render if no nodes
  if (state.nodes.length === 0) {
    return null;
  }

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-sm flex-wrap">
          {/* Home button */}
          {showHome && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHomeClick}
                className="h-auto p-2 text-blue-600 hover:text-blue-800 flex items-center gap-1"
                disabled={state.isLoading}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Button>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </>
          )}

          {/* Breadcrumb nodes */}
          {state.nodes.map((node, index) => (
            <React.Fragment key={`${node.id}-${index}`}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNodeClick(index, node)}
                className="h-auto p-2 text-blue-600 hover:text-blue-800 flex items-center gap-2"
                disabled={state.isLoading || index === state.currentLevel}
              >
                <div className="flex items-center gap-2">
                  {/* Node name */}
                  <span className="font-medium">{node.name}</span>
                  
                  {/* Child count */}
                  {node.childCount !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      {node.childCount}
                    </Badge>
                  )}
                  
                  {/* Completion percentage */}
                  {node.completionPercentage !== undefined && (
                    <Badge 
                      variant={node.completionPercentage >= 80 ? "default" : 
                               node.completionPercentage >= 50 ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {node.completionPercentage}%
                    </Badge>
                  )}
                </div>
              </Button>
              
              {/* Separator (don't show after last item) */}
              {index < state.nodes.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </React.Fragment>
          ))}

          {/* Loading indicator */}
          {state.isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />
          )}
        </div>

        {/* Error display */}
        {state.error && (
          <div className="mt-2 text-sm text-destructive">
            {state.error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedWorkflowBreadcrumb;