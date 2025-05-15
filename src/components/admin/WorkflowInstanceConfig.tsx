import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';

const WorkflowInstanceConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState('workflow');
  const [error, setError] = useState<string | null>(null);
  
  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflow">Workflow Configuration</TabsTrigger>
          <TabsTrigger value="parameters">Parameter Values</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        {/* Workflow Configuration Tab */}
        <TabsContent value="workflow">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Instance Configuration</CardTitle>
              <CardDescription>Configure workflow instances for hierarchy nodes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">Simplified workflow configuration for testing</p>
                <Button>Load Sample Configuration</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Parameter Values Tab */}
        <TabsContent value="parameters">
          <Card>
            <CardHeader>
              <CardTitle>Parameter Values</CardTitle>
              <CardDescription>Configure parameter values for the workflow instance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This tab allows you to configure parameter values for all processes in the workflow at once.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Templates</CardTitle>
              <CardDescription>Save and load workflow templates</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This tab allows you to save and load workflow templates.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowInstanceConfig;