import React, { useState } from 'react';
import { 
  Code, 
  Play, 
  Plus, 
  Trash2, 
  Save, 
  FileCode, 
  CheckCircle2, 
  XCircle,
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
  Database,
  Layers,
  Zap,
  Filter,
  AlertCircle,
  Workflow,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Boxes
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

// Types for Business Rules
interface RuleCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface RuleAction {
  id: string;
  type: string;
  parameters: {
    [key: string]: any;
  };
}

interface BusinessRule {
  id: string;
  name: string;
  description: string;
  ruleType: 'decision' | 'workflow' | 'validation' | 'calculation';
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  sourceCode?: string; // The actual rule code
}

interface RuleExecution {
  id: string;
  ruleId: string;
  ruleName: string;
  timestamp: Date;
  input: any;
  output: any;
  duration: number;
  success: boolean;
  message?: string;
}

interface ProcessDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  stages: ProcessStage[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ProcessStage {
  id: string;
  name: string;
  description: string;
  rules: string[]; // Rule IDs
  nextStages: {
    stageId: string;
    condition: string;
  }[];
  isAutomatic: boolean;
}

interface ProcessInstance {
  id: string;
  processId: string;
  processName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  currentStage: string;
  startTime: Date;
  endTime?: Date;
  data: any;
  history: {
    stageId: string;
    stageName: string;
    startTime: Date;
    endTime?: Date;
    status: 'completed' | 'skipped' | 'failed';
    executedRules: string[];
  }[];
}

// Sample data
const sampleRules: BusinessRule[] = [
  {
    id: 'rule-1',
    name: 'High Value Transaction Approval',
    description: 'Automatically route high value transactions for additional approval',
    ruleType: 'decision',
    conditions: [
      {
        id: 'cond-1',
        field: 'transaction.amount',
        operator: '>',
        value: '1000000'
      },
      {
        id: 'cond-2',
        field: 'transaction.type',
        operator: '==',
        value: '"TRADE"'
      }
    ],
    actions: [
      {
        id: 'action-1',
        type: 'routeToApproval',
        parameters: {
          approvalLevel: 'SENIOR_MANAGER',
          reason: 'High value transaction requires additional approval'
        }
      }
    ],
    priority: 10,
    isActive: true,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
    createdBy: 'John Smith',
    sourceCode: `rule "High Value Transaction Approval"
    when
        $transaction : Transaction(amount > 1000000, type == "TRADE")
    then
        ApprovalRequest approvalRequest = new ApprovalRequest($transaction);
        approvalRequest.setApprovalLevel("SENIOR_MANAGER");
        approvalRequest.setReason("High value transaction requires additional approval");
        insert(approvalRequest);
end`
  },
  {
    id: 'rule-2',
    name: 'Suspicious Activity Detection',
    description: 'Flag transactions with suspicious patterns for review',
    ruleType: 'validation',
    conditions: [
      {
        id: 'cond-1',
        field: 'transaction.country',
        operator: 'in',
        value: '["COUNTRY_A", "COUNTRY_B", "COUNTRY_C"]'
      },
      {
        id: 'cond-2',
        field: 'transaction.amount',
        operator: '>',
        value: '50000'
      },
      {
        id: 'cond-3',
        field: 'customer.riskScore',
        operator: '>',
        value: '70'
      }
    ],
    actions: [
      {
        id: 'action-1',
        type: 'flagForReview',
        parameters: {
          reviewType: 'COMPLIANCE',
          priority: 'HIGH'
        }
      },
      {
        id: 'action-2',
        type: 'logEvent',
        parameters: {
          eventType: 'SUSPICIOUS_ACTIVITY',
          severity: 'HIGH'
        }
      }
    ],
    priority: 20,
    isActive: true,
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-03-05'),
    createdBy: 'Jane Doe',
    sourceCode: `rule "Suspicious Activity Detection"
    when
        $transaction : Transaction(country in ("COUNTRY_A", "COUNTRY_B", "COUNTRY_C"), amount > 50000)
        $customer : Customer(riskScore > 70)
    then
        ReviewRequest reviewRequest = new ReviewRequest($transaction, $customer);
        reviewRequest.setReviewType("COMPLIANCE");
        reviewRequest.setPriority("HIGH");
        insert(reviewRequest);
        
        Event event = new Event("SUSPICIOUS_ACTIVITY", "HIGH");
        event.setTransactionId($transaction.getId());
        event.setCustomerId($customer.getId());
        insert(event);
end`
  },
  {
    id: 'rule-3',
    name: 'Automated Limit Adjustment',
    description: 'Automatically adjust trading limits based on customer profile',
    ruleType: 'calculation',
    conditions: [
      {
        id: 'cond-1',
        field: 'customer.accountAge',
        operator: '>',
        value: '365'
      },
      {
        id: 'cond-2',
        field: 'customer.tradingVolume',
        operator: '>',
        value: '10000000'
      },
      {
        id: 'cond-3',
        field: 'customer.currentLimit',
        operator: '<',
        value: '5000000'
      }
    ],
    actions: [
      {
        id: 'action-1',
        type: 'adjustLimit',
        parameters: {
          newLimit: 'customer.tradingVolume * 0.75',
          maxLimit: '10000000',
          reason: 'Automatic adjustment based on trading history'
        }
      },
      {
        id: 'action-2',
        type: 'notifyCustomer',
        parameters: {
          template: 'LIMIT_INCREASE',
          channel: 'EMAIL'
        }
      }
    ],
    priority: 5,
    isActive: false,
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2023-04-15'),
    createdBy: 'Robert Johnson',
    sourceCode: `rule "Automated Limit Adjustment"
    when
        $customer : Customer(accountAge > 365, tradingVolume > 10000000, currentLimit < 5000000)
    then
        double newLimit = Math.min($customer.getTradingVolume() * 0.75, 10000000);
        
        LimitAdjustment adjustment = new LimitAdjustment($customer);
        adjustment.setNewLimit(newLimit);
        adjustment.setReason("Automatic adjustment based on trading history");
        insert(adjustment);
        
        Notification notification = new Notification($customer);
        notification.setTemplate("LIMIT_INCREASE");
        notification.setChannel("EMAIL");
        insert(notification);
end`
  },
  {
    id: 'rule-4',
    name: 'Trade Approval Workflow',
    description: 'Process for approving high-value trades',
    ruleType: 'workflow',
    conditions: [
      {
        id: 'cond-1',
        field: 'trade.id',
        operator: '!=',
        value: 'null'
      },
      {
        id: 'cond-2',
        field: 'trade.amount',
        operator: '>',
        value: '1000000'
      }
    ],
    actions: [
      {
        id: 'action-1',
        type: 'startProcess',
        parameters: {
          processId: 'proc-1',
          inputMapping: {
            'trade.id': 'tradeId',
            'trade.amount': 'tradeAmount',
            'trade.date': 'tradeDate',
            'trader.id': 'traderId'
          }
        }
      }
    ],
    priority: 15,
    isActive: true,
    createdAt: new Date('2023-03-05'),
    updatedAt: new Date('2023-03-05'),
    createdBy: 'Jane Doe',
    sourceCode: `rule "Trade Approval Workflow"
    when
        $trade : Trade(id != null, amount > 1000000)
        $trader : Trader(id != null)
    then
        ProcessInstance process = new ProcessInstance("proc-1");
        process.setParameter("tradeId", $trade.getId());
        process.setParameter("tradeAmount", $trade.getAmount());
        process.setParameter("tradeDate", $trade.getDate());
        process.setParameter("traderId", $trader.getId());
        processService.startProcess(process);
end`
  }
];

const sampleProcesses: ProcessDefinition[] = [
  {
    id: 'proc-1',
    name: 'Trade Approval Process',
    description: 'Process for approving and validating trades',
    version: '1.2.0',
    stages: [
      {
        id: 'stage-1',
        name: 'Initial Validation',
        description: 'Validate trade details and perform initial checks',
        rules: ['rule-2'],
        nextStages: [
          {
            stageId: 'stage-2',
            condition: 'success'
          },
          {
            stageId: 'stage-5',
            condition: 'failure'
          }
        ],
        isAutomatic: true
      },
      {
        id: 'stage-2',
        name: 'Risk Assessment',
        description: 'Assess trade risk and determine approval path',
        rules: ['rule-1'],
        nextStages: [
          {
            stageId: 'stage-3',
            condition: 'trade.amount > 5000000'
          },
          {
            stageId: 'stage-4',
            condition: 'trade.amount <= 5000000'
          }
        ],
        isAutomatic: true
      },
      {
        id: 'stage-3',
        name: 'Senior Approval',
        description: 'Obtain approval from senior management',
        rules: [],
        nextStages: [
          {
            stageId: 'stage-4',
            condition: 'approved'
          },
          {
            stageId: 'stage-5',
            condition: 'rejected'
          }
        ],
        isAutomatic: false
      },
      {
        id: 'stage-4',
        name: 'Trade Execution',
        description: 'Execute the approved trade',
        rules: [],
        nextStages: [
          {
            stageId: 'stage-6',
            condition: 'success'
          }
        ],
        isAutomatic: false
      },
      {
        id: 'stage-5',
        name: 'Rejection Handling',
        description: 'Process trade rejection and notifications',
        rules: [],
        nextStages: [
          {
            stageId: 'stage-6',
            condition: 'success'
          }
        ],
        isAutomatic: true
      },
      {
        id: 'stage-6',
        name: 'Completion',
        description: 'Finalize trade processing and record keeping',
        rules: [],
        nextStages: [],
        isAutomatic: true
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
    version: '2.0.1',
    stages: [
      {
        id: 'stage-1',
        name: 'Initial Data Collection',
        description: 'Collect basic customer information',
        rules: [],
        nextStages: [
          {
            stageId: 'stage-2',
            condition: 'success'
          }
        ],
        isAutomatic: false
      },
      {
        id: 'stage-2',
        name: 'KYC Verification',
        description: 'Verify customer identity and perform KYC checks',
        rules: [],
        nextStages: [
          {
            stageId: 'stage-3',
            condition: 'success'
          },
          {
            stageId: 'stage-5',
            condition: 'failure'
          }
        ],
        isAutomatic: false
      },
      {
        id: 'stage-3',
        name: 'Risk Assessment',
        description: 'Assess customer risk profile',
        rules: [],
        nextStages: [
          {
            stageId: 'stage-4',
            condition: 'success'
          }
        ],
        isAutomatic: true
      },
      {
        id: 'stage-4',
        name: 'Account Setup',
        description: 'Set up customer accounts and services',
        rules: ['rule-3'],
        nextStages: [
          {
            stageId: 'stage-6',
            condition: 'success'
          }
        ],
        isAutomatic: true
      },
      {
        id: 'stage-5',
        name: 'Rejection Handling',
        description: 'Process customer rejection and notifications',
        rules: [],
        nextStages: [
          {
            stageId: 'stage-6',
            condition: 'success'
          }
        ],
        isAutomatic: true
      },
      {
        id: 'stage-6',
        name: 'Completion',
        description: 'Finalize customer onboarding',
        rules: [],
        nextStages: [],
        isAutomatic: true
      }
    ],
    isActive: true,
    createdAt: new Date('2023-03-05'),
    updatedAt: new Date('2023-03-05')
  }
];

const sampleInstances: ProcessInstance[] = [
  {
    id: 'inst-1',
    processId: 'proc-1',
    processName: 'Trade Approval Process',
    status: 'completed',
    currentStage: 'stage-6',
    startTime: new Date('2023-05-10T09:30:00'),
    endTime: new Date('2023-05-10T14:45:00'),
    data: {
      trade: {
        id: 'TRD-98765',
        amount: 1500000,
        type: 'TRADE',
        date: '2023-05-10'
      },
      trader: {
        id: 'TR-456',
        name: 'Robert Johnson'
      },
      approvalStatus: 'APPROVED',
      approvedBy: 'John Smith',
      comments: 'Trade approved within limits'
    },
    history: [
      {
        stageId: 'stage-1',
        stageName: 'Initial Validation',
        startTime: new Date('2023-05-10T09:30:00'),
        endTime: new Date('2023-05-10T09:32:00'),
        status: 'completed',
        executedRules: ['rule-2']
      },
      {
        stageId: 'stage-2',
        stageName: 'Risk Assessment',
        startTime: new Date('2023-05-10T09:32:00'),
        endTime: new Date('2023-05-10T09:35:00'),
        status: 'completed',
        executedRules: ['rule-1']
      },
      {
        stageId: 'stage-4',
        stageName: 'Trade Execution',
        startTime: new Date('2023-05-10T09:35:00'),
        endTime: new Date('2023-05-10T14:30:00'),
        status: 'completed',
        executedRules: []
      },
      {
        stageId: 'stage-6',
        stageName: 'Completion',
        startTime: new Date('2023-05-10T14:30:00'),
        endTime: new Date('2023-05-10T14:45:00'),
        status: 'completed',
        executedRules: []
      }
    ]
  },
  {
    id: 'inst-2',
    processId: 'proc-1',
    processName: 'Trade Approval Process',
    status: 'running',
    currentStage: 'stage-3',
    startTime: new Date('2023-05-11T10:15:00'),
    data: {
      trade: {
        id: 'TRD-98766',
        amount: 7500000,
        type: 'TRADE',
        date: '2023-05-11'
      },
      trader: {
        id: 'TR-789',
        name: 'Jane Doe'
      }
    },
    history: [
      {
        stageId: 'stage-1',
        stageName: 'Initial Validation',
        startTime: new Date('2023-05-11T10:15:00'),
        endTime: new Date('2023-05-11T10:17:00'),
        status: 'completed',
        executedRules: ['rule-2']
      },
      {
        stageId: 'stage-2',
        stageName: 'Risk Assessment',
        startTime: new Date('2023-05-11T10:17:00'),
        endTime: new Date('2023-05-11T10:20:00'),
        status: 'completed',
        executedRules: ['rule-1']
      },
      {
        stageId: 'stage-3',
        stageName: 'Senior Approval',
        startTime: new Date('2023-05-11T10:20:00'),
        status: 'completed',
        executedRules: []
      }
    ]
  },
  {
    id: 'inst-3',
    processId: 'proc-2',
    processName: 'Customer Onboarding',
    status: 'completed',
    currentStage: 'stage-6',
    startTime: new Date('2023-05-09T11:00:00'),
    endTime: new Date('2023-05-10T09:15:00'),
    data: {
      customer: {
        id: 'CUST-12345',
        name: 'Acme Corporation',
        type: 'Corporate',
        riskScore: 75,
        accountAge: 0,
        tradingVolume: 0,
        currentLimit: 1000000
      },
      onboardingStatus: 'COMPLETED',
      accountId: 'ACC-54321'
    },
    history: [
      {
        stageId: 'stage-1',
        stageName: 'Initial Data Collection',
        startTime: new Date('2023-05-09T11:00:00'),
        endTime: new Date('2023-05-09T14:30:00'),
        status: 'completed',
        executedRules: []
      },
      {
        stageId: 'stage-2',
        stageName: 'KYC Verification',
        startTime: new Date('2023-05-09T14:30:00'),
        endTime: new Date('2023-05-10T08:00:00'),
        status: 'completed',
        executedRules: []
      },
      {
        stageId: 'stage-3',
        stageName: 'Risk Assessment',
        startTime: new Date('2023-05-10T08:00:00'),
        endTime: new Date('2023-05-10T08:30:00'),
        status: 'completed',
        executedRules: []
      },
      {
        stageId: 'stage-4',
        stageName: 'Account Setup',
        startTime: new Date('2023-05-10T08:30:00'),
        endTime: new Date('2023-05-10T09:00:00'),
        status: 'completed',
        executedRules: ['rule-3']
      },
      {
        stageId: 'stage-6',
        stageName: 'Completion',
        startTime: new Date('2023-05-10T09:00:00'),
        endTime: new Date('2023-05-10T09:15:00'),
        status: 'completed',
        executedRules: []
      }
    ]
  }
];

const sampleExecutions: RuleExecution[] = [
  {
    id: 'exec-1',
    ruleId: 'rule-1',
    ruleName: 'High Value Transaction Approval',
    timestamp: new Date('2023-05-19T14:30:00'),
    input: {
      transaction: {
        id: 'TX123456',
        amount: 1500000,
        type: 'TRADE',
        date: '2023-05-19'
      }
    },
    output: {
      approvalRequest: {
        transactionId: 'TX123456',
        approvalLevel: 'SENIOR_MANAGER',
        reason: 'High value transaction requires additional approval'
      }
    },
    duration: 45,
    success: true
  },
  {
    id: 'exec-2',
    ruleId: 'rule-2',
    ruleName: 'Suspicious Activity Detection',
    timestamp: new Date('2023-05-19T15:45:00'),
    input: {
      transaction: {
        id: 'TX123457',
        amount: 75000,
        country: 'COUNTRY_B',
        date: '2023-05-19'
      },
      customer: {
        id: 'CUST789',
        riskScore: 85
      }
    },
    output: {
      reviewRequest: {
        transactionId: 'TX123457',
        customerId: 'CUST789',
        reviewType: 'COMPLIANCE',
        priority: 'HIGH'
      },
      event: {
        type: 'SUSPICIOUS_ACTIVITY',
        severity: 'HIGH',
        transactionId: 'TX123457',
        customerId: 'CUST789'
      }
    },
    duration: 62,
    success: true
  },
  {
    id: 'exec-3',
    ruleId: 'rule-1',
    ruleName: 'High Value Transaction Approval',
    timestamp: new Date('2023-05-19T16:15:00'),
    input: {
      transaction: {
        id: 'TX123458',
        amount: 800000,
        type: 'TRADE',
        date: '2023-05-19'
      }
    },
    output: {},
    duration: 38,
    success: true,
    message: 'No rules fired - transaction amount below threshold'
  }
];

// Sample fact types for testing
const sampleFactTypes = [
  {
    name: 'Transaction',
    fields: [
      { name: 'id', type: 'String' },
      { name: 'amount', type: 'Double' },
      { name: 'type', type: 'String' },
      { name: 'date', type: 'String' },
      { name: 'country', type: 'String' },
      { name: 'currency', type: 'String' }
    ]
  },
  {
    name: 'Customer',
    fields: [
      { name: 'id', type: 'String' },
      { name: 'name', type: 'String' },
      { name: 'riskScore', type: 'Integer' },
      { name: 'accountAge', type: 'Integer' },
      { name: 'tradingVolume', type: 'Double' },
      { name: 'currentLimit', type: 'Double' }
    ]
  },
  {
    name: 'Trade',
    fields: [
      { name: 'id', type: 'String' },
      { name: 'amount', type: 'Double' },
      { name: 'type', type: 'String' },
      { name: 'date', type: 'String' },
      { name: 'traderId', type: 'String' }
    ]
  },
  {
    name: 'Trader',
    fields: [
      { name: 'id', type: 'String' },
      { name: 'name', type: 'String' }
    ]
  }
];

export const IntegratedBusinessRulesEngine = () => {
  const [rules, setRules] = useState<BusinessRule[]>(sampleRules);
  const [processes, setProcesses] = useState<ProcessDefinition[]>(sampleProcesses);
  const [instances, setInstances] = useState<ProcessInstance[]>(sampleInstances);
  const [executions, setExecutions] = useState<RuleExecution[]>(sampleExecutions);
  
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null);
  
  const [editMode, setEditMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('rules');
  
  const [testInput, setTestInput] = useState<string>('{\n  "transaction": {\n    "id": "TX123456",\n    "amount": 1500000,\n    "type": "TRADE",\n    "date": "2023-05-19"\n  },\n  "customer": {\n    "id": "CUST789",\n    "riskScore": 85,\n    "accountAge": 730,\n    "tradingVolume": 12000000,\n    "currentLimit": 3000000\n  }\n}');
  const [testOutput, setTestOutput] = useState<string>('');
  
  // New rule template
  const newRuleTemplate: Omit<BusinessRule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
    name: '',
    description: '',
    ruleType: 'decision',
    conditions: [],
    actions: [],
    priority: 0,
    isActive: false,
    sourceCode: ''
  };
  
  const [currentRule, setCurrentRule] = useState<Partial<BusinessRule>>(newRuleTemplate);
  const [currentProcess, setCurrentProcess] = useState<Partial<ProcessDefinition>>({});
  
  const selectedRule = selectedRuleId 
    ? rules.find(rule => rule.id === selectedRuleId) 
    : null;
  
  const selectedProcess = selectedProcessId 
    ? processes.find(proc => proc.id === selectedProcessId) 
    : null;
  
  const selectedInstance = selectedInstanceId 
    ? instances.find(inst => inst.id === selectedInstanceId) 
    : null;
  
  const selectedExecution = selectedExecutionId 
    ? executions.find(exec => exec.id === selectedExecutionId) 
    : null;
  
  // Rule management
  const handleSelectRule = (ruleId: string) => {
    setSelectedRuleId(ruleId);
    setEditMode(false);
    setActiveTab('ruleDetails');
  };
  
  const handleCreateNewRule = () => {
    setSelectedRuleId(null);
    setCurrentRule({
      ...newRuleTemplate,
      name: `New Rule ${rules.length + 1}`
    });
    setEditMode(true);
    setActiveTab('ruleDetails');
  };
  
  const handleEditRule = () => {
    if (selectedRule) {
      setCurrentRule(selectedRule);
      setEditMode(true);
    }
  };
  
  const handleSaveRule = () => {
    if (editMode && currentRule.name) {
      if (selectedRuleId) {
        // Update existing rule
        setRules(prevRules => 
          prevRules.map(rule => 
            rule.id === selectedRuleId 
              ? {
                  ...rule,
                  ...currentRule as BusinessRule,
                  updatedAt: new Date()
                } 
              : rule
          )
        );
        showSuccessToast("Rule updated successfully");
      } else {
        // Create new rule
        const newRule: BusinessRule = {
          ...(currentRule as Omit<BusinessRule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>),
          id: `rule-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'Current User'
        };
        setRules(prevRules => [...prevRules, newRule]);
        setSelectedRuleId(newRule.id);
        showSuccessToast("New rule created successfully");
      }
      setEditMode(false);
    }
  };
  
  const handleCancelEdit = () => {
    setEditMode(false);
    setCurrentRule(selectedRule || newRuleTemplate);
  };
  
  const handleDeleteRule = () => {
    if (selectedRuleId) {
      setRules(prevRules => prevRules.filter(rule => rule.id !== selectedRuleId));
      setSelectedRuleId(null);
      setActiveTab('rules');
      showInfoToast("Rule deleted");
    }
  };
  
  const handleToggleRuleActive = (ruleId: string, isActive: boolean) => {
    setRules(prevRules => 
      prevRules.map(rule => 
        rule.id === ruleId 
          ? { ...rule, isActive, updatedAt: new Date() } 
          : rule
      )
    );
    showInfoToast(`Rule ${isActive ? 'activated' : 'deactivated'}`);
  };
  
  const handleAddCondition = () => {
    if (editMode) {
      const newCondition: RuleCondition = {
        id: `cond-${Date.now()}`,
        field: '',
        operator: '==',
        value: ''
      };
      setCurrentRule(prev => ({
        ...prev,
        conditions: [...(prev.conditions || []), newCondition]
      }));
    }
  };
  
  const handleRemoveCondition = (conditionId: string) => {
    if (editMode) {
      setCurrentRule(prev => ({
        ...prev,
        conditions: (prev.conditions || []).filter(c => c.id !== conditionId)
      }));
    }
  };
  
  const handleUpdateCondition = (conditionId: string, field: keyof RuleCondition, value: any) => {
    if (editMode) {
      setCurrentRule(prev => ({
        ...prev,
        conditions: (prev.conditions || []).map(c => 
          c.id === conditionId ? { ...c, [field]: value } : c
        )
      }));
    }
  };
  
  const handleAddAction = () => {
    if (editMode) {
      const newAction: RuleAction = {
        id: `act-${Date.now()}`,
        type: '',
        parameters: {}
      };
      setCurrentRule(prev => ({
        ...prev,
        actions: [...(prev.actions || []), newAction]
      }));
    }
  };
  
  const handleRemoveAction = (actionId: string) => {
    if (editMode) {
      setCurrentRule(prev => ({
        ...prev,
        actions: (prev.actions || []).filter(a => a.id !== actionId)
      }));
    }
  };
  
  const handleUpdateAction = (actionId: string, field: keyof RuleAction, value: any) => {
    if (editMode) {
      setCurrentRule(prev => ({
        ...prev,
        actions: (prev.actions || []).map(a => 
          a.id === actionId ? { ...a, [field]: value } : a
        )
      }));
    }
  };
  
  const handleUpdateActionParameter = (actionId: string, paramKey: string, paramValue: any) => {
    if (editMode) {
      setCurrentRule(prev => ({
        ...prev,
        actions: (prev.actions || []).map(a => 
          a.id === actionId 
            ? { 
                ...a, 
                parameters: { 
                  ...a.parameters, 
                  [paramKey]: paramValue 
                } 
              } 
            : a
        )
      }));
    }
  };
  
  const handleGenerateSourceCode = () => {
    if (currentRule.name && currentRule.conditions && currentRule.conditions.length > 0) {
      // Generate source code from the rule definition
      const conditionsStr = currentRule.conditions
        .map(c => `${c.field} ${c.operator} ${c.value}`)
        .join(', ');
      
      const actionsStr = currentRule.actions
        ?.map(a => {
          const params = Object.entries(a.parameters)
            .map(([key, value]) => `        ${key}: ${value}`)
            .join('\n');
          
          return `        ${a.type}:\n${params}`;
        })
        .join('\n\n') || '';
      
      const sourceCode = `rule "${currentRule.name}"
    when
        $fact : Object(${conditionsStr})
    then
${actionsStr}
end`;
      
      setCurrentRule(prev => ({
        ...prev,
        sourceCode
      }));
      
      showSuccessToast("Source code generated successfully");
    } else {
      showWarningToast("Please provide rule name and at least one condition");
    }
  };
  
  const handleTestRule = () => {
    try {
      // Parse the test input
      const input = JSON.parse(testInput);
      
      // Simulate rule execution
      const now = new Date();
      const duration = Math.floor(Math.random() * 100) + 20;
      
      // Generate a sample output based on the selected rule
      let output: any = {};
      let message: string | undefined;
      let success = true;
      
      if (selectedRule) {
        if (selectedRule.id === 'rule-1' && input.transaction?.amount > 1000000 && input.transaction?.type === 'TRADE') {
          output = {
            approvalRequest: {
              transactionId: input.transaction.id,
              approvalLevel: 'SENIOR_MANAGER',
              reason: 'High value transaction requires additional approval'
            }
          };
        } else if (selectedRule.id === 'rule-2' && 
                  ['COUNTRY_A', 'COUNTRY_B', 'COUNTRY_C'].includes(input.transaction?.country) && 
                  input.transaction?.amount > 50000 && 
                  input.customer?.riskScore > 70) {
          output = {
            reviewRequest: {
              transactionId: input.transaction.id,
              customerId: input.customer.id,
              reviewType: 'COMPLIANCE',
              priority: 'HIGH'
            },
            event: {
              type: 'SUSPICIOUS_ACTIVITY',
              severity: 'HIGH',
              transactionId: input.transaction.id,
              customerId: input.customer.id
            }
          };
        } else if (selectedRule.id === 'rule-3' && 
                  input.customer?.accountAge > 365 && 
                  input.customer?.tradingVolume > 10000000 && 
                  input.customer?.currentLimit < 5000000) {
          const newLimit = Math.min(input.customer.tradingVolume * 0.75, 10000000);
          output = {
            limitAdjustment: {
              customerId: input.customer.id,
              oldLimit: input.customer.currentLimit,
              newLimit: newLimit,
              reason: 'Automatic adjustment based on trading history'
            },
            notification: {
              customerId: input.customer.id,
              template: 'LIMIT_INCREASE',
              channel: 'EMAIL'
            }
          };
        } else if (selectedRule.id === 'rule-4' && 
                  input.trade?.id && 
                  input.trade?.amount > 1000000) {
          output = {
            processInstance: {
              processId: 'proc-1',
              parameters: {
                tradeId: input.trade.id,
                tradeAmount: input.trade.amount,
                tradeDate: input.trade.date,
                traderId: input.trader?.id
              }
            }
          };
        } else {
          message = 'No rules fired - conditions not met';
        }
      } else {
        success = false;
        message = 'No rule selected for testing';
      }
      
      // Create a new execution record
      const execution: RuleExecution = {
        id: `exec-${Date.now()}`,
        ruleId: selectedRule?.id || '',
        ruleName: selectedRule?.name || '',
        timestamp: now,
        input,
        output,
        duration,
        success,
        message
      };
      
      // Add to executions history
      setExecutions(prev => [execution, ...prev]);
      
      // Display the output
      setTestOutput(JSON.stringify(output, null, 2));
      
      if (success && !message) {
        showSuccessToast("Rule executed successfully");
      } else {
        showInfoToast(message || "Rule execution completed");
      }
    } catch (error) {
      showWarningToast(`Error: ${error instanceof Error ? error.message : 'Invalid input'}`);
    }
  };
  
  // Process management
  const handleSelectProcess = (processId: string) => {
    setSelectedProcessId(processId);
    setEditMode(false);
    setActiveTab('processDetails');
  };
  
  const handleCreateNewProcess = () => {
    setSelectedProcessId(null);
    setCurrentProcess({
      name: `New Process ${processes.length + 1}`,
      description: '',
      version: '1.0.0',
      stages: [],
      isActive: true
    });
    setEditMode(true);
    setActiveTab('processDetails');
  };
  
  const handleEditProcess = () => {
    if (selectedProcess) {
      setCurrentProcess(selectedProcess);
      setEditMode(true);
    }
  };
  
  const handleSaveProcess = () => {
    if (editMode && currentProcess.name) {
      if (selectedProcessId) {
        // Update existing process
        setProcesses(prevProcesses => 
          prevProcesses.map(proc => 
            proc.id === selectedProcessId 
              ? {
                  ...proc,
                  ...currentProcess as ProcessDefinition,
                  updatedAt: new Date()
                } 
              : proc
          )
        );
        showSuccessToast("Process updated successfully");
      } else {
        // Create new process
        const newProcess: ProcessDefinition = {
          ...(currentProcess as Omit<ProcessDefinition, 'id' | 'createdAt' | 'updatedAt'>),
          id: `proc-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setProcesses(prevProcesses => [...prevProcesses, newProcess]);
        setSelectedProcessId(newProcess.id);
        showSuccessToast("New process created successfully");
      }
      setEditMode(false);
    }
  };
  
  const handleDeleteProcess = () => {
    if (selectedProcessId) {
      setProcesses(prevProcesses => prevProcesses.filter(proc => proc.id !== selectedProcessId));
      setSelectedProcessId(null);
      setActiveTab('processes');
      showInfoToast("Process deleted");
    }
  };
  
  // Instance management
  const handleSelectInstance = (instanceId: string) => {
    setSelectedInstanceId(instanceId);
    setActiveTab('instanceDetails');
  };
  
  const handleStartProcess = (processId: string) => {
    const process = processes.find(p => p.id === processId);
    if (process) {
      // Create a new instance
      const newInstance: ProcessInstance = {
        id: `inst-${Date.now()}`,
        processId: process.id,
        processName: process.name,
        status: 'running',
        currentStage: process.stages[0]?.id || '',
        startTime: new Date(),
        data: {},
        history: [
          {
            stageId: process.stages[0]?.id || '',
            stageName: process.stages[0]?.name || '',
            startTime: new Date(),
            status: 'completed',
            executedRules: []
          }
        ]
      };
      
      setInstances(prev => [newInstance, ...prev]);
      setSelectedInstanceId(newInstance.id);
      setActiveTab('instanceDetails');
      showSuccessToast(`Process "${process.name}" started successfully`);
    }
  };
  
  // Execution management
  const handleSelectExecution = (executionId: string) => {
    setSelectedExecutionId(executionId);
    setActiveTab('executionDetails');
  };
  
  // Render condition fields
  const renderConditionFields = (condition: RuleCondition) => {
    return (
      <div key={condition.id} className="grid grid-cols-12 gap-2 items-center mb-2">
        <div className="col-span-5">
          <Input 
            value={condition.field}
            onChange={(e) => handleUpdateCondition(condition.id, 'field', e.target.value)}
            placeholder="e.g. transaction.amount"
            disabled={!editMode}
          />
        </div>
        
        <div className="col-span-2">
          <Select 
            value={condition.operator}
            onValueChange={(value) => handleUpdateCondition(condition.id, 'operator', value)}
            disabled={!editMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="==">==(equals)</SelectItem>
              <SelectItem value="!=">!=(not equals)</SelectItem>
              <SelectItem value=">">&gt;(greater than)</SelectItem>
              <SelectItem value=">=">&gt;=(greater or equal)</SelectItem>
              <SelectItem value="<">&lt;(less than)</SelectItem>
              <SelectItem value="<=">&lt;=(less or equal)</SelectItem>
              <SelectItem value="contains">contains</SelectItem>
              <SelectItem value="in">in</SelectItem>
              <SelectItem value="matches">matches</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="col-span-4">
          <Input 
            value={condition.value}
            onChange={(e) => handleUpdateCondition(condition.id, 'value', e.target.value)}
            placeholder="Value"
            disabled={!editMode}
          />
        </div>
        
        {editMode && (
          <div className="col-span-1">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleRemoveCondition(condition.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };
  
  // Render action fields
  const renderActionFields = (action: RuleAction) => {
    return (
      <div key={action.id} className="border rounded-md p-3 mb-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex-1">
            <Input 
              value={action.type}
              onChange={(e) => handleUpdateAction(action.id, 'type', e.target.value)}
              placeholder="Action type (e.g. routeToApproval, flagForReview)"
              disabled={!editMode}
            />
          </div>
          
          {editMode && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleRemoveAction(action.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="mt-2">
          <label className="text-sm font-medium">Parameters</label>
          {Object.entries(action.parameters).map(([key, value], index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center mt-2">
              <div className="col-span-4">
                <Input 
                  value={key}
                  onChange={(e) => {
                    if (editMode) {
                      const newParams = { ...action.parameters };
                      delete newParams[key];
                      newParams[e.target.value] = value;
                      handleUpdateAction(action.id, 'parameters', newParams);
                    }
                  }}
                  placeholder="Parameter name"
                  disabled={!editMode}
                />
              </div>
              <div className="col-span-7">
                <Input 
                  value={value}
                  onChange={(e) => handleUpdateActionParameter(action.id, key, e.target.value)}
                  placeholder="Parameter value"
                  disabled={!editMode}
                />
              </div>
              {editMode && (
                <div className="col-span-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      const newParams = { ...action.parameters };
                      delete newParams[key];
                      handleUpdateAction(action.id, 'parameters', newParams);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
          
          {editMode && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => {
                const newParams = { ...action.parameters, [`param${Object.keys(action.parameters).length + 1}`]: '' };
                handleUpdateAction(action.id, 'parameters', newParams);
              }}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Parameter
            </Button>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <Card className="flex flex-col h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle>Integrated Business Rules Engine</CardTitle>
            <Badge variant="outline" className="ml-2 bg-primary/10">
              <Sparkles className="h-3 w-3 mr-1" />
              Experimental
            </Badge>
          </div>
          <CardDescription>
            Create, manage, and execute business rules and processes with an integrated rules engine
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow overflow-auto p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="border-b px-4">
              <TabsList className="w-full justify-start h-12">
                <TabsTrigger value="rules" className="data-[state=active]:bg-primary/5">
                  Rules Library
                </TabsTrigger>
                <TabsTrigger value="ruleDetails" className="data-[state=active]:bg-primary/5" disabled={!selectedRule && !editMode}>
                  Rule Details
                </TabsTrigger>
                <TabsTrigger value="processes" className="data-[state=active]:bg-primary/5">
                  Process Definitions
                </TabsTrigger>
                <TabsTrigger value="processDetails" className="data-[state=active]:bg-primary/5" disabled={!selectedProcess && !editMode}>
                  Process Details
                </TabsTrigger>
                <TabsTrigger value="instances" className="data-[state=active]:bg-primary/5">
                  Process Instances
                </TabsTrigger>
                <TabsTrigger value="instanceDetails" className="data-[state=active]:bg-primary/5" disabled={!selectedInstance}>
                  Instance Details
                </TabsTrigger>
                <TabsTrigger value="executions" className="data-[state=active]:bg-primary/5">
                  Rule Executions
                </TabsTrigger>
                <TabsTrigger value="executionDetails" className="data-[state=active]:bg-primary/5" disabled={!selectedExecution}>
                  Execution Details
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="h-[calc(100%-3rem)] overflow-auto">
              {/* Rules Library Tab */}
              <TabsContent value="rules" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Business Rules</h3>
                  <Button onClick={handleCreateNewRule}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Rule
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {rules.map(rule => (
                    <div 
                      key={rule.id}
                      className={`border rounded-md p-3 cursor-pointer hover:bg-accent/50 ${selectedRuleId === rule.id ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => handleSelectRule(rule.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{rule.name}</h4>
                            <Badge variant={rule.isActive ? 'default' : 'outline'}>
                              {rule.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {rule.ruleType}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{rule.description}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleRuleActive(rule.id, !rule.isActive);
                            }}
                          >
                            {rule.isActive ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Priority: {rule.priority}
                        </Badge>
                        
                        <Badge variant="outline" className="text-xs">
                          {rule.conditions?.length || 0} conditions
                        </Badge>
                        
                        <Badge variant="outline" className="text-xs">
                          {rule.actions?.length || 0} actions
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              {/* Rule Details Tab */}
              <TabsContent value="ruleDetails" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                {(selectedRule || editMode) && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">
                        {editMode 
                          ? (selectedRuleId ? 'Edit Rule' : 'Create New Rule') 
                          : 'Rule Details'}
                      </h3>
                      <div className="flex gap-2">
                        {editMode ? (
                          <>
                            <Button variant="outline" onClick={handleCancelEdit}>
                              Cancel
                            </Button>
                            <Button onClick={handleSaveRule}>
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="outline" onClick={handleDeleteRule}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline">
                                  <Play className="h-4 w-4 mr-2" />
                                  Test
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>Test Rule: {selectedRule?.name}</DialogTitle>
                                  <DialogDescription>
                                    Provide input data for rule testing
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                                  <div>
                                    <label className="text-sm font-medium">Input Data (JSON)</label>
                                    <Textarea 
                                      value={testInput}
                                      onChange={(e) => setTestInput(e.target.value)}
                                      rows={15}
                                      className="font-mono text-sm mt-1"
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium">Output Results</label>
                                    <div className="border rounded-md bg-muted/50 p-4 h-[calc(100%-2rem)] overflow-auto mt-1">
                                      <pre className="font-mono text-sm whitespace-pre-wrap">
                                        {testOutput || 'Run the test to see results here'}
                                      </pre>
                                    </div>
                                  </div>
                                </div>
                                
                                <DialogFooter>
                                  <Button onClick={handleTestRule}>Run Test</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button onClick={handleEditRule}>
                              Edit
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Basic Information */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Rule Name</label>
                        <Input 
                          value={editMode ? currentRule.name : selectedRule?.name}
                          onChange={(e) => editMode && setCurrentRule(prev => ({ ...prev, name: e.target.value }))}
                          disabled={!editMode}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea 
                          value={editMode ? currentRule.description : selectedRule?.description}
                          onChange={(e) => editMode && setCurrentRule(prev => ({ ...prev, description: e.target.value }))}
                          disabled={!editMode}
                          rows={2}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Rule Type</label>
                          <Select 
                            value={editMode ? currentRule.ruleType : selectedRule?.ruleType}
                            onValueChange={(value: any) => editMode && setCurrentRule(prev => ({ ...prev, ruleType: value }))}
                            disabled={!editMode}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select rule type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="decision">Decision Rule</SelectItem>
                              <SelectItem value="validation">Validation Rule</SelectItem>
                              <SelectItem value="calculation">Calculation Rule</SelectItem>
                              <SelectItem value="workflow">Workflow Rule</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Priority</label>
                          <Input 
                            type="number"
                            value={editMode ? currentRule.priority : selectedRule?.priority}
                            onChange={(e) => editMode && setCurrentRule(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                            disabled={!editMode}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={editMode ? !!currentRule.isActive : !!selectedRule?.isActive}
                          onCheckedChange={(checked) => editMode && setCurrentRule(prev => ({ ...prev, isActive: checked }))}
                          disabled={!editMode}
                          id="rule-active"
                        />
                        <label htmlFor="rule-active" className="text-sm font-medium">
                          Rule is active
                        </label>
                      </div>
                      
                      {/* Conditions */}
                      <div className="pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Conditions (When)</h4>
                          {editMode && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleAddCondition}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Condition
                            </Button>
                          )}
                        </div>
                        
                        {(editMode ? currentRule.conditions : selectedRule?.conditions)?.length ? (
                          <div>
                            {(editMode ? currentRule.conditions : selectedRule?.conditions)?.map(renderConditionFields)}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No conditions defined. This rule will apply to all facts.</p>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Actions (Then)</h4>
                          {editMode && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleAddAction}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Action
                            </Button>
                          )}
                        </div>
                        
                        {(editMode ? currentRule.actions : selectedRule?.actions)?.length ? (
                          <div>
                            {(editMode ? currentRule.actions : selectedRule?.actions)?.map(renderActionFields)}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No actions defined. Add at least one action for this rule to have an effect.</p>
                        )}
                      </div>
                      
                      {/* Source Code */}
                      <div className="pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Rule Source Code</h4>
                          {editMode && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleGenerateSourceCode}
                            >
                              <FileCode className="h-3 w-3 mr-1" />
                              Generate Code
                            </Button>
                          )}
                        </div>
                        
                        <div className="border rounded-md bg-muted/50">
                          <Textarea 
                            value={editMode ? currentRule.sourceCode : selectedRule?.sourceCode}
                            onChange={(e) => editMode && setCurrentRule(prev => ({ ...prev, sourceCode: e.target.value }))}
                            disabled={!editMode}
                            rows={10}
                            className="font-mono text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {/* Process Definitions Tab */}
              <TabsContent value="processes" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Process Definitions</h3>
                  <Button onClick={handleCreateNewProcess}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Process
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
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{process.name}</h4>
                            <Badge variant={process.isActive ? 'default' : 'outline'}>
                              {process.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">v{process.version}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{process.description}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartProcess(process.id);
                          }}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Start
                        </Button>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {process.stages.length} stages
                        </Badge>
                        
                        <Badge variant="outline" className="text-xs">
                          Created: {process.createdAt.toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              {/* Process Details Tab */}
              <TabsContent value="processDetails" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                {(selectedProcess || editMode) && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">
                        {editMode 
                          ? (selectedProcessId ? 'Edit Process' : 'Create New Process') 
                          : 'Process Details'}
                      </h3>
                      <div className="flex gap-2">
                        {editMode ? (
                          <>
                            <Button variant="outline" onClick={handleCancelEdit}>
                              Cancel
                            </Button>
                            <Button onClick={handleSaveProcess}>
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="outline" onClick={handleDeleteProcess}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => handleStartProcess(selectedProcess!.id)}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start Process
                            </Button>
                            <Button onClick={handleEditProcess}>
                              Edit
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Basic Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Process Name</label>
                          <Input 
                            value={editMode ? currentProcess.name : selectedProcess?.name}
                            onChange={(e) => editMode && setCurrentProcess(prev => ({ ...prev, name: e.target.value }))}
                            disabled={!editMode}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Version</label>
                          <Input 
                            value={editMode ? currentProcess.version : selectedProcess?.version}
                            onChange={(e) => editMode && setCurrentProcess(prev => ({ ...prev, version: e.target.value }))}
                            disabled={!editMode}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea 
                          value={editMode ? currentProcess.description : selectedProcess?.description}
                          onChange={(e) => editMode && setCurrentProcess(prev => ({ ...prev, description: e.target.value }))}
                          disabled={!editMode}
                          rows={2}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={editMode ? !!currentProcess.isActive : !!selectedProcess?.isActive}
                          onCheckedChange={(checked) => editMode && setCurrentProcess(prev => ({ ...prev, isActive: checked }))}
                          disabled={!editMode}
                          id="process-active"
                        />
                        <label htmlFor="process-active" className="text-sm font-medium">
                          Process is active
                        </label>
                      </div>
                      
                      {/* Process Stages */}
                      <div className="pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Process Stages</h4>
                          {editMode && (
                            <Button 
                              variant="outline" 
                              size="sm"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Stage
                            </Button>
                          )}
                        </div>
                        
                        <div className="border rounded-md overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Stage Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Rules</TableHead>
                                <TableHead>Automatic</TableHead>
                                <TableHead>Next Stages</TableHead>
                                {editMode && <TableHead>Actions</TableHead>}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(editMode ? currentProcess.stages : selectedProcess?.stages)?.map((stage, index) => (
                                <TableRow key={stage.id}>
                                  <TableCell>{stage.name}</TableCell>
                                  <TableCell>{stage.description}</TableCell>
                                  <TableCell>
                                    {stage.rules.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {stage.rules.map(ruleId => {
                                          const rule = rules.find(r => r.id === ruleId);
                                          return (
                                            <Badge key={ruleId} variant="outline" className="text-xs">
                                              {rule?.name || ruleId}
                                            </Badge>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground text-xs">No rules</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {stage.isAutomatic ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {stage.nextStages.length > 0 ? (
                                      <div className="flex flex-col gap-1">
                                        {stage.nextStages.map((next, i) => {
                                          const nextStage = (editMode ? currentProcess.stages : selectedProcess?.stages)?.find(s => s.id === next.stageId);
                                          return (
                                            <div key={i} className="flex items-center gap-1 text-xs">
                                              <ArrowRight className="h-3 w-3" />
                                              <span>{nextStage?.name || next.stageId}</span>
                                              <span className="text-muted-foreground">({next.condition})</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground text-xs">End of process</span>
                                    )}
                                  </TableCell>
                                  {editMode && (
                                    <TableCell>
                                      <div className="flex gap-1">
                                        <Button variant="ghost" size="icon">
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                          <Settings className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  )}
                                </TableRow>
                              ))}
                              
                              {(!editMode ? selectedProcess?.stages : currentProcess.stages)?.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={editMode ? 6 : 5} className="text-center text-muted-foreground">
                                    No stages defined for this process
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                      
                      {!editMode && (
                        <div className="grid grid-cols-2 gap-4 pt-4">
                          <div>
                            <label className="text-sm font-medium">Created</label>
                            <div className="mt-1 p-2 border rounded-md bg-muted/50">
                              {selectedProcess?.createdAt.toLocaleString()}
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Last Updated</label>
                            <div className="mt-1 p-2 border rounded-md bg-muted/50">
                              {selectedProcess?.updatedAt.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {/* Process Instances Tab */}
              <TabsContent value="instances" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Process Instances</h3>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="running">Running</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {instances.map(instance => (
                    <div 
                      key={instance.id}
                      className={`border rounded-md p-3 cursor-pointer hover:bg-accent/50 ${selectedInstanceId === instance.id ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => handleSelectInstance(instance.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{instance.processName}</h4>
                            <Badge 
                              variant={
                                instance.status === 'completed' ? 'default' : 
                                instance.status === 'running' ? 'secondary' :
                                'destructive'
                              }
                            >
                              {instance.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ID: {instance.id} | Started: {instance.startTime.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-sm">Current Stage:</span>
                          <Badge variant="outline">
                            {instance.currentStage}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {instance.history.length} stages completed
                        </Badge>
                        
                        {instance.endTime && (
                          <Badge variant="outline" className="text-xs">
                            Completed: {instance.endTime.toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {instances.length === 0 && (
                    <div className="text-center p-8 text-muted-foreground">
                      <Workflow className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <h4 className="text-lg font-medium">No Process Instances</h4>
                      <p>Start a process from the Process Definitions tab to see instances here</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Instance Details Tab */}
              <TabsContent value="instanceDetails" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                {selectedInstance && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-medium">{selectedInstance.processName}</h3>
                        <p className="text-muted-foreground">Instance ID: {selectedInstance.id}</p>
                      </div>
                      <Badge 
                        variant={
                          selectedInstance.status === 'completed' ? 'default' : 
                          selectedInstance.status === 'running' ? 'secondary' :
                          'destructive'
                        }
                        className="text-sm"
                      >
                        {selectedInstance.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <Clock className="h-4 w-4 mr-1" />
                          Timing
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Started:</span>
                            <span className="text-sm">{selectedInstance.startTime.toLocaleString()}</span>
                          </div>
                          {selectedInstance.endTime && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-sm">Completed:</span>
                                <span className="text-sm">{selectedInstance.endTime.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Duration:</span>
                                <span className="text-sm">
                                  {Math.round((selectedInstance.endTime.getTime() - selectedInstance.startTime.getTime()) / 60000)} minutes
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <Workflow className="h-4 w-4 mr-1" />
                          Process Information
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Process ID:</span>
                            <span className="text-sm">{selectedInstance.processId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Current Stage:</span>
                            <span className="text-sm">{selectedInstance.currentStage}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Stages Completed:</span>
                            <span className="text-sm">{selectedInstance.history.length}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <Settings className="h-4 w-4 mr-1" />
                          Actions
                        </div>
                        <div className="space-y-2">
                          {selectedInstance.status === 'running' ? (
                            <>
                              <Button variant="outline" size="sm" className="w-full">
                                <Play className="h-3 w-3 mr-1" />
                                Continue Process
                              </Button>
                              <Button variant="outline" size="sm" className="w-full">
                                <Pause className="h-3 w-3 mr-1" />
                                Pause Process
                              </Button>
                              <Button variant="outline" size="sm" className="w-full text-destructive">
                                <X className="h-3 w-3 mr-1" />
                                Cancel Process
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button variant="outline" size="sm" className="w-full">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Restart Process
                              </Button>
                              <Button variant="outline" size="sm" className="w-full">
                                <Copy className="h-3 w-3 mr-1" />
                                Clone Process
                              </Button>
                              <Button variant="outline" size="sm" className="w-full">
                                <Download className="h-3 w-3 mr-1" />
                                Export Data
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Process History</h4>
                        <div className="border rounded-md overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Stage</TableHead>
                                <TableHead>Started</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedInstance.history.map((stage, index) => (
                                <TableRow key={index}>
                                  <TableCell>{stage.stageName}</TableCell>
                                  <TableCell>{stage.startTime.toLocaleString()}</TableCell>
                                  <TableCell>
                                    {stage.endTime 
                                      ? `${Math.round((stage.endTime.getTime() - stage.startTime.getTime()) / 60000)} min` 
                                      : 'In progress'}
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant={
                                        stage.status === 'completed' ? 'default' : 
                                        stage.status === 'skipped' ? 'secondary' :
                                        'destructive'
                                      }
                                      className="text-xs"
                                    >
                                      {stage.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Process Data</h4>
                        <div className="border rounded-md p-3 bg-muted/20 h-[calc(100%-2rem)]">
                          <ScrollArea className="h-full">
                            <pre className="text-xs font-mono whitespace-pre-wrap">
                              {JSON.stringify(selectedInstance.data, null, 2)}
                            </pre>
                          </ScrollArea>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Process Diagram</h4>
                      <div className="border rounded-md p-4 bg-muted/20 flex items-center justify-center h-64">
                        <div className="text-center text-muted-foreground">
                          <Workflow className="h-12 w-12 mx-auto mb-2 opacity-30" />
                          <p>Process visualization would be displayed here</p>
                          <p className="text-xs">Showing the flow from stage to stage with current position highlighted</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {/* Rule Executions Tab */}
              <TabsContent value="executions" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Rule Executions</h3>
                  <Button 
                    variant="outline"
                    onClick={() => setExecutions([])}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear History
                  </Button>
                </div>
                
                <div className="border rounded-md">
                  <div className="grid grid-cols-12 gap-2 p-3 border-b font-medium text-sm">
                    <div className="col-span-2">Date & Time</div>
                    <div className="col-span-3">Rule</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Duration</div>
                    <div className="col-span-3">Actions</div>
                  </div>
                  
                  <ScrollArea className="h-[calc(100vh-25rem)]">
                    {executions.map((execution) => (
                      <div key={execution.id} className="grid grid-cols-12 gap-2 p-3 border-b text-sm hover:bg-muted/50">
                        <div className="col-span-2">{execution.timestamp.toLocaleString()}</div>
                        <div className="col-span-3">{execution.ruleName}</div>
                        <div className="col-span-2">
                          <Badge variant={execution.success ? 'default' : 'destructive'}>
                            {execution.success ? 'Success' : 'Failed'}
                          </Badge>
                          {execution.message && (
                            <p className="text-xs text-muted-foreground mt-1">{execution.message}</p>
                          )}
                        </div>
                        <div className="col-span-2">{execution.duration}ms</div>
                        <div className="col-span-3 flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSelectExecution(execution.id)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {executions.length === 0 && (
                      <div className="text-center p-8 text-muted-foreground">
                        <Code className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <h4 className="text-lg font-medium">No Rule Executions</h4>
                        <p>Test rules to see execution history here</p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </TabsContent>
              
              {/* Execution Details Tab */}
              <TabsContent value="executionDetails" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                {selectedExecution && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-medium">Execution Details</h3>
                        <p className="text-muted-foreground">Rule: {selectedExecution.ruleName}</p>
                      </div>
                      <Badge variant={selectedExecution.success ? 'default' : 'destructive'}>
                        {selectedExecution.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <Clock className="h-4 w-4 mr-1" />
                          Timing
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Executed:</span>
                            <span className="text-sm">{selectedExecution.timestamp.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Duration:</span>
                            <span className="text-sm">{selectedExecution.duration}ms</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <Code className="h-4 w-4 mr-1" />
                          Rule Information
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Rule ID:</span>
                            <span className="text-sm">{selectedExecution.ruleId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Execution ID:</span>
                            <span className="text-sm">{selectedExecution.id}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <Settings className="h-4 w-4 mr-1" />
                          Actions
                        </div>
                        <div className="space-y-2">
                          <Button variant="outline" size="sm" className="w-full">
                            <Play className="h-3 w-3 mr-1" />
                            Re-run Rule
                          </Button>
                          <Button variant="outline" size="sm" className="w-full">
                            <Download className="h-3 w-3 mr-1" />
                            Export Results
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {selectedExecution.message && (
                      <div className="mb-4">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-2">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Message
                        </div>
                        <div className="border rounded-md p-3 bg-muted/20">
                          <p className="text-sm">{selectedExecution.message}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                )}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};