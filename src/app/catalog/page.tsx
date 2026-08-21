import { Suspense } from "react";
import CoursesTable from "@/components/CoursesTable";
import DataTableSkeleton from "@/components/table/DataTableSkeleton";

export default function CatalogPage() {
  return (
    <div className="flex justify-center items-center p-4 flex-col w-full max-w-full overflow-hidden">
      <div className="w-full max-w-7xl">
        <Suspense fallback={<DataTableSkeleton />}>
          <CoursesTable />
        </Suspense>
      </div>
    </div>
  );
}
