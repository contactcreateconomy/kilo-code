import { Suspense } from "react";
import { ForumLayout } from "@/components/layout/forum-layout";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { FeaturedSlider } from "@/components/feed/featured-slider";
import { DiscussionFeed } from "@/components/feed/discussion-feed";
import { DiscussionCardSkeleton, FeaturedSliderSkeleton } from "@/components/ui/skeletons";
import { mockDiscussions, mockFeaturedDiscussions } from "@/data/mock-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Createconomy Forum - Community Discussions",
  description:
    "Join the Createconomy community forum. Discuss digital products, share knowledge, get help, and connect with creators and buyers.",
};

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <DiscussionCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function ForumHomePage() {
  return (
    <ForumLayout
      leftSidebar={<LeftSidebar />}
      rightSidebar={<RightSidebar />}
    >
      {/* Center Content */}
      <div className="space-y-8">
        {/* Featured Slider */}
        <section>
          <Suspense fallback={<FeaturedSliderSkeleton />}>
            <FeaturedSlider discussions={mockFeaturedDiscussions} />
          </Suspense>
        </section>

        {/* Discussion Feed */}
        <section>
          <Suspense fallback={<FeedSkeleton />}>
            <DiscussionFeed initialDiscussions={mockDiscussions} />
          </Suspense>
        </section>
      </div>
    </ForumLayout>
  );
}
