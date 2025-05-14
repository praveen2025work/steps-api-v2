import React from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/DashboardLayout';
import WorkflowDashboard from '@/components/admin/WorkflowDashboard';

const AdminPage = () => {
  const router = useRouter();
  const { tab } = router.query;
  
  // Convert tab to string and validate it's one of the allowed values
  const defaultTab = typeof tab === 'string' && [
    'applications', 'roles', 'holidays', 'runcalendar', 
    'hierarchy', 'metadata', 'workflow', 'admin'
  ].includes(tab) ? tab : 'applications';

  return (
    <DashboardLayout>
      <WorkflowDashboard defaultTab={defaultTab} />
    </DashboardLayout>
  );
};

export default AdminPage;