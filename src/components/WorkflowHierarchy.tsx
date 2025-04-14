import React, { useState, useEffect } from 'react';
import { 
  HierarchyLevel, 
  mockHierarchicalWorkflows, 
  flattenedHierarchy 
} from '@/data/hierarchicalWorkflowData';
import HierarchyLevelItem from './HierarchyLevelItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface WorkflowHierarchyProps {
  onSelectLevel?: (level: HierarchyLevel) => void;
}

const WorkflowHierarchy: React.FC<WorkflowHierarchyProps> = ({ onSelectLevel }) => {
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({});
  const [hierarchyData, setHierarchyData] = useState<HierarchyLevel[]>(flattenedHierarchy);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [countdown, setCountdown] = useState<number>(15);
  
  // Initialize with applications expanded
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    hierarchyData.forEach(level => {
      if (level.level === 0) {
        initialExpanded[level.id] = true;
      }
    });
    setExpandedLevels(initialExpanded);
  }, []);
  
  // Handle refresh countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Refresh data when countdown reaches 0
          refreshData();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const refreshData = () => {
    // In a real application, this would fetch fresh data from the API
    // For now, we'll just update the timestamp
    setLastRefreshed(new Date());
    setHierarchyData(flattenedHierarchy);
  };
  
  const toggleLevel = (levelId: string) => {
    setExpandedLevels(prev => ({
      ...prev,
      [levelId]: !prev[levelId]
    }));
  };
  
  const handleSelectLevel = (level: HierarchyLevel) => {
    if (onSelectLevel) {
      onSelectLevel(level);
    }
  };
  
  // Build a tree structure for rendering
  const buildHierarchyTree = () => {
    // First, get all top-level items (applications)
    const topLevelItems = hierarchyData.filter(item => item.level === 0);
    
    const renderLevel = (level: HierarchyLevel, indentLevel: number, isLast: boolean) => {
      const isExpanded = !!expandedLevels[level.id];
      
      // Find direct children of this level
      const children = hierarchyData.filter(item => item.parentId === level.id);
      
      return (
        <React.Fragment key={level.id}>
          <HierarchyLevelItem 
            level={level}
            expanded={isExpanded}
            onToggle={() => toggleLevel(level.id)}
            onSelect={() => handleSelectLevel(level)}
            indentLevel={indentLevel}
            isLast={isLast && children.length === 0}
          />
          
          {isExpanded && children.map((child, index) => (
            renderLevel(child, indentLevel + 1, index === children.length - 1)
          ))}
        </React.Fragment>
      );
    };
    
    return topLevelItems.map((item, index) => 
      renderLevel(item, 0, index === topLevelItems.length - 1)
    );
  };
  
  // Format the last refreshed time
  const formatLastRefreshed = () => {
    return lastRefreshed.toLocaleTimeString();
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Workflow Hierarchy</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Last refreshed: {formatLastRefreshed()}</span>
          <span>|</span>
          <span>Refresh in: {countdown}s</span>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={refreshData}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {buildHierarchyTree()}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowHierarchy;