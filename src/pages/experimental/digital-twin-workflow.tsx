import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { DigitalTwinWorkflow } from '@/components/experimental/DigitalTwinWorkflow';

const DigitalTwinWorkflowPage = () => {
  return (
    <DashboardLayout title="Digital Twin Workflow Simulation">
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Digital Twin Workflow Simulation</h1>
        <p className="text-muted-foreground mb-6">
          Create virtual replicas of your workflows to simulate execution, identify bottlenecks, and optimize performance before implementing changes in production.
        </p>
        
        <div className="space-y-8">
          <DigitalTwinWorkflow />
          
          <div className="bg-muted p-4 rounded-lg">
            <h2 className="text-lg font-medium mb-2">About This Feature</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Digital Twin technology creates a virtual replica of your workflow processes, allowing you to simulate and test changes in a safe environment. This feature can:
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Create accurate simulations of complex workflow processes</li>
              <li>Test performance under various conditions and resource constraints</li>
              <li>Identify bottlenecks and optimization opportunities</li>
              <li>Simulate failure scenarios to test resilience and recovery</li>
              <li>Compare multiple workflow configurations side-by-side</li>
              <li>Generate AI-powered recommendations for workflow improvements</li>
              <li>Predict completion times and resource utilization with high accuracy</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DigitalTwinWorkflowPage;