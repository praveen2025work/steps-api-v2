import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import SubStageDemo from '@/components/SubStageDemo';

const SubStagesDemoPage = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-8">Sub-Stages Status Demo</h1>
        <SubStageDemo />
      </div>
    </DashboardLayout>
  );
};

export default SubStagesDemoPage;