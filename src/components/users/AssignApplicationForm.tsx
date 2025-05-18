import { useState, useEffect } from 'react';
import { User, UserApplication } from '@/types/user-types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getAvailableApplications, getAccessLevels, getApplicationRoles } from '@/data/usersData';

interface AssignApplicationFormProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (userId: string, application: UserApplication) => void;
}

const AssignApplicationForm = ({ user, isOpen, onClose, onAssign }: AssignApplicationFormProps) => {
  const applications = getAvailableApplications();
  const accessLevels = getAccessLevels();
  
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<string>(accessLevels[0]);
  const [availableApps, setAvailableApps] = useState(applications);
  const [applicableRoles, setApplicableRoles] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      // Filter out applications that are already assigned to the user
      const userAppIds = user.applications.map(app => app.applicationId);
      const filteredApps = applications.filter(app => !userAppIds.includes(app.id));
      setAvailableApps(filteredApps);
      
      // Reset selection if no apps are available
      if (filteredApps.length > 0) {
        setSelectedAppId(filteredApps[0].id);
      } else {
        setSelectedAppId('');
      }
    }
  }, [user, applications]);

  // Update applicable roles when application changes
  useEffect(() => {
    if (selectedAppId) {
      const roles = getApplicationRoles(selectedAppId);
      setApplicableRoles(roles);
      if (roles.length > 0) {
        setSelectedAccessLevel(roles[0]);
      }
    }
  }, [selectedAppId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && selectedAppId) {
      const newApplication: UserApplication = {
        applicationId: selectedAppId,
        accessLevel: selectedAccessLevel,
        assignedOn: new Date()
      };
      onAssign(user.id, newApplication);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Application</DialogTitle>
          <DialogDescription>
            {user ? `Assign an application to ${user.fullName}` : 'Select an application to assign'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="application">Application</Label>
              <Select 
                value={selectedAppId} 
                onValueChange={setSelectedAppId}
                disabled={availableApps.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select application" />
                </SelectTrigger>
                <SelectContent>
                  {availableApps.map(app => (
                    <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableApps.length === 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  No available applications to assign. All applications are already assigned to this user.
                </p>
              )}
            </div>
            
            {selectedAppId && applicableRoles.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="accessLevel">Access Level</Label>
                <Select 
                  value={selectedAccessLevel} 
                  onValueChange={setSelectedAccessLevel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent>
                    {applicableRoles.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedAppId || availableApps.length === 0}>
              Assign Application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignApplicationForm;