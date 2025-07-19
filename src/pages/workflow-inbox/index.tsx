import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { WorkflowInboxDashboard } from '@/components/workflow-inbox/WorkflowInboxDashboard';

const WorkflowInboxPage = () => {
  return (
    <DashboardLayout title="My Workflow Inbox">
      <WorkflowInboxDashboard />
    </DashboardLayout>
  );
};

export default WorkflowInboxPage;