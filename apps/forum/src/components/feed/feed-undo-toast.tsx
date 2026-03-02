"use client";

import { Button } from "@createconomy/ui";

interface FeedUndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
}

export function FeedUndoToast({ message, onUndo, onDismiss }: FeedUndoToastProps) {
  return (
    <div className="fixed bottom-24 left-1/2 z-50 w-[min(560px,92vw)] -translate-x-1/2 rounded-xl border border-border bg-card px-3 py-2 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-foreground">{message}</p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onUndo}>
            Undo
          </Button>
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
