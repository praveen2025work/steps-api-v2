import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import SimpleFinanceDashboard from '@/components/finance/SimpleFinanceDashboard';

const FinancePage: React.FC = () => {
  return (
    <DashboardLayout>
      <SimpleFinanceDashboard />
    </DashboardLayout>
  );
};

export default FinancePage;