import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import RoleManagementModal from '@/components/dashboard/RoleManagementModal';
import { 
  Shield
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
  const [roleManagementOpen, setRoleManagementOpen] = useState(false);

  return (
    <div className={`flex items-center ${className}`}>
      {/* Role Management Button - Icon Only */}
      <Button 
        variant={variant} 
        size="icon"
        onClick={() => setRoleManagementOpen(true)}
        className="h-7 w-7"
        title="Manage Role Assignments"
      >
        <Shield className="h-4 w-4" />
      </Button>

      {/* Role Management Modal */}
      <RoleManagementModal
        isOpen={roleManagementOpen}
        onClose={() => setRoleManagementOpen(false)}
        appId={appId}
        appGroupId={appGroupId}
        applicationName={applicationName}
      />
    </div>
  );
};

export default WorkflowRoleManagement;