# API Integration Guide - Mock to Live Backend Services

This guide explains how the application has been converted from mock data to live backend services, starting with the Applications tab.

## Overview

The application now supports both mock and live API modes with seamless switching between environments. The implementation includes:

- **Environment-based configuration** for different deployment stages
- **Service layer abstraction** with Axios for HTTP requests
- **React hooks** for state management and API integration
- **Type-safe interfaces** matching API payloads
- **Error handling and loading states**
- **Windows authentication support** for office environments

## Environment Configuration

### Environment Files

The application uses different environment files for various deployment stages:

- `.env.mock` - Mock data mode for demo/CI
- `.env.local` - Local development with real services
- `.env.dev` - Development environment
- `.env.uat` - User Acceptance Testing environment
- `.env.prod` - Production environment

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_MODE` | API mode (mock/live) | `live` |
| `NEXT_PUBLIC_BASE_URL` | Base API URL | `http://dev-api.mycorp.com` |
| `NEXT_PUBLIC_FORCE_REAL_API` | Force real API calls | `true` |

### Environment Examples

#### Mock Mode (.env.mock)
```bash
NODE_ENV=mock
NEXT_PUBLIC_API_MODE=mock
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_FORCE_REAL_API=false
```

#### Local Development (.env.local)
```bash
NODE_ENV=local
NEXT_PUBLIC_API_MODE=live
NEXT_PUBLIC_BASE_URL=http://localhost:8080
NEXT_PUBLIC_FORCE_REAL_API=true
```

#### Production (.env.prod)
```bash
NODE_ENV=production
NEXT_PUBLIC_API_MODE=live
NEXT_PUBLIC_BASE_URL=https://api.mycorp.com
NEXT_PUBLIC_FORCE_REAL_API=true
```

## API Endpoints

### Applications Tab Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `${BASE_URL}/api/WF/GetWorkflowApplicationDetails/false` | Get all applications |
| POST | `${BASE_URL}/api/WF/SetWorkflowApplicationDetails` | Save/update applications |

### Request/Response Format

#### Get Applications Response
```json
[
  {
    "applicationId": 1,
    "name": "Daily Named Pnl",
    "category": "NPL ID",
    "serviceUrl": null,
    "description": "Daily Named Pnl",
    "entitlementMapping": 12,
    "isActive": true,
    "cronExpression": "0 10 0? * MON-FRI *",
    "isLockingEnabled": true,
    "lockingRole": 2,
    "useRunCalendar": false,
    "createdon": "10/04/2020 00:00:00",
    "runDateOffSet": 1,
    "isRunOnWeekDayOnly": true
  }
]
```

#### Save Application Request
```json
{
  "applicationId": 1,
  "name": "Daily Named Pnl",
  "category": "NPL ID",
  "serviceUrl": null,
  "description": "Daily Named Pnl",
  "entitlementMapping": 12,
  "isActive": true,
  "cronExpression": "0 10 0? * MON-FRI *",
  "isLockingEnabled": true,
  "lockingRole": 2,
  "useRunCalendar": false,
  "createdon": "10/04/2020 00:00:00",
  "runDateOffSet": 1,
  "isRunOnWeekDayOnly": true
}
```

## Service Layer Architecture

### WorkflowService Class

The `WorkflowService` class provides a clean abstraction for API calls:

```typescript
// Get applications
const response = await workflowService.getApplications();

// Save applications
const response = await workflowService.saveApplications(applications);

// Test connection
const response = await workflowService.testConnection();
```

### Features

- **Automatic environment detection** - Switches between mock and live modes
- **Windows authentication support** - Includes credentials and auth headers
- **Request/response interceptors** - For logging and error handling
- **Retry logic** - Exponential backoff for failed requests
- **Timeout handling** - Configurable request timeouts
- **Error handling** - Structured error responses

### Authentication

The service supports Windows authentication for office environments:

