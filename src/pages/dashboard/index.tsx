import React from "react";
import Head from "next/head";
import DashboardLayout from "@/components/DashboardLayout";
import ApplicationsGrid from "@/components/ApplicationsGrid";

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Workflow Tool - Financial Workflow Dashboard</title>
        <meta name="description" content="Financial Workflow Management System Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DashboardLayout title="Workflow Dashboard">
        <div className="space-y-8 px-1">
          {/* Applications Grid */}
          <ApplicationsGrid />
        </div>
      </DashboardLayout>
    </>
  );
}