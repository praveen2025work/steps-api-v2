import React from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/DashboardLayout';
import AdminDashboard from '@/components/admin/AdminDashboard';
import WorkflowDashboard from '@/components/admin/WorkflowDashboard';

const AdminPage = () => {
  const router = useRouter();
  const { tab } = router.query;
  
  // If there's a tab query parameter, show the WorkflowDashboard with that tab
  // Otherwise, show the AdminDashboard
  return (
    <DashboardLayout>
      {tab ? (
        <WorkflowDashboard defaultTab={tab as string} />
      ) : (
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
          <AdminDashboard />
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminPage;