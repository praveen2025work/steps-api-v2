import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { PegaBPMConnector } from '@/components/experimental/PegaBPMConnector';

const PegaConnectorPage = () => {
  return (
    <DashboardLayout title="PEGA BPM Connector">
      <PegaBPMConnector />
    </DashboardLayout>
  );
};

export default PegaConnectorPage;