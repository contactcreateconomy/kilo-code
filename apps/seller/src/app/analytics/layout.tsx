import { SellerLayout } from "@/components/layout/seller-layout";

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SellerLayout>
      {/* Analytics Navigation */}
      <div className="mb-6">
        <nav className="flex gap-4 border-b border-border pb-4">
          <a
            href="/analytics"
            className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
          >
            Overview
          </a>
          <a
            href="/analytics/products"
            className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
          >
            Products
          </a>
        </nav>
      </div>
      {children}
    </SellerLayout>
  );
}
