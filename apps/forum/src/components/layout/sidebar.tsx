import Link from "next/link";
import { CategoryCard } from "@/components/forum/category-card";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  threadCount: number;
  postCount: number;
  icon?: string;
  color?: string;
}

interface SidebarProps {
  categories?: Category[];
  currentCategory?: string;
}

// Default categories for when data isn't loaded
const defaultCategories: Category[] = [
  {
    id: "1",
    name: "General Discussion",
    slug: "general",
    description: "General topics and conversations",
    threadCount: 0,
    postCount: 0,
    icon: "💬",
    color: "blue",
  },
  {
    id: "2",
    name: "Announcements",
    slug: "announcements",
    description: "Official announcements and updates",
    threadCount: 0,
    postCount: 0,
    icon: "📢",
    color: "yellow",
  },
  {
    id: "3",
    name: "Feedback",
    slug: "feedback",
    description: "Share your feedback and suggestions",
    threadCount: 0,
    postCount: 0,
    icon: "💡",
    color: "green",
  },
  {
    id: "4",
    name: "Support",
    slug: "support",
    description: "Get help from the community",
    threadCount: 0,
    postCount: 0,
    icon: "🆘",
    color: "red",
  },
  {
    id: "5",
    name: "Marketplace",
    slug: "marketplace",
    description: "Discuss products and sellers",
    threadCount: 0,
    postCount: 0,
    icon: "🛒",
    color: "purple",
  },
  {
    id: "6",
    name: "Showcase",
    slug: "showcase",
    description: "Show off your creations",
    threadCount: 0,
    postCount: 0,
    icon: "✨",
    color: "pink",
  },
];

export function Sidebar({ categories = defaultCategories, currentCategory }: SidebarProps) {
  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="sticky top-24 space-y-6">
        {/* Categories Section */}
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Categories</h2>
            <Link
              href="/c"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          </div>
          <nav className="space-y-1">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/c/${category.slug}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  currentCategory === category.slug
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                <span>{category.icon}</span>
                <span className="truncate">{category.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Quick Stats */}
        <div className="bg-card rounded-lg border p-4">
          <h2 className="font-semibold text-sm mb-4">Community Stats</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Members</span>
              <span className="font-medium">--</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Threads</span>
              <span className="font-medium">--</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Posts</span>
              <span className="font-medium">--</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Online</span>
              <span className="font-medium text-green-500">--</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-card rounded-lg border p-4">
          <h2 className="font-semibold text-sm mb-4">Quick Links</h2>
          <nav className="space-y-2">
            <Link
              href="/t/new"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <span>➕</span>
              <span>New Thread</span>
            </Link>
            <Link
              href="/search"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <span>🔍</span>
              <span>Search</span>
            </Link>
            <Link
              href="/guidelines"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <span>📜</span>
              <span>Guidelines</span>
            </Link>
            <Link
              href="/faq"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <span>❓</span>
              <span>FAQ</span>
            </Link>
          </nav>
        </div>

        {/* Tags Cloud (Optional) */}
        <div className="bg-card rounded-lg border p-4">
          <h2 className="font-semibold text-sm mb-4">Popular Tags</h2>
          <div className="flex flex-wrap gap-2">
            {["help", "question", "tutorial", "showcase", "feedback", "bug", "feature", "discussion"].map(
              (tag) => (
                <Link
                  key={tag}
                  href={`/search?tag=${tag}`}
                  className="px-2 py-1 bg-accent rounded-md text-xs hover:bg-accent/80 transition-colors"
                >
                  #{tag}
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
