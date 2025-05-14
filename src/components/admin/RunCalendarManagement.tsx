import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const RunCalendarManagement: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Run Calendar Management</CardTitle>
        <CardDescription>Configure run calendars for application scheduling</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          This component will allow you to:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
          <li>Create run calendars with specific run days</li>
          <li>Define exceptions to regular scheduling</li>
          <li>Assign run calendars to applications</li>
          <li>View upcoming scheduled runs</li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default RunCalendarManagement;