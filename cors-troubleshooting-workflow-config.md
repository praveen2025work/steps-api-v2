# CORS Troubleshooting Guide for Workflow Configuration

## Issue Description
You're experiencing CORS (Cross-Origin Resource Sharing) errors when making API calls to `/workflowapp` endpoint from the Workflow Configuration Manager, even though the same call works in the Metadata Management component.

## Root Cause Analysis

### 1. Different API Call Patterns
- **MetadataManagement.tsx**: Uses proper CORS configuration with `credentials: 'omit'` for Java APIs
- **WorkflowConfigurationManager.tsx**: Uses the `workflowConfigService` which now has improved CORS handling

### 2. Environment Configuration Issues
The API environments might not be properly configured for your deployment environment.

## Solutions

### Solution 1: Verify Environment Variables
Check your environment variables are properly set:

```bash
# For local development
NEXT_PUBLIC_FORCE_REAL_API=true
NEXT_PUBLIC_BASE_URL=http://your-dotnet-api-server
NEXT_PUBLIC_JAVA_BASE_URL=http://your-java-api-server

# For production deployment
NEXT_PUBLIC_API_ENVIRONMENT=prod
NEXT_PUBLIC_BASE_URL=https://your-production-dotnet-api
NEXT_PUBLIC_JAVA_BASE_URL=https://your-production-java-api
```

### Solution 2: Server-Side CORS Configuration

#### For Java API Server
Add CORS configuration to your Java Spring Boot application:

```java
@Configuration
@EnableWebMvc
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:4000", "https://your-frontend-domain.com")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false) // Important: Java API doesn't use credentials
                .maxAge(3600);
    }
}
```

#### For .NET API Server
Add CORS configuration to your .NET application:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddCors(options =>
    {
        options.AddPolicy("AllowSpecificOrigins",
            builder =>
            {
                builder.WithOrigins("http://localhost:3000", "http://localhost:4000", "https://your-frontend-domain.com")
                       .AllowAnyHeader()
                       .AllowAnyMethod()
                       .AllowCredentials(); // .NET API uses Windows authentication
            });
    });
}

public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    app.UseCors("AllowSpecificOrigins");
    // ... other middleware
}
```

### Solution 3: Client-Side Debugging

The updated `workflowConfigService.ts` now includes:
- Proper CORS mode setting (`mode: 'cors'`)
- Different credential handling for Java vs .NET APIs
- Enhanced error logging
- Fallback URL attempts

### Solution 4: Network/Proxy Issues

If you're behind a corporate proxy or firewall:

1. **Check if the API endpoints are accessible**:
   ```bash
   curl -X GET "http://your-java-api-server/api/workflowapp" \
        -H "Accept: application/json" \
        -H "Content-Type: application/json"
   ```

2. **Verify the response headers include CORS headers**:
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
   Access-Control-Allow-Headers: Content-Type, Accept
   ```

### Solution 5: Browser Developer Tools Debugging

1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Try the API call
4. Look for:
   - **Preflight OPTIONS request**: Should return 200 OK
   - **Actual request**: Should not be blocked
   - **Console errors**: Look for specific CORS error messages

## Testing Steps

### Step 1: Test with Browser Console
Open browser console and run:

```javascript
fetch('http://your-java-api-server/api/workflowapp', {
  method: 'GET',
  mode: 'cors',
  credentials: 'omit',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

### Step 2: Compare Working vs Non-Working Calls
1. Check the Network tab when using Metadata Management (working)
2. Check the Network tab when using Workflow Configuration (not working)
3. Compare the request headers, response headers, and status codes

### Step 3: Verify Environment Configuration
Check the browser console for the environment configuration logs:

```javascript
// This will show which environment is being used
console.log('Current environment:', getCurrentEnvironment());
```

## Common CORS Error Messages and Solutions

### Error: "Access to fetch at '...' from origin '...' has been blocked by CORS policy"
**Solution**: Server needs to add proper CORS headers

### Error: "Request header field content-type is not allowed by Access-Control-Allow-Headers"
**Solution**: Server needs to include 'Content-Type' in Access-Control-Allow-Headers

### Error: "The request client is not a secure context"
**Solution**: Use HTTPS for both frontend and backend, or add localhost to secure contexts

### Error: "Credentials include but Access-Control-Allow-Credentials is false"
**Solution**: Either set `credentials: 'omit'` in client or `Access-Control-Allow-Credentials: true` on server

## Environment-Specific Solutions

### Local Development
```bash
# .env.local
NEXT_PUBLIC_FORCE_REAL_API=true
NEXT_PUBLIC_BASE_URL=http://localhost:8080
NEXT_PUBLIC_JAVA_BASE_URL=http://localhost:8081
```

### Production Deployment
```bash
# .env.production
NEXT_PUBLIC_API_ENVIRONMENT=prod
NEXT_PUBLIC_BASE_URL=https://your-production-api.com
NEXT_PUBLIC_JAVA_BASE_URL=https://your-production-java-api.com
```

## Next Steps

1. **Check server logs** for any CORS-related errors
2. **Verify API endpoints** are accessible from your frontend domain
3. **Test with a simple curl command** to isolate client vs server issues
4. **Check browser console** for detailed error messages
5. **Compare network requests** between working and non-working components

If the issue persists, please provide:
- The exact error message from browser console
- Network tab screenshots showing the failed request
- Your current environment variable values
- Server CORS configuration (if accessible)