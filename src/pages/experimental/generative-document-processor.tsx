import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { GenerativeAIDocumentProcessor } from '@/components/experimental/GenerativeAIDocumentProcessor';

const GenerativeDocumentProcessorPage = () => {
  return (
    <DashboardLayout title="Generative AI Document Processor">
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Generative AI Document Processor</h1>
        <p className="text-muted-foreground mb-6">
          Leverage advanced AI to automatically extract, summarize, and classify financial documents, 
          reducing manual processing time and improving data accuracy.
        </p>
        
        <div className="space-y-8">
          <GenerativeAIDocumentProcessor />
          
          <div className="bg-muted p-4 rounded-lg">
            <h2 className="text-lg font-medium mb-2">About This Feature</h2>
            <p className="text-sm text-muted-foreground mb-4">
              The Generative AI Document Processor uses state-of-the-art large language models and computer vision 
              to process financial documents in various formats. It can:
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Extract structured data from invoices, statements, and reports</li>
              <li>Generate concise summaries of lengthy financial documents</li>
              <li>Classify documents by type, sensitivity, and workflow relevance</li>
              <li>Identify key financial metrics and trends across document sets</li>
              <li>Detect anomalies and inconsistencies in financial reporting</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GenerativeDocumentProcessorPage;