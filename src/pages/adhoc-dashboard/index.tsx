import React from 'react';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';
import AdhocDashboard from '@/components/adhoc/AdhocDashboard';

const AdhocDashboardPage = () => {
  return (
    <>
      <Head>
        <title>Adhoc Dashboard | STEPS</title>
        <meta name="description" content="Configurable dashboard for any data source with custom visualizations" />
      </Head>
      <DashboardLayout title="Adhoc Dashboard">
        <AdhocDashboard />
      </DashboardLayout>
    </>
  );
};

export default AdhocDashboardPage;