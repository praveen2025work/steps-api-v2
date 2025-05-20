import React from 'react';
import { WorkflowAutomationBuilder } from '@/components/experimental';
import DashboardLayout from '@/components/DashboardLayout';

export default function WorkflowAutomationPage() {
  return (
    <DashboardLayout>
      <WorkflowAutomationBuilder />
    </DashboardLayout>
  );
}