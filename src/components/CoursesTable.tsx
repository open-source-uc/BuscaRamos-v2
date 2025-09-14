"use client";

import { useState } from "react";
import { useNDJSONStream } from "@/hooks/useNDJSONStream";
import { CourseScore } from "@/types/types";
import Pagination from "./Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
const ITEMS_PER_PAGE = 20;

export default function CoursesTable() {
  const { data, loading, error } = useNDJSONStream<CourseScore>(
    "https://public.osuc.dev/courses-score.ndjson"
  );

  const [currentPage, setCurrentPage] = useState(1);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const currentData = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="rounded-2xl border shadow-sm overflow-hidden w-full max-w-4xl mx-auto">
      {/* Tabla */}
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Código</TableHead>
            <TableHead className="w-auto">Nombre</TableHead>
            <TableHead className="text-right w-20">Créditos</TableHead>
            <TableHead className="text-center w-16">❤️</TableHead>
            <TableHead className="text-center w-16">👍</TableHead>
            <TableHead className="text-center w-16">👎</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentData.map((course) => (
        <Link href={`/${course.sigle}`} key={course.id}>
            <TableRow key={course.id}>
              <TableCell className="font-medium w-20 truncate">{course.sigle}</TableCell>
              <TableCell className="w-auto truncate" title={course.name}>{course.name}</TableCell>
              <TableCell className="text-right w-20">{course.credits}</TableCell>
              <TableCell className="text-center w-16">{course.superlikes}</TableCell>
              <TableCell className="text-center w-16">{course.likes}</TableCell>
              <TableCell className="text-center w-16">{course.dislikes}</TableCell>
            </TableRow>
        </Link>
          ))}
        </TableBody>
      </Table>

      {/* Paginación */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
