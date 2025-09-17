"use client";

import { useNDJSONStream } from "@/hooks/useNDJSONStream";
import { CourseScore } from "@/types/types";

import { DataTable } from "./table/data-table";
import DataTableSkeleton from "./table/DataTableSkeleton";

export default function CoursesTable() {
  const { data, loading, error } = useNDJSONStream<CourseScore>(
    "https://public.osuc.dev/courses-score.ndjson"
  );

  if (error) return <p>Error: {error.message}</p>;
  return (
    <>
      {loading && <DataTableSkeleton></DataTableSkeleton>}
      {!loading && <DataTable data={data} />}
    </>
  );
}
