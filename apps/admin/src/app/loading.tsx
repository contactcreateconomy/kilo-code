export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="skeleton h-9 w-48 mb-2" />
        <div className="skeleton h-5 w-72" />
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border bg-card p-6 shadow-sm"
          >
            <div className="skeleton h-4 w-24 mb-2" />
            <div className="skeleton h-8 w-32 mb-1" />
            <div className="skeleton h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-lg border bg-card p-6 shadow-sm">
          <div className="skeleton h-6 w-32 mb-4" />
          <div className="skeleton h-[300px] w-full" />
        </div>
        <div className="col-span-3 rounded-lg border bg-card p-6 shadow-sm">
          <div className="skeleton h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-12 w-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-6">
          <div className="skeleton h-6 w-40 mb-4" />
        </div>
        <div className="border-t">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 border-b last:border-b-0"
            >
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-4 w-32" />
              <div className="skeleton h-4 w-20" />
              <div className="skeleton h-4 w-16" />
              <div className="skeleton h-4 w-24 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
