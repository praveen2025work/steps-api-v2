import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { BlockchainAudit } from '@/components/experimental/BlockchainAudit';

const BlockchainAuditPage = () => {
  return (
    <DashboardLayout>
      <BlockchainAudit />
    </DashboardLayout>
  );
};

export default BlockchainAuditPage;