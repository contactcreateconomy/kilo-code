'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@createconomy/convex';
import {
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Textarea,
} from '@createconomy/ui';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

/**
 * Report reasons with user-friendly labels and descriptions.
 */
const REPORT_REASONS = [
  { value: 'spam' as const, label: 'Spam', description: 'Unsolicited advertising or promotion' },
  { value: 'harassment' as const, label: 'Harassment', description: 'Targeting or bullying a person' },
  { value: 'hate_speech' as const, label: 'Hate Speech', description: 'Discrimination based on identity' },
  { value: 'misinformation' as const, label: 'Misinformation', description: 'Deliberately false or misleading' },
  { value: 'nsfw' as const, label: 'NSFW', description: 'Inappropriate sexual or graphic content' },
  { value: 'off_topic' as const, label: 'Off Topic', description: 'Not relevant to the community' },
  { value: 'self_harm' as const, label: 'Self Harm', description: 'Encourages self-harm or suicide' },
  { value: 'violence' as const, label: 'Violence', description: 'Threats or glorification of violence' },
  { value: 'other' as const, label: 'Other', description: 'Something else not listed above' },
] as const;

type ReportReason = typeof REPORT_REASONS[number]['value'];

interface ReportDialogProps {
  targetType: 'thread' | 'comment' | 'user';
  targetId: string;
  isOpen: boolean;
  onClose: () => void;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

/**
 * ReportDialog — modal for users to report threads, comments, or other users.
 *
 * Uses shadcn Dialog for accessible overlay/focus-trap/portal.
 */
export function ReportDialog({ targetType, targetId, isOpen, onClose }: ReportDialogProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const createReport = useMutation(api.functions.moderation.createReport);

  const handleSubmit = async () => {
    if (!reason) return;

    setSubmitState('submitting');
    setErrorMessage('');

    try {
      await createReport({
        targetType,
        targetId,
        reason,
        details: details.trim() || undefined,
      });
      setSubmitState('success');

      // Auto-close after success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: unknown) {
      setSubmitState('error');
      const message =
        err instanceof Error ? err.message : 'Failed to submit report. Please try again.';
      // Extract meaningful error from ConvexError
      if (message.includes('DUPLICATE')) {
        setErrorMessage('You have already reported this content.');
      } else if (message.includes('RATE_LIMITED')) {
        setErrorMessage('Too many reports. Please try again later.');
      } else {
        setErrorMessage(message);
      }
    }
  };

  const handleClose = () => {
    setReason(null);
    setDetails('');
    setSubmitState('idle');
    setErrorMessage('');
    onClose();
  };

  const targetLabel = targetType === 'thread' ? 'post' : targetType;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        {/* Success state */}
        {submitState === 'success' ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
            <h3 className="text-lg font-semibold">Report Submitted</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Thank you for helping keep our community safe. A moderator will review your report.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Report {targetLabel}
              </DialogTitle>
              <DialogDescription>
                Why are you reporting this {targetLabel}? Select the most appropriate reason.
              </DialogDescription>
            </DialogHeader>

            {/* Body */}
            <div className="max-h-[60vh] overflow-y-auto space-y-4">
              {/* Reason selection */}
              <div className="space-y-2">
                {REPORT_REASONS.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setReason(r.value)}
                    className={cn(
                      'w-full text-left rounded-lg border p-3 transition-colors',
                      reason === r.value
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-muted-foreground/30 hover:bg-muted/50'
                    )}
                  >
                    <span className="font-medium text-sm">{r.label}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
                  </button>
                ))}
              </div>

              {/* Additional details */}
              <div>
                <label
                  htmlFor="report-details"
                  className="text-sm font-medium"
                >
                  Additional details {reason === 'other' ? '(required)' : '(optional)'}
                </label>
                <Textarea
                  id="report-details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide any additional context that might help moderators..."
                  maxLength={500}
                  rows={3}
                  className="mt-1 resize-none"
                />
                <p className="mt-1 text-xs text-muted-foreground text-right">
                  {details.length}/500
                </p>
              </div>

              {/* Error message */}
              {submitState === 'error' && errorMessage && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {errorMessage}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  !reason ||
                  submitState === 'submitting' ||
                  (reason === 'other' && !details.trim())
                }
              >
                {submitState === 'submitting' ? 'Submitting...' : 'Submit Report'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ReportDialog;
