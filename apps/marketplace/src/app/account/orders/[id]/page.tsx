import type { Metadata } from "next";
import { OrderDetail } from "@/components/account/order-detail";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Order ${id}`,
    description: `View details for order ${id}`,
  };
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  return <OrderDetail orderId={id} />;
}
