import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Search, FileCheck, Shield, Clock, ArrowUpDown, CheckCircle2, XCircle } from 'lucide-react';

// Mock blockchain audit data
const auditRecords = [
  {
    id: 'tx_0x8a3b5c7d9e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b',
    timestamp: '2025-05-20T10:15:32Z',
    action: 'Workflow Approval',
    user: 'John Doe',
    details: 'Approved PnL workflow WF-2025-05-001',
    hash: '0x8a3b5c7d9e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b',
    status: 'verified'
  },
  {
    id: 'tx_0x7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8',
    timestamp: '2025-05-20T09:45:18Z',
    action: 'Data Modification',
    user: 'Jane Smith',
    details: 'Modified risk parameters for Rates workflow',
    hash: '0x7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8',
    status: 'verified'
  },
  {
    id: 'tx_0x6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c',
    timestamp: '2025-05-20T08:30:45Z',
    action: 'Stage Completion',
    user: 'Robert Johnson',
    details: 'Completed Data Validation stage for eRates workflow',
    hash: '0x6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c',
    status: 'verified'
  },
  {
    id: 'tx_0x5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d',
    timestamp: '2025-05-19T17:22:10Z',
    action: 'User Access Change',
    user: 'Admin System',
    details: 'Granted approval rights to Sarah Williams',
    hash: '0x5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d',
    status: 'verified'
  },
  {
    id: 'tx_0x4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e',
    timestamp: '2025-05-19T16:05:33Z',
    action: 'Configuration Change',
    user: 'System Admin',
    details: 'Updated SLA parameters for PnL workflow',
    hash: '0x4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e',
    status: 'verified'
  },
  {
    id: 'tx_0x3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f',
    timestamp: '2025-05-19T14:50:22Z',
    action: 'Workflow Creation',
    user: 'John Doe',
    details: 'Created new PnL workflow instance WF-2025-05-001',
    hash: '0x3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f',
    status: 'verified'
  },
  {
    id: 'tx_0x2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4e',
    timestamp: '2025-05-19T11:30:15Z',
    action: 'Data Export',
    user: 'Jane Smith',
    details: 'Exported final PnL data to regulatory system',
    hash: '0x2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4e',
    status: 'verified'
  },
  {
    id: 'tx_0x1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4e3f',
    timestamp: '2025-05-19T10:15:40Z',
    action: 'Exception Handling',
    user: 'Robert Johnson',
    details: 'Resolved data exception in Rates workflow',
    hash: '0x1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4e3f',
    status: 'verified'
  },
  {
    id: 'tx_0x0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4e3f2a',
    timestamp: '2025-05-18T16:45:12Z',
    action: 'Workflow Approval',
    user: 'Sarah Williams',
    details: 'Approved eRates workflow WF-2025-05-002',
    hash: '0x0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4e3f2a',
    status: 'verified'
  },
  {
    id: 'tx_0x9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4e3f2a1b',
    timestamp: '2025-05-18T15:30:55Z',
    action: 'Data Modification',
    user: 'Unknown User',
    details: 'Attempted unauthorized modification of risk parameters',
    hash: '0x9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4e3f2a1b',
    status: 'tampered'
  }
];

export const BlockchainAudit = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Filter and sort records
  const filteredRecords = auditRecords
    .filter(record => {
      const matchesSearch = 
        record.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.hash.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesAction = actionFilter === 'all' || record.action === actionFilter;
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      
      return matchesSearch && matchesAction && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const uniqueActions = Array.from(new Set(auditRecords.map(record => record.action)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            Blockchain Audit Trail
            <Badge variant="outline" className="ml-2 bg-primary/10">
              <Sparkles className="h-3 w-3 mr-1" />
              Experimental
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            Immutable, tamper-proof audit records for all workflow actions
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="audit-log">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="audit-log" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Audit Log
          </TabsTrigger>
          <TabsTrigger value="verification" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Verification Status
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="audit-log">
          <Card>
            <CardHeader>
              <CardTitle>Blockchain-Secured Audit Records</CardTitle>
              <CardDescription>
                Every action in the system is recorded with a cryptographic hash on the blockchain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search audit records..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {uniqueActions.map(action => (
                      <SelectItem key={action} value={action}>{action}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="tampered">Tampered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">
                        <Button 
                          variant="ghost" 
                          className="flex items-center gap-1 p-0 h-auto font-medium"
                          onClick={toggleSortDirection}
                        >
                          Timestamp
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="hidden md:table-cell">Details</TableHead>
                      <TableHead className="hidden lg:table-cell">Hash</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No audit records found matching your criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-mono text-xs">
                            {formatDate(record.timestamp)}
                          </TableCell>
                          <TableCell>{record.action}</TableCell>
                          <TableCell>{record.user}</TableCell>
                          <TableCell className="hidden md:table-cell">{record.details}</TableCell>
                          <TableCell className="hidden lg:table-cell font-mono text-xs truncate max-w-[150px]">
                            {record.hash}
                          </TableCell>
                          <TableCell>
                            {record.status === 'verified' ? (
                              <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 flex items-center gap-1 w-fit">
                                <CheckCircle2 className="h-3 w-3" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge className="bg-red-500/20 text-red-700 dark:text-red-400 flex items-center gap-1 w-fit">
                                <XCircle className="h-3 w-3" />
                                Tampered
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredRecords.length} of {auditRecords.length} records
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Verification</CardTitle>
              <CardDescription>
                Verify the integrity of any transaction in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">How Blockchain Verification Works</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Every action in the system generates a cryptographic hash that is stored on a private blockchain. 
                    This creates an immutable record that can be used to verify the integrity of your workflow data 
                    and detect any unauthorized changes.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-background rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-primary/20 p-2 rounded-full">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <h4 className="font-medium">Timestamping</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Each transaction is timestamped and linked to the previous transaction, 
                        creating a chronological chain that cannot be altered.
                      </p>
                    </div>
                    <div className="p-3 bg-background rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-primary/20 p-2 rounded-full">
                          <Shield className="h-4 w-4 text-primary" />
                        </div>
                        <h4 className="font-medium">Cryptographic Proof</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Advanced cryptography ensures that once a record is written, 
                        it cannot be changed without detection.
                      </p>
                    </div>
                    <div className="p-3 bg-background rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-primary/20 p-2 rounded-full">
                          <FileCheck className="h-4 w-4 text-primary" />
                        </div>
                        <h4 className="font-medium">Regulatory Compliance</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Provides indisputable evidence for regulatory audits and 
                        compliance requirements.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-4">Verify Transaction</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Transaction Hash
                      </label>
                      <Input 
                        placeholder="Enter transaction hash to verify (e.g., 0x8a3b5c7d9e1f2a3b...)" 
                        className="font-mono"
                      />
                    </div>
                    <Button className="w-full">Verify Transaction</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};