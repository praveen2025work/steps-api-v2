import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useApiEnvironment } from '@/contexts/ApiEnvironmentContext';
import { 
  Globe, 
  CheckCircle, 
  XCircle, 
  Clock, 
  HelpCircle, 
  RefreshCw,
  Settings
} from 'lucide-react';

interface EnvironmentSwitcherProps {
  variant?: 'compact' | 'full';
  showStatus?: boolean;
}

const EnvironmentSwitcher: React.FC<EnvironmentSwitcherProps> = ({ 
  variant = 'compact', 
  showStatus = true 
}) => {
  const {
    currentEnvironment,
    availableEnvironments,
    switchEnvironment,
    connectionStatus,
    testConnection,
    isLoading,
  } = useApiEnvironment();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-3 w-3 text-red-500" />;
      case 'testing':
        return <Clock className="h-3 w-3 text-yellow-500 animate-spin" />;
      default:
        return <HelpCircle className="h-3 w-3 text-gray-500" />;
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

  if (variant === 'compact') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">{currentEnvironment.displayName}</span>
            {showStatus && getStatusIcon(connectionStatus)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">API Environment</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/admin/api-environments'}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Environment</label>
              <Select 
                value={currentEnvironment.name} 
                onValueChange={(value) => {
                  const env = availableEnvironments.find(e => e.name === value);
                  if (env) switchEnvironment(env);
                }}
              >
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

            {showStatus && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Connection Status</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={testConnection}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <Badge className={getStatusColor(connectionStatus)}>
                  {getStatusIcon(connectionStatus)}
                  <span className="ml-1">{connectionStatus.toUpperCase()}</span>
                </Badge>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              <div className="font-medium">Current Environment:</div>
              <div className="font-mono bg-muted p-1 rounded mt-1">
                {currentEnvironment.baseUrl}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Full variant
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">API Environment</h3>
        {showStatus && (
          <div className="flex items-center gap-2">
            {getStatusIcon(connectionStatus)}
            <Badge className={getStatusColor(connectionStatus)}>
              {connectionStatus.toUpperCase()}
            </Badge>
          </div>
        )}
      </div>

      <Select 
        value={currentEnvironment.name} 
        onValueChange={(value) => {
          const env = availableEnvironments.find(e => e.name === value);
          if (env) switchEnvironment(env);
        }}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableEnvironments.map((env) => (
            <SelectItem key={env.name} value={env.name}>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <div>
                  <div>{env.displayName}</div>
                  <div className="text-xs text-muted-foreground">{env.description}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="bg-muted/50 p-3 rounded-lg text-sm">
        <div className="font-medium mb-1">Current Environment Details:</div>
        <div className="space-y-1 text-muted-foreground">
          <div><span className="font-medium">Base URL:</span> {currentEnvironment.baseUrl}</div>
          <div><span className="font-medium">Auth Type:</span> {currentEnvironment.authType}</div>
          <div><span className="font-medium">Timeout:</span> {currentEnvironment.timeout / 1000}s</div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentSwitcher;