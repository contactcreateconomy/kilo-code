import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Unauthorized',
  description: 'You do not have permission to access this page',
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <div className="mx-auto w-full max-w-md space-y-6 p-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-destructive"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-destructive">
            Access Denied
          </h1>
          <p className="text-muted-foreground mt-2">
            You do not have permission to access the admin dashboard. This area
            is restricted to administrators and moderators only.
          </p>
        </div>
        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Sign in with a different account
          </Link>
          <a
            href={process.env.NEXT_PUBLIC_MARKETPLACE_URL || '/'}
            className="inline-flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Return to Marketplace
          </a>
        </div>
        <p className="text-sm text-muted-foreground">
          If you believe this is an error, please contact your system
          administrator.
        </p>
      </div>
    </div>
  );
}
