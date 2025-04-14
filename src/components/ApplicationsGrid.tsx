import React from 'react';
import ApplicationCard from './ApplicationCard';

// Mock application data
const mockApplications = [
  {
    id: "app-001",
    title: "eRates",
    description: "Electronic rates processing and management system",
    taskCounts: {
      completed: 24,
      failed: 2,
      rejected: 1,
      pending: 5,
      processing: 3
    },
    eligibleRoles: ["Rate Manager", "Rate Analyst", "Compliance Officer"]
  },
  {
    id: "app-002",
    title: "Credit Risk",
    description: "Credit risk assessment and management platform",
    taskCounts: {
      completed: 18,
      failed: 0,
      rejected: 2,
      pending: 7,
      processing: 4
    },
    eligibleRoles: ["Risk Manager", "Credit Analyst", "Compliance Officer"]
  },
  {
    id: "app-003",
    title: "Regulatory Reporting",
    description: "Automated regulatory reporting and compliance tracking",
    taskCounts: {
      completed: 32,
      failed: 1,
      rejected: 0,
      pending: 3,
      processing: 2
    },
    eligibleRoles: ["Compliance Officer", "Regulatory Specialist", "Report Manager"]
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
          />
        ))}
      </div>
    </div>
  );
};

export default ApplicationsGrid;