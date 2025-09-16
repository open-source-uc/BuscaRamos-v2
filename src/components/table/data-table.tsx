"use client";

import { useState, useEffect, useMemo } from "react";
import { columns } from "./columns";
import Fuse from "fuse.js";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";

import { CourseScore } from "@/types/types";
import MovilTable from "./MovilTable";
import DesktopTable from "./DesktopTable";

interface DataTableProps {
  data: CourseScore[];
  externalSearchValue?: string;
}

export function DataTable({ data, externalSearchValue = "" }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState(externalSearchValue);

  // Create Fuse instance with configuration for fuzzy searching
  const fuse = useMemo(() => {
    return new Fuse(data, {
      keys: ["name", "sigle"],
      threshold: 0.3,
      ignoreLocation: true,
      includeScore: true,
      minMatchCharLength: 2,
    });
  }, [data]);

  // Filter data using Fuse.js before passing to table
  const filteredData = useMemo(() => {
    if (!globalFilter || globalFilter.trim() === "") {
      return data;
    }

    const searchResults = fuse.search(globalFilter);
    return searchResults.map((result) => result.item);
  }, [data, globalFilter, fuse]);

  // Update internal filter when external search value changes
  useEffect(() => {
    setGlobalFilter(externalSearchValue);
  }, [externalSearchValue]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <>
      <DesktopTable table={table} />
      <MovilTable table={table} />
    </>
  );
}
