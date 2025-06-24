import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useApiEnvironment, useApplicationsData } from '@/contexts/ApiEnvironmentContext';
import { useApiClient } from '@/lib/api-client';
import type { ApplicationParameter } from '@/lib/api-client';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  HelpCircle, 
  RefreshCw, 
  Server, 
  Database,
  Globe,
  Settings,
  Eye,
  EyeOff,
  Search,
  Info
} from 'lucide-react';

// Simple time ago function as fallback
const formatDistanceToNow = (date: Date, options?: { addSuffix?: boolean }) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return options?.addSuffix ? 'just now' : 'now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes${options?.addSuffix ? ' ago' : ''}`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours${options?.addSuffix ? ' ago' : ''}`;
  return `${Math.floor(diffInSeconds / 86400)} days${options?.addSuffix ? ' ago' : ''}`;
};

const ApiEnvironmentManager: React.FC = () => {
  // Wrap the hooks in try-catch to prevent crashes
  let environmentData;
  let applicationsData;
  
  try {
    environmentData = useApiEnvironment();
  } catch (error) {
    console.error('Error loading API environment context:', error);
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load API environment configuration. Please refresh the page.
        </AlertDescription>
      </Alert>
    );
  }

  try {
    applicationsData = useApplicationsData();
  } catch (error) {
    console.error('Error loading applications data:', error);
    applicationsData = {
      applications: [],
      isLoading: false,
      error: 'Failed to load applications data',
      lastFetch: null,
      fetchApplications: () => {},
      refetch: () => {},
    };
  }

  const {
    currentEnvironment,
    availableEnvironments,
    switchEnvironment,
    isLoading,
    connectionStatus,
    testConnection,
    lastConnectionTest,
  } = environmentData;

  const {
    applications,
    isLoading: applicationsLoading,
    error: applicationsError,
    lastFetch,
    fetchApplications,
  } = applicationsData;

  const [showApplications, setShowApplications] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  
  // Application Parameters state
  const [appId, setAppId] = useState<string>('17'); // Default to your example
  const [applicationParameters, setApplicationParameters] = useState<ApplicationParameter[]>([]);
  const [parametersLoading, setParametersLoading] = useState(false);
  const [parametersError, setParametersError] = useState<string | null>(null);
  const [showParameters, setShowParameters] = useState(false);
  const [lastParametersFetch, setLastParametersFetch] = useState<string | null>(null);

  const apiClient = useApiClient(currentEnvironment);

  // Check if we're in development mode
  const isDevelopmentMode = typeof window !== 'undefined' && (
    window.location.hostname.includes('localhost') || 
    window.location.hostname.includes('preview.co.dev') || 
    window.location.hostname.includes('vercel.app') ||
    window.location.hostname.includes('127.0.0.1')
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'testing':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <HelpCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'disconnected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'testing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleEnvironmentChange = (environmentName: string) => {
    const environment = availableEnvironments.find(env => env.name === environmentName);
    if (environment) {
      switchEnvironment(environment);
    }
  };

  const handleFetchApplications = () => {
    fetchApplications(includeInactive);
    setShowApplications(true);
  };

  const handleFetchApplicationParameters = async () => {
    if (!appId || isNaN(Number(appId))) {
      setParametersError('Please enter a valid Application ID');
      return;
    }

    setParametersLoading(true);
    setParametersError(null);
    
    try {
      const response = await apiClient.getApplicationParameters(Number(appId));
      
      if (response.success) {
        setApplicationParameters(response.data);
        setShowParameters(true);
        setLastParametersFetch(new Date().toISOString());
      } else {
        setParametersError(response.error || 'Failed to fetch application parameters');
        setApplicationParameters([]);
      }
    } catch (error: any) {
      setParametersError(error.message || 'An error occurred while fetching parameters');
      setApplicationParameters([]);
    } finally {
      setParametersLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Development Mode Banner */}
      {isDevelopmentMode && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Development Mode:</strong> This application is running in preview/development mode and using mock data. 
            In your office environment with Windows authentication, it will connect to your actual API endpoints.
          </AlertDescription>
        </Alert>
      )}

      {/* Environment Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            API Environment Manager
          </CardTitle>
          <CardDescription>
            Switch between different API environments and test connections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Environment</label>
              <Select value={currentEnvironment.name} onValueChange={handleEnvironmentChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableEnvironments.map((env) => (
                    <SelectItem key={env.name} value={env.name}>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {env.displayName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Connection Status</label>
              <div className="flex items-center gap-2">
                {getStatusIcon(connectionStatus)}
                <Badge className={getStatusColor(connectionStatus)}>
                  {connectionStatus.toUpperCase()}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testConnection}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Test
                </Button>
              </div>
            </div>
          </div>

          {/* Environment Details */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Base URL:</span>
                <div className="font-mono text-xs bg-background p-2 rounded mt-1">
                  {currentEnvironment.baseUrl}
                </div>
              </div>
              <div>
                <span className="font-medium">Core API URL:</span>
                <div className="font-mono text-xs bg-background p-2 rounded mt-1">
                  {currentEnvironment.coreApiUrl}
                </div>
              </div>
              <div>
                <span className="font-medium">Auth Type:</span>
                <Badge variant="outline" className="ml-2">
                  {currentEnvironment.authType}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Timeout:</span>
                <span className="ml-2">{currentEnvironment.timeout / 1000}s</span>
              </div>
            </div>
            <div>
              <span className="font-medium">Description:</span>
              <p className="text-muted-foreground mt-1">{currentEnvironment.description}</p>
            </div>
            {lastConnectionTest && (
              <div className="text-xs text-muted-foreground">
                Last tested: {formatDistanceToNow(new Date(lastConnectionTest), { addSuffix: true })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* API Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            API Testing
          </CardTitle>
          <CardDescription>
            Test API endpoints and view response data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleFetchApplications}
              disabled={connectionStatus !== 'connected' || applicationsLoading}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              {applicationsLoading ? 'Loading...' : 'Fetch Applications'}
            </Button>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeInactive"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="includeInactive" className="text-sm">
                Include inactive applications
              </label>
            </div>

            {applications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApplications(!showApplications)}
              >
                {showApplications ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showApplications ? 'Hide' : 'Show'} Data
              </Button>
            )}
          </div>

          {applicationsError && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{applicationsError}</AlertDescription>
            </Alert>
          )}

          {applications.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Found {applications.length} applications
                </span>
                {lastFetch && (
                  <span className="text-xs text-muted-foreground">
                    Fetched: {formatDistanceToNow(new Date(lastFetch), { addSuffix: true })}
                  </span>
                )}
              </div>

              {showApplications && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {applications.map((app, index) => (
                      <div key={app.applicationId || index} className="bg-background p-3 rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{app.name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={app.isActive ? "default" : "secondary"}>
                              {app.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">{app.category}</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{app.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><span className="font-medium">ID:</span> {app.applicationId}</div>
                          <div><span className="font-medium">Cron:</span> {app.cronExpression}</div>
                          <div><span className="font-medium">Locking:</span> {app.isLockingEnabled ? 'Enabled' : 'Disabled'}</div>
                          <div><span className="font-medium">Weekdays Only:</span> {app.isRunOnWeekDayOnly ? 'Yes' : 'No'}</div>
                        </div>
                        {app.serviceUrl && (
                          <div className="mt-2 text-xs">
                            <span className="font-medium">Service URL:</span>
                            <div className="font-mono bg-muted p-1 rounded mt-1">{app.serviceUrl}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Parameters Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Application Parameters Testing
          </CardTitle>
          <CardDescription>
            Test the Application-Level Parameters endpoint (GET /api/WF/appparam/{'{appId}'})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="appId" className="text-sm font-medium whitespace-nowrap">
                Application ID:
              </label>
              <Input
                id="appId"
                type="number"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="Enter Application ID (e.g., 17)"
                className="w-48"
              />
            </div>
            
            <Button
              onClick={handleFetchApplicationParameters}
              disabled={connectionStatus !== 'connected' || parametersLoading || !appId}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              {parametersLoading ? 'Loading...' : 'Fetch Parameters'}
            </Button>

            {applicationParameters.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowParameters(!showParameters)}
              >
                {showParameters ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showParameters ? 'Hide' : 'Show'} Data
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
            <strong>Endpoint:</strong> {currentEnvironment.coreApiUrl}/appparam/{appId || '{appId}'}
          </div>

          {parametersError && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{parametersError}</AlertDescription>
            </Alert>
          )}

          {applicationParameters.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Found {applicationParameters.length} parameters for Application ID {appId}
                </span>
                {lastParametersFetch && (
                  <span className="text-xs text-muted-foreground">
                    Fetched: {formatDistanceToNow(new Date(lastParametersFetch), { addSuffix: true })}
                  </span>
                )}
              </div>

              {showParameters && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {applicationParameters.map((param, index) => (
                      <div key={param.paramId || index} className="bg-background p-3 rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{param.name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={param.active === 'Y' ? "default" : "secondary"}>
                              {param.active === 'Y' ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant={param.ignore === 'Y' ? "destructive" : "outline"}>
                              {param.ignore === 'Y' ? 'Ignored' : 'Used'}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="bg-muted/50 p-2 rounded">
                            <span className="text-xs font-medium text-muted-foreground">VALUE:</span>
                            <div className="font-mono text-sm mt-1">{param.value}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div><span className="font-medium">Param ID:</span> {param.paramId}</div>
                            <div><span className="font-medium">App ID:</span> {param.appId}</div>
                            <div><span className="font-medium">Updated By:</span> {param.updatedBy}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {applicationParameters.length === 0 && !parametersError && !parametersLoading && lastParametersFetch && (
            <Alert>
              <HelpCircle className="h-4 w-4" />
              <AlertDescription>
                No parameters found for Application ID {appId}. This could mean the application has no parameters configured or the ID doesn't exist.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiEnvironmentManager;