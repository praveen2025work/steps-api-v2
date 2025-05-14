import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const MetadataManagement: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Metadata Management</CardTitle>
        <CardDescription>Manage stages, substages, parameters, and templates</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          This component will allow you to:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
          <li>Define workflow stages and substages</li>
          <li>Create and manage parameters</li>
          <li>Design email templates</li>
          <li>Configure attestation requirements</li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default MetadataManagement;