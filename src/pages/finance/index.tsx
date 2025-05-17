import React from 'react';
import Head from 'next/head';
import DynamicFinanceDashboard from '@/components/finance/DynamicFinanceDashboard';

const FinancePage = () => {
  return (
    <>
      <Head>
        <title>Finance Dashboard | STEPS</title>
        <meta name="description" content="Financial dashboard with real-time data visualization" />
      </Head>
      <DynamicFinanceDashboard />
    </>
  );
};

export default FinancePage;