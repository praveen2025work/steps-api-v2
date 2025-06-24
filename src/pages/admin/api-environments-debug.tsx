import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import ApiEnvironmentManager from '@/components/admin/ApiEnvironmentManager';

// Test 3: Testing ApiEnvironmentManager import
const ApiEnvironmentsDebugPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="p-4">
        <h1>API Environments Debug Page</h1>
        <p>Testing step by step component loading...</p>
        
        {/* Step 1: Basic HTML */}
        <div className="mt-4 p-4 border rounded">
          <h2>Step 1: Basic HTML - ✓ Working</h2>
        </div>
        
        {/* Step 2: DashboardLayout */}
        <div className="mt-4 p-4 border rounded">
          <h2>Step 2: DashboardLayout - ✓ Working</h2>
        </div>
        
        {/* Step 3: ApiEnvironmentManager */}
        <div className="mt-4 p-4 border rounded">
          <h2>Step 3: ApiEnvironmentManager - Testing...</h2>
          <ApiEnvironmentManager />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ApiEnvironmentsDebugPage;