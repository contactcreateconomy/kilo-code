'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@createconomy/convex';
import {
  Button,
  cn,
} from '@createconomy/ui';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

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
 * Uses a custom overlay instead of shadcn Dialog to avoid portal issues.
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

  if (!isOpen) return null;

  const targetLabel = targetType === 'thread' ? 'post' : targetType;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md mx-4 rounded-lg border bg-card shadow-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold">Report {targetLabel}</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-md hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Success state */}
        {submitState === 'success' ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold">Report Submitted</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Thank you for helping keep our community safe. A moderator will review your report.
            </p>
          </div>
        ) : (
          <>
            {/* Body */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <p className="text-sm text-muted-foreground mb-4">
                Why are you reporting this {targetLabel}? Select the most appropriate reason.
              </p>

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

              {/* Additional details (always visible for context, required for "other") */}
              <div className="mt-4">
                <label
                  htmlFor="report-details"
                  className="text-sm font-medium"
                >
                  Additional details {reason === 'other' ? '(required)' : '(optional)'}
                </label>
                <textarea
                  id="report-details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide any additional context that might help moderators..."
                  maxLength={500}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                <p className="mt-1 text-xs text-muted-foreground text-right">
                  {details.length}/500
                </p>
              </div>

              {/* Error message */}
              {submitState === 'error' && errorMessage && (
                <div className="mt-3 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {errorMessage}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 p-4 border-t">
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ReportDialog;
