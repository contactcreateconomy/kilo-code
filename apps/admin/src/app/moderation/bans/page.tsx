'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@createconomy/convex';

/**
 * Bans management page — lists active bans with unban capability.
 */
export default function BansPage() {
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const bans = useQuery(api.functions.moderation.listBans, { limit: 50 });
  const unbanUser = useMutation(api.functions.moderation.unbanUser);

  const handleUnban = async (userId: string) => {
    setActionInProgress(userId);
    try {
      await unbanUser({
        userId: userId as never,
        reason: 'Ban manually lifted by moderator',
      });
    } catch (err) {
      console.error('Failed to unban user:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const isLoading = bans === undefined;

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
          <h1 className="text-3xl font-bold tracking-tight">Active Bans</h1>
          {bans && (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {bans.length} active
            </span>
          )}
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
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : bans && bans.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
          <p className="text-lg font-medium">No active bans</p>
          <p className="mt-1 text-sm text-muted-foreground">
            All clear — no users are currently banned.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Reason</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Banned By</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Expires</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bans?.map((ban) => {
                const isProcessing = actionInProgress === ban.userId;
                return (
                  <tr
                    key={ban._id}
                    className={`transition-opacity ${isProcessing ? 'opacity-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{ban.userName}</p>
                        <p className="text-xs text-muted-foreground">@{ban.userUsername}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate">
                      {ban.reason}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          ban.isPermanent
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}
                      >
                        {ban.isPermanent ? 'Permanent' : 'Temporary'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {ban.bannedByName}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {ban.isPermanent
                        ? 'Never'
                        : ban.expiresAt
                          ? new Date(ban.expiresAt).toLocaleDateString()
                          : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleUnban(ban.userId)}
                        className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Unbanning...' : 'Unban'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
