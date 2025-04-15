import React from 'react';
import ApplicationCard from './ApplicationCard';

// Updated application data based on user request - removed Rates, FI Credit, Prime
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
    <div className="space-y-6 pl-0">
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