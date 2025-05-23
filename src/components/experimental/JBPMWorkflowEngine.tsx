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
  Boxes,
  Table as TableIcon,
  GitBranch,
  Milestone,
  Cog,
  Puzzle,
  Clipboard,
  ClipboardCheck,
  Briefcase,
  Calendar,
  LayoutGrid,
  ListChecks,
  Gauge,
  Network,
  UserCheck,
  Pencil,
  Copy,
  Pause,
  Loader2,
  ExternalLink,
  SkipForward,
  UserMinus,
  FormInput,
  Tags,
  Info
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
import { showSuccessToast, showInfoToast, showWarningToast, showErrorToast } from '@/lib/toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

// Types for jBPM Workflow Engine
interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  type: 'BPMN' | 'CMMN' | 'DMN';
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
  xml: string;
}

interface WorkflowInstance {
  id: string;
  definitionId: string;
  definitionName: string;
  definitionVersion: string;
  status: 'RUNNING' | 'COMPLETED' | 'ABORTED' | 'SUSPENDED';
  startTime: Date;
  endTime?: Date;
  startedBy: string;
  variables: Record<string, any>;
  currentNodeIds: string[];
  currentNodeNames: string[];
}

interface WorkflowTask {
  id: string;
  name: string;
  description?: string;
  instanceId: string;
  definitionId: string;
  status: 'CREATED' | 'READY' | 'RESERVED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'ERROR' | 'EXITED' | 'OBSOLETE';
  priority: number;
  createdOn: Date;
  activationTime?: Date;
  expirationTime?: Date;
  skipable: boolean;
  workItemId: string;
  processInstanceId: string;
  containerId: string;
  parentId?: string;
  potentialOwners: string[];
  excludedOwners: string[];
  businessAdmins: string[];
  actualOwner?: string;
  formName?: string;
  inputData: Record<string, any>;
  outputData: Record<string, any>;
}

interface DecisionDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  xml: string;
}

interface DecisionExecution {
  id: string;
  definitionId: string;
  definitionName: string;
  executionDate: Date;
  executedBy: string;
  input: Record<string, any>;
  output: Record<string, any>;
  executionTime: number;
  success: boolean;
}

interface CaseDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  stages: CaseStage[];
  milestones: CaseMilestone[];
  roles: CaseRole[];
  xml: string;
}

interface CaseStage {
  id: string;
  name: string;
  status: 'AVAILABLE' | 'ACTIVE' | 'COMPLETED' | 'CANCELED';
  requiredRoles: string[];
  tasks: string[];
  milestones: string[];
  autoStart: boolean;
}

interface CaseMilestone {
  id: string;
  name: string;
  status: 'AVAILABLE' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
  achievementCondition: string;
}

interface CaseRole {
  id: string;
  name: string;
  cardinality: number;
  assignedUsers: string[];
  assignedGroups: string[];
}

interface CaseInstance {
  id: string;
  definitionId: string;
  definitionName: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELED' | 'SUSPENDED';
  startTime: Date;
  endTime?: Date;
  owner: string;
  completionMessage?: string;
  data: Record<string, any>;
  activeStages: string[];
  completedStages: string[];
  activeMilestones: string[];
  completedMilestones: string[];
}

interface OptimizationProblem {
  id: string;
  name: string;
  description: string;
  status: 'UNSOLVED' | 'SOLVING' | 'SOLVED' | 'INFEASIBLE' | 'ERROR';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  problemFactChanges: any[];
  score?: string;
  solutionId?: string;
}

interface OptimizationSolution {
  id: string;
  problemId: string;
  score: string;
  createdAt: Date;
  scoreExplanation: string;
  data: any;
}

