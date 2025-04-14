import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';
import WorkflowDetailView from '@/components/WorkflowDetailView';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { WorkflowTask } from '@/components/WorkflowTaskItem';

// Mock data for the workflow detail view
const mockWorkflowData = {
  id: 'wf-001',
  title: 'eRates',
  progressSteps: [
    { name: 'Daily Named PNL', progress: 45 },
    { name: 'Rates', progress: 60 },
    { name: 'eRates', progress: 75 },
  ],
  stages: [
    { id: 'stage-001', name: 'Pre WF' },
    { id: 'stage-002', name: 'Substantiation' },
    { id: 'stage-003', name: 'Review' },
    { id: 'stage-004', name: 'Publish' },
    { id: 'stage-005', name: 'Sign Off' },
    { id: 'stage-006', name: 'Rainy Day' },
    { id: 'stage-007', name: 'Exception' },
  ],
  tasks: {
    'stage-001': [
      {
        id: 'task-001',
        name: 'SOD Roll',
        processId: 'PROC-1234',
        status: 'completed',
        duration: 15,
        expectedStart: '06:00',
        documents: [
          { name: 'sod_report.xlsx', size: '2.4 MB' },
          { name: 'validation.log', size: '150 KB' },
        ],
        messages: [
          'Successfully rolled over positions',
          'All 2,500 positions processed',
        ],
        updatedBy: 'System',
        updatedAt: '4/12/2025, 6:15:00 AM',
      },
      {
        id: 'task-002',
        name: 'Books Open For Correction',
        processId: 'PROC-1235',
        status: 'in_progress',
        duration: 30,
        expectedStart: '06:30',
        dependencies: [
          { name: 'SOD Roll', status: 'completed' },
        ],
        documents: [
          { name: 'corrections.xlsx', size: '1.2 MB' },
        ],
        messages: [
          'Books opened for correction',
        ],
        updatedBy: 'John Doe',
        updatedAt: '4/12/2025, 6:30:00 AM',
      },
    ],
    'stage-002': [],
    'stage-003': [],
    'stage-004': [],
    'stage-005': [],
    'stage-006': [],
    'stage-007': [],
  },
};

const WorkflowDetailPage = () => {
  const router = useRouter();
  const { workflowId } = router.query;
  
  // In a real application, you would fetch the workflow data based on the workflowId
  // For now, we'll use the mock data
  
  if (!workflowId) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <>
      <Head>
        <title>Workflow Tool | {mockWorkflowData.title}</title>
        <meta name="description" content={`Workflow details for ${mockWorkflowData.title}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DashboardLayout>
        <div className="mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
        
        <WorkflowDetailView 
          workflowTitle={mockWorkflowData.title}
          progressSteps={mockWorkflowData.progressSteps}
          stages={mockWorkflowData.stages}
          tasks={mockWorkflowData.tasks as Record<string, WorkflowTask[]>}
        />
      </DashboardLayout>
    </>
  );
};

export default WorkflowDetailPage;