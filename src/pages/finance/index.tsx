import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import MinimalFinanceDashboard from '@/components/finance/MinimalFinanceDashboard';

const FinancePage: React.FC = () => {
  return (
    <DashboardLayout>
      <MinimalFinanceDashboard />
    </DashboardLayout>
  );
};

export default FinancePage;