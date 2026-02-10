import type { Metadata } from "next";
import { MyLibrary } from "@/components/account/my-library";

export const metadata: Metadata = {
  title: "Library",
  description: "Access your purchased digital products and downloads.",
};

export default function LibraryPage() {
  return <MyLibrary />;
}
