import React from 'react';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';
import UserProcessDashboard from '@/components/dashboard/UserProcessDashboard';

const UserProcessesPage = () => {
  return (
    <>
      <Head>
        <title>User Process Dashboard - Financial Workflow Management</title>
        <meta name="description" content="Manage and monitor processes across all applications, groups, and instances" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DashboardLayout title="User Process Dashboard">
        <UserProcessDashboard />
      </DashboardLayout>
    </>
  );
};

export default UserProcessesPage;