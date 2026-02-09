import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldX } from 'lucide-react';
import { Logo } from '@createconomy/ui/components/logo';
import { Button } from '@createconomy/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@createconomy/ui/components/card';

export const metadata: Metadata = {
  title: 'Unauthorized',
  description: 'You do not have permission to access this page',
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/50 p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size={48} />
        </div>

        <Card>
          <CardHeader className="items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-2">
              <ShieldX className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access the admin dashboard. This
              area is restricted to administrators and moderators only.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/auth/signin">Sign in with a different account</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href={process.env['NEXT_PUBLIC_MARKETPLACE_URL'] || '/'}>
                Return to Marketplace
              </a>
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-2">
              If you believe this is an error, please contact your system
              administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
