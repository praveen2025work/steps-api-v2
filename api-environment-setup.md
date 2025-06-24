# API Environment Configuration Setup

This document explains how to set up and use the API environment configuration system for your .NET-based Windows authenticated API calls.

## Overview

The system provides:
- Multiple environment configurations (Dev, UAT, Demo, Production)
- Windows authentication support
- Environment switching with persistent selection
- Connection testing and status monitoring
- Retry logic with exponential backoff
- Real-time API testing interface

## Files Created

### 1. Configuration Files
- `src/config/api-environments.ts` - Environment definitions and endpoints
- `src/lib/api-client.ts` - API client with Windows authentication
- `src/contexts/ApiEnvironmentContext.tsx` - React context for state management

### 2. UI Components
- `src/components/admin/ApiEnvironmentManager.tsx` - Full management interface
- `src/components/admin/EnvironmentSwitcher.tsx` - Compact switcher component
- `src/pages/admin/api-environments.tsx` - Dedicated admin page

### 3. Integration
- Updated `src/pages/_app.tsx` to include ApiEnvironmentProvider
- Updated `src/components/admin/AdminDashboard.tsx` with quick access

## Environment Configuration

### Current Environments

```typescript
{
  dev: {
    name: 'dev',
    displayName: 'Development',
    baseUrl: 'http://dev-api.com',
    coreApiUrl: 'http://dev-api.com/api/WF',
    authType: 'windows',
    timeout: 30000,
    retryAttempts: 3
  },
  uat: {
    name: 'uat',
    displayName: 'User Acceptance Testing',
    baseUrl: 'http://uat-api.com',
    coreApiUrl: 'http://uat-api.com/api/WF',
    authType: 'windows',
    timeout: 30000,
    retryAttempts: 3
  },
  demo: {
    name: 'demo',
    displayName: 'Demo',
    baseUrl: 'http://demo-api.com',
    coreApiUrl: 'http://demo-api.com/api/WF',
    authType: 'windows',
    timeout: 30000,
    retryAttempts: 2
  },
  prod: {
    name: 'prod',
    displayName: 'Production',
    baseUrl: 'http://api.com',
    coreApiUrl: 'http://api.com/api/WF',
    authType: 'windows',
    timeout: 45000,
    retryAttempts: 5
  }
}
```

### Customizing Environments

To update the environment URLs, edit `src/config/api-environments.ts`:

```typescript
export const API_ENVIRONMENTS: Record<string, ApiEnvironment> = {
  dev: {
    name: 'dev',
    displayName: 'Development',
    baseUrl: 'http://your-dev-server.com',
    coreApiUrl: 'http://your-dev-server.com/api/WF',
    // ... other settings
  },
  // ... other environments
};
```

## API Endpoints

### Current Endpoints

```typescript
export const CORE_API_ENDPOINTS = {
  GET_WORKFLOW_APPLICATIONS: '/GetWorkflowApplicationDetails',
  // Add more endpoints as needed
} as const;
```

### Adding New Endpoints

1. Add the endpoint to `CORE_API_ENDPOINTS` in `src/config/api-environments.ts`
2. Add a method to the `ApiClient` class in `src/lib/api-client.ts`

Example:
```typescript
// In api-environments.ts
export const CORE_API_ENDPOINTS = {
  GET_WORKFLOW_APPLICATIONS: '/GetWorkflowApplicationDetails',
  GET_WORKFLOW_INSTANCES: '/GetWorkflowInstances',
  // ... more endpoints
} as const;

// In api-client.ts
async getWorkflowInstances(applicationId: string): Promise<ApiResponse<WorkflowInstance[]>> {
  const endpoint = `${CORE_API_ENDPOINTS.GET_WORKFLOW_INSTANCES}/${applicationId}`;
  return this.makeRequest<WorkflowInstance[]>(endpoint);
}
```

## Usage

### 1. Environment Switching

#### In Admin Dashboard
- Navigate to Admin → API Environments
- Select environment from dropdown
- Test connection
- View and test API responses

#### Using Compact Switcher
```typescript
import EnvironmentSwitcher from '@/components/admin/EnvironmentSwitcher';

// In your component
<EnvironmentSwitcher variant="compact" showStatus={true} />
```

### 2. Making API Calls

#### Using the Context Hook
```typescript
import { useApiEnvironment, useApplicationsData } from '@/contexts/ApiEnvironmentContext';

function MyComponent() {
  const { currentEnvironment, connectionStatus } = useApiEnvironment();
  const { applications, isLoading, error, fetchApplications } = useApplicationsData();

  useEffect(() => {
    if (connectionStatus === 'connected') {
      fetchApplications();
    }
  }, [connectionStatus]);

  return (
    <div>
      <p>Current Environment: {currentEnvironment.displayName}</p>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {applications.map(app => (
        <div key={app.applicationId}>{app.name}</div>
      ))}
    </div>
  );
}
```

#### Direct API Client Usage
```typescript
import { useApiClient } from '@/lib/api-client';

function MyComponent() {
  const apiClient = useApiClient();

  const handleFetchData = async () => {
    try {
      const response = await apiClient.getWorkflowApplications(false);
      if (response.success) {
        console.log('Applications:', response.data);
      } else {
        console.error('Error:', response.error);
      }
    } catch (error) {
      console.error('Request failed:', error);
    }
  };

  return (
    <button onClick={handleFetchData}>
      Fetch Applications
    </button>
  );
}
```

## Windows Authentication

The system is configured for Windows Authentication with the following settings:

```typescript
const defaultOptions: RequestInit = {
  method: 'GET',
  credentials: 'include', // Important for Windows authentication
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
  },
  // ... other options
};
```

### Requirements
- Your application must be running in an environment with access to the target APIs
- Windows credentials must have proper permissions
- Network connectivity to the API servers

### Troubleshooting Authentication
1. Verify network connectivity to API endpoints
2. Check Windows domain access
3. Ensure proper CORS configuration on API servers
4. Test with browser developer tools to see authentication headers

## Environment Variables

You can set default environment using environment variables:

```bash
# Set default environment
NEXT_PUBLIC_DEFAULT_API_ENV=dev

# Set current environment (overrides default)
NEXT_PUBLIC_API_ENVIRONMENT=uat
```

## Testing and Debugging

### Connection Testing
1. Go to Admin → API Environments
2. Select an environment
3. Click "Test" button to verify connectivity
4. Check connection status indicator

### API Response Testing
1. Use "Fetch Applications" button to test actual API calls
2. View detailed response data
3. Toggle "Include inactive applications" to test different parameters
4. Check browser developer tools for network requests

### Error Handling
The system includes comprehensive error handling:
- Automatic retry with exponential backoff
- Timeout handling
- Connection status monitoring
- Detailed error messages

## Next Steps

1. **Update Environment URLs**: Replace placeholder URLs with your actual API endpoints
2. **Add More Endpoints**: Extend the system with additional API endpoints as needed
3. **Customize Authentication**: Modify authentication headers if needed
4. **Add Environment Variables**: Set up environment-specific configurations
5. **Test Connectivity**: Verify all environments are accessible from your network

## Support

For issues or questions:
1. Check browser developer tools for network errors
2. Verify Windows authentication is working
3. Test API endpoints directly with tools like Postman
4. Check the API Environment Manager for detailed error messages