import { SellerGuard } from "@/components/auth/seller-guard";
import { SellerSidebar } from "@/components/layout/seller-sidebar";
import { SellerHeader } from "@/components/layout/seller-header";

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SellerGuard>
      <div className="min-h-screen bg-[var(--background)]">
        <SellerHeader />
        <div className="flex">
          <SellerSidebar />
          <main className="flex-1 p-6">
            {/* Analytics Navigation */}
            <div className="mb-6">
              <nav className="flex gap-4 border-b border-[var(--border)] pb-4">
                <a
                  href="/analytics"
                  className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-[var(--muted)] transition-colors"
                >
                  Overview
                </a>
                <a
                  href="/analytics/products"
                  className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-[var(--muted)] transition-colors"
                >
                  Products
                </a>
              </nav>
            </div>
            {children}
          </main>
        </div>
      </div>
    </SellerGuard>
  );
}
