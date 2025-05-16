import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AdminDashboard from '@/components/admin/AdminDashboard';

const AdminPage = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <AdminDashboard />
      </div>
    </DashboardLayout>
  );
};

export default AdminPage;