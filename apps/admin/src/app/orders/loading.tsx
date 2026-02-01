export default function OrdersLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="skeleton h-9 w-32 mb-2" />
          <div className="skeleton h-5 w-64" />
        </div>
        <div className="flex items-center gap-2">
          <div className="skeleton h-10 w-48" />
          <div className="skeleton h-10 w-32" />
          <div className="skeleton h-10 w-32" />
          <div className="skeleton h-10 w-32" />
          <div className="skeleton h-10 w-28" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="skeleton h-4 w-24 mb-2" />
            <div className="skeleton h-8 w-16 mb-1" />
            <div className="skeleton h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-16" />
            <div className="skeleton h-4 w-16" />
            <div className="skeleton h-4 w-16" />
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-4 w-16" />
          </div>
        </div>
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 border-b last:border-b-0"
          >
            <div className="skeleton h-4 w-20" />
            <div>
              <div className="skeleton h-4 w-32 mb-1" />
              <div className="skeleton h-3 w-40" />
            </div>
            <div className="skeleton h-4 w-16" />
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-6 w-20 rounded-full" />
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-12" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="skeleton h-4 w-48" />
        <div className="flex items-center gap-2">
          <div className="skeleton h-10 w-24" />
          <div className="skeleton h-10 w-24" />
        </div>
      </div>
    </div>
  );
}
