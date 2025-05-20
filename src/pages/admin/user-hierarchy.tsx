import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserHierarchyManagement } from '@/components/admin/UserHierarchyManagement'

export default function UserHierarchyPage() {
  const [activeTab, setActiveTab] = useState('manage')

  return (
    <DashboardLayout title="User Hierarchy Management">
      <div className="container mx-auto py-4">
        <Tabs defaultValue="manage" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="manage">Manage Access</TabsTrigger>
            <TabsTrigger value="audit">Access Audit</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manage">
            <UserHierarchyManagement />
          </TabsContent>
          
          <TabsContent value="audit">
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Hierarchy Access Audit</h2>
              <p className="text-muted-foreground">
                View a log of all hierarchy access changes, including who made changes, when they were made, and what was changed.
              </p>
              {/* Audit log would be implemented here */}
              <div className="mt-4 p-4 bg-muted rounded-md text-center text-muted-foreground">
                Audit functionality will be implemented in a future update.
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}