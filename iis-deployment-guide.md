# IIS Deployment Guide for STEPS Application

This guide provides multiple approaches to deploy your Next.js STEPS application on an IIS server.

## Prerequisites

- Windows Server with IIS installed
- Node.js 20.x installed on the server
- IIS URL Rewrite Module 2.1
- Administrative access to the IIS server

## Approach 1: Static Export (Recommended for Simple Deployments)

This approach converts your Next.js app to static files that can be served directly by IIS.

### Step 1: Configure Next.js for Static Export

1. Update `next.config.mjs` to enable static export:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["assets.co.dev"],
    unoptimized: true, // Required for static export
  },
  output: 'export', // Enable static export
  trailingSlash: true, // Helps with IIS routing
  webpack: (config, context) => {
    config.optimization.minimize = process.env.NEXT_PUBLIC_CO_DEV_ENV !== "preview";
    return config;
  },
  
  // Remove rewrites and headers for static export
  // These don't work with static export
};

export default nextConfig;
```

### Step 2: Build and Export

1. Install dependencies:
```bash
npm install
```

2. Build the application:
```bash
npm run build
```

3. The static files will be generated in the `out` folder.

### Step 3: Deploy to IIS

1. Copy the contents of the `out` folder to your IIS website directory (e.g., `C:\inetpub\wwwroot\steps`)

2. Create a `web.config` file in the root directory:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <!-- Handle client-side routing -->
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/(api)" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    
    <!-- MIME types for modern web files -->
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".woff" mimeType="application/font-woff" />
      <mimeMap fileExtension=".woff2" mimeType="application/font-woff2" />
    </staticContent>
    
    <!-- Security headers -->
    <httpProtocol>
      <customHeaders>
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="X-Frame-Options" value="DENY" />
        <add name="X-XSS-Protection" value="1; mode=block" />
      </customHeaders>
    </httpProtocol>
    
    <!-- Compression -->
    <urlCompression doStaticCompression="true" doDynamicCompression="true" />
    
    <!-- Caching -->
    <staticContent>
      <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="31536000" />
    </staticContent>
  </system.webServer>
</configuration>
```

## Approach 2: Node.js with iisnode (For Full Next.js Features)

This approach runs your Next.js application as a Node.js process behind IIS.

### Step 1: Install iisnode

1. Download and install iisnode from: https://github.com/Azure/iisnode
2. Install the appropriate version (x64 or x86) for your server

### Step 2: Prepare the Application

1. Build the application:
```bash
npm run build
```

2. Create a `server.js` file in your project root:

```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

3. Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "node server.js",
    "lint": "next lint"
  }
}
```

### Step 3: Deploy to IIS

1. Copy your entire project folder to the server (e.g., `C:\inetpub\wwwroot\steps`)

2. Install dependencies on the server:
```bash
npm install --production
```

3. Create a `web.config` file:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode"/>
    </handlers>
    
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^server.js\/debug[\/]?" />
        </rule>
        
        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}"/>
        </rule>
        
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="server.js"/>
        </rule>
      </rules>
    </rewrite>
    
    <security>
      <requestFiltering>
        <hiddenSegments>
          <remove segment="bin"/>
        </hiddenSegments>
      </requestFiltering>
    </security>
    
    <httpErrors existingResponse="PassThrough" />
    
    <iisnode
      node_env="%node_env%"
      nodeProcessCommandLine="&quot;%programfiles%\nodejs\node.exe&quot;"
      interceptor="&quot;%programfiles%\iisnode\interceptor.js&quot;" />
  </system.webServer>
</configuration>
```

4. Create an `iisnode.yml` file:

```yaml
node_env: production
loggingEnabled: true
logDirectory: iisnode
debuggingEnabled: false
```

## Approach 3: Reverse Proxy (Advanced)

This approach uses IIS as a reverse proxy to a Node.js process.

### Step 1: Install Application Request Routing (ARR)

1. Download and install ARR 3.0 from Microsoft
2. Enable proxy functionality in IIS Manager

### Step 2: Configure the Application

1. Build and start your application on a specific port:
```bash
npm run build
npm start -- -p 3001
```

2. Create a `web.config` for reverse proxy:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="ReverseProxyInboundRule1" stopProcessing="true">
          <match url="(.*)" />
          <action type="Rewrite" url="http://localhost:3001/{R:1}" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

## Environment Configuration

### Step 1: Set Environment Variables

Create appropriate environment files for your IIS deployment:

1. `.env.production`:
```env
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-api-server.com
NEXT_PUBLIC_FORCE_REAL_API=true
NEXT_PUBLIC_CO_DEV_ENV=production
```

### Step 2: Configure API Endpoints

Update your API configuration to point to your production endpoints instead of localhost.

## Security Considerations

1. **HTTPS**: Always use HTTPS in production
2. **Environment Variables**: Store sensitive data in environment variables, not in code
3. **Firewall**: Configure Windows Firewall to allow only necessary ports
4. **Updates**: Keep Node.js, IIS, and all modules updated

## Monitoring and Logging

1. **IIS Logs**: Enable detailed logging in IIS Manager
2. **Node.js Logs**: Configure application logging
3. **Performance Monitoring**: Use Windows Performance Monitor
4. **Health Checks**: Implement health check endpoints

## Troubleshooting

### Common Issues:

1. **404 Errors**: Check URL Rewrite rules and routing configuration
2. **500 Errors**: Check Node.js logs and iisnode logs
3. **Static Files**: Ensure static files are properly served
4. **API Calls**: Verify API endpoints and CORS configuration

### Debugging Steps:

1. Check Windows Event Logs
2. Enable detailed error messages in web.config
3. Test the application locally first
4. Verify all dependencies are installed on the server

## Performance Optimization

1. **Compression**: Enable gzip compression in IIS
2. **Caching**: Configure proper caching headers
3. **CDN**: Consider using a CDN for static assets
4. **Load Balancing**: For high-traffic scenarios, consider load balancing

## Recommended Approach

For your STEPS application, I recommend **Approach 1 (Static Export)** if:
- You don't need server-side rendering
- Your API calls are handled by external services
- You want simpler deployment and maintenance

Use **Approach 2 (iisnode)** if:
- You need full Next.js features
- You have server-side rendering requirements
- You need API routes functionality

Choose the approach that best fits your requirements and infrastructure constraints.