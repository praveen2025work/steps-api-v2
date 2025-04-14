import React from "react";
import Head from "next/head";
import DashboardLayout from "@/components/DashboardLayout";
import ApplicationsGrid from "@/components/ApplicationsGrid";
import ManagementBoard from "@/components/ManagementBoard";

export default function Home() {
  return (
    <>
      <Head>
        <title>Workflow Tool - Financial Workflow Dashboard</title>
        <meta name="description" content="Financial Workflow Management System Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DashboardLayout title="Workflow Dashboard">
        <div className="space-y-8">
          {/* Applications Grid */}
          <ApplicationsGrid />
          
          {/* Management Board with Performance Overview, Compliance Chart, and Pending Approvals */}
          <ManagementBoard />
        </div>
      </DashboardLayout>
    </>
  );
}