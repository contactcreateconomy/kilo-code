import type { Metadata } from "next";
import { AccountSettings } from "@/components/account/account-settings";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your account settings and preferences.",
};

export default function SettingsPage() {
  return <AccountSettings />;
}
