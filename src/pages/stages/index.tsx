import React from 'react';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers } from 'lucide-react';
import { mockWorkflows } from '@/data/mockWorkflows';
import { useRouter } from 'next/router';

const StagesIndex = () => {
  const router = useRouter();
  
  const handleWorkflowSelect = (workflowId: string) => {
    router.push(`/stages/${workflowId}`);
  };
  
  return (
    <>
      <Head>
        <title>Stage Viewer</title>
        <meta name="description" content="View and manage workflow stages" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DashboardLayout title="Stage Viewer">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select a Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Select a workflow to view its stages and track progress.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockWorkflows.map((workflow) => (
                  <Card 
                    key={workflow.id} 
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleWorkflowSelect(workflow.id)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Layers className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{workflow.title}</h3>
                        <p className="text-sm text-muted-foreground">{workflow.stages.length} stages</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

export default StagesIndex;