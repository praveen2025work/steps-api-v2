import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import MetadataManagement from '@/components/admin/MetadataManagement';

const MetadataManagementPage = () => {
  return (
    <DashboardLayout title="Metadata Management">
      <div className="container mx-auto py-6">
        <MetadataManagement />
      </div>
    </DashboardLayout>
  );
};

export default MetadataManagementPage;