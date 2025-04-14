import React from 'react';
import ApplicationCard from './ApplicationCard';

// Updated application data based on user request
const mockApplications = [
  {
    id: "app-001",
    title: "Daily Named PNL",
    description: "Daily named profit and loss tracking",
    progress: 45,
    status: "in-progress",
    taskCounts: {
      completed: 9,
      failed: 1,
      rejected: 1,
      pending: 5,
      processing: 4
    },
    eligibleRoles: ["PNL Manager", "Finance Analyst", "Compliance Officer"]
  },
  {
    id: "app-002",
    title: "Rates",
    description: "Rates processing and management system",
    progress: 60,
    status: "in-progress",
    taskCounts: {
      completed: 12,
      failed: 0,
      rejected: 2,
      pending: 3,
      processing: 3
    },
    eligibleRoles: ["Rate Manager", "Rate Analyst", "Compliance Officer"]
  },
  {
    id: "app-003",
    title: "FI Credit",
    description: "Financial institution credit management",
    progress: 30,
    status: "in-progress",
    taskCounts: {
      completed: 6,
      failed: 1,
      rejected: 2,
      pending: 8,
      processing: 3
    },
    eligibleRoles: ["Credit Manager", "Risk Analyst", "Compliance Officer"]
  },
  {
    id: "app-004",
    title: "Prime",
    description: "Prime brokerage services management",
    progress: 20,
    status: "in-progress",
    taskCounts: {
      completed: 4,
      failed: 2,
      rejected: 1,
      pending: 10,
      processing: 3
    },
    eligibleRoles: ["Prime Manager", "Brokerage Analyst", "Compliance Officer"]
  },
  {
    id: "app-005",
    title: "Daily Workspace PNL",
    description: "Daily workspace profit and loss tracking",
    progress: 65,
    status: "in-progress",
    taskCounts: {
      completed: 13,
      failed: 0,
      rejected: 1,
      pending: 4,
      processing: 2
    },
    eligibleRoles: ["PNL Manager", "Finance Analyst", "Compliance Officer"]
  },
  {
    id: "app-006",
    title: "Monthend PNL",
    description: "Month-end profit and loss reporting",
    progress: 10,
    status: "in-progress",
    taskCounts: {
      completed: 2,
      failed: 1,
      rejected: 0,
      pending: 12,
      processing: 5
    },
    eligibleRoles: ["PNL Manager", "Finance Analyst", "Compliance Officer"]
  }
];

const ApplicationsGrid = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Applications</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockApplications.map((app) => (
          <ApplicationCard
            key={app.id}
            id={app.id}
            title={app.title}
            description={app.description}
            taskCounts={app.taskCounts}
            eligibleRoles={app.eligibleRoles}
            progress={app.progress}
            status={app.status}
          />
        ))}
      </div>
    </div>
  );
};

export default ApplicationsGrid;