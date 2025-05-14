import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ApplicationManagement from './ApplicationManagement';
import RoleManagement from './RoleManagement';
import HolidayCalendarManagement from './HolidayCalendarManagement';
import RunCalendarManagement from './RunCalendarManagement';
import HierarchyManagement from './HierarchyManagement';
import MetadataManagement from './MetadataManagement';
import WorkflowInstanceConfig from './WorkflowInstanceConfig';
import AdminDashboard from './AdminDashboard';

const WorkflowDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('applications');

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Workflow Management System</h1>
      
      <Tabs defaultValue="applications" value={activeTab} onValueChange={setActiveTab} className="w-full">
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
              <MetadataManagement />
            </TabsContent>
            
            <TabsContent value="workflow" className="mt-0">
              <WorkflowInstanceConfig />
            </TabsContent>
            
            <TabsContent value="admin" className="mt-0">
              <AdminDashboard />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default WorkflowDashboard;