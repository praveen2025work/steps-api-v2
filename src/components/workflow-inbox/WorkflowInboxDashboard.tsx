import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  PlayCircle, 
  Eye,
  Calendar,
  FileText,
  MessageSquare,
  ArrowRight,
  Filter,
  Search,
  SortDesc,
  ChevronDown,
  ChevronRight,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkflowInboxItem } from './WorkflowInboxItem';
import { ModernWorkflowDetailPanel } from './ModernWorkflowDetailPanel';
import { WorkflowInboxFilters } from './WorkflowInboxFilters';
import { EnhancedWorkflowInboxDashboard } from './EnhancedWorkflowInboxDashboard';
import { useWorkflowInbox } from '@/hooks/useWorkflowInbox';

export interface WorkflowInboxItemData {
  id: string;
  title: string;
  description: string;
  processName: string;
  businessDate: string;
  status: 'pending' | 'in_progress' | 'requires_attention' | 'blocked';
  priority: 'high' | 'medium' | 'low';
  assignedTo?: string;
  suggestedAction: string;
  dueDate: string;
  estimatedDuration: number; // in minutes
  dependencies: string[];
  tags: string[];
  files: {
    id: string;
    name: string;
    type: string;
    size: string;
    required: boolean;
    status: 'pending' | 'uploaded' | 'approved' | 'rejected';
  }[];
  comments: {
    id: string;
    user: string;
    message: string;
    timestamp: string;
    type: 'comment' | 'query' | 'approval' | 'rejection';
  }[];
  history: {
    id: string;
    action: string;
    user: string;
    timestamp: string;
    details?: string;
  }[];
  metadata: {
    application: string;
    stage: string;
    substage: string;
    hierarchyPath: string;
    processControls: {
      active: boolean;
      auto: boolean;
      attest: boolean;
      lock: boolean;
      canTrigger: boolean;
      canSelect: boolean;
      lastRun: string;
      nextRun: string | null;
    };
  };
}

export const WorkflowInboxDashboard: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">Task Center</h2>
      </div>
      <EnhancedWorkflowInboxDashboard />
    </div>
  );
};