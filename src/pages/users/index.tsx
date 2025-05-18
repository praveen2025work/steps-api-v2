import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import UsersList from '@/components/users/UsersList';
import UserForm from '@/components/users/UserForm';
import AssignApplicationForm from '@/components/users/AssignApplicationForm';
import { User, UserFormData, UserApplication } from '@/types/user-types';
import { generateMockUsers, createUser, updateUser } from '@/data/usersData';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const UsersPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isAssignFormOpen, setIsAssignFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Load mock users on mount
  useEffect(() => {
    const mockUsers = generateMockUsers();
    setUsers(mockUsers);
  }, []);

  // Handle creating a new user
  const handleCreateUser = (userData: UserFormData) => {
    const newUser = createUser(userData);
    setUsers(prev => [...prev, newUser]);
    setIsUserFormOpen(false);
    toast({
      title: "User Created",
      description: `User ${userData.username} has been created successfully.`,
    });
  };

  // Handle updating an existing user
  const handleUpdateUser = (userData: UserFormData) => {
    if (!selectedUser) return;
    
    const updatedUser = updateUser({
      ...selectedUser,
      ...userData
    });
    
    setUsers(prev => prev.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
    
    setIsUserFormOpen(false);
    setSelectedUser(null);
    
    toast({
      title: "User Updated",
      description: `User ${userData.username} has been updated successfully.`,
    });
  };

  // Handle deleting a user
  const handleDeleteUser = () => {
    if (!userToDelete) return;
    
    setUsers(prev => prev.filter(user => user.id !== userToDelete));
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
    
    toast({
      title: "User Deleted",
      description: "The user has been deleted successfully.",
      variant: "destructive",
    });
  };

  // Handle assigning an application to a user
  const handleAssignApplication = (userId: string, application: UserApplication) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          applications: [...user.applications, application],
          lastModifiedOn: new Date(),
          lastModifiedBy: 'current-user' // In a real app, this would be the current user's ID
        };
      }
      return user;
    }));
    
    setIsAssignFormOpen(false);
    setSelectedUser(null);
    
    toast({
      title: "Application Assigned",
      description: `Application has been assigned to the user successfully.`,
    });
  };

  // Open the user form for creating a new user
  const openCreateUserForm = () => {
    setSelectedUser(null);
    setIsUserFormOpen(true);
  };

  // Open the user form for editing an existing user
  const openEditUserForm = (user: User) => {
    setSelectedUser(user);
    setIsUserFormOpen(true);
  };

  // Open the delete confirmation dialog
  const openDeleteDialog = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  // Open the assign application form
  const openAssignApplicationForm = (user: User) => {
    setSelectedUser(user);
    setIsAssignFormOpen(true);
  };

  // Handle form submission (create or update)
  const handleFormSubmit = (userData: UserFormData) => {
    if (selectedUser) {
      handleUpdateUser(userData);
    } else {
      handleCreateUser(userData);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <UsersList
          users={users}
          onEdit={openEditUserForm}
          onDelete={openDeleteDialog}
          onCreateNew={openCreateUserForm}
          onAssignApplication={openAssignApplicationForm}
        />
        
        <UserForm
          user={selectedUser || undefined}
          isOpen={isUserFormOpen}
          onClose={() => setIsUserFormOpen(false)}
          onSave={handleFormSubmit}
        />
        
        <AssignApplicationForm
          user={selectedUser}
          isOpen={isAssignFormOpen}
          onClose={() => setIsAssignFormOpen(false)}
          onAssign={handleAssignApplication}
        />
        
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user
                and remove their data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default UsersPage;