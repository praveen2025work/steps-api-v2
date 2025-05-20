import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { NLPCommandCenter } from '@/components/experimental/NLPCommandCenter';

const NLPCommandsPage = () => {
  return (
    <DashboardLayout>
      <NLPCommandCenter />
    </DashboardLayout>
  );
};

export default NLPCommandsPage;