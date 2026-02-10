import type { Metadata } from "next";
import { MyReviews } from "@/components/account/my-reviews";

export const metadata: Metadata = {
  title: "My Reviews",
  description: "View and manage your product reviews.",
};

export default function ReviewsPage() {
  return <MyReviews />;
}
