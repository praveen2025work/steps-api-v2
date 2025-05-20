import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import UsersList from '@/components/users/UsersList';
import UserForm from '@/components/users/UserForm';
import AssignApplicationForm from '@/components/users/AssignApplicationForm';
import { User, UserFormData, UserApplication } from '@/types/user-types';
import { generateMockUsers, createUser, updateUser, getAvailableApplications } from '@/data/usersData';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const UsersPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
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
    setIsCreatingUser(false);
    setSelectedUser(null);
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

  // Start creating a new user
  const startCreateUser = () => {
    setSelectedUser(null);
    setIsCreatingUser(true);
  };

  // Start editing an existing user
  const startEditUser = (user: User) => {
    setSelectedUser(user);
    setIsCreatingUser(false);
  };
  
  // Cancel editing or creating
  const cancelEditCreate = () => {
    setSelectedUser(null);
    setIsCreatingUser(false);
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
    <DashboardLayout title="User Management">
      <div className="container mx-auto py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side - Users list */}
          <div className="w-full lg:w-1/2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>Manage system users and their application access</CardDescription>
                  </div>
                  <Button onClick={startCreateUser}>
                    <UserPlus className="mr-2 h-4 w-4" /> Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-250px)]">
                  <UsersList
                    users={users}
                    onEdit={startEditUser}
                    onDelete={openDeleteDialog}
                    onCreateNew={startCreateUser}
                    onAssignApplication={openAssignApplicationForm}
                    selectedUserId={selectedUser?.id}
                  />
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          
          {/* Right side - User form */}
          <div className="w-full lg:w-1/2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {selectedUser 
                        ? `Edit User: ${selectedUser.username}` 
                        : isCreatingUser 
                          ? 'Create New User' 
                          : 'User Details'}
                    </CardTitle>
                    <CardDescription>
                      {selectedUser 
                        ? 'Update user information and application access' 
                        : isCreatingUser 
                          ? 'Fill in the details to create a new user' 
                          : 'Select a user to edit or create a new one'}
                    </CardDescription>
                  </div>
                  {(selectedUser || isCreatingUser) && (
                    <Button variant="ghost" size="icon" onClick={cancelEditCreate}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-250px)]">
                  {(selectedUser || isCreatingUser) ? (
                    <UserForm
                      user={selectedUser || undefined}
                      onSave={handleFormSubmit}
                      embedded={true}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Select a user from the list or create a new one
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
        
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