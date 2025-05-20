import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { AppianProcessIntegration } from '@/components/experimental/AppianProcessIntegration';

const AppianIntegrationPage = () => {
  return (
    <DashboardLayout title="Appian Process Integration">
      <AppianProcessIntegration />
    </DashboardLayout>
  );
};

export default AppianIntegrationPage;