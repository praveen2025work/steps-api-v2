import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import { workflowActionService } from '@/services/workflowActionService';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

interface InlineApprovalProps {
  workflowProcessId: string;
  processName: string;
  existingCommentary?: string;
  updatedBy: string;
  onActionComplete: (action: 'approve' | 'reject', success: boolean) => void;
}

const InlineApproval: React.FC<InlineApprovalProps> = ({
  workflowProcessId,
  processName,
  existingCommentary = '',
  updatedBy,
  onActionComplete,
}) => {
  const [commentary, setCommentary] = useState(existingCommentary);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const response = await workflowActionService.approveProcess(workflowProcessId, commentary, updatedBy);
      if (response.success) {
        showSuccessToast(`Process "${processName}" approved successfully.`);
        onActionComplete('approve', true);
      } else {
        showErrorToast(`Failed to approve process: ${response.error}`);
        onActionComplete('approve', false);
      }
    } catch (error: any) {
      showErrorToast(`An error occurred: ${error.message}`);
      onActionComplete('approve', false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!commentary.trim()) {
      showErrorToast('Commentary is required for rejection.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await workflowActionService.rejectProcess(workflowProcessId, commentary, updatedBy);
      if (response.success) {
        showSuccessToast(`Process "${processName}" rejected successfully.`);
        onActionComplete('reject', true);
      } else {
        showErrorToast(`Failed to reject process: ${response.error}`);
        onActionComplete('reject', false);
      }
    } catch (error: any) {
      showErrorToast(`An error occurred: ${error.message}`);
      onActionComplete('reject', false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-2 border-t border-muted mt-2 space-y-2">
      <Textarea
        placeholder="Add your commentary..."
        value={commentary}
        onChange={(e) => setCommentary(e.target.value)}
        className="text-xs"
        rows={2}
        disabled={isSubmitting}
      />
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={handleReject}
          disabled={isSubmitting || !commentary.trim()}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
          Reject
        </Button>
        <Button
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={handleApprove}
          disabled={isSubmitting}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          Approve
        </Button>
      </div>
    </div>
  );
};

export default InlineApproval;