import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Moderation',
  description: 'Forum moderation dashboard',
};

// Mock data - in production this would come from Convex
const moderationStats = {
  pendingReports: 12,
  pendingReviews: 8,
  flaggedContent: 5,
  resolvedToday: 23,
};

const recentReports = [
  {
    id: '1',
    type: 'post',
    content: 'Inappropriate language in forum post',
    reporter: 'user123',
    reportedUser: 'spammer99',
    reason: 'Spam',
    createdAt: '2024-01-25 14:30',
    status: 'pending',
  },
  {
    id: '2',
    type: 'review',
    content: 'Fake review with misleading information',
    reporter: 'seller_jane',
    reportedUser: 'fake_reviewer',
    reason: 'Fake/Misleading',
    createdAt: '2024-01-25 12:15',
    status: 'pending',
  },
  {
    id: '3',
    type: 'comment',
    content: 'Harassment in comment thread',
    reporter: 'helpful_user',
    reportedUser: 'troll_account',
    reason: 'Harassment',
    createdAt: '2024-01-25 10:00',
    status: 'in_review',
  },
];

const recentActions = [
  {
    id: '1',
    action: 'Post removed',
    target: 'Spam post in General Discussion',
    moderator: 'admin_john',
    timestamp: '2024-01-25 13:45',
  },
  {
    id: '2',
    action: 'User warned',
    target: 'user_xyz for inappropriate language',
    moderator: 'mod_sarah',
    timestamp: '2024-01-25 11:30',
  },
  {
    id: '3',
    action: 'Review approved',
    target: 'Product review for Premium UI Kit',
    moderator: 'admin_john',
    timestamp: '2024-01-25 10:15',
  },
  {
    id: '4',
    action: 'User banned',
    target: 'spammer_account (repeat offender)',
    moderator: 'admin_john',
    timestamp: '2024-01-24 16:00',
  },
];

const statusColors: Record<string, string> = {
  pending: 'badge-warning',
  in_review: 'badge-info',
  resolved: 'badge-success',
  dismissed: 'badge-secondary',
};

export default function ModerationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Moderation</h1>
          <p className="text-muted-foreground">
            Manage reported content and reviews
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
            {moderationStats.pendingReports}
          </p>
          <p className="text-xs text-muted-foreground">Needs attention</p>
        </Link>
        <Link
          href="/moderation/reviews"
          className="rounded-lg border bg-card p-4 shadow-sm hover:border-primary transition-colors"
        >
          <p className="text-sm text-muted-foreground">Pending Reviews</p>
          <p className="text-2xl font-bold text-blue-600">
            {moderationStats.pendingReviews}
          </p>
          <p className="text-xs text-muted-foreground">Awaiting approval</p>
        </Link>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Flagged Content</p>
          <p className="text-2xl font-bold text-red-600">
            {moderationStats.flaggedContent}
          </p>
          <p className="text-xs text-muted-foreground">Auto-flagged</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Resolved Today</p>
          <p className="text-2xl font-bold text-green-600">
            {moderationStats.resolvedToday}
          </p>
          <p className="text-xs text-muted-foreground">Great progress!</p>
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
            {recentReports.map((report) => (
              <div key={report.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase text-muted-foreground">
                        {report.type}
                      </span>
                      <span className={`badge ${statusColors[report.status]}`}>
                        {report.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium">{report.content}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Reported by {report.reporter} • {report.reason}
                    </p>
                  </div>
                  <Link
                    href={`/moderation/reports?id=${report.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Actions */}
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Recent Moderation Actions</h2>
          </div>
          <div className="divide-y">
            {recentActions.map((action) => (
              <div key={action.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">{action.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {action.target}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      by {action.moderator} • {action.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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
          <button className="rounded-md border px-4 py-3 text-sm font-medium hover:bg-muted">
            View Flagged Users
          </button>
          <button className="rounded-md border px-4 py-3 text-sm font-medium hover:bg-muted">
            Moderation Guidelines
          </button>
        </div>
      </div>

      {/* Moderation Queue Summary */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="font-semibold mb-4">Queue Summary by Category</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
            <span>Forum Posts</span>
            <span className="font-semibold">5 pending</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
            <span>Product Reviews</span>
            <span className="font-semibold">8 pending</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
            <span>Comments</span>
            <span className="font-semibold">4 pending</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
            <span>User Reports</span>
            <span className="font-semibold">3 pending</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
            <span>Seller Reports</span>
            <span className="font-semibold">2 pending</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
            <span>Other</span>
            <span className="font-semibold">1 pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}
