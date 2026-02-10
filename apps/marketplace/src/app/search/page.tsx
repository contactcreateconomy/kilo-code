import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchContent } from "@/components/search/search-content";

export const metadata: Metadata = {
  title: "Search Products",
  description: "Search for digital products on Createconomy marketplace.",
};

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
