import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import HierarchyDataList from '@/components/admin/HierarchyDataList';
import HierarchyDataForm from '@/components/admin/HierarchyDataForm';
import { HierarchyData, HierarchyFormData } from '@/types/hierarchy-types';
import { getHierarchyData, createHierarchyData, updateHierarchyData } from '@/data/hierarchyData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const HierarchyDataManagementPage = () => {
  const { toast } = useToast();
  const [hierarchyData, setHierarchyData] = useState<HierarchyData[]>([]);
  const [selectedData, setSelectedData] = useState<HierarchyData | null>(null);
  const [isCreatingData, setIsCreatingData] = useState(false);

  // Load mock hierarchy data on mount
  useEffect(() => {
    const data = getHierarchyData();
    setHierarchyData(data);
  }, []);

  // Handle creating a new hierarchy data entry
  const handleCreateData = (formData: HierarchyFormData) => {
    const newData = createHierarchyData(formData);
    setHierarchyData(prev => [...prev, newData]);
    setIsCreatingData(false);
    setSelectedData(null);
    toast({
      title: "Hierarchy Data Created",
      description: `Hierarchy data ${formData.hierarchy_id} has been created successfully.`,
    });
  };

  // Handle updating an existing hierarchy data entry
  const handleUpdateData = (formData: HierarchyFormData) => {
    if (!selectedData) return;
    
    const updatedData = updateHierarchyData({
      ...selectedData,
      ...formData
    });
    
    setHierarchyData(prev => prev.map(data => 
      data.id === updatedData.id ? updatedData : data
    ));
    
    setSelectedData(null);
    
    toast({
      title: "Hierarchy Data Updated",
      description: `Hierarchy data ${formData.hierarchy_id} has been updated successfully.`,
    });
  };

  // Handle deleting a hierarchy data entry
  const handleDeleteData = (id: string) => {
    setHierarchyData(prev => prev.filter(data => data.id !== id));
    
    if (selectedData?.id === id) {
      setSelectedData(null);
    }
    
    toast({
      title: "Hierarchy Data Deleted",
      description: "The hierarchy data has been deleted successfully.",
      variant: "destructive",
    });
  };

  // Start creating a new hierarchy data entry
  const startCreateData = () => {
    setSelectedData(null);
    setIsCreatingData(true);
  };

  // Start editing an existing hierarchy data entry
  const startEditData = (data: HierarchyData) => {
    setSelectedData(data);
    setIsCreatingData(false);
  };
  
  // Cancel editing or creating
  const cancelEditCreate = () => {
    setSelectedData(null);
    setIsCreatingData(false);
  };

  // Handle form submission (create or update)
  const handleFormSubmit = (formData: HierarchyFormData) => {
    if (selectedData) {
      handleUpdateData(formData);
    } else {
      handleCreateData(formData);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side - Hierarchy data list */}
          <div className="w-full lg:w-2/3">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Hierarchy Data Management</CardTitle>
                    <CardDescription>Manage hierarchical data structures for applications</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-250px)]">
                  <HierarchyDataList
                    hierarchyData={hierarchyData}
                    onEdit={startEditData}
                    onDelete={handleDeleteData}
                    onCreateNew={startCreateData}
                    selectedDataId={selectedData?.id}
                  />
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          
          {/* Right side - Hierarchy data form */}
          <div className="w-full lg:w-1/3">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {selectedData 
                        ? `Edit: ${selectedData.hierarchy_id}` 
                        : isCreatingData 
                          ? 'Create New Hierarchy Data' 
                          : 'Hierarchy Data Details'}
                    </CardTitle>
                    <CardDescription>
                      {selectedData 
                        ? 'Update hierarchy data information' 
                        : isCreatingData 
                          ? 'Fill in the details to create a new hierarchy data entry' 
                          : 'Select an entry to edit or create a new one'}
                    </CardDescription>
                  </div>
                  {(selectedData || isCreatingData) && (
                    <Button variant="ghost" size="icon" onClick={cancelEditCreate}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-250px)]">
                  {(selectedData || isCreatingData) ? (
                    <HierarchyDataForm
                      hierarchyData={selectedData || undefined}
                      onSave={handleFormSubmit}
                      embedded={true}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Select a hierarchy data entry from the list or create a new one
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HierarchyDataManagementPage;