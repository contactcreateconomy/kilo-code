import type { Metadata } from 'next';
import { SignInForm } from '@/components/auth/sign-in-form';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to the Createconomy Admin Dashboard',
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <div className="mx-auto w-full max-w-md space-y-6 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to access the admin console
          </p>
        </div>
        <SignInForm />
        <p className="text-center text-sm text-muted-foreground">
          This is a restricted area. Only authorized administrators can access
          this dashboard.
        </p>
      </div>
    </div>
  );
}
