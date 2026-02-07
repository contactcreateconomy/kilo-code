import type { Metadata } from 'next';
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
          This is a restricted area. Only authorized administrators can access
          this dashboard.
        </p>
      }
    >
      <SignInForm />
    </AuthPageWrapper>
  );
}
