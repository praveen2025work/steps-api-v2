import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/DashboardLayout';
import { mockWorkflows } from '@/data/mockWorkflows';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, User, Calendar, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import SubStagesList from '@/components/SubStagesList';
import DocumentsList from '@/components/DocumentsList';

const WorkflowStageViewer = () => {
  const router = useRouter();
  const { workflowId } = router.query;
  const [activeStage, setActiveStage] = useState<string | null>(null);
  
  // Find the workflow from mock data
  const workflow = mockWorkflows.find(wf => wf.id === workflowId);
  
  if (!workflow) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Workflow Not Found</h2>
          <p className="text-muted-foreground mb-6">The workflow you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  const handleStageClick = (stageId: string) => {
    setActiveStage(activeStage === stageId ? null : stageId);
  };
  
  const getStageStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      case 'skipped':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };
  
  const getStageStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">In Progress</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'skipped':
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20">Skipped</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  return (
    <>
      <Head>
        <title>Stage Viewer | {workflow.title}</title>
        <meta name="description" content={`View stages for ${workflow.title}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Back button and workflow title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mb-2"
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold">{workflow.title}</h1>
              <p className="text-muted-foreground">{workflow.description}</p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-1">
              <div className="flex items-center gap-2">
                {getStageStatusBadge(workflow.status)}
                <span className="text-sm">{workflow.progress}% Complete</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Assigned to: {workflow.assignee}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Due: {workflow.dueDate}</span>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{workflow.progress}%</span>
                </div>
                <Progress value={workflow.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
          
          {/* Tabs for different views */}
          <Tabs defaultValue="stages">
            <TabsList>
              <TabsTrigger value="stages">Stages</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
            </TabsList>
            
            {/* Stages View */}
            <TabsContent value="stages" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 gap-4">
                {workflow.stages.map((stage, index) => (
                  <Card 
                    key={stage.id} 
                    className={`cursor-pointer transition-all ${activeStage === stage.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleStageClick(stage.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground">
                            {index + 1}
                          </div>
                          <CardTitle className="text-lg">{stage.name}</CardTitle>
                        </div>
                        {getStageStatusBadge(stage.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>{stage.assignee}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {stage.dueDate}</span>
                        </div>
                      </div>
                      
                      {/* Expanded content when stage is active */}
                      {activeStage === stage.id && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium mb-2">Stage Details</h4>
                          {stage.description && (
                            <p className="text-sm text-muted-foreground mb-4">{stage.description}</p>
                          )}
                          
                          <div className="grid grid-cols-1 gap-6">
                            {/* Substages */}
                            {stage.substages && stage.substages.length > 0 && (
                              <div className="space-y-4">
                                <SubStagesList substages={stage.substages} />
                              </div>
                            )}
                            
                            {/* Documents */}
                            {stage.documents && stage.documents.length > 0 && (
                              <div className="space-y-4">
                                <DocumentsList documents={stage.documents} />
                              </div>
                            )}
                            
                            {/* Actions */}
                            <div>
                              <h5 className="text-sm font-medium mb-2">Actions</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <Button variant="outline" size="sm" className="justify-start">
                                  <FileText className="mr-2 h-4 w-4" />
                                  View Documents
                                </Button>
                                <Button variant="outline" size="sm" className="justify-start">
                                  <User className="mr-2 h-4 w-4" />
                                  Reassign Stage
                                </Button>
                                {stage.status === 'pending' && (
                                  <Button size="sm" className="justify-start">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Start Stage
                                  </Button>
                                )}
                                {stage.status === 'in-progress' && (
                                  <Button size="sm" className="justify-start">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Complete Stage
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            {/* Timeline View */}
            <TabsContent value="timeline" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-8">
                    {workflow.stages.map((stage, index) => (
                      <div key={stage.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stage.status === 'completed' ? 'bg-green-500 text-white' : stage.status === 'in-progress' ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                            {getStageStatusIcon(stage.status)}
                          </div>
                          {index < workflow.stages.length - 1 && (
                            <div className="w-0.5 h-full bg-border mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <h3 className="font-medium flex items-center gap-2">
                            {stage.name}
                            {getStageStatusBadge(stage.status)}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Assigned to {stage.assignee} • Due {stage.dueDate}
                          </p>
                          <div className="mt-2 text-sm">
                            {stage.status === 'completed' && (
                              <p className="text-green-500">Completed on {new Date(stage.dueDate).toLocaleDateString()}</p>
                            )}
                            {stage.status === 'in-progress' && (
                              <p className="text-blue-500">In progress since {new Date().toLocaleDateString()}</p>
                            )}
                            {stage.status === 'pending' && (
                              <p>Scheduled to start after previous stage completion</p>
                            )}
                            {stage.status === 'skipped' && (
                              <p className="text-yellow-500">Stage was skipped</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Dependencies View */}
            <TabsContent value="dependencies" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Stage Dependencies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {workflow.stages.map((stage, index) => (
                      <div key={stage.id} className="p-4 border rounded-md">
                        <h3 className="font-medium">{index + 1}. {stage.name}</h3>
                        <div className="mt-2">
                          <h4 className="text-sm font-medium">Dependencies:</h4>
                          {index === 0 ? (
                            <p className="text-sm text-muted-foreground">No dependencies - This is the first stage</p>
                          ) : (
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant="outline">{workflow.stages[index - 1].name}</Badge>
                              <span className="text-xs text-muted-foreground">Must be completed</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-4">
                          <h4 className="text-sm font-medium">Required for:</h4>
                          {index === workflow.stages.length - 1 ? (
                            <p className="text-sm text-muted-foreground">No dependent stages - This is the final stage</p>
                          ) : (
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant="outline">{workflow.stages[index + 1].name}</Badge>
                              <span className="text-xs text-muted-foreground">Will be unlocked</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
};

export default WorkflowStageViewer;