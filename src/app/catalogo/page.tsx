"use client";

import { useSearchParams } from "next/navigation";
import CoursesTable from "@/components/CoursesTable";

export default function CatalogPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  return (
    <div className="flex justify-center items-center p-4 flex-col w-full max-w-full overflow-hidden">
      <div className="w-full max-w-7xl">
        <CoursesTable externalSearchValue={search} />
      </div>
    </div>
  );
}
