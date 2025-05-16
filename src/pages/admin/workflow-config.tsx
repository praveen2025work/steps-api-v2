import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import WorkflowInstanceConfig from '@/components/admin/WorkflowInstanceConfig';

const WorkflowConfigPage = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Workflow Instance Configuration</h1>
        <WorkflowInstanceConfig />
      </div>
    </DashboardLayout>
  );
};

export default WorkflowConfigPage;