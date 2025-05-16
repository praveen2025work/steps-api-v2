import React from 'react';
import { useRouter } from 'next/router';
import FinanceDashboard from '@/components/finance/FinanceDashboard';
import { DashboardLayout } from '@/components/DashboardLayout';

const FinancePage = () => {
  const router = useRouter();
  const { workflowId, workflowName } = router.query;

  return (
    <DashboardLayout>
      <FinanceDashboard 
        workflowId={workflowId as string} 
        workflowName={workflowName as string} 
      />
    </DashboardLayout>
  );
};

export default FinancePage;