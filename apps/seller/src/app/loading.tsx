export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header Skeleton */}
      <div className="h-16 border-b border-[var(--border)] bg-[var(--background)]">
        <div className="flex items-center justify-between h-full px-6">
          <div className="h-8 w-32 bg-[var(--muted)] rounded animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-[var(--muted)] rounded-full animate-pulse" />
            <div className="h-8 w-24 bg-[var(--muted)] rounded animate-pulse" />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Skeleton */}
        <div className="w-64 h-[calc(100vh-4rem)] border-r border-[var(--border)] p-4">
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-10 bg-[var(--muted)] rounded animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 p-6">
          {/* Page Title */}
          <div className="mb-6">
            <div className="h-8 w-48 bg-[var(--muted)] rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-[var(--muted)] rounded animate-pulse" />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-[var(--muted)] rounded-lg animate-pulse"
              />
            ))}
          </div>

          {/* Chart and Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 h-80 bg-[var(--muted)] rounded-lg animate-pulse" />
            <div className="h-80 bg-[var(--muted)] rounded-lg animate-pulse" />
          </div>

          {/* Table */}
          <div className="h-64 bg-[var(--muted)] rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
