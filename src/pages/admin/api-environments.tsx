import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import ApiEnvironmentManager from '@/components/admin/ApiEnvironmentManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Globe, Database, Shield } from 'lucide-react';

const ApiEnvironmentsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">API Environment Configuration</h1>
            <p className="text-muted-foreground">
              Manage and test different API environments for your workflow applications
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Admin Only
          </Badge>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Environments</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">
                Dev, UAT, Demo, Production
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Authentication</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Windows</div>
              <p className="text-xs text-muted-foreground">
                Integrated authentication
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Core API</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">WF</div>
              <p className="text-xs text-muted-foreground">
                Workflow management API
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main API Environment Manager */}
        <ApiEnvironmentManager />

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Instructions</CardTitle>
            <CardDescription>
              How to use the API Environment Manager effectively
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Environment Switching</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Select an environment from the dropdown</li>
                  <li>• Connection status will be tested automatically</li>
                  <li>• Your selection is saved for future sessions</li>
                  <li>• Each environment has different timeout and retry settings</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">API Testing</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Test connection before making API calls</li>
                  <li>• Fetch applications to verify data access</li>
                  <li>• Include/exclude inactive applications as needed</li>
                  <li>• View detailed response data for debugging</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Windows Authentication Notes</h4>
              <p className="text-sm text-muted-foreground">
                This application uses Windows Authentication for API calls. Make sure you're running 
                the application in an environment where your Windows credentials have access to the 
                target API endpoints. If you encounter authentication issues, verify your network 
                connectivity and domain access.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ApiEnvironmentsPage;