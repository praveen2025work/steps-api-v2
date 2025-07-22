import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { WorkflowInboxDashboard } from '@/components/workflow-inbox/WorkflowInboxDashboard';

const WorkflowInboxPage = () => {
  return (
    <DashboardLayout title="Task Center">
      <WorkflowInboxDashboard />
    </DashboardLayout>
  );
};

export default WorkflowInboxPage;