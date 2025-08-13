import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useDate } from '@/contexts/DateContext';
import { useRoleAssignmentOptimized } from '@/hooks/useRoleAssignmentOptimized';
import { useApplicationParameters } from '@/hooks/useWorkflowService';
import { 
  Shield, 
  Users, 
  UserCheck, 
  UserX, 
  RefreshCw, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  User
} from 'lucide-react';

interface RoleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  appId: number;
  appGroupId: string;
  applicationName: string;
}

interface ConfiguredRole {
  id: string;
  name: string;
  configId: number;
  isAvailable: boolean;
}

interface UserRoleAssignment {
  username: string;
  roleId: number;
  roleName: string;
  accessId: number;
  createdBy: string;
  createdOn: string;
  isExisting: boolean;
}

const RoleManagementModal: React.FC<RoleManagementModalProps> = ({
  isOpen,
  onClose,
  appId,
  appGroupId,
  applicationName
}) => {
  const { dateString } = useDate();
  
  // Use the role assignment hook
  const { state, actions } = useRoleAssignmentOptimized({
    appId,
    appGroupId,
    enabled: isOpen
  });

  // Use application parameters hook to get WF_TG_ROLES_ALLOWED
  const {
    parameters: appParameters,
    loading: parametersLoading,
    refresh: refreshParameters
  } = useApplicationParameters(appId);
  
  // Local state
  const [configuredRoles, setConfiguredRoles] = useState<ConfiguredRole[]>([]);
  const [userRoleAssignments, setUserRoleAssignments] = useState<UserRoleAssignment[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [availableUsers] = useState<string[]>(['user123', 'user456', 'user789', 'kumarp15']); // This should come from user service

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      actions.loadRoleAssignments();
      refreshParameters();
    }
  }, [isOpen]);

  // Process WF_TG_ROLES_ALLOWED parameter and available roles
  useEffect(() => {
    if (appParameters && state.data?.availableRoles) {
      const wfTgRolesParam = appParameters.find(param => 
        param.name === 'WF_TG_ROLES_ALLOWED' && param.active === 'Y'
      );

      if (wfTgRolesParam && wfTgRolesParam.value) {
        try {
          // Parse the JSON array from the parameter value
          const allowedRoleNames: string[] = JSON.parse(wfTgRolesParam.value);
          
          // Map allowed role names to available roles from the API
          const configured = allowedRoleNames.map(roleName => {
            const availableRole = state.data.availableRoles.find(role => 
              role.configName === roleName
            );
            
            return {
              id: roleName,
              name: roleName,
              configId: availableRole ? parseInt(availableRole.configId) : 0,
              isAvailable: !!availableRole
            };
          }).filter(role => role.isAvailable); // Only include roles that exist in the system

          setConfiguredRoles(configured);
        } catch (error) {
          console.error('Error parsing WF_TG_ROLES_ALLOWED parameter:', error);
          setConfiguredRoles([]);
        }
      } else {
        // If no WF_TG_ROLES_ALLOWED parameter, show all available roles
        const allRoles = state.data.availableRoles.map(role => ({
          id: role.configName,
          name: role.configName,
          configId: parseInt(role.configId),
          isAvailable: true
        }));
        setConfiguredRoles(allRoles);
      }
    }
  }, [appParameters, state.data?.availableRoles]);

  // Process current assignments
  useEffect(() => {
    if (state.data?.currentAssignments && configuredRoles.length > 0) {
      const assignments = state.data.currentAssignments.map(assignment => {
        const role = configuredRoles.find(r => r.configId === assignment.roleId);
        return {
          username: assignment.username,
          roleId: assignment.roleId,
          roleName: role?.name || `Role ${assignment.roleId}`,
          accessId: assignment.accessId,
          createdBy: assignment.createdBy,
          createdOn: assignment.createdOn,
          isExisting: true
        };
      }).filter(assignment => 
        // Only show assignments for configured roles
        configuredRoles.some(role => role.configId === assignment.roleId)
      );

      setUserRoleAssignments(assignments);
    }
  }, [state.data?.currentAssignments, configuredRoles]);

  const handleRoleToggle = (roleId: number, checked: boolean) => {
    setSelectedRoles(prev => {
      if (checked) {
        return [...prev, roleId];
      } else {
        return prev.filter(id => id !== roleId);
      }
    });
  };

  const handleAssignRoles = async () => {
    if (!selectedUser || selectedRoles.length === 0) return;

    try {
      // Assign each selected role
      for (const roleId of selectedRoles) {
        await actions.assignRole(selectedUser, roleId);
      }
      
      // Clear selections
      setSelectedUser('');
      setSelectedRoles([]);
    } catch (error) {
      console.error('Error assigning roles:', error);
    }
  };

  const handleRemoveAssignment = async (username: string, roleId: number) => {
    try {
      await actions.removeRole(username, roleId);
    } catch (error) {
      console.error('Error removing role assignment:', error);
    }
  };

  const handleClose = () => {
    setSelectedUser('');
    setSelectedRoles([]);
    onClose();
  };

  // Get user's existing role assignments for the selected user
  const getUserExistingRoles = (username: string): number[] => {
    return userRoleAssignments
      .filter(assignment => assignment.username === username)
      .map(assignment => assignment.roleId);
  };

  // Check if a role can be assigned to the selected user
  const canAssignRole = (roleId: number): boolean => {
    if (!selectedUser) return false;
    
    const existingRoles = getUserExistingRoles(selectedUser);
    return !existingRoles.includes(roleId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Management - {applicationName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Error Display */}
          {state.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {(state.loading || parametersLoading) && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
              <span>Loading role configuration...</span>
            </div>
          )}

          {/* Main Content */}
          {!state.loading && !parametersLoading && (
            <ScrollArea className="h-[calc(90vh-200px)]">
              <div className="space-y-6">
                {/* Configured Roles Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Configured Workflow Roles
                      <Badge variant="outline" className="ml-2">
                        {configuredRoles.length} roles
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {configuredRoles.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No configured roles found.</p>
                          <p className="text-sm">Check WF_TG_ROLES_ALLOWED parameter in application settings.</p>
                        </div>
                      ) : (
                        configuredRoles.map((role) => (
                          <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{role.name}</p>
                              <p className="text-sm text-muted-foreground">Config ID: {role.configId}</p>
                            </div>
                            <Badge variant="outline" className="text-green-600">
                              Available
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Current User Assignments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Current User Assignments
                      <Badge variant="outline" className="ml-2">
                        {userRoleAssignments.length} assignments
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userRoleAssignments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No role assignments found.</p>
                        </div>
                      ) : (
                        userRoleAssignments.map((assignment) => (
                          <div key={`${assignment.username}-${assignment.roleId}`} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-600" />
                                <p className="font-medium">{assignment.username}</p>
                                <Badge variant="secondary">{assignment.roleName}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Assigned: {new Date(assignment.createdOn).toLocaleDateString()} by {assignment.createdBy}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveAssignment(assignment.username, assignment.roleId)}
                              className="text-red-600 hover:text-red-700"
                              disabled={state.loading}
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* New Assignment Section */}
                {configuredRoles.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        Assign New Roles
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* User Selection */}
                        <div>
                          <label className="text-sm font-medium mb-2 block">Select User</label>
                          <Select value={selectedUser} onValueChange={setSelectedUser}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a user to assign roles" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableUsers.map((user) => (
                                <SelectItem key={user} value={user}>
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    {user}
                                    {getUserExistingRoles(user).length > 0 && (
                                      <Badge variant="outline" className="text-xs">
                                        {getUserExistingRoles(user).length} roles
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Role Selection */}
                        {selectedUser && (
                          <div>
                            <label className="text-sm font-medium mb-2 block">Select Roles to Assign</label>
                            <div className="space-y-2 border rounded-lg p-3 max-h-48 overflow-y-auto">
                              {configuredRoles.map((role) => {
                                const canAssign = canAssignRole(role.configId);
                                const isExisting = !canAssign;
                                
                                return (
                                  <div key={role.configId} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`role-${role.configId}`}
                                      checked={selectedRoles.includes(role.configId)}
                                      onCheckedChange={(checked) => handleRoleToggle(role.configId, checked as boolean)}
                                      disabled={!canAssign}
                                    />
                                    <label
                                      htmlFor={`role-${role.configId}`}
                                      className={`text-sm flex-1 ${!canAssign ? 'text-muted-foreground' : ''}`}
                                    >
                                      {role.name}
                                      {isExisting && (
                                        <Badge variant="outline" className="ml-2 text-xs">
                                          Already Assigned
                                        </Badge>
                                      )}
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Assignment Button */}
                        {selectedUser && selectedRoles.length > 0 && (
                          <div className="flex justify-end">
                            <Button
                              onClick={handleAssignRoles}
                              disabled={state.loading}
                              className="flex items-center gap-2"
                            >
                              {state.loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                              Assign {selectedRoles.length} Role{selectedRoles.length > 1 ? 's' : ''}
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {applicationName} (App ID: {appId}, Group: {appGroupId}) • {dateString}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  actions.loadRoleAssignments();
                  refreshParameters();
                }}
                disabled={state.loading || parametersLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${(state.loading || parametersLoading) ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoleManagementModal;