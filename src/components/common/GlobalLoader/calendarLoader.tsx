export function CalendarLoader() {
  return (
    <>
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 my-6 animate-pulse">
        <div className="w-32 h-6 bg-gray-300 rounded" />
        <div className="w-36 h-6 bg-gray-300 rounded" />
      </div>

      {/* Weekday Headers Skeleton */}
      <div className="grid grid-cols-7 bg-muted/50">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="p-3 text-sm font-medium text-center animate-pulse text-muted-foreground"
          >
            <div className="mx-auto w-16 h-4 bg-gray-300 rounded" />
          </div>
        ))}
      </div>

      {/* Calendar Grid Skeleton */}
      <div className="grid grid-cols-7 gap-px">
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={i}
            className="p-2 rounded border animate-pulse min-h-[120px] bg-muted/60"
          >
            {/* Day number */}
            <div className="flex justify-end mb-2">
              <div className="w-6 h-4 bg-gray-300 rounded" />
            </div>

            {/* Interview lines */}
            <div className="space-y-1">
              <div className="w-5/6 h-3 bg-gray-300 rounded" />
              <div className="w-4/5 h-3 bg-gray-200 rounded" />
              <div className="w-2/3 h-3 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
