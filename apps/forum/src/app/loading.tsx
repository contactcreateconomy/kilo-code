import { Skeleton } from "@createconomy/ui";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section Skeleton */}
      <section className="mb-12 text-center">
        <Skeleton className="h-10 w-96 mx-auto mb-4" />
        <Skeleton className="h-6 w-[600px] mx-auto mb-6" />
        <Skeleton className="h-12 w-[500px] mx-auto" />
      </section>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Skeleton */}
        <div className="flex-1 space-y-8">
          {/* Pinned Threads Skeleton */}
          <section>
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </section>

          {/* Categories Skeleton */}
          <section>
            <Skeleton className="h-8 w-32 mb-4" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <Skeleton className="h-6 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </section>

          {/* Recent Threads Skeleton */}
          <section>
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Skeleton */}
        <aside className="w-full lg:w-80">
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-10 w-full mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="rounded-lg border p-4">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
