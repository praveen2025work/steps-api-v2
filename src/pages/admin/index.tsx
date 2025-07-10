import React from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/DashboardLayout';
import AdminDashboard from '@/components/admin/AdminDashboard';
import WorkflowDashboard from '@/components/admin/WorkflowDashboard';
import ExtendedMetadataManagement from '@/components/admin/ExtendedMetadataManagement';

const AdminPage = () => {
  const router = useRouter();
  const { tab } = router.query;
  
  // If there's a tab query parameter, show the WorkflowDashboard with that tab
  // Otherwise, show the AdminDashboard
  const getTitle = () => {
    if (!tab) return "Admin Dashboard";
    
    switch (tab) {
      case 'applications': return "Application Management";
      case 'roles': return "Role Management";
      case 'holidays': return "Holiday Calendar Management";
      case 'runcalendar': return "Run Calendar Management";
      case 'hierarchy': return "Workflow Management System";
      case 'metadata': return "Metadata Management";
      case 'extended-metadata': return "Extended Metadata Management";
      default: return "Admin Dashboard";
    }
  };

  return (
    <DashboardLayout title={getTitle()}>
      {tab === 'extended-metadata' ? (
        <div className="container mx-auto py-6">
          <ExtendedMetadataManagement />
        </div>
      ) : tab ? (
        <WorkflowDashboard defaultTab={tab as string} />
      ) : (
        <div className="container mx-auto py-6">
          <AdminDashboard />
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminPage;