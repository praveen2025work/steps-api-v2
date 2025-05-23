import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { JBPMWorkflowEngine } from '@/components/experimental/JBPMWorkflowEngine';

const JBPMWorkflowPage = () => {
  return (
    <DashboardLayout title="jBPM Workflow Engine">
      <JBPMWorkflowEngine />
    </DashboardLayout>
  );
};

export default JBPMWorkflowPage;