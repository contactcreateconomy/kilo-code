'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@createconomy/convex';

/**
 * Moderation Dashboard — live stats from Convex, quick links, and recent actions.
 */
export default function ModerationPage() {
  const stats = useQuery(api.functions.moderation.getModStats, {});
  const recentActions = useQuery(api.functions.moderation.getModActions, { limit: 10 });
  const pendingReports = useQuery(api.functions.moderation.listReports, { status: 'pending', limit: 5 });

  const loading = stats === undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Moderation</h1>
          <p className="text-muted-foreground">
            Manage reported content, bans, and moderation actions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link
          href="/moderation/reports"
          className="rounded-lg border bg-card p-4 shadow-sm hover:border-primary transition-colors"
        >
          <p className="text-sm text-muted-foreground">Pending Reports</p>
          <p className="text-2xl font-bold text-yellow-600">
            {loading ? '—' : stats?.pendingReports ?? 0}
          </p>
          <p className="text-xs text-muted-foreground">Needs attention</p>
        </Link>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Reviewed Today</p>
          <p className="text-2xl font-bold text-blue-600">
            {loading ? '—' : stats?.reviewedToday ?? 0}
          </p>
          <p className="text-xs text-muted-foreground">Actions taken</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Actions This Week</p>
          <p className="text-2xl font-bold text-green-600">
            {loading ? '—' : stats?.actionsThisWeek ?? 0}
          </p>
          <p className="text-xs text-muted-foreground">Mod activity</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Active Bans</p>
          <p className="text-2xl font-bold text-red-600">
            {loading ? '—' : stats?.activeBans ?? 0}
          </p>
          <p className="text-xs text-muted-foreground">Currently enforced</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Reports */}
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Recent Reports</h2>
            <Link
              href="/moderation/reports"
              className="text-sm text-primary hover:underline"
            >
              View All →
            </Link>
          </div>
          <div className="divide-y">
            {!pendingReports || pendingReports.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No pending reports 🎉
              </div>
            ) : (
              pendingReports.map((report) => (
                <div key={report._id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase text-muted-foreground">
                          {report.targetType}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          {report.status}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          {report.reason.replace('_', ' ')}
                        </span>
                      </div>
                      {report.contentPreview && (
                        <p className="mt-1 text-sm font-medium line-clamp-1">
                          {report.contentPreview}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        Reported by {report.reporter?.username ?? 'unknown'} •{' '}
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      href="/moderation/reports"
                      className="text-sm text-primary hover:underline"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Actions */}
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Recent Moderation Actions</h2>
          </div>
          <div className="divide-y">
            {!recentActions || recentActions.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No recent actions
              </div>
            ) : (
              recentActions.map((action) => (
                <div key={action._id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {action.action} — {action.targetType}
                      </p>
                      {action.reason && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {action.reason}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        by {action.moderatorName} •{' '}
                        {new Date(action.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Link
            href="/moderation/reports"
            className="rounded-md border px-4 py-3 text-sm font-medium hover:bg-muted text-center"
          >
            Review Reports
          </Link>
          <Link
            href="/moderation/reviews"
            className="rounded-md border px-4 py-3 text-sm font-medium hover:bg-muted text-center"
          >
            Approve Reviews
          </Link>
          <Link
            href="/moderation/reports?status=actioned"
            className="rounded-md border px-4 py-3 text-sm font-medium hover:bg-muted text-center"
          >
            Action History
          </Link>
          <Link
            href="/moderation/bans"
            className="rounded-md border px-4 py-3 text-sm font-medium hover:bg-muted text-center"
          >
            Manage Bans
          </Link>
        </div>
      </div>
    </div>
  );
}
