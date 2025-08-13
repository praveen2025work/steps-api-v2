import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useDate } from '@/contexts/DateContext';
import { useRoleAssignment } from '@/hooks/useRoleAssignment';
import { 
  ArrowLeft, 
  Shield, 
  Users, 
  UserCheck, 
  UserX, 
  RefreshCw, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Settings
} from 'lucide-react';

interface RoleAssignmentDashboardProps {
  appId: number;
  appGroupId: string;
  applicationName: string;
  onClose: () => void;
}

interface TollgateProcess {
  processId: string;
  name: string;
  status: string;
  canReopen: boolean;
  lastUpdated: string;
}

const RoleAssignmentDashboard: React.FC<RoleAssignmentDashboardProps> = ({
  appId,
  appGroupId,
  applicationName,
  onClose
}) => {
  const { dateString } = useDate();
  
  // Use the role assignment hook
  const { state, actions, computed } = useRoleAssignment({
    appId,
    appGroupId,
    enabled: true
  });
  
  // Local state for UI
  const [activeTab, setActiveTab] = useState('roles');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedTollgate, setSelectedTollgate] = useState<string>('');
  const [tollgateProcesses, setTollgateProcesses] = useState<TollgateProcess[]>([]);

  // Load tollgate processes on component mount
  useEffect(() => {
    actions.loadTollgateProcesses();
  }, [actions]);

  // Update local tollgate processes when hook data changes
  useEffect(() => {
    if (state.tollgateData?.availableProcesses) {
      setTollgateProcesses(state.tollgateData.availableProcesses);
    }
  }, [state.tollgateData]);

  const handleRoleAssignment = async (username: string, roleId: number, action: 'assign' | 'unassign') => {
    if (action === 'assign') {
      await actions.assignRole(username, roleId);
    } else {
      await actions.removeRole(username, roleId);
    }
  };

  const handleTollgateAction = async (action: 'reopen' | 'close') => {
    if (!selectedTollgate) return;
    await actions.reopenTollgate(selectedTollgate, action);
    setSelectedTollgate(''); // Clear selection after action
  };

  const renderRoleManagement = () => {
    const availableRoles = state.data?.availableRoles || [];
    const currentAssignments = state.data?.currentAssignments || [];

    return (
      <div className="space-y-6">
        {/* Available Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Available Workflow Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {availableRoles.map((role) => (
                <div key={role.configId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{role.configName}</p>
                    <p className="text-sm text-muted-foreground">Role ID: {role.configId}</p>
                  </div>
                  <Badge variant="outline">Available</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Access Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Current User Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentAssignments.map((access) => {
                const roleName = availableRoles.find(r => parseInt(r.configId) === access.roleId)?.configName || `Role ${access.roleId}`;
                
                return (
                  <div key={access.accessId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <p className="font-medium">{access.username}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{roleName}</p>
                      <p className="text-xs text-muted-foreground">
                        Assigned: {new Date(access.createdOn).toLocaleDateString()} by {access.createdBy}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRoleAssignment(access.username, access.roleId, 'unassign')}
                      className="text-red-600 hover:text-red-700"
                      disabled={state.loading}
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Unassign
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* New Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Assign New Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Username</label>
                <input
                  type="text"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Role</label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.configId} value={role.configId}>
                        {role.configName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    if (selectedUser && selectedRole) {
                      handleRoleAssignment(selectedUser, parseInt(selectedRole), 'assign');
                      setSelectedUser('');
                      setSelectedRole('');
                    }
                  }}
                  disabled={!selectedUser || !selectedRole || state.loading}
                  className="w-full"
                >
                  {state.loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserCheck className="h-4 w-4 mr-2" />}
                  Assign Role
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTollgateManagement = () => (
    <div className="space-y-6">
      {/* Available Tollgate Processes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Available Tollgate Processes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tollgateProcesses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tollgate processes found for this application and date.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={actions.loadTollgateProcesses}
                  className="mt-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            ) : (
              tollgateProcesses.map((process, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{process.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Process ID: {process.processId}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={process.status === 'COMPLETED' ? 'default' : 'secondary'}>
                        {process.status}
                      </Badge>
                      {process.canReopen && (
                        <Badge variant="outline" className="text-green-600">
                          Can Reopen
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-muted-foreground">
                    Last updated: {new Date(process.lastUpdated).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tollgate Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Tollgate Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Tollgate Process</label>
              <Select value={selectedTollgate} onValueChange={setSelectedTollgate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tollgate process" />
                </SelectTrigger>
                <SelectContent>
                  {tollgateProcesses.map((process, index) => (
                    <SelectItem key={index} value={process.processId}>
                      {process.name} - {process.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedTollgate && (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleTollgateAction('reopen')}
                  disabled={state.loading || !tollgateProcesses.find(p => p.processId === selectedTollgate)?.canReopen}
                  className="flex-1"
                >
                  {state.loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                  Reopen Tollgate
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleTollgateAction('close')}
                  disabled={state.loading}
                  className="flex-1"
                >
                  {state.loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                  Close Tollgate
                </Button>
              </div>
            )}
            
            {selectedTollgate && !tollgateProcesses.find(p => p.processId === selectedTollgate)?.canReopen && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This tollgate process cannot be reopened. Please check the process status and permissions.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Button>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Role Assignment Dashboard
            </h2>
            <p className="text-sm text-muted-foreground">
              {applicationName} (App ID: {appId}, Group: {appGroupId}) • {dateString}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => {
          actions.loadRoleAssignments();
          actions.loadTollgateProcesses();
        }} disabled={state.loading}>
          {state.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {/* Error Display */}
      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Role Management
          </TabsTrigger>
          <TabsTrigger value="tollgate" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Tollgate Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="mt-6">
          <ScrollArea className="h-[calc(100vh-300px)]">
            {renderRoleManagement()}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="tollgate" className="mt-6">
          <ScrollArea className="h-[calc(100vh-300px)]">
            {renderTollgateManagement()}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoleAssignmentDashboard;