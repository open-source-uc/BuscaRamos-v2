import { Skeleton } from "../ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

export default function DataTableSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search and Filters Skeleton */}
      <div className="flex flex-col gap-4">
        <div className="w-full">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="text-sm">
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="w-full">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="w-full flex justify-center">
        <div className="desktop:block hidden pt-4">
          <div className="bg-accent border-border rounded-md border w-[90vw] max-w-[90vw] overflow-x-auto">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[8%]">
                    <Skeleton className="h-5 w-12" />
                  </TableHead>
                  <TableHead className="w-[30%]">
                    <Skeleton className="h-5 w-20" />
                  </TableHead>
                  <TableHead className="w-[6%]">
                    <Skeleton className="h-5 w-16" />
                  </TableHead>
                  <TableHead className="w-[20%]">
                    <Skeleton className="h-5 w-16" />
                  </TableHead>
                  <TableHead className="w-[18%]">
                    <Skeleton className="h-5 w-32" />
                  </TableHead>
                  <TableHead className="w-[18%]">
                    <Skeleton className="h-5 w-16" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 10 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="w-[8%]">
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell className="w-[30%]">
                      <Skeleton className="h-4 w-full max-w-[200px]" />
                    </TableCell>
                    <TableCell className="w-[6%]">
                      <Skeleton className="h-4 w-6 mx-auto" />
                    </TableCell>
                    <TableCell className="w-[20%]">
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell className="w-[18%]">
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell className="w-[18%]">
                      <Skeleton className="h-8 w-16" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4 w-[90vw] max-w-[90vw]">
            <div className="flex-1">
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="space-x-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </div>
        {/* Mobile skeleton */}
        <div className="desktop:hidden w-full pt-4">
          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-accent border-border rounded-md border p-4 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}
