import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { IntegratedBusinessRulesEngine } from '@/components/experimental/IntegratedBusinessRulesEngine';

const BusinessRulesEnginePage = () => {
  return (
    <DashboardLayout title="Integrated Business Rules Engine">
      <IntegratedBusinessRulesEngine />
    </DashboardLayout>
  );
};

export default BusinessRulesEnginePage;