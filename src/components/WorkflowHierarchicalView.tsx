import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ArrowLeft, Layers, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import WorkflowHierarchyBreadcrumb, { HierarchyNode } from './WorkflowHierarchyBreadcrumb';
import { 
  sampleApplications, 
  sampleBusinessAreas, 
  sampleWorkflowInstances, 
  sampleWorkflowProcessSteps,
  getWorkflowHierarchyPath,
  convertToHierarchyNodes
} from '@/data/hierarchicalWorkflowSampleData';

interface WorkflowHierarchicalViewProps {
  initialLevel?: 'applications' | 'businessAreas' | 'workflowInstances' | 'processSteps';
  initialId?: number;
}

const WorkflowHierarchicalView: React.FC<WorkflowHierarchicalViewProps> = ({ 
  initialLevel = 'applications',
  initialId
}) => {
  const router = useRouter();
  const [currentLevel, setCurrentLevel] = useState<'applications' | 'businessAreas' | 'workflowInstances' | 'processSteps'>(initialLevel);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [selectedBusinessAreaId, setSelectedBusinessAreaId] = useState<number | null>(null);
  const [selectedWorkflowInstanceId, setSelectedWorkflowInstanceId] = useState<number | null>(null);
  const [hierarchyPath, setHierarchyPath] = useState<HierarchyNode[]>([]);
  
  // Initialize based on props
  useEffect(() => {
    if (initialId) {
      if (initialLevel === 'businessAreas') {
        const businessArea = sampleBusinessAreas.find(ba => ba.configId === initialId);
        if (businessArea) {
          setSelectedAppId(businessArea.appId);
          setSelectedBusinessAreaId(initialId);
          updateHierarchyPath();
        }
      } else if (initialLevel === 'workflowInstances') {
        const workflowInstance = sampleWorkflowInstances.find(wi => wi.configId === initialId);
        if (workflowInstance && workflowInstance.businessAreaId) {
          const businessArea = sampleBusinessAreas.find(ba => ba.configId === workflowInstance.businessAreaId);
          if (businessArea) {
            setSelectedAppId(businessArea.appId);
            setSelectedBusinessAreaId(workflowInstance.businessAreaId);
            setSelectedWorkflowInstanceId(initialId);
            updateHierarchyPath();
          }
        }
      }
    }
  }, [initialLevel, initialId]);
  
  // Update hierarchy path whenever selections change
  useEffect(() => {
    updateHierarchyPath();
  }, [selectedAppId, selectedBusinessAreaId, selectedWorkflowInstanceId]);
  
  const updateHierarchyPath = () => {
    const path: HierarchyNode[] = [];
    
    // Add application if selected
    if (selectedAppId) {
      const app = sampleApplications.find(a => a.appId === selectedAppId);
      if (app) {
        path.push({
          id: app.appId.toString(),
          name: app.configName,
          progress: app.percentageCompleted,
          level: 'app'
        });
      }
    }
    
    // Add business area if selected
    if (selectedBusinessAreaId) {
      const businessArea = sampleBusinessAreas.find(ba => ba.configId === selectedBusinessAreaId);
      if (businessArea) {
        path.push({
          id: businessArea.configId.toString(),
          name: businessArea.name,
          progress: businessArea.percentageCompleted,
          level: 'workflow'
        });
      }
    }
    
    // Add workflow instance if selected
    if (selectedWorkflowInstanceId) {
      const workflowInstance = sampleWorkflowInstances.find(wi => wi.configId === selectedWorkflowInstanceId);
      if (workflowInstance) {
        path.push({
          id: workflowInstance.configId.toString(),
          name: workflowInstance.name,
          progress: workflowInstance.percentageCompleted,
          level: 'hierarchy'
        });
      }
    }
    
    setHierarchyPath(path);
  };
  
  const handleSelectApplication = (appId: number) => {
    setSelectedAppId(appId);
    setSelectedBusinessAreaId(null);
    setSelectedWorkflowInstanceId(null);
    setCurrentLevel('businessAreas');
  };
  
  const handleSelectBusinessArea = (businessAreaId: number) => {
    setSelectedBusinessAreaId(businessAreaId);
    setSelectedWorkflowInstanceId(null);
    setCurrentLevel('workflowInstances');
  };
  
  const handleSelectWorkflowInstance = (workflowInstanceId: number) => {
    setSelectedWorkflowInstanceId(workflowInstanceId);
    setCurrentLevel('processSteps');
  };
  
  const handleHierarchyNodeClick = (node: HierarchyNode) => {
    if (node.level === 'app') {
      setSelectedAppId(parseInt(node.id));
      setSelectedBusinessAreaId(null);
      setSelectedWorkflowInstanceId(null);
      setCurrentLevel('businessAreas');
    } else if (node.level === 'workflow') {
      setSelectedBusinessAreaId(parseInt(node.id));
      setSelectedWorkflowInstanceId(null);
      setCurrentLevel('workflowInstances');
    } else if (node.level === 'hierarchy') {
      setSelectedWorkflowInstanceId(parseInt(node.id));
      setCurrentLevel('processSteps');
    }
  };
  
  const handleHomeClick = () => {
    setSelectedAppId(null);
    setSelectedBusinessAreaId(null);
    setSelectedWorkflowInstanceId(null);
    setCurrentLevel('applications');
  };
  
  const renderApplications = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Level 1 - Applications</h2>
        <p className="text-sm text-muted-foreground mb-4">These are high-level applications available on 11 Apr 2025.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleApplications.map(app => (
            <Card 
              key={app.appId} 
              className="cursor-pointer hover:bg-accent/5 transition-colors"
              onClick={() => handleSelectApplication(app.appId)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{app.configName}</CardTitle>
                  <Badge variant={app.isConfigured ? "default" : "outline"}>
                    {app.isConfigured ? "Configured" : "Not Configured"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">App ID:</span>
                    <span>{app.appId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Config Type:</span>
                    <span>{app.configType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Percentage Completed:</span>
                    <span className="font-medium">{app.percentageCompleted}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Used for Workflow Instance:</span>
                    <span>{app.usedForWorkflowInstance ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Next Level:</span>
                    <span>{app.nextLevel}</span>
                  </div>
                  
                  <div className="pt-2 flex justify-end">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <span>View Details</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };
  
  const renderBusinessAreas = () => {
    const filteredBusinessAreas = selectedAppId 
      ? sampleBusinessAreas.filter(ba => ba.appId === selectedAppId)
      : sampleBusinessAreas;
    
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Level 2 - Business Areas (Asset Classes)</h2>
        <p className="text-sm text-muted-foreground mb-4">
          For the selected app, these are the associated business areas:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBusinessAreas.map(businessArea => (
            <Card 
              key={businessArea.configId} 
              className="cursor-pointer hover:bg-accent/5 transition-colors"
              onClick={() => handleSelectBusinessArea(businessArea.configId)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{businessArea.name}</CardTitle>
                  <Badge variant={businessArea.isConfigured ? "default" : "outline"}>
                    {businessArea.isConfigured ? "Configured" : "Not Configured"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Config ID:</span>
                    <span>{businessArea.configId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Config Type:</span>
                    <span>{businessArea.configType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Percentage Completed:</span>
                    <span className="font-medium">{businessArea.percentageCompleted}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Next Level:</span>
                    <span>{businessArea.nextLevel}</span>
                  </div>
                  
                  <div className="pt-2 flex justify-end">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <span>View Details</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };
  
  const renderWorkflowInstances = () => {
    const filteredWorkflowInstances = selectedBusinessAreaId 
      ? sampleWorkflowInstances.filter(wi => wi.businessAreaId === selectedBusinessAreaId)
      : sampleWorkflowInstances;
    
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Level 3 - Workflow Instances (Named PnL Ids)</h2>
        <p className="text-sm text-muted-foreground mb-4">
          For business areas above, these are detailed workflow instances:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWorkflowInstances.map(workflowInstance => (
            <Card 
              key={workflowInstance.configId} 
              className="cursor-pointer hover:bg-accent/5 transition-colors"
              onClick={() => handleSelectWorkflowInstance(workflowInstance.configId)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{workflowInstance.name}</CardTitle>
                  <Badge variant={workflowInstance.isUsedForWorkflowInstance ? "default" : "outline"}>
                    {workflowInstance.isUsedForWorkflowInstance ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Config ID:</span>
                    <span>{workflowInstance.configId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">App ID:</span>
                    <span>{workflowInstance.appId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Percentage Completed:</span>
                    <span className="font-medium">{workflowInstance.percentageCompleted}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Is Weekly:</span>
                    <span>{workflowInstance.isWeekly ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Next Level:</span>
                    <span>{workflowInstance.nextLevel}</span>
                  </div>
                  
                  <div className="pt-2 flex justify-end">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <span>View Details</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };
  
  const renderProcessSteps = () => {
    const filteredProcessSteps = selectedWorkflowInstanceId 
      ? sampleWorkflowProcessSteps.filter(ps => ps.configId === selectedWorkflowInstanceId)
      : sampleWorkflowProcessSteps;
    
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Workflow Process Data (Detailed Step Info)</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {selectedWorkflowInstanceId 
            ? `For Config ID: ${selectedWorkflowInstanceId} on 11 Apr 2025:`
            : 'Workflow process steps:'}
        </p>
        
        <div className="space-y-4">
          {filteredProcessSteps.map((step, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{step.stage} - {step.subStage}</CardTitle>
                  <Badge variant={step.status === "COMPLETED" ? "default" : "outline"}>
                    {step.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Service Link:</span>
                      <span className="font-mono text-xs truncate max-w-[200px]">{step.serviceLink}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Auto:</span>
                      <span>{step.auto ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Adhoc:</span>
                      <span>{step.adhoc ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Alteryx:</span>
                      <span>{step.alteryx ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Upload Allowed:</span>
                      <span>{step.uploadAllowed ? "Yes" : "No"}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Attestation Required:</span>
                      <span>{step.attestationRequired ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Dependencies Present:</span>
                      <span>{step.dependenciesPresent ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Updated On:</span>
                      <span>{step.updatedOn}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Completed By:</span>
                      <span>{step.completedBy || "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{step.duration}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Workflow ID:</span>
                      <span>{step.workflowId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Workflow App Config ID:</span>
                      <span>{step.workflowAppConfigId}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <WorkflowHierarchyBreadcrumb 
        nodes={hierarchyPath}
        onNodeClick={handleHierarchyNodeClick}
        onHomeClick={handleHomeClick}
      />
      
      {/* Back Button (except at top level) */}
      {currentLevel !== 'applications' && (
        <Button 
          variant="outline" 
          size="sm" 
          className="mb-4 flex items-center gap-1"
          onClick={() => {
            if (currentLevel === 'processSteps' && selectedBusinessAreaId) {
              setSelectedWorkflowInstanceId(null);
              setCurrentLevel('workflowInstances');
            } else if (currentLevel === 'workflowInstances' && selectedAppId) {
              setSelectedBusinessAreaId(null);
              setCurrentLevel('businessAreas');
            } else {
              setSelectedAppId(null);
              setCurrentLevel('applications');
            }
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
      )}
      
      {/* Render appropriate view based on current level */}
      {currentLevel === 'applications' && renderApplications()}
      {currentLevel === 'businessAreas' && renderBusinessAreas()}
      {currentLevel === 'workflowInstances' && renderWorkflowInstances()}
      {currentLevel === 'processSteps' && renderProcessSteps()}
    </div>
  );
};

export default WorkflowHierarchicalView;