import React from "react";
import Head from "next/head";
import DashboardLayout from "@/components/DashboardLayout";
import WorkflowStats from "@/components/WorkflowStats";
import WorkflowStatusCard from "@/components/WorkflowStatusCard";
import RecentActivities from "@/components/RecentActivities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, Filter } from "lucide-react";
import { mockWorkflowsFromNewData } from "@/data/workflowData";

export default function Home() {
  return (
    <>
      <Head>
        <title>Workflow Dashboard</title>
        <meta name="description" content="Workflow Management System Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DashboardLayout title="Workflow Dashboard">
        <div className="space-y-6">
          {/* Stats Overview */}
          <WorkflowStats />
          
          {/* Workflows and Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">My Workflows</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button size="sm">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Workflow
                  </Button>
                </div>
              </div>
              
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <RecentActivities />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}