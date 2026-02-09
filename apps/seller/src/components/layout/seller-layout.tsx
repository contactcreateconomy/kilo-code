'use client';

import { SidebarProvider, SidebarInset } from '@createconomy/ui/components/sidebar';
import { AppSidebar } from './app-sidebar';
import { SellerHeader } from './seller-header';
import { SellerGuard } from '@/components/auth/seller-guard';

interface SellerLayoutProps {
  children: React.ReactNode;
}

export function SellerLayout({ children }: SellerLayoutProps) {
  return (
    <SellerGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SellerHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SellerGuard>
  );
}
