import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ThreadList } from "@/components/forum/thread-list";
import { Sidebar } from "@/components/layout/sidebar";
import { SearchBar } from "@/components/forum/search-bar";
import { Button, Skeleton } from "@createconomy/ui";
import type { Metadata } from "next";

// Mock function - in production, this would fetch from Convex
async function getCategory(slug: string) {
  // Simulated category data
  const categories: Record<
    string,
    { name: string; description: string; icon: string; threadCount: number }
  > = {
    general: {
      name: "General Discussion",
      description: "General conversations about anything related to Createconomy",
      icon: "💬",
      threadCount: 156,
    },
    "product-help": {
      name: "Product Help",
      description: "Get help with digital products you've purchased",
      icon: "❓",
      threadCount: 89,
    },
    "creator-tools": {
      name: "Creator Tools",
      description: "Discuss tools and resources for creators",
      icon: "🛠️",
      threadCount: 67,
    },
    announcements: {
      name: "Announcements",
      description: "Official announcements from the Createconomy team",
      icon: "📢",
      threadCount: 23,
    },
    feedback: {
      name: "Feedback & Suggestions",
      description: "Share your ideas to improve Createconomy",
      icon: "💡",
      threadCount: 45,
    },
    showcase: {
      name: "Showcase",
      description: "Show off your creations and get feedback",
      icon: "🎨",
      threadCount: 112,
    },
  };

  return categories[slug] || null;
}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: category.name,
    description: category.description,
    openGraph: {
      title: `${category.name} | Createconomy Forum`,
      description: category.description,
    },
  };
}

function ThreadListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page = "1", sort = "recent" } = await searchParams;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const currentPage = parseInt(page, 10);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground">
          Forum
        </Link>
        <span className="mx-2">/</span>
        <Link href="/c" className="hover:text-foreground">
          Categories
        </Link>
        <span className="mx-2">/</span>
        <span>{category.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Category Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{category.icon}</span>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    {category.name}
                  </h1>
                  <p className="text-muted-foreground">{category.description}</p>
                </div>
              </div>
              <Button asChild>
                <Link href={`/t/new?category=${slug}`}>New Thread</Link>
              </Button>
            </div>

            {/* Stats and Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{category.threadCount} threads</span>
              </div>
              <div className="flex items-center gap-4">
                <SearchBar
                  placeholder={`Search in ${category.name}...`}
                  className="w-64"
                />
                <select
                  className="rounded-md border bg-background px-3 py-2 text-sm"
                  defaultValue={sort}
                >
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                  <option value="unanswered">Unanswered</option>
                </select>
              </div>
            </div>
          </div>

          {/* Thread List */}
          <Suspense fallback={<ThreadListSkeleton />}>
            <ThreadList
              categorySlug={slug}
              page={currentPage}
              sort={sort}
            />
          </Suspense>

          {/* Pagination */}
          <div className="mt-8 flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              asChild={currentPage > 1}
            >
              {currentPage > 1 ? (
                <Link href={`/c/${slug}?page=${currentPage - 1}&sort=${sort}`}>
                  Previous
                </Link>
              ) : (
                "Previous"
              )}
            </Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              Page {currentPage}
            </span>
            <Button variant="outline" asChild>
              <Link href={`/c/${slug}?page=${currentPage + 1}&sort=${sort}`}>
                Next
              </Link>
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80">
          <Sidebar categorySlug={slug} />
        </aside>
      </div>
    </div>
  );
}
