import type { Metadata } from "next";
import { MyDownloads } from "@/components/account/my-downloads";

export const metadata: Metadata = {
  title: "My Downloads",
  description: "Access your purchased digital products.",
};

export default function DownloadsPage() {
  return <MyDownloads />;
}
