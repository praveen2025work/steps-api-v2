import React from 'react';
import { NextPage } from 'next';
import DashboardLayout from '@/components/DashboardLayout';
import WorkflowHierarchicalView from '@/components/WorkflowHierarchicalView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const HierarchyPage: NextPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Workflow Hierarchy</h1>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Workflow Hierarchy Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkflowHierarchicalView />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HierarchyPage;