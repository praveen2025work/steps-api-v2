import React from "react";
import Head from "next/head";
import DashboardLayout from "@/components/DashboardLayout";
import WorkflowStats from "@/components/WorkflowStats";
import WorkflowStatusCard from "@/components/WorkflowStatusCard";
import RecentActivities from "@/components/RecentActivities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, Filter, Download, Upload, BarChart3 } from "lucide-react";
import { mockWorkflowsFromNewData } from "@/data/workflowData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <>
      <Head>
        <title>FinReg Suite - Regulatory Workflow Dashboard</title>
        <meta name="description" content="Financial Regulatory Workflow Management System Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DashboardLayout title="Regulatory Dashboard">
        <div className="space-y-8">
          {/* Stats Overview */}
          <WorkflowStats />
          
          {/* Regulatory Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Regulatory Compliance Timeline</CardTitle>
                  <Button variant="ghost" size="sm">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center">
                  <img 
                    src="https://assets.co.dev/19129c8d-1c91-4384-9bc0-e0d1fdc82154/image-ed69719.png" 
                    alt="Regulatory Timeline" 
                    className="max-h-full object-contain"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center">
                  <img 
                    src="https://assets.co.dev/19129c8d-1c91-4384-9bc0-e0d1fdc82154/image-d0cb8f5.png" 
                    alt="Risk Assessment" 
                    className="max-h-full object-contain"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Workflows and Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Active Workflows</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Workflow
                  </Button>
                </div>
              </div>
              
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0">
                  <TabsTrigger 
                    value="all" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger 
                    value="in-progress" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
                  >
                    In Progress
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pending" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
                  >
                    Pending
                  </TabsTrigger>
                  <TabsTrigger 
                    value="completed" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2"
                  >
                    Completed
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    {mockWorkflowsFromNewData.map((workflow) => (
                      <WorkflowStatusCard
                        key={workflow.id}
                        id={workflow.id}
                        title={workflow.title}
                        status={workflow.status}
                        progress={workflow.progress}
                        dueDate={workflow.dueDate}
                        assignee={workflow.assignee}
                        createdAt={workflow.createdAt}
                      />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="in-progress" className="mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    {mockWorkflowsFromNewData
                      .filter(workflow => workflow.status === "in-progress")
                      .map((workflow) => (
                        <WorkflowStatusCard
                          key={workflow.id}
                          id={workflow.id}
                          title={workflow.title}
                          status={workflow.status}
                          progress={workflow.progress}
                          dueDate={workflow.dueDate}
                          assignee={workflow.assignee}
                          createdAt={workflow.createdAt}
                        />
                      ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="pending" className="mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    {mockWorkflowsFromNewData
                      .filter(workflow => workflow.status === "pending")
                      .map((workflow) => (
                        <WorkflowStatusCard
                          key={workflow.id}
                          id={workflow.id}
                          title={workflow.title}
                          status={workflow.status}
                          progress={workflow.progress}
                          dueDate={workflow.dueDate}
                          assignee={workflow.assignee}
                          createdAt={workflow.createdAt}
                        />
                      ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="completed" className="mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    {mockWorkflowsFromNewData
                      .filter(workflow => workflow.status === "completed")
                      .map((workflow) => (
                        <WorkflowStatusCard
                          key={workflow.id}
                          id={workflow.id}
                          title={workflow.title}
                          status={workflow.status}
                          progress={workflow.progress}
                          dueDate={workflow.dueDate}
                          assignee={workflow.assignee}
                          createdAt={workflow.createdAt}
                        />
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Recent Activities */}
            <div>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <RecentActivities />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}