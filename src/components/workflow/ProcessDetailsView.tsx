import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
  AlertTriangle
} from "lucide-react";

interface ProcessDetailsViewProps {
  process: any;
  subStage?: any;
  onBack?: () => void;
  onClose?: () => void;
}

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
                {/* Process Status Information */}
                <div className="flex items-center mr-4">
                  <Badge className="mr-2" variant={subStage?.status === "In Progress" ? "default" : "outline"}>
                    {subStage?.status || process?.status || 'Unknown Status'}
                  </Badge>
                  <Badge variant="outline" className="mr-2">
                    {subStage?.priority || process?.priority || 'No Priority'}
                  </Badge>
                  <span className="text-sm mr-2">
                    <span className="text-muted-foreground">Assigned:</span> {subStage?.assignedTo || process?.assignedTo || 'Unassigned'}
                  </span>
                </div>
                
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
            
            {/* File buttons in header */}
            {(subStage?.files || process?.files) && (
              <div className="flex flex-wrap gap-2">
                {renderFileButtons(subStage?.files || process?.files)}
              </div>
            )}
            
            {/* Process ID and Trigger Info */}
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="mr-4">ID: <span className="font-medium">{subStage?.id || process?.id || 'Unknown'}</span></span>
              {process?.dependencies && (
                <>
                  <span className="mr-4">
                    Parents: <span className="font-medium">{process.dependencies.parent?.length || 0}</span>
                  </span>
                  <span className="mr-4">
                    Children: <span className="font-medium">{process.dependencies.child?.length || 0}</span>
                  </span>
                </>
              )}
              {process?.dueDate && (
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Due: <span className="font-medium ml-1">{process.dueDate}</span>
                </span>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Main Content Area with Dynamic Panels */}
      <div className={layoutClasses.container}>
        {/* Left Panel (Process Details) */}
        {showLeftPanel && (
          <Card className={layoutClasses.leftPanel}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Process Details</CardTitle>
                <Button variant="ghost" size="icon" onClick={toggleLeftPanel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Process Information</h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">ID:</span>
                    <span className="font-medium">{process?.id || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={process?.status === "In Progress" ? "default" : "outline"}>
                      {process?.status || 'Unknown'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Priority:</span>
                    <Badge variant="outline">{process?.priority || 'None'}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Assigned To:</span>
                    <span>{process?.assignedTo || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span>{process?.dueDate || 'Not set'}</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {subStage && (
                <>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Sub-Stage Details</h3>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{subStage.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={subStage.status === "In Progress" ? "default" : "outline"}>
                          {subStage.status || 'Unknown'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Start Time:</span>
                        <span>{subStage.startTime || 'Not started'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Est. Completion:</span>
                        <span>{subStage.estimatedCompletion || 'Unknown'}</span>
                      </div>
                    </div>
                    
                    {subStage.progress !== undefined && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Progress</span>
                          <span className="text-sm">{subStage.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${subStage.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                </>
              )}
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Actions</h3>
                <div className="flex flex-col space-y-2">
                  <Button size="sm">Complete Process</Button>
                  <Button size="sm" variant="outline">Reassign</Button>
                  <Button size="sm" variant="outline">Add Comment</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Preview Area (Center) */}
        <Card className={layoutClasses.previewArea}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                {selectedFile ? `Preview: ${selectedFile.name}` : 'Preview Area'}
              </CardTitle>
              {selectedFile && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Close Preview
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
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
              <div className="flex flex-col items-center justify-center h-[50vh] text-center p-4 border border-dashed rounded-md">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No File Selected</h3>
                <p className="text-muted-foreground max-w-md">
                  Select a file from the horizontal bar above to preview its contents.
                </p>
              </div>
            )}
          </CardContent>
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
            <CardContent>
              <Tabs value={workflowDetailTab} onValueChange={setWorkflowDetailTab}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="stageOverview">Stage</TabsTrigger>
                  <TabsTrigger value="processOverview">Process</TabsTrigger>
                </TabsList>
                
                <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
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
                </div>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProcessDetailsView;