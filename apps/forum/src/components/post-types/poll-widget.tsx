'use client';

import { cn, Button } from '@createconomy/ui';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@createconomy/convex';
import { BarChart, Clock, CheckCircle2 } from 'lucide-react';

interface PollPreviewProps {
  options: string[];
  endsAt?: number | null;
  totalVotes?: number;
}

/**
 * PollPreview — Compact poll display for feed cards.
 * Shows options as a list with a vote count.
 */
export function PollPreview({ options, endsAt, totalVotes }: PollPreviewProps) {
  const hasEnded = endsAt != null && Date.now() > endsAt;

  return (
    <div className="rounded-lg border bg-card/50 p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <BarChart className="h-3.5 w-3.5" />
        <span>Poll · {options.length} options</span>
        {hasEnded && (
          <span className="text-orange-500 font-medium">· Ended</span>
        )}
      </div>
      <div className="space-y-1">
        {options.slice(0, 3).map((option, i) => (
          <div
            key={i}
            className="text-sm rounded bg-muted/50 px-3 py-1.5 truncate"
          >
            {option}
          </div>
        ))}
        {options.length > 3 && (
          <p className="text-xs text-muted-foreground pl-1">
            +{options.length - 3} more options
          </p>
        )}
      </div>
      {totalVotes !== undefined && (
        <p className="text-xs text-muted-foreground">
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        </p>
      )}
    </div>
  );
}

interface PollWidgetProps {
  threadId: string;
}

/**
 * PollWidget — Full interactive poll for thread detail page.
 *
 * Fetches poll results from Convex and allows voting.
 * Shows progress bars after voting or when poll has ended.
 */
export function PollWidget({ threadId }: PollWidgetProps) {
  const results = useQuery(
    api.functions.polls.getPollResults,
    { threadId: threadId as never }
  );
  const voteMutation = useMutation(api.functions.polls.votePoll);

  if (!results) {
    return (
      <div className="rounded-lg border p-4 animate-pulse">
        <div className="h-4 w-24 bg-muted rounded mb-3" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  const {
    options,
    voteCounts,
    percentages,
    totalVotes,
    userVotes,
    endsAt,
    hasEnded,
  } = results;

  const hasVoted = userVotes.length > 0;
  const showResults = hasVoted || hasEnded;

  const handleVote = async (optionIndex: number) => {
    if (hasEnded) return;
    try {
      await voteMutation({
        threadId: threadId as never,
        optionIndex,
      });
    } catch {
      // Handle error silently — the UI will update via reactive query
    }
  };

  const formatTimeRemaining = (ms: number): string => {
    const hours = Math.floor(ms / 3600000);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h left`;
    if (hours > 0) return `${hours}h left`;
    const minutes = Math.floor(ms / 60000);
    return `${minutes}m left`;
  };

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="space-y-2">
        {options.map((option: string, index: number) => {
          const isSelected = userVotes.includes(index);
          const percentage = percentages[index] ?? 0;
          const count = voteCounts[index] ?? 0;

          if (showResults) {
            // Show results with progress bars
            return (
              <button
                key={index}
                onClick={() => !hasEnded && handleVote(index)}
                disabled={hasEnded}
                className={cn(
                  'relative w-full text-left rounded-lg border p-3 overflow-hidden transition-colors',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/50',
                  hasEnded && 'cursor-default'
                )}
              >
                {/* Progress bar background */}
                <div
                  className={cn(
                    'absolute inset-y-0 left-0 transition-all duration-500',
                    isSelected
                      ? 'bg-primary/15'
                      : 'bg-muted/50'
                  )}
                  style={{ width: `${percentage}%` }}
                />

                {/* Content */}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    )}
                    <span className="text-sm font-medium">{option}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{count}</span>
                    <span className="font-medium">{percentage}%</span>
                  </div>
                </div>
              </button>
            );
          }

          // Voting buttons (before voting)
          return (
            <button
              key={index}
              onClick={() => handleVote(index)}
              className="w-full text-left rounded-lg border border-border p-3 hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <span className="text-sm">{option}</span>
            </button>
          );
        })}
      </div>

      {/* Poll meta */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
        <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
        {hasEnded ? (
          <span className="text-orange-500 font-medium">Poll ended</span>
        ) : endsAt ? (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTimeRemaining(endsAt - Date.now())}
          </span>
        ) : null}
      </div>
    </div>
  );
}
