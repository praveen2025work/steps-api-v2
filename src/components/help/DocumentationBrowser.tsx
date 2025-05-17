import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronRight, BookOpen, FileText, Settings, Users, BarChart } from 'lucide-react';
import DocumentationContent from './DocumentationContent';
import { documentationData } from '@/data/documentationData';

interface DocumentationBrowserProps {
  searchQuery?: string;
}

export default function DocumentationBrowser({ searchQuery = '' }: DocumentationBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState('getting-started');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [filteredDocs, setFilteredDocs] = useState(documentationData);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDocs(documentationData);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = documentationData.map(category => ({
        ...category,
        documents: category.documents.filter(doc => 
          doc.title.toLowerCase().includes(query) || 
          doc.description.toLowerCase().includes(query) ||
          doc.content.toLowerCase().includes(query)
        )
      })).filter(category => category.documents.length > 0);
      
      setFilteredDocs(filtered);
      
      // If we have search results, automatically select the first document
      if (filtered.length > 0 && filtered[0].documents.length > 0) {
        setSelectedCategory(filtered[0].id);
        setSelectedDoc(filtered[0].documents[0].id);
      }
    }
  }, [searchQuery]);

  // Set initial selected document
  useEffect(() => {
    if (filteredDocs.length > 0 && !selectedDoc) {
      const category = filteredDocs.find(c => c.id === selectedCategory) || filteredDocs[0];
      if (category && category.documents.length > 0) {
        setSelectedDoc(category.documents[0].id);
      }
    }
  }, [filteredDocs, selectedCategory, selectedDoc]);

  const currentCategory = filteredDocs.find(c => c.id === selectedCategory);
  const currentDocument = currentCategory?.documents.find(d => d.id === selectedDoc);

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'getting-started': return <BookOpen className="h-4 w-4" />;
      case 'workflows': return <FileText className="h-4 w-4" />;
      case 'admin': return <Settings className="h-4 w-4" />;
      case 'user-guides': return <Users className="h-4 w-4" />;
      case 'dashboards': return <BarChart className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-250px)]">
      {/* Categories sidebar */}
      <div className="col-span-3 border-r pr-4">
        <h3 className="font-medium mb-4">Categories</h3>
        <div className="space-y-1">
          {filteredDocs.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setSelectedCategory(category.id)}
            >
              {getCategoryIcon(category.id)}
              <span className="ml-2">{category.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Document list */}
      <div className="col-span-3 border-r pr-4">
        <h3 className="font-medium mb-4">
          {currentCategory?.name || 'Documents'}
        </h3>
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-2 pr-4">
            {currentCategory?.documents.map((doc) => (
              <Button
                key={doc.id}
                variant={selectedDoc === doc.id ? "secondary" : "ghost"}
                className="w-full justify-start text-left"
                onClick={() => setSelectedDoc(doc.id)}
              >
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{doc.title}</span>
                </div>
              </Button>
            ))}
            {currentCategory?.documents.length === 0 && (
              <p className="text-muted-foreground text-sm p-2">No documents found</p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Document content */}
      <div className="col-span-6">
        {currentDocument ? (
          <DocumentationContent document={currentDocument} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Select a document to view</p>
          </div>
        )}
      </div>
    </div>
  );
}