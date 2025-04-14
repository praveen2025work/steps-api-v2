import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, Filter, Download } from "lucide-react";
import WorkflowListItem from './WorkflowListItem';
import { Workflow, WorkflowStatus } from '@/data/mockWorkflows';

interface WorkflowListViewProps {
  workflows: Workflow[];
}

const WorkflowListView = ({ workflows }: WorkflowListViewProps) => {
  return (
    <div className="space-y-4">
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
            {workflows.map((workflow) => (
              <WorkflowListItem
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
            {workflows
              .filter(workflow => workflow.status === "in-progress")
              .map((workflow) => (
                <WorkflowListItem
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
            {workflows
              .filter(workflow => workflow.status === "pending")
              .map((workflow) => (
                <WorkflowListItem
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
            {workflows
              .filter(workflow => workflow.status === "completed")
              .map((workflow) => (
                <WorkflowListItem
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
  );
};

export default WorkflowListView;