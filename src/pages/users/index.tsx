import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import UsersList from '@/components/users/UsersList';
import UserForm from '@/components/users/UserForm';
import AssignApplicationForm from '@/components/users/AssignApplicationForm';
import { User, UserFormData, UserApplication } from '@/types/user-types';
import { generateMockUsers, createUser, updateUser, getAvailableApplications } from '@/data/usersData';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, UserPlus } from 'lucide-react';

const UsersPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isAssignFormOpen, setIsAssignFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  
  // Advanced search state
  const [searchUsername, setSearchUsername] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchApplication, setSearchApplication] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const applications = getAvailableApplications();

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

  // Handle advanced search
  const handleAdvancedSearch = () => {
    let results = [...users];
    
    if (searchUsername) {
      results = results.filter(user => 
        user.username.toLowerCase().includes(searchUsername.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchUsername.toLowerCase())
      );
    }
    
    if (searchEmail) {
      results = results.filter(user => 
        user.email.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }
    
    if (searchApplication) {
      results = results.filter(user => 
        user.applications.some(app => app.applicationId === searchApplication)
      );
    }
    
    setSearchResults(results);
  };
  
  // Reset search fields
  const resetSearch = () => {
    setSearchUsername('');
    setSearchEmail('');
    setSearchApplication('');
    setSearchResults([]);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="list">Users List</TabsTrigger>
            <TabsTrigger value="search">Advanced Search</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <UsersList
              users={users}
              onEdit={openEditUserForm}
              onDelete={openDeleteDialog}
              onCreateNew={openCreateUserForm}
              onAssignApplication={openAssignApplicationForm}
            />
          </TabsContent>
          
          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle>Advanced User Search</CardTitle>
                <CardDescription>Search for users by name, email, or application</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="username-search">Username or Full Name</label>
                      <Input
                        id="username-search"
                        placeholder="Search by name..."
                        value={searchUsername}
                        onChange={(e) => setSearchUsername(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email-search">Email</label>
                      <Input
                        id="email-search"
                        placeholder="Search by email..."
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="application-search">Application</label>
                      <Select 
                        value={searchApplication} 
                        onValueChange={setSearchApplication}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select application" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any Application</SelectItem>
                          {applications.map(app => (
                            <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={resetSearch}>
                      Reset
                    </Button>
                    <Button onClick={handleAdvancedSearch}>
                      <Search className="mr-2 h-4 w-4" /> Search
                    </Button>
                  </div>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="rounded-md border">
                    <UsersList
                      users={searchResults}
                      onEdit={openEditUserForm}
                      onDelete={openDeleteDialog}
                      onCreateNew={openCreateUserForm}
                      onAssignApplication={openAssignApplicationForm}
                    />
                  </div>
                )}
                
                {searchResults.length === 0 && searchUsername || searchEmail || searchApplication ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found matching your search criteria.
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
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