import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import WorkflowInstanceConfig from '@/components/admin/WorkflowInstanceConfig';

const WorkflowConfigPage = () => {
  return (
    <DashboardLayout title="Workflow Instance Configuration">
      <div className="container mx-auto py-6">
        <WorkflowInstanceConfig />
      </div>
    </DashboardLayout>
  );
};

export default WorkflowConfigPage;