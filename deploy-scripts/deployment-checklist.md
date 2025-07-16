# IIS Deployment Checklist for STEPS Application

## Pre-Deployment Checklist

### Server Requirements
- [ ] Windows Server with IIS installed and configured
- [ ] Node.js 20.x installed on the server
- [ ] IIS URL Rewrite Module 2.1 installed
- [ ] Administrative access to the IIS server
- [ ] For iisnode approach: iisnode module installed

### Application Preparation
- [ ] All dependencies installed locally (`npm install`)
- [ ] Application builds successfully (`npm run build`)
- [ ] Environment variables configured for production
- [ ] API endpoints updated to production URLs
- [ ] SSL certificate configured (recommended)

## Static Export Deployment (Approach 1)

### Build Process
- [ ] Run `deploy-scripts/build-for-iis.bat` or manually:
  - [ ] `npm install`
  - [ ] `npm run build`
- [ ] Verify `out` folder is created with static files

### IIS Configuration
- [ ] Create or configure IIS website
- [ ] Copy contents of `out` folder to IIS website directory
- [ ] Copy `deploy-scripts/web.config` to website root
- [ ] Configure SSL certificate (if using HTTPS)
- [ ] Test website accessibility

### Post-Deployment Testing
- [ ] Homepage loads correctly
- [ ] Navigation between pages works
- [ ] API calls function properly
- [ ] Static assets (images, CSS, JS) load correctly
- [ ] Error pages display appropriately

## iisnode Deployment (Approach 2)

### Build Process
- [ ] `npm install`
- [ ] `npm run build`
- [ ] Copy `deploy-scripts/server.js` to project root
- [ ] Copy `deploy-scripts/iisnode.yml` to project root

### Server Setup
- [ ] Copy entire project folder to server
- [ ] Run `npm install --production` on server
- [ ] Copy `deploy-scripts/iisnode-web.config` as `web.config`
- [ ] Configure environment variables on server

### IIS Configuration
- [ ] Create IIS application pointing to project folder
- [ ] Verify iisnode handler is configured
- [ ] Configure SSL certificate (if using HTTPS)
- [ ] Set appropriate permissions for IIS_IUSRS

### Post-Deployment Testing
- [ ] Application starts without errors
- [ ] Check iisnode logs for any issues
- [ ] Test all application functionality
- [ ] Verify server-side features work correctly

## Environment Configuration

### Environment Variables
- [ ] Copy and configure `.env.production`
- [ ] Update `NEXT_PUBLIC_BASE_URL` to production API
- [ ] Set `NEXT_PUBLIC_FORCE_REAL_API=true`
- [ ] Configure any additional environment variables

### API Configuration
- [ ] Verify API endpoints are accessible from server
- [ ] Configure CORS settings on API server
- [ ] Test API connectivity from deployed application

## Security Configuration

### IIS Security
- [ ] Configure appropriate authentication
- [ ] Set up SSL/TLS certificate
- [ ] Configure security headers in web.config
- [ ] Remove unnecessary HTTP methods
- [ ] Configure request filtering

### Application Security
- [ ] Remove development/debug configurations
- [ ] Secure sensitive configuration files
- [ ] Configure appropriate file permissions
- [ ] Enable logging for security monitoring

## Performance Optimization

### IIS Optimization
- [ ] Enable compression (gzip)
- [ ] Configure caching headers
- [ ] Optimize static content delivery
- [ ] Configure connection limits if needed

### Application Optimization
- [ ] Verify production build is optimized
- [ ] Configure CDN for static assets (if applicable)
- [ ] Set up monitoring and logging
- [ ] Configure health checks

## Monitoring and Maintenance

### Logging
- [ ] Configure IIS logging
- [ ] Set up application logging
- [ ] Configure log rotation
- [ ] Set up log monitoring/alerting

### Monitoring
- [ ] Set up uptime monitoring
- [ ] Configure performance monitoring
- [ ] Set up error tracking
- [ ] Configure backup procedures

### Maintenance
- [ ] Document deployment process
- [ ] Create rollback procedures
- [ ] Schedule regular updates
- [ ] Plan for scaling if needed

## Troubleshooting

### Common Issues to Check
- [ ] 404 errors - verify URL rewrite rules
- [ ] 500 errors - check application logs
- [ ] Static files not loading - verify MIME types
- [ ] API calls failing - check CORS and endpoints
- [ ] Performance issues - check caching and compression

### Debugging Steps
- [ ] Enable detailed error messages (temporarily)
- [ ] Check Windows Event Logs
- [ ] Review IIS logs
- [ ] Check application-specific logs
- [ ] Test locally first

## Final Verification

### Functionality Testing
- [ ] All pages load correctly
- [ ] User authentication works
- [ ] API integrations function properly
- [ ] File uploads/downloads work
- [ ] All interactive features operational

### Performance Testing
- [ ] Page load times acceptable
- [ ] API response times reasonable
- [ ] No memory leaks or resource issues
- [ ] Concurrent user handling adequate

### Security Testing
- [ ] HTTPS working correctly
- [ ] Security headers present
- [ ] No sensitive information exposed
- [ ] Authentication/authorization working

## Sign-off

- [ ] Development team approval
- [ ] System administrator approval
- [ ] End user acceptance testing completed
- [ ] Documentation updated
- [ ] Deployment completed successfully

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Version:** _______________
**Notes:** _______________