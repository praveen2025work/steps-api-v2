import React, { useState } from 'react';
import { 
  Library, 
  Plus, 
  Copy, 
  Trash2, 
  Edit, 
  Search, 
  Tag, 
  Star, 
  StarOff, 
  Filter, 
  Download, 
  Upload, 
  Share2, 
  Sparkles,
  FileText,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Workflow
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { showSuccessToast, showInfoToast, showWarningToast } from '@/lib/toast';

// Types for workflow templates
interface TemplateStage {
  id: string;
  name: string;
  description: string;
  type: 'manual' | 'auto';
  estimatedDuration: number; // in minutes
  order: number;
  subStages: TemplateSubStage[];
}

interface TemplateSubStage {
  id: string;
  name: string;
  description: string;
  type: 'manual' | 'auto';
  estimatedDuration: number; // in minutes
  order: number;
  requiresApproval: boolean;
  requiresAttestation: boolean;
  requiresUpload: boolean;
}

interface TemplateParameter {
  id: string;
  name: string;
  description: string;
  dataType: 'string' | 'number' | 'boolean' | 'date';
  isRequired: boolean;
  defaultValue?: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  stages: TemplateStage[];
  parameters: TemplateParameter[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isStarred: boolean;
  usageCount: number;
  lastUsed?: Date;
  version: string;
  isPublic: boolean;
}

// Sample data
const sampleTemplates: WorkflowTemplate[] = [
  {
    id: 'template-1',
    name: 'Daily PnL Calculation',
    description: 'Standard workflow template for daily profit and loss calculations',
    category: 'Finance',
    tags: ['PnL', 'Daily', 'Finance'],
    stages: [
      {
        id: 'stage-1',
        name: 'Data Collection',
        description: 'Collect data from various sources',
        type: 'auto',
        estimatedDuration: 30,
        order: 1,
        subStages: [
          {
            id: 'substage-1',
            name: 'Extract Market Data',
            description: 'Extract market data from external providers',
            type: 'auto',
            estimatedDuration: 15,
            order: 1,
            requiresApproval: false,
            requiresAttestation: false,
            requiresUpload: false
          },
          {
            id: 'substage-2',
            name: 'Extract Position Data',
            description: 'Extract position data from internal systems',
            type: 'auto',
            estimatedDuration: 15,
            order: 2,
            requiresApproval: false,
            requiresAttestation: false,
            requiresUpload: false
          }
        ]
      },
      {
        id: 'stage-2',
        name: 'Data Validation',
        description: 'Validate collected data for accuracy and completeness',
        type: 'manual',
        estimatedDuration: 45,
        order: 2,
        subStages: [
          {
            id: 'substage-3',
            name: 'Validate Market Data',
            description: 'Validate market data for accuracy',
            type: 'manual',
            estimatedDuration: 20,
            order: 1,
            requiresApproval: true,
            requiresAttestation: true,
            requiresUpload: false
          },
          {
            id: 'substage-4',
            name: 'Validate Position Data',
            description: 'Validate position data for completeness',
            type: 'manual',
            estimatedDuration: 25,
            order: 2,
            requiresApproval: true,
            requiresAttestation: true,
            requiresUpload: false
          }
        ]
      },
      {
        id: 'stage-3',
        name: 'Calculation',
        description: 'Perform PnL calculations',
        type: 'auto',
        estimatedDuration: 60,
        order: 3,
        subStages: [
          {
            id: 'substage-5',
            name: 'Run PnL Models',
            description: 'Execute PnL calculation models',
            type: 'auto',
            estimatedDuration: 45,
            order: 1,
            requiresApproval: false,
            requiresAttestation: false,
            requiresUpload: false
          },
          {
            id: 'substage-6',
            name: 'Generate Reports',
            description: 'Generate PnL reports',
            type: 'auto',
            estimatedDuration: 15,
            order: 2,
            requiresApproval: false,
            requiresAttestation: false,
            requiresUpload: false
          }
        ]
      },
      {
        id: 'stage-4',
        name: 'Review & Approval',
        description: 'Review and approve PnL results',
        type: 'manual',
        estimatedDuration: 90,
        order: 4,
        subStages: [
          {
            id: 'substage-7',
            name: 'Analyst Review',
            description: 'Initial review by analysts',
            type: 'manual',
            estimatedDuration: 30,
            order: 1,
            requiresApproval: true,
            requiresAttestation: true,
            requiresUpload: false
          },
          {
            id: 'substage-8',
            name: 'Manager Approval',
            description: 'Final approval by managers',
            type: 'manual',
            estimatedDuration: 60,
            order: 2,
            requiresApproval: true,
            requiresAttestation: true,
            requiresUpload: true
          }
        ]
      }
    ],
    parameters: [
      {
        id: 'param-1',
        name: 'businessDate',
        description: 'Business date for the PnL calculation',
        dataType: 'date',
        isRequired: true
      },
      {
        id: 'param-2',
        name: 'region',
        description: 'Region for the PnL calculation',
        dataType: 'string',
        isRequired: true,
        defaultValue: 'GLOBAL'
      },
      {
        id: 'param-3',
        name: 'includeAdjustments',
        description: 'Whether to include manual adjustments',
        dataType: 'boolean',
        isRequired: false,
        defaultValue: 'true'
      }
    ],
    createdBy: 'John Smith',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-03-20'),
    isStarred: true,
    usageCount: 247,
    lastUsed: new Date('2023-05-19'),
    version: '1.3.0',
    isPublic: true
  },
  {
    id: 'template-2',
    name: 'Month-End Reconciliation',
    description: 'Comprehensive workflow for month-end financial reconciliation',
    category: 'Finance',
    tags: ['Reconciliation', 'Month-End', 'Finance'],
    stages: [
      {
        id: 'stage-1',
        name: 'Data Collection',
        description: 'Collect data from various sources',
        type: 'auto',
        estimatedDuration: 60,
        order: 1,
        subStages: [
          {
            id: 'substage-1',
            name: 'Extract GL Data',
            description: 'Extract general ledger data',
            type: 'auto',
            estimatedDuration: 30,
            order: 1,
            requiresApproval: false,
            requiresAttestation: false,
            requiresUpload: false
          },
          {
            id: 'substage-2',
            name: 'Extract Sub-Ledger Data',
            description: 'Extract sub-ledger data',
            type: 'auto',
            estimatedDuration: 30,
            order: 2,
            requiresApproval: false,
            requiresAttestation: false,
            requiresUpload: false
          }
        ]
      },
      {
        id: 'stage-2',
        name: 'Reconciliation',
        description: 'Reconcile GL and sub-ledger data',
        type: 'manual',
        estimatedDuration: 120,
        order: 2,
        subStages: [
          {
            id: 'substage-3',
            name: 'Identify Discrepancies',
            description: 'Identify discrepancies between GL and sub-ledgers',
            type: 'auto',
            estimatedDuration: 45,
            order: 1,
            requiresApproval: false,
            requiresAttestation: false,
            requiresUpload: false
          },
          {
            id: 'substage-4',
            name: 'Resolve Discrepancies',
            description: 'Manually resolve identified discrepancies',
            type: 'manual',
            estimatedDuration: 75,
            order: 2,
            requiresApproval: true,
            requiresAttestation: true,
            requiresUpload: true
          }
        ]
      },
      {
        id: 'stage-3',
        name: 'Approval',
        description: 'Obtain approvals for reconciliation',
        type: 'manual',
        estimatedDuration: 90,
        order: 3,
        subStages: [
          {
            id: 'substage-5',
            name: 'Supervisor Review',
            description: 'Review by supervisor',
            type: 'manual',
            estimatedDuration: 30,
            order: 1,
            requiresApproval: true,
            requiresAttestation: true,
            requiresUpload: false
          },
          {
            id: 'substage-6',
            name: 'Controller Approval',
            description: 'Final approval by controller',
            type: 'manual',
            estimatedDuration: 60,
            order: 2,
            requiresApproval: true,
            requiresAttestation: true,
            requiresUpload: false
          }
        ]
      }
    ],
    parameters: [
      {
        id: 'param-1',
        name: 'monthEndDate',
        description: 'Month-end date for reconciliation',
        dataType: 'date',
        isRequired: true
      },
      {
        id: 'param-2',
        name: 'entityCode',
        description: 'Entity code for reconciliation',
        dataType: 'string',
        isRequired: true
      },
      {
        id: 'param-3',
        name: 'toleranceAmount',
        description: 'Tolerance amount for discrepancies',
        dataType: 'number',
        isRequired: true,
        defaultValue: '1000'
      }
    ],
    createdBy: 'Jane Doe',
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-04-05'),
    isStarred: false,
    usageCount: 12,
    lastUsed: new Date('2023-05-01'),
    version: '2.1.0',
    isPublic: true
  },
  {
    id: 'template-3',
    name: 'Regulatory Reporting',
    description: 'Workflow template for regulatory reporting compliance',
    category: 'Compliance',
    tags: ['Regulatory', 'Compliance', 'Reporting'],
    stages: [
      {
        id: 'stage-1',
        name: 'Data Preparation',
        description: 'Prepare data for regulatory reporting',
        type: 'auto',
        estimatedDuration: 90,
        order: 1,
        subStages: [
          {
            id: 'substage-1',
            name: 'Extract Regulatory Data',
            description: 'Extract data required for regulatory reporting',
            type: 'auto',
            estimatedDuration: 45,
            order: 1,
            requiresApproval: false,
            requiresAttestation: false,
            requiresUpload: false
          },
          {
            id: 'substage-2',
            name: 'Transform Data',
            description: 'Transform data to regulatory format',
            type: 'auto',
            estimatedDuration: 45,
            order: 2,
            requiresApproval: false,
            requiresAttestation: false,
            requiresUpload: false
          }
        ]
      },
      {
        id: 'stage-2',
        name: 'Validation',
        description: 'Validate regulatory data',
        type: 'manual',
        estimatedDuration: 120,
        order: 2,
        subStages: [
          {
            id: 'substage-3',
            name: 'Automated Validation',
            description: 'Run automated validation checks',
            type: 'auto',
            estimatedDuration: 30,
            order: 1,
            requiresApproval: false,
            requiresAttestation: false,
            requiresUpload: false
          },
          {
            id: 'substage-4',
            name: 'Manual Validation',
            description: 'Perform manual validation checks',
            type: 'manual',
            estimatedDuration: 90,
            order: 2,
            requiresApproval: true,
            requiresAttestation: true,
            requiresUpload: false
          }
        ]
      },
      {
        id: 'stage-3',
        name: 'Approval & Submission',
        description: 'Approve and submit regulatory reports',
        type: 'manual',
        estimatedDuration: 150,
        order: 3,
        subStages: [
          {
            id: 'substage-5',
            name: 'Compliance Review',
            description: 'Review by compliance team',
            type: 'manual',
            estimatedDuration: 60,
            order: 1,
            requiresApproval: true,
            requiresAttestation: true,
            requiresUpload: false
          },
          {
            id: 'substage-6',
            name: 'Executive Approval',
            description: 'Approval by executive',
            type: 'manual',
            estimatedDuration: 60,
            order: 2,
            requiresApproval: true,
            requiresAttestation: true,
            requiresUpload: true
          },
          {
            id: 'substage-7',
            name: 'Regulatory Submission',
            description: 'Submit to regulatory authority',
            type: 'manual',
            estimatedDuration: 30,
            order: 3,
            requiresApproval: true,
            requiresAttestation: true,
            requiresUpload: true
          }
        ]
      }
    ],
    parameters: [
      {
        id: 'param-1',
        name: 'reportingDate',
        description: 'Reporting date',
        dataType: 'date',
        isRequired: true
      },
      {
        id: 'param-2',
        name: 'regulatoryFramework',
        description: 'Regulatory framework (e.g., Basel III, GDPR)',
        dataType: 'string',
        isRequired: true
      },
      {
        id: 'param-3',
        name: 'jurisdiction',
        description: 'Regulatory jurisdiction',
        dataType: 'string',
        isRequired: true
      },
      {
        id: 'param-4',
        name: 'includeSupplementaryInfo',
        description: 'Include supplementary information',
        dataType: 'boolean',
        isRequired: false,
        defaultValue: 'false'
      }
    ],
    createdBy: 'Robert Johnson',
    createdAt: new Date('2023-03-15'),
    updatedAt: new Date('2023-05-10'),
    isStarred: true,
    usageCount: 8,
    lastUsed: new Date('2023-05-15'),
    version: '1.0.2',
    isPublic: false
  }
];

// Categories and tags for filtering
const categories = ['All', 'Finance', 'Compliance', 'Operations', 'Risk', 'IT'];
const tags = ['PnL', 'Daily', 'Month-End', 'Reconciliation', 'Regulatory', 'Compliance', 'Reporting', 'Finance'];

export const WorkflowTemplateLibrary = () => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>(sampleTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showStarredOnly, setShowStarredOnly] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('browse');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState<boolean>(false);
  
  // New template form state
  const [newTemplate, setNewTemplate] = useState<Partial<WorkflowTemplate>>({
    name: '',
    description: '',
    category: 'Finance',
    tags: [],
    stages: [],
    parameters: [],
    isPublic: true
  });
  
  const selectedTemplate = selectedTemplateId 
    ? templates.find(template => template.id === selectedTemplateId) 
    : null;
  
  // Filter templates based on search, category, tags, and starred status
  const filteredTemplates = templates.filter(template => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Category filter
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    
    // Tags filter
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => template.tags.includes(tag));
    
    // Starred filter
    const matchesStarred = !showStarredOnly || template.isStarred;
    
    return matchesSearch && matchesCategory && matchesTags && matchesStarred;
  });
  
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setActiveTab('details');
  };
  
  const handleToggleStarred = (templateId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    setTemplates(prevTemplates => 
      prevTemplates.map(template => 
        template.id === templateId 
          ? { ...template, isStarred: !template.isStarred } 
          : template
      )
    );
  };
  
  const handleCreateTemplate = () => {
    // Validate form
    if (!newTemplate.name || !newTemplate.description || !newTemplate.category) {
      showWarningToast("Please fill in all required fields");
      return;
    }
    
    // Create new template
    const createdTemplate: WorkflowTemplate = {
      id: `template-${Date.now()}`,
      name: newTemplate.name || '',
      description: newTemplate.description || '',
      category: newTemplate.category || 'Finance',
      tags: newTemplate.tags || [],
      stages: newTemplate.stages || [],
      parameters: newTemplate.parameters || [],
      createdBy: 'Current User',
      createdAt: new Date(),
      updatedAt: new Date(),
      isStarred: false,
      usageCount: 0,
      version: '1.0.0',
      isPublic: newTemplate.isPublic || false
    };
    
    setTemplates(prevTemplates => [...prevTemplates, createdTemplate]);
    setIsCreateDialogOpen(false);
    setNewTemplate({
      name: '',
      description: '',
      category: 'Finance',
      tags: [],
      stages: [],
      parameters: [],
      isPublic: true
    });
    
    showSuccessToast("Template created successfully");
    
    // Select the newly created template
    setSelectedTemplateId(createdTemplate.id);
    setActiveTab('details');
  };
  
  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prevTemplates => prevTemplates.filter(template => template.id !== templateId));
    
    if (selectedTemplateId === templateId) {
      setSelectedTemplateId(null);
      setActiveTab('browse');
    }
    
    showInfoToast("Template deleted");
  };
  
  const handleDuplicateTemplate = (templateId: string) => {
    const templateToDuplicate = templates.find(template => template.id === templateId);
    
    if (!templateToDuplicate) return;
    
    const duplicatedTemplate: WorkflowTemplate = {
      ...templateToDuplicate,
      id: `template-${Date.now()}`,
      name: `${templateToDuplicate.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      isStarred: false,
      version: '1.0.0'
    };
    
    setTemplates(prevTemplates => [...prevTemplates, duplicatedTemplate]);
    showSuccessToast("Template duplicated successfully");
    
    // Select the newly duplicated template
    setSelectedTemplateId(duplicatedTemplate.id);
    setActiveTab('details');
  };
  
  const handleExportTemplate = (templateId: string) => {
    const templateToExport = templates.find(template => template.id === templateId);
    
    if (!templateToExport) return;
    
    // In a real app, this would generate a file for download
    // For this demo, we'll just show a toast
    showInfoToast("Template exported. In a real app, this would download a file.");
  };
  
  const handleImportTemplate = () => {
    // In a real app, this would parse an uploaded file
    // For this demo, we'll just show a toast and close the dialog
    showInfoToast("Template imported. In a real app, this would parse an uploaded file.");
    setIsImportDialogOpen(false);
  };
  
  const handleUseTemplate = (templateId: string) => {
    // In a real app, this would start a new workflow instance based on the template
    // For this demo, we'll just show a toast and update the usage count
    setTemplates(prevTemplates => 
      prevTemplates.map(template => 
        template.id === templateId 
          ? { 
              ...template, 
              usageCount: template.usageCount + 1,
              lastUsed: new Date()
            } 
          : template
      )
    );
    
    showSuccessToast("Template applied. A new workflow instance would be created in a real app.");
  };
  
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  
  const calculateTotalDuration = (stages: TemplateStage[]): number => {
    return stages.reduce((total, stage) => total + stage.estimatedDuration, 0);
  };
  
  const calculateAutomationPercentage = (stages: TemplateStage[]): number => {
    const totalDuration = calculateTotalDuration(stages);
    if (totalDuration === 0) return 0;
    
    const autoDuration = stages.reduce((total, stage) => 
      total + (stage.type === 'auto' ? stage.estimatedDuration : 0), 
    0);
    
    return Math.round((autoDuration / totalDuration) * 100);
  };
  
  const renderTemplateCard = (template: WorkflowTemplate) => {
    const automationPercentage = calculateAutomationPercentage(template.stages);
    const totalDuration = calculateTotalDuration(template.stages);
    
    return (
      <div 
        key={template.id}
        className={`border rounded-md p-4 cursor-pointer hover:bg-accent/50 ${selectedTemplateId === template.id ? 'border-primary bg-primary/5' : ''}`}
        onClick={() => handleSelectTemplate(template.id)}
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{template.name}</h3>
              <Badge variant="outline">{template.category}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => handleToggleStarred(template.id, e)}
            className="h-8 w-8"
          >
            {template.isStarred ? (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            ) : (
              <StarOff className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {template.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Stages</span>
            <span className="text-sm font-medium">{template.stages.length}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Duration</span>
            <span className="text-sm font-medium">{formatDuration(totalDuration)}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Automation</span>
            <span className="text-sm font-medium">{automationPercentage}%</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
          <span>v{template.version}</span>
          <span>Used {template.usageCount} times</span>
        </div>
      </div>
    );
  };
  
  const renderTemplateDetails = () => {
    if (!selectedTemplate) return null;
    
    const automationPercentage = calculateAutomationPercentage(selectedTemplate.stages);
    const totalDuration = calculateTotalDuration(selectedTemplate.stages);
    
    return (
      <div>
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{selectedTemplate.name}</h2>
              <Badge variant="outline">{selectedTemplate.category}</Badge>
              {selectedTemplate.isStarred && (
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              )}
            </div>
            <p className="text-muted-foreground mt-1">{selectedTemplate.description}</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExportTemplate(selectedTemplate.id)}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDuplicateTemplate(selectedTemplate.id)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDeleteTemplate(selectedTemplate.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            
            <Button 
              variant="default" 
              size="sm"
              onClick={() => handleUseTemplate(selectedTemplate.id)}
            >
              <Workflow className="h-4 w-4 mr-2" />
              Use Template
            </Button>
          </div>
        </div>
        
        {/* Template metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="border rounded-md p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Duration</h3>
            </div>
            <p className="text-xl font-bold mt-1">{formatDuration(totalDuration)}</p>
          </div>
          
          <div className="border rounded-md p-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Stages</h3>
            </div>
            <p className="text-xl font-bold mt-1">{selectedTemplate.stages.length}</p>
          </div>
          
          <div className="border rounded-md p-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Automation</h3>
            </div>
            <p className="text-xl font-bold mt-1">{automationPercentage}%</p>
          </div>
          
          <div className="border rounded-md p-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Version</h3>
            </div>
            <p className="text-xl font-bold mt-1">{selectedTemplate.version}</p>
          </div>
        </div>
        
        {/* Template stages */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Workflow Stages</h3>
          
          <div className="space-y-4">
            {selectedTemplate.stages.map((stage, index) => (
              <div key={stage.id} className="border rounded-md overflow-hidden">
                <div className="flex items-center gap-2 p-3 bg-muted/50">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{stage.name}</h4>
                    <p className="text-sm text-muted-foreground">{stage.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={stage.type === 'auto' ? 'default' : 'outline'}>
                      {stage.type === 'auto' ? 'Automated' : 'Manual'}
                    </Badge>
                    <Badge variant="outline">
                      {formatDuration(stage.estimatedDuration)}
                    </Badge>
                  </div>
                </div>
                
                {/* Sub-stages */}
                <div className="p-3 border-t">
                  <h5 className="text-sm font-medium mb-2">Sub-stages</h5>
                  
                  <div className="space-y-2">
                    {stage.subStages.map((subStage, subIndex) => (
                      <div key={subStage.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                        <div className="text-xs text-muted-foreground w-6 text-center">
                          {index + 1}.{subIndex + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1">
                            <h6 className="text-sm font-medium">{subStage.name}</h6>
                            <Badge variant={subStage.type === 'auto' ? 'default' : 'outline'} className="text-xs">
                              {subStage.type === 'auto' ? 'Auto' : 'Manual'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{subStage.description}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {subStage.requiresApproval && (
                            <Badge variant="outline" className="text-xs">Approval</Badge>
                          )}
                          {subStage.requiresAttestation && (
                            <Badge variant="outline" className="text-xs">Attestation</Badge>
                          )}
                          {subStage.requiresUpload && (
                            <Badge variant="outline" className="text-xs">Upload</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {formatDuration(subStage.estimatedDuration)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Template parameters */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Parameters</h3>
          
          {selectedTemplate.parameters.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-12 gap-2 p-3 bg-muted/50 text-sm font-medium">
                <div className="col-span-3">Name</div>
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Required</div>
              </div>
              
              {selectedTemplate.parameters.map(param => (
                <div key={param.id} className="grid grid-cols-12 gap-2 p-3 border-t text-sm">
                  <div className="col-span-3">{param.name}</div>
                  <div className="col-span-5">{param.description}</div>
                  <div className="col-span-2">{param.dataType}</div>
                  <div className="col-span-2">
                    {param.isRequired ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No parameters defined for this template.</p>
          )}
        </div>
        
        {/* Template metadata */}
        <div className="border rounded-md p-4">
          <h3 className="text-sm font-medium mb-2">Template Information</h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Created By</p>
              <p>{selectedTemplate.createdBy}</p>
            </div>
            
            <div>
              <p className="text-muted-foreground">Created On</p>
              <p>{selectedTemplate.createdAt.toLocaleDateString()}</p>
            </div>
            
            <div>
              <p className="text-muted-foreground">Last Updated</p>
              <p>{selectedTemplate.updatedAt.toLocaleDateString()}</p>
            </div>
            
            <div>
              <p className="text-muted-foreground">Last Used</p>
              <p>{selectedTemplate.lastUsed ? selectedTemplate.lastUsed.toLocaleDateString() : 'Never'}</p>
            </div>
            
            <div>
              <p className="text-muted-foreground">Usage Count</p>
              <p>{selectedTemplate.usageCount} times</p>
            </div>
            
            <div>
              <p className="text-muted-foreground">Visibility</p>
              <p>{selectedTemplate.isPublic ? 'Public' : 'Private'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <Card className="flex flex-col h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Library className="h-5 w-5 text-primary" />
            <CardTitle>Workflow Template Library</CardTitle>
            <Badge variant="outline" className="ml-2 bg-primary/10">
              <Sparkles className="h-3 w-3 mr-1" />
              Experimental
            </Badge>
          </div>
          <CardDescription>
            Create, manage, and use workflow templates to standardize processes
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow overflow-auto p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="border-b px-4">
              <TabsList className="w-full justify-start h-12">
                <TabsTrigger value="browse" className="data-[state=active]:bg-primary/5">
                  Browse Templates
                </TabsTrigger>
                <TabsTrigger value="details" className="data-[state=active]:bg-primary/5" disabled={!selectedTemplate}>
                  Template Details
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="h-[calc(100%-3rem)] overflow-auto">
              <TabsContent value="browse" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex-1 flex items-center gap-2">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search templates..." 
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <Select 
                      value={selectedCategory} 
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="starred-only" 
                        checked={showStarredOnly} 
                        onCheckedChange={setShowStarredOnly}
                      />
                      <label htmlFor="starred-only" className="text-sm">
                        Starred only
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          Import
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Import Workflow Template</DialogTitle>
                          <DialogDescription>
                            Upload a workflow template file to import it into your library.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="border-2 border-dashed rounded-md p-6 text-center">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">
                            Drag and drop a template file, or click to browse
                          </p>
                          <Button variant="outline" className="mt-4">
                            Browse Files
                          </Button>
                        </div>
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleImportTemplate}>
                            Import Template
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Template
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Create New Workflow Template</DialogTitle>
                          <DialogDescription>
                            Define the basic information for your new workflow template.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="name" className="text-right text-sm font-medium">
                              Name
                            </label>
                            <Input 
                              id="name" 
                              className="col-span-3" 
                              value={newTemplate.name}
                              onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                            />
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="category" className="text-right text-sm font-medium">
                              Category
                            </label>
                            <Select 
                              value={newTemplate.category} 
                              onValueChange={(value) => setNewTemplate({...newTemplate, category: value})}
                            >
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.filter(c => c !== 'All').map(category => (
                                  <SelectItem key={category} value={category}>{category}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="grid grid-cols-4 items-start gap-4">
                            <label htmlFor="description" className="text-right text-sm font-medium">
                              Description
                            </label>
                            <Textarea 
                              id="description" 
                              className="col-span-3" 
                              rows={3}
                              value={newTemplate.description}
                              onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                            />
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right text-sm font-medium">
                              Tags
                            </label>
                            <div className="col-span-3">
                              <div className="flex flex-wrap gap-1 mb-2">
                                {newTemplate.tags?.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                    <button 
                                      className="ml-1 hover:text-destructive"
                                      onClick={() => setNewTemplate({
                                        ...newTemplate, 
                                        tags: newTemplate.tags?.filter(t => t !== tag)
                                      })}
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex gap-2">
                                <Select 
                                  onValueChange={(value) => {
                                    if (!newTemplate.tags?.includes(value)) {
                                      setNewTemplate({
                                        ...newTemplate, 
                                        tags: [...(newTemplate.tags || []), value]
                                      });
                                    }
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Add tag" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {tags.filter(tag => !newTemplate.tags?.includes(tag)).map(tag => (
                                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="visibility" className="text-right text-sm font-medium">
                              Visibility
                            </label>
                            <div className="col-span-3 flex items-center space-x-2">
                              <Switch 
                                id="visibility" 
                                checked={newTemplate.isPublic} 
                                onCheckedChange={(checked) => setNewTemplate({...newTemplate, isPublic: checked})}
                              />
                              <label htmlFor="visibility" className="text-sm">
                                {newTemplate.isPublic ? 'Public' : 'Private'}
                              </label>
                            </div>
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateTemplate}>
                            Create Template
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.length > 0 ? (
                    filteredTemplates.map(template => renderTemplateCard(template))
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-12">
                      <Library className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No templates found</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Try adjusting your search or filters, or create a new template.
                      </p>
                      <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Template
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="h-full m-0 p-4 data-[state=active]:overflow-auto">
                {renderTemplateDetails()}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};