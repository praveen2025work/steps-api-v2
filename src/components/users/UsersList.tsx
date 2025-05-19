import { useState, useEffect } from 'react';
import { User } from '@/types/user-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Search, UserPlus, Edit, Trash } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface UsersListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onCreateNew: () => void;
  onAssignApplication: (user: User) => void;
  selectedUserId?: string;
}

const UsersList = ({ users, onEdit, onDelete, onCreateNew, onAssignApplication, selectedUserId }: UsersListProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          user =>
            user.username.toLowerCase().includes(query) ||
            user.fullName.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, users]);

  const copyEmailToClipboard = (e: React.MouseEvent, email: string) => {
    e.stopPropagation(); // Prevent row click event
    navigator.clipboard.writeText(email)
      .then(() => {
        setCopiedEmail(email);
        toast({
          title: "Email Copied",
          description: "Email address copied to clipboard",
        });
        setTimeout(() => setCopiedEmail(null), 2000);
      })
      .catch(err => {
        toast({
          title: "Failed to copy",
          description: "Could not copy email to clipboard",
          variant: "destructive"
        });
      });
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation(); // Prevent row click event
    action();
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow 
                  key={user.id} 
                  className={`cursor-pointer ${user.id === selectedUserId ? "bg-muted" : "hover:bg-muted/50"}`}
                  onClick={() => onEdit(user)}
                >
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "success" : "destructive"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-xs"
                      onClick={(e) => copyEmailToClipboard(e, user.email)}
                    >
                      {copiedEmail === user.email ? (
                        <Check className="h-3.5 w-3.5 mr-1 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 mr-1" />
                      )}
                      Copy Email
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => handleActionClick(e, () => onAssignApplication(user))}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => handleActionClick(e, () => onEdit(user))}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => handleActionClick(e, () => onDelete(user.id))}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UsersList;