import type { Metadata } from "next";
import { AccountContent } from "./account-content";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your Createconomy Forum account settings",
};

/**
 * AccountLayout — Server component for metadata. Delegates rendering to the
 * client-side AccountContent component which includes an auth guard.
 */
export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountContent>{children}</AccountContent>;
}
