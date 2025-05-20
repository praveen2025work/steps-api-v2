import React, { useState } from 'react';
import { 
  Workflow, 
  Link, 
  Plus, 
  Trash2, 
  Save, 
  Play, 
  RefreshCw, 
  Download, 
  Upload,
  Eye,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Settings,
  Users,
  FileText,
  BarChart,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccessToast, showInfoToast, showWarningToast } from '@/lib/toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Types for PEGA BPM integration
interface PegaConnection {
  id: string;
  name: string;
  url: string;
  username: string;
  password: string; // In a real app, this would be securely stored
  clientId?: string;
  clientSecret?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PegaCase {
  id: string;
  caseId: string;
  caseType: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date;
  data: any;
}

interface PegaProcess {
  id: string;
  name: string;
  description: string;
  caseType: string;
  connectionId: string;
  mappings: {
    inputs: PegaMapping[];
    outputs: PegaMapping[];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PegaMapping {
  id: string;
  sourceField: string;
  targetField: string;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'object';
  isRequired: boolean;
  defaultValue?: string;
}

interface PegaProcessExecution {
  id: string;
  processId: string;
  processName: string;
  caseId?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  input: any;
  output: any;
  error?: string;
}

// Sample data
const sampleConnections: PegaConnection[] = [
  {
    id: 'conn-1',
    name: 'Production PEGA',
    url: 'https://pega.example.com/prweb/api/v1',
    username: 'integration_user',
    password: '********',
    clientId: 'client_12345',
    clientSecret: '********',
    isActive: true,
    createdAt: new Date('2023-01-10'),
    updatedAt: new Date('2023-03-15')
  },
  {
    id: 'conn-2',
    name: 'UAT PEGA',
    url: 'https://uat-pega.example.com/prweb/api/v1',
    username: 'uat_integration',
    password: '********',
    isActive: true,
    createdAt: new Date('2023-02-05'),
    updatedAt: new Date('2023-02-05')
  }
];

const sampleProcesses: PegaProcess[] = [
  {
    id: 'proc-1',
    name: 'New Account Onboarding',
    description: 'Process to onboard new financial accounts',
    caseType: 'ACCT-ONBOARD',
    connectionId: 'conn-1',
    mappings: {
      inputs: [
        {
          id: 'in-1',
          sourceField: 'customer.id',
          targetField: 'CustomerID',
          dataType: 'string',
          isRequired: true
        },
        {
          id: 'in-2',
          sourceField: 'customer.name',
          targetField: 'CustomerName',
          dataType: 'string',
          isRequired: true
        },
        {
          id: 'in-3',
          sourceField: 'account.type',
          targetField: 'AccountType',
          dataType: 'string',
          isRequired: true
        },
        {
          id: 'in-4',
          sourceField: 'account.initialDeposit',
          targetField: 'InitialDeposit',
          dataType: 'number',
          isRequired: true
        }
      ],
      outputs: [
        {
          id: 'out-1',
          sourceField: 'AccountID',
          targetField: 'account.id',
          dataType: 'string',
          isRequired: true
        },
        {
          id: 'out-2',
          sourceField: 'Status',
          targetField: 'account.status',
          dataType: 'string',
          isRequired: true
        }
      ]
    },
    isActive: true,
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-04-15')
  },
  {
    id: 'proc-2',
    name: 'Trade Approval Workflow',
    description: 'Process for approving high-value trades',
    caseType: 'TRADE-APPROVAL',
    connectionId: 'conn-1',
    mappings: {
      inputs: [
        {
          id: 'in-1',
          sourceField: 'trade.id',
          targetField: 'TradeID',
          dataType: 'string',
          isRequired: true
        },
        {
          id: 'in-2',
          sourceField: 'trade.amount',
          targetField: 'TradeAmount',
          dataType: 'number',
          isRequired: true
        },
        {
          id: 'in-3',
          sourceField: 'trade.instrument',
          targetField: 'Instrument',
          dataType: 'string',
          isRequired: true
        },
        {
          id: 'in-4',
          sourceField: 'trader.id',
          targetField: 'TraderID',
          dataType: 'string',
          isRequired: true
        }
      ],
      outputs: [
        {
          id: 'out-1',
          sourceField: 'ApprovalStatus',
          targetField: 'trade.approvalStatus',
          dataType: 'string',
          isRequired: true
        },
        {
          id: 'out-2',
          sourceField: 'ApprovedBy',
          targetField: 'trade.approvedBy',
          dataType: 'string',
          isRequired: false
        },
        {
          id: 'out-3',
          sourceField: 'Comments',
          targetField: 'trade.approvalComments',
          dataType: 'string',
          isRequired: false
        }
      ]
    },
    isActive: true,
    createdAt: new Date('2023-03-05'),
    updatedAt: new Date('2023-03-05')
  }
];

const sampleCases: PegaCase[] = [
  {
    id: 'case-1',
    caseId: 'ACCT-ONBOARD-10001',
    caseType: 'ACCT-ONBOARD',
    status: 'In Progress',
    createdAt: new Date('2023-05-10T09:30:00'),
    updatedAt: new Date('2023-05-10T14:45:00'),
    assignedTo: 'John Smith',
    priority: 'high',
    dueDate: new Date('2023-05-12'),
    data: {
      customer: {
        id: 'CUST-12345',
        name: 'Acme Corporation',
        type: 'Corporate'
      },
      account: {
        type: 'Trading',
        initialDeposit: 1000000
      }
    }
  },
  {
    id: 'case-2',
    caseId: 'TRADE-APPROVAL-5432',
    caseType: 'TRADE-APPROVAL',
    status: 'Pending Approval',
    createdAt: new Date('2023-05-11T10:15:00'),
    updatedAt: new Date('2023-05-11T10:15:00'),
    assignedTo: 'Jane Doe',
    priority: 'high',
    dueDate: new Date('2023-05-11T16:00:00'),
    data: {
      trade: {
        id: 'TRD-98765',
        amount: 5000000,
        instrument: 'Corporate Bond',
        date: '2023-05-11'
      },
      trader: {
        id: 'TR-456',
        name: 'Robert Johnson'
      }
    }
  },
  {
    id: 'case-3',
    caseId: 'ACCT-ONBOARD-10002',
    caseType: 'ACCT-ONBOARD',
    status: 'Completed',
    createdAt: new Date('2023-05-09T11:00:00'),
    updatedAt: new Date('2023-05-10T09:15:00'),
    assignedTo: 'Emily Davis',
    priority: 'medium',
    data: {
      customer: {
        id: 'CUST-12346',
        name: 'Global Enterprises',
        type: 'Corporate'
      },
      account: {
        type: 'Investment',
        initialDeposit: 750000,
        id: 'ACC-87654',
        status: 'Active'
      }
    }
  }
];

const sampleExecutions: PegaProcessExecution[] = [
  {
    id: 'exec-1',
    processId: 'proc-1',
    processName: 'New Account Onboarding',
    caseId: 'ACCT-ONBOARD-10001',
    status: 'completed',
    startTime: new Date('2023-05-10T09:30:00'),
    endTime: new Date('2023-05-10T09:32:00'),
    input: {
      customer: {
        id: 'CUST-12345',
        name: 'Acme Corporation'
      },
      account: {
        type: 'Trading',
        initialDeposit: 1000000
      }
    },
    output: {
      account: {
        id: 'ACC-54321',
        status: 'Pending Verification'
      }
    }
  },
  {
    id: 'exec-2',
    processId: 'proc-2',
    processName: 'Trade Approval Workflow',
    caseId: 'TRADE-APPROVAL-5432',
    status: 'running',
    startTime: new Date('2023-05-11T10:15:00'),
    input: {
      trade: {
        id: 'TRD-98765',
        amount: 5000000,
        instrument: 'Corporate Bond'
      },
      trader: {
        id: 'TR-456'
      }
    },
    output: {}
  },
  {
    id: 'exec-3',
    processId: 'proc-1',
    processName: 'New Account Onboarding',
    caseId: 'ACCT-ONBOARD-10002',
    status: 'completed',
    startTime: new Date('2023-05-09T11:00:00'),
    endTime: new Date('2023-05-09T11:03:00'),
    input: {
      customer: {
        id: 'CUST-12346',
        name: 'Global Enterprises'
      },
      account: {
        type: 'Investment',
        initialDeposit: 750000
      }
    },
    output: {
      account: {
        id: 'ACC-87654',
        status: 'Active'
      }
    }
  },
  {
    id: 'exec-4',
    processId: 'proc-2',
    processName: 'Trade Approval Workflow',
    status: 'failed',
    startTime: new Date('2023-05-08T14:20:00'),
    endTime: new Date('2023-05-08T14:20:30'),
    input: {
      trade: {
        id: 'TRD-98764',
        amount: 3000000,
        instrument: 'Government Bond'
      },
      trader: {
        id: 'TR-789'
      }
    },
    output: {},
    error: 'Failed to connect to PEGA API: Timeout after 30 seconds'
  }
];

export const PegaBPMConnector = () => {
  const [connections, setConnections] = useState<PegaConnection[]>(sampleConnections);
  const [processes, setProcesses] = useState<PegaProcess[]>(sampleProcesses);
  const [cases, setCases] = useState<PegaCase[]>(sampleCases);
  const [executions, setExecutions] = useState<PegaProcessExecution[]>(sampleExecutions);
  
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null);
  
  const [editMode, setEditMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('connections');
  
  const [currentConnection, setCurrentConnection] = useState<Partial<PegaConnection>>({});
  const [currentProcess, setCurrentProcess] = useState<Partial<PegaProcess>>({});
  
  const [testInput, setTestInput] = useState<string>('{\n  "customer": {\n    "id": "CUST-12345",\n    "name": "Acme Corporation"\n  },\n  "account": {\n    "type": "Trading",\n    "initialDeposit": 1000000\n  }\n}');
  
  const selectedConnection = selectedConnectionId 
    ? connections.find(conn => conn.id === selectedConnectionId) 
    : null;
  
  const selectedProcess = selectedProcessId 
    ? processes.find(proc => proc.id === selectedProcessId) 
    : null;
  
  const selectedCase = selectedCaseId 
    ? cases.find(c => c.id === selectedCaseId) 
    : null;
  
  const selectedExecution = selectedExecutionId 
    ? executions.find(exec => exec.id === selectedExecutionId) 
    : null;
  
  // Connection management
  const handleSelectConnection = (connectionId: string) => {
    setSelectedConnectionId(connectionId);
    setEditMode(false);
  };
  
  const handleCreateNewConnection = () => {
    setSelectedConnectionId(null);
    setCurrentConnection({
      name: '',
      url: '',
      username: '',
      password: '',
      isActive: true
    });
    setEditMode(true);
  };
  
  const handleEditConnection = () => {
    if (selectedConnection) {
      setCurrentConnection({
        ...selectedConnection,
        password: '' // Don't show the actual password
      });
      setEditMode(true);
    }
  };
  
  const handleSaveConnection = () => {
    if (editMode && currentConnection.name && currentConnection.url && currentConnection.username) {
      if (selectedConnectionId) {
        // Update existing connection
        setConnections(prevConnections => 
          prevConnections.map(conn => 
            conn.id === selectedConnectionId 
              ? {
                  ...conn,
                  name: currentConnection.name || conn.name,
                  url: currentConnection.url || conn.url,
                  username: currentConnection.username || conn.username,
                  password: currentConnection.password || conn.password,
                  clientId: currentConnection.clientId,
                  clientSecret: currentConnection.clientSecret,
                  isActive: currentConnection.isActive !== undefined ? currentConnection.isActive : conn.isActive,
                  updatedAt: new Date()
                } 
              : conn
          )
        );
        showSuccessToast("Connection updated successfully");
      } else {
        // Create new connection
        const newConnection: PegaConnection = {
          id: `conn-${Date.now()}`,
          name: currentConnection.name || '',
          url: currentConnection.url || '',
          username: currentConnection.username || '',
          password: currentConnection.password || '',
          clientId: currentConnection.clientId,
          clientSecret: currentConnection.clientSecret,
          isActive: currentConnection.isActive !== undefined ? currentConnection.isActive : true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setConnections(prevConnections => [...prevConnections, newConnection]);
        setSelectedConnectionId(newConnection.id);
        showSuccessToast("New connection created successfully");
      }
      setEditMode(false);
    } else {
      showWarningToast("Please fill in all required fields");
    }
  };
  
  const handleDeleteConnection = () => {
    if (selectedConnectionId) {
      // Check if connection is used by any process
      const usedByProcess = processes.some(proc => proc.connectionId === selectedConnectionId);
      
      if (usedByProcess) {
        showWarningToast("Cannot delete connection that is used by processes");
        return;
      }
      
      setConnections(prevConnections => prevConnections.filter(conn => conn.id !== selectedConnectionId));
      setSelectedConnectionId(null);
      showInfoToast("Connection deleted");
    }
  };
  
  const handleTestConnection = () => {
    if (selectedConnection) {
      // Simulate connection test
      setTimeout(() => {
        showSuccessToast("Connection test successful");
      }, 1000);
    }
  };
  
  // Process management
  const handleSelectProcess = (processId: string) => {
    setSelectedProcessId(processId);
    setEditMode(false);
  };
  
  const handleCreateNewProcess = () => {
    if (connections.length === 0) {
      showWarningToast("Please create a connection first");
      return;
    }
    
    setSelectedProcessId(null);
    setCurrentProcess({
      name: '',
      description: '',
      caseType: '',
      connectionId: connections[0].id,
      mappings: {
        inputs: [],
        outputs: []
      },
      isActive: true
    });
    setEditMode(true);
  };
  
  const handleEditProcess = () => {
    if (selectedProcess) {
      setCurrentProcess(selectedProcess);
      setEditMode(true);
    }
  };
  
  const handleSaveProcess = () => {
    if (editMode && currentProcess.name && currentProcess.caseType && currentProcess.connectionId) {
      if (selectedProcessId) {
        // Update existing process
        setProcesses(prevProcesses => 
          prevProcesses.map(proc => 
            proc.id === selectedProcessId 
              ? {
                  ...proc,
                  ...currentProcess as PegaProcess,
                  updatedAt: new Date()
                } 
              : proc
          )
        );
        showSuccessToast("Process updated successfully");
      } else {
        // Create new process
        const newProcess: PegaProcess = {
          id: `proc-${Date.now()}`,
          name: currentProcess.name || '',
          description: currentProcess.description || '',
          caseType: currentProcess.caseType || '',
          connectionId: currentProcess.connectionId || '',
          mappings: currentProcess.mappings || { inputs: [], outputs: [] },
          isActive: currentProcess.isActive !== undefined ? currentProcess.isActive : true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setProcesses(prevProcesses => [...prevProcesses, newProcess]);
        setSelectedProcessId(newProcess.id);
        showSuccessToast("New process created successfully");
      }
      setEditMode(false);
    } else {
      showWarningToast("Please fill in all required fields");
    }
  };
  
  const handleDeleteProcess = () => {
    if (selectedProcessId) {
      setProcesses(prevProcesses => prevProcesses.filter(proc => proc.id !== selectedProcessId));
      setSelectedProcessId(null);
      showInfoToast("Process deleted");
    }
  };
  
  const handleAddMapping = (type: 'inputs' | 'outputs') => {
    if (editMode) {
      const newMapping: PegaMapping = {
        id: `map-${Date.now()}`,
        sourceField: '',
        targetField: '',
        dataType: 'string',
        isRequired: false
      };
      
      setCurrentProcess(prev => ({
        ...prev,
        mappings: {
          ...prev.mappings,
          [type]: [...(prev.mappings?.[type] || []), newMapping]
        }
      }));
    }
  };
  
  const handleRemoveMapping = (type: 'inputs' | 'outputs', mappingId: string) => {
    if (editMode) {
      setCurrentProcess(prev => ({
        ...prev,
        mappings: {
          ...prev.mappings,
          [type]: (prev.mappings?.[type] || []).filter(m => m.id !== mappingId)
        }
      }));
    }
  };
  
  const handleUpdateMapping = (type: 'inputs' | 'outputs', mappingId: string, field: keyof PegaMapping, value: any) => {
    if (editMode) {
      setCurrentProcess(prev => ({
        ...prev,
        mappings: {
          ...prev.mappings,
          [type]: (prev.mappings?.[type] || []).map(m => 
            m.id === mappingId ? { ...m, [field]: value } : m
          )
        }
      }));
    }
  };
  
  // Case management
  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
  };
  
  const handleRefreshCases = () => {
    // In a real app, this would fetch cases from PEGA
    showInfoToast("Cases refreshed");
  };
  
  // Execution management
  const handleSelectExecution = (executionId: string) => {
    setSelectedExecutionId(executionId);
  };
  
  const handleExecuteProcess = () => {
    if (selectedProcess) {
      try {
        // Parse the test input
        const input = JSON.parse(testInput);
        
        // Simulate process execution
        const now = new Date();
        
        // Create a new execution record
        const execution: PegaProcessExecution = {
          id: `exec-${Date.now()}`,
          processId: selectedProcess.id,
          processName: selectedProcess.name,
          status: 'running',
          startTime: now,
          input,
          output: {}
        };
        
        // Add to executions history
        setExecutions(prev => [execution, ...prev]);
        
        // Simulate completion after a delay
        setTimeout(() => {
          setExecutions(prev => 
            prev.map(exec => 
              exec.id === execution.id 
                ? {
                    ...exec,
                    status: 'completed',
                    endTime: new Date(),
                    caseId: `${selectedProcess.caseType}-${Math.floor(10000 + Math.random() * 90000)}`,
                    output: generateSampleOutput(selectedProcess, input)
                  } 
                : exec
            )
          );
          
          showSuccessToast("Process executed successfully");
        }, 2000);
        
        showInfoToast("Process execution started");
      } catch (error) {
        showWarningToast(`Error: ${error instanceof Error ? error.message : 'Invalid input'}`);
      }
    }
  };
  
  // Helper function to generate sample output based on process output mappings
  const generateSampleOutput = (process: PegaProcess, input: any) => {
    const output: any = {};
    
    process.mappings.outputs.forEach(mapping => {
      const parts = mapping.targetField.split('.');
      let current = output;
      
      // Create nested structure
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      
      // Set the value
      const lastPart = parts[parts.length - 1];
      
      if (mapping.dataType === 'string') {
        current[lastPart] = `Sample-${Math.random().toString(36).substring(2, 10)}`;
      } else if (mapping.dataType === 'number') {
        current[lastPart] = Math.floor(Math.random() * 1000);
      } else if (mapping.dataType === 'boolean') {
        current[lastPart] = Math.random() > 0.5;
      } else if (mapping.dataType === 'date') {
        current[lastPart] = new Date().toISOString();
      }
    });
    
    return output;
  };
  
  // Render mapping fields
  const renderMappingFields = (type: 'inputs' | 'outputs', mapping: PegaMapping) => {
    const sourceLabel = type === 'inputs' ? 'Source Field (STEPS)' : 'Source Field (PEGA)';
    const targetLabel = type === 'inputs' ? 'Target Field (PEGA)' : 'Target Field (STEPS)';
    
    return (
      <div key={mapping.id} className="grid grid-cols-12 gap-2 items-center mb-2">
        <div className="col-span-4">
          <Input 
            value={mapping.sourceField}
            onChange={(e) => handleUpdateMapping(type, mapping.id, 'sourceField', e.target.value)}
            placeholder={sourceLabel}
            disabled={!editMode}
          />
        </div>
        
        <div className="col-span-1 flex justify-center">
          <ArrowRight className="h-4 w-4" />
        </div>
        
        <div className="col-span-4">
          <Input 
            value={mapping.targetField}
            onChange={(e) => handleUpdateMapping(type, mapping.id, 'targetField', e.target.value)}
            placeholder={targetLabel}
            disabled={!editMode}
          />
        </div>
        
        <div className="col-span-2">
          <Select 
            value={mapping.dataType}
            onValueChange={(value: any) => handleUpdateMapping(type, mapping.id, 'dataType', value)}
            disabled={!editMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Data Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">String</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="object">Object</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {editMode && (
          <div className="col-span-1">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleRemoveMapping(type, mapping.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <Card className="flex flex-col h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-primary" />
            <CardTitle>PEGA BPM Connector</CardTitle>
            <Badge variant="outline" className="ml-2 bg-primary/10">
              <Sparkles className="h-3 w-3 mr-1" />
              Experimental
            </Badge>
          </div>
          <CardDescription>
            Connect and integrate with PEGA Business Process Management systems
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow overflow-auto p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="border-b px-4">
              <TabsList className="w-full justify-start h-12">
                <TabsTrigger value="connections" className="data-[state=active]:bg-primary/5">
                  Connections
                </TabsTrigger>
                <TabsTrigger value="processes" className="data-[state=active]:bg-primary/5">
                  Processes
                </TabsTrigger>
                <TabsTrigger value="cases" className="data-[state=active]:bg-primary/5">
                  Cases
                </TabsTrigger>
                <TabsTrigger value="executions" className="data-[state=active]:bg-primary/5">
                  Executions
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="h-[calc(100%-3rem)] overflow-auto">
              {/* Connections Tab */}
              <TabsContent value="connections" className="h-full m-0 data-[state=active]:overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 h-full">
                  {/* Connections List */}
                  <div className="border-r p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">PEGA Connections</h3>
                      <Button onClick={handleCreateNewConnection}>
                        <Plus className="h-4 w-4 mr-2" />
                        New
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {connections.map(connection => (
                        <div 
                          key={connection.id}
                          className={`border rounded-md p-3 cursor-pointer hover:bg-accent/50 ${selectedConnectionId === connection.id ? 'border-primary bg-primary/5' : ''}`}
                          onClick={() => handleSelectConnection(connection.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{connection.name}</h4>
                              <p className="text-sm text-muted-foreground truncate">{connection.url}</p>
                            </div>
                            <Badge variant={connection.isActive ? 'default' : 'outline'}>
                              {connection.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      
                      {connections.length === 0 && (
                        <div className="text-center p-4 text-muted-foreground">
                          <p>No connections configured</p>
                          <p className="text-sm">Click "New" to create a connection</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Connection Details */}
                  <div className="col-span-2 p-4">
                    {selectedConnection && !editMode ? (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">Connection Details</h3>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={handleTestConnection}>
                              Test Connection
                            </Button>
                            <Button variant="outline" onClick={handleDeleteConnection}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                            <Button onClick={handleEditConnection}>
                              Edit
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Connection Name</label>
                              <div className="mt-1 p-2 border rounded-md bg-muted/50">
                                {selectedConnection.name}
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Status</label>
                              <div className="mt-1 p-2 border rounded-md bg-muted/50">
                                {selectedConnection.isActive ? 'Active' : 'Inactive'}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">PEGA URL</label>
                            <div className="mt-1 p-2 border rounded-md bg-muted/50 font-mono text-sm">
                              {selectedConnection.url}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Username</label>
                              <div className="mt-1 p-2 border rounded-md bg-muted/50">
                                {selectedConnection.username}
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Password</label>
                              <div className="mt-1 p-2 border rounded-md bg-muted/50">
                                ••••••••
                              </div>
                            </div>
                          </div>
                          
                          {(selectedConnection.clientId || selectedConnection.clientSecret) && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Client ID</label>
                                <div className="mt-1 p-2 border rounded-md bg-muted/50">
                                  {selectedConnection.clientId || 'Not set'}
                                </div>
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium">Client Secret</label>
                                <div className="mt-1 p-2 border rounded-md bg-muted/50">
                                  {selectedConnection.clientSecret ? '••••••••' : 'Not set'}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Created</label>
                              <div className="mt-1 p-2 border rounded-md bg-muted/50">
                                {selectedConnection.createdAt.toLocaleString()}
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Last Updated</label>
                              <div className="mt-1 p-2 border rounded-md bg-muted/50">
                                {selectedConnection.updatedAt.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : editMode ? (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">
                            {selectedConnectionId ? 'Edit Connection' : 'New Connection'}
                          </h3>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setEditMode(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleSaveConnection}>
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Connection Name *</label>
                            <Input 
                              value={currentConnection.name || ''}
                              onChange={(e) => setCurrentConnection(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Production PEGA"
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">PEGA URL *</label>
                            <Input 
                              value={currentConnection.url || ''}
                              onChange={(e) => setCurrentConnection(prev => ({ ...prev, url: e.target.value }))}
                              placeholder="https://pega.example.com/prweb/api/v1"
                              className="mt-1"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Username *</label>
                              <Input 
                                value={currentConnection.username || ''}
                                onChange={(e) => setCurrentConnection(prev => ({ ...prev, username: e.target.value }))}
                                placeholder="integration_user"
                                className="mt-1"
                              />
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Password *</label>
                              <Input 
                                type="password"
                                value={currentConnection.password || ''}
                                onChange={(e) => setCurrentConnection(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="••••••••"
                                className="mt-1"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Client ID (Optional)</label>
                              <Input 
                                value={currentConnection.clientId || ''}
                                onChange={(e) => setCurrentConnection(prev => ({ ...prev, clientId: e.target.value }))}
                                placeholder="client_12345"
                                className="mt-1"
                              />
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Client Secret (Optional)</label>
                              <Input 
                                type="password"
                                value={currentConnection.clientSecret || ''}
                                onChange={(e) => setCurrentConnection(prev => ({ ...prev, clientSecret: e.target.value }))}
                                placeholder="••••••••"
                                className="mt-1"
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch 
                              checked={currentConnection.isActive !== undefined ? currentConnection.isActive : true}
                              onCheckedChange={(checked) => setCurrentConnection(prev => ({ ...prev, isActive: checked }))}
                              id="connection-active"
                            />
                            <label htmlFor="connection-active" className="text-sm font-medium">
                              Connection is active
                            </label>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                        <div>
                          <Link className="h-12 w-12 mb-2 mx-auto" />
                          <h3 className="text-lg font-medium">No Connection Selected</h3>
                          <p className="max-w-md mt-1">Select a connection from the list or create a new one to get started</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              {/* Processes Tab */}
              <TabsContent value="processes" className="h-full m-0 data-[state=active]:overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 h-full">
                  {/* Processes List */}
                  <div className="border-r p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">PEGA Processes</h3>
                      <Button onClick={handleCreateNewProcess}>
                        <Plus className="h-4 w-4 mr-2" />
                        New
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {processes.map(process => (
                        <div 
                          key={process.id}
                          className={`border rounded-md p-3 cursor-pointer hover:bg-accent/50 ${selectedProcessId === process.id ? 'border-primary bg-primary/5' : ''}`}
                          onClick={() => handleSelectProcess(process.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{process.name}</h4>
                              <p className="text-sm text-muted-foreground">{process.caseType}</p>
                            </div>
                            <Badge variant={process.isActive ? 'default' : 'outline'}>
                              {process.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 truncate">{process.description}</p>
                        </div>
                      ))}
                      
                      {processes.length === 0 && (
                        <div className="text-center p-4 text-muted-foreground">
                          <p>No processes configured</p>
                          <p className="text-sm">Click "New" to create a process</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Process Details */}
                  <div className="col-span-2 p-4">
                    {selectedProcess && !editMode ? (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">Process Details</h3>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline">
                                  <Play className="h-4 w-4 mr-2" />
                                  Execute
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>Execute Process: {selectedProcess.name}</DialogTitle>
                                  <DialogDescription>
                                    Provide input data for the process execution
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="grid gap-4 py-4">
                                  <div>
                                    <label className="text-sm font-medium">Input Data (JSON)</label>
                                    <Textarea 
                                      value={testInput}
                                      onChange={(e) => setTestInput(e.target.value)}
                                      rows={10}
                                      className="font-mono text-sm mt-1"
                                    />
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Required Input Fields</h4>
                                    <div className="text-sm">
                                      {selectedProcess.mappings.inputs.filter(m => m.isRequired).map((mapping, index) => (
                                        <div key={index} className="flex items-center gap-2 mb-1">
                                          <div className="w-1/2">{mapping.sourceField}</div>
                                          <ArrowRight className="h-3 w-3 flex-shrink-0" />
                                          <div>{mapping.targetField}</div>
                                        </div>
                                      ))}
                                      
                                      {selectedProcess.mappings.inputs.filter(m => m.isRequired).length === 0 && (
                                        <p className="text-muted-foreground">No required input fields</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <DialogFooter>
                                  <Button onClick={handleExecuteProcess}>Execute Process</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            
                            <Button variant="outline" onClick={handleDeleteProcess}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                            <Button onClick={handleEditProcess}>
                              Edit
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Process Name</label>
                              <div className="mt-1 p-2 border rounded-md bg-muted/50">
                                {selectedProcess.name}
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Case Type</label>
                              <div className="mt-1 p-2 border rounded-md bg-muted/50">
                                {selectedProcess.caseType}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Description</label>
                            <div className="mt-1 p-2 border rounded-md bg-muted/50">
                              {selectedProcess.description || 'No description provided'}
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Connection</label>
                            <div className="mt-1 p-2 border rounded-md bg-muted/50">
                              {connections.find(c => c.id === selectedProcess.connectionId)?.name || 'Unknown connection'}
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Status</label>
                            <div className="mt-1 p-2 border rounded-md bg-muted/50">
                              {selectedProcess.isActive ? 'Active' : 'Inactive'}
                            </div>
                          </div>
                          
                          <Accordion type="single" collapsible defaultValue="inputs">
                            <AccordionItem value="inputs">
                              <AccordionTrigger>
                                Input Mappings ({selectedProcess.mappings.inputs.length})
                              </AccordionTrigger>
                              <AccordionContent>
                                {selectedProcess.mappings.inputs.length > 0 ? (
                                  <div className="space-y-2">
                                    <div className="grid grid-cols-12 gap-2 text-sm font-medium">
                                      <div className="col-span-4">Source Field (STEPS)</div>
                                      <div className="col-span-1"></div>
                                      <div className="col-span-4">Target Field (PEGA)</div>
                                      <div className="col-span-2">Data Type</div>
                                      <div className="col-span-1">Required</div>
                                    </div>
                                    
                                    {selectedProcess.mappings.inputs.map((mapping, index) => (
                                      <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 border rounded-md bg-muted/20">
                                        <div className="col-span-4">{mapping.sourceField}</div>
                                        <div className="col-span-1 flex justify-center">
                                          <ArrowRight className="h-4 w-4" />
                                        </div>
                                        <div className="col-span-4">{mapping.targetField}</div>
                                        <div className="col-span-2">{mapping.dataType}</div>
                                        <div className="col-span-1 flex justify-center">
                                          {mapping.isRequired ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-muted-foreground" />}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-muted-foreground">No input mappings defined</p>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                            
                            <AccordionItem value="outputs">
                              <AccordionTrigger>
                                Output Mappings ({selectedProcess.mappings.outputs.length})
                              </AccordionTrigger>
                              <AccordionContent>
                                {selectedProcess.mappings.outputs.length > 0 ? (
                                  <div className="space-y-2">
                                    <div className="grid grid-cols-12 gap-2 text-sm font-medium">
                                      <div className="col-span-4">Source Field (PEGA)</div>
                                      <div className="col-span-1"></div>
                                      <div className="col-span-4">Target Field (STEPS)</div>
                                      <div className="col-span-2">Data Type</div>
                                      <div className="col-span-1">Required</div>
                                    </div>
                                    
                                    {selectedProcess.mappings.outputs.map((mapping, index) => (
                                      <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 border rounded-md bg-muted/20">
                                        <div className="col-span-4">{mapping.sourceField}</div>
                                        <div className="col-span-1 flex justify-center">
                                          <ArrowRight className="h-4 w-4" />
                                        </div>
                                        <div className="col-span-4">{mapping.targetField}</div>
                                        <div className="col-span-2">{mapping.dataType}</div>
                                        <div className="col-span-1 flex justify-center">
                                          {mapping.isRequired ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-muted-foreground" />}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-muted-foreground">No output mappings defined</p>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Created</label>
                              <div className="mt-1 p-2 border rounded-md bg-muted/50">
                                {selectedProcess.createdAt.toLocaleString()}
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Last Updated</label>
                              <div className="mt-1 p-2 border rounded-md bg-muted/50">
                                {selectedProcess.updatedAt.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : editMode ? (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">
                            {selectedProcessId ? 'Edit Process' : 'New Process'}
                          </h3>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setEditMode(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleSaveProcess}>
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Process Name *</label>
                            <Input 
                              value={currentProcess.name || ''}
                              onChange={(e) => setCurrentProcess(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="New Account Onboarding"
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Case Type *</label>
                            <Input 
                              value={currentProcess.caseType || ''}
                              onChange={(e) => setCurrentProcess(prev => ({ ...prev, caseType: e.target.value }))}
                              placeholder="ACCT-ONBOARD"
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Description</label>
                            <Textarea 
                              value={currentProcess.description || ''}
                              onChange={(e) => setCurrentProcess(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Process description"
                              className="mt-1"
                              rows={2}
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Connection *</label>
                            <Select 
                              value={currentProcess.connectionId || ''}
                              onValueChange={(value) => setCurrentProcess(prev => ({ ...prev, connectionId: value }))}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select connection" />
                              </SelectTrigger>
                              <SelectContent>
                                {connections.map(connection => (
                                  <SelectItem key={connection.id} value={connection.id}>
                                    {connection.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch 
                              checked={currentProcess.isActive !== undefined ? currentProcess.isActive : true}
                              onCheckedChange={(checked) => setCurrentProcess(prev => ({ ...prev, isActive: checked }))}
                              id="process-active"
                            />
                            <label htmlFor="process-active" className="text-sm font-medium">
                              Process is active
                            </label>
                          </div>
                          
                          <Tabs defaultValue="inputs" className="mt-6">
                            <TabsList>
                              <TabsTrigger value="inputs">Input Mappings</TabsTrigger>
                              <TabsTrigger value="outputs">Output Mappings</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="inputs" className="mt-4">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">Input Mappings (STEPS → PEGA)</h4>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleAddMapping('inputs')}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Mapping
                                </Button>
                              </div>
                              
                              {(currentProcess.mappings?.inputs || []).length > 0 ? (
                                <div className="space-y-2">
                                  {(currentProcess.mappings?.inputs || []).map(mapping => renderMappingFields('inputs', mapping))}
                                </div>
                              ) : (
                                <p className="text-muted-foreground">No input mappings defined. Add mappings to specify how data is passed to PEGA.</p>
                              )}
                            </TabsContent>
                            
                            <TabsContent value="outputs" className="mt-4">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">Output Mappings (PEGA → STEPS)</h4>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleAddMapping('outputs')}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Mapping
                                </Button>
                              </div>
                              
                              {(currentProcess.mappings?.outputs || []).length > 0 ? (
                                <div className="space-y-2">
                                  {(currentProcess.mappings?.outputs || []).map(mapping => renderMappingFields('outputs', mapping))}
                                </div>
                              ) : (
                                <p className="text-muted-foreground">No output mappings defined. Add mappings to specify how data is returned from PEGA.</p>
                              )}
                            </TabsContent>
                          </Tabs>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                        <div>
                          <Workflow className="h-12 w-12 mb-2 mx-auto" />
                          <h3 className="text-lg font-medium">No Process Selected</h3>
                          <p className="max-w-md mt-1">Select a process from the list or create a new one to get started</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              {/* Cases Tab */}
              <TabsContent value="cases" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">PEGA Cases</h3>
                  <Button variant="outline" onClick={handleRefreshCases}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100%-3rem)]">
                  {/* Cases List */}
                  <div className="border rounded-md overflow-hidden">
                    <div className="p-3 border-b bg-muted/30 font-medium">
                      Active Cases
                    </div>
                    <ScrollArea className="h-[calc(100%-2.5rem)]">
                      <div className="p-2 space-y-2">
                        {cases.map(caseItem => (
                          <div 
                            key={caseItem.id}
                            className={`border rounded-md p-3 cursor-pointer hover:bg-accent/50 ${selectedCaseId === caseItem.id ? 'border-primary bg-primary/5' : ''}`}
                            onClick={() => handleSelectCase(caseItem.id)}
                          >
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">{caseItem.caseId}</h4>
                              <Badge 
                                variant={
                                  caseItem.status === 'Completed' ? 'default' : 
                                  caseItem.status === 'In Progress' ? 'outline' :
                                  caseItem.status === 'Pending Approval' ? 'secondary' : 'outline'
                                }
                              >
                                {caseItem.status}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center mt-1 text-sm">
                              <span className="text-muted-foreground">{caseItem.caseType}</span>
                              <Badge variant={
                                caseItem.priority === 'high' ? 'destructive' :
                                caseItem.priority === 'medium' ? 'default' : 'outline'
                              } className="text-xs">
                                {caseItem.priority}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
                              <span>Assigned: {caseItem.assignedTo}</span>
                              <span>{caseItem.createdAt.toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                        
                        {cases.length === 0 && (
                          <div className="text-center p-4 text-muted-foreground">
                            <p>No cases found</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                  
                  {/* Case Details */}
                  <div className="col-span-2 border rounded-md overflow-hidden">
                    <div className="p-3 border-b bg-muted/30 font-medium">
                      Case Details
                    </div>
                    
                    {selectedCase ? (
                      <ScrollArea className="h-[calc(100%-2.5rem)]">
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-medium">{selectedCase.caseId}</h3>
                              <p className="text-muted-foreground">{selectedCase.caseType}</p>
                            </div>
                            <Badge 
                              variant={
                                selectedCase.status === 'Completed' ? 'default' : 
                                selectedCase.status === 'In Progress' ? 'outline' :
                                selectedCase.status === 'Pending Approval' ? 'secondary' : 'outline'
                              }
                              className="text-sm"
                            >
                              {selectedCase.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="border rounded-md p-3 bg-muted/20">
                              <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                                <Clock className="h-4 w-4 mr-1" />
                                Timeline
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm">Created:</span>
                                  <span className="text-sm">{selectedCase.createdAt.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Updated:</span>
                                  <span className="text-sm">{selectedCase.updatedAt.toLocaleString()}</span>
                                </div>
                                {selectedCase.dueDate && (
                                  <div className="flex justify-between">
                                    <span className="text-sm">Due:</span>
                                    <span className="text-sm">{selectedCase.dueDate.toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="border rounded-md p-3 bg-muted/20">
                              <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                                <Users className="h-4 w-4 mr-1" />
                                Assignment
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm">Assigned To:</span>
                                  <span className="text-sm">{selectedCase.assignedTo}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Priority:</span>
                                  <Badge variant={
                                    selectedCase.priority === 'high' ? 'destructive' :
                                    selectedCase.priority === 'medium' ? 'default' : 'outline'
                                  } className="text-xs">
                                    {selectedCase.priority}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <div className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                              <FileText className="h-4 w-4 mr-1" />
                              Case Data
                            </div>
                            <div className="border rounded-md p-3 bg-muted/20">
                              <pre className="text-xs font-mono whitespace-pre-wrap">
                                {JSON.stringify(selectedCase.data, null, 2)}
                              </pre>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                              <BarChart className="h-4 w-4 mr-1" />
                              Case History
                            </div>
                            <div className="border rounded-md overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>User</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  <TableRow>
                                    <TableCell>{selectedCase.createdAt.toLocaleString()}</TableCell>
                                    <TableCell>Case Created</TableCell>
                                    <TableCell>System</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>{new Date(selectedCase.createdAt.getTime() + 5 * 60000).toLocaleString()}</TableCell>
                                    <TableCell>Assigned to {selectedCase.assignedTo}</TableCell>
                                    <TableCell>System</TableCell>
                                  </TableRow>
                                  {selectedCase.status !== 'Completed' ? (
                                    <TableRow>
                                      <TableCell>{selectedCase.updatedAt.toLocaleString()}</TableCell>
                                      <TableCell>Status changed to {selectedCase.status}</TableCell>
                                      <TableCell>{selectedCase.assignedTo}</TableCell>
                                    </TableRow>
                                  ) : (
                                    <TableRow>
                                      <TableCell>{selectedCase.updatedAt.toLocaleString()}</TableCell>
                                      <TableCell>Case Completed</TableCell>
                                      <TableCell>{selectedCase.assignedTo}</TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="flex items-center justify-center h-[calc(100%-2.5rem)] text-center text-muted-foreground">
                        <div>
                          <FileText className="h-12 w-12 mb-2 mx-auto" />
                          <h3 className="text-lg font-medium">No Case Selected</h3>
                          <p className="max-w-md mt-1">Select a case from the list to view details</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              {/* Executions Tab */}
              <TabsContent value="executions" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Process Executions</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100%-3rem)]">
                  {/* Executions List */}
                  <div className="border rounded-md overflow-hidden">
                    <div className="p-3 border-b bg-muted/30 font-medium">
                      Recent Executions
                    </div>
                    <ScrollArea className="h-[calc(100%-2.5rem)]">
                      <div className="p-2 space-y-2">
                        {executions.map(execution => (
                          <div 
                            key={execution.id}
                            className={`border rounded-md p-3 cursor-pointer hover:bg-accent/50 ${selectedExecutionId === execution.id ? 'border-primary bg-primary/5' : ''}`}
                            onClick={() => handleSelectExecution(execution.id)}
                          >
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">{execution.processName}</h4>
                              <Badge 
                                variant={
                                  execution.status === 'completed' ? 'default' : 
                                  execution.status === 'running' ? 'secondary' :
                                  execution.status === 'failed' ? 'destructive' : 'outline'
                                }
                              >
                                {execution.status}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center mt-1 text-sm">
                              <span className="text-muted-foreground">
                                {execution.caseId || 'No case created'}
                              </span>
                              <span className="text-xs">
                                {execution.startTime.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                        
                        {executions.length === 0 && (
                          <div className="text-center p-4 text-muted-foreground">
                            <p>No executions found</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                  
                  {/* Execution Details */}
                  <div className="col-span-2 border rounded-md overflow-hidden">
                    <div className="p-3 border-b bg-muted/30 font-medium">
                      Execution Details
                    </div>
                    
                    {selectedExecution ? (
                      <ScrollArea className="h-[calc(100%-2.5rem)]">
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-medium">{selectedExecution.processName}</h3>
                              <p className="text-muted-foreground">
                                {selectedExecution.caseId ? `Case ID: ${selectedExecution.caseId}` : 'No case created'}
                              </p>
                            </div>
                            <Badge 
                              variant={
                                selectedExecution.status === 'completed' ? 'default' : 
                                selectedExecution.status === 'running' ? 'secondary' :
                                selectedExecution.status === 'failed' ? 'destructive' : 'outline'
                              }
                              className="text-sm"
                            >
                              {selectedExecution.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="border rounded-md p-3 bg-muted/20">
                              <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                                <Clock className="h-4 w-4 mr-1" />
                                Timing
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm">Started:</span>
                                  <span className="text-sm">{selectedExecution.startTime.toLocaleString()}</span>
                                </div>
                                {selectedExecution.endTime && (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-sm">Completed:</span>
                                      <span className="text-sm">{selectedExecution.endTime.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm">Duration:</span>
                                      <span className="text-sm">
                                        {Math.round((selectedExecution.endTime.getTime() - selectedExecution.startTime.getTime()) / 1000)} seconds
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <div className="border rounded-md p-3 bg-muted/20">
                              <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                                <Settings className="h-4 w-4 mr-1" />
                                Process Details
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm">Process ID:</span>
                                  <span className="text-sm">{selectedExecution.processId}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Execution ID:</span>
                                  <span className="text-sm">{selectedExecution.id}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {selectedExecution.error && (
                            <div className="mb-4">
                              <div className="flex items-center text-sm font-medium text-destructive mb-2">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                Error
                              </div>
                              <div className="border border-destructive rounded-md p-3 bg-destructive/10">
                                <p className="text-sm text-destructive">{selectedExecution.error}</p>
                              </div>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                                <ArrowRight className="h-4 w-4 mr-1" />
                                Input Data
                              </div>
                              <div className="border rounded-md p-3 bg-muted/20">
                                <pre className="text-xs font-mono whitespace-pre-wrap">
                                  {JSON.stringify(selectedExecution.input, null, 2)}
                                </pre>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Output Data
                              </div>
                              <div className="border rounded-md p-3 bg-muted/20">
                                <pre className="text-xs font-mono whitespace-pre-wrap">
                                  {Object.keys(selectedExecution.output).length > 0 
                                    ? JSON.stringify(selectedExecution.output, null, 2)
                                    : 'No output data available'}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="flex items-center justify-center h-[calc(100%-2.5rem)] text-center text-muted-foreground">
                        <div>
                          <Play className="h-12 w-12 mb-2 mx-auto" />
                          <h3 className="text-lg font-medium">No Execution Selected</h3>
                          <p className="max-w-md mt-1">Select an execution from the list to view details</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};