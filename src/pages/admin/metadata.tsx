import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import MetadataManagement from '@/components/admin/MetadataManagement';

const MetadataManagementPage = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Metadata Management</h1>
        <MetadataManagement />
      </div>
    </DashboardLayout>
  );
};

export default MetadataManagementPage;