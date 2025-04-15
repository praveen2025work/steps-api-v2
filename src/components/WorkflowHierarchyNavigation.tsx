import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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
};

const WorkflowHierarchyNavigation: React.FC<WorkflowHierarchyNavigationProps> = ({
  hierarchyData,
  currentPath = [],
  onNavigate = () => {},
}) => {
  // Determine which items to show based on the current path
  // Modified to show one level backwards instead of the current level
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

  const { items, level, title } = getItemsToShow();

  // Generate breadcrumb from current path
  const generateBreadcrumb = () => {
    if (!currentPath || currentPath.length === 0) return null;

    return (
      <div className="flex items-center text-xs text-muted-foreground mb-2 overflow-x-auto">
        <span 
          className="cursor-pointer hover:text-primary"
          onClick={() => onNavigate('', 'root')}
        >
          Apps
        </span>
        
        {currentPath.map((id, index) => {
          if (!id) return null;
          
          // Find the name for this id
          let name = '';
          if (index === 0) {
            const app = hierarchyData.applications?.find(a => a.id === id);
            name = app?.name || id;
          } else {
            const parentId = currentPath[index - 1];
            if (parentId && hierarchyData.categories) {
              const category = hierarchyData.categories[parentId]?.find(c => c.id === id);
              name = category?.name || id;
            } else {
              name = id;
            }
          }
          
          // Truncate long names
          const displayName = name.length > 15 ? name.substring(0, 12) + '...' : name;
          
          return (
            <React.Fragment key={id}>
              <ChevronRight className="h-3 w-3 mx-1" />
              <span 
                className={index === currentPath.length - 1 
                  ? "font-medium text-foreground" 
                  : "cursor-pointer hover:text-primary"}
                onClick={() => {
                  if (index < currentPath.length - 1) {
                    onNavigate(id, index === 0 ? 'application' : 'category');
                  }
                }}
                title={name}
              >
                {displayName}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-1 pt-3 px-3">
        <CardTitle className="text-lg font-medium">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 py-2">
        {generateBreadcrumb()}
        
        <div className="space-y-2">
          {items.map((item) => (
            <div 
              key={item.id}
              className="p-2 rounded-md bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors"
              onClick={() => onNavigate(item.id, level)}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium text-sm">{item.name}</div>
                <Badge variant="outline" className="text-xs py-0 h-5">{item.completion}%</Badge>
              </div>
              <Progress value={item.completion} className="h-1.5" />
            </div>
          ))}
          
          {items.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              No items found at this level
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowHierarchyNavigation;