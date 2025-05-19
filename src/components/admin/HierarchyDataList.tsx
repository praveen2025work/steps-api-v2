import { useState } from 'react';
import { HierarchyData } from '@/types/hierarchy-types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, Trash, Plus, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAvailableApplications } from '@/data/usersData';
import { getHierarchyLevels } from '@/data/hierarchyData';

interface HierarchyDataListProps {
  hierarchyData: HierarchyData[];
  onEdit: (data: HierarchyData) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
  selectedDataId?: string;
}

const HierarchyDataList = ({ 
  hierarchyData, 
  onEdit, 
  onDelete, 
  onCreateNew, 
  selectedDataId 
}: HierarchyDataListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dataToDelete, setDataToDelete] = useState<string | null>(null);
  
  const applications = getAvailableApplications();
  const hierarchyLevels = getHierarchyLevels();

  // Filter hierarchy data based on search term and filters
  const filteredData = hierarchyData.filter(data => {
    const matchesSearch = 
      data.hierarchy_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.colValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.colName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesApp = selectedApp ? data.applicationId === selectedApp : true;
    const matchesLevel = selectedLevel ? data.hierarchyLevel === selectedLevel : true;
    
    return matchesSearch && matchesApp && matchesLevel;
  });

  // Open delete confirmation dialog
  const openDeleteDialog = (id: string) => {
    setDataToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (dataToDelete) {
      onDelete(dataToDelete);
      setIsDeleteDialogOpen(false);
      setDataToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex-1 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search hierarchy data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select 
            value={selectedApp} 
            onValueChange={setSelectedApp}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Applications" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Applications</SelectItem>
              {applications.map((app, index) => (
                <SelectItem key={app.id} value={app.id || "no-app-id-" + index}>{app.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select 
            value={selectedLevel} 
            onValueChange={setSelectedLevel}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Levels</SelectItem>
              {hierarchyLevels.map((level, index) => (
                <SelectItem key={level.id} value={level.name || "no-level-name-" + index}>{level.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onCreateNew} className="ml-2">
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hierarchy ID</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Application</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((data) => (
                <TableRow 
                  key={data.id} 
                  className={selectedDataId === data.id ? 'bg-muted/50' : ''}
                >
                  <TableCell>{data.hierarchy_id}</TableCell>
                  <TableCell>{data.hierarchyLevel}</TableCell>
                  <TableCell>{data.colValue}</TableCell>
                  <TableCell>{data.colName}</TableCell>
                  <TableCell>
                    {data.parentHierarchyLevel ? (
                      <span>
                        {data.parentHierarchyLevel}: {data.parentColValue}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {applications.find(app => app.id === data.applicationId)?.name || data.applicationId}
                  </TableCell>
                  <TableCell>
                    <Badge variant={data.isActive ? "success" : "secondary"}>
                      {data.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onEdit(data)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openDeleteDialog(data.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                  No hierarchy data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the hierarchy data
              and may affect any related data or configurations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HierarchyDataList;