import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SupportDashboard } from "@/components/support/SupportDashboard";
import { SLADashboard } from "@/components/support/SLADashboard";

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <DashboardLayout title="Process Support Dashboard">
      <div className="container mx-auto py-6">

        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full md:w-auto grid-cols-2">
            <TabsTrigger value="dashboard">Issue Management</TabsTrigger>
            <TabsTrigger value="sla">SLA Tracking</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-4">
            <SupportDashboard />
          </TabsContent>
          
          <TabsContent value="sla" className="space-y-4">
            <SLADashboard />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}