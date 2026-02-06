import type { MetadataRoute } from "next";

// In a real application, these would be fetched from the database
async function getCategories() {
  // Placeholder - would fetch from Convex
  return [
    { slug: "general", updatedAt: new Date() },
    { slug: "announcements", updatedAt: new Date() },
    { slug: "feedback", updatedAt: new Date() },
    { slug: "support", updatedAt: new Date() },
    { slug: "marketplace", updatedAt: new Date() },
    { slug: "showcase", updatedAt: new Date() },
  ];
}

async function getRecentThreads() {
  // Placeholder - would fetch from Convex
  // In production, this would return the most recent/popular threads
  return [] as Array<{ id: string; updatedAt: Date }>;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] || "https://discuss.createconomy.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${baseUrl}/c`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/guidelines`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Category pages
  const categories = await getCategories();
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/c/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Thread pages (recent/popular threads)
  const threads = await getRecentThreads();
  const threadPages: MetadataRoute.Sitemap = threads.map((thread) => ({
    url: `${baseUrl}/t/${thread.id}`,
    lastModified: thread.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...threadPages];
}
