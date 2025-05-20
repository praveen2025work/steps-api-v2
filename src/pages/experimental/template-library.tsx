import React from 'react';
import { WorkflowTemplateLibrary } from '@/components/experimental';
import DashboardLayout from '@/components/DashboardLayout';

export default function TemplateLibraryPage() {
  return (
    <DashboardLayout>
      <WorkflowTemplateLibrary />
    </DashboardLayout>
  );
}