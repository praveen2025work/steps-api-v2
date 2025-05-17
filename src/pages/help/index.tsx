import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentationBrowser from '@/components/help/DocumentationBrowser';
import FAQSection from '@/components/help/FAQSection';
import TutorialsList from '@/components/help/TutorialsList';
import SupportContact from '@/components/help/SupportContact';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function HelpAndSupport() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Help & Support</h1>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search documentation..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="documentation" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="documentation">Documentation</TabsTrigger>
              <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="contact">Contact Support</TabsTrigger>
            </TabsList>
            
            <TabsContent value="documentation" className="border rounded-md p-4">
              <DocumentationBrowser searchQuery={searchQuery} />
            </TabsContent>
            
            <TabsContent value="tutorials" className="border rounded-md p-4">
              <TutorialsList searchQuery={searchQuery} />
            </TabsContent>
            
            <TabsContent value="faq" className="border rounded-md p-4">
              <FAQSection searchQuery={searchQuery} />
            </TabsContent>
            
            <TabsContent value="contact" className="border rounded-md p-4">
              <SupportContact />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}