import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import WorkflowDashboard from '@/components/admin/WorkflowDashboard';

const AdminPage = () => {
  return (
    <DashboardLayout>
      <WorkflowDashboard />
    </DashboardLayout>
  );
};

export default AdminPage;