import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import RoleAssignmentDashboard from '@/components/dashboard/RoleAssignmentDashboard';
import TollgateModal from '@/components/dashboard/TollgateModal';
import { 
  Users, 
  Settings, 
  Shield,
  RefreshCw
} from 'lucide-react';

interface WorkflowRoleManagementProps {
  appId: number;
  appGroupId: string;
  applicationName: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const WorkflowRoleManagement: React.FC<WorkflowRoleManagementProps> = ({
  appId,
  appGroupId,
  applicationName,
  className = '',
  variant = 'outline',
  size = 'sm'
}) => {
  const [roleAssignmentOpen, setRoleAssignmentOpen] = useState(false);
  const [tollgateModalOpen, setTollgateModalOpen] = useState(false);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Role Assignment Button */}
      <Dialog open={roleAssignmentOpen} onOpenChange={setRoleAssignmentOpen}>
        <DialogTrigger asChild>
          <Button 
            variant={variant} 
            size={size}
            className="flex items-center gap-2"
            title="Manage Role Assignments"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Role Assignments</span>
            <span className="sm:hidden">Roles</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Assignment Management
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <RoleAssignmentDashboard
              appId={appId}
              appGroupId={appGroupId}
              applicationName={applicationName}
              onClose={() => setRoleAssignmentOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Tollgate Management Button */}
      <Button 
        variant={variant} 
        size={size}
        onClick={() => setTollgateModalOpen(true)}
        className="flex items-center gap-2"
        title="Manage Tollgate Processes"
      >
        <RefreshCw className="h-4 w-4" />
        <span className="hidden sm:inline">Reopen Tollgate</span>
        <span className="sm:hidden">Tollgate</span>
      </Button>

      {/* Tollgate Modal */}
      <TollgateModal
        isOpen={tollgateModalOpen}
        onClose={() => setTollgateModalOpen(false)}
        appId={appId}
        appGroupId={appGroupId}
        applicationName={applicationName}
      />
    </div>
  );
};

export default WorkflowRoleManagement;