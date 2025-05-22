import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdvancedFilePreview from "@/components/files/AdvancedFilePreview";
import StageOverview from "@/components/workflow/StageOverview";
import AppParameters from "@/components/workflow/AppParameters";
import GlobalParameters from "@/components/workflow/GlobalParameters";
import ProcessOverview from "@/components/workflow/ProcessOverview";
import ProcessParameters from "@/components/workflow/ProcessParameters";
import ProcessDependencies from "@/components/workflow/ProcessDependencies";
import ProcessQueries from "@/components/workflow/ProcessQueries";
import { 
  FileText, 
  PanelLeft, 
  PanelRight, 
  PanelLeftClose, 
  PanelRightClose,
  Lock,
  Unlock,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRightCircle
} from "lucide-react";

interface ProcessDetailsViewProps {
  process: any;
  subStage?: any;
  onBack?: () => void;
  onClose?: () => void;
}

interface ProcessListItemProps {
  process: any;
  isSelected: boolean;
  onClick: () => void;
}

// Process List Item Component
const ProcessListItem: React.FC<ProcessListItemProps> = ({ process, isSelected, onClick }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'In Progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'Pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'Failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'Not Started':
        return <ArrowRightCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div 
      className={`p-3 border rounded-md mb-2 cursor-pointer hover:bg-accent/10 ${isSelected ? 'bg-accent/20 border-primary' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon(process.status)}
          <div>
            <p className="font-medium text-sm">{process.name}</p>
            <p className="text-xs text-muted-foreground">{process.id}</p>
          </div>
        </div>
        <Badge variant={
          process.status === "Completed" ? "outline" : 
          process.status === "In Progress" ? "default" : 
          process.status === "Failed" ? "destructive" : 
          "secondary"
        }>
          {process.status}
        </Badge>
      </div>
    </div>
  );
};

const ProcessDetailsView: React.FC<ProcessDetailsViewProps> = ({
  process,
  subStage,
  onBack,
  onClose
}) => {
  // State for panel visibility
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  
  // State for selected file and workflow detail tab
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [workflowDetailTab, setWorkflowDetailTab] = useState("stageOverview");
  
  // State for left panel content
  const [leftPanelContent, setLeftPanelContent] = useState<'processes' | 'dependencies'>('processes');
  const [selectedDependencyType, setSelectedDependencyType] = useState<'parent' | 'child'>('parent');
  
  // Toggle panels
  const toggleLeftPanel = () => setShowLeftPanel(!showLeftPanel);
  const toggleRightPanel = () => setShowRightPanel(!showRightPanel);
  
  // Handle file selection
  const handleFileClick = (file: any) => {
    if (!file || !file.id) {
      console.error("Invalid file object:", file);
      return;
    }
    setSelectedFile(file);
  };
  
  // Handle dependency view
  const handleViewDependencies = (type: 'parent' | 'child') => {
    setLeftPanelContent('dependencies');
    setSelectedDependencyType(type);
    setShowLeftPanel(true);
  };
  
  // Determine layout classes based on panel visibility
  const getLayoutClasses = () => {
    if (showLeftPanel && showRightPanel) {
      return {
        container: "grid grid-cols-12 gap-4",
        leftPanel: "col-span-3",
        previewArea: "col-span-6",
        rightPanel: "col-span-3"
      };
    } else if (showLeftPanel) {
      return {
        container: "grid grid-cols-12 gap-4",
        leftPanel: "col-span-3",
        previewArea: "col-span-9",
        rightPanel: "hidden"
      };
    } else if (showRightPanel) {
      return {
        container: "grid grid-cols-12 gap-4",
        leftPanel: "hidden",
        previewArea: "col-span-9",
        rightPanel: "col-span-3"
      };
    } else {
      return {
        container: "grid grid-cols-1 gap-4",
        leftPanel: "hidden",
        previewArea: "col-span-1",
        rightPanel: "hidden"
      };
    }
  };
  
  const layoutClasses = getLayoutClasses();
  
  // Mock data for other processes
  const mockOtherProcesses = [
    { 
      id: "PROC-001", 
      name: "eRates Validation", 
      status: "In Progress",
      priority: "High"
    },
    { 
      id: "PROC-002", 
      name: "PnL Calculation", 
      status: "Pending",
      priority: "Medium"
    },
    { 
      id: "PROC-003", 
      name: "Risk Reporting", 
      status: "Completed",
      priority: "Low"
    },
    { 
      id: "PROC-004", 
      name: "Compliance Check", 
      status: "Failed",
      priority: "Critical"
    },
    { 
      id: "PROC-005", 
      name: "Market Data Import", 
      status: "In Progress",
      priority: "High"
    }
  ];
  
  // Helper function to safely render file buttons
  const renderFileButtons = (files: any[] | undefined) => {
    if (!files || !Array.isArray(files) || files.length === 0) {
      return <div className="text-muted-foreground text-sm">No files available</div>;
    }

    return files.map((file: any) => {
      if (!file || !file.id) return null;
      return (
        <Button 
          key={file.id}
          variant={selectedFile?.id === file.id ? "default" : "outline"}
          size="sm"
          onClick={() => handleFileClick(file)}
          className="flex items-center"
        >
          <FileText className="h-4 w-4 mr-2" />
          {file.name || 'Unnamed File'}
        </Button>
      );
    });
  };
  
  return (
    <div className="space-y-4">
      {/* Horizontal Sub-Stage Card (Always Visible) */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {onBack && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onBack}
                    className="mr-2"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                )}
                <div>
                  <CardTitle>{process?.name || 'Process Details'}</CardTitle>
                  <CardDescription>
                    {process?.application || 'Unknown'} &gt; {process?.instance || 'Unknown'} &gt; {process?.stage || 'Unknown'}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {/* Action Buttons */}
                <Button variant="outline" size="sm">
                  <Lock className="h-4 w-4 mr-2" />
                  Lock
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                
                {/* Panel Toggle Buttons */}
                <Button 
                  variant={showLeftPanel ? "default" : "outline"} 
                  size="icon"
                  onClick={toggleLeftPanel}
                  title={showLeftPanel ? "Hide left panel" : "Show left panel"}
                >
                  {showLeftPanel ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
                </Button>
                <Button 
                  variant={showRightPanel ? "default" : "outline"} 
                  size="icon"
                  onClick={toggleRightPanel}
                  title={showRightPanel ? "Hide right panel" : "Show right panel"}
                >
                  {showRightPanel ? <PanelRightClose className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
                </Button>
                
                {onClose && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Process Status Information */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-1">Files:</span>
                  {(subStage?.files || process?.files) && (
                    <div className="flex items-center gap-2">
                      {renderFileButtons(subStage?.files || process?.files)}
                    </div>
                  )}
                </div>
                
                <Badge className="ml-2" variant={subStage?.status === "In Progress" ? "default" : "outline"}>
                  Status: {subStage?.status || process?.status || 'Unknown'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm">
                  <span className="font-medium">Assigned:</span> {subStage?.assignedTo || process?.assignedTo || 'Unassigned'}
                </span>
                
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {subStage?.priority || process?.priority || 'No Priority'}
                </Badge>
              </div>
            </div>
            
            {/* Process ID and Dependencies */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <span className="mr-4">ID: <span className="font-medium">{subStage?.id || process?.id || 'Unknown'}</span></span>
                
                {process?.dependencies && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-sm h-8 px-2"
                      onClick={() => handleViewDependencies('parent')}
                    >
                      Parents ({process.dependencies.parent?.length || 0})
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-sm h-8 px-2"
                      onClick={() => handleViewDependencies('child')}
                    >
                      Children ({process.dependencies.child?.length || 0})
                    </Button>
                  </>
                )}
              </div>
              
              <div className="flex items-center">
                {process?.dueDate && (
                  <span className="flex items-center text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    Due: <span className="font-medium ml-1">{process.dueDate}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Main Content Area with Dynamic Panels */}
      <div className={layoutClasses.container}>
        {/* Left Panel (Process List or Dependencies) */}
        {showLeftPanel && (
          <Card className={layoutClasses.leftPanel}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  {leftPanelContent === 'processes' ? 'Other Processes' : 
                   selectedDependencyType === 'parent' ? 'Parent Dependencies' : 'Child Dependencies'}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {leftPanelContent === 'dependencies' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setLeftPanelContent('processes')}
                    >
                      Back to Processes
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={toggleLeftPanel}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="h-[calc(100vh-300px)]">
                {leftPanelContent === 'processes' ? (
                  <div className="space-y-2">
                    {mockOtherProcesses.map(proc => (
                      <ProcessListItem 
                        key={proc.id}
                        process={proc}
                        isSelected={proc.id === process?.id}
                        onClick={() => {/* Handle process selection */}}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDependencyType === 'parent' ? (
                      process?.dependencies?.parent?.length > 0 ? (
                        process.dependencies.parent.map((dep: any) => (
                          <div key={dep.id} className="border rounded-md p-3 mb-3">
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <h4 className="font-medium">{dep.name}</h4>
                                <p className="text-sm text-muted-foreground">ID: {dep.id}</p>
                              </div>
                              <Badge variant={
                                dep.status === "Completed" ? "outline" : 
                                dep.status === "In Progress" ? "default" : 
                                "secondary"
                              }>
                                {dep.status}
                              </Badge>
                            </div>
                            
                            {dep.files && dep.files.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium mb-1">Files:</p>
                                <div className="flex flex-wrap gap-2">
                                  {dep.files.map((file: any) => (
                                    <Button 
                                      key={file.id}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleFileClick(file)}
                                      className="flex items-center"
                                    >
                                      <FileText className="h-3 w-3 mr-1" />
                                      {file.name}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center p-4 text-muted-foreground">
                          No parent dependencies found
                        </div>
                      )
                    ) : (
                      process?.dependencies?.child?.length > 0 ? (
                        process.dependencies.child.map((dep: any) => (
                          <div key={dep.id} className="border rounded-md p-3 mb-3">
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <h4 className="font-medium">{dep.name}</h4>
                                <p className="text-sm text-muted-foreground">ID: {dep.id}</p>
                              </div>
                              <Badge variant={
                                dep.status === "Completed" ? "outline" : 
                                dep.status === "In Progress" ? "default" : 
                                "secondary"
                              }>
                                {dep.status}
                              </Badge>
                            </div>
                            
                            {dep.files && dep.files.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium mb-1">Files:</p>
                                <div className="flex flex-wrap gap-2">
                                  {dep.files.map((file: any) => (
                                    <Button 
                                      key={file.id}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleFileClick(file)}
                                      className="flex items-center"
                                    >
                                      <FileText className="h-3 w-3 mr-1" />
                                      {file.name}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center p-4 text-muted-foreground">
                          No child dependencies found
                        </div>
                      )
                    )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        )}
        
        {/* Preview Area (Center) */}
        <Card className={layoutClasses.previewArea}>
          {selectedFile ? (
            <div className="file-preview-container">
              <div className="file-preview-wrapper">
                {(() => {
                  try {
                    // Safely extract file properties
                    const fileId = selectedFile?.id || '';
                    const fileName = selectedFile?.name || 'Unknown File';
                    
                    // Only render if we have valid data
                    if (!fileId) {
                      return (
                        <div className="p-4 text-center text-muted-foreground">
                          Invalid file data
                        </div>
                      );
                    }
                    
                    return (
                      <AdvancedFilePreview 
                        key={fileId}
                        fileId={fileId} 
                        fileName={fileName} 
                        onClose={() => setSelectedFile(null)} 
                      />
                    );
                  } catch (error) {
                    console.error("Error rendering AdvancedFilePreview:", error);
                    return (
                      <div className="p-4 text-center border border-red-200 bg-red-50 text-red-800 rounded-md">
                        Error loading file preview. Please try again.
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4 border border-dashed rounded-md">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No File Selected</h3>
              <p className="text-muted-foreground max-w-md">
                Select a file from the horizontal bar above to preview its contents.
              </p>
            </div>
          )}
        </Card>
        
        {/* Right Panel (Workflow Details) */}
        {showRightPanel && (
          <Card className={layoutClasses.rightPanel}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Workflow Details</CardTitle>
                <Button variant="ghost" size="icon" onClick={toggleRightPanel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={workflowDetailTab} onValueChange={setWorkflowDetailTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-0">
                  <TabsTrigger value="stageOverview">Stage</TabsTrigger>
                  <TabsTrigger value="processOverview">Process</TabsTrigger>
                </TabsList>
                
                <ScrollArea className="h-[calc(100vh-300px)] p-4">
                  <TabsContent value="stageOverview" className="mt-0 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Stage Overview</h3>
                      <Button variant="ghost" size="sm" onClick={() => setWorkflowDetailTab("appConfig")}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <StageOverview 
                      stageId={process?.id || ''} 
                      stageName={process?.stage || ''} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="appConfig" className="mt-0 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">App Configuration</h3>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => setWorkflowDetailTab("stageOverview")}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setWorkflowDetailTab("globalConfig")}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <AppParameters 
                      processId={process?.id || ''} 
                      processName={process?.name || ''} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="globalConfig" className="mt-0 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Global Configuration</h3>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => setWorkflowDetailTab("appConfig")}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setWorkflowDetailTab("processOverview")}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <GlobalParameters 
                      processId={process?.id || ''} 
                      processName={process?.name || ''} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="processOverview" className="mt-0 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Process Overview</h3>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => setWorkflowDetailTab("globalConfig")}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setWorkflowDetailTab("processConfig")}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <ProcessOverview 
                      processId={process?.id || ''} 
                      processName={process?.name || ''} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="processConfig" className="mt-0 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Process Configuration</h3>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => setWorkflowDetailTab("processOverview")}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setWorkflowDetailTab("dependencies")}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <ProcessParameters 
                      processId={process?.id || ''} 
                      processName={process?.name || ''} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="dependencies" className="mt-0 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Dependencies</h3>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => setWorkflowDetailTab("processConfig")}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setWorkflowDetailTab("queries")}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <ProcessDependencies 
                      processId={process?.id || ''} 
                      processName={process?.name || ''} 
                      onDependencyClick={(dependency) => {
                        // Handle dependency click - could navigate to the dependency
                        console.log("Dependency clicked:", dependency);
                      }}
                    />
                  </TabsContent>
                  
                  <TabsContent value="queries" className="mt-0 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Queries</h3>
                      <Button variant="ghost" size="sm" onClick={() => setWorkflowDetailTab("dependencies")}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </div>
                    <ProcessQueries 
                      processId={process?.id || ''} 
                      processName={process?.name || ''} 
                    />
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProcessDetailsView;