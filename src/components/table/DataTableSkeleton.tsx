import { Skeleton } from "../ui/skeleton";

export default function DataTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search and Filters Skeleton */}
      <div className="tablet:flex-row tablet:items-center flex flex-col items-stretch justify-between gap-4">
        <Skeleton className="tablet:max-w-md h-10 w-full" />

        <div className="tablet:flex-row-reverse tablet:items-center flex w-full flex-col-reverse items-stretch gap-4">
          <Skeleton className="tablet:max-w-[300px] h-10 w-full" />
          <Skeleton className="tablet:max-w-[300px] h-10 w-full" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="space-y-3">
        {/* Table Header Skeleton */}
        <div className="flex items-center space-x-4 py-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>

        {/* Table Rows Skeleton */}
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4 border-b py-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}
