import React from 'react';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';
import UserSettings from '@/components/settings/UserSettings';

const SettingsPage = () => {
  return (
    <>
      <Head>
        <title>User Settings | STEPS</title>
        <meta name="description" content="User preferences and system settings" />
      </Head>
      <DashboardLayout title="Settings">
        <UserSettings />
      </DashboardLayout>
    </>
  );
};

export default SettingsPage;