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
  FileJson,
  RefreshCw,
  Download,
  Upload,
  Eye
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

// Types for Drools rules
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

interface DroolsRule {
  id: string;
  name: string;
  description: string;
  packageName: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  drl?: string; // The actual Drools Rule Language content
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

// Sample data
const sampleRules: DroolsRule[] = [
  {
    id: 'rule-1',
    name: 'High Value Transaction Approval',
    description: 'Automatically route high value transactions for additional approval',
    packageName: 'com.steps.finance.rules',
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
    drl: `package com.steps.finance.rules;

import com.steps.finance.model.Transaction;
import com.steps.finance.model.ApprovalRequest;

rule "High Value Transaction Approval"
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
    packageName: 'com.steps.finance.rules',
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
    drl: `package com.steps.finance.rules;

import com.steps.finance.model.Transaction;
import com.steps.finance.model.Customer;
import com.steps.finance.model.ReviewRequest;
import com.steps.finance.model.Event;

rule "Suspicious Activity Detection"
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
    packageName: 'com.steps.finance.rules',
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
    drl: `package com.steps.finance.rules;

import com.steps.finance.model.Customer;
import com.steps.finance.model.LimitAdjustment;
import com.steps.finance.model.Notification;

rule "Automated Limit Adjustment"
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
    name: 'Product',
    fields: [
      { name: 'id', type: 'String' },
      { name: 'name', type: 'String' },
      { name: 'category', type: 'String' },
      { name: 'riskLevel', type: 'String' }
    ]
  }
];

export const DroolsRulesEngine = () => {
  const [rules, setRules] = useState<DroolsRule[]>(sampleRules);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('rules');
  const [testInput, setTestInput] = useState<string>('{\n  "transaction": {\n    "id": "TX123456",\n    "amount": 1500000,\n    "type": "TRADE",\n    "date": "2023-05-19"\n  },\n  "customer": {\n    "id": "CUST789",\n    "riskScore": 85,\n    "accountAge": 730,\n    "tradingVolume": 12000000,\n    "currentLimit": 3000000\n  }\n}');
  const [testOutput, setTestOutput] = useState<string>('');
  const [executions, setExecutions] = useState<RuleExecution[]>(sampleExecutions);
  
  // New rule template
  const newRuleTemplate: Omit<DroolsRule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
    name: '',
    description: '',
    packageName: 'com.steps.finance.rules',
    conditions: [],
    actions: [],
    priority: 0,
    isActive: false,
    drl: ''
  };
  
  const [currentRule, setCurrentRule] = useState<Partial<DroolsRule>>(newRuleTemplate);
  
  const selectedRule = selectedRuleId 
    ? rules.find(rule => rule.id === selectedRuleId) 
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
      name: `New Rule ${rules.length + 1}`
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
        setRules(prevRules => 
          prevRules.map(rule => 
            rule.id === selectedRuleId 
              ? {
                  ...rule,
                  ...currentRule as DroolsRule,
                  updatedAt: new Date()
                } 
              : rule
          )
        );
        showSuccessToast("Rule updated successfully");
      } else {
        // Create new rule
        const newRule: DroolsRule = {
          ...(currentRule as Omit<DroolsRule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>),
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
  
  const handleGenerateDRL = () => {
    if (currentRule.name && currentRule.packageName && currentRule.conditions && currentRule.conditions.length > 0) {
      // Generate DRL from the rule definition
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
      
      const drl = `package ${currentRule.packageName};

import com.steps.finance.model.*;

rule "${currentRule.name}"
    when
        $fact : Object(${conditionsStr})
    then
${actionsStr}
end`;
      
      setCurrentRule(prev => ({
        ...prev,
        drl
      }));
      
      showSuccessToast("DRL generated successfully");
    } else {
      showWarningToast("Please provide rule name, package, and at least one condition");
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
  
  const handleExportRule = () => {
    if (selectedRule) {
      const dataStr = JSON.stringify(selectedRule, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileDefaultName = `${selectedRule.name.replace(/\s+/g, '_')}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      showSuccessToast("Rule exported successfully");
    }
  };
  
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
            <Code className="h-5 w-5 text-primary" />
            <CardTitle>Drools Rules Engine</CardTitle>
            <Badge variant="outline" className="ml-2 bg-primary/10">
              <Sparkles className="h-3 w-3 mr-1" />
              Experimental
            </Badge>
          </div>
          <CardDescription>
            Create and manage business rules using the Drools Rules Engine
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
                <TabsTrigger value="test" className="data-[state=active]:bg-primary/5" disabled={!selectedRule}>
                  Test Bench
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-primary/5">
                  Execution History
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="h-[calc(100%-3rem)] overflow-auto">
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
                          {rule.packageName}
                        </Badge>
                        
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
                            <Button variant="outline" onClick={handleExportRule}>
                              <Download className="h-4 w-4 mr-2" />
                              Export
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
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Package Name</label>
                          <Input 
                            value={editMode ? currentRule.packageName : selectedRule?.packageName}
                            onChange={(e) => editMode && setCurrentRule(prev => ({ ...prev, packageName: e.target.value }))}
                            disabled={!editMode}
                            placeholder="e.g. com.steps.finance.rules"
                          />
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
                      
