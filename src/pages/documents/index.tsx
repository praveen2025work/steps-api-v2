import React from 'react';
import { NextPage } from 'next';
import DashboardLayout from '@/components/DashboardLayout';
import DocumentsGrid from '@/components/DocumentsGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for demonstration
const mockDocuments = [
  {
    id: 'doc-001',
    name: 'sod_report.xlsx',
    size: '2.4 MB',
    type: 'spreadsheet',
    status: 'uploaded',
    uploadedAt: '4/12/2025, 6:15:00 AM',
    uploadedBy: 'System',
    downloadUrl: '/api/documents/sod_report.xlsx'
  },
  {
    id: 'doc-002',
    name: 'validation.log',
    size: '150 KB',
    type: 'document',
    status: 'uploaded',
    uploadedAt: '4/12/2025, 6:15:00 AM',
    uploadedBy: 'System',
    downloadUrl: '/api/documents/validation.log'
  },
  {
    id: 'doc-003',
    name: 'corrections.xlsx',
    size: '1.2 MB',
    type: 'spreadsheet',
    status: 'downloaded',
    uploadedAt: '4/12/2025, 6:30:00 AM',
    uploadedBy: 'John Doe',
    downloadUrl: '/api/documents/corrections.xlsx'
  },
  {
    id: 'doc-004',
    name: 'final_report.pdf',
    size: '3.5 MB',
    type: 'document',
    status: 'pending',
    uploadedAt: '4/12/2025, 6:45:00 AM',
    uploadedBy: 'Jane Smith',
    downloadUrl: '/api/documents/final_report.pdf'
  }
];

const DocumentsPage: NextPage = () => {
  const handleDownload = (document: any) => {
    console.log('Downloading document:', document);
    // Implement download logic here
  };

  const handleUpload = (document: any) => {
    console.log('Uploading document:', document);
    // Implement upload logic here
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Documents</h1>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="uploaded">Uploaded</TabsTrigger>
            <TabsTrigger value="downloaded">Downloaded</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <DocumentsGrid 
              documents={mockDocuments}
              onDownload={handleDownload}
              onUpload={handleUpload}
            />
          </TabsContent>
          
          <TabsContent value="uploaded">
            <DocumentsGrid 
              documents={mockDocuments.filter(doc => doc.status === 'uploaded')}
              onDownload={handleDownload}
              onUpload={handleUpload}
            />
          </TabsContent>
          
          <TabsContent value="downloaded">
            <DocumentsGrid 
              documents={mockDocuments.filter(doc => doc.status === 'downloaded')}
              onDownload={handleDownload}
              onUpload={handleUpload}
            />
          </TabsContent>
          
          <TabsContent value="pending">
            <DocumentsGrid 
              documents={mockDocuments.filter(doc => doc.status === 'pending')}
              onDownload={handleDownload}
              onUpload={handleUpload}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DocumentsPage; 