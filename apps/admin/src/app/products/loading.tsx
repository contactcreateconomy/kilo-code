export default function ProductsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="skeleton h-9 w-32 mb-2" />
          <div className="skeleton h-5 w-64" />
        </div>
        <div className="flex items-center gap-2">
          <div className="skeleton h-10 w-48" />
          <div className="skeleton h-10 w-36" />
          <div className="skeleton h-10 w-32" />
          <div className="skeleton h-10 w-28" />
        </div>
      </div>

      <div className="skeleton h-12 w-full rounded-lg" />

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <div className="skeleton h-4 w-8" />
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-16" />
            <div className="skeleton h-4 w-16" />
            <div className="skeleton h-4 w-16" />
            <div className="skeleton h-4 w-20" />
          </div>
        </div>
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 border-b last:border-b-0"
          >
            <div className="skeleton h-4 w-4" />
            <div className="flex items-center gap-3">
              <div className="skeleton h-10 w-10 rounded" />
              <div>
                <div className="skeleton h-4 w-40 mb-1" />
                <div className="skeleton h-3 w-24" />
              </div>
            </div>
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-4 w-16" />
            <div className="skeleton h-4 w-12" />
            <div className="skeleton h-6 w-16 rounded-full" />
            <div className="flex items-center gap-2">
              <div className="skeleton h-4 w-10" />
              <div className="skeleton h-4 w-14" />
            </div>
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
