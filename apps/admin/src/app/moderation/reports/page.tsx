import type { Metadata } from 'next';
import Link from 'next/link';
import { Pagination } from '@/components/tables/pagination';

export const metadata: Metadata = {
  title: 'Reported Content',
  description: 'Review and manage reported content',
};

// Mock data - in production this would come from Convex
const reports = [
  {
    id: '1',
    type: 'post',
    title: 'Spam post in General Discussion',
    content:
      'This post contains promotional links and spam content that violates community guidelines.',
    reporter: {
      name: 'user123',
      email: 'user123@example.com',
    },
    reportedUser: {
      name: 'spammer99',
      email: 'spammer@example.com',
    },
    reason: 'Spam',
    createdAt: '2024-01-25 14:30',
    status: 'pending',
    priority: 'high',
  },
  {
    id: '2',
    type: 'review',
    title: 'Fake product review',
    content:
      'This review appears to be fake with misleading information about the product quality.',
    reporter: {
      name: 'seller_jane',
      email: 'jane@example.com',
    },
    reportedUser: {
      name: 'fake_reviewer',
      email: 'fake@example.com',
    },
    reason: 'Fake/Misleading',
    createdAt: '2024-01-25 12:15',
    status: 'pending',
    priority: 'medium',
  },
  {
    id: '3',
    type: 'comment',
    title: 'Harassment in comment thread',
    content:
      'User is harassing other community members with offensive language and personal attacks.',
    reporter: {
      name: 'helpful_user',
      email: 'helpful@example.com',
    },
    reportedUser: {
      name: 'troll_account',
      email: 'troll@example.com',
    },
    reason: 'Harassment',
    createdAt: '2024-01-25 10:00',
    status: 'in_review',
    priority: 'high',
  },
  {
    id: '4',
    type: 'post',
    title: 'Copyright violation',
    content: 'This post contains copyrighted material without permission.',
    reporter: {
      name: 'copyright_holder',
      email: 'legal@company.com',
    },
    reportedUser: {
      name: 'content_thief',
      email: 'thief@example.com',
    },
    reason: 'Copyright',
    createdAt: '2024-01-24 16:45',
    status: 'pending',
    priority: 'high',
  },
];

const statusColors: Record<string, string> = {
  pending: 'badge-warning',
  in_review: 'badge-info',
  resolved: 'badge-success',
  dismissed: 'badge-secondary',
};

const priorityColors: Record<string, string> = {
  high: 'text-red-600',
  medium: 'text-yellow-600',
  low: 'text-green-600',
};

const typeIcons: Record<string, string> = {
  post: '📝',
  review: '⭐',
  comment: '💬',
  user: '👤',
};

export default function ReportsPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Reported Content</h1>
        </div>
        <div className="flex items-center gap-2">
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">All Types</option>
            <option value="post">Posts</option>
            <option value="review">Reviews</option>
            <option value="comment">Comments</option>
            <option value="user">Users</option>
          </select>
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="rounded-lg border bg-card shadow-sm overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{typeIcons[report.type]}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold">{report.title}</h2>
                      <span className={`badge ${statusColors[report.status]}`}>
                        {report.status.replace('_', ' ')}
                      </span>
                      <span
                        className={`text-xs font-medium ${priorityColors[report.priority]}`}
                      >
                        {report.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {report.content}
                    </p>
                    <div className="mt-4 flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Reported by:{' '}
                        </span>
                        <span className="font-medium">
                          {report.reporter.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Reported user:{' '}
                        </span>
                        <span className="font-medium text-red-600">
                          {report.reportedUser.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reason: </span>
                        <span className="font-medium">{report.reason}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {report.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t px-6 py-4 bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="text-sm text-muted-foreground hover:text-foreground">
                  View Original Content
                </button>
                <button className="text-sm text-muted-foreground hover:text-foreground">
                  View User History
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
                  Dismiss
                </button>
                <button className="rounded-md border border-yellow-500 px-4 py-2 text-sm font-medium text-yellow-600 hover:bg-yellow-50">
                  Warn User
                </button>
                <button className="rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50">
                  Remove Content
                </button>
                <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                  Ban User
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={1}
        totalPages={5}
        totalItems={48}
        itemsPerPage={10}
      />
    </div>
  );
}
