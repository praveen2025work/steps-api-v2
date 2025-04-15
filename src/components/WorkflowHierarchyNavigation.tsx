import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, ChevronDown, ChevronLeft, Layers, FileText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

type HierarchyItem = {
  id: string;
  name: string;
  completion: number;
};

type HierarchyData = {
  applications: HierarchyItem[];
  categories: {
    [key: string]: HierarchyItem[];
  };
};

type WorkflowHierarchyNavigationProps = {
  hierarchyData: HierarchyData;
  currentPath?: string[];
  onNavigate?: (id: string, level: string) => void;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
};

const WorkflowHierarchyNavigation: React.FC<WorkflowHierarchyNavigationProps> = ({
  hierarchyData,
  currentPath = [],
  onNavigate = () => {},
  isVisible = true,
  onToggleVisibility = () => {}
}) => {
  const [expandedApps, setExpandedApps] = useState<Record<string, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  
  // Function to get items to show based on the current path
  const getItemsToShow = () => {
    if (!currentPath || currentPath.length === 0) {
      return { items: hierarchyData.applications || [], level: 'application', title: 'Categories' };
    }
    
    // If we're at the first level, show applications
    if (currentPath.length === 1) {
      return { items: hierarchyData.applications || [], level: 'application', title: 'Categories' };
    }
    
    // Otherwise, show the parent level's items
    const parentId = currentPath[currentPath.length - 2];
    if (parentId && hierarchyData.categories && hierarchyData.categories[parentId]) {
      return { 
        items: hierarchyData.categories[parentId], 
        level: 'category', 
        title: currentPath.length === 2 ? 'Apps' : 'Categories'
      };
    }
    
    // Fallback to showing applications if we can't determine the parent
    return { items: hierarchyData.applications || [], level: 'application', title: 'Categories' };
  };

  // Toggle expansion state for an application
  const toggleAppExpansion = (appId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedApps(prev => ({
      ...prev,
      [appId]: !prev[appId]
    }));
  };

  // Toggle expansion state for a category
  const toggleCategoryExpansion = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Check if an application is currently selected
  const isAppSelected = (appId: string) => {
    return currentPath.length > 0 && currentPath[0] === appId;
  };

  // Check if a category is currently selected
  const isCategorySelected = (categoryId: string) => {
    return currentPath.length > 1 && currentPath[1] === categoryId;
  };

  // Check if a workflow is currently selected
  const isWorkflowSelected = (workflowId: string) => {
    return currentPath.length > 2 && currentPath[2] === workflowId;
  };

  // Render a tree item with proper indentation and expansion controls
  const renderTreeItem = (
    item: HierarchyItem, 
    level: 'application' | 'category' | 'workflow',
    depth: number = 0,
    isExpanded: boolean = false,
    hasChildren: boolean = false,
    onExpand?: (e: React.MouseEvent) => void
  ) => {
    const isSelected = level === 'application' 
      ? isAppSelected(item.id)
      : level === 'category'
        ? isCategorySelected(item.id)
        : isWorkflowSelected(item.id);
    
    const paddingLeft = `${depth * 16}px`;
    
    // Handle click on the tree item
    const handleItemClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onNavigate(item.id, level);
    };
    
    return (
      <div 
        key={item.id}
        className={`p-2 rounded-md ${isSelected ? 'bg-primary/10' : 'hover:bg-secondary/50'} cursor-pointer transition-colors`}
        style={{ paddingLeft }}
        onClick={handleItemClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            {hasChildren && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 p-0" 
                onClick={onExpand}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            
            {!hasChildren && <div className="w-5" />}
            
            {level === 'application' && <Layers className="h-4 w-4 text-primary" />}
            {level === 'category' && <FileText className="h-4 w-4 text-primary" />}
            {level === 'workflow' && <FileText className="h-4 w-4 text-primary" />}
            
            <div className="font-medium text-sm truncate">{item.name}</div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{item.completion}%</span>
            <div className="w-16">
              <Progress value={item.completion} className="h-1.5" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the complete tree structure
  const renderHierarchyTree = () => {
    return (
      <div className="space-y-1">
        {hierarchyData.applications.map(app => {
          const hasCategories = hierarchyData.categories && hierarchyData.categories[app.id] && hierarchyData.categories[app.id].length > 0;
          const isExpanded = expandedApps[app.id];
          
          return (
            <React.Fragment key={app.id}>
              {renderTreeItem(
                app, 
                'application', 
                0, 
                isExpanded, 
                hasCategories, 
                (e) => toggleAppExpansion(app.id, e)
              )}
              
              {hasCategories && isExpanded && (
                <div className="ml-2">
                  {hierarchyData.categories[app.id].map(category => {
                    const hasWorkflows = hierarchyData.categories && 
                                        hierarchyData.categories[category.id] && 
                                        hierarchyData.categories[category.id].length > 0;
                    const isCatExpanded = expandedCategories[category.id];
                    
                    return (
                      <React.Fragment key={category.id}>
                        {renderTreeItem(
                          category, 
                          'category', 
                          1, 
                          isCatExpanded, 
                          hasWorkflows, 
                          (e) => toggleCategoryExpansion(category.id, e)
                        )}
                        
                        {hasWorkflows && isCatExpanded && (
                          <div className="ml-2">
                            {hierarchyData.categories[category.id].map(workflow => (
                              <React.Fragment key={workflow.id}>
                                {renderTreeItem(workflow, 'workflow', 2)}
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </React.Fragment>
          );
        })}
        
        {hierarchyData.applications.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            No items found
          </div>
        )}
      </div>
    );
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="space-y-2 border rounded-md p-3 bg-background shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Workflow Hierarchy</h3>
        <Button variant="ghost" size="icon" onClick={onToggleVisibility}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Hide navigation</span>
        </Button>
      </div>
      
      <Separator className="my-2" />
      
      {renderHierarchyTree()}
    </div>
  );
};

export default WorkflowHierarchyNavigation;