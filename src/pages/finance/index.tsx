import React from 'react';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';
import DynamicFinanceDashboard from '@/components/finance/DynamicFinanceDashboard';

const FinancePage = () => {
  return (
    <>
      <Head>
        <title>Finance Dashboard | STEPS</title>
        <meta name="description" content="Financial dashboard with real-time data visualization" />
      </Head>
      <DashboardLayout title="Finance Dashboard">
        <DynamicFinanceDashboard />
      </DashboardLayout>
    </>
  );
};

export default FinancePage;