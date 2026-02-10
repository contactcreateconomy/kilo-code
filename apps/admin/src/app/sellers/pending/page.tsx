'use client';

import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@createconomy/convex';
import { Loader2 } from 'lucide-react';
import type { Id } from '@createconomy/convex/dataModel';

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function PendingApplicationsPage() {
  const pendingSellers = useQuery(api.functions.admin.listPendingSellers, {});
  const approve = useMutation(api.functions.admin.approveSeller);

  const handleApprove = async (sellerId: Id<'sellers'>) => {
    await approve({ sellerId, approved: true });
  };

  const handleReject = async (sellerId: Id<'sellers'>) => {
    await approve({ sellerId, approved: false });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/sellers"
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Sellers
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-3xl font-bold tracking-tight">
            Pending Applications
          </h1>
          {pendingSellers && (
            <span className="badge badge-warning">
              {pendingSellers.length} pending
            </span>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-warning">⚠️</span>
          <span>
            Review each application carefully. Approved sellers will be able to
            list products on the marketplace.
          </span>
        </div>
      </div>

      {!pendingSellers ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : pendingSellers.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
          <div className="mb-4 text-4xl">✅</div>
          <h2 className="mb-2 text-xl font-semibold">All caught up!</h2>
          <p className="text-muted-foreground">
            There are no pending seller applications to review.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingSellers.map((application) => (
            <div
              key={String(application._id)}
              className="rounded-lg border bg-card shadow-sm"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-bold">
                      {(application.user?.name ?? '?').charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">
                        {application.businessName ?? 'Unnamed Store'}
                      </h2>
                      <p className="text-muted-foreground">
                        {application.user?.name ?? 'Unknown'} •{' '}
                        {application.user?.email ?? ''}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Applied on {formatDate(application.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  {application.description && (
                    <div>
                      <h3 className="mb-2 font-medium">Store Description</h3>
                      <p className="text-sm text-muted-foreground">
                        {application.description}
                      </p>
                    </div>
                  )}
                  {application.businessEmail && (
                    <div>
                      <h3 className="mb-2 font-medium">Business Email</h3>
                      <p className="text-sm text-muted-foreground">
                        {application.businessEmail}
                      </p>
                    </div>
                  )}
                  {application.websiteUrl && (
                    <div>
                      <h3 className="mb-2 font-medium">Website</h3>
                      <a
                        href={application.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        🌐 {application.websiteUrl}
                      </a>
                    </div>
                  )}
                  {application.twitterHandle && (
                    <div>
                      <h3 className="mb-2 font-medium">Twitter</h3>
                      <p className="text-sm text-muted-foreground">
                        𝕏 {application.twitterHandle}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-6 py-4">
                <button
                  onClick={() => handleReject(application._id)}
                  className="rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(application._id)}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
