'use client';

import { AdminHeader } from './admin-header';
import { AdminSidebar } from './admin-sidebar';
import { AdminGuard } from '@/components/auth/admin-guard';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <AdminSidebar />
        <main className="pl-64 pt-14">
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
    </AdminGuard>
  );
}
