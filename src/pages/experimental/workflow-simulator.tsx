import React from 'react';
import { WorkflowSimulator } from '@/components/experimental';
import DashboardLayout from '@/components/DashboardLayout';

export default function WorkflowSimulatorPage() {
  return (
    <DashboardLayout>
      <WorkflowSimulator />
    </DashboardLayout>
  );
}