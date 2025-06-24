import React from 'react';

// Minimal clean version without any complex imports
const ApiEnvironmentsCleanPage: React.FC = () => {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">API Environment Configuration</h1>
        <p className="text-gray-600 mb-8">
          Manage and test different API environments for your workflow applications
        </p>
        
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Environment Status</h2>
          <p className="text-gray-600">
            This is a clean version of the API environments page. 
            The full version with all features is being debugged.
          </p>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-medium text-blue-900">Current Configuration</h3>
            <p className="text-blue-700 text-sm mt-1">
              Your office URL has been configured in the development environment.
              The application will use Windows Authentication when running in your office network.
            </p>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-medium text-yellow-900">Preview Mode</h3>
            <p className="text-yellow-700 text-sm mt-1">
              This preview environment uses mock data. In your office environment, 
              it will connect to your actual API endpoints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiEnvironmentsCleanPage;