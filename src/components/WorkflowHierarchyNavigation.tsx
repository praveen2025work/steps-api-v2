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
  const getItemsToShow = () => {
    if (currentPath.length === 0) {
      return { items: hierarchyData.applications, level: 'application' };
    }
    
    const lastId = currentPath[currentPath.length - 1];
    if (hierarchyData.categories[lastId]) {
      return { items: hierarchyData.categories[lastId], level: 'category' };
    }
    
    return { items: [], level: 'workflow' };
  };

  const { items, level } = getItemsToShow();

  // Generate breadcrumb from current path
  const generateBreadcrumb = () => {
    if (currentPath.length === 0) return null;

    return (
      <div className="flex items-center text-sm text-muted-foreground mb-4 overflow-x-auto">
        <span 
          className="cursor-pointer hover:text-primary"
          onClick={() => onNavigate('', 'root')}
        >
          Applications
        </span>
        
        {currentPath.map((id, index) => {
          // Find the name for this id
          let name = '';
          if (index === 0) {
            const app = hierarchyData.applications.find(a => a.id === id);
            name = app?.name || id;
          } else {
            const parentId = currentPath[index - 1];
            const category = hierarchyData.categories[parentId]?.find(c => c.id === id);
            name = category?.name || id;
          }
          
          return (
            <React.Fragment key={id}>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span 
                className={index === currentPath.length - 1 
                  ? "font-medium text-foreground" 
                  : "cursor-pointer hover:text-primary"}
                onClick={() => {
                  if (index < currentPath.length - 1) {
                    onNavigate(id, index === 0 ? 'application' : 'category');
                  }
                }}
              >
                {name}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          {level === 'application' ? 'Applications' : 
           level === 'category' ? 'Categories' : 'Workflows'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {generateBreadcrumb()}
        
        <div className="space-y-3">
          {items.map((item) => (
            <div 
              key={item.id}
              className="p-3 rounded-md bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors"
              onClick={() => onNavigate(item.id, level)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{item.name}</div>
                <Badge variant="outline">{item.completion}%</Badge>
              </div>
              <Progress value={item.completion} className="h-2" />
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