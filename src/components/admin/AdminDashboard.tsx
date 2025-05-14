import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDashboard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Dashboard</CardTitle>
        <CardDescription>Administrative tools and audit logs</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          This component will allow you to:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
          <li>View and manage workflow runs</li>
          <li>Rerun failed workflows</li>
          <li>Access audit logs for all system activities</li>
          <li>Monitor system performance and usage</li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default AdminDashboard;