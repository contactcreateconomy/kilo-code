'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@createconomy/convex';

type ReportStatus = 'pending' | 'reviewed' | 'actioned' | 'dismissed';
type TargetType = 'thread' | 'comment' | 'user';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  reviewed: 'bg-primary/10 text-primary',
  actioned: 'bg-success/10 text-success',
  dismissed: 'bg-muted text-muted-foreground',
};

const reasonColors: Record<string, string> = {
  spam: 'bg-upvote/10 text-upvote',
  harassment: 'bg-destructive/10 text-destructive',
  hate_speech: 'bg-destructive/10 text-destructive',
  misinformation: 'bg-primary/10 text-primary',
  nsfw: 'bg-destructive/10 text-destructive',
  off_topic: 'bg-primary/10 text-primary',
  self_harm: 'bg-destructive/10 text-destructive',
  violence: 'bg-destructive/10 text-destructive',
  other: 'bg-muted text-muted-foreground',
};

const typeIcons: Record<string, string> = {
  thread: '📝',
  comment: '💬',
  user: '👤',
};

/**
 * Reports queue page — lists all reports with filtering and inline actions.
 */
export default function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>('pending');
  const [typeFilter, setTypeFilter] = useState<TargetType | ''>('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Convex queries
  const reports = useQuery(
    api.functions.moderation.listReports,
    {
      status: statusFilter || undefined,
      targetType: typeFilter || undefined,
      limit: 50,
    }
  );

  // Mutations
  const dismissReport = useMutation(api.functions.moderation.dismissReport);
  const _reviewReport = useMutation(api.functions.moderation.reviewReport);
  const removeContent = useMutation(api.functions.moderation.removeContent);
  const warnUser = useMutation(api.functions.moderation.warnUser);
  const banUser = useMutation(api.functions.moderation.banUser);

  const handleDismiss = async (reportId: string) => {
    setActionInProgress(reportId);
    try {
      await dismissReport({ reportId: reportId as never });
    } catch (err) {
      console.error('Failed to dismiss report:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRemove = async (report: {
    _id: string;
    targetType: string;
    targetId: string;
  }) => {
    setActionInProgress(report._id);
    try {
      await removeContent({
        targetType: report.targetType as TargetType,
        targetId: report.targetId,
        reason: 'Violated community guidelines',
        reportId: report._id as never,
      });
    } catch (err) {
      console.error('Failed to remove content:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleWarn = async (report: {
    _id: string;
    targetAuthor: { id: string } | null;
  }) => {
    if (!report.targetAuthor) return;
    setActionInProgress(report._id);
    try {
      await warnUser({
        userId: report.targetAuthor.id as never,
        reason: 'Community guidelines violation based on user report',
        reportId: report._id as never,
      });
    } catch (err) {
      console.error('Failed to warn user:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleBan = async (report: {
    _id: string;
    targetAuthor: { id: string } | null;
  }) => {
    if (!report.targetAuthor) return;
    setActionInProgress(report._id);
    try {
      await banUser({
        userId: report.targetAuthor.id as never,
        reason: 'Repeated community guidelines violations',
        isPermanent: false,
        durationDays: 7,
        reportId: report._id as never,
      });
    } catch (err) {
      console.error('Failed to ban user:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const isLoading = reports === undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/moderation"
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Moderation
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-3xl font-bold tracking-tight">Reports Queue</h1>
          {reports && (
            <span className="inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
              {reports.length} {statusFilter || 'total'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReportStatus | '')}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="actioned">Actioned</option>
            <option value="dismissed">Dismissed</option>
          </select>
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TargetType | '')}
          >
            <option value="">All Types</option>
            <option value="thread">Threads</option>
            <option value="comment">Comments</option>
            <option value="user">Users</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border bg-card shadow-sm p-6 animate-pulse"
            >
              <div className="h-4 bg-muted rounded w-1/3 mb-3" />
              <div className="h-3 bg-muted rounded w-2/3 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : reports && reports.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
          <p className="text-lg font-medium">No reports found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {statusFilter
              ? `No ${statusFilter} reports. Try a different filter.`
              : 'The moderation queue is empty. Great job! 🎉'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports?.map((report) => {
            const isProcessing = actionInProgress === report._id;

            return (
              <div
                key={report._id}
                className={`rounded-lg border bg-card shadow-sm overflow-hidden transition-opacity ${
                  isProcessing ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">{typeIcons[report.targetType] ?? '📋'}</div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              reasonColors[report.reason] ?? reasonColors['other']
                            }`}
                          >
                            {report.reason.replace('_', ' ')}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              statusColors[report.status] ?? statusColors['pending']
                            }`}
                          >
                            {report.status}
                          </span>
                          <span className="text-xs text-muted-foreground uppercase">
                            {report.targetType}
                          </span>
                        </div>

                        {report.contentPreview && (
                          <p className="mt-2 text-sm font-medium line-clamp-2">
                            {report.contentPreview}
                          </p>
                        )}

                        {report.details && (
                          <p className="mt-1 text-sm text-muted-foreground italic">
                            &ldquo;{report.details}&rdquo;
                          </p>
                        )}

                        <div className="mt-3 flex items-center gap-6 text-sm flex-wrap">
                          <div>
                            <span className="text-muted-foreground">Reported by: </span>
                            <span className="font-medium">
                              @{report.reporter?.username ?? 'unknown'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Author: </span>
                            <span className="font-medium text-destructive">
                              @{report.targetAuthor?.username ?? 'unknown'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              {new Date(report.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {report.reviewedByName && (
                            <div>
                              <span className="text-muted-foreground">Reviewed by: </span>
                              <span className="font-medium">{report.reviewedByName}</span>
                            </div>
                          )}
                        </div>

                        {report.modNotes && (
                          <div className="mt-2 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
                            <strong>Mod notes:</strong> {report.modNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions — only show for pending/reviewed reports */}
                {(report.status === 'pending' || report.status === 'reviewed') && (
                  <div className="border-t px-6 py-4 bg-muted/30 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleDismiss(report._id)}
                      className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                      disabled={isProcessing}
                    >
                      Dismiss
                    </button>
                    {report.targetType !== 'user' && (
                      <button
                        onClick={() => handleRemove(report)}
                        className="rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                        disabled={isProcessing}
                      >
                        Remove Content
                      </button>
                    )}
                    <button
                      onClick={() => handleWarn(report)}
                      className="rounded-md border border-warning px-4 py-2 text-sm font-medium text-warning hover:bg-warning/10"
                      disabled={isProcessing || !report.targetAuthor}
                    >
                      Warn User
                    </button>
                    <button
                      onClick={() => handleBan(report)}
                      className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
                      disabled={isProcessing || !report.targetAuthor}
                    >
                      Ban User (7d)
                    </button>
                  </div>
                )}

                {/* Already actioned indicator */}
                {(report.status === 'actioned' || report.status === 'dismissed') && (
                  <div className="border-t px-6 py-3 bg-muted/20 text-sm text-muted-foreground">
                    {report.status === 'actioned'
                      ? `✅ Action taken: ${report.actionTaken ?? 'unknown'}`
                      : '🚫 Dismissed'}
                    {report.reviewedByName && ` by ${report.reviewedByName}`}
                    {report.reviewedAt && ` on ${new Date(report.reviewedAt).toLocaleDateString()}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
