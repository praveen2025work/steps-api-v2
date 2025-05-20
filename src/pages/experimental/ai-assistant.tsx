import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { AIWorkflowAssistant } from '@/components/experimental/AIWorkflowAssistant';

const AIAssistantPage = () => {
  return (
    <DashboardLayout title="AI Workflow Assistant">
      <AIWorkflowAssistant />
    </DashboardLayout>
  );
};

export default AIAssistantPage;