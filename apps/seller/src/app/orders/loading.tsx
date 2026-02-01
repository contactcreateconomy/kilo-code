export default function OrdersLoading() {
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
          <div className="mb-6">
            <div className="h-8 w-32 bg-[var(--muted)] rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-[var(--muted)] rounded animate-pulse" />
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2 mb-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-10 w-24 bg-[var(--muted)] rounded-lg animate-pulse"
              />
            ))}
          </div>

          {/* Filters */}
          <div className="h-16 bg-[var(--muted)] rounded-lg animate-pulse mb-6" />

          {/* Orders List */}
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-[var(--muted)] rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
