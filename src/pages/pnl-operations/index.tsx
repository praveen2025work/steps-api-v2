import { useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PnLDashboard } from "@/components/pnl/PnLDashboard";
import { PnLSLADashboard } from "@/components/pnl/PnLSLADashboard";
import { PnLProcessManagement } from "@/components/pnl/PnLProcessManagement";
import { PnLAuditLog } from "@/components/pnl/PnLAuditLog";

export default function PnLOperationsPage() {
  const router = useRouter();
  const { tab = "dashboard" } = router.query;
  const [activeTab, setActiveTab] = useState(typeof tab === "string" ? tab : "dashboard");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, tab: value },
    }, undefined, { shallow: true });
  };

  return (
    <DashboardLayout title="PnL Operations Center">
      <div className="container mx-auto py-6">

        <Tabs 
          defaultValue="dashboard" 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="space-y-4"
        >
          <TabsList className="grid w-full md:w-auto grid-cols-4">
            <TabsTrigger value="dashboard">Operations Dashboard</TabsTrigger>
            <TabsTrigger value="process-management">Process Management</TabsTrigger>
            <TabsTrigger value="sla">SLA Performance</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-4">
            <PnLDashboard />
          </TabsContent>
          
          <TabsContent value="process-management" className="space-y-4">
            <PnLProcessManagement />
          </TabsContent>
          
          <TabsContent value="sla" className="space-y-4">
            <PnLSLADashboard />
          </TabsContent>
          
          <TabsContent value="audit" className="space-y-4">
            <PnLAuditLog />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}