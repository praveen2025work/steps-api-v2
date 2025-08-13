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

interface WorkflowRole {
  configId: string;
  configName: string;
}

interface UserAccess {
  accessId: number;
  appId: number;
  appGroupId: string;
  roleId: number;
  businessDate: string;
  username: string;
  createdBy: string;
  createdOn: string;
  updatedBy?: string;
  updatedOn?: string;
}

interface TollgateProcess {
  workflowProcessId: number;
  workflowSubstage: {
    substageId: number;
    name: string;
    defaultStage: number;
    paramMapping: string;
    attestationMapping: string;
    updatedBy: string;
    updatedOn: string;
    entitlementMapping: number;
    sendEmailAtStart: string;
    followUp: string;
  };
  workflowStage: {
    stageId: number;
    workflowApplication: { appId: number };
    name: string;
    updatedBy: string;
    updatedOn: string;
  };
  workflowApplication: { appId: number };
  status: string;
  businessDate: string;
  workflowAppConfigId: number;
  appGroupId: string;
  depSubStageSeq: number;
  auto: string;
  attest: string;
  upload: string;
  updatedBy: string;
  updatedOn: string;
  approval: string;
  isActive: string;
  adhoc: string;
  isAlteryx: string;
}

const RoleAssignmentDashboard: React.FC<RoleAssignmentDashboardProps> = ({
  appId,
  appGroupId,
  applicationName,
  onClose
}) => {
  const { selectedDate, dateString } = useDate();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('roles');
  
  // Role management state
  const [availableRoles, setAvailableRoles] = useState<WorkflowRole[]>([]);
  const [userAccesses, setUserAccesses] = useState<UserAccess[]>([]);
  const [systemEntitlements, setSystemEntitlements] = useState<Record<string, number>>({});
  const [userEntitlements, setUserEntitlements] = useState<Record<string, number>>({});
  
  // Role assignment state
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [pendingAssignments, setPendingAssignments] = useState<Array<{
    username: string;
    roleId: number;
    action: 'assign' | 'unassign';
  }>>([]);
  
  // Tollgate management state
  const [tollgateProcesses, setTollgateProcesses] = useState<TollgateProcess[]>([]);
  const [selectedTollgate, setSelectedTollgate] = useState<string>('');

  // Mock API calls - replace with actual API integration
  const fetchWorkflowRoles = async () => {
    try {
      setLoading(true);
      // Mock data based on the provided API structure
      const mockRoles: WorkflowRole[] = [
        { configId: "6", configName: "Financial Control-Permanent Approver-SME-RW" },
        { configId: "4", configName: "Financial Control-Producer-User-RW" },
        { configId: "2", configName: "Financial Control-Approver-SME-RW" },
        { configId: "3", configName: "Financial Control-Permanent Approver-SME-RW" }
      ];
      setAvailableRoles(mockRoles);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch workflow roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAccesses = async () => {
    try {
      setLoading(true);
      // Mock data based on the provided API structure
      const mockAccesses: UserAccess[] = [
        {
          accessId: 1400006,
          appId: appId,
          appGroupId: appGroupId,
          roleId: 1,
          businessDate: dateString,
          username: "user456",
          createdBy: "user456",
          createdOn: "2025-07-31 20:24:57",
          updatedBy: "user456",
          updatedOn: "2025-07-31 20:24:57"
        },
        {
          accessId: 1156773,
          appId: appId,
          appGroupId: appGroupId,
          roleId: 28,
          businessDate: dateString,
          username: "user789",
          createdBy: "SYSTEM_PROCESS",
          createdOn: "2025-05-01 01:14:42"
        }
      ];
      setUserAccesses(mockAccesses);
      
      // Mock entitlements
      setSystemEntitlements({
        "PRODUCT CONTROL-APPROVER IR-SME-RW": 29,
        "PRODUCT CONTROL-APPROVER RIS-SME-RW": 30,
        "PRODUCT CONTROL-APPROVER RNA-SME-RW": 28,
        "PRODUCT CONTROL-APPROVER-SME-RW": 2,
        "PRODUCT CONTROL-PERMANENT APPROVER-SME-RW": 3
      });
      
      setUserEntitlements({
        "PRODUCT CONTROL-PRODUCER-USER-RW": 1,
        "PRODUCT CONTROL-APPROVER-SME-RW": 2,
        "PRODUCT CONTROL-PERMANENT APPROVER-SME-RW": 3,
        "PRODUCT CONTROL-APPROVER RNA-SME-RW": 28,
        "PRODUCT CONTROL-APPROVER IR-SME-RW": 29
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user accesses');
    } finally {
      setLoading(false);
    }
  };

  const fetchTollgateProcesses = async () => {
    try {
      setLoading(true);
      // Mock data based on the provided API structure
      const mockProcess: TollgateProcess = {
        workflowProcessId: 24293160,
        workflowSubstage: {
          substageId: 2858,
          name: "TG3 - Publish Attestation (PL Executor)",
          defaultStage: 29,
          paramMapping: "70;71;69;64;1292;1011;1812;",
          attestationMapping: "128;3681;3682;",
          updatedBy: "user999",
          updatedOn: "2024-09-08 14:36:55",
          entitlementMapping: 1,
          sendEmailAtStart: "N",
          followUp: "N"
        },
        workflowStage: {
          stageId: 29,
          workflowApplication: { appId: appId },
          name: "Publish",
          updatedBy: "SYSTEM",
          updatedOn: "2020-05-15 19:36:16"
        },
        workflowApplication: { appId: appId },
        status: "COMPLETED",
        businessDate: dateString,
        workflowAppConfigId: 129526,
        appGroupId: appGroupId,
        depSubStageSeq: 82,
        auto: "N",
        attest: "Y",
        upload: "N",
        updatedBy: "SYSTEM_TOOL",
        updatedOn: "2025-08-12 19:04:31",
        approval: "Y",
        isActive: "Y",
        adhoc: "N",
        isAlteryx: "N"
      };
      setTollgateProcesses([mockProcess]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tollgate processes');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleAssignment = async (username: string, roleId: number, action: 'assign' | 'unassign') => {
    // Add to pending assignments instead of immediate API call
    setPendingAssignments(prev => [
      ...prev.filter(p => !(p.username === username && p.roleId === roleId)),
      { username, roleId, action }
    ]);
  };

  const handleSaveAssignments = async () => {
    try {
      setLoading(true);
      
      // Process all pending assignments
      for (const assignment of pendingAssignments) {
        // Mock API call structure based on provided endpoints
        const payload = {
          workflowNplAccess: {
            accessId: null,
            appId: appId,
            appGroupId: appGroupId,
            roleId: assignment.roleId,
            username: assignment.username,
            businessDate: dateString,
            updatedBy: assignment.username,
            updatedOn: null,
            createdBy: null,
            createdOn: null
          },
          systemEntitlements,
          userEntitlements
        };
        
        console.log(`${assignment.action === 'assign' ? 'Assigning' : 'Unassigning'} role ${assignment.roleId} to/from user ${assignment.username}`, payload);
        
        // Here you would make the actual API call to /api/nplaccess
        // await fetch('/api/nplaccess', { method: 'POST', body: JSON.stringify(payload) });
      }
      
      // Clear pending assignments and refresh data
      setPendingAssignments([]);
      await fetchUserAccesses();
      
    } catch (err: any) {
      setError(err.message || 'Failed to save role assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscardChanges = () => {
    setPendingAssignments([]);
  };

  const handleTollgateReopen = async () => {
    if (!selectedTollgate) return;
    
    try {
      setLoading(true);
      
      // Mock API call to reopen tollgate
      console.log(`Reopening tollgate: ${selectedTollgate} for app ${appId}, group ${appGroupId}, date ${dateString}`);
      
      // Here you would make the actual API call to the tollgate endpoint
      // await fetch(`/api/process/tollgate/${appId}/${appGroupId}/${dateString}`, { method: 'POST' });
      
      await fetchTollgateProcesses();
      
    } catch (err: any) {
      setError(err.message || 'Failed to reopen tollgate');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchWorkflowRoles();
    fetchUserAccesses();
    fetchTollgateProcesses();
  }, [appId, appGroupId, dateString]);

  const renderRoleManagement = () => (
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
            {userAccesses.map((access) => {
              const roleName = availableRoles.find(r => parseInt(r.configId) === access.roleId)?.configName || `Role ${access.roleId}`;
              const hasPendingChange = pendingAssignments.some(p => p.username === access.username && p.roleId === access.roleId);
              
              return (
                <div key={access.accessId} className={`flex items-center justify-between p-3 border rounded-lg ${hasPendingChange ? 'bg-blue-50 border-blue-200' : ''}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <p className="font-medium">{access.username}</p>
                      {hasPendingChange && <Badge variant="outline" className="text-xs">Pending Change</Badge>}
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
                disabled={!selectedUser || !selectedRole}
                className="w-full"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Assign Role
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Changes Actions */}
      {pendingAssignments.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Clock className="h-5 w-5" />
              Pending Changes ({pendingAssignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              {pendingAssignments.map((assignment, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>
                    {assignment.action === 'assign' ? 'Assign' : 'Unassign'} role {assignment.roleId} {assignment.action === 'assign' ? 'to' : 'from'} {assignment.username}
                  </span>
                  <Badge variant={assignment.action === 'assign' ? 'default' : 'destructive'}>
                    {assignment.action}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveAssignments} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleDiscardChanges}>
                <XCircle className="h-4 w-4 mr-2" />
                Discard Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderTollgateManagement = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Tollgate Processes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tollgateProcesses.map((process) => (
              <div key={process.workflowProcessId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{process.workflowSubstage.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Stage: {process.workflowStage.name} | Process ID: {process.workflowProcessId}
                    </p>
                  </div>
                  <Badge variant={process.status === 'COMPLETED' ? 'default' : 'secondary'}>
                    {process.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Auto:</span> {process.auto}
                  </div>
                  <div>
                    <span className="font-medium">Attest:</span> {process.attest}
                  </div>
                  <div>
                    <span className="font-medium">Upload:</span> {process.upload}
                  </div>
                  <div>
                    <span className="font-medium">Approval:</span> {process.approval}
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-muted-foreground">
                  Last updated: {new Date(process.updatedOn).toLocaleString()} by {process.updatedBy}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tollgate Reopen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Reopen Tollgate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Tollgate Process</label>
              <Select value={selectedTollgate} onValueChange={setSelectedTollgate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tollgate to reopen" />
                </SelectTrigger>
                <SelectContent>
                  {tollgateProcesses.map((process) => (
                    <SelectItem key={process.workflowProcessId} value={process.workflowProcessId.toString()}>
                      {process.workflowSubstage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleTollgateReopen}
                disabled={!selectedTollgate || loading}
                className="w-full"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Reopen Tollgate
              </Button>
            </div>
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
          fetchWorkflowRoles();
          fetchUserAccesses();
          fetchTollgateProcesses();
        }} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
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