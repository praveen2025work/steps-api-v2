import React from 'react';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';
import ManagementBoard from '@/components/ManagementBoard';

const ManagementPage = () => {
  return (
    <>
      <Head>
        <title>Management Board - Workflow Tool</title>
        <meta name="description" content="Management overview of workflow applications and processes" />
      </Head>
      <DashboardLayout title="Management Board">
        <ManagementBoard />
      </DashboardLayout>
    </>
  );
};

export default ManagementPage;