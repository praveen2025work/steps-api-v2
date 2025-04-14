import React from 'react';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';
import WorkflowListView from '@/components/WorkflowListView';
import RatesRecentActivities from '@/components/RatesRecentActivities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockWorkflows } from '@/data/mockWorkflows';

// Create sample rate-specific workflows
// Using the correct IDs from hierarchicalWorkflowData.ts
const rateWorkflows = [
  {
    id: "app-001", // Using the Application ID for Daily Named PNL
    title: "Daily Named PNL Rates",
    description: "Daily named PNL workflow",
    status: "in-progress" as const,
    progress: 60,
    dueDate: "2025-02-15",
    assignee: "John Doe",
    createdAt: "2025-02-15",
    stages: []
  },
  {
    id: "app-002", // Using the Application ID for Daily Workspace PNL
    title: "Daily Workspace PNL",
    description: "Daily workspace PNL workflow",
    status: "in-progress" as const,
    progress: 70,
    dueDate: "2025-01-20",
    assignee: "Unassigned",
    createdAt: "2025-01-20",
    stages: []
  },
  {
    id: "app-003", // Using the Application ID for Monthend PNL
    title: "Monthend PNL",
    description: "Monthend PNL workflow",
    status: "in-progress" as const,
    progress: 10,
    dueDate: "2025-03-05",
    assignee: "Unassigned",
    createdAt: "2025-03-05",
    stages: []
  }
];

const RatesPage = () => {
  return (
    <>
      <Head>
        <title>Rates - Workflow Tool</title>
        <meta name="description" content="Rates workflows management" />
      </Head>
      <DashboardLayout title="Rates Workflows">
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <WorkflowListView workflows={rateWorkflows} />
            </div>
            
            {/* Recent Activities */}
            <div>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <RatesRecentActivities />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default RatesPage;