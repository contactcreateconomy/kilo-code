'use client';

import { SidebarProvider, SidebarInset } from '@createconomy/ui/components/sidebar';
import { AppSidebar } from './app-sidebar';
import { AdminHeader } from './admin-header';
import { AdminGuard } from '@/components/auth/admin-guard';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AdminHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AdminGuard>
  );
}
