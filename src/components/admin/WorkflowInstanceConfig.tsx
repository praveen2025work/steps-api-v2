import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, ArrowRight, ArrowDown, Link, LinkOff, Save, FileUp, FileDown } from 'lucide-react';
import { StageConfig, SubStageConfig, Parameter, WorkflowNodeConfig } from '@/types/workflow-types';

// Sample data for hierarchy nodes
const sampleHierarchyNodes = [
  { id: 'node1', name: 'Global' },
  { id: 'node2', name: 'North America' },
  { id: 'node3', name: 'Europe' },
  { id: 'node4', name: 'Asia Pacific' },
  { id: 'node5', name: 'United States' },
  { id: 'node6', name: 'Canada' },
];

// Sample data for applications
const sampleApplications = [
  { id: 'app1', name: 'Credit Risk Assessment' },
  { id: 'app2', name: 'Loan Approval' },
  { id: 'app3', name: 'Regulatory Reporting' },
  { id: 'app4', name: 'Customer Onboarding' },
];

// Sample data for stages and substages
const sampleStages: StageConfig[] = [
  {
    id: '1',
    name: 'Data Collection',
    description: 'Collect all required data for the workflow',
    subStages: [
      {
        id: '1-1',
        name: 'Initial Data Entry',
        description: 'Enter basic information',
        type: 'manual',
        parameters: [
          { id: 'p1', name: 'requesterName', value: '', dataType: 'string' },
          { id: 'p2', name: 'requestDate', value: '', dataType: 'date' }
        ],
        emailTemplates: [],
        attestations: [],
        expectedDuration: 24,
        order: 1
      },
      {
        id: '1-2',
        name: 'Document Upload',
        description: 'Upload supporting documents',
        type: 'manual',
        parameters: [
          { id: 'p3', name: 'documentType', value: '', dataType: 'string' }
        ],
        emailTemplates: [],
        attestations: [],
        expectedDuration: 48,
        order: 2
      }
    ],
    order: 1
  },
  {
    id: '2',
    name: 'Review',
    description: 'Review the collected data',
    subStages: [
      {
        id: '2-1',
        name: 'Manager Review',
        description: 'Review by department manager',
        type: 'manual',
        parameters: [
          { id: 'p4', name: 'reviewerName', value: '', dataType: 'string' },
          { id: 'p5', name: 'approved', value: '', dataType: 'boolean' }
        ],
        emailTemplates: [],
        attestations: [],
        expectedDuration: 72,
        order: 1
      }
    ],
    order: 2
  }
];

// Sample workflow configuration
const sampleWorkflowConfig: WorkflowNodeConfig = {
  id: 'wf1',
  nodeId: 'node5',
  nodeName: 'United States',
  applicationId: 'app2',
  stages: sampleStages,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'admin',
  updatedBy: 'admin',
  isActive: true
};

// Interface for process dependencies
interface ProcessDependency {
  sourceId: string;
  targetId: string;
}

// Extended SubStageConfig with dependencies
interface SubStageWithDependencies extends SubStageConfig {
  dependencies: string[]; // IDs of substages this one depends on
  parameterValues: { [key: string]: string }; // Actual values for parameters
}

