'use client';

import { AdminHeader } from './admin-header';
import { AdminSidebar } from './admin-sidebar';
import { AdminGuard } from '@/components/auth/admin-guard';
import { DotGridBackground } from '@createconomy/ui';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminGuard>
      <DotGridBackground className="min-h-screen">
        <div className="relative">
          <AdminHeader />
          <AdminSidebar />
          <main className="pl-64 pt-14">
            <div className="container mx-auto p-6">{children}</div>
          </main>
        </div>
      </DotGridBackground>
    </AdminGuard>
  );
}
