import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import WorkflowConfigurationManager from '@/components/admin/WorkflowConfigurationManager';

const WorkflowConfigPage = () => {
  return (
    <DashboardLayout title="Workflow Configuration">
      <WorkflowConfigurationManager />
    </DashboardLayout>
  );
};

export default WorkflowConfigPage;