const WorkflowInstanceConfig: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string>('');
  const [selectedApplication, setSelectedApplication] = useState<string>('');
  const [workflowConfig, setWorkflowConfig] = useState<WorkflowNodeConfig | null>(null);
  const [activeTab, setActiveTab] = useState('workflow');
  
  // Process dependencies
  const [dependencies, setDependencies] = useState<ProcessDependency[]>([]);
  
  // Dialog states
  const [addProcessDialogOpen, setAddProcessDialogOpen] = useState(false);
  const [dependencyDialogOpen, setDependencyDialogOpen] = useState(false);
  const [parameterValueDialogOpen, setParameterValueDialogOpen] = useState(false);
  
  // Selected items for dialogs
  const [selectedStage, setSelectedStage] = useState<StageConfig | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<SubStageConfig | null>(null);
  const [selectedDependency, setSelectedDependency] = useState<{source: SubStageConfig, availableTargets: SubStageConfig[]} | null>(null);
  
  // Load workflow configuration
  const loadWorkflowConfig = () => {
    // In a real application, this would fetch from an API
    setWorkflowConfig(sampleWorkflowConfig);
    
    // Set up some sample dependencies
    setDependencies([
      { sourceId: '1-2', targetId: '1-1' }, // Document Upload depends on Initial Data Entry
      { sourceId: '2-1', targetId: '1-2' }  // Manager Review depends on Document Upload
    ]);
  };
  
  // Check if a process has dependencies
  const hasDependendencies = (processId: string) => {
    return dependencies.some(dep => dep.sourceId === processId);
  };
  
  // Get dependencies for a process
  const getDependenciesForProcess = (processId: string) => {
    return dependencies
      .filter(dep => dep.sourceId === processId)
      .map(dep => dep.targetId);
  };
  
  // Find a process by ID across all stages
  const findProcessById = (processId: string): SubStageConfig | null => {
    if (!workflowConfig) return null;
    
    for (const stage of workflowConfig.stages) {
      const process = stage.subStages.find(p => p.id === processId);
      if (process) return process;
    }
    
    return null;
  };
  
  // Get all processes before the current one (potential dependencies)
  const getPotentialDependencies = (currentProcess: SubStageConfig): SubStageConfig[] => {
    if (!workflowConfig) return [];
    
    const result: SubStageConfig[] = [];
    let foundCurrent = false;
    
    // Go through stages in order
    for (const stage of workflowConfig.stages) {
      // Go through processes in order
      for (const process of stage.subStages) {
        if (process.id === currentProcess.id) {
          foundCurrent = true;
          break;
        }
        result.push(process);
      }
      if (foundCurrent) break;
    }
    
    return result;
  };
  
  // Add a new dependency
  const addDependency = (sourceId: string, targetId: string) => {
    setDependencies([...dependencies, { sourceId, targetId }]);
  };
  
  // Remove a dependency
  const removeDependency = (sourceId: string, targetId: string) => {
    setDependencies(dependencies.filter(
      dep => !(dep.sourceId === sourceId && dep.targetId === targetId)
    ));
  };
  
  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflow">Workflow Configuration</TabsTrigger>
          <TabsTrigger value="parameters">Parameter Values</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        {/* Workflow Configuration Tab */}
        <TabsContent value="workflow">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Instance Configuration</CardTitle>
              <CardDescription>Configure workflow instances for hierarchy nodes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="hierarchyNode">Hierarchy Node</Label>
                  <Select value={selectedNode} onValueChange={setSelectedNode}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a hierarchy node" />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleHierarchyNodes.map(node => (
                        <SelectItem key={node.id} value={node.id}>{node.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="application">Application</Label>
                  <Select value={selectedApplication} onValueChange={setSelectedApplication}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an application" />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleApplications.map(app => (
                        <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-between mb-4">
                <Button onClick={loadWorkflowConfig}>Load Configuration</Button>
                <div className="space-x-2">
                  <Button variant="outline">
                    <FileUp className="mr-2 h-4 w-4" /> Import
                  </Button>
                  <Button variant="outline">
                    <FileDown className="mr-2 h-4 w-4" /> Export
                  </Button>
                  <Button>
                    <Save className="mr-2 h-4 w-4" /> Save Configuration
                  </Button>
                </div>
              </div>
              
              {workflowConfig ? (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">
                    Workflow for {workflowConfig.nodeName} - {sampleApplications.find(a => a.id === workflowConfig.applicationId)?.name}
                  </h3>
                  
                  {workflowConfig.stages.map((stage, stageIndex) => (
                    <Card key={stage.id} className="mb-4">
                      <CardHeader className="py-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{stage.name}</CardTitle>
                          <Button variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" /> Add Process
                          </Button>
                        </div>
                        <CardDescription>{stage.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Process</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Dependencies</TableHead>
                              <TableHead>Parameters</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {stage.subStages.map((process, processIndex) => (
                              <TableRow key={process.id}>
                                <TableCell className="font-medium">{process.name}</TableCell>
                                <TableCell>{process.type === 'manual' ? 'Manual' : 'Automatic'}</TableCell>
                                <TableCell>
                                  {hasDependendencies(process.id) ? (
                                    <div className="flex flex-col space-y-1">
                                      {getDependenciesForProcess(process.id).map(depId => {
                                        const depProcess = findProcessById(depId);
                                        return depProcess ? (
                                          <div key={depId} className="flex items-center text-xs">
                                            <ArrowRight className="h-3 w-3 mr-1" />
                                            <span>{depProcess.name}</span>
                                            <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              className="h-5 w-5 p-0 ml-1"
                                              onClick={() => removeDependency(process.id, depId)}
                                            >
                                              <LinkOff className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        ) : null;
                                      })}
                                    </div>
                                  ) : (
                                    processIndex === 0 && stageIndex === 0 ? (
                                      <span className="text-xs text-muted-foreground">First process</span>
                                    ) : (
                                      <span className="text-xs text-muted-foreground">No dependencies</span>
                                    )
                                  )}
                                </TableCell>
                                <TableCell>
                                  {process.parameters.length > 0 ? (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        setSelectedProcess(process);
                                        setParameterValueDialogOpen(true);
                                      }}
                                    >
                                      Configure Values
                                    </Button>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">No parameters</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => {
                                        setSelectedProcess(process);
                                        const availableTargets = getPotentialDependencies(process);
                                        setSelectedDependency({
                                          source: process,
                                          availableTargets
                                        });
                                        setDependencyDialogOpen(true);
                                      }}
                                    >
                                      <Link className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No workflow configuration loaded</p>
                  <Button onClick={loadWorkflowConfig}>Load Sample Configuration</Button>
                </div>
              )}
              
              {/* Add Process Dialog */}
              <Dialog open={addProcessDialogOpen} onOpenChange={setAddProcessDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Process to Stage</DialogTitle>
                    <DialogDescription>
                      Select a process to add to this stage
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="processSelect">Select Process</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a process" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="process1">Initial Data Entry</SelectItem>
                        <SelectItem value="process2">Document Upload</SelectItem>
                        <SelectItem value="process3">Manager Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddProcessDialogOpen(false)}>Cancel</Button>
                    <Button>Add Process</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {/* Add Dependency Dialog */}
              <Dialog open={dependencyDialogOpen} onOpenChange={setDependencyDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configure Dependencies</DialogTitle>
                    <DialogDescription>
                      {selectedDependency && `Select dependencies for ${selectedDependency.source.name}`}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    {selectedDependency && selectedDependency.availableTargets.length > 0 ? (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Select processes that must be completed before this process can start:
                        </p>
                        {selectedDependency.availableTargets.map(target => {
                          const isDependent = dependencies.some(
                            dep => dep.sourceId === selectedDependency.source.id && dep.targetId === target.id
                          );
                          
                          return (
                            <div key={target.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`dep-${target.id}`} 
                                checked={isDependent}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    addDependency(selectedDependency.source.id, target.id);
                                  } else {
                                    removeDependency(selectedDependency.source.id, target.id);
                                  }
                                }}
                              />
                              <Label htmlFor={`dep-${target.id}`}>{target.name}</Label>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        There are no available processes that can be dependencies for this process.
                      </p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button onClick={() => setDependencyDialogOpen(false)}>Done</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {/* Parameter Values Dialog */}
              <Dialog open={parameterValueDialogOpen} onOpenChange={setParameterValueDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configure Parameter Values</DialogTitle>
                    <DialogDescription>
                      {selectedProcess && `Set parameter values for ${selectedProcess.name}`}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    {selectedProcess && selectedProcess.parameters.length > 0 ? (
                      <div className="space-y-4">
                        {selectedProcess.parameters.map(param => (
                          <div key={param.id} className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor={`param-${param.id}`} className="text-right">{param.name}</Label>
                            <div className="col-span-3">
                              <Input 
                                id={`param-${param.id}`} 
                                placeholder={`Enter value for ${param.name}`}
                                type={param.dataType === 'number' ? 'number' : 'text'}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Type: {param.dataType}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        This process has no parameters to configure.
                      </p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setParameterValueDialogOpen(false)}>Cancel</Button>
                    <Button>Save Values</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Parameter Values Tab */}
        <TabsContent value="parameters">
          <Card>
            <CardHeader>
              <CardTitle>Parameter Values</CardTitle>
              <CardDescription>Configure parameter values for the workflow instance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This tab allows you to configure parameter values for all processes in the workflow at once.
              </p>
              
              {workflowConfig ? (
                <div className="space-y-6">
                  {workflowConfig.stages.map(stage => (
                    <Card key={stage.id} className="mb-4">
                      <CardHeader className="py-3">
                        <CardTitle className="text-lg">{stage.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {stage.subStages.map(process => (
                          <div key={process.id} className="mb-6">
                            <h4 className="text-md font-medium mb-2">{process.name}</h4>
                            {process.parameters.length > 0 ? (
                              <div className="space-y-4 pl-4">
                                {process.parameters.map(param => (
                                  <div key={param.id} className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor={`param-${process.id}-${param.id}`} className="text-right">{param.name}</Label>
                                    <div className="col-span-3">
                                      <Input 
                                        id={`param-${process.id}-${param.id}`} 
                                        placeholder={`Enter value for ${param.name}`}
                                        type={param.dataType === 'number' ? 'number' : 'text'}
                                      />
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Type: {param.dataType}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground pl-4">
                                This process has no parameters to configure.
                              </p>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                  
                  <div className="flex justify-end">
                    <Button>Save All Parameter Values</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No workflow configuration loaded</p>
                  <Button onClick={loadWorkflowConfig}>Load Sample Configuration</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Templates</CardTitle>
              <CardDescription>Save and load workflow templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Save Current Configuration as Template</h3>
                  <div className="flex items-end gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="templateName">Template Name</Label>
                      <Input id="templateName" placeholder="Enter template name" />
                    </div>
                    <Button>Save as Template</Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Load Template</h3>
                  <div className="flex items-end gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="templateSelect">Select Template</Label>
                      <Select>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="template1">Standard Loan Approval</SelectItem>
                          <SelectItem value="template2">Expedited Review</SelectItem>
                          <SelectItem value="template3">Regulatory Compliance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline">Load Template</Button>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template Name</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Stages</TableHead>
                      <TableHead>Processes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Standard Loan Approval</TableCell>
                      <TableCell>admin</TableCell>
                      <TableCell>2025-05-01</TableCell>
                      <TableCell>3</TableCell>
                      <TableCell>8</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm">Load</Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Expedited Review</TableCell>
                      <TableCell>admin</TableCell>
                      <TableCell>2025-05-05</TableCell>
                      <TableCell>2</TableCell>
                      <TableCell>4</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm">Load</Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Regulatory Compliance</TableCell>
                      <TableCell>admin</TableCell>
                      <TableCell>2025-05-10</TableCell>
                      <TableCell>4</TableCell>
                      <TableCell>12</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm">Load</Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowInstanceConfig;