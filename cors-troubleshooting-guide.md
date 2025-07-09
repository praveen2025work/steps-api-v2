# CORS Troubleshooting Guide

## Overview

This guide helps you resolve Cross-Origin Resource Sharing (CORS) errors when connecting your Next.js frontend to your .NET backend API.

## Current Configuration

Based on your `.env.local` file:
```bash
NODE_ENV=local
NEXT_PUBLIC_API_MODE=live
NEXT_PUBLIC_BASE_URL=http://localhost:8080
NEXT_PUBLIC_FORCE_REAL_API=true
```

## Common CORS Error Messages

1. **"Access to fetch at 'http://localhost:8080/api/WF/...' from origin 'http://localhost:3000' has been blocked by CORS policy"**
2. **"Failed to fetch"** (often indicates CORS issues)
3. **"Network Error"** (can be CORS-related)

## Quick Solutions

### 1. Immediate Fix - Switch to Mock Mode

If you need to continue development immediately:

```bash
# Update .env.local
NEXT_PUBLIC_FORCE_REAL_API=false
NEXT_PUBLIC_API_MODE=mock
```

Then restart your development server:
```bash
npm run dev
```

### 2. Use Development Proxy (Recommended)

The application is already configured with a development proxy. Make sure you restart your dev server after updating the environment variables:

```bash
npm run dev
```

The proxy will automatically route `/api/proxy/*` requests to your backend server, bypassing CORS restrictions.

### 3. Configure CORS on Your .NET Backend

Add CORS configuration to your .NET API:

#### For .NET 6+ (Program.cs):
```csharp
var builder = WebApplication.CreateBuilder(args);

// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

var app = builder.Build();

// Use CORS
app.UseCors("AllowLocalhost");

// Other middleware...
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
```

#### For .NET 5 and earlier (Startup.cs):
```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddCors(options =>
    {
        options.AddPolicy("AllowLocalhost",
            builder =>
            {
                builder.WithOrigins("http://localhost:3000")
                       .AllowAnyHeader()
                       .AllowAnyMethod()
                       .AllowCredentials();
            });
    });
    
    // Other services...
}

public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    // Other middleware...
    
    app.UseCors("AllowLocalhost");
    
    app.UseAuthentication();
    app.UseAuthorization();
    
    app.UseRouting();
    app.UseEndpoints(endpoints =>
    {
        endpoints.MapControllers();
    });
}
```

### 4. Verify Backend Server Status

Ensure your backend server is running and accessible:

1. **Check if server is running**: Open `http://localhost:8080` in your browser
2. **Test API endpoint directly**: Try `http://localhost:8080/api/WF/GetWorkflowApplicationDetails/false`
3. **Check server logs** for any errors or authentication issues

### 5. Windows Authentication Configuration

If using Windows Authentication, ensure:

1. **IIS Express Configuration** (if using Visual Studio):
   ```xml
   <!-- In applicationhost.config or web.config -->
   <system.webServer>
     <security>
       <authentication>
         <windowsAuthentication enabled="true" />
         <anonymousAuthentication enabled="false" />
       </authentication>
     </security>
   </system.webServer>
   ```

2. **Kestrel Configuration** (if using Kestrel):
   ```csharp
   // In Program.cs
   builder.Services.AddAuthentication(IISDefaults.AuthenticationScheme);
   ```

## Testing and Debugging

### Using the Built-in CORS Debugger

1. Navigate to `/admin/api-environments` in your application
2. Click on the "CORS Troubleshooting" tab
3. Run the CORS tests to diagnose the issue
4. Follow the recommendations provided

### Manual Testing

Test your API endpoint directly:

```bash
# Test if the endpoint is accessible
curl -X GET "http://localhost:8080/api/WF/GetWorkflowApplicationDetails/false" \
  -H "Accept: application/json"

# Test CORS preflight
curl -X OPTIONS "http://localhost:8080/api/WF/GetWorkflowApplicationDetails/false" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type"
```

### Browser Developer Tools

1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Try to make an API call from your application
4. Look for:
   - Failed requests with CORS errors
   - Missing `Access-Control-Allow-Origin` headers
   - 401/403 authentication errors

## Environment-Specific Solutions

### Development Environment
- Use the built-in proxy configuration
- Configure CORS to allow `http://localhost:3000`
- Ensure backend server is running on the correct port

### Production Environment
- Configure CORS to allow your production domain
- Use HTTPS for both frontend and backend
- Ensure proper authentication configuration

### Office/Corporate Network
- Check firewall and proxy settings
- Verify Windows authentication is working
- Ensure network access to the API server

## Advanced Configuration

### Custom Proxy Configuration

If you need custom proxy behavior, modify `next.config.mjs`:

```javascript
async rewrites() {
  return [
    {
      source: '/api/custom/:path*',
      destination: 'http://your-backend-server:port/api/:path*',
    },
  ];
}
```

### Multiple Environment Support

Create environment-specific configurations:

```bash
# .env.development
NEXT_PUBLIC_BASE_URL=http://localhost:8080

# .env.production
NEXT_PUBLIC_BASE_URL=https://api.yourcompany.com

# .env.staging
NEXT_PUBLIC_BASE_URL=https://staging-api.yourcompany.com
```

## Troubleshooting Checklist

- [ ] Backend server is running on the configured port
- [ ] CORS is properly configured on the backend
- [ ] Environment variables are correctly set
- [ ] Development server has been restarted after config changes
- [ ] Network connectivity to the backend server
- [ ] Windows authentication is working (if applicable)
- [ ] Firewall/proxy settings allow the connection
- [ ] API endpoints are accessible directly via browser/curl

## Common Mistakes

1. **Forgetting to restart the dev server** after changing environment variables
2. **Not configuring CORS on the backend** - this is the most common issue
3. **Using wrong port numbers** in the configuration
4. **Mixed HTTP/HTTPS** - ensure both frontend and backend use the same protocol
5. **Windows authentication issues** - verify credentials and network access

## Getting Help

If you're still experiencing issues:

1. Use the built-in CORS debugger in the application
2. Check the browser console for detailed error messages
3. Review the backend server logs
4. Test API endpoints directly with tools like Postman or curl
5. Verify network connectivity and authentication

## Additional Resources

- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [ASP.NET Core CORS Documentation](https://docs.microsoft.com/en-us/aspnet/core/security/cors)
- [Next.js Rewrites Documentation](https://nextjs.org/docs/api-reference/next.config.js/rewrites)