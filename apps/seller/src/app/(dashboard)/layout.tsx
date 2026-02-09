import { SellerLayout } from '@/components/layout/seller-layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SellerLayout>{children}</SellerLayout>;
}
