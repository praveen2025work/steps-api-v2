import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import ModernFinanceDashboard from '@/components/finance/ModernFinanceDashboard';

const FinancePage: React.FC = () => {
  return (
    <DashboardLayout>
      <ModernFinanceDashboard />
    </DashboardLayout>
  );
};

export default FinancePage;