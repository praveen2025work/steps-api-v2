import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { FileManagement } from '@/components/files/FileManagement'
import DashboardLayout from '@/components/DashboardLayout'

export default function FilesPage() {
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null)

  return (
    <DashboardLayout>
      <div className="container mx-auto py-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">File Management</h1>
        </div>
        
        <FileManagement 
          selectedProcess={selectedProcess}
          onProcessSelect={setSelectedProcess}
        />
      </div>
    </DashboardLayout>
  )
}