import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import ApiEnvironmentManager from '@/components/admin/ApiEnvironmentManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';

const ApiEnvironmentsSimplePage: React.FC = () => {
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

        {/* Main API Environment Manager */}
        <ApiEnvironmentManager />
      </div>
    </DashboardLayout>
  );
};

export default ApiEnvironmentsSimplePage;