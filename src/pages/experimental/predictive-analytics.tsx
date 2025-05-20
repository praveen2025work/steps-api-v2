import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { PredictiveAnalytics } from '@/components/experimental/PredictiveAnalytics';

const PredictiveAnalyticsPage = () => {
  return (
    <DashboardLayout>
      <PredictiveAnalytics />
    </DashboardLayout>
  );
};

export default PredictiveAnalyticsPage;