// Sample data for demonstration
const sampleWorkflowDefinitions: WorkflowDefinition[] = [
  {
    id: 'workflow-1',
    name: 'Employee Onboarding',
    description: 'Process for onboarding new employees',
    version: '1.0.0',
    type: 'BPMN',
    status: 'ACTIVE',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
    createdBy: 'Admin User',
    tags: ['HR', 'Onboarding', 'Employee'],
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.omg.org/bpmn20" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Definitions_1" targetNamespace="http://www.example.org/MinimalExample">
  <bpmn2:process id="onboarding" name="Employee Onboarding">
    <bpmn2:startEvent id="StartEvent_1" name="Start Onboarding">
      <bpmn2:outgoing>SequenceFlow_1</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:sequenceFlow id="SequenceFlow_1" sourceRef="StartEvent_1" targetRef="Task_1"/>
    <bpmn2:userTask id="Task_1" name="Submit Employee Documents">
      <bpmn2:incoming>SequenceFlow_1</bpmn2:incoming>
      <bpmn2:outgoing>SequenceFlow_2</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="SequenceFlow_2" sourceRef="Task_1" targetRef="Task_2"/>
    <bpmn2:serviceTask id="Task_2" name="Validate Eligibility">
      <bpmn2:incoming>SequenceFlow_2</bpmn2:incoming>
      <bpmn2:outgoing>SequenceFlow_3</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:sequenceFlow id="SequenceFlow_3" sourceRef="Task_2" targetRef="Task_3"/>
    <bpmn2:userTask id="Task_3" name="Assign IT Equipment">
      <bpmn2:incoming>SequenceFlow_3</bpmn2:incoming>
      <bpmn2:outgoing>SequenceFlow_4</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="SequenceFlow_4" sourceRef="Task_3" targetRef="Task_4"/>
    <bpmn2:serviceTask id="Task_4" name="Schedule Induction">
      <bpmn2:incoming>SequenceFlow_4</bpmn2:incoming>
      <bpmn2:outgoing>SequenceFlow_5</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:sequenceFlow id="SequenceFlow_5" sourceRef="Task_4" targetRef="Task_5"/>
    <bpmn2:userTask id="Task_5" name="Manager Approval">
      <bpmn2:incoming>SequenceFlow_5</bpmn2:incoming>
      <bpmn2:outgoing>SequenceFlow_6</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="SequenceFlow_6" sourceRef="Task_5" targetRef="EndEvent_1"/>
    <bpmn2:endEvent id="EndEvent_1" name="Onboarding Complete">
      <bpmn2:incoming>SequenceFlow_6</bpmn2:incoming>
    </bpmn2:endEvent>
  </bpmn2:process>
</bpmn2:definitions>`
  },
  {
    id: 'workflow-2',
    name: 'Expense Approval',
    description: 'Process for approving employee expenses',
    version: '2.1.0',
    type: 'BPMN',
    status: 'ACTIVE',
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-03-15'),
    createdBy: 'Admin User',
    tags: ['Finance', 'Expenses', 'Approval'],
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.omg.org/bpmn20" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Definitions_1" targetNamespace="http://www.example.org/MinimalExample">
  <bpmn2:process id="expense_approval" name="Expense Approval">
    <bpmn2:startEvent id="StartEvent_1" name="Submit Expense">
      <bpmn2:outgoing>SequenceFlow_1</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:sequenceFlow id="SequenceFlow_1" sourceRef="StartEvent_1" targetRef="Task_1"/>
    <bpmn2:userTask id="Task_1" name="Review Expense">
      <bpmn2:incoming>SequenceFlow_1</bpmn2:incoming>
      <bpmn2:outgoing>SequenceFlow_2</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="SequenceFlow_2" sourceRef="Task_1" targetRef="Gateway_1"/>
    <bpmn2:exclusiveGateway id="Gateway_1" name="Amount Check">
      <bpmn2:incoming>SequenceFlow_2</bpmn2:incoming>
      <bpmn2:outgoing>SequenceFlow_3</bpmn2:outgoing>
      <bpmn2:outgoing>SequenceFlow_4</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:sequenceFlow id="SequenceFlow_3" name="Amount <= $1000" sourceRef="Gateway_1" targetRef="Task_2"/>
    <bpmn2:sequenceFlow id="SequenceFlow_4" name="Amount > $1000" sourceRef="Gateway_1" targetRef="Task_3"/>
    <bpmn2:userTask id="Task_2" name="Manager Approval">
      <bpmn2:incoming>SequenceFlow_3</bpmn2:incoming>
      <bpmn2:outgoing>SequenceFlow_5</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_3" name="Director Approval">
      <bpmn2:incoming>SequenceFlow_4</bpmn2:incoming>
      <bpmn2:outgoing>SequenceFlow_6</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="SequenceFlow_5" sourceRef="Task_2" targetRef="Gateway_2"/>
    <bpmn2:sequenceFlow id="SequenceFlow_6" sourceRef="Task_3" targetRef="Gateway_2"/>
    <bpmn2:exclusiveGateway id="Gateway_2" name="Join">
      <bpmn2:incoming>SequenceFlow_5</bpmn2:incoming>
      <bpmn2:incoming>SequenceFlow_6</bpmn2:incoming>
      <bpmn2:outgoing>SequenceFlow_7</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:sequenceFlow id="SequenceFlow_7" sourceRef="Gateway_2" targetRef="Task_4"/>
    <bpmn2:serviceTask id="Task_4" name="Process Payment">
      <bpmn2:incoming>SequenceFlow_7</bpmn2:incoming>
      <bpmn2:outgoing>SequenceFlow_8</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:sequenceFlow id="SequenceFlow_8" sourceRef="Task_4" targetRef="EndEvent_1"/>
    <bpmn2:endEvent id="EndEvent_1" name="Expense Processed">
      <bpmn2:incoming>SequenceFlow_8</bpmn2:incoming>
    </bpmn2:endEvent>
  </bpmn2:process>
</bpmn2:definitions>`
  },
  {
    id: 'workflow-3',
    name: 'Customer Complaint Resolution',
    description: 'Process for handling customer complaints',
    version: '1.3.0',
    type: 'BPMN',
    status: 'ACTIVE',
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2023-04-05'),
    createdBy: 'Admin User',
    tags: ['Customer Service', 'Complaints', 'Resolution'],
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.omg.org/bpmn20" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Definitions_1" targetNamespace="http://www.example.org/MinimalExample">
  <bpmn2:process id="complaint_resolution" name="Customer Complaint Resolution">
    <bpmn2:startEvent id="StartEvent_1" name="Receive Complaint">
      <bpmn2:outgoing>SequenceFlow_1</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:sequenceFlow id="SequenceFlow_1" sourceRef="StartEvent_1" targetRef="Task_1"/>
    <bpmn2:userTask id="Task_1" name="Log Complaint">
      <bpmn2:incoming>SequenceFlow_1</bpmn2:incoming>
      <bpmn2:outgoing>SequenceFlow_2</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="SequenceFlow_2" sourceRef="Task_1" targetRef="Task_2"/>
    <bpmn2:userTask id="Task_2" name="Investigate Complaint">
      <bpmn2:incoming>SequenceFlow_2</bpmn2:incoming>
      <bpmn2:outgoing>SequenceFlow_3</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="SequenceFlow_3" sourceRef="Task_2" targetRef="Gateway_1"/>
    <bpmn2:exclusiveGateway id="Gateway_1" name="Resolution Type">
      <bpmn2:incoming>SequenceFlow_3</bpmn2:incoming>
      <bpmn2:outgoing>SequenceFlow_4</bpmn2:outgoing>
      <bpmn2:outgoing>SequenceFlow_5</bpmn2:outgoing>
      <bpmn2:outgoing>SequenceFlow_6</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:sequenceFlow id="SequenceFlow_4" name="Refund" sourceRef="Gateway_1" targetRef="Task_3"/>
    <bpmn2:sequenceFlow id="SequenceFlow_5" name="Replacement" sourceRef="Gateway_1" targetRef="Task_4"/>
    <bpmn2:sequenceFlow id="SequenceFlow_6" name="Explanation" sourceRef="Gateway_1" targetRef="Task_5"/>
    <bpmn2:userTask id="Task_3" name="Process Refund">
      <bpmn2:incoming>SequenceFlow_4</bpmn2:incoming>
      <bpmn2:outgoing>SequenceFlow_7</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_4" name="Arrange Replacement">
      <bpmn2:incoming>SequenceFlow_5</bpmn2:incoming>
      <bpmn2:outgoing>SequenceFlow_8</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:userTask id="Task_5" name="Provide Explanation">
      <bpmn2:incoming>SequenceFlow_6</bpmn2:incoming>
      <bpmn2:outgoing>SequenceFlow_9</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="SequenceFlow_7" sourceRef="Task_3" targetRef="Gateway_2"/>
    <bpmn2:sequenceFlow id="SequenceFlow_8" sourceRef="Task_4" targetRef="Gateway_2"/>
    <bpmn2:sequenceFlow id="SequenceFlow_9" sourceRef="Task_5" targetRef="Gateway_2"/>
    <bpmn2:exclusiveGateway id="Gateway_2" name="Join">
      <bpmn2:incoming>SequenceFlow_7</bpmn2:incoming>
      <bpmn2:incoming>SequenceFlow_8</bpmn2:incoming>
      <bpmn2:incoming>SequenceFlow_9</bpmn2:incoming>
      <bpmn2:outgoing>SequenceFlow_10</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>
    <bpmn2:sequenceFlow id="SequenceFlow_10" sourceRef="Gateway_2" targetRef="Task_6"/>
    <bpmn2:userTask id="Task_6" name="Follow Up with Customer">
      <bpmn2:incoming>SequenceFlow_10</bpmn2:incoming>
      <bpmn2:outgoing>SequenceFlow_11</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:sequenceFlow id="SequenceFlow_11" sourceRef="Task_6" targetRef="EndEvent_1"/>
    <bpmn2:endEvent id="EndEvent_1" name="Complaint Resolved">
      <bpmn2:incoming>SequenceFlow_11</bpmn2:incoming>
    </bpmn2:endEvent>
  </bpmn2:process>
</bpmn2:definitions>`
  }
];

const sampleWorkflowInstances: WorkflowInstance[] = [
  {
    id: 'instance-1',
    definitionId: 'workflow-1',
    definitionName: 'Employee Onboarding',
    definitionVersion: '1.0.0',
    status: 'RUNNING',
    startTime: new Date('2023-05-10T09:30:00'),
    startedBy: 'HR Manager',
    variables: {
      employeeId: 'EMP-001',
      employeeName: 'John Smith',
      department: 'Engineering',
      position: 'Software Developer',
      startDate: '2023-05-15'
    },
    currentNodeIds: ['Task_3'],
    currentNodeNames: ['Assign IT Equipment']
  },
  {
    id: 'instance-2',
    definitionId: 'workflow-2',
    definitionName: 'Expense Approval',
    definitionVersion: '2.1.0',
    status: 'RUNNING',
    startTime: new Date('2023-05-11T14:15:00'),
    startedBy: 'Finance Manager',
    variables: {
      expenseId: 'EXP-2023-042',
      employeeId: 'EMP-015',
      employeeName: 'Jane Doe',
      amount: 2500.00,
      purpose: 'Conference Travel',
      submissionDate: '2023-05-11'
    },
    currentNodeIds: ['Task_3'],
    currentNodeNames: ['Director Approval']
  },
  {
    id: 'instance-3',
    definitionId: 'workflow-1',
    definitionName: 'Employee Onboarding',
    definitionVersion: '1.0.0',
    status: 'COMPLETED',
    startTime: new Date('2023-04-20T10:00:00'),
    endTime: new Date('2023-04-25T16:30:00'),
    startedBy: 'HR Manager',
    variables: {
      employeeId: 'EMP-002',
      employeeName: 'Robert Johnson',
      department: 'Marketing',
      position: 'Marketing Specialist',
      startDate: '2023-05-01'
    },
    currentNodeIds: ['EndEvent_1'],
    currentNodeNames: ['Onboarding Complete']
  }
];

const sampleWorkflowTasks: WorkflowTask[] = [
  {
    id: 'task-1',
    name: 'Assign IT Equipment',
    description: 'Assign and prepare IT equipment for the new employee',
    instanceId: 'instance-1',
    definitionId: 'workflow-1',
    status: 'READY',
    priority: 1,
    createdOn: new Date('2023-05-10T10:15:00'),
    activationTime: new Date('2023-05-10T10:15:00'),
    skipable: false,
    workItemId: 'workitem-1',
    processInstanceId: 'instance-1',
    containerId: 'container-1',
    potentialOwners: ['IT Manager', 'IT Specialist'],
    excludedOwners: [],
    businessAdmins: ['Admin User'],
    formName: 'it-equipment-form',
    inputData: {
      employeeId: 'EMP-001',
      employeeName: 'John Smith',
      department: 'Engineering',
      position: 'Software Developer'
    },
    outputData: {}
  },
  {
    id: 'task-2',
    name: 'Director Approval',
    description: 'Approve expense report over $1000',
    instanceId: 'instance-2',
    definitionId: 'workflow-2',
    status: 'READY',
    priority: 2,
    createdOn: new Date('2023-05-11T14:45:00'),
    activationTime: new Date('2023-05-11T14:45:00'),
    skipable: false,
    workItemId: 'workitem-2',
    processInstanceId: 'instance-2',
    containerId: 'container-1',
    potentialOwners: ['Finance Director'],
    excludedOwners: [],
    businessAdmins: ['Admin User'],
    formName: 'expense-approval-form',
    inputData: {
      expenseId: 'EXP-2023-042',
      employeeId: 'EMP-015',
      employeeName: 'Jane Doe',
      amount: 2500.00,
      purpose: 'Conference Travel',
      submissionDate: '2023-05-11'
    },
    outputData: {}
  }
];

const sampleDecisionDefinitions: DecisionDefinition[] = [
  {
    id: 'decision-1',
    name: 'Loan Approval Decision',
    description: 'Decision table for loan approval based on credit score and loan amount',
    version: '1.0.0',
    status: 'ACTIVE',
    createdAt: new Date('2023-02-15'),
    updatedAt: new Date('2023-02-15'),
    createdBy: 'Admin User',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<dmn:definitions xmlns:dmn="http://www.omg.org/spec/DMN/20180521/MODEL/" xmlns="https://kiegroup.org/dmn/_FFD84B6F-9604-4B1A-8AC6-A53554FC9B8D" xmlns:feel="http://www.omg.org/spec/DMN/20180521/FEEL/" xmlns:kie="http://www.drools.org/kie/dmn/1.2" id="_A18350B5-D339-4E33-9D69-CED45B92A5E5" name="LoanApproval" typeLanguage="http://www.omg.org/spec/DMN/20180521/FEEL/" namespace="https://kiegroup.org/dmn/_FFD84B6F-9604-4B1A-8AC6-A53554FC9B8D">
  <dmn:extensionElements/>
  <dmn:inputData id="_F0D6E266-1FD3-4D6A-A9F7-6D6B79D9F1BE" name="Credit Score">
    <dmn:extensionElements/>
    <dmn:variable id="_A3F3F682-F710-4B0F-B3F9-4D2F0C5F5D0F" name="Credit Score" typeRef="number"/>
  </dmn:inputData>
  <dmn:inputData id="_B7F95D4C-A9D3-4168-82F9-C19E2A3D4B8D" name="Loan Amount">
    <dmn:extensionElements/>
    <dmn:variable id="_D9E8A6A9-5DC8-4E09-B9D9-BBCF6D5F4F5A" name="Loan Amount" typeRef="number"/>
  </dmn:inputData>
  <dmn:decision id="_C2F4E333-D8D5-4CBD-AE82-A35118E3C1C7" name="Loan Approval">
    <dmn:extensionElements/>
    <dmn:variable id="_E4F5D6C7-B8A9-4D0E-9F1E-2D3C4B5A6D7E" name="Loan Approval" typeRef="string"/>
    <dmn:informationRequirement id="_F1E2D3C4-B5A6-4D7E-8F9G-0H1I2J3K4L5M">
      <dmn:requiredInput href="#_F0D6E266-1FD3-4D6A-A9F7-6D6B79D9F1BE"/>
    </dmn:informationRequirement>
    <dmn:informationRequirement id="_M5L4K3J2-I1H0-G9F8-E7D6-C5B4A3D2E1F0">
      <dmn:requiredInput href="#_B7F95D4C-A9D3-4168-82F9-C19E2A3D4B8D"/>
    </dmn:informationRequirement>
    <dmn:decisionTable id="_A1B2C3D4-E5F6-G7H8-I9J0-K1L2M3N4O5P6" hitPolicy="UNIQUE" preferredOrientation="Rule-as-Row">
      <dmn:input id="_Q1W2E3R4-T5Y6-U7I8-O9P0-A1S2D3F4G5H6">
        <dmn:inputExpression id="_J1K2L3M4-N5O6-P7Q8-R9S0-T1U2V3W4X5Y6" typeRef="number">
          <dmn:text>Credit Score</dmn:text>
        </dmn:inputExpression>
      </dmn:input>
      <dmn:input id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6">
        <dmn:inputExpression id="_Q1W2E3R4-T5Y6-U7I8-O9P0-A1S2D3F4G5H6" typeRef="number">
          <dmn:text>Loan Amount</dmn:text>
        </dmn:inputExpression>
      </dmn:input>
      <dmn:output id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6"/>
      <dmn:annotation name="Description"/>
      <dmn:rule id="_P1O2I3U4-Y5T6-R7E8-W9Q0-A1S2D3F4G5H6">
        <dmn:inputEntry id="_L1K2J3H4-G5F6-D7S8-A9P0-O1I2U3Y4T5R6">
          <dmn:text>&gt;= 700</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry id="_E1W2Q3R4-T5Y6-U7I8-O9P0-A1S2D3F4G5H6">
          <dmn:text>&lt;= 50000</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6">
          <dmn:text>"Approved"</dmn:text>
        </dmn:outputEntry>
        <dmn:annotationEntry>
          <dmn:text>High credit score, low amount - automatic approval</dmn:text>
        </dmn:annotationEntry>
      </dmn:rule>
      <dmn:rule id="_Q1W2E3R4-T5Y6-U7I8-O9P0-A1S2D3F4G5H6">
        <dmn:inputEntry id="_M1N2B3V4-C5X6-Z7L8-K9J0-H1G2F3D4S5A6">
          <dmn:text>&gt;= 700</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry id="_P1O2I3U4-Y5T6-R7E8-W9Q0-A1S2D3F4G5H6">
          <dmn:text>&gt; 50000</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6">
          <dmn:text>"Review"</dmn:text>
        </dmn:outputEntry>
        <dmn:annotationEntry>
          <dmn:text>High credit score, high amount - needs review</dmn:text>
        </dmn:annotationEntry>
      </dmn:rule>
      <dmn:rule id="_R1T2Y3U4-I5O6-P7A8-S9D0-F1G2H3J4K5L6">
        <dmn:inputEntry id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6">
          <dmn:text>[600..699]</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry id="_Q1W2E3R4-T5Y6-U7I8-O9P0-A1S2D3F4G5H6">
          <dmn:text>&lt;= 25000</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6">
          <dmn:text>"Approved"</dmn:text>
        </dmn:outputEntry>
        <dmn:annotationEntry>
          <dmn:text>Medium credit score, very low amount - approval</dmn:text>
        </dmn:annotationEntry>
      </dmn:rule>
      <dmn:rule id="_S1D2F3G4-H5J6-K7L8-Z9X0-C1V2B3N4M5A6">
        <dmn:inputEntry id="_Q1W2E3R4-T5Y6-U7I8-O9P0-A1S2D3F4G5H6">
          <dmn:text>[600..699]</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6">
          <dmn:text>&gt; 25000</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6">
          <dmn:text>"Review"</dmn:text>
        </dmn:outputEntry>
        <dmn:annotationEntry>
          <dmn:text>Medium credit score, higher amount - needs review</dmn:text>
        </dmn:annotationEntry>
      </dmn:rule>
      <dmn:rule id="_T1Y2U3I4-O5P6-A7S8-D9F0-G1H2J3K4L5Z6">
        <dmn:inputEntry id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6">
          <dmn:text>&lt; 600</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry id="_Q1W2E3R4-T5Y6-U7I8-O9P0-A1S2D3F4G5H6">
          <dmn:text>-</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6">
          <dmn:text>"Denied"</dmn:text>
        </dmn:outputEntry>
        <dmn:annotationEntry>
          <dmn:text>Low credit score - automatic denial</dmn:text>
        </dmn:annotationEntry>
      </dmn:rule>
    </dmn:decisionTable>
  </dmn:decision>
</dmn:definitions>`
  },
  {
    id: 'decision-2',
    name: 'Insurance Premium Calculation',
    description: 'Decision table for calculating insurance premiums based on risk factors',
    version: '1.2.0',
    status: 'ACTIVE',
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2023-04-05'),
    createdBy: 'Admin User',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<dmn:definitions xmlns:dmn="http://www.omg.org/spec/DMN/20180521/MODEL/" xmlns="https://kiegroup.org/dmn/_FFD84B6F-9604-4B1A-8AC6-A53554FC9B8D" xmlns:feel="http://www.omg.org/spec/DMN/20180521/FEEL/" xmlns:kie="http://www.drools.org/kie/dmn/1.2" id="_A18350B5-D339-4E33-9D69-CED45B92A5E5" name="InsurancePremium" typeLanguage="http://www.omg.org/spec/DMN/20180521/FEEL/" namespace="https://kiegroup.org/dmn/_FFD84B6F-9604-4B1A-8AC6-A53554FC9B8D">
  <dmn:extensionElements/>
  <dmn:inputData id="_F0D6E266-1FD3-4D6A-A9F7-6D6B79D9F1BE" name="Age">
    <dmn:extensionElements/>
    <dmn:variable id="_A3F3F682-F710-4B0F-B3F9-4D2F0C5F5D0F" name="Age" typeRef="number"/>
  </dmn:inputData>
  <dmn:inputData id="_B7F95D4C-A9D3-4168-82F9-C19E2A3D4B8D" name="Risk Score">
    <dmn:extensionElements/>
    <dmn:variable id="_D9E8A6A9-5DC8-4E09-B9D9-BBCF6D5F4F5A" name="Risk Score" typeRef="number"/>
  </dmn:inputData>
  <dmn:inputData id="_C8D9E0F1-G2H3-I4J5-K6L7-M8N9O0P1Q2R3" name="Coverage Amount">
    <dmn:extensionElements/>
    <dmn:variable id="_S4T5U6V7-W8X9-Y0Z1-A2B3-C4D5E6F7G8H9" name="Coverage Amount" typeRef="number"/>
  </dmn:inputData>
  <dmn:decision id="_C2F4E333-D8D5-4CBD-AE82-A35118E3C1C7" name="Premium Amount">
    <dmn:extensionElements/>
    <dmn:variable id="_E4F5D6C7-B8A9-4D0E-9F1E-2D3C4B5A6D7E" name="Premium Amount" typeRef="number"/>
    <dmn:informationRequirement id="_F1E2D3C4-B5A6-4D7E-8F9G-0H1I2J3K4L5M">
      <dmn:requiredInput href="#_F0D6E266-1FD3-4D6A-A9F7-6D6B79D9F1BE"/>
    </dmn:informationRequirement>
    <dmn:informationRequirement id="_M5L4K3J2-I1H0-G9F8-E7D6-C5B4A3D2E1F0">
      <dmn:requiredInput href="#_B7F95D4C-A9D3-4168-82F9-C19E2A3D4B8D"/>
    </dmn:informationRequirement>
    <dmn:informationRequirement id="_I1J2K3L4-M5N6-O7P8-Q9R0-S1T2U3V4W5X6">
      <dmn:requiredInput href="#_C8D9E0F1-G2H3-I4J5-K6L7-M8N9O0P1Q2R3"/>
    </dmn:informationRequirement>
    <dmn:decisionTable id="_A1B2C3D4-E5F6-G7H8-I9J0-K1L2M3N4O5P6" hitPolicy="UNIQUE" preferredOrientation="Rule-as-Row">
      <dmn:input id="_Q1W2E3R4-T5Y6-U7I8-O9P0-A1S2D3F4G5H6">
        <dmn:inputExpression id="_J1K2L3M4-N5O6-P7Q8-R9S0-T1U2V3W4X5Y6" typeRef="number">
          <dmn:text>Age</dmn:text>
        </dmn:inputExpression>
      </dmn:input>
      <dmn:input id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6">
        <dmn:inputExpression id="_Q1W2E3R4-T5Y6-U7I8-O9P0-A1S2D3F4G5H6" typeRef="number">
          <dmn:text>Risk Score</dmn:text>
        </dmn:inputExpression>
      </dmn:input>
      <dmn:input id="_Y1T2R3E4-W5Q6-A7S8-D9F0-G1H2J3K4L5Z6">
        <dmn:inputExpression id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6" typeRef="number">
          <dmn:text>Coverage Amount</dmn:text>
        </dmn:inputExpression>
      </dmn:input>
      <dmn:output id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6"/>
      <dmn:annotation name="Description"/>
      <dmn:rule id="_P1O2I3U4-Y5T6-R7E8-W9Q0-A1S2D3F4G5H6">
        <dmn:inputEntry id="_L1K2J3H4-G5F6-D7S8-A9P0-O1I2U3Y4T5R6">
          <dmn:text>&lt; 25</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry id="_E1W2Q3R4-T5Y6-U7I8-O9P0-A1S2D3F4G5H6">
          <dmn:text>&lt; 50</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry id="_A1S2D3F4-G5H6-J7K8-L9Z0-X1C2V3B4N5M6">
          <dmn:text>&lt;= 100000</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6">
          <dmn:text>500</dmn:text>
        </dmn:outputEntry>
        <dmn:annotationEntry>
          <dmn:text>Young, low risk, low coverage</dmn:text>
        </dmn:annotationEntry>
      </dmn:rule>
      <dmn:rule id="_Q1W2E3R4-T5Y6-U7I8-O9P0-A1S2D3F4G5H6">
        <dmn:inputEntry id="_M1N2B3V4-C5X6-Z7L8-K9J0-H1G2F3D4S5A6">
          <dmn:text>&lt; 25</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry id="_P1O2I3U4-Y5T6-R7E8-W9Q0-A1S2D3F4G5H6">
          <dmn:text>&lt; 50</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry id="_A1S2D3F4-G5H6-J7K8-L9Z0-X1C2V3B4N5M6">
          <dmn:text>&gt; 100000</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6">
          <dmn:text>800</dmn:text>
        </dmn:outputEntry>
        <dmn:annotationEntry>
          <dmn:text>Young, low risk, high coverage</dmn:text>
        </dmn:annotationEntry>
      </dmn:rule>
      <dmn:rule id="_R1T2Y3U4-I5O6-P7A8-S9D0-F1G2H3J4K5L6">
        <dmn:inputEntry id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6">
          <dmn:text>&lt; 25</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry id="_Q1W2E3R4-T5Y6-U7I8-O9P0-A1S2D3F4G5H6">
          <dmn:text>&gt;= 50</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry id="_A1S2D3F4-G5H6-J7K8-L9Z0-X1C2V3B4N5M6">
          <dmn:text>-</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6">
          <dmn:text>1200</dmn:text>
        </dmn:outputEntry>
        <dmn:annotationEntry>
          <dmn:text>Young, high risk</dmn:text>
        </dmn:annotationEntry>
      </dmn:rule>
      <dmn:rule id="_S1D2F3G4-H5J6-K7L8-Z9X0-C1V2B3N4M5A6">
        <dmn:inputEntry id="_Q1W2E3R4-T5Y6-U7I8-O9P0-A1S2D3F4G5H6">
          <dmn:text>[25..65]</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6">
          <dmn:text>&lt; 50</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry id="_A1S2D3F4-G5H6-J7K8-L9Z0-X1C2V3B4N5M6">
          <dmn:text>&lt;= 100000</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6">
          <dmn:text>600</dmn:text>
        </dmn:outputEntry>
        <dmn:annotationEntry>
          <dmn:text>Adult, low risk, low coverage</dmn:text>
        </dmn:annotationEntry>
      </dmn:rule>
      <dmn:rule id="_T1Y2U3I4-O5P6-A7S8-D9F0-G1H2J3K4L5Z6">
        <dmn:inputEntry id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6">
          <dmn:text>[25..65]</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry id="_Q1W2E3R4-T5Y6-U7I8-O9P0-A1S2D3F4G5H6">
          <dmn:text>&lt; 50</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry id="_A1S2D3F4-G5H6-J7K8-L9Z0-X1C2V3B4N5M6">
          <dmn:text>&gt; 100000</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6">
          <dmn:text>1000</dmn:text>
        </dmn:outputEntry>
        <dmn:annotationEntry>
          <dmn:text>Adult, low risk, high coverage</dmn:text>
        </dmn:annotationEntry>
      </dmn:rule>
      <dmn:rule id="_U1I2O3P4-A5S6-D7F8-G9H0-J1K2L3Z4X5C6">
        <dmn:inputEntry id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6">
          <dmn:text>[25..65]</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry id="_Q1W2E3R4-T5Y6-U7I8-O9P0-A1S2D3F4G5H6">
          <dmn:text>&gt;= 50</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry id="_A1S2D3F4-G5H6-J7K8-L9Z0-X1C2V3B4N5M6">
          <dmn:text>-</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6">
          <dmn:text>1500</dmn:text>
        </dmn:outputEntry>
        <dmn:annotationEntry>
          <dmn:text>Adult, high risk</dmn:text>
        </dmn:annotationEntry>
      </dmn:rule>
      <dmn:rule id="_V1B2N3M4-A5S6-D7F8-G9H0-J1K2L3Z4X5C6">
        <dmn:inputEntry id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6">
          <dmn:text>&gt; 65</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry id="_Q1W2E3R4-T5Y6-U7I8-O9P0-A1S2D3F4G5H6">
          <dmn:text>&lt; 50</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry id="_A1S2D3F4-G5H6-J7K8-L9Z0-X1C2V3B4N5M6">
          <dmn:text>-</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6">
          <dmn:text>1200</dmn:text>
        </dmn:outputEntry>
        <dmn:annotationEntry>
          <dmn:text>Senior, low risk</dmn:text>
        </dmn:annotationEntry>
      </dmn:rule>
      <dmn:rule id="_W1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6">
        <dmn:inputEntry id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6">
          <dmn:text>&gt; 65</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry id="_Q1W2E3R4-T5Y6-U7I8-O9P0-A1S2D3F4G5H6">
          <dmn:text>&gt;= 50</dmn:text>
        </dmn:inputEntry>
        <dmn:inputEntry id="_A1S2D3F4-G5H6-J7K8-L9Z0-X1C2V3B4N5M6">
          <dmn:text>-</dmn:text>
        </dmn:inputEntry>
        <dmn:outputEntry id="_Z1X2C3V4-B5N6-M7A8-S9D0-F1G2H3J4K5L6">
          <dmn:text>2000</dmn:text>
        </dmn:outputEntry>
        <dmn:annotationEntry>
          <dmn:text>Senior, high risk</dmn:text>
        </dmn:annotationEntry>
      </dmn:rule>
    </dmn:decisionTable>
  </dmn:decision>
</dmn:definitions>`
  }
];

const sampleDecisionExecutions: DecisionExecution[] = [
  {
    id: 'exec-1',
    definitionId: 'decision-1',
    definitionName: 'Loan Approval Decision',
    executionDate: new Date('2023-05-15T10:30:00'),
    executedBy: 'Loan Officer',
    input: {
      'Credit Score': 720,
      'Loan Amount': 35000
    },
    output: {
      'Loan Approval': 'Approved'
    },
    executionTime: 45,
    success: true
  },
  {
    id: 'exec-2',
    definitionId: 'decision-1',
    definitionName: 'Loan Approval Decision',
    executionDate: new Date('2023-05-15T11:15:00'),
    executedBy: 'Loan Officer',
    input: {
      'Credit Score': 650,
      'Loan Amount': 75000
    },
    output: {
      'Loan Approval': 'Review'
    },
    executionTime: 38,
    success: true
  },
  {
    id: 'exec-3',
    definitionId: 'decision-2',
    definitionName: 'Insurance Premium Calculation',
    executionDate: new Date('2023-05-16T09:45:00'),
    executedBy: 'Insurance Agent',
    input: {
      'Age': 32,
      'Risk Score': 35,
      'Coverage Amount': 150000
    },
    output: {
      'Premium Amount': 1000
    },
    executionTime: 52,
    success: true
  }
];

const sampleCaseDefinitions: CaseDefinition[] = [
  {
    id: 'case-def-1',
    name: 'Customer Dispute Resolution',
    description: 'Case management for resolving customer disputes',
    version: '1.0.0',
    status: 'ACTIVE',
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2023-03-10'),
    createdBy: 'Admin User',
    stages: [
      {
        id: 'stage-1',
        name: 'Initial Assessment',
        status: 'AVAILABLE',
        requiredRoles: ['Case Worker'],
        tasks: ['task-1', 'task-2'],
        milestones: ['milestone-1'],
        autoStart: true
      },
      {
        id: 'stage-2',
        name: 'Investigation',
        status: 'AVAILABLE',
        requiredRoles: ['Case Worker', 'Specialist'],
        tasks: ['task-3', 'task-4', 'task-5'],
        milestones: ['milestone-2'],
        autoStart: false
      },
      {
        id: 'stage-3',
        name: 'Resolution',
        status: 'AVAILABLE',
        requiredRoles: ['Case Worker', 'Manager'],
        tasks: ['task-6', 'task-7'],
        milestones: ['milestone-3'],
        autoStart: false
      }
    ],
    milestones: [
      {
        id: 'milestone-1',
        name: 'Assessment Complete',
        status: 'AVAILABLE',
        achievementCondition: 'Tasks 1 and 2 completed'
      },
      {
        id: 'milestone-2',
        name: 'Investigation Complete',
        status: 'AVAILABLE',
        achievementCondition: 'Tasks 3, 4, and 5 completed'
      },
      {
        id: 'milestone-3',
        name: 'Resolution Reached',
        status: 'AVAILABLE',
        achievementCondition: 'Tasks 6 and 7 completed'
      }
    ],
    roles: [
      {
        id: 'role-1',
        name: 'Case Worker',
        cardinality: 1,
        assignedUsers: [],
        assignedGroups: ['Customer Service']
      },
      {
        id: 'role-2',
        name: 'Specialist',
        cardinality: 1,
        assignedUsers: [],
        assignedGroups: ['Technical Support']
      },
      {
        id: 'role-3',
        name: 'Manager',
        cardinality: 1,
        assignedUsers: [],
        assignedGroups: ['Management']
      }
    ],
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<cmmn:definitions xmlns:dc="http://www.omg.org/spec/CMMN/20151109/DC" xmlns:di="http://www.omg.org/spec/CMMN/20151109/DI" xmlns:cmmndi="http://www.omg.org/spec/CMMN/20151109/CMMNDI" xmlns:cmmn="http://www.omg.org/spec/CMMN/20151109/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Definitions_0pu6jf3" targetNamespace="http://bpmn.io/schema/cmmn" exporter="Camunda Modeler" exporterVersion="4.8.1">
  <cmmn:case id="Case_1" name="Customer Dispute Resolution">
    <cmmn:casePlanModel id="CasePlanModel_1" name="Customer Dispute Resolution">
      <cmmn:planItem id="PlanItem_1" definitionRef="Stage_1">
        <cmmn:entryCriterion id="EntryCriterion_1" sentryRef="Sentry_1" />
      </cmmn:planItem>
      <cmmn:planItem id="PlanItem_2" definitionRef="Stage_2">
        <cmmn:entryCriterion id="EntryCriterion_2" sentryRef="Sentry_2"  />
      </cmmn:planItem>
      <cmmn:planItem id="PlanItem_3" definitionRef="Stage_3">
        <cmmn:entryCriterion id="EntryCriterion_3" sentryRef="Sentry_3" />
      </cmmn:planItem>
      <cmmn:sentry id="Sentry_1">
        <cmmn:planItemOnPart id="PlanItemOnPart_1" sourceRef="CaseFileItem_1">
          <cmmn:standardEvent>create</cmmn:standardEvent>
        </cmmn:planItemOnPart>
      </cmmn:sentry>
      <cmmn:sentry id="Sentry_2">
        <cmmn:planItemOnPart id="PlanItemOnPart_2" sourceRef="PlanItem_1">
          <cmmn:standardEvent>complete</cmmn:standardEvent>
        </cmmn:planItemOnPart>
      </cmmn:sentry>
      <cmmn:sentry id="Sentry_3">
        <cmmn:planItemOnPart id="PlanItemOnPart_3" sourceRef="PlanItem_2">
          <cmmn:standardEvent>complete</cmmn:standardEvent>
        </cmmn:planItemOnPart>
      </cmmn:sentry>
      <cmmn:stage id="Stage_1" name="Initial Assessment">
        <cmmn:planItem id="PlanItem_4" definitionRef="Task_1" />
        <cmmn:planItem id="PlanItem_5" definitionRef="Task_2" />
        <cmmn:planItem id="PlanItem_6" definitionRef="Milestone_1">
          <cmmn:entryCriterion id="EntryCriterion_4" sentryRef="Sentry_4" />
        </cmmn:planItem>
        <cmmn:sentry id="Sentry_4">
          <cmmn:planItemOnPart id="PlanItemOnPart_4" sourceRef="PlanItem_4">
            <cmmn:standardEvent>complete</cmmn:standardEvent>
          </cmmn:planItemOnPart>
          <cmmn:planItemOnPart id="PlanItemOnPart_5" sourceRef="PlanItem_5">
            <cmmn:standardEvent>complete</cmmn:standardEvent>
          </cmmn:planItemOnPart>
        </cmmn:sentry>
        <cmmn:humanTask id="Task_1" name="Review Dispute" />
        <cmmn:humanTask id="Task_2" name="Collect Information" />
        <cmmn:milestone id="Milestone_1" name="Assessment Complete" />
      </cmmn:stage>
      <cmmn:stage id="Stage_2" name="Investigation">
        <cmmn:planItem id="PlanItem_7" definitionRef="Task_3" />
        <cmmn:planItem id="PlanItem_8" definitionRef="Task_4" />
        <cmmn:planItem id="PlanItem_9" definitionRef="Task_5" />
        <cmmn:planItem id="PlanItem_10" definitionRef="Milestone_2">
          <cmmn:entryCriterion id="EntryCriterion_5" sentryRef="Sentry_5" />
        </cmmn:planItem>
        <cmmn:sentry id="Sentry_5">
          <cmmn:planItemOnPart id="PlanItemOnPart_6" sourceRef="PlanItem_7">
            <cmmn:standardEvent>complete</cmmn:standardEvent>
          </cmmn:planItemOnPart>
          <cmmn:planItemOnPart id="PlanItemOnPart_7" sourceRef="PlanItem_8">
            <cmmn:standardEvent>complete</cmmn:standardEvent>
          </cmmn:planItemOnPart>
          <cmmn:planItemOnPart id="PlanItemOnPart_8" sourceRef="PlanItem_9">
            <cmmn:standardEvent>complete</cmmn:standardEvent>
          </cmmn:planItemOnPart>
        </cmmn:sentry>
        <cmmn:humanTask id="Task_3" name="Analyze Records" />
        <cmmn:humanTask id="Task_4" name="Consult Specialist" />
        <cmmn:humanTask id="Task_5" name="Document Findings" />
        <cmmn:milestone id="Milestone_2" name="Investigation Complete" />
      </cmmn:stage>
      <cmmn:stage id="Stage_3" name="Resolution">
        <cmmn:planItem id="PlanItem_11" definitionRef="Task_6" />
        <cmmn:planItem id="PlanItem_12" definitionRef="Task_7" />
        <cmmn:planItem id="PlanItem_13" definitionRef="Milestone_3">
          <cmmn:entryCriterion id="EntryCriterion_6" sentryRef="Sentry_6" />
        </cmmn:planItem>
        <cmmn:sentry id="Sentry_6">
          <cmmn:planItemOnPart id="PlanItemOnPart_9" sourceRef="PlanItem_11">
            <cmmn:standardEvent>complete</cmmn:standardEvent>
          </cmmn:planItemOnPart>
          <cmmn:planItemOnPart id="PlanItemOnPart_10" sourceRef="PlanItem_12">
            <cmmn:standardEvent>complete</cmmn:standardEvent>
          </cmmn:planItemOnPart>
        </cmmn:sentry>
        <cmmn:humanTask id="Task_6" name="Determine Resolution" />
        <cmmn:humanTask id="Task_7" name="Communicate with Customer" />
        <cmmn:milestone id="Milestone_3" name="Resolution Reached" />
      </cmmn:stage>
      <cmmn:caseFileItem id="CaseFileItem_1" name="Dispute" />
    </cmmn:casePlanModel>
  </cmmn:case>
</cmmn:definitions>`
  }
];

