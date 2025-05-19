import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Send, Paperclip, X, MessageSquare, Download, Eye } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

interface QueryFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  url?: string;
}

interface QueryResponse {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
  files: QueryFile[];
}

interface ProcessQuery {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  status: 'open' | 'closed' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  responses: QueryResponse[];
  files: QueryFile[];
}

interface ProcessQueriesProps {
  processId: string;
  processName: string;
}

const mockUsers = [
  { id: 'user1', name: 'John Doe', initials: 'JD', role: 'Producer' },
  { id: 'user2', name: 'Jane Smith', initials: 'JS', role: 'Approver' },
  { id: 'user3', name: 'Mike Johnson', initials: 'MJ', role: 'Viewer' },
  { id: 'user4', name: 'Sarah Williams', initials: 'SW', role: 'Support' },
  { id: 'system', name: 'System', initials: 'SYS', role: 'System' },
];

// Mock data for queries
const mockQueries: ProcessQuery[] = [
  {
    id: 'query-001',
    title: 'Discrepancy in PnL calculation',
    content: 'I noticed a discrepancy in the PnL calculation for the EUR/USD position. The calculated value is off by approximately 10k compared to the expected value. Can someone verify the rates being used?',
    createdBy: 'user1',
    createdAt: '2025-05-18T14:30:00Z',
    status: 'open',
    priority: 'high',
    responses: [
      {
        id: 'response-001',
        content: 'I checked the rates and found that we\'re using yesterday\'s closing rate instead of today\'s opening rate. This is causing the discrepancy. I\'ll update the configuration.',
        createdBy: 'user2',
        createdAt: '2025-05-18T15:45:00Z',
        files: [],
      },
      {
        id: 'response-002',
        content: 'I\'ve attached the correct rates file. Please use this for recalculation.',
        createdBy: 'user2',
        createdAt: '2025-05-18T16:20:00Z',
        files: [
          {
            id: 'file-001',
            name: 'correct_rates.xlsx',
            size: '245 KB',
            type: 'excel',
            uploadedBy: 'user2',
            uploadedAt: '2025-05-18T16:20:00Z',
          },
        ],
      },
    ],
    files: [
      {
        id: 'file-002',
        name: 'pnl_calculation.xlsx',
        size: '1.2 MB',
        type: 'excel',
        uploadedBy: 'user1',
        uploadedAt: '2025-05-18T14:30:00Z',
      },
    ],
  },
  {
    id: 'query-002',
    title: 'Missing trade data for Asian markets',
    content: 'The Asian market trades are not showing up in the report. Is there an issue with the data feed?',
    createdBy: 'user3',
    createdAt: '2025-05-17T09:15:00Z',
    status: 'resolved',
    priority: 'medium',
    responses: [
      {
        id: 'response-003',
        content: 'There was a delay in the data feed from Tokyo. The issue has been resolved and the data should be available now.',
        createdBy: 'user4',
        createdAt: '2025-05-17T10:30:00Z',
        files: [],
      },
      {
        id: 'response-004',
        content: 'Confirmed. I can see the data now. Thanks for the quick resolution.',
        createdBy: 'user3',
        createdAt: '2025-05-17T11:00:00Z',
        files: [],
      },
    ],
    files: [],
  },
];

