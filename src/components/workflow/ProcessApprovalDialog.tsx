import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThumbsUp, ThumbsDown, MessageSquare, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { showSuccessToast, showErrorToast, showInfoToast } from '@/lib/toast';
import { WorkflowActionService } from '@/services/workflowActionService';

interface ProcessApprovalDialogProps {
  workflowProcessId: string;
  processName: string;
  status: string;
  approval: string; // 'Y' or 'N'
  existingCommentary?: string;
  updatedBy?: string;
  onActionComplete?: (action: 'approve' | 'reject', success: boolean) => void;
  trigger?: React.ReactNode;
}

const ProcessApprovalDialog: React.FC<ProcessApprovalDialogProps> = ({
  workflowProcessId,
  processName,
  status,
  approval,
  existingCommentary = '',
  updatedBy = 'user',
  onActionComplete,
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [commentary, setCommentary] = useState(existingCommentary);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | null>(null);

  // Update commentary when existingCommentary changes
  useEffect(() => {
    setCommentary(existingCommentary);
  }, [existingCommentary]);

  // Check if approval is required and process is in the right state
  const requiresApproval = WorkflowActionService.requiresApproval(status, approval);

  // Don't render if approval is not required
  if (!requiresApproval) {
    return null;
  }

  const handleApprove = async () => {
    if (!commentary.trim()) {
      showErrorToast('Please provide commentary before approving.');
      return;
    }

    setIsSubmitting(true);
    setSelectedAction('approve');

    try {
      const result = await WorkflowActionService.approveProcess(
        workflowProcessId,
        updatedBy,
        commentary.trim()
      );

      if (result.success) {
        showSuccessToast(result.message || 'Process approved successfully');
        setIsOpen(false);
        onActionComplete?.('approve', true);
      } else {
        showErrorToast(result.error || 'Failed to approve process');
        onActionComplete?.('approve', false);
      }
    } catch (error: any) {
      showErrorToast(`Approval failed: ${error.message}`);
      onActionComplete?.('approve', false);
    } finally {
      setIsSubmitting(false);
      setSelectedAction(null);
    }
  };

  const handleReject = async () => {
    if (!commentary.trim()) {
      showErrorToast('Please provide commentary before rejecting.');
      return;
    }

    setIsSubmitting(true);
    setSelectedAction('reject');

    try {
      const result = await WorkflowActionService.rejectProcess(
        workflowProcessId,
        updatedBy,
        commentary.trim()
      );

      if (result.success) {
        showSuccessToast(result.message || 'Process rejected successfully');
        setIsOpen(false);
        onActionComplete?.('reject', true);
      } else {
        showErrorToast(result.error || 'Failed to reject process');
        onActionComplete?.('reject', false);
      }
    } catch (error: any) {
      showErrorToast(`Rejection failed: ${error.message}`);
      onActionComplete?.('reject', false);
    } finally {
      setIsSubmitting(false);
      setSelectedAction(null);
    }
  };

  const handleDialogClose = () => {
    if (!isSubmitting) {
      setIsOpen(false);
      setSelectedAction(null);
    }
  };

  // Default trigger if none provided
  const defaultTrigger = (
    <Button 
      variant="outline" 
      size="sm" 
      className="flex items-center gap-2"
    >
      <MessageSquare className="h-4 w-4" />
      Approval Required
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Process Approval Required
          </DialogTitle>
          <DialogDescription>
            This process requires approval before it can be completed. Please review and provide your decision.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Process Information */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Process</Label>
              <Badge variant="secondary" className="text-xs">
                {workflowProcessId}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
              {processName}
            </div>
          </div>

          <Separator />

          {/* Status Information */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Current Status</Label>
              <Badge variant="secondary" className="capitalize">
                {status.replace('_', ' ').replace('-', ' ')}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3" />
              Approval Required
            </div>
          </div>

          <Separator />

          {/* Commentary Section */}
          <div className="space-y-2">
            <Label htmlFor="commentary" className="text-sm font-medium">
              Commentary <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="commentary"
              placeholder="Please provide your comments for this approval decision..."
              value={commentary}
              onChange={(e) => setCommentary(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isSubmitting}
            />
            <div className="text-xs text-muted-foreground">
              {commentary.length}/500 characters
            </div>
          </div>

          {/* Existing Commentary Display */}
          {existingCommentary && existingCommentary !== commentary && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Previous Commentary
              </Label>
              <div className="text-sm bg-muted/20 p-2 rounded border-l-2 border-muted">
                {existingCommentary}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleDialogClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isSubmitting || !commentary.trim()}
              className="flex-1 sm:flex-none"
            >
              {isSubmitting && selectedAction === 'reject' ? (
                <>
                  <XCircle className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Reject
                </>
              )}
            </Button>
            
            <Button
              onClick={handleApprove}
              disabled={isSubmitting || !commentary.trim()}
              className="flex-1 sm:flex-none"
            >
              {isSubmitting && selectedAction === 'approve' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Approve
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessApprovalDialog;