import React, { useState } from 'react';
import { 
  Wand2, 
  Plus, 
  Trash2, 
  Save, 
  Play, 
  AlertCircle, 
  Clock, 
  FileText, 
  Mail, 
  User, 
  CheckCircle2, 
  XCircle,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { showSuccessToast, showInfoToast, showWarningToast } from '@/lib/toast';

// Types for automation rules
interface Condition {
  id: string;
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'exists' | 'notExists';
  value: string;
}

interface Action {
  id: string;
  type: 'updateStatus' | 'assignUser' | 'sendEmail' | 'createTask' | 'triggerProcess' | 'updateField';
  config: {
    [key: string]: any;
  };
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  triggerType: 'onStatusChange' | 'onFieldUpdate' | 'onSchedule' | 'onProcessCompletion';
  triggerConfig: {
    [key: string]: any;
  };
  conditions: Condition[];
  actions: Action[];
  isActive: boolean;
  workflowId?: string;
  stageId?: string;
  subStageId?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  executionCount: number;
  lastExecuted?: Date;
}

// Sample data for dropdowns
const sampleWorkflows = [
  { id: 'wf-level-001', name: 'Daily Named PnL' },
  { id: 'wf-level-002', name: 'Rates' },
  { id: 'wf-level-003', name: 'eRates' }
];

const sampleStages = [
  { id: 'stage-1', name: 'Data Collection' },
  { id: 'stage-2', name: 'Data Validation' },
  { id: 'stage-3', name: 'Calculation' },
  { id: 'stage-4', name: 'Review' },
  { id: 'stage-5', name: 'Approval' }
];

const sampleSubStages = [
  { id: 'substage-1', name: 'Extract Source Data' },
  { id: 'substage-2', name: 'Transform Data' },
  { id: 'substage-3', name: 'Load Data' },
  { id: 'substage-4', name: 'Validate Data Quality' },
  { id: 'substage-5', name: 'Run Calculations' }
];

const sampleUsers = [
  { id: 'user-1', name: 'John Smith' },
  { id: 'user-2', name: 'Jane Doe' },
  { id: 'user-3', name: 'Robert Johnson' },
  { id: 'user-4', name: 'Emily Davis' }
];

const sampleFields = [
  { id: 'field-1', name: 'status' },
  { id: 'field-2', name: 'assignedTo' },
  { id: 'field-3', name: 'priority' },
  { id: 'field-4', name: 'dueDate' },
  { id: 'field-5', name: 'completionTime' }
];

// Sample automation rules
const sampleAutomationRules: AutomationRule[] = [
  {
    id: '1',
    name: 'Auto-Approve Low Risk Items',
    description: 'Automatically approve items with risk score below threshold',
    triggerType: 'onFieldUpdate',
    triggerConfig: {
      field: 'riskScore'
    },
    conditions: [
      {
        id: 'c1',
        field: 'riskScore',
        operator: 'lessThan',
        value: '3'
      }
    ],
    actions: [
      {
        id: 'a1',
        type: 'updateStatus',
        config: {
          status: 'Approved'
        }
      }
    ],
    isActive: true,
    workflowId: 'wf-level-001',
    stageId: 'stage-4',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
    createdBy: 'John Smith',
    executionCount: 247,
    lastExecuted: new Date('2023-05-19T14:30:00')
  },
  {
    id: '2',
    name: 'Escalate Delayed Tasks',
    description: 'Escalate tasks that are pending for more than 4 hours',
    triggerType: 'onSchedule',
    triggerConfig: {
      schedule: '0 */1 * * *' // Every hour
    },
    conditions: [
      {
        id: 'c1',
        field: 'status',
        operator: 'equals',
        value: 'Pending'
      },
      {
        id: 'c2',
        field: 'createdAt',
        operator: 'lessThan',
        value: '4h'
      }
    ],
    actions: [
      {
        id: 'a1',
        type: 'sendEmail',
        config: {
          template: 'task-escalation',
          to: ['manager@example.com']
        }
      },
      {
        id: 'a2',
        type: 'updateField',
        config: {
          field: 'priority',
          value: 'High'
        }
      }
    ],
    isActive: true,
    workflowId: 'wf-level-002',
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-03-05'),
    createdBy: 'Jane Doe',
    executionCount: 89,
    lastExecuted: new Date('2023-05-19T15:00:00')
  },
  {
    id: '3',
    name: 'Auto-Assign Data Validation Tasks',
    description: 'Automatically assign data validation tasks to available validators',
    triggerType: 'onStatusChange',
    triggerConfig: {
      fromStatus: 'Created',
      toStatus: 'Ready'
    },
    conditions: [
      {
        id: 'c1',
        field: 'type',
        operator: 'equals',
        value: 'DataValidation'
      }
    ],
    actions: [
      {
        id: 'a1',
        type: 'assignUser',
        config: {
          userSelectionStrategy: 'roundRobin',
          userPool: ['user-1', 'user-2', 'user-3']
        }
      },
      {
        id: 'a2',
        type: 'updateStatus',
        config: {
          status: 'Assigned'
        }
      }
    ],
    isActive: false,
    workflowId: 'wf-level-001',
    stageId: 'stage-2',
    subStageId: 'substage-4',
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2023-04-15'),
    createdBy: 'Robert Johnson',
    executionCount: 156,
    lastExecuted: new Date('2023-05-18T09:15:00')
  }
];

export const WorkflowAutomationBuilder = () => {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(sampleAutomationRules);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('rules');
  
  // New rule template
  const newRuleTemplate: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'executionCount'> = {
    name: '',
    description: '',
    triggerType: 'onStatusChange',
    triggerConfig: {},
    conditions: [],
    actions: [],
    isActive: false
  };
  
  const [currentRule, setCurrentRule] = useState<Partial<AutomationRule>>(newRuleTemplate);
  
  const selectedRule = selectedRuleId 
    ? automationRules.find(rule => rule.id === selectedRuleId) 
    : null;
  
  const handleSelectRule = (ruleId: string) => {
    setSelectedRuleId(ruleId);
    setEditMode(false);
    setActiveTab('details');
  };
  
  const handleCreateNewRule = () => {
    setSelectedRuleId(null);
    setCurrentRule({
      ...newRuleTemplate,
      name: `New Rule ${automationRules.length + 1}`
    });
    setEditMode(true);
    setActiveTab('details');
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
        setAutomationRules(prevRules => 
          prevRules.map(rule => 
            rule.id === selectedRuleId 
              ? {
                  ...rule,
                  ...currentRule as AutomationRule,
                  updatedAt: new Date()
                } 
              : rule
          )
        );
        showSuccessToast("Rule updated successfully");
      } else {
        // Create new rule
        const newRule: AutomationRule = {
          ...(currentRule as Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'executionCount'>),
          id: `rule-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'Current User',
          executionCount: 0
        };
        setAutomationRules(prevRules => [...prevRules, newRule]);
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
      setAutomationRules(prevRules => prevRules.filter(rule => rule.id !== selectedRuleId));
      setSelectedRuleId(null);
      setActiveTab('rules');
      showInfoToast("Rule deleted");
    }
  };
  
  const handleToggleRuleActive = (ruleId: string, isActive: boolean) => {
    setAutomationRules(prevRules => 
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
      const newCondition: Condition = {
        id: `cond-${Date.now()}`,
        field: '',
        operator: 'equals',
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
  
  const handleUpdateCondition = (conditionId: string, field: keyof Condition, value: any) => {
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
      const newAction: Action = {
        id: `act-${Date.now()}`,
        type: 'updateStatus',
        config: {}
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
  
  const handleUpdateAction = (actionId: string, field: keyof Action, value: any) => {
    if (editMode) {
      setCurrentRule(prev => ({
        ...prev,
        actions: (prev.actions || []).map(a => 
          a.id === actionId ? { ...a, [field]: value } : a
        )
      }));
    }
  };
  
  const handleUpdateActionConfig = (actionId: string, configKey: string, configValue: any) => {
    if (editMode) {
      setCurrentRule(prev => ({
        ...prev,
        actions: (prev.actions || []).map(a => 
          a.id === actionId 
            ? { 
                ...a, 
                config: { 
                  ...a.config, 
                  [configKey]: configValue 
                } 
              } 
            : a
        )
      }));
    }
  };
  
  const handleTestRule = (ruleId: string) => {
    showInfoToast("Rule test initiated. This would validate the rule against historical data.");
  };
  
  const handleRunRule = (ruleId: string) => {
    showInfoToast("Rule execution initiated. This would run the rule immediately.");
  };
  
  const renderTriggerConfig = () => {
    if (!editMode) return null;
    
    switch (currentRule.triggerType) {
      case 'onStatusChange':
        return (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium">From Status</label>
              <Select 
                value={currentRule.triggerConfig?.fromStatus || ''}
                onValueChange={(value) => setCurrentRule(prev => ({
                  ...prev,
                  triggerConfig: { ...prev.triggerConfig, fromStatus: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Created">Created</SelectItem>
                  <SelectItem value="Ready">Ready</SelectItem>
                  <SelectItem value="InProgress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">To Status</label>
              <Select 
                value={currentRule.triggerConfig?.toStatus || ''}
                onValueChange={(value) => setCurrentRule(prev => ({
                  ...prev,
                  triggerConfig: { ...prev.triggerConfig, toStatus: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ready">Ready</SelectItem>
                  <SelectItem value="InProgress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      case 'onFieldUpdate':
        return (
          <div className="mt-4">
            <label className="text-sm font-medium">Field</label>
            <Select 
              value={currentRule.triggerConfig?.field || ''}
              onValueChange={(value) => setCurrentRule(prev => ({
                ...prev,
                triggerConfig: { ...prev.triggerConfig, field: value }
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {sampleFields.map(field => (
                  <SelectItem key={field.id} value={field.name}>{field.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
        
      case 'onSchedule':
        return (
          <div className="mt-4">
            <label className="text-sm font-medium">Schedule (Cron Expression)</label>
            <Input 
              value={currentRule.triggerConfig?.schedule || ''}
              onChange={(e) => setCurrentRule(prev => ({
                ...prev,
                triggerConfig: { ...prev.triggerConfig, schedule: e.target.value }
              }))}
              placeholder="0 */1 * * *"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Example: "0 */1 * * *" runs every hour
            </p>
          </div>
        );
        
      case 'onProcessCompletion':
        return (
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium">Process Type</label>
              <Select 
                value={currentRule.triggerConfig?.processType || ''}
                onValueChange={(value) => setCurrentRule(prev => ({
                  ...prev,
                  triggerConfig: { ...prev.triggerConfig, processType: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select process type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DataCollection">Data Collection</SelectItem>
                  <SelectItem value="Calculation">Calculation</SelectItem>
                  <SelectItem value="Validation">Validation</SelectItem>
                  <SelectItem value="Approval">Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  const renderConditionFields = (condition: Condition) => {
    return (
      <div key={condition.id} className="grid grid-cols-12 gap-2 items-center mb-2">
        <div className="col-span-4">
          <Select 
            value={condition.field}
            onValueChange={(value) => handleUpdateCondition(condition.id, 'field', value)}
            disabled={!editMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {sampleFields.map(field => (
                <SelectItem key={field.id} value={field.name}>{field.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="col-span-3">
          <Select 
            value={condition.operator}
            onValueChange={(value) => handleUpdateCondition(condition.id, 'operator', value)}
            disabled={!editMode}
          >
            <SelectTrigger>
              <SelectValue placeholder="Operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equals">equals</SelectItem>
              <SelectItem value="notEquals">not equals</SelectItem>
              <SelectItem value="contains">contains</SelectItem>
              <SelectItem value="greaterThan">greater than</SelectItem>
              <SelectItem value="lessThan">less than</SelectItem>
              <SelectItem value="exists">exists</SelectItem>
              <SelectItem value="notExists">not exists</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="col-span-4">
          <Input 
            value={condition.value}
            onChange={(e) => handleUpdateCondition(condition.id, 'value', e.target.value)}
            placeholder="Value"
            disabled={!editMode || condition.operator === 'exists' || condition.operator === 'notExists'}
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
  
  const renderActionFields = (action: Action) => {
    return (
      <div key={action.id} className="border rounded-md p-3 mb-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex-1">
            <Select 
              value={action.type}
              onValueChange={(value: any) => handleUpdateAction(action.id, 'type', value)}
              disabled={!editMode}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select action type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updateStatus">Update Status</SelectItem>
                <SelectItem value="assignUser">Assign User</SelectItem>
                <SelectItem value="sendEmail">Send Email</SelectItem>
                <SelectItem value="createTask">Create Task</SelectItem>
                <SelectItem value="triggerProcess">Trigger Process</SelectItem>
                <SelectItem value="updateField">Update Field</SelectItem>
              </SelectContent>
            </Select>
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
        
        {/* Render different config fields based on action type */}
        {action.type === 'updateStatus' && (
          <div className="mt-2">
            <label className="text-sm font-medium">Status</label>
            <Select 
              value={action.config?.status || ''}
              onValueChange={(value) => handleUpdateActionConfig(action.id, 'status', value)}
              disabled={!editMode}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ready">Ready</SelectItem>
                <SelectItem value="InProgress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {action.type === 'assignUser' && (
          <div className="mt-2 space-y-2">
            <label className="text-sm font-medium">Assignment Strategy</label>
            <Select 
              value={action.config?.userSelectionStrategy || ''}
              onValueChange={(value) => handleUpdateActionConfig(action.id, 'userSelectionStrategy', value)}
              disabled={!editMode}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="specific">Specific User</SelectItem>
                <SelectItem value="roundRobin">Round Robin</SelectItem>
                <SelectItem value="leastBusy">Least Busy</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
            
            {action.config?.userSelectionStrategy === 'specific' && (
              <div>
                <label className="text-sm font-medium">User</label>
                <Select 
                  value={action.config?.userId || ''}
                  onValueChange={(value) => handleUpdateActionConfig(action.id, 'userId', value)}
                  disabled={!editMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
        
        {action.type === 'sendEmail' && (
          <div className="mt-2 space-y-2">
            <label className="text-sm font-medium">Email Template</label>
            <Select 
              value={action.config?.template || ''}
              onValueChange={(value) => handleUpdateActionConfig(action.id, 'template', value)}
              disabled={!editMode}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="task-assignment">Task Assignment</SelectItem>
                <SelectItem value="task-reminder">Task Reminder</SelectItem>
                <SelectItem value="task-escalation">Task Escalation</SelectItem>
                <SelectItem value="approval-request">Approval Request</SelectItem>
                <SelectItem value="status-update">Status Update</SelectItem>
              </SelectContent>
            </Select>
            
            <label className="text-sm font-medium">Recipients</label>
            <Input 
              value={action.config?.to?.join(', ') || ''}
              onChange={(e) => handleUpdateActionConfig(action.id, 'to', e.target.value.split(',').map(email => email.trim()))}
              placeholder="email@example.com, another@example.com"
              disabled={!editMode}
            />
          </div>
        )}
        
        {action.type === 'updateField' && (
          <div className="mt-2 space-y-2">
            <label className="text-sm font-medium">Field</label>
            <Select 
              value={action.config?.field || ''}
              onValueChange={(value) => handleUpdateActionConfig(action.id, 'field', value)}
              disabled={!editMode}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {sampleFields.map(field => (
                  <SelectItem key={field.id} value={field.name}>{field.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <label className="text-sm font-medium">Value</label>
            <Input 
              value={action.config?.value || ''}
              onChange={(e) => handleUpdateActionConfig(action.id, 'value', e.target.value)}
              placeholder="New value"
              disabled={!editMode}
            />
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
            <Wand2 className="h-5 w-5 text-primary" />
            <CardTitle>Workflow Automation Builder</CardTitle>
            <Badge variant="outline" className="ml-2 bg-primary/10">
              <Sparkles className="h-3 w-3 mr-1" />
              Experimental
            </Badge>
          </div>
          <CardDescription>
            Create intelligent automation rules to streamline your workflows
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow overflow-auto p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="border-b px-4">
              <TabsList className="w-full justify-start h-12">
                <TabsTrigger value="rules" className="data-[state=active]:bg-primary/5">
                  Rules Library
                </TabsTrigger>
                <TabsTrigger value="details" className="data-[state=active]:bg-primary/5" disabled={!selectedRule && !editMode}>
                  Rule Details
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-primary/5" disabled={!selectedRule}>
                  Execution History
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="h-[calc(100%-3rem)] overflow-auto">
              <TabsContent value="rules" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Automation Rules</h3>
                  <Button onClick={handleCreateNewRule}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Rule
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {automationRules.map(rule => (
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
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTestRule(rule.id);
                            }}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {rule.triggerType === 'onStatusChange' && 'Status Change'}
                          {rule.triggerType === 'onFieldUpdate' && 'Field Update'}
                          {rule.triggerType === 'onSchedule' && 'Scheduled'}
                          {rule.triggerType === 'onProcessCompletion' && 'Process Completion'}
                        </Badge>
                        
                        {rule.workflowId && (
                          <Badge variant="outline" className="text-xs">
                            {sampleWorkflows.find(w => w.id === rule.workflowId)?.name || rule.workflowId}
                          </Badge>
                        )}
                        
                        <Badge variant="outline" className="text-xs">
                          {rule.executionCount} executions
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
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
                      
                      {/* Scope Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                        <div>
                          <label className="text-sm font-medium">Workflow</label>
                          <Select 
                            value={editMode ? currentRule.workflowId : selectedRule?.workflowId}
                            onValueChange={(value) => editMode && setCurrentRule(prev => ({ ...prev, workflowId: value }))}
                            disabled={!editMode}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select workflow" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Any Workflow</SelectItem>
                              {sampleWorkflows.map(workflow => (
                                <SelectItem key={workflow.id} value={workflow.id}>{workflow.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Stage</label>
                          <Select 
                            value={editMode ? currentRule.stageId : selectedRule?.stageId}
                            onValueChange={(value) => editMode && setCurrentRule(prev => ({ ...prev, stageId: value }))}
                            disabled={!editMode || !currentRule.workflowId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Any Stage</SelectItem>
                              {sampleStages.map(stage => (
                                <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Sub-Stage</label>
                          <Select 
                            value={editMode ? currentRule.subStageId : selectedRule?.subStageId}
                            onValueChange={(value) => editMode && setCurrentRule(prev => ({ ...prev, subStageId: value }))}
                            disabled={!editMode || !currentRule.stageId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select sub-stage" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Any Sub-Stage</SelectItem>
                              {sampleSubStages.map(subStage => (
                                <SelectItem key={subStage.id} value={subStage.id}>{subStage.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {/* Trigger Configuration */}
                      <div className="pt-4">
                        <h4 className="font-medium mb-2">Trigger</h4>
                        <Select 
                          value={editMode ? currentRule.triggerType : selectedRule?.triggerType}
                          onValueChange={(value: any) => editMode && setCurrentRule(prev => ({ 
                            ...prev, 
                            triggerType: value,
                            triggerConfig: {} // Reset config when changing trigger type
                          }))}
                          disabled={!editMode}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select trigger type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="onStatusChange">On Status Change</SelectItem>
                            <SelectItem value="onFieldUpdate">On Field Update</SelectItem>
                            <SelectItem value="onSchedule">On Schedule</SelectItem>
                            <SelectItem value="onProcessCompletion">On Process Completion</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {editMode 
                          ? renderTriggerConfig() 
                          : (
                            <div className="mt-2 text-sm">
                              {selectedRule?.triggerType === 'onStatusChange' && (
                                <p>Triggers when status changes from "{selectedRule.triggerConfig?.fromStatus}" to "{selectedRule.triggerConfig?.toStatus}"</p>
                              )}
                              {selectedRule?.triggerType === 'onFieldUpdate' && (
                                <p>Triggers when field "{selectedRule.triggerConfig?.field}" is updated</p>
                              )}
                              {selectedRule?.triggerType === 'onSchedule' && (
                                <p>Triggers on schedule: {selectedRule.triggerConfig?.schedule}</p>
                              )}
                              {selectedRule?.triggerType === 'onProcessCompletion' && (
                                <p>Triggers when a process of type "{selectedRule.triggerConfig?.processType}" completes</p>
                              )}
                            </div>
                          )
                        }
                      </div>
                      
                      {/* Conditions */}
                      <div className="pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Conditions</h4>
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
                          <p className="text-sm text-muted-foreground">No conditions defined. This rule will apply to all matching items.</p>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Actions</h4>
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
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="history" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                {selectedRule && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Execution History</h3>
                      <Button 
                        variant="outline" 
                        onClick={() => handleRunRule(selectedRule.id)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Run Now
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="border rounded-md p-3 bg-muted/50">
                        <p className="text-sm text-muted-foreground">Total Executions</p>
                        <p className="text-2xl font-bold">{selectedRule.executionCount}</p>
                      </div>
                      
                      <div className="border rounded-md p-3 bg-muted/50">
                        <p className="text-sm text-muted-foreground">Last Executed</p>
                        <p className="text-2xl font-bold">
                          {selectedRule.lastExecuted 
                            ? new Date(selectedRule.lastExecuted).toLocaleString() 
                            : 'Never'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="border rounded-md">
                      <div className="grid grid-cols-12 gap-2 p-3 border-b font-medium text-sm">
                        <div className="col-span-2">Date & Time</div>
                        <div className="col-span-2">Workflow</div>
                        <div className="col-span-2">Stage</div>
                        <div className="col-span-2">Trigger</div>
                        <div className="col-span-2">Result</div>
                        <div className="col-span-2">Duration</div>
                      </div>
                      
                      {/* Sample execution history */}
                      {[...Array(5)].map((_, i) => {
                        const date = new Date();
                        date.setHours(date.getHours() - i);
                        
                        return (
                          <div key={i} className="grid grid-cols-12 gap-2 p-3 border-b text-sm hover:bg-muted/50">
                            <div className="col-span-2">{date.toLocaleString()}</div>
                            <div className="col-span-2">
                              {selectedRule.workflowId 
                                ? sampleWorkflows.find(w => w.id === selectedRule.workflowId)?.name 
                                : 'Various'}
                            </div>
                            <div className="col-span-2">
                              {selectedRule.stageId 
                                ? sampleStages.find(s => s.id === selectedRule.stageId)?.name 
                                : 'Various'}
                            </div>
                            <div className="col-span-2">
                              {selectedRule.triggerType === 'onStatusChange' && 'Status Change'}
                              {selectedRule.triggerType === 'onFieldUpdate' && 'Field Update'}
                              {selectedRule.triggerType === 'onSchedule' && 'Scheduled'}
                              {selectedRule.triggerType === 'onProcessCompletion' && 'Process Completion'}
                            </div>
                            <div className="col-span-2">
                              <Badge variant={i % 3 === 0 ? 'destructive' : 'default'}>
                                {i % 3 === 0 ? 'Failed' : 'Success'}
                              </Badge>
                            </div>
                            <div className="col-span-2">{(Math.random() * 2).toFixed(2)}s</div>
                          </div>
                        );
                      })}
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