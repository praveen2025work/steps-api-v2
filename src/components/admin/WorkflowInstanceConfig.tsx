import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const WorkflowInstanceConfig: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Instance Configuration</CardTitle>
        <CardDescription>Configure workflow instances for hierarchy nodes</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          This component will allow you to:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
          <li>Create workflow configurations for specific hierarchy nodes</li>
          <li>Drag and drop stages and substages to customize workflows</li>
          <li>Configure dependencies between workflow steps</li>
          <li>Save workflow templates for reuse</li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default WorkflowInstanceConfig;