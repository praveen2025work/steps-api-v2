import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { DroolsRulesEngine } from '@/components/experimental/DroolsRulesEngine';

const DroolsRulesPage = () => {
  return (
    <DashboardLayout title="Drools Rules Engine">
      <DroolsRulesEngine />
    </DashboardLayout>
  );
};

export default DroolsRulesPage;