                      {/* DRL Code */}
                      <div className="pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Drools Rule Language (DRL)</h4>
                          {editMode && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleGenerateDRL}
                            >
                              <FileCode className="h-3 w-3 mr-1" />
                              Generate DRL
                            </Button>
                          )}
                        </div>
                        
                        <div className="border rounded-md bg-muted/50">
                          <Textarea 
                            value={editMode ? currentRule.drl : selectedRule?.drl}
                            onChange={(e) => editMode && setCurrentRule(prev => ({ ...prev, drl: e.target.value }))}
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
              
              <TabsContent value="test" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                {selectedRule && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Test Rule: {selectedRule.name}</h3>
                      <Button 
                        onClick={handleTestRule}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Run Test
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Input Facts (JSON)</h4>
                        <Textarea 
                          value={testInput}
                          onChange={(e) => setTestInput(e.target.value)}
                          rows={15}
                          className="font-mono text-sm"
                        />
                        
                        <div className="mt-4">
                          <h5 className="text-sm font-medium mb-2">Sample Fact Templates</h5>
                          <div className="flex flex-wrap gap-2">
                            {sampleFactTypes.map((factType, index) => (
                              <Button 
                                key={index} 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  const template = {
                                    [factType.name.toLowerCase()]: Object.fromEntries(
                                      factType.fields.map(field => [
                                        field.name, 
                                        field.type === 'String' ? `"Sample ${field.name}"` :
                                        field.type === 'Double' ? 1000.0 :
                                        field.type === 'Integer' ? 100 : ''
                                      ])
                                    )
                                  };
                                  
                                  // Merge with existing input if possible
                                  try {
                                    const currentInput = JSON.parse(testInput);
                                    setTestInput(JSON.stringify({ ...currentInput, ...template }, null, 2));
                                  } catch {
                                    setTestInput(JSON.stringify(template, null, 2));
                                  }
                                }}
                              >
                                {factType.name}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Output Results</h4>
                        <div className="border rounded-md bg-muted/50 p-4 h-[calc(100%-2rem)] overflow-auto">
                          <pre className="font-mono text-sm whitespace-pre-wrap">
                            {testOutput || 'Run the test to see results here'}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="history" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Execution History</h3>
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
                              onClick={() => {
                                setTestInput(JSON.stringify(execution.input, null, 2));
                                setTestOutput(JSON.stringify(execution.output, null, 2));
                                if (execution.ruleId) {
                                  setSelectedRuleId(execution.ruleId);
                                }
                                setActiveTab('test');
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const dataStr = JSON.stringify({
                                  execution: {
                                    timestamp: execution.timestamp,
                                    ruleName: execution.ruleName,
                                    input: execution.input,
                                    output: execution.output,
                                    duration: execution.duration,
                                    success: execution.success,
                                    message: execution.message
                                  }
                                }, null, 2);
                                const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
                                
                                const exportFileDefaultName = `execution-${execution.id}.json`;
                                
                                const linkElement = document.createElement('a');
                                linkElement.setAttribute('href', dataUri);
                                linkElement.setAttribute('download', exportFileDefaultName);
                                linkElement.click();
                              }}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Export
                            </Button>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
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