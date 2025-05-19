import { useState, useEffect } from 'react';
import { User, UserApplication } from '@/types/user-types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { getAvailableApplications, getApplicationRoles } from '@/data/usersData';
import { useToast } from '@/components/ui/use-toast';

interface AssignApplicationFormProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (userId: string, application: UserApplication) => void;
}

const AssignApplicationForm = ({ user, isOpen, onClose, onAssign }: AssignApplicationFormProps) => {
  const { toast } = useToast();
  const applications = getAvailableApplications();
  
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
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
      setSelectedRoles([]);
    }
  }, [selectedAppId]);

  // This function is no longer used since we're using onCheckedChange directly
  // Keeping it commented for reference
  /*
  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role) 
        : [...prev, role]
    );
  };
  */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && selectedAppId && selectedRoles.length > 0) {
      const newApplication: UserApplication = {
        applicationId: selectedAppId,
        accessLevel: selectedRoles.join(', '),
        assignedOn: new Date()
      };
      onAssign(user.id, newApplication);
      
      // Find the application name for the toast
      const appName = applications.find(app => app.id === selectedAppId)?.name || selectedAppId;
      
      // Show toast notification
      toast({
        title: "Application Assigned",
        description: `${appName} with roles: ${selectedRoles.join(', ')}`,
      });
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
                <Label>Select Roles</Label>
                <div className="grid grid-cols-2 gap-2 border rounded-md p-3 max-h-[150px] overflow-y-auto">
                  {applicableRoles.map(role => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`assign-role-${role}`} 
                        checked={selectedRoles.includes(role)}
                        onCheckedChange={(checked) => {
                          if (checked === true) {
                            setSelectedRoles(prev => [...prev, role]);
                          } else {
                            setSelectedRoles(prev => prev.filter(r => r !== role));
                          }
                        }}
                      />
                      <Label htmlFor={`assign-role-${role}`} className="cursor-pointer text-sm">{role}</Label>
                    </div>
                  ))}
                </div>
                {selectedRoles.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Selected roles: {selectedRoles.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedAppId || availableApps.length === 0 || selectedRoles.length === 0}>
              Assign Application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignApplicationForm;