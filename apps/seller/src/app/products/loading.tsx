export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="flex">
        {/* Sidebar Skeleton */}
        <div className="w-64 h-screen border-r border-[var(--border)] p-4">
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-10 bg-[var(--muted)] rounded animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-8 w-32 bg-[var(--muted)] rounded animate-pulse mb-2" />
              <div className="h-4 w-48 bg-[var(--muted)] rounded animate-pulse" />
            </div>
            <div className="h-10 w-32 bg-[var(--muted)] rounded animate-pulse" />
          </div>

          {/* Filters */}
          <div className="h-16 bg-[var(--muted)] rounded-lg animate-pulse mb-6" />

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-[var(--muted)] rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
