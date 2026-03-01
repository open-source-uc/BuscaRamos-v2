"use client";

import { useEffect } from "react";
import { useNDJSONStream } from "@/hooks/useNDJSONStream";
import { CourseScore } from "@/types/types";
import { useSetCurrentSemester } from "@/context/semesterCtx";

import { DataTable } from "./table/data-table";
import DataTableSkeleton from "./table/DataTableSkeleton";

export default function CoursesTable() {
  const { data, loading, error } = useNDJSONStream<CourseScore>(
    "https://public.osuc.dev/courses-score.ndjson"
  );
  const setCurrentSemester = useSetCurrentSemester();

  useEffect(() => {
    if (loading || data.length === 0) return;
    const max = data.reduce((acc, course) => {
      if (!course.last_semester) return acc;
      return course.last_semester > acc ? course.last_semester : acc;
    }, "");
    if (max) setCurrentSemester(max);
  }, [loading, data, setCurrentSemester]);

  if (error) return <p>Error: {error.message}</p>;
  return (
    <>
      {loading && <DataTableSkeleton></DataTableSkeleton>}
      {!loading && <DataTable data={data} />}
    </>
  );
}
