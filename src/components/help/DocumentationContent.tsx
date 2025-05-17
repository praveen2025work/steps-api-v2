import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Printer, ThumbsUp, ThumbsDown, Copy, Check } from 'lucide-react';
import { Document } from '@/types/documentation-types';

interface DocumentationContentProps {
  document: Document;
}

export default function DocumentationContent({ document }: DocumentationContentProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(document.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const provideFeedback = (type: 'helpful' | 'not-helpful') => {
    setFeedback(type);
    // In a real app, you would send this feedback to your backend
    console.log(`User found document ${document.id} ${type}`);
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-xl">{document.title}</CardTitle>
          <CardDescription>{document.description}</CardDescription>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Last updated: {document.lastUpdated}</span>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-400px)] pr-4">
            <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: document.content }} />
          </ScrollArea>
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center mt-4 pt-4 border-t">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground mr-2">Was this helpful?</span>
          <Button 
            variant={feedback === 'helpful' ? "secondary" : "outline"} 
            size="sm"
            onClick={() => provideFeedback('helpful')}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            Yes
          </Button>
          <Button 
            variant={feedback === 'not-helpful' ? "secondary" : "outline"} 
            size="sm"
            onClick={() => provideFeedback('not-helpful')}
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            No
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
        </div>
      </div>
    </div>
  );
}