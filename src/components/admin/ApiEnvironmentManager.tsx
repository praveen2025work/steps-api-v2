import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useApiEnvironment, useApplicationsData } from '@/contexts/ApiEnvironmentContext';
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
  EyeOff
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ApiEnvironmentManager: React.FC = () => {
  const {
    currentEnvironment,
    availableEnvironments,
    switchEnvironment,
    isLoading,
    connectionStatus,
    testConnection,
    lastConnectionTest,
  } = useApiEnvironment();

  const {
    applications,
    isLoading: applicationsLoading,
    error: applicationsError,
    lastFetch,
    fetchApplications,
  } = useApplicationsData();

  const [showApplications, setShowApplications] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);

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

  return (
    <div className="space-y-6">
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
    </div>
  );
};

export default ApiEnvironmentManager;