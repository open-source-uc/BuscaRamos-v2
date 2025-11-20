"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pill } from "@/components/ui/pill";
import { Button } from "../ui/button";
import { SwapVertIcon } from "../icons/icons";
import { Sentiment } from "../icons/sentiment";
import { calculateSentiment, calculatePositivePercentage } from "@/lib/courseStats";
import TableCourseCampuses from "./TableCourseCampuses";
import { CourseScore } from "@/types/types";

export const columns: ColumnDef<CourseScore>[] = [
  {
    accessorKey: "sigle",
    meta: { className: "w-[8%]" },
    header: ({ column }) => {
      return (
        <Button
          className="my-2 flex items-center gap-2 font-semibold"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Sigla
          <SwapVertIcon />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="truncate">{row.original.sigle}</div>;
    },
  },
  {
    accessorKey: "name",
    meta: { className: "w-[30%]" },
    header: ({ column }) => {
      return (
        <Button
          className="my-2 flex items-center gap-2 font-semibold"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <SwapVertIcon />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div
          className="font-medium truncate overflow-hidden text-ellipsis whitespace-nowrap"
          title={row.original.name}
        >
          {row.original.name}
        </div>
      );
    },
  },
  {
    accessorKey: "credits",
    meta: { className: "w-[6%]" },
    header: ({ column }) => {
      return (
        <Button
          className="my-2 flex items-center gap-2 font-semibold"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Créditos
          <SwapVertIcon />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="text-center">{row.original.credits}</div>;
    },
  },
  {
    accessorKey: "campus",
    meta: { className: "w-[20%]" },
    header: ({ column }) => {
      return (
        <Button
          className="my-2 flex items-center gap-2 font-semibold"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Campus
          <SwapVertIcon />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <TableCourseCampuses
          campus={row.original.campus || []}
          lastSemester={row.original.last_semester}
        />
      );
    },
  },
  {
    accessorKey: "area",
    meta: { className: "w-[18%]" },
    header: ({ column }) => {
      return (
        <Button
          className="my-2 flex items-center gap-2 font-semibold"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Área de Formación General
          <SwapVertIcon />
        </Button>
      );
    },
    cell: ({ row }) => {
      const area = row.original.area;
      if (
        Array.isArray(area) &&
        area.length > 0 &&
        area.some((a) => a && String(a).trim() !== "")
      ) {
        const validAreas = area.filter((a) => a && String(a).trim() !== "");
        return <Pill variant="pink">{validAreas.join(", ")}</Pill>;
      }
      return null;
    },
  },
  {
    accessorKey: "reviews",
    meta: { className: "w-[18%]" },
    header: ({ column }) => {
      return (
        <Button
          className="my-2 flex items-center gap-2 font-semibold"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Reseñas
          <SwapVertIcon />
        </Button>
      );
    },
    sortingFn: (rowA, rowB) => {
      const a = rowA.original;
      const b = rowB.original;

      // Calculate positivity percentage for both rows
      const positivityA = calculatePositivePercentage(a.likes, a.superlikes, a.dislikes);
      const positivityB = calculatePositivePercentage(b.likes, b.superlikes, b.dislikes);

      // Primary sort: by positivity percentage
      if (positivityA !== positivityB) {
        return positivityA - positivityB;
      }

      // Secondary sort: by total review count (more reviews = higher rank)
      const totalA = a.likes + a.superlikes + a.dislikes;
      const totalB = b.likes + b.superlikes + b.dislikes;

      return totalA - totalB;
    },
    cell: ({ row }) => {
      const { superlikes, likes, dislikes } = row.original;
      const totalReviews = likes + superlikes + dislikes; // Count each review once, like in [sigle]/index

      if (totalReviews === 0) {
        return <Sentiment sentiment="question" size="sm" />;
      }

      const sentimentType = calculateSentiment(likes, superlikes, dislikes);
      const positivePercentage = calculatePositivePercentage(likes, superlikes, dislikes);

      return (
        <Sentiment
          sentiment={sentimentType}
          size="sm"
          percentage={positivePercentage}
          reviewCount={totalReviews}
          ariaLabel={`${positivePercentage}% de reseñas positivas de ${totalReviews} total`}
        />
      );
    },
  },
];