```typescript
const defaultOptions: RequestInit = {
  method: 'GET',
  credentials: 'include', // Important for Windows authentication
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'X-Requested-With': 'XMLHttpRequest' // For Windows auth
  }
};
```

## React Hooks Integration

### useApplications Hook

Provides complete application management functionality:

```typescript
const {
  applications,        // Current applications list
  loading,            // Loading state
  error,              // Error message
  updateApplication,  // Update function
  deleteApplication,  // Delete function
  addApplication,     // Add function
  refresh            // Refresh data
} = useApplications();
```

### useEnvironmentInfo Hook

Provides environment information:

```typescript
const envInfo = useEnvironmentInfo();
// Returns: { mode: string, baseUrl: string, isMock: boolean }
```

## UI Components

### Environment Status Banner

The application displays the current environment status:

- **Mock Mode**: Shows "Mock Data Mode" with environment details
- **Live Mode**: Shows "Live API" with connection status

### Error Handling

- **Loading spinners** during API calls
- **Error toasts** for failed operations
- **Empty states** when no data is available
- **Validation messages** for form errors

### Features

- **Search functionality** across applications
- **CRUD operations** (Create, Read, Update, Delete)
- **Form validation** with required fields
- **Responsive design** with mobile support

## Running the Application

### Mock Mode (Demo/CI)
```bash
cp .env.mock .env.local
npm run dev
```

### Local Development
```bash
cp .env.local .env.local
# Update NEXT_PUBLIC_BASE_URL to your local API
npm run dev
```

### Production Deployment
```bash
# Set environment variables in deployment platform
NEXT_PUBLIC_API_MODE=live
NEXT_PUBLIC_BASE_URL=https://api.mycorp.com
NEXT_PUBLIC_FORCE_REAL_API=true

npm run build
npm start
```

## Testing

### Mock Tests
```bash
# Run with mock data (no network calls)
NEXT_PUBLIC_API_MODE=mock npm test
```

### Integration Tests
```bash
# Run with local mock server
npm run test:integration
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the API server allows requests from your domain
2. **Authentication Failures**: Check Windows credentials and network access
3. **Timeout Issues**: Increase timeout values in service configuration
4. **Environment Variables**: Verify all required variables are set

### Debug Mode

Enable detailed logging by setting:
```bash
NEXT_PUBLIC_DEBUG=true
```

### Network Issues

For office environments with Windows authentication:
1. Ensure you're on the corporate network
2. Check that your Windows credentials are valid
3. Verify the API server is accessible from your machine

## Future Enhancements

### Planned Features

1. **Caching Layer** - Redis/memory caching for improved performance
2. **Real-time Updates** - WebSocket integration for live data
3. **Offline Support** - Service worker for offline functionality
4. **Advanced Error Recovery** - Automatic retry with circuit breaker
5. **API Versioning** - Support for multiple API versions

### Additional Endpoints

The service layer is designed to easily support additional endpoints:

```typescript
// Future endpoints
async getRoles(): Promise<ApiResponse<Role[]>>
async getWorkflows(): Promise<ApiResponse<Workflow[]>>
async getUsers(): Promise<ApiResponse<User[]>>
```

## Security Considerations

- **Environment Variables**: Never commit sensitive data to version control
- **API Keys**: Use secure key management for production
- **HTTPS**: Always use HTTPS in production environments
- **Input Validation**: Validate all user inputs before API calls
- **Error Messages**: Don't expose sensitive information in error messages

## Performance Optimization

- **Request Debouncing**: Prevent excessive API calls during user input
- **Data Pagination**: Implement pagination for large datasets
- **Lazy Loading**: Load data only when needed
- **Caching Strategy**: Cache frequently accessed data
- **Bundle Optimization**: Code splitting for better load times

## Monitoring and Logging

- **API Call Logging**: All requests/responses are logged in development
- **Error Tracking**: Structured error reporting
- **Performance Metrics**: Request timing and success rates
- **User Analytics**: Track feature usage and performance

---

For additional support or questions, please refer to the development team or create an issue in the project repository.