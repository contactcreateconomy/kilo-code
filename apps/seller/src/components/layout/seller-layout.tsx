"use client";

import { SellerSidebar } from "./seller-sidebar";
import { SellerHeader } from "./seller-header";
import { DotGridBackground } from "@createconomy/ui";

interface SellerLayoutProps {
  children: React.ReactNode;
}

export function SellerLayout({ children }: SellerLayoutProps) {
  return (
    <DotGridBackground className="h-screen">
      <div className="flex h-full">
        {/* Sidebar */}
        <SellerSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <SellerHeader />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </DotGridBackground>
  );
}
