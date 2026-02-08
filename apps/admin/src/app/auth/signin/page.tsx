import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthPageWrapper } from '@createconomy/ui/components/auth';
import { SignInForm } from '@/components/auth/sign-in-form';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to the Createconomy Admin Dashboard',
};

export default function SignInPage() {
  return (
    <AuthPageWrapper
      title="Admin Dashboard"
      subtitle="Sign in to access the admin console"
      footer={
        <p>
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      }
    >
      <SignInForm />

      {/* Admin restriction notice */}
      <div className="mt-4 text-center text-sm">
        <span className="text-muted-foreground">
          This is a restricted area. Only authorized administrators can access
          this dashboard.
        </span>
      </div>
    </AuthPageWrapper>
  );
}
