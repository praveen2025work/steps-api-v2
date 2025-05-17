import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import BasicFinanceDashboard from '@/components/finance/BasicFinanceDashboard';

const FinancePage: React.FC = () => {
  return (
    <DashboardLayout>
      <BasicFinanceDashboard />
    </DashboardLayout>
  );
};

export default FinancePage;