const sampleCaseInstances: CaseInstance[] = [
  {
    id: 'case-inst-1',
    definitionId: 'case-def-1',
    definitionName: 'Customer Dispute Resolution',
    status: 'ACTIVE',
    startTime: new Date('2023-05-12T09:15:00'),
    owner: 'Case Worker 1',
    data: {
      customerId: 'CUST-12345',
      customerName: 'John Smith',
      disputeType: 'Billing',
      disputeAmount: 250.00,
      description: 'Customer disputes charge for service not received',
      priority: 'Medium'
    },
    activeStages: ['stage-1'],
    completedStages: [],
    activeMilestones: [],
    completedMilestones: []
  }
];

const sampleOptimizationProblems: OptimizationProblem[] = [
  {
    id: 'opt-prob-1',
    name: 'Employee Shift Scheduling',
    description: 'Optimize employee shift assignments based on availability and requirements',
    status: 'SOLVED',
    createdAt: new Date('2023-05-10T08:30:00'),
    updatedAt: new Date('2023-05-10T08:35:00'),
    createdBy: 'Scheduler',
    problemFactChanges: [],
    score: 'Hard: 0, Soft: -25',
    solutionId: 'opt-sol-1'
  },
  {
    id: 'opt-prob-2',
    name: 'Delivery Route Optimization',
    description: 'Optimize delivery routes to minimize distance and time',
    status: 'SOLVING',
    createdAt: new Date('2023-05-15T10:00:00'),
    updatedAt: new Date('2023-05-15T10:05:00'),
    createdBy: 'Logistics Manager',
    problemFactChanges: []
  }
];

const sampleOptimizationSolutions: OptimizationSolution[] = [
  {
    id: 'opt-sol-1',
    problemId: 'opt-prob-1',
    score: 'Hard: 0, Soft: -25',
    createdAt: new Date('2023-05-10T08:35:00'),
    scoreExplanation: 'All hard constraints satisfied, 25 soft constraint violations',
    data: {
      shifts: [
        { employeeId: 'EMP-001', day: 'Monday', shift: 'Morning' },
        { employeeId: 'EMP-002', day: 'Monday', shift: 'Afternoon' },
        { employeeId: 'EMP-003', day: 'Monday', shift: 'Night' },
        { employeeId: 'EMP-001', day: 'Tuesday', shift: 'Afternoon' },
        { employeeId: 'EMP-002', day: 'Tuesday', shift: 'Night' },
        { employeeId: 'EMP-003', day: 'Tuesday', shift: 'Morning' }
      ]
    }
  }
];

export const JBPMWorkflowEngine = () => {
  const [activeTab, setActiveTab] = useState<string>('workflows');
  const [workflowDefinitions, setWorkflowDefinitions] = useState<WorkflowDefinition[]>(sampleWorkflowDefinitions);
  const [workflowInstances, setWorkflowInstances] = useState<WorkflowInstance[]>(sampleWorkflowInstances);
  const [workflowTasks, setWorkflowTasks] = useState<WorkflowTask[]>(sampleWorkflowTasks);
  const [decisionDefinitions, setDecisionDefinitions] = useState<DecisionDefinition[]>(sampleDecisionDefinitions);
  const [decisionExecutions, setDecisionExecutions] = useState<DecisionExecution[]>(sampleDecisionExecutions);
  const [caseDefinitions, setCaseDefinitions] = useState<CaseDefinition[]>(sampleCaseDefinitions);
  const [caseInstances, setCaseInstances] = useState<CaseInstance[]>(sampleCaseInstances);
  const [optimizationProblems, setOptimizationProblems] = useState<OptimizationProblem[]>(sampleOptimizationProblems);
  const [optimizationSolutions, setOptimizationSolutions] = useState<OptimizationSolution[]>(sampleOptimizationSolutions);
  
  const [selectedWorkflowDefId, setSelectedWorkflowDefId] = useState<string | null>(null);
  const [selectedWorkflowInstId, setSelectedWorkflowInstId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedDecisionDefId, setSelectedDecisionDefId] = useState<string | null>(null);
  const [selectedDecisionExecId, setSelectedDecisionExecId] = useState<string | null>(null);
  const [selectedCaseDefId, setSelectedCaseDefId] = useState<string | null>(null);
  const [selectedCaseInstId, setSelectedCaseInstId] = useState<string | null>(null);
  const [selectedOptProblemId, setSelectedOptProblemId] = useState<string | null>(null);
  const [selectedOptSolutionId, setSelectedOptSolutionId] = useState<string | null>(null);
  
  const [editMode, setEditMode] = useState<boolean>(false);
  const [testInput, setTestInput] = useState<string>('{\n  "Credit Score": 720,\n  "Loan Amount": 35000\n}');
  const [testOutput, setTestOutput] = useState<string>('');
  
  // Get selected items
  const selectedWorkflowDef = selectedWorkflowDefId 
    ? workflowDefinitions.find(def => def.id === selectedWorkflowDefId) 
    : null;
  
  const selectedWorkflowInst = selectedWorkflowInstId 
    ? workflowInstances.find(inst => inst.id === selectedWorkflowInstId) 
    : null;
  
  const selectedTask = selectedTaskId 
    ? workflowTasks.find(task => task.id === selectedTaskId) 
    : null;
  
  const selectedDecisionDef = selectedDecisionDefId 
    ? decisionDefinitions.find(def => def.id === selectedDecisionDefId) 
    : null;
  
  const selectedDecisionExec = selectedDecisionExecId 
    ? decisionExecutions.find(exec => exec.id === selectedDecisionExecId) 
    : null;
  
  const selectedCaseDef = selectedCaseDefId 
    ? caseDefinitions.find(def => def.id === selectedCaseDefId) 
    : null;
  
  const selectedCaseInst = selectedCaseInstId 
    ? caseInstances.find(inst => inst.id === selectedCaseInstId) 
    : null;
  
  const selectedOptProblem = selectedOptProblemId 
    ? optimizationProblems.find(prob => prob.id === selectedOptProblemId) 
    : null;
  
  const selectedOptSolution = selectedOptSolutionId 
    ? optimizationSolutions.find(sol => sol.id === selectedOptSolutionId) 
    : null;
  
  // Workflow Management
  const handleSelectWorkflowDef = (id: string) => {
    setSelectedWorkflowDefId(id);
    setActiveTab('workflowDetails');
  };
  
  const handleSelectWorkflowInst = (id: string) => {
    setSelectedWorkflowInstId(id);
    setActiveTab('instanceDetails');
  };
  
  const handleSelectTask = (id: string) => {
    setSelectedTaskId(id);
    setActiveTab('taskDetails');
  };
  
  const handleStartWorkflow = (definitionId: string) => {
    const definition = workflowDefinitions.find(def => def.id === definitionId);
    if (definition) {
      const newInstance: WorkflowInstance = {
        id: `instance-${Date.now()}`,
        definitionId: definition.id,
        definitionName: definition.name,
        definitionVersion: definition.version,
        status: 'RUNNING',
        startTime: new Date(),
        startedBy: 'Current User',
        variables: {},
        currentNodeIds: ['StartEvent_1'],
        currentNodeNames: ['Start Event']
      };
      
      setWorkflowInstances(prev => [newInstance, ...prev]);
      setSelectedWorkflowInstId(newInstance.id);
      setActiveTab('instanceDetails');
      showSuccessToast(`Workflow "${definition.name}" started successfully`);
    }
  };
  
  // Decision Management
  const handleSelectDecisionDef = (id: string) => {
    setSelectedDecisionDefId(id);
    setActiveTab('decisionDetails');
  };
  
  const handleSelectDecisionExec = (id: string) => {
    setSelectedDecisionExecId(id);
    setActiveTab('decisionExecDetails');
  };
  
  const handleExecuteDecision = () => {
    if (selectedDecisionDef) {
      try {
        // Parse the test input
        const input = JSON.parse(testInput);
        
        // Simulate decision execution
        const now = new Date();
        const duration = Math.floor(Math.random() * 100) + 20;
        
        // Generate a sample output based on the selected decision
        let output: any = {};
        
        if (selectedDecisionDef.id === 'decision-1') {
          // Loan Approval Decision
          const creditScore = input['Credit Score'] || 0;
          const loanAmount = input['Loan Amount'] || 0;
          
          let decision = 'Denied';
          
          if (creditScore >= 700) {
            decision = loanAmount <= 50000 ? 'Approved' : 'Review';
          } else if (creditScore >= 600 && creditScore < 700) {
            decision = loanAmount <= 25000 ? 'Approved' : 'Review';
          }
          
          output = {
            'Loan Approval': decision
          };
        } else if (selectedDecisionDef.id === 'decision-2') {
          // Insurance Premium Calculation
          const age = input['Age'] || 0;
          const riskScore = input['Risk Score'] || 0;
          const coverageAmount = input['Coverage Amount'] || 0;
          
          let premium = 500; // Default
          
          if (age < 25) {
            if (riskScore < 50) {
              premium = coverageAmount <= 100000 ? 500 : 800;
            } else {
              premium = 1200;
            }
          } else if (age <= 65) {
            if (riskScore < 50) {
              premium = coverageAmount <= 100000 ? 600 : 1000;
            } else {
              premium = 1500;
            }
          } else {
            premium = riskScore < 50 ? 1200 : 2000;
          }
          
          output = {
            'Premium Amount': premium
          };
        }
        
        // Create a new execution record
        const execution: DecisionExecution = {
          id: `exec-${Date.now()}`,
          definitionId: selectedDecisionDef.id,
          definitionName: selectedDecisionDef.name,
          executionDate: now,
          executedBy: 'Current User',
          input,
          output,
          executionTime: duration,
          success: true
        };
        
        // Add to executions history
        setDecisionExecutions(prev => [execution, ...prev]);
        
        // Display the output
        setTestOutput(JSON.stringify(output, null, 2));
        
        showSuccessToast("Decision executed successfully");
      } catch (error) {
        showWarningToast(`Error: ${error instanceof Error ? error.message : 'Invalid input'}`);
      }
    }
  };
  
  // Case Management
  const handleSelectCaseDef = (id: string) => {
    setSelectedCaseDefId(id);
    setActiveTab('caseDetails');
  };
  
  const handleSelectCaseInst = (id: string) => {
    setSelectedCaseInstId(id);
    setActiveTab('caseInstanceDetails');
  };
  
  const handleStartCase = (definitionId: string) => {
    const definition = caseDefinitions.find(def => def.id === definitionId);
    if (definition) {
      const newInstance: CaseInstance = {
        id: `case-inst-${Date.now()}`,
        definitionId: definition.id,
        definitionName: definition.name,
        status: 'ACTIVE',
        startTime: new Date(),
        owner: 'Current User',
        data: {},
        activeStages: [definition.stages[0]?.id || ''],
        completedStages: [],
        activeMilestones: [],
        completedMilestones: []
      };
      
      setCaseInstances(prev => [newInstance, ...prev]);
      setSelectedCaseInstId(newInstance.id);
      setActiveTab('caseInstanceDetails');
      showSuccessToast(`Case "${definition.name}" started successfully`);
    }
  };
  
  // Optimization Management
  const handleSelectOptProblem = (id: string) => {
    setSelectedOptProblemId(id);
    setActiveTab('optimizationDetails');
  };
  
  const handleSelectOptSolution = (id: string) => {
    setSelectedOptSolutionId(id);
    setActiveTab('solutionDetails');
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <Card className="flex flex-col h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-primary" />
            <CardTitle>jBPM Workflow Engine</CardTitle>
            <Badge variant="outline" className="ml-2 bg-primary/10">
              <Sparkles className="h-3 w-3 mr-1" />
              Experimental
            </Badge>
          </div>
          <CardDescription>
            Comprehensive workflow automation platform with BPMN, DMN, CMMN, and OptaPlanner integration
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow overflow-auto p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="border-b px-4">
              <TabsList className="w-full justify-start h-12">
                <TabsTrigger value="workflows" className="data-[state=active]:bg-primary/5">
                  <Workflow className="h-4 w-4 mr-2" />
                  Workflows
                </TabsTrigger>
                <TabsTrigger value="workflowDetails" className="data-[state=active]:bg-primary/5" disabled={!selectedWorkflowDef}>
                  <FileText className="h-4 w-4 mr-2" />
                  Workflow Details
                </TabsTrigger>
                <TabsTrigger value="instances" className="data-[state=active]:bg-primary/5">
                  <Play className="h-4 w-4 mr-2" />
                  Instances
                </TabsTrigger>
                <TabsTrigger value="instanceDetails" className="data-[state=active]:bg-primary/5" disabled={!selectedWorkflowInst}>
                  <FileText className="h-4 w-4 mr-2" />
                  Instance Details
                </TabsTrigger>
                <TabsTrigger value="tasks" className="data-[state=active]:bg-primary/5">
                  <ListChecks className="h-4 w-4 mr-2" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="taskDetails" className="data-[state=active]:bg-primary/5" disabled={!selectedTask}>
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Task Details
                </TabsTrigger>
                <TabsTrigger value="decisions" className="data-[state=active]:bg-primary/5">
                  <TableIcon className="h-4 w-4 mr-2" />
                  Decisions
                </TabsTrigger>
                <TabsTrigger value="decisionDetails" className="data-[state=active]:bg-primary/5" disabled={!selectedDecisionDef}>
                  <FileText className="h-4 w-4 mr-2" />
                  Decision Details
                </TabsTrigger>
                <TabsTrigger value="cases" className="data-[state=active]:bg-primary/5">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Cases
                </TabsTrigger>
                <TabsTrigger value="caseDetails" className="data-[state=active]:bg-primary/5" disabled={!selectedCaseDef}>
                  <FileText className="h-4 w-4 mr-2" />
                  Case Details
                </TabsTrigger>
                <TabsTrigger value="optimization" className="data-[state=active]:bg-primary/5">
                  <Gauge className="h-4 w-4 mr-2" />
                  Optimization
                </TabsTrigger>
                <TabsTrigger value="optimizationDetails" className="data-[state=active]:bg-primary/5" disabled={!selectedOptProblem}>
                  <FileText className="h-4 w-4 mr-2" />
                  Optimization Details
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="h-[calc(100%-3rem)] overflow-auto">
              {/* Workflows Tab */}
              <TabsContent value="workflows" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Workflow Definitions</h3>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Workflow
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {workflowDefinitions.map(workflow => (
                    <div 
                      key={workflow.id}
                      className={`border rounded-md p-3 cursor-pointer hover:bg-accent/50 ${selectedWorkflowDefId === workflow.id ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => handleSelectWorkflowDef(workflow.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{workflow.name}</h4>
                            <Badge variant={workflow.status === 'ACTIVE' ? 'default' : 'outline'}>
                              {workflow.status}
                            </Badge>
                            <Badge variant="outline">v{workflow.version}</Badge>
                            <Badge variant="outline" className="bg-primary/10">
                              {workflow.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{workflow.description}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartWorkflow(workflow.id);
                          }}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Start
                        </Button>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        {workflow.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        
                        <Badge variant="outline" className="text-xs">
                          Created: {workflow.createdAt.toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              {/* Workflow Details Tab */}
              <TabsContent value="workflowDetails" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                {selectedWorkflowDef && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-medium">{selectedWorkflowDef.name}</h3>
                        <p className="text-muted-foreground">Version: {selectedWorkflowDef.version}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline">
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          onClick={() => handleStartWorkflow(selectedWorkflowDef.id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Workflow
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <Info className="h-4 w-4 mr-1" />
                          Basic Information
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">ID:</span>
                            <span className="text-sm font-mono">{selectedWorkflowDef.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Type:</span>
                            <span className="text-sm">{selectedWorkflowDef.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Status:</span>
                            <span className="text-sm">{selectedWorkflowDef.status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Created By:</span>
                            <span className="text-sm">{selectedWorkflowDef.createdBy}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          Dates
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Created:</span>
                            <span className="text-sm">{selectedWorkflowDef.createdAt.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Last Updated:</span>
                            <span className="text-sm">{selectedWorkflowDef.updatedAt.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <Tags className="h-4 w-4 mr-1" />
                          Tags
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedWorkflowDef.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Description</h4>
                      <div className="border rounded-md p-3 bg-muted/20">
                        <p className="text-sm">{selectedWorkflowDef.description}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Workflow Diagram</h4>
                      <div className="border rounded-md p-4 bg-muted/20 flex items-center justify-center h-64">
                        <div className="text-center text-muted-foreground">
                          <Workflow className="h-12 w-12 mx-auto mb-2 opacity-30" />
                          <p>BPMN diagram would be displayed here</p>
                          <p className="text-xs">Using bpmn.js or a similar renderer</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">XML Definition</h4>
                      <div className="border rounded-md bg-muted/20">
                        <ScrollArea className="h-64">
                          <pre className="p-3 text-xs font-mono whitespace-pre-wrap">
                            {selectedWorkflowDef.xml}
                          </pre>
                        </ScrollArea>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {/* Instances Tab */}
              <TabsContent value="instances" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Workflow Instances</h3>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="RUNNING">Running</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="ABORTED">Aborted</SelectItem>
                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {workflowInstances.map(instance => (
                    <div 
                      key={instance.id}
                      className={`border rounded-md p-3 cursor-pointer hover:bg-accent/50 ${selectedWorkflowInstId === instance.id ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => handleSelectWorkflowInst(instance.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{instance.definitionName}</h4>
                            <Badge 
                              variant={
                                instance.status === 'COMPLETED' ? 'default' : 
                                instance.status === 'RUNNING' ? 'secondary' :
                                instance.status === 'SUSPENDED' ? 'outline' :
                                'destructive'
                              }
                            >
                              {instance.status}
                            </Badge>
                            <Badge variant="outline">v{instance.definitionVersion}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ID: {instance.id} | Started: {instance.startTime.toLocaleString()} | By: {instance.startedBy}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-sm">Current Activity:</span>
                          <Badge variant="outline">
                            {instance.currentNodeNames.join(', ')}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        {instance.endTime && (
                          <Badge variant="outline" className="text-xs">
                            Completed: {instance.endTime.toLocaleDateString()}
                          </Badge>
                        )}
                        
                        {Object.keys(instance.variables).length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {Object.keys(instance.variables).length} variables
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {workflowInstances.length === 0 && (
                    <div className="text-center p-8 text-muted-foreground">
                      <Workflow className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <h4 className="text-lg font-medium">No Workflow Instances</h4>
                      <p>Start a workflow from the Workflow Definitions tab to see instances here</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Instance Details Tab */}
              <TabsContent value="instanceDetails" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                {selectedWorkflowInst && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-medium">{selectedWorkflowInst.definitionName}</h3>
                        <p className="text-muted-foreground">Instance ID: {selectedWorkflowInst.id}</p>
                      </div>
                      <Badge 
                        variant={
                          selectedWorkflowInst.status === 'COMPLETED' ? 'default' : 
                          selectedWorkflowInst.status === 'RUNNING' ? 'secondary' :
                          selectedWorkflowInst.status === 'SUSPENDED' ? 'outline' :
                          'destructive'
                        }
                        className="text-sm"
                      >
                        {selectedWorkflowInst.status}
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
                            <span className="text-sm">{selectedWorkflowInst.startTime.toLocaleString()}</span>
                          </div>
                          {selectedWorkflowInst.endTime && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-sm">Completed:</span>
                                <span className="text-sm">{selectedWorkflowInst.endTime.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Duration:</span>
                                <span className="text-sm">
                                  {Math.round((selectedWorkflowInst.endTime.getTime() - selectedWorkflowInst.startTime.getTime()) / 60000)} minutes
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
                            <span className="text-sm">Definition ID:</span>
                            <span className="text-sm font-mono">{selectedWorkflowInst.definitionId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Version:</span>
                            <span className="text-sm">{selectedWorkflowInst.definitionVersion}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Started By:</span>
                            <span className="text-sm">{selectedWorkflowInst.startedBy}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <Settings className="h-4 w-4 mr-1" />
                          Actions
                        </div>
                        <div className="space-y-2">
                          {selectedWorkflowInst.status === 'RUNNING' ? (
                            <>
                              <Button variant="outline" size="sm" className="w-full">
                                <Pause className="h-3 w-3 mr-1" />
                                Suspend
                              </Button>
                              <Button variant="outline" size="sm" className="w-full text-destructive">
                                <X className="h-3 w-3 mr-1" />
                                Abort
                              </Button>
                            </>
                          ) : selectedWorkflowInst.status === 'SUSPENDED' ? (
                            <Button variant="outline" size="sm" className="w-full">
                              <Play className="h-3 w-3 mr-1" />
                              Resume
                            </Button>
                          ) : (
                            <>
                              <Button variant="outline" size="sm" className="w-full">
                                <Copy className="h-3 w-3 mr-1" />
                                Clone
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
                        <h4 className="text-sm font-medium mb-2">Current Activities</h4>
                        <div className="border rounded-md p-3 bg-muted/20">
                          <div className="space-y-2">
                            {selectedWorkflowInst.currentNodeIds.map((nodeId, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {nodeId}
                                </Badge>
                                <span className="text-sm">{selectedWorkflowInst.currentNodeNames[index]}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Related Tasks</h4>
                        <div className="border rounded-md p-3 bg-muted/20">
                          {workflowTasks.filter(task => task.instanceId === selectedWorkflowInst.id).length > 0 ? (
                            <div className="space-y-2">
                              {workflowTasks
                                .filter(task => task.instanceId === selectedWorkflowInst.id)
                                .map(task => (
                                  <div 
                                    key={task.id} 
                                    className="flex items-center justify-between cursor-pointer hover:bg-accent/30 p-1 rounded"
                                    onClick={() => handleSelectTask(task.id)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Badge 
                                        variant={
                                          task.status === 'COMPLETED' ? 'default' : 
                                          task.status === 'READY' || task.status === 'RESERVED' ? 'secondary' :
                                          task.status === 'IN_PROGRESS' ? 'outline' :
                                          'destructive'
                                        }
                                        className="text-xs"
                                      >
                                        {task.status}
                                      </Badge>
                                      <span className="text-sm">{task.name}</span>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                ))
                              }
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No tasks associated with this instance</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Process Variables</h4>
                      <div className="border rounded-md p-3 bg-muted/20">
                        {Object.keys(selectedWorkflowInst.variables).length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(selectedWorkflowInst.variables).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-sm font-medium">{key}:</span>
                                <span className="text-sm">
                                  {typeof value === 'object' 
                                    ? JSON.stringify(value) 
                                    : String(value)
                                  }
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No variables defined for this instance</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Process Diagram</h4>
                      <div className="border rounded-md p-4 bg-muted/20 flex items-center justify-center h-64">
                        <div className="text-center text-muted-foreground">
                          <Workflow className="h-12 w-12 mx-auto mb-2 opacity-30" />
                          <p>Process visualization would be displayed here</p>
                          <p className="text-xs">Showing the flow with current position highlighted</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {/* Tasks Tab */}
              <TabsContent value="tasks" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Task List</h3>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="READY">Ready</SelectItem>
                        <SelectItem value="RESERVED">Reserved</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Process</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workflowTasks.map(task => (
                        <TableRow 
                          key={task.id}
                          className={selectedTaskId === task.id ? 'bg-primary/5' : ''}
                        >
                          <TableCell className="font-medium">{task.name}</TableCell>
                          <TableCell>
                            {workflowInstances.find(inst => inst.id === task.instanceId)?.definitionName || task.instanceId}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                task.status === 'COMPLETED' ? 'default' : 
                                task.status === 'READY' || task.status === 'RESERVED' ? 'secondary' :
                                task.status === 'IN_PROGRESS' ? 'outline' :
                                'destructive'
                              }
                            >
                              {task.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{task.createdOn.toLocaleDateString()}</TableCell>
                          <TableCell>{task.priority}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleSelectTask(task.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {task.status === 'READY' && (
                                <Button variant="ghost" size="icon">
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                              )}
                              {task.status === 'RESERVED' || task.status === 'IN_PROGRESS' ? (
                                <Button variant="ghost" size="icon">
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {workflowTasks.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <ListChecks className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <h4 className="text-lg font-medium">No Tasks Available</h4>
                            <p className="text-muted-foreground">Start a workflow to create tasks</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              {/* Task Details Tab */}
              <TabsContent value="taskDetails" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                {selectedTask && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-medium">{selectedTask.name}</h3>
                        <p className="text-muted-foreground">Task ID: {selectedTask.id}</p>
                      </div>
                      <Badge 
                        variant={
                          selectedTask.status === 'COMPLETED' ? 'default' : 
                          selectedTask.status === 'READY' || selectedTask.status === 'RESERVED' ? 'secondary' :
                          selectedTask.status === 'IN_PROGRESS' ? 'outline' :
                          'destructive'
                        }
                        className="text-sm"
                      >
                        {selectedTask.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <Info className="h-4 w-4 mr-1" />
                          Basic Information
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Process:</span>
                            <span className="text-sm">
                              {workflowInstances.find(inst => inst.id === selectedTask.instanceId)?.definitionName || 'Unknown'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Instance ID:</span>
                            <span className="text-sm font-mono">{selectedTask.instanceId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Priority:</span>
                            <span className="text-sm">{selectedTask.priority}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Skipable:</span>
                            <span className="text-sm">{selectedTask.skipable ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <Clock className="h-4 w-4 mr-1" />
                          Timing
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Created:</span>
                            <span className="text-sm">{selectedTask.createdOn.toLocaleString()}</span>
                          </div>
                          {selectedTask.activationTime && (
                            <div className="flex justify-between">
                              <span className="text-sm">Activated:</span>
                              <span className="text-sm">{selectedTask.activationTime.toLocaleString()}</span>
                            </div>
                          )}
                          {selectedTask.expirationTime && (
                            <div className="flex justify-between">
                              <span className="text-sm">Expires:</span>
                              <span className="text-sm">{selectedTask.expirationTime.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <Settings className="h-4 w-4 mr-1" />
                          Actions
                        </div>
                        <div className="space-y-2">
                          {selectedTask.status === 'READY' && (
                            <Button variant="outline" size="sm" className="w-full">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Claim Task
                            </Button>
                          )}
                          {selectedTask.status === 'RESERVED' && (
                            <>
                              <Button variant="outline" size="sm" className="w-full">
                                <Play className="h-3 w-3 mr-1" />
                                Start Task
                              </Button>
                              <Button variant="outline" size="sm" className="w-full">
                                <UserMinus className="h-3 w-3 mr-1" />
                                Release Task
                              </Button>
                            </>
                          )}
                          {selectedTask.status === 'IN_PROGRESS' && (
                            <>
                              <Button variant="outline" size="sm" className="w-full">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Complete Task
                              </Button>
                              <Button variant="outline" size="sm" className="w-full text-destructive">
                                <X className="h-3 w-3 mr-1" />
                                Fail Task
                              </Button>
                            </>
                          )}
                          {selectedTask.skipable && (
                            <Button variant="outline" size="sm" className="w-full">
                              <SkipForward className="h-3 w-3 mr-1" />
                              Skip Task
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Assignment</h4>
                        <div className="border rounded-md p-3 bg-muted/20">
                          <div className="space-y-3">
                            <div>
                              <h5 className="text-xs font-medium text-muted-foreground">Potential Owners</h5>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {selectedTask.potentialOwners.length > 0 ? (
                                  selectedTask.potentialOwners.map((owner, index) => (
                                    <Badge key={index} variant="outline">
                                      {owner}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-sm text-muted-foreground">None</span>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="text-xs font-medium text-muted-foreground">Excluded Owners</h5>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {selectedTask.excludedOwners.length > 0 ? (
                                  selectedTask.excludedOwners.map((owner, index) => (
                                    <Badge key={index} variant="outline">
                                      {owner}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-sm text-muted-foreground">None</span>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="text-xs font-medium text-muted-foreground">Business Admins</h5>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {selectedTask.businessAdmins.length > 0 ? (
                                  selectedTask.businessAdmins.map((admin, index) => (
                                    <Badge key={index} variant="outline">
                                      {admin}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-sm text-muted-foreground">None</span>
                                )}
                              </div>
                            </div>
                            
                            {selectedTask.actualOwner && (
                              <div>
                                <h5 className="text-xs font-medium text-muted-foreground">Actual Owner</h5>
                                <Badge className="mt-1">{selectedTask.actualOwner}</Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Task Form</h4>
                        <div className="border rounded-md p-3 bg-muted/20">
                          {selectedTask.formName ? (
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{selectedTask.formName}</span>
                                <Button variant="outline" size="sm">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Open Form
                                </Button>
                              </div>
                              <div className="border border-dashed rounded-md p-4 flex items-center justify-center">
                                <div className="text-center text-muted-foreground">
                                  <FormInput className="h-8 w-8 mx-auto mb-1 opacity-30" />
                                  <p className="text-xs">Form would be rendered here</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-muted-foreground">
                              <FormInput className="h-8 w-8 mx-auto mb-1 opacity-30" />
                              <p>No form associated with this task</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Input Data</h4>
                        <div className="border rounded-md p-3 bg-muted/20 h-[calc(100%-2rem)]">
                          <ScrollArea className="h-full">
                            <pre className="text-xs font-mono whitespace-pre-wrap">
                              {JSON.stringify(selectedTask.inputData, null, 2)}
                            </pre>
                          </ScrollArea>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Output Data</h4>
                        <div className="border rounded-md p-3 bg-muted/20 h-[calc(100%-2rem)]">
                          <ScrollArea className="h-full">
                            {Object.keys(selectedTask.outputData).length > 0 ? (
                              <pre className="text-xs font-mono whitespace-pre-wrap">
                                {JSON.stringify(selectedTask.outputData, null, 2)}
                              </pre>
                            ) : (
                              <p className="text-sm text-muted-foreground">No output data available</p>
                            )}
                          </ScrollArea>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {/* Decisions Tab */}
              <TabsContent value="decisions" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Decision Tables (DMN)</h3>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Decision
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {decisionDefinitions.map(decision => (
                    <div 
                      key={decision.id}
                      className={`border rounded-md p-3 cursor-pointer hover:bg-accent/50 ${selectedDecisionDefId === decision.id ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => handleSelectDecisionDef(decision.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{decision.name}</h4>
                            <Badge variant={decision.status === 'ACTIVE' ? 'default' : 'outline'}>
                              {decision.status}
                            </Badge>
                            <Badge variant="outline">v{decision.version}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{decision.description}</p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDecisionDefId(decision.id);
                              }}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Execute
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Execute Decision: {decision.name}</DialogTitle>
                              <DialogDescription>
                                Provide input data for decision execution
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
                                    {testOutput || 'Execute the decision to see results here'}
                                  </pre>
                                </div>
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button onClick={handleExecuteDecision}>Execute Decision</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Created: {decision.createdAt.toLocaleDateString()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          By: {decision.createdBy}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Decision Executions</h3>
                  
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Decision</TableHead>
                          <TableHead>Executed</TableHead>
                          <TableHead>By</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {decisionExecutions.map(execution => (
                          <TableRow 
                            key={execution.id}
                            className={selectedDecisionExecId === execution.id ? 'bg-primary/5' : ''}
                          >
                            <TableCell className="font-medium">{execution.definitionName}</TableCell>
                            <TableCell>{execution.executionDate.toLocaleString()}</TableCell>
                            <TableCell>{execution.executedBy}</TableCell>
                            <TableCell>{execution.executionTime}ms</TableCell>
                            <TableCell>
                              <Badge variant={execution.success ? 'default' : 'destructive'}>
                                {execution.success ? 'Success' : 'Failed'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleSelectDecisionExec(execution.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        
                        {decisionExecutions.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <TableIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                              <h4 className="text-lg font-medium">No Decision Executions</h4>
                              <p className="text-muted-foreground">Execute a decision to see results here</p>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>
              
              {/* Decision Details Tab */}
              <TabsContent value="decisionDetails" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                {selectedDecisionDef && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-medium">{selectedDecisionDef.name}</h3>
                        <p className="text-muted-foreground">Version: {selectedDecisionDef.version}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline">
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button>
                              <Play className="h-4 w-4 mr-2" />
                              Execute Decision
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Execute Decision: {selectedDecisionDef.name}</DialogTitle>
                              <DialogDescription>
                                Provide input data for decision execution
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
                                    {testOutput || 'Execute the decision to see results here'}
                                  </pre>
                                </div>
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button onClick={handleExecuteDecision}>Execute Decision</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <Info className="h-4 w-4 mr-1" />
                          Basic Information
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">ID:</span>
                            <span className="text-sm font-mono">{selectedDecisionDef.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Status:</span>
                            <span className="text-sm">{selectedDecisionDef.status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Created By:</span>
                            <span className="text-sm">{selectedDecisionDef.createdBy}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          Dates
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Created:</span>
                            <span className="text-sm">{selectedDecisionDef.createdAt.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Last Updated:</span>
                            <span className="text-sm">{selectedDecisionDef.updatedAt.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <BarChart className="h-4 w-4 mr-1" />
                          Execution Stats
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Total Executions:</span>
                            <span className="text-sm">
                              {decisionExecutions.filter(exec => exec.definitionId === selectedDecisionDef.id).length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Success Rate:</span>
                            <span className="text-sm">
                              {decisionExecutions.filter(exec => exec.definitionId === selectedDecisionDef.id).length > 0
                                ? `${Math.round(decisionExecutions.filter(exec => exec.definitionId === selectedDecisionDef.id && exec.success).length / 
                                    decisionExecutions.filter(exec => exec.definitionId === selectedDecisionDef.id).length * 100)}%`
                                : 'N/A'
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Avg. Duration:</span>
                            <span className="text-sm">
                              {decisionExecutions.filter(exec => exec.definitionId === selectedDecisionDef.id).length > 0
                                ? `${Math.round(decisionExecutions.filter(exec => exec.definitionId === selectedDecisionDef.id)
                                    .reduce((sum, exec) => sum + exec.executionTime, 0) / 
                                    decisionExecutions.filter(exec => exec.definitionId === selectedDecisionDef.id).length)}ms`
                                : 'N/A'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Description</h4>
                      <div className="border rounded-md p-3 bg-muted/20">
                        <p className="text-sm">{selectedDecisionDef.description}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Decision Table</h4>
                      <div className="border rounded-md p-4 bg-muted/20 flex items-center justify-center h-64">
                        <div className="text-center text-muted-foreground">
                          <TableIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
                          <p>DMN decision table would be displayed here</p>
                          <p className="text-xs">Using dmn.js or a similar renderer</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">XML Definition</h4>
                      <div className="border rounded-md bg-muted/20">
                        <ScrollArea className="h-64">
                          <pre className="p-3 text-xs font-mono whitespace-pre-wrap">
                            {selectedDecisionDef.xml}
                          </pre>
                        </ScrollArea>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {/* Cases Tab */}
              <TabsContent value="cases" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Case Definitions (CMMN)</h3>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Case
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {caseDefinitions.map(caseDef => (
                    <div 
                      key={caseDef.id}
                      className={`border rounded-md p-3 cursor-pointer hover:bg-accent/50 ${selectedCaseDefId === caseDef.id ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => handleSelectCaseDef(caseDef.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{caseDef.name}</h4>
                            <Badge variant={caseDef.status === 'ACTIVE' ? 'default' : 'outline'}>
                              {caseDef.status}
                            </Badge>
                            <Badge variant="outline">v{caseDef.version}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{caseDef.description}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartCase(caseDef.id);
                          }}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Start Case
                        </Button>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {caseDef.stages.length} stages
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {caseDef.milestones.length} milestones
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {caseDef.roles.length} roles
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Case Instances</h3>
                  
                  <div className="space-y-2">
                    {caseInstances.map(caseInst => (
                      <div 
                        key={caseInst.id}
                        className={`border rounded-md p-3 cursor-pointer hover:bg-accent/50 ${selectedCaseInstId === caseInst.id ? 'border-primary bg-primary/5' : ''}`}
                        onClick={() => handleSelectCaseInst(caseInst.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{caseInst.definitionName}</h4>
                              <Badge 
                                variant={
                                  caseInst.status === 'COMPLETED' ? 'default' : 
                                  caseInst.status === 'ACTIVE' ? 'secondary' :
                                  caseInst.status === 'SUSPENDED' ? 'outline' :
                                  'destructive'
                                }
                              >
                                {caseInst.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              ID: {caseInst.id} | Started: {caseInst.startTime.toLocaleString()} | Owner: {caseInst.owner}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-sm">Active Stages:</span>
                            <div className="flex flex-wrap gap-1 mt-1 justify-end">
                              {caseInst.activeStages.map((stageId, index) => {
                                const stage = caseDefinitions
                                  .find(def => def.id === caseInst.definitionId)
                                  ?.stages.find(s => s.id === stageId);
                                
                                return (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {stage?.name || stageId}
                                  </Badge>
                                );
                              })}
                              {caseInst.activeStages.length === 0 && (
                                <span className="text-xs text-muted-foreground">None</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {caseInst.completedStages.length} completed stages
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {caseInst.completedMilestones.length} completed milestones
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    {caseInstances.length === 0 && (
                      <div className="text-center p-8 text-muted-foreground border rounded-md">
                        <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <h4 className="text-lg font-medium">No Case Instances</h4>
                        <p>Start a case from the Case Definitions section to see instances here</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              {/* Case Details Tab */}
              <TabsContent value="caseDetails" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                {selectedCaseDef && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-medium">{selectedCaseDef.name}</h3>
                        <p className="text-muted-foreground">Version: {selectedCaseDef.version}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline">
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          onClick={() => handleStartCase(selectedCaseDef.id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Case
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <Info className="h-4 w-4 mr-1" />
                          Basic Information
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">ID:</span>
                            <span className="text-sm font-mono">{selectedCaseDef.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Status:</span>
                            <span className="text-sm">{selectedCaseDef.status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Created By:</span>
                            <span className="text-sm">{selectedCaseDef.createdBy}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          Dates
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Created:</span>
                            <span className="text-sm">{selectedCaseDef.createdAt.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Last Updated:</span>
                            <span className="text-sm">{selectedCaseDef.updatedAt.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <BarChart className="h-4 w-4 mr-1" />
                          Case Stats
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Active Instances:</span>
                            <span className="text-sm">
                              {caseInstances.filter(inst => inst.definitionId === selectedCaseDef.id && inst.status === 'ACTIVE').length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Completed Instances:</span>
                            <span className="text-sm">
                              {caseInstances.filter(inst => inst.definitionId === selectedCaseDef.id && inst.status === 'COMPLETED').length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Total Instances:</span>
                            <span className="text-sm">
                              {caseInstances.filter(inst => inst.definitionId === selectedCaseDef.id).length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Description</h4>
                      <div className="border rounded-md p-3 bg-muted/20">
                        <p className="text-sm">{selectedCaseDef.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Stages</h4>
                        <div className="border rounded-md overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Auto Start</TableHead>
                                <TableHead>Tasks</TableHead>
                                <TableHead>Milestones</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedCaseDef.stages.map(stage => (
                                <TableRow key={stage.id}>
                                  <TableCell className="font-medium">{stage.name}</TableCell>
                                  <TableCell>
                                    {stage.autoStart ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </TableCell>
                                  <TableCell>{stage.tasks.length}</TableCell>
                                  <TableCell>{stage.milestones.length}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Milestones</h4>
                        <div className="border rounded-md overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Achievement Condition</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedCaseDef.milestones.map(milestone => (
                                <TableRow key={milestone.id}>
                                  <TableCell className="font-medium">{milestone.name}</TableCell>
                                  <TableCell>{milestone.achievementCondition}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Roles</h4>
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Cardinality</TableHead>
                              <TableHead>Assigned Users</TableHead>
                              <TableHead>Assigned Groups</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedCaseDef.roles.map(role => (
                              <TableRow key={role.id}>
                                <TableCell className="font-medium">{role.name}</TableCell>
                                <TableCell>{role.cardinality}</TableCell>
                                <TableCell>
                                  {role.assignedUsers.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {role.assignedUsers.map((user, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {user}
                                        </Badge>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">None</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {role.assignedGroups.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {role.assignedGroups.map((group, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {group}
                                        </Badge>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">None</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Case Diagram</h4>
                      <div className="border rounded-md p-4 bg-muted/20 flex items-center justify-center h-64">
                        <div className="text-center text-muted-foreground">
                          <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-30" />
                          <p>CMMN diagram would be displayed here</p>
                          <p className="text-xs">Using cmmn.js or a similar renderer</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">XML Definition</h4>
                      <div className="border rounded-md bg-muted/20">
                        <ScrollArea className="h-64">
                          <pre className="p-3 text-xs font-mono whitespace-pre-wrap">
                            {selectedCaseDef.xml}
                          </pre>
                        </ScrollArea>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {/* Case Instance Details Tab */}
              <TabsContent value="caseInstanceDetails" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                {selectedCaseInst && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-medium">{selectedCaseInst.definitionName}</h3>
                        <p className="text-muted-foreground">Case ID: {selectedCaseInst.id}</p>
                      </div>
                      <Badge 
                        variant={
                          selectedCaseInst.status === 'COMPLETED' ? 'default' : 
                          selectedCaseInst.status === 'ACTIVE' ? 'secondary' :
                          selectedCaseInst.status === 'SUSPENDED' ? 'outline' :
                          'destructive'
                        }
                        className="text-sm"
                      >
                        {selectedCaseInst.status}
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
                            <span className="text-sm">{selectedCaseInst.startTime.toLocaleString()}</span>
                          </div>
                          {selectedCaseInst.endTime && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-sm">Completed:</span>
                                <span className="text-sm">{selectedCaseInst.endTime.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Duration:</span>
                                <span className="text-sm">
                                  {Math.round((selectedCaseInst.endTime.getTime() - selectedCaseInst.startTime.getTime()) / 60000)} minutes
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <Briefcase className="h-4 w-4 mr-1" />
                          Case Information
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Definition ID:</span>
                            <span className="text-sm font-mono">{selectedCaseInst.definitionId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Owner:</span>
                            <span className="text-sm">{selectedCaseInst.owner}</span>
                          </div>
                          {selectedCaseInst.completionMessage && (
                            <div className="flex justify-between">
                              <span className="text-sm">Completion Message:</span>
                              <span className="text-sm">{selectedCaseInst.completionMessage}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <Settings className="h-4 w-4 mr-1" />
                          Actions
                        </div>
                        <div className="space-y-2">
                          {selectedCaseInst.status === 'ACTIVE' ? (
                            <>
                              <Button variant="outline" size="sm" className="w-full">
                                <Pause className="h-3 w-3 mr-1" />
                                Suspend
                              </Button>
                              <Button variant="outline" size="sm" className="w-full">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Complete
                              </Button>
                              <Button variant="outline" size="sm" className="w-full text-destructive">
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </>
                          ) : selectedCaseInst.status === 'SUSPENDED' ? (
                            <Button variant="outline" size="sm" className="w-full">
                              <Play className="h-3 w-3 mr-1" />
                              Resume
                            </Button>
                          ) : (
                            <>
                              <Button variant="outline" size="sm" className="w-full">
                                <Copy className="h-3 w-3 mr-1" />
                                Clone
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
                        <h4 className="text-sm font-medium mb-2">Active Stages</h4>
                        <div className="border rounded-md p-3 bg-muted/20">
                          {selectedCaseInst.activeStages.length > 0 ? (
                            <div className="space-y-2">
                              {selectedCaseInst.activeStages.map((stageId, index) => {
                                const stage = caseDefinitions
                                  .find(def => def.id === selectedCaseInst.definitionId)
                                  ?.stages.find(s => s.id === stageId);
                                
                                return (
                                  <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary" className="text-xs">
                                        {stageId}
                                      </Badge>
                                      <span className="text-sm">{stage?.name || 'Unknown Stage'}</span>
                                    </div>
                                    <Button variant="outline" size="sm" className="h-7 text-xs">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Complete
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No active stages</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Active Milestones</h4>
                        <div className="border rounded-md p-3 bg-muted/20">
                          {selectedCaseInst.activeMilestones.length > 0 ? (
                            <div className="space-y-2">
                              {selectedCaseInst.activeMilestones.map((milestoneId, index) => {
                                const milestone = caseDefinitions
                                  .find(def => def.id === selectedCaseInst.definitionId)
                                  ?.milestones.find(m => m.id === milestoneId);
                                
                                return (
                                  <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {milestoneId}
                                      </Badge>
                                      <span className="text-sm">{milestone?.name || 'Unknown Milestone'}</span>
                                    </div>
                                    <Button variant="outline" size="sm" className="h-7 text-xs">
                                      <Milestone className="h-3 w-3 mr-1" />
                                      Achieve
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No active milestones</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Completed Stages</h4>
                        <div className="border rounded-md p-3 bg-muted/20">
                          {selectedCaseInst.completedStages.length > 0 ? (
                            <div className="space-y-2">
                              {selectedCaseInst.completedStages.map((stageId, index) => {
                                const stage = caseDefinitions
                                  .find(def => def.id === selectedCaseInst.definitionId)
                                  ?.stages.find(s => s.id === stageId);
                                
                                return (
                                  <div key={index} className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">{stage?.name || stageId}</span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No completed stages</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Completed Milestones</h4>
                        <div className="border rounded-md p-3 bg-muted/20">
                          {selectedCaseInst.completedMilestones.length > 0 ? (
                            <div className="space-y-2">
                              {selectedCaseInst.completedMilestones.map((milestoneId, index) => {
                                const milestone = caseDefinitions
                                  .find(def => def.id === selectedCaseInst.definitionId)
                                  ?.milestones.find(m => m.id === milestoneId);
                                
                                return (
                                  <div key={index} className="flex items-center gap-2">
                                    <Milestone className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">{milestone?.name || milestoneId}</span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No completed milestones</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Case Data</h4>
                      <div className="border rounded-md p-3 bg-muted/20">
                        {Object.keys(selectedCaseInst.data).length > 0 ? (
                          <ScrollArea className="h-64">
                            <pre className="text-xs font-mono whitespace-pre-wrap">
                              {JSON.stringify(selectedCaseInst.data, null, 2)}
                            </pre>
                          </ScrollArea>
                        ) : (
                          <p className="text-sm text-muted-foreground">No case data available</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Case Diagram</h4>
                      <div className="border rounded-md p-4 bg-muted/20 flex items-center justify-center h-64">
                        <div className="text-center text-muted-foreground">
                          <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-30" />
                          <p>Case visualization would be displayed here</p>
                          <p className="text-xs">Showing active and completed stages and milestones</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {/* Optimization Tab */}
              <TabsContent value="optimization" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Optimization Problems (OptaPlanner)</h3>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Problem
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {optimizationProblems.map(problem => (
                    <div 
                      key={problem.id}
                      className={`border rounded-md p-3 cursor-pointer hover:bg-accent/50 ${selectedOptProblemId === problem.id ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => handleSelectOptProblem(problem.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{problem.name}</h4>
                            <Badge 
                              variant={
                                problem.status === 'SOLVED' ? 'default' : 
                                problem.status === 'SOLVING' ? 'secondary' :
                                problem.status === 'UNSOLVED' ? 'outline' :
                                'destructive'
                              }
                            >
                              {problem.status}
                            </Badge>
                            {problem.score && (
                              <Badge variant="outline" className="bg-primary/10">
                                Score: {problem.score}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{problem.description}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={problem.status === 'SOLVING'}
                          onClick={(e) => {
                            e.stopPropagation();
                            showInfoToast(`Starting solver for ${problem.name}`);
                          }}
                        >
                          {problem.status === 'SOLVING' ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Solving...
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3 mr-1" />
                              Solve
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Created: {problem.createdAt.toLocaleDateString()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          By: {problem.createdBy}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Optimization Solutions</h3>
                  
                  <div className="space-y-2">
                    {optimizationSolutions.map(solution => (
                      <div 
                        key={solution.id}
                        className={`border rounded-md p-3 cursor-pointer hover:bg-accent/50 ${selectedOptSolutionId === solution.id ? 'border-primary bg-primary/5' : ''}`}
                        onClick={() => handleSelectOptSolution(solution.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">
                                Solution for {optimizationProblems.find(p => p.id === solution.problemId)?.name || solution.problemId}
                              </h4>
                              <Badge variant="outline" className="bg-primary/10">
                                Score: {solution.score}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Created: {solution.createdAt.toLocaleString()}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              showInfoToast(`Exporting solution ${solution.id}`);
                            }}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Export
                          </Button>
                        </div>
                        
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">{solution.scoreExplanation}</p>
                        </div>
                      </div>
                    ))}
                    
                    {optimizationSolutions.length === 0 && (
                      <div className="text-center p-8 text-muted-foreground border rounded-md">
                        <Gauge className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <h4 className="text-lg font-medium">No Solutions Available</h4>
                        <p>Solve an optimization problem to generate solutions</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              {/* Optimization Details Tab */}
              <TabsContent value="optimizationDetails" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                {selectedOptProblem && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-medium">{selectedOptProblem.name}</h3>
                        <p className="text-muted-foreground">Problem ID: {selectedOptProblem.id}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline">
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          disabled={selectedOptProblem.status === 'SOLVING'}
                          onClick={() => showInfoToast(`Starting solver for ${selectedOptProblem.name}`)}
                        >
                          {selectedOptProblem.status === 'SOLVING' ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Solving...
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Solve Problem
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <Info className="h-4 w-4 mr-1" />
                          Basic Information
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Status:</span>
                            <Badge 
                              variant={
                                selectedOptProblem.status === 'SOLVED' ? 'default' : 
                                selectedOptProblem.status === 'SOLVING' ? 'secondary' :
                                selectedOptProblem.status === 'UNSOLVED' ? 'outline' :
                                'destructive'
                              }
                            >
                              {selectedOptProblem.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Created By:</span>
                            <span className="text-sm">{selectedOptProblem.createdBy}</span>
                          </div>
                          {selectedOptProblem.score && (
                            <div className="flex justify-between">
                              <span className="text-sm">Best Score:</span>
                              <span className="text-sm">{selectedOptProblem.score}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          Dates
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Created:</span>
                            <span className="text-sm">{selectedOptProblem.createdAt.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Last Updated:</span>
                            <span className="text-sm">{selectedOptProblem.updatedAt.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <Settings className="h-4 w-4 mr-1" />
                          Solver Configuration
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Algorithm:</span>
                            <span className="text-sm">Late Acceptance</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Time Limit:</span>
                            <span className="text-sm">5 minutes</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Move Selector:</span>
                            <span className="text-sm">Entity Placement</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Description</h4>
                      <div className="border rounded-md p-3 bg-muted/20">
                        <p className="text-sm">{selectedOptProblem.description}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Problem Facts</h4>
                      <div className="border rounded-md p-3 bg-muted/20">
                        {selectedOptProblem.problemFactChanges.length > 0 ? (
                          <ScrollArea className="h-64">
                            <pre className="text-xs font-mono whitespace-pre-wrap">
                              {JSON.stringify(selectedOptProblem.problemFactChanges, null, 2)}
                            </pre>
                          </ScrollArea>
                        ) : (
                          <p className="text-sm text-muted-foreground">No problem facts defined</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Solutions</h4>
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Solution ID</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead>Score</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {optimizationSolutions
                              .filter(solution => solution.problemId === selectedOptProblem.id)
                              .map(solution => (
                                <TableRow key={solution.id}>
                                  <TableCell className="font-medium font-mono">{solution.id}</TableCell>
                                  <TableCell>{solution.createdAt.toLocaleString()}</TableCell>
                                  <TableCell>{solution.score}</TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => handleSelectOptSolution(solution.id)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon">
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            }
                            
                            {optimizationSolutions.filter(solution => solution.problemId === selectedOptProblem.id).length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                  No solutions available for this problem
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Visualization</h4>
                      <div className="border rounded-md p-4 bg-muted/20 flex items-center justify-center h-64">
                        <div className="text-center text-muted-foreground">
                          <LayoutGrid className="h-12 w-12 mx-auto mb-2 opacity-30" />
                          <p>Problem visualization would be displayed here</p>
                          <p className="text-xs">Showing constraints and current solution</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {/* Solution Details Tab */}
              <TabsContent value="solutionDetails" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                {selectedOptSolution && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-medium">
                          Solution for {optimizationProblems.find(p => p.id === selectedOptSolution.problemId)?.name || selectedOptSolution.problemId}
                        </h3>
                        <p className="text-muted-foreground">Solution ID: {selectedOptSolution.id}</p>
                      </div>
                      <Badge variant="outline" className="bg-primary/10 text-sm">
                        Score: {selectedOptSolution.score}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <Info className="h-4 w-4 mr-1" />
                          Basic Information
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Problem ID:</span>
                            <span className="text-sm font-mono">{selectedOptSolution.problemId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Created:</span>
                            <span className="text-sm">{selectedOptSolution.createdAt.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                          <BarChart className="h-4 w-4 mr-1" />
                          Score Explanation
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm">{selectedOptSolution.scoreExplanation}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Solution Data</h4>
                      <div className="border rounded-md p-3 bg-muted/20">
                        <ScrollArea className="h-64">
                          <pre className="text-xs font-mono whitespace-pre-wrap">
                            {JSON.stringify(selectedOptSolution.data, null, 2)}
                          </pre>
                        </ScrollArea>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Visualization</h4>
                      <div className="border rounded-md p-4 bg-muted/20 flex items-center justify-center h-64">
                        <div className="text-center text-muted-foreground">
                          <LayoutGrid className="h-12 w-12 mx-auto mb-2 opacity-30" />
                          <p>Solution visualization would be displayed here</p>
                          <p className="text-xs">Showing optimized assignments or schedules</p>
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