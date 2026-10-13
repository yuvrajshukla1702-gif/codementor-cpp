export default function Loading() {
  return (
    <div className="-mx-3 -my-3 flex h-[calc(100dvh-3.5rem)] min-h-[560px] flex-col gap-2 p-2" aria-busy="true" aria-label="Loading problem">
      <div className="card flex h-12 items-center gap-3 px-3">
        <div className="skeleton h-5 w-24" />
        <div className="skeleton h-5 w-48" />
        <div className="skeleton ml-auto h-8 w-20" />
        <div className="skeleton h-8 w-24" />
      </div>
      <div className="grid min-h-0 flex-1 gap-2 lg:grid-cols-2">
        <div className="card space-y-3 p-5">
          <div className="skeleton h-8 w-72 max-w-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-[92%]" />
          <div className="skeleton h-4 w-[80%]" />
          <div className="skeleton mt-6 h-28 w-full" />
        </div>
        <div className="card p-5">
          <div className="skeleton h-full min-h-[320px] w-full" />
        </div>
      </div>
    </div>
  );
}
