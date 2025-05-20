import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ApplicationManagement from './ApplicationManagement';
import RoleManagement from './RoleManagement';
import HolidayCalendarManagement from './HolidayCalendarManagement';
import RunCalendarManagement from './RunCalendarManagement';
import HierarchyManagement from './HierarchyManagement';

interface WorkflowDashboardProps {
  defaultTab?: string;
}

const WorkflowDashboard: React.FC<WorkflowDashboardProps> = ({ defaultTab = 'applications' }) => {
  const router = useRouter();
  const { tab } = router.query;
  const [activeTab, setActiveTab] = useState(tab as string || defaultTab);
  
  // Update active tab when URL query parameter changes
  useEffect(() => {
    if (tab) {
      setActiveTab(tab as string);
    } else if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [tab, defaultTab]);

  // Navigate to separate pages for metadata, workflow config, and admin dashboard
  // or update the URL with query parameter for tabs that stay on the same page
  const handleTabChange = (value: string) => {
    if (value === 'metadata') {
      router.push('/admin/metadata');
      return;
    } else if (value === 'workflow') {
      router.push('/admin/workflow-config');
      return;
    } else if (value === 'admin') {
      router.push('/admin');
      return;
    }
    
    // For other tabs, update the URL with the tab query parameter
    router.push({
      pathname: '/admin',
      query: { tab: value }
    }, undefined, { shallow: true });
    
    setActiveTab(value);
  };

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="applications" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-8 mb-6">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="holidays">Holiday Calendar</TabsTrigger>
          <TabsTrigger value="runcalendar">Run Calendar</TabsTrigger>
          <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="workflow">Workflow Config</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === 'applications' && 'Application Management'}
              {activeTab === 'roles' && 'Role Management'}
              {activeTab === 'holidays' && 'Holiday Calendar Management'}
              {activeTab === 'runcalendar' && 'Run Calendar Management'}
              {activeTab === 'hierarchy' && 'Hierarchy Management'}
              {activeTab === 'metadata' && 'Metadata Management'}
              {activeTab === 'workflow' && 'Workflow Instance Configuration'}
              {activeTab === 'admin' && 'Admin Dashboard'}
            </CardTitle>
            <CardDescription>
              {activeTab === 'applications' && 'Manage applications, their parameters, and configurations'}
              {activeTab === 'roles' && 'Create and manage roles and permissions'}
              {activeTab === 'holidays' && 'Define holiday calendars for applications'}
              {activeTab === 'runcalendar' && 'Configure run calendars for scheduling'}
              {activeTab === 'hierarchy' && 'Define hierarchical structures for your organization'}
              {activeTab === 'metadata' && 'Manage stages, substages, parameters, and templates'}
              {activeTab === 'workflow' && 'Configure workflow instances for hierarchy nodes'}
              {activeTab === 'admin' && 'Administrative tools and audit logs'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <TabsContent value="applications" className="mt-0">
              <ApplicationManagement />
            </TabsContent>
            
            <TabsContent value="roles" className="mt-0">
              <RoleManagement />
            </TabsContent>
            
            <TabsContent value="holidays" className="mt-0">
              <HolidayCalendarManagement />
            </TabsContent>
            
            <TabsContent value="runcalendar" className="mt-0">
              <RunCalendarManagement />
            </TabsContent>
            
            <TabsContent value="hierarchy" className="mt-0">
              <HierarchyManagement />
            </TabsContent>
            
            <TabsContent value="metadata" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Metadata Management</CardTitle>
                  <CardDescription>Redirecting to Metadata Management page...</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-8">
                  <Button onClick={() => router.push('/admin/metadata')}>
                    Go to Metadata Management
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="workflow" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Instance Configuration</CardTitle>
                  <CardDescription>Redirecting to Workflow Instance Configuration page...</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-8">
                  <Button onClick={() => router.push('/admin/workflow-config')}>
                    Go to Workflow Instance Configuration
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="admin" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Dashboard</CardTitle>
                  <CardDescription>Redirecting to Admin Dashboard page...</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-8">
                  <Button onClick={() => router.push('/admin')}>
                    Go to Admin Dashboard
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default WorkflowDashboard;