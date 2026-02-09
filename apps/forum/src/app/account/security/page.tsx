'use client';

import { useQuery } from 'convex/react';
import { api } from '@createconomy/convex';
import { Spinner } from '@createconomy/ui';
import { Shield, Key, Smartphone, Globe } from 'lucide-react';

/**
 * SecurityPage — Account security settings.
 *
 * Shows connected OAuth accounts (Google, GitHub) and session info.
 * Since the platform uses OAuth-only auth (no passwords), this page
 * focuses on connected accounts and session management.
 */
export default function SecurityPage() {
  const user = useQuery(api.functions.users.getCurrentUser);

  if (user === undefined) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Security</h1>
        <div className="flex justify-center py-16">
          <Spinner size="xl" className="text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Security</h1>
        <p className="text-muted-foreground">Unable to load account data.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Security</h1>
      </div>

      {/* Connected Accounts */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Connected Accounts</h2>
        <p className="text-sm text-muted-foreground mb-4">
          These are the sign-in methods linked to your account. You can sign in
          using any of these providers.
        </p>

        <div className="space-y-3">
          {/* Google */}
          <div className="rounded-lg border bg-card p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Globe className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Google</p>
              <p className="text-xs text-muted-foreground">
                {user.email ?? 'Not connected'}
              </p>
            </div>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-500/10 px-2 py-1 rounded-full">
              Connected
            </span>
          </div>

          {/* GitHub */}
          <div className="rounded-lg border bg-card p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Key className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">GitHub</p>
              <p className="text-xs text-muted-foreground">
                OAuth sign-in provider
              </p>
            </div>
            <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-full">
              Available
            </span>
          </div>
        </div>
      </section>

      {/* Session Info */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Active Session</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Your current session information. Sessions are managed via secure
          cross-subdomain tokens.
        </p>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Current Session</p>
              <p className="text-xs text-muted-foreground">
                Signed in as <strong>{user.email ?? 'N/A'}</strong>
              </p>
            </div>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              Active
            </span>
          </div>
        </div>
      </section>

      {/* Security Tips */}
      <section>
        <div className="rounded-lg border bg-muted/50 p-4">
          <h3 className="font-medium mb-2">Security Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• We use OAuth (Google/GitHub) for secure password-free sign-in</li>
            <li>• Sessions are automatically refreshed with rotating tokens</li>
            <li>• Cross-subdomain auth is handled via secure HTTP-only tokens</li>
            <li>• Sign out from all devices by signing out from your OAuth provider</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