const ProcessQueries: React.FC<ProcessQueriesProps> = ({ processId, processName }) => {
  const [queries, setQueries] = useState<ProcessQuery[]>(mockQueries);
  const [newQueryTitle, setNewQueryTitle] = useState('');
  const [newQueryContent, setNewQueryContent] = useState('');
  const [newResponseContent, setNewResponseContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [activeQueryId, setActiveQueryId] = useState<string | null>(null);
  const [isNewQueryDialogOpen, setIsNewQueryDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeQuery = queries.find(q => q.id === activeQueryId);
  
  // Filter queries based on search term
  const filteredQueries = queries.filter(query => 
    query.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    query.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateQuery = () => {
    if (!newQueryTitle.trim() || !newQueryContent.trim()) {
      showErrorToast('Please provide both a title and content for your query');
      return;
    }

    const newQuery: ProcessQuery = {
      id: `query-${Date.now()}`,
      title: newQueryTitle,
      content: newQueryContent,
      createdBy: 'user1', // Assuming current user is user1
      createdAt: new Date().toISOString(),
      status: 'open',
      priority: 'medium',
      responses: [],
      files: selectedFiles.map((file, index) => ({
        id: `file-new-${index}`,
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        type: file.type.split('/')[1] || 'unknown',
        uploadedBy: 'user1', // Assuming current user is user1
        uploadedAt: new Date().toISOString(),
      })),
    };

    setQueries(prev => [newQuery, ...prev]);
    setNewQueryTitle('');
    setNewQueryContent('');
    setSelectedFiles([]);
    setIsNewQueryDialogOpen(false);
    setActiveQueryId(newQuery.id);
    showSuccessToast('Query created successfully');
  };

  const handleAddResponse = () => {
    if (!activeQueryId || !newResponseContent.trim()) {
      showErrorToast('Please provide content for your response');
      return;
    }

    const newResponse: QueryResponse = {
      id: `response-${Date.now()}`,
      content: newResponseContent,
      createdBy: 'user1', // Assuming current user is user1
      createdAt: new Date().toISOString(),
      files: selectedFiles.map((file, index) => ({
        id: `file-resp-${index}`,
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        type: file.type.split('/')[1] || 'unknown',
        uploadedBy: 'user1', // Assuming current user is user1
        uploadedAt: new Date().toISOString(),
      })),
    };

    setQueries(prev => prev.map(query => 
      query.id === activeQueryId 
        ? { ...query, responses: [...query.responses, newResponse] }
        : query
    ));

    setNewResponseContent('');
    setSelectedFiles([]);
    showSuccessToast('Response added successfully');
  };

  const handleCloseQuery = (queryId: string) => {
    setQueries(prev => prev.map(query => 
      query.id === queryId 
        ? { ...query, status: 'closed' }
        : query
    ));
    showSuccessToast('Query closed successfully');
  };

  const handleResolveQuery = (queryId: string) => {
    setQueries(prev => prev.map(query => 
      query.id === queryId 
        ? { ...query, status: 'resolved' }
        : query
    ));
    showSuccessToast('Query marked as resolved');
  };

  const getUserInfo = (userId: string) => {
    return mockUsers.find(user => user.id === userId) || { name: 'Unknown User', initials: 'UN', role: 'Unknown' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Process Queries</h2>
          <p className="text-sm text-muted-foreground">
            {processId} - {processName}
          </p>
        </div>
        <Dialog open={isNewQueryDialogOpen} onOpenChange={setIsNewQueryDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              New Query
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Query</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="query-title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="query-title"
                  placeholder="Enter query title"
                  value={newQueryTitle}
                  onChange={(e) => setNewQueryTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="query-content" className="text-sm font-medium">
                  Content
                </label>
                <Textarea
                  id="query-content"
                  placeholder="Describe your query in detail"
                  rows={5}
                  value={newQueryContent}
                  onChange={(e) => setNewQueryContent(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Attachments
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    multiple
                    className="hidden"
                    id="query-files"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="query-files"
                    className="cursor-pointer flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Paperclip className="h-4 w-4" />
                    <span>Attach Files</span>
                  </label>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024).toFixed(0)} KB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => removeSelectedFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNewQueryDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateQuery}>
                Create Query
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search queries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="flex flex-col h-full">
        {activeQuery ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveQueryId(null)}
              >
                ← Back to Queries
              </Button>
              <div className="flex gap-2">
                {activeQuery.status === 'open' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCloseQuery(activeQuery.id)}
                    >
                      Close Query
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleResolveQuery(activeQuery.id)}
                    >
                      Mark Resolved
                    </Button>
                  </>
                )}
              </div>
            </div>

            <Card className="mb-4">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{activeQuery.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(activeQuery.status)}`}>
                        {activeQuery.status}
                      </div>
                      <div className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(activeQuery.priority)}`}>
                        {activeQuery.priority} priority
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(activeQuery.createdAt)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getUserInfo(activeQuery.createdBy).initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{getUserInfo(activeQuery.createdBy).name}</span>
                      <Badge variant="outline">{getUserInfo(activeQuery.createdBy).role}</Badge>
                    </div>
                    <p className="mt-2 text-sm whitespace-pre-wrap">{activeQuery.content}</p>
                    
                    {activeQuery.files.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Attachments</h4>
                        <div className="space-y-2">
                          {activeQuery.files.map((file) => (
                            <div key={file.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm">{file.name}</span>
                                <span className="text-xs text-muted-foreground">({file.size})</span>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4 mb-4 flex-1 overflow-y-auto">
              {activeQuery.responses.map((response) => (
                <Card key={response.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getUserInfo(response.createdBy).initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{getUserInfo(response.createdBy).name}</span>
                            <Badge variant="outline">{getUserInfo(response.createdBy).role}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(response.createdAt)}
                          </div>
                        </div>
                        <p className="mt-2 text-sm whitespace-pre-wrap">{response.content}</p>
                        
                        {response.files.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Attachments</h4>
                            <div className="space-y-2">
                              {response.files.map((file) => (
                                <div key={file.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span className="text-sm">{file.name}</span>
                                    <span className="text-xs text-muted-foreground">({file.size})</span>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {activeQuery.status === 'open' && (
              <div className="mt-auto">
                <Separator className="my-4" />
                <div className="space-y-4">
                  <Textarea
                    placeholder="Type your response..."
                    rows={3}
                    value={newResponseContent}
                    onChange={(e) => setNewResponseContent(e.target.value)}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        multiple
                        className="hidden"
                        id="response-files"
                        onChange={handleFileChange}
                      />
                      <label
                        htmlFor="response-files"
                        className="cursor-pointer flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <Paperclip className="h-4 w-4" />
                        <span>Attach Files</span>
                      </label>
                      {selectedFiles.length > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {selectedFiles.length} file(s) selected
                        </span>
                      )}
                    </div>
                    <Button onClick={handleAddResponse}>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {filteredQueries.length > 0 ? (
              <div className="space-y-4">
                {filteredQueries.map((query) => (
                  <Card 
                    key={query.id} 
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setActiveQueryId(query.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{query.title}</h3>
                            <div className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(query.status)}`}>
                              {query.status}
                            </div>
                            <div className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(query.priority)}`}>
                              {query.priority}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{query.content}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[10px]">{getUserInfo(query.createdBy).initials}</AvatarFallback>
                              </Avatar>
                              <span>{getUserInfo(query.createdBy).name}</span>
                            </div>
                            <span>{formatDate(query.createdAt)}</span>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>{query.responses.length} responses</span>
                            </div>
                            {query.files.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Paperclip className="h-3 w-3" />
                                <span>{query.files.length} files</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Queries Found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery ? 'No queries match your search criteria.' : 'There are no queries for this process yet.'}
                </p>
                <Button onClick={() => setIsNewQueryDialogOpen(true)}>
                  Create New Query
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessQueries;