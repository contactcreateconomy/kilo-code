'use client';

import { AlertCircle } from 'lucide-react';

interface WidgetErrorFallbackProps {
  /** Label describing which widget failed (e.g., "Leaderboard") */
  label?: string;
}

/**
 * WidgetErrorFallback — compact fallback card shown when a sidebar widget
 * or page section fails to render due to an uncaught error.
 */
export function WidgetErrorFallback({ label }: WidgetErrorFallbackProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-4 text-muted-foreground">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <p className="text-xs">
        {label ? `${label} couldn't load.` : "Couldn't load this section."}
      </p>
    </div>
  );
}
