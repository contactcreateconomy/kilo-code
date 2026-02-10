import type { Metadata } from "next";
import { OrdersList } from "@/components/account/orders-list";

export const metadata: Metadata = {
  title: "Order History",
  description: "View your order history.",
};

export default function OrdersPage() {
  return <OrdersList />;
}
