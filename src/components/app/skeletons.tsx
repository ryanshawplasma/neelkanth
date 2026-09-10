import { Skeleton } from "@/components/ui/misc";

export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="px-4 pt-4">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="mt-2 h-4 w-56" />
      <Skeleton className="mt-4 h-11 w-full rounded-2xl" />
      <div className="mt-3 flex gap-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
      <ul className="mt-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <li key={i} className="flex gap-3 rounded-2xl border border-border bg-surface p-2.5">
            <Skeleton className="h-[92px] w-[92px] rounded-xl" />
            <div className="flex-1 space-y-2 py-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RailSkeleton() {
  return (
    <div className="mt-6">
      <Skeleton className="mx-4 h-5 w-44" />
      <div className="mt-3 flex gap-3 overflow-hidden px-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-[228px] shrink-0 rounded-2xl border border-border bg-surface">
            <Skeleton className="aspect-[4/3] rounded-b-none" />
            <div className="space-y-2 p-3">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className="pb-8">
      <div className="px-4 pt-4">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-2 h-4 w-60" />
        <Skeleton className="mt-3 h-11 w-full rounded-2xl" />
        <Skeleton className="mt-4 h-[170px] w-full rounded-2xl" />
      </div>
      <RailSkeleton />
      <RailSkeleton />
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    </div>
  );
}
