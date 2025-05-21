import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, Upload, Check, AlertCircle, FileSearch, FileOutput, Sparkles } from 'lucide-react';

export function GenerativeAIDocumentProcessor() {
  const [activeTab, setActiveTab] = useState('extract');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  const handleProcess = () => {
    setProcessing(true);
    setProgress(0);
    setResult(null);
    
    // Simulate processing
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setProcessing(false);
          
          // Set demo results based on active tab
          if (activeTab === 'extract') {
            setResult(JSON.stringify({
              "client_name": "Acme Corporation",
              "invoice_number": "INV-2025-05678",
              "invoice_date": "2025-05-15",
              "due_date": "2025-06-15",
              "total_amount": "$12,450.00",
              "tax_amount": "$1,245.00",
              "line_items": [
                {"description": "Financial Workflow License", "quantity": 5, "unit_price": "$1,800.00", "amount": "$9,000.00"},
                {"description": "Implementation Services", "quantity": 1, "unit_price": "$2,205.00", "amount": "$2,205.00"}
              ]
            }, null, 2));
          } else if (activeTab === 'summarize') {
            setResult("This document is a quarterly financial report for Acme Corporation for Q1 2025. Key highlights include:\n\n- Revenue increased by 15% year-over-year to $24.5M\n- Operating margin improved to 18.2% (up from 16.5% in Q1 2024)\n- Cash flow from operations was $5.2M\n- The company launched 2 new product lines\n- Expansion into European markets is planned for Q3 2025\n\nThe report notes some supply chain challenges in Asian markets but indicates mitigation strategies are in place. Overall outlook for the fiscal year remains positive with projected annual growth of 12-15%.");
          } else if (activeTab === 'classify') {
            setResult(JSON.stringify({
              "document_type": "Financial Report",
              "confidence": 0.96,
              "categories": ["Quarterly Report", "Financial Statement", "Investor Communication"],
              "compliance_status": "Compliant with SEC regulations",
              "sensitivity_level": "Medium - Contains non-public financial projections",
              "recommended_retention": "7 years",
              "suggested_workflows": ["Quarterly Financial Review", "Investor Relations", "Regulatory Compliance"]
            }, null, 2));
          }
          
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Generative AI Document Processor</CardTitle>
              <CardDescription>Extract, summarize, and classify financial documents using AI</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-primary/10">
            <Sparkles className="h-3 w-3 mr-1" />
            Experimental
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="extract">
              <FileSearch className="h-4 w-4 mr-2" />
              Extract Data
            </TabsTrigger>
            <TabsTrigger value="summarize">
              <FileText className="h-4 w-4 mr-2" />
              Summarize
            </TabsTrigger>
            <TabsTrigger value="classify">
              <FileOutput className="h-4 w-4 mr-2" />
              Classify
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="extract" className="space-y-4 pt-4">
            <div className="text-sm text-muted-foreground">
              Upload financial documents to automatically extract structured data like invoice details, financial metrics, and transaction information.
            </div>
          </TabsContent>
          
          <TabsContent value="summarize" className="space-y-4 pt-4">
            <div className="text-sm text-muted-foreground">
              Generate concise summaries of lengthy financial reports, highlighting key metrics, trends, and important information.
            </div>
          </TabsContent>
          
          <TabsContent value="classify" className="space-y-4 pt-4">
            <div className="text-sm text-muted-foreground">
              Automatically categorize documents by type, sensitivity, and relevance to specific workflows or compliance requirements.
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-muted/30">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium mb-1">Upload document or drag and drop</p>
          <p className="text-xs text-muted-foreground mb-4">PDF, DOCX, XLSX, CSV, or image files up to 25MB</p>
          <Button size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Select File
          </Button>
        </div>
        
        {processing && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Processing document...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        {result && (
          <div className="space-y-2">
            <div className="flex items-center text-sm font-medium text-green-600">
              <Check className="h-4 w-4 mr-1" />
              Processing complete
            </div>
            <div className="bg-muted p-4 rounded-md">
              <pre className="text-xs overflow-auto whitespace-pre-wrap max-h-[300px]">
                {result}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Reset</Button>
        <Button onClick={handleProcess} disabled={processing}>
          {processing ? 'Processing...' : 'Process Document'}
        </Button>
      </CardFooter>
    </Card>
  );
}