import React, { useState } from 'react';
import { 
  Boxes, 
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
  Clock,
  Code,
  Database,
  Layers,
  Zap,
  Filter,
  AlertCircle
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

// Types for Appian integration
interface AppianEnvironment {
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

interface AppianProcess {
  id: string;
  name: string;
  description: string;
  processModelId: string;
  environmentId: string;
  version: string;
  parameters: AppianParameter[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface AppianParameter {
  id: string;
  name: string;
  displayName: string;
  dataType: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'DOCUMENT' | 'CDT' | 'DICTIONARY';
  required: boolean;
  direction: 'INPUT' | 'OUTPUT' | 'BOTH';
  mapping?: string; // Field in STEPS to map to/from
  defaultValue?: string;
}

interface AppianExecution {
  id: string;
  processId: string;
  processName: string;
  processInstanceId?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  input: any;
  output: any;
  error?: string;
  executedBy: string;
}

interface AppianRecord {
  id: string;
  recordType: string;
  data: any;
  createdAt: Date;
  updatedAt: Date;
}

// Sample data
const sampleEnvironments: AppianEnvironment[] = [
  {
    id: 'env-1',
    name: 'Production Appian',
    url: 'https://appian.example.com/suite/webapi',
    username: 'api_user',
    password: '********',
    clientId: 'client_12345',
    clientSecret: '********',
    isActive: true,
    createdAt: new Date('2023-01-10'),
    updatedAt: new Date('2023-03-15')
  },
  {
    id: 'env-2',
    name: 'UAT Appian',
    url: 'https://uat-appian.example.com/suite/webapi',
    username: 'uat_api_user',
    password: '********',
    isActive: true,
    createdAt: new Date('2023-02-05'),
    updatedAt: new Date('2023-02-05')
  }
];

const sampleProcesses: AppianProcess[] = [
  {
    id: 'proc-1',
    name: 'Trade Approval Process',
    description: 'Process for approving and validating trades',
    processModelId: 'p_trade_approval',
    environmentId: 'env-1',
    version: '1.2.0',
    parameters: [
      {
        id: 'param-1',
        name: 'tradeId',
        displayName: 'Trade ID',
        dataType: 'TEXT',
        required: true,
        direction: 'INPUT',
        mapping: 'trade.id'
      },
      {
        id: 'param-2',
        name: 'tradeAmount',
        displayName: 'Trade Amount',
        dataType: 'NUMBER',
        required: true,
        direction: 'INPUT',
        mapping: 'trade.amount'
      },
      {
        id: 'param-3',
        name: 'tradeDate',
        displayName: 'Trade Date',
        dataType: 'DATE',
        required: true,
        direction: 'INPUT',
        mapping: 'trade.date'
      },
      {
        id: 'param-4',
        name: 'traderId',
        displayName: 'Trader ID',
        dataType: 'TEXT',
        required: true,
        direction: 'INPUT',
        mapping: 'trade.traderId'
      },
      {
        id: 'param-5',
        name: 'approvalStatus',
        displayName: 'Approval Status',
        dataType: 'TEXT',
        required: false,
        direction: 'OUTPUT',
        mapping: 'trade.approvalStatus'
      },
      {
        id: 'param-6',
        name: 'approvedBy',
        displayName: 'Approved By',
        dataType: 'TEXT',
        required: false,
        direction: 'OUTPUT',
        mapping: 'trade.approvedBy'
      },
      {
        id: 'param-7',
        name: 'comments',
        displayName: 'Comments',
        dataType: 'TEXT',
        required: false,
        direction: 'OUTPUT',
        mapping: 'trade.comments'
      }
    ],
    isActive: true,
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-04-15')
  },
  {
    id: 'proc-2',
    name: 'Customer Onboarding',
    description: 'Process for onboarding new customers',
    processModelId: 'p_customer_onboarding',
    environmentId: 'env-1',
    version: '2.0.1',
    parameters: [
      {
        id: 'param-1',
        name: 'customerId',
        displayName: 'Customer ID',
        dataType: 'TEXT',
        required: true,
        direction: 'INPUT',
        mapping: 'customer.id'
      },
      {
        id: 'param-2',
        name: 'customerName',
        displayName: 'Customer Name',
        dataType: 'TEXT',
        required: true,
        direction: 'INPUT',
        mapping: 'customer.name'
      },
      {
        id: 'param-3',
        name: 'customerType',
        displayName: 'Customer Type',
        dataType: 'TEXT',
        required: true,
        direction: 'INPUT',
        mapping: 'customer.type'
      },
      {
        id: 'param-4',
        name: 'riskScore',
        displayName: 'Risk Score',
        dataType: 'NUMBER',
        required: false,
        direction: 'INPUT',
        mapping: 'customer.riskScore'
      },
      {
        id: 'param-5',
        name: 'onboardingStatus',
        displayName: 'Onboarding Status',
        dataType: 'TEXT',
        required: false,
        direction: 'OUTPUT',
        mapping: 'customer.onboardingStatus'
      },
      {
        id: 'param-6',
        name: 'accountId',
        displayName: 'Account ID',
        dataType: 'TEXT',
        required: false,
        direction: 'OUTPUT',
        mapping: 'customer.accountId'
      }
    ],
    isActive: true,
    createdAt: new Date('2023-03-05'),
    updatedAt: new Date('2023-03-05')
  }
];

const sampleExecutions: AppianExecution[] = [
  {
    id: 'exec-1',
    processId: 'proc-1',
    processName: 'Trade Approval Process',
    processInstanceId: 'PI-12345',
    status: 'completed',
    startTime: new Date('2023-05-10T09:30:00'),
    endTime: new Date('2023-05-10T09:32:00'),
    input: {
      tradeId: 'TRD-98765',
      tradeAmount: 1500000,
      tradeDate: '2023-05-10',
      traderId: 'TR-456'
    },
    output: {
      approvalStatus: 'APPROVED',
      approvedBy: 'John Smith',
      comments: 'Trade approved within limits'
    },
    executedBy: 'System'
  },
  {
    id: 'exec-2',
    processId: 'proc-2',
    processName: 'Customer Onboarding',
    processInstanceId: 'PI-12346',
    status: 'running',
    startTime: new Date('2023-05-11T10:15:00'),
    input: {
      customerId: 'CUST-12345',
      customerName: 'Acme Corporation',
      customerType: 'Corporate',
      riskScore: 75
    },
    output: {},
    executedBy: 'Jane Doe'
  },
  {
    id: 'exec-3',
    processId: 'proc-1',
    processName: 'Trade Approval Process',
    processInstanceId: 'PI-12347',
    status: 'failed',
    startTime: new Date('2023-05-09T11:00:00'),
    endTime: new Date('2023-05-09T11:01:00'),
    input: {
      tradeId: 'TRD-98766',
      tradeAmount: 7500000,
      tradeDate: '2023-05-09',
      traderId: 'TR-789'
    },
    output: {},
    error: 'Trade amount exceeds approval threshold',
    executedBy: 'Robert Johnson'
  }
];

const sampleRecords: AppianRecord[] = [
  {
    id: 'rec-1',
    recordType: 'Trade',
    data: {
      id: 'TRD-98765',
      amount: 1500000,
      date: '2023-05-10',
      traderId: 'TR-456',
      status: 'Approved',
      approvedBy: 'John Smith',
      comments: 'Trade approved within limits'
    },
    createdAt: new Date('2023-05-10T09:30:00'),
    updatedAt: new Date('2023-05-10T09:32:00')
  },
  {
    id: 'rec-2',
    recordType: 'Customer',
    data: {
      id: 'CUST-12345',
      name: 'Acme Corporation',
      type: 'Corporate',
      riskScore: 75,
      status: 'Pending',
      onboardingDate: '2023-05-11'
    },
    createdAt: new Date('2023-05-11T10:15:00'),
    updatedAt: new Date('2023-05-11T10:15:00')
  },
  {
    id: 'rec-3',
    recordType: 'Trade',
    data: {
      id: 'TRD-98766',
      amount: 7500000,
      date: '2023-05-09',
      traderId: 'TR-789',
      status: 'Rejected',
      comments: 'Trade amount exceeds approval threshold'
    },
    createdAt: new Date('2023-05-09T11:00:00'),
    updatedAt: new Date('2023-05-09T11:01:00')
  }
];

export const AppianProcessIntegration = () => {
  const [environments, setEnvironments] = useState<AppianEnvironment[]>(sampleEnvironments);
  const [processes, setProcesses] = useState<AppianProcess[]>(sampleProcesses);
  const [executions, setExecutions] = useState<AppianExecution[]>(sampleExecutions);
  const [records, setRecords] = useState<AppianRecord[]>(sampleRecords);
  
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | null>(null);
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  
  const [editMode, setEditMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('environments');
  
  const [currentEnvironment, setCurrentEnvironment] = useState<Partial<AppianEnvironment>>({});
  const [currentProcess, setCurrentProcess] = useState<Partial<AppianProcess>>({});
  
  const [testInput, setTestInput] = useState<string>('{\n  "tradeId": "TRD-98765",\n  "tradeAmount": 1500000,\n  "tradeDate": "2023-05-10",\n  "traderId": "TR-456"\n}');
  
  const selectedEnvironment = selectedEnvironmentId 
    ? environments.find(env => env.id === selectedEnvironmentId) 
    : null;
  
  const selectedProcess = selectedProcessId 
    ? processes.find(proc => proc.id === selectedProcessId) 
    : null;
  
  const selectedExecution = selectedExecutionId 
    ? executions.find(exec => exec.id === selectedExecutionId) 
    : null;
  
  const selectedRecord = selectedRecordId 
    ? records.find(rec => rec.id === selectedRecordId) 
    : null;
  
  // Environment management
  const handleSelectEnvironment = (environmentId: string) => {
    setSelectedEnvironmentId(environmentId);
    setEditMode(false);
  };
  
  const handleCreateNewEnvironment = () => {
    setSelectedEnvironmentId(null);
    setCurrentEnvironment({
      name: '',
      url: '',
      username: '',
      password: '',
      isActive: true
    });
    setEditMode(true);
  };
  
  const handleEditEnvironment = () => {
    if (selectedEnvironment) {
      setCurrentEnvironment({
        ...selectedEnvironment,
        password: '' // Don't show the actual password
      });
      setEditMode(true);
    }
  };
  
  const handleSaveEnvironment = () => {
    if (editMode && currentEnvironment.name && currentEnvironment.url && currentEnvironment.username) {
      if (selectedEnvironmentId) {
        // Update existing environment
        setEnvironments(prevEnvironments => 
          prevEnvironments.map(env => 
            env.id === selectedEnvironmentId 
              ? {
                  ...env,
                  name: currentEnvironment.name || env.name,
                  url: currentEnvironment.url || env.url,
                  username: currentEnvironment.username || env.username,
                  password: currentEnvironment.password || env.password,
                  clientId: currentEnvironment.clientId,
                  clientSecret: currentEnvironment.clientSecret,
                  isActive: currentEnvironment.isActive !== undefined ? currentEnvironment.isActive : env.isActive,
                  updatedAt: new Date()
                } 
              : env
          )
        );
        showSuccessToast("Environment updated successfully");
      } else {
        // Create new environment
        const newEnvironment: AppianEnvironment = {
          id: `env-${Date.now()}`,
          name: currentEnvironment.name || '',
          url: currentEnvironment.url || '',
          username: currentEnvironment.username || '',
          password: currentEnvironment.password || '',
          clientId: currentEnvironment.clientId,
          clientSecret: currentEnvironment.clientSecret,
          isActive: currentEnvironment.isActive !== undefined ? currentEnvironment.isActive : true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setEnvironments(prevEnvironments => [...prevEnvironments, newEnvironment]);
        setSelectedEnvironmentId(newEnvironment.id);
        showSuccessToast("New environment created successfully");
      }
      setEditMode(false);
    } else {
      showWarningToast("Please fill in all required fields");
    }
  };
  
  const handleDeleteEnvironment = () => {
    if (selectedEnvironmentId) {
      // Check if environment is used by any process
      const usedByProcess = processes.some(proc => proc.environmentId === selectedEnvironmentId);
      
      if (usedByProcess) {
        showWarningToast("Cannot delete environment that is used by processes");
        return;
      }
      
      setEnvironments(prevEnvironments => prevEnvironments.filter(env => env.id !== selectedEnvironmentId));
      setSelectedEnvironmentId(null);
      showInfoToast("Environment deleted");
    }
  };
  
  const handleTestEnvironment = () => {
    if (selectedEnvironment) {
      // Simulate environment test
      setTimeout(() => {
        showSuccessToast("Environment connection test successful");
      }, 1000);
    }
  };
  
  // Process management
  const handleSelectProcess = (processId: string) => {
    setSelectedProcessId(processId);
    setEditMode(false);
  };
  
  const handleCreateNewProcess = () => {
    if (environments.length === 0) {
      showWarningToast("Please create an environment first");
      return;
    }
    
    setSelectedProcessId(null);
    setCurrentProcess({
      name: '',
      description: '',
      processModelId: '',
      environmentId: environments[0].id,
      version: '1.0.0',
      parameters: [],
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
    if (editMode && currentProcess.name && currentProcess.processModelId && currentProcess.environmentId) {
      if (selectedProcessId) {
        // Update existing process
        setProcesses(prevProcesses => 
          prevProcesses.map(proc => 
            proc.id === selectedProcessId 
              ? {
                  ...proc,
                  ...currentProcess as AppianProcess,
                  updatedAt: new Date()
                } 
              : proc
          )
        );
        showSuccessToast("Process updated successfully");
      } else {
        // Create new process
        const newProcess: AppianProcess = {
          id: `proc-${Date.now()}`,
          name: currentProcess.name || '',
          description: currentProcess.description || '',
          processModelId: currentProcess.processModelId || '',
          environmentId: currentProcess.environmentId || '',
          version: currentProcess.version || '1.0.0',
          parameters: currentProcess.parameters || [],
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
  
  const handleAddParameter = () => {
    if (editMode) {
      const newParameter: AppianParameter = {
        id: `param-${Date.now()}`,
        name: '',
        displayName: '',
        dataType: 'TEXT',
        required: false,
        direction: 'INPUT'
      };
      
      setCurrentProcess(prev => ({
        ...prev,
        parameters: [...(prev.parameters || []), newParameter]
      }));
    }
  };
  
  const handleRemoveParameter = (parameterId: string) => {
    if (editMode) {
      setCurrentProcess(prev => ({
        ...prev,
        parameters: (prev.parameters || []).filter(p => p.id !== parameterId)
      }));
    }
  };
  
  const handleUpdateParameter = (parameterId: string, field: keyof AppianParameter, value: any) => {
    if (editMode) {
      setCurrentProcess(prev => ({
        ...prev,
        parameters: (prev.parameters || []).map(p => 
          p.id === parameterId ? { ...p, [field]: value } : p
        )
      }));
    }
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
        const execution: AppianExecution = {
          id: `exec-${Date.now()}`,
          processId: selectedProcess.id,
          processName: selectedProcess.name,
          status: 'running',
          startTime: now,
          input,
          output: {},
          executedBy: 'Current User'
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
                    processInstanceId: `PI-${Math.floor(10000 + Math.random() * 90000)}`,
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
  
  // Record management
  const handleSelectRecord = (recordId: string) => {
    setSelectedRecordId(recordId);
  };
  
  const handleRefreshRecords = () => {
    // In a real app, this would fetch records from Appian
    showInfoToast("Records refreshed");
  };
  
  // Helper function to generate sample output based on process parameters
  const generateSampleOutput = (process: AppianProcess, input: any) => {
    const output: any = {};
    
    process.parameters
      .filter(param => param.direction === 'OUTPUT' || param.direction === 'BOTH')
      .forEach(param => {
        if (param.dataType === 'TEXT') {
          output[param.name] = `Sample-${Math.random().toString(36).substring(2, 10)}`;
        } else if (param.dataType === 'NUMBER') {
          output[param.name] = Math.floor(Math.random() * 1000);
        } else if (param.dataType === 'BOOLEAN') {
          output[param.name] = Math.random() > 0.5;
        } else if (param.dataType === 'DATE') {
          output[param.name] = new Date().toISOString().split('T')[0];
        }
      });
    
    return output;
  };
  
  // Render parameter fields
  const renderParameterFields = (parameter: AppianParameter) => {
    return (
      <div key={parameter.id} className="grid grid-cols-12 gap-2 items-center mb-2 p-2 border rounded-md bg-muted/20">
        <div className="col-span-3">
          <label className="text-xs font-medium">Name</label>
          <Input 
            value={parameter.name}
            onChange={(e) => handleUpdateParameter(parameter.id, 'name', e.target.value)}
            placeholder="parameterName"
            disabled={!editMode}
            className="mt-1"
          />
        </div>
        
        <div className="col-span-3">
          <label className="text-xs font-medium">Display Name</label>
          <Input 
            value={parameter.displayName}
            onChange={(e) => handleUpdateParameter(parameter.id, 'displayName', e.target.value)}
            placeholder="Parameter Name"
            disabled={!editMode}
            className="mt-1"
          />
        </div>
        
        <div className="col-span-2">
          <label className="text-xs font-medium">Data Type</label>
          <Select 
            value={parameter.dataType}
            onValueChange={(value: any) => handleUpdateParameter(parameter.id, 'dataType', value)}
            disabled={!editMode}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Data Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TEXT">Text</SelectItem>
              <SelectItem value="NUMBER">Number</SelectItem>
              <SelectItem value="BOOLEAN">Boolean</SelectItem>
              <SelectItem value="DATE">Date</SelectItem>
              <SelectItem value="DOCUMENT">Document</SelectItem>
              <SelectItem value="CDT">CDT</SelectItem>
              <SelectItem value="DICTIONARY">Dictionary</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="col-span-2">
          <label className="text-xs font-medium">Direction</label>
          <Select 
            value={parameter.direction}
            onValueChange={(value: any) => handleUpdateParameter(parameter.id, 'direction', value)}
            disabled={!editMode}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INPUT">Input</SelectItem>
              <SelectItem value="OUTPUT">Output</SelectItem>
              <SelectItem value="BOTH">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="col-span-1">
          <label className="text-xs font-medium">Required</label>
          <div className="flex justify-center mt-2">
            <Switch 
              checked={parameter.required}
              onCheckedChange={(checked) => handleUpdateParameter(parameter.id, 'required', checked)}
              disabled={!editMode}
            />
          </div>
        </div>
        
        {editMode && (
          <div className="col-span-1">
            <label className="text-xs font-medium">&nbsp;</label>
            <div className="flex justify-center mt-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleRemoveParameter(parameter.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
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
            <Boxes className="h-5 w-5 text-primary" />
            <CardTitle>Appian Process Integration</CardTitle>
            <Badge variant="outline" className="ml-2 bg-primary/10">
              <Sparkles className="h-3 w-3 mr-1" />
              Experimental
            </Badge>
          </div>
          <CardDescription>
            Connect and integrate with Appian Business Process Management platform
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow overflow-auto p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="border-b px-4">
              <TabsList className="w-full justify-start h-12">
                <TabsTrigger value="environments" className="data-[state=active]:bg-primary/5">
                  Environments
                </TabsTrigger>
                <TabsTrigger value="processes" className="data-[state=active]:bg-primary/5">
                  Processes
                </TabsTrigger>
                <TabsTrigger value="executions" className="data-[state=active]:bg-primary/5">
                  Executions
                </TabsTrigger>
                <TabsTrigger value="records" className="data-[state=active]:bg-primary/5">
                  Records
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="h-[calc(100%-3rem)] overflow-auto">
              {/* Environments Tab */}
              <TabsContent value="environments" className="h-full m-0 data-[state=active]:overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 h-full">
                  {/* Environments List */}
                  <div className="border-r p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Appian Environments</h3>
                      <Button onClick={handleCreateNewEnvironment}>
                        <Plus className="h-4 w-4 mr-2" />
                        New
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {environments.map(environment => (
                        <div 
                          key={environment.id}
                          className={`border rounded-md p-3 cursor-pointer hover:bg-accent/50 ${selectedEnvironmentId === environment.id ? 'border-primary bg-primary/5' : ''}`}
                          onClick={() => handleSelectEnvironment(environment.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{environment.name}</h4>
                              <p className="text-sm text-muted-foreground truncate">{environment.url}</p>
                            </div>
                            <Badge variant={environment.isActive ? 'default' : 'outline'}>
                              {environment.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      
                      {environments.length === 0 && (
                        <div className="text-center p-4 text-muted-foreground">
                          <p>No environments configured</p>
                          <p className="text-sm">Click "New" to create an environment</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Environment Details */}
                  <div className="col-span-2 p-4">
                    {selectedEnvironment && !editMode ? (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">Environment Details</h3>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={handleTestEnvironment}>
                              Test Connection
                            </Button>
                            <Button variant="outline" onClick={handleDeleteEnvironment}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                            <Button onClick={handleEditEnvironment}>
                              Edit
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Environment Name</label>
                              <div className="mt-1 p-2 border rounded-md bg-muted/50">
                                {selectedEnvironment.name}
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Status</label>
                              <div className="mt-1 p-2 border rounded-md bg-muted/50">
                                {selectedEnvironment.isActive ? 'Active' : 'Inactive'}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Appian URL</label>
                            <div className="mt-1 p-2 border rounded-md bg-muted/50 font-mono text-sm">
                              {selectedEnvironment.url}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Username</label>
                              <div className="mt-1 p-2 border rounded-md bg-muted/50">
                                {selectedEnvironment.username}
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Password</label>
                              <div className="mt-1 p-2 border rounded-md bg-muted/50">
                                ••••••••
                              </div>
                            </div>
                          </div>
                          
                          {(selectedEnvironment.clientId || selectedEnvironment.clientSecret) && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Client ID</label>
                                <div className="mt-1 p-2 border rounded-md bg-muted/50">
                                  {selectedEnvironment.clientId || 'Not set'}
                                </div>
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium">Client Secret</label>
                                <div className="mt-1 p-2 border rounded-md bg-muted/50">
                                  {selectedEnvironment.clientSecret ? '••••••••' : 'Not set'}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Created</label>
                              <div className="mt-1 p-2 border rounded-md bg-muted/50">
                                {selectedEnvironment.createdAt.toLocaleString()}
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Last Updated</label>
                              <div className="mt-1 p-2 border rounded-md bg-muted/50">
                                {selectedEnvironment.updatedAt.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : editMode ? (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">
                            {selectedEnvironmentId ? 'Edit Environment' : 'New Environment'}
                          </h3>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setEditMode(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleSaveEnvironment}>
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Environment Name *</label>
                            <Input 
                              value={currentEnvironment.name || ''}
                              onChange={(e) => setCurrentEnvironment(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Production Appian"
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Appian URL *</label>
                            <Input 
                              value={currentEnvironment.url || ''}
                              onChange={(e) => setCurrentEnvironment(prev => ({ ...prev, url: e.target.value }))}
                              placeholder="https://appian.example.com/suite/webapi"
                              className="mt-1"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Username *</label>
                              <Input 
                                value={currentEnvironment.username || ''}
                                onChange={(e) => setCurrentEnvironment(prev => ({ ...prev, username: e.target.value }))}
                                placeholder="api_user"
                                className="mt-1"
                              />
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Password *</label>
                              <Input 
                                type="password"
                                value={currentEnvironment.password || ''}
                                onChange={(e) => setCurrentEnvironment(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="••••••••"
                                className="mt-1"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Client ID (Optional)</label>
                              <Input 
                                value={currentEnvironment.clientId || ''}
                                onChange={(e) => setCurrentEnvironment(prev => ({ ...prev, clientId: e.target.value }))}
                                placeholder="client_12345"
                                className="mt-1"
                              />
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Client Secret (Optional)</label>
                              <Input 
                                type="password"
                                value={currentEnvironment.clientSecret || ''}
                                onChange={(e) => setCurrentEnvironment(prev => ({ ...prev, clientSecret: e.target.value }))}
                                placeholder="••••••••"
                                className="mt-1"
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch 
                              checked={currentEnvironment.isActive !== undefined ? currentEnvironment.isActive : true}
                              onCheckedChange={(checked) => setCurrentEnvironment(prev => ({ ...prev, isActive: checked }))}
                              id="environment-active"
                            />
                            <label htmlFor="environment-active" className="text-sm font-medium">
                              Environment is active
                            </label>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                        <div>
                          <Link className="h-12 w-12 mb-2 mx-auto" />
                          <h3 className="text-lg font-medium">No Environment Selected</h3>
                          <p className="max-w-md mt-1">Select an environment from the list or create a new one to get started</p>
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
                      <h3 className="text-lg font-medium">Appian Processes</h3>
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
                              <p className="text-sm text-muted-foreground">{process.processModelId}</p>
                            </div>
                            <Badge variant={process.isActive ? 'default' : 'outline'}>
                              {process.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-muted-foreground truncate">{process.description}</p>
                            <Badge variant="outline" className="text-xs">v{process.version}</Badge>
                          </div>
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
                                    <h4 className="text-sm font-medium mb-2">Required Input Parameters</h4>
                                    <div className="text-sm">
                                      {selectedProcess.parameters.filter(p => p.required && (p.direction === 'INPUT' || p.direction === 'BOTH')).map((param, index) => (
                                        <div key={index} className="flex items-center gap-2 mb-1">
                                          <div className="w-1/3">{param.name}</div>
                                          <div className="w-1/3">{param.displayName}</div>
                                          <div className="w-1/3">{param.dataType}</div>
                                        </div>
                                      ))}
                                      
                                      {selectedProcess.parameters.filter(p => p.required && (p.direction === 'INPUT' || p.direction === 'BOTH')).length === 0 && (
                                        <p className="text-muted-foreground">No required input parameters</p>
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
                              <label className="text-sm font-medium">Process Model ID</label>
                              <div className="mt-1 p-2 border rounded-md bg-muted/50 font-mono">
                                {selectedProcess.processModelId}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Description</label>
                            <div className="mt-1 p-2 border rounded-md bg-muted/50">
                              {selectedProcess.description || 'No description provided'}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="text-sm font-medium">Environment</label>
                              <div className="mt-1 p-2 border rounded-md bg-muted/50">
                                {environments.find(e => e.id === selectedProcess.environmentId)?.name || 'Unknown environment'}
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Version</label>
                              <div className="mt-1 p-2 border rounded-md bg-muted/50">
                                {selectedProcess.version}
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Status</label>
                              <div className="mt-1 p-2 border rounded-md bg-muted/50">
                                {selectedProcess.isActive ? 'Active' : 'Inactive'}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Parameters ({selectedProcess.parameters.length})</label>
                            <div className="mt-1 border rounded-md overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Display Name</TableHead>
                                    <TableHead>Data Type</TableHead>
                                    <TableHead>Direction</TableHead>
                                    <TableHead>Required</TableHead>
                                    <TableHead>Mapping</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {selectedProcess.parameters.map((param, index) => (
                                    <TableRow key={index}>
                                      <TableCell className="font-mono text-xs">{param.name}</TableCell>
                                      <TableCell>{param.displayName}</TableCell>
                                      <TableCell>{param.dataType}</TableCell>
                                      <TableCell>{param.direction}</TableCell>
                                      <TableCell>
                                        {param.required ? 
                                          <Check className="h-4 w-4 text-green-500" /> : 
                                          <X className="h-4 w-4 text-muted-foreground" />
                                        }
                                      </TableCell>
                                      <TableCell className="font-mono text-xs">{param.mapping || '-'}</TableCell>
                                    </TableRow>
                                  ))}
                                  
                                  {selectedProcess.parameters.length === 0 && (
                                    <TableRow>
                                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No parameters defined
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                          
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
                              placeholder="Trade Approval Process"
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Process Model ID *</label>
                            <Input 
                              value={currentProcess.processModelId || ''}
                              onChange={(e) => setCurrentProcess(prev => ({ ...prev, processModelId: e.target.value }))}
                              placeholder="p_trade_approval"
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
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="text-sm font-medium">Environment *</label>
                              <Select 
                                value={currentProcess.environmentId || ''}
                                onValueChange={(value) => setCurrentProcess(prev => ({ ...prev, environmentId: value }))}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select environment" />
                                </SelectTrigger>
                                <SelectContent>
                                  {environments.map(environment => (
                                    <SelectItem key={environment.id} value={environment.id}>
                                      {environment.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Version</label>
                              <Input 
                                value={currentProcess.version || ''}
                                onChange={(e) => setCurrentProcess(prev => ({ ...prev, version: e.target.value }))}
                                placeholder="1.0.0"
                                className="mt-1"
                              />
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Status</label>
                              <div className="mt-1">
                                <div className="flex items-center space-x-2">
                                  <Switch 
                                    checked={currentProcess.isActive !== undefined ? currentProcess.isActive : true}
                                    onCheckedChange={(checked) => setCurrentProcess(prev => ({ ...prev, isActive: checked }))}
                                    id="process-active"
                                  />
                                  <label htmlFor="process-active" className="text-sm">
                                    {currentProcess.isActive !== undefined ? (currentProcess.isActive ? 'Active' : 'Inactive') : 'Active'}
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-sm font-medium">Parameters</label>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleAddParameter}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Parameter
                              </Button>
                            </div>
                            
                            <div className="space-y-2 mt-2">
                              {(currentProcess.parameters || []).length > 0 ? (
                                (currentProcess.parameters || []).map(renderParameterFields)
                              ) : (
                                <p className="text-muted-foreground p-2 border rounded-md bg-muted/20">
                                  No parameters defined. Add parameters to specify how data is passed to and from Appian.
                                </p>
                              )}
                            </div>
                          </div>
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
                                {execution.processInstanceId || 'No instance ID'}
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
                                {selectedExecution.processInstanceId ? `Instance ID: ${selectedExecution.processInstanceId}` : 'No instance ID'}
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
                                <div className="flex justify-between">
                                  <span className="text-sm">Executed By:</span>
                                  <span className="text-sm">{selectedExecution.executedBy}</span>
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
                                Input Parameters
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
                                Output Parameters
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
              
              {/* Records Tab */}
              <TabsContent value="records" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Appian Records</h3>
                  <Button variant="outline" onClick={handleRefreshRecords}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100%-3rem)]">
                  {/* Records List */}
                  <div className="border rounded-md overflow-hidden">
                    <div className="p-3 border-b bg-muted/30 font-medium flex justify-between items-center">
                      <span>Records</span>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-[140px] h-8">
                          <SelectValue placeholder="Record Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="Trade">Trade</SelectItem>
                          <SelectItem value="Customer">Customer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <ScrollArea className="h-[calc(100%-2.5rem)]">
                      <div className="p-2 space-y-2">
                        {records.map(record => (
                          <div 
                            key={record.id}
                            className={`border rounded-md p-3 cursor-pointer hover:bg-accent/50 ${selectedRecordId === record.id ? 'border-primary bg-primary/5' : ''}`}
                            onClick={() => handleSelectRecord(record.id)}
                          >
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">{record.data.id || record.id}</h4>
                              <Badge variant="outline">
                                {record.recordType}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center mt-1 text-sm">
                              <span className="text-muted-foreground">
                                {record.data.name || record.data.status || ''}
                              </span>
                              <span className="text-xs">
                                {record.updatedAt.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                        
                        {records.length === 0 && (
                          <div className="text-center p-4 text-muted-foreground">
                            <p>No records found</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                  
                  {/* Record Details */}
                  <div className="col-span-2 border rounded-md overflow-hidden">
                    <div className="p-3 border-b bg-muted/30 font-medium">
                      Record Details
                    </div>
                    
                    {selectedRecord ? (
                      <ScrollArea className="h-[calc(100%-2.5rem)]">
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-medium">{selectedRecord.data.id || selectedRecord.id}</h3>
                              <p className="text-muted-foreground">
                                {selectedRecord.recordType} Record
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="outline">
                                {selectedRecord.data.status || 'No Status'}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="border rounded-md p-3 bg-muted/20">
                              <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                                <Database className="h-4 w-4 mr-1" />
                                Record Information
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm">Record Type:</span>
                                  <span className="text-sm">{selectedRecord.recordType}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Record ID:</span>
                                  <span className="text-sm">{selectedRecord.id}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Created:</span>
                                  <span className="text-sm">{selectedRecord.createdAt.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm">Updated:</span>
                                  <span className="text-sm">{selectedRecord.updatedAt.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="border rounded-md p-3 bg-muted/20">
                              <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                                <Layers className="h-4 w-4 mr-1" />
                                Record Summary
                              </div>
                              <div className="space-y-2">
                                {selectedRecord.recordType === 'Trade' && (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-sm">Trade ID:</span>
                                      <span className="text-sm">{selectedRecord.data.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm">Amount:</span>
                                      <span className="text-sm">${selectedRecord.data.amount?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm">Date:</span>
                                      <span className="text-sm">{selectedRecord.data.date}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm">Status:</span>
                                      <span className="text-sm">{selectedRecord.data.status}</span>
                                    </div>
                                  </>
                                )}
                                
                                {selectedRecord.recordType === 'Customer' && (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-sm">Customer ID:</span>
                                      <span className="text-sm">{selectedRecord.data.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm">Name:</span>
                                      <span className="text-sm">{selectedRecord.data.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm">Type:</span>
                                      <span className="text-sm">{selectedRecord.data.type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm">Risk Score:</span>
                                      <span className="text-sm">{selectedRecord.data.riskScore}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                              <Code className="h-4 w-4 mr-1" />
                              Record Data
                            </div>
                            <div className="border rounded-md p-3 bg-muted/20">
                              <pre className="text-xs font-mono whitespace-pre-wrap">
                                {JSON.stringify(selectedRecord.data, null, 2)}
                              </pre>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                              <Zap className="h-4 w-4 mr-1" />
                              Related Actions
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                View in Appian
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-3 w-3 mr-1" />
                                Export
                              </Button>
                              <Button variant="outline" size="sm">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Refresh
                              </Button>
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="flex items-center justify-center h-[calc(100%-2.5rem)] text-center text-muted-foreground">
                        <div>
                          <FileText className="h-12 w-12 mb-2 mx-auto" />
                          <h3 className="text-lg font-medium">No Record Selected</h3>
                          <p className="max-w-md mt-1">Select a record from the list to view details</p>
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