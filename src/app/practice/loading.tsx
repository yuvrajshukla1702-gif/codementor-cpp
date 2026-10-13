export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-1 py-6 sm:px-3 sm:py-8" aria-busy="true" aria-label="Loading problems">
      <div className="skeleton h-3 w-16" />
      <div className="skeleton mt-3 h-10 w-48" />
      <div className="skeleton mt-6 h-11 w-full" />
      <div className="mt-4 flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-8 w-24 !rounded-full" />
        ))}
      </div>
      <div className="card mt-5 divide-y divide-[var(--line)] overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-4">
            <div className="skeleton h-5 w-5 !rounded-full" />
            <div className="skeleton h-4 w-56 max-w-[60%]" />
            <div className="skeleton ml-auto h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
