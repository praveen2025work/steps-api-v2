import React from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/DashboardLayout';
import AdminDashboard from '@/components/admin/AdminDashboard';
import WorkflowDashboard from '@/components/admin/WorkflowDashboard';

const AdminPage = () => {
  const router = useRouter();
  
  // Wait for router to be ready before accessing query parameters
  // This prevents "NextRouter was not mounted" errors
  if (!router.isReady) {
    return (
      <DashboardLayout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
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
      default: return "Admin Dashboard";
    }
  };

  return (
    <DashboardLayout title={getTitle()}>
      {tab ? (
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