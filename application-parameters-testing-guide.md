# Application Parameters API Testing Guide

## Overview

This guide explains how to test the Application-Level Parameters API endpoint (`/api/WF/appparam/{appId}`) when you move the code to your office system.

## API Endpoint Details

- **Endpoint**: `GET /api/WF/appparam/{appId}`
- **Example**: `http://api.com/api/WF/appparam/17`
- **Authentication**: Windows Authentication
- **Response Format**: JSON Array

### Sample Response
```json
[
  {
    "appId": 17,
    "paramId": 623,
    "name": "test",
    "value": "adsa",
    "active": "Y",
    "updatedBy": "kumarp15",
    "ignore": "N"
  }
]
```

## Testing in Your Office Environment

### Step 1: Update API Environment Configuration

1. Navigate to **Admin → API Environment Manager** in your application
2. Update the environment URLs to match your office system:
   - **Development**: `http://your-dev-server.company.com`
   - **UAT**: `http://your-uat-server.company.com`
   - **Production**: `http://your-prod-server.company.com`

### Step 2: Test Connection

1. In the API Environment Manager, select your target environment
2. Click the **Test** button to verify connectivity
3. Ensure the status shows **CONNECTED**

### Step 3: Test Application Parameters Endpoint

1. In the **Application Parameters Testing** section:
   - Enter an Application ID (e.g., `17`)
   - Click **Fetch Parameters**
   - View the results in the expandable data section

### Step 4: Verify Different Application IDs

Test with various Application IDs to ensure the endpoint works correctly:
- Valid IDs that should return data
- Invalid IDs that should return empty arrays
- Non-existent IDs to test error handling

## Network Requirements for Office Testing

### Windows Authentication Setup

Since the API uses Windows Authentication (`credentials: 'include'`), ensure:

1. **Same Domain**: Your browser and API server should be on the same Windows domain
2. **Integrated Authentication**: Enable Windows Integrated Authentication in your browser
3. **Intranet Zone**: Add your API server to the Local Intranet zone in Internet Explorer settings

### Browser Configuration

#### For Chrome/Edge:
1. Go to `chrome://settings/` or `edge://settings/`
2. Search for "Automatically sign in"
3. Enable automatic sign-in for intranet sites

#### For Internet Explorer:
1. Go to Internet Options → Security → Local Intranet → Sites
2. Add your API server domain
3. Ensure "Automatic logon with current user name and password" is selected

### Network Connectivity

Ensure the following ports are accessible:
- **HTTP**: Port 80
- **HTTPS**: Port 443 (if using SSL)
- **Custom Ports**: Any custom ports your API server uses

## Testing Scenarios

### Scenario 1: Valid Application ID
```
Input: Application ID = 17
Expected: Array of parameter objects
Status: Success
```

### Scenario 2: Invalid Application ID
```
Input: Application ID = 99999
Expected: Empty array []
Status: Success (but no data)
```

### Scenario 3: Non-numeric Application ID
```
Input: Application ID = "abc"
Expected: Client-side validation error
Status: Error before API call
```

### Scenario 4: Network/Authentication Issues
```
Input: Any valid Application ID
Expected: Connection error or 401 Unauthorized
Status: Error with descriptive message
```

## Troubleshooting Common Issues

### Issue 1: CORS Errors
**Symptoms**: Browser console shows CORS policy errors
**Solution**: 
- Configure CORS on your .NET API server
- Add your frontend domain to allowed origins

### Issue 2: 401 Unauthorized
**Symptoms**: Authentication failures
**Solution**:
- Verify Windows Authentication is enabled on the API server
- Check domain membership and permissions
- Ensure browser is configured for automatic authentication

### Issue 3: Network Timeouts
**Symptoms**: Requests timeout after 30-45 seconds
**Solution**:
- Check network connectivity between client and server
- Verify firewall rules allow the connection
- Consider increasing timeout values in the configuration

### Issue 4: SSL Certificate Issues
**Symptoms**: SSL/TLS handshake failures
**Solution**:
- Install proper SSL certificates on the API server
- Add certificates to trusted root store if using self-signed certificates

## Environment-Specific Configuration

### Development Environment
```typescript
dev: {
  name: 'dev',
  displayName: 'Development',
  baseUrl: 'http://your-dev-server.company.com',
  coreApiUrl: 'http://your-dev-server.company.com/api/WF',
  authType: 'windows',
  timeout: 30000,
  retryAttempts: 3,
  description: 'Development environment for testing new features'
}
```

### UAT Environment
```typescript
uat: {
  name: 'uat',
  displayName: 'User Acceptance Testing',
  baseUrl: 'http://your-uat-server.company.com',
  coreApiUrl: 'http://your-uat-server.company.com/api/WF',
  authType: 'windows',
  timeout: 30000,
  retryAttempts: 3,
  description: 'UAT environment for user acceptance testing'
}
```

### Production Environment
```typescript
prod: {
  name: 'prod',
  displayName: 'Production',
  baseUrl: 'http://your-prod-server.company.com',
  coreApiUrl: 'http://your-prod-server.company.com/api/WF',
  authType: 'windows',
  timeout: 45000,
  retryAttempts: 5,
  description: 'Production environment - live data'
}
```

## API Client Features

The integrated API client provides:

1. **Automatic Retry**: Exponential backoff retry logic for failed requests
2. **Timeout Handling**: Configurable timeouts per environment
3. **Request Cancellation**: Ability to cancel ongoing requests
4. **Error Handling**: Comprehensive error reporting
5. **Environment Switching**: Easy switching between environments
6. **Windows Authentication**: Built-in support for Windows auth

## Monitoring and Logging

### Client-Side Monitoring
- Check browser developer tools for network requests
- Monitor console for error messages
- Use the built-in connection testing features

### Server-Side Monitoring
- Check IIS logs for incoming requests
- Monitor Windows Event Logs for authentication issues
- Use application-specific logging if available

## Security Considerations

1. **Authentication**: Ensure only authorized users can access the API
2. **Authorization**: Verify users have appropriate permissions for application parameters
3. **Data Sensitivity**: Be aware that parameter values might contain sensitive information
4. **Network Security**: Use HTTPS in production environments
5. **Audit Logging**: Consider logging parameter access for compliance

## Next Steps

After successfully testing the Application Parameters endpoint:

1. **Add More Endpoints**: Extend the API client with additional endpoints as needed
2. **Error Handling**: Implement user-friendly error messages
3. **Caching**: Consider implementing response caching for better performance
4. **Real-time Updates**: Add WebSocket or polling for real-time parameter updates
5. **Bulk Operations**: Implement bulk parameter retrieval for multiple applications

## Support and Documentation

For additional help:
1. Check the main API environment setup documentation
2. Review the API client source code for implementation details
3. Test with different browsers to isolate browser-specific issues
4. Contact your system administrator for server-side configuration help