import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const WorkflowHierarchyDetailPage: NextPage = () => {
  const router = useRouter();
  const { workflowId } = router.query;
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Workflow Detail</h1>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Workflow Instance Details</CardTitle>
          </CardHeader>
          <CardContent>
            {workflowId ? (
              <Alert>
                <AlertDescription>
                  The hierarchical view for workflow ID {workflowId} is currently being updated. 
                  Please check back later or navigate to the main workflow view.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="text-center py-8">Loading workflow details...</div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WorkflowHierarchyDetailPage;