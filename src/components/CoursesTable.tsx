"use client";

import { useNDJSONStream } from "@/hooks/useNDJSONStream";
import { CourseScore } from "@/types/types";

import { DataTable } from "./table/data-table";

export default function CoursesTable() {
  const { data, loading, error } = useNDJSONStream<CourseScore>(
    "https://public.osuc.dev/courses-score.ndjson"
  );

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return <DataTable data={data} />;
}
