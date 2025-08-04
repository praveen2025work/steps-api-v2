import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/toast';
import { WorkflowActionService } from '@/services/workflowActionService';
import { 
  PlayCircle, 
  RotateCcw, 
  Loader2,
  Lock,
  AlertCircle
} from 'lucide-react';

interface WorkflowActionButtonsProps {
  workflowProcessId: string | number;
  status: string;
  isLocked?: boolean | string;
  updatedBy?: string;
  onActionComplete?: (action: 'force-start' | 're-run', success: boolean) => void;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

const WorkflowActionButtons: React.FC<WorkflowActionButtonsProps> = ({
  workflowProcessId,
  status,
  isLocked = false,
  updatedBy = 'user',
  onActionComplete,
  size = 'sm',
  variant = 'outline',
  className = ''
}) => {
  const [isForceStarting, setIsForceStarting] = useState(false);
  const [isReRunning, setIsReRunning] = useState(false);

  // Convert workflowProcessId to string and handle different formats
  const processId = typeof workflowProcessId === 'number' 
    ? workflowProcessId.toString() 
    : workflowProcessId.toString();

  // Convert isLocked to boolean
  const locked = typeof isLocked === 'string' 
    ? (isLocked.toLowerCase() === 'y' || isLocked.toLowerCase() === 'true')
    : Boolean(isLocked);

  // Get button configuration based on current state
  const buttonConfig = WorkflowActionService.getActionButtons(status, locked);

  const handleForceStart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isForceStarting || locked) return;

    setIsForceStarting(true);
    
    try {
      const result = await WorkflowActionService.forceStart(processId, updatedBy);
      
      if (result.success) {
        toast({
          title: "Force Start Successful",
          description: result.message || `Process ${processId} has been force started`,
          variant: "default"
        });
        
        onActionComplete?.('force-start', true);
      } else {
        toast({
          title: "Force Start Failed",
          description: result.error || 'Failed to force start the process',
          variant: "destructive"
        });
        
        onActionComplete?.('force-start', false);
      }
    } catch (error: any) {
      toast({
        title: "Force Start Error",
        description: error.message || 'An unexpected error occurred',
        variant: "destructive"
      });
      
      onActionComplete?.('force-start', false);
    } finally {
      setIsForceStarting(false);
    }
  };

  const handleReRun = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isReRunning) return;

    setIsReRunning(true);
    
    try {
      const result = await WorkflowActionService.reRun(processId, updatedBy);
      
      if (result.success) {
        toast({
          title: "Re-run Successful",
          description: result.message || `Process ${processId} has been re-run`,
          variant: "default"
        });
        
        onActionComplete?.('re-run', true);
      } else {
        toast({
          title: "Re-run Failed",
          description: result.error || 'Failed to re-run the process',
          variant: "destructive"
        });
        
        onActionComplete?.('re-run', false);
      }
    } catch (error: any) {
      toast({
        title: "Re-run Error",
        description: error.message || 'An unexpected error occurred',
        variant: "destructive"
      });
      
      onActionComplete?.('re-run', false);
    } finally {
      setIsReRunning(false);
    }
  };

  // If no actions are available, return null or a disabled state indicator
  if (!buttonConfig.showForceStart && !buttonConfig.showReRun) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Badge variant="outline" className="text-xs">
          {locked ? (
            <>
              <Lock className="h-3 w-3 mr-1" />
              Locked
            </>
          ) : (
            <>
              <AlertCircle className="h-3 w-3 mr-1" />
              No Actions
            </>
          )}
        </Badge>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Force Start Button */}
      {buttonConfig.showForceStart && (
        <Button
          variant={variant}
          size={size}
          onClick={handleForceStart}
          disabled={!buttonConfig.forceStartEnabled || isForceStarting || isReRunning}
          className="flex items-center gap-1"
          title={locked ? 'Process is locked' : 'Force start this process'}
        >
          {isForceStarting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <PlayCircle className="h-3 w-3" />
          )}
          {size !== 'sm' && (
            <span>{isForceStarting ? 'Starting...' : 'Force Start'}</span>
          )}
        </Button>
      )}

      {/* Re-run Button */}
      {buttonConfig.showReRun && (
        <Button
          variant={variant}
          size={size}
          onClick={handleReRun}
          disabled={!buttonConfig.reRunEnabled || isReRunning || isForceStarting}
          className="flex items-center gap-1"
          title="Re-run this completed process"
        >
          {isReRunning ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RotateCcw className="h-3 w-3" />
          )}
          {size !== 'sm' && (
            <span>{isReRunning ? 'Re-running...' : 'Re-run'}</span>
          )}
        </Button>
      )}

      {/* Lock indicator if process is locked */}
      {locked && (
        <Badge variant="outline" className="text-xs">
          <Lock className="h-3 w-3 mr-1" />
          Locked
        </Badge>
      )}
    </div>
  );
};

export default WorkflowActionButtons;