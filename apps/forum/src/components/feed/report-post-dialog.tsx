"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
} from "@createconomy/ui";

const REPORT_REASONS = [
  "Spam or misleading",
  "Harassment or abuse",
  "Unsafe content",
  "Low quality / irrelevant",
] as const;

interface ReportPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: (typeof REPORT_REASONS)[number]) => void;
}

export function ReportPostDialog({ open, onOpenChange, onSubmit }: ReportPostDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report post</DialogTitle>
          <DialogDescription>
            Select a reason and we&apos;ll hide this post from your feed.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          {REPORT_REASONS.map((reason) => (
            <Button key={reason} variant="secondary" className="justify-start" onClick={() => onSubmit(reason)}>
              {reason}
            </Button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
