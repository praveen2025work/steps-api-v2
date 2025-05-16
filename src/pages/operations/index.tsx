import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/DashboardLayout';
import OperationsDashboard from '@/components/operations/OperationsDashboard';
import ApplicationRegistry from '@/components/operations/ApplicationRegistry';
import TileConfiguration from '@/components/operations/TileConfiguration';
import ProcessManagement from '@/components/operations/ProcessManagement';

export default function OperationsCenter() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const { tab } = router.query;
    if (tab && typeof tab === 'string') {
      setActiveTab(tab);
    }
  }, [router.query]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, tab: value },
    }, undefined, { shallow: true });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Operations Center</h1>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="dashboard">Operations Dashboard</TabsTrigger>
            <TabsTrigger value="applications">Application Registry</TabsTrigger>
            <TabsTrigger value="tiles">Tile Configuration</TabsTrigger>
            <TabsTrigger value="processes">Process Management</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <OperationsDashboard />
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <ApplicationRegistry />
          </TabsContent>

          <TabsContent value="tiles" className="space-y-4">
            <TileConfiguration />
          </TabsContent>

          <TabsContent value="processes" className="space-y-4">
            <ProcessManagement />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}