"use client";

import { useState, useEffect, useMemo } from "react";
import { columns } from "./columns";
import { useCourseSearchWorker } from "@/hooks/useCourseSearchWorker";

import {
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";

import { CourseScore } from "@/types/types";
import MovilTable from "./MovilTable";
import DesktopTable from "./DesktopTable";
import { CourseFilters } from "../ui/CourseFilters";
import { Search } from "../search/SearchInput";

interface DataTableProps {
  data: CourseScore[];
  externalSearchValue?: string;
}

export function DataTable({ data, externalSearchValue = "" }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // Search and filter states
  const [searchValue, setSearchValue] = useState(externalSearchValue);
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [selectedSchool, setSelectedSchool] = useState<string>("all");
  const [selectedCampus, setSelectedCampus] = useState<string>("all");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [showRetirableOnly, setShowRetirableOnly] = useState(false);
  const [showEnglishOnly, setShowEnglishOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Update internal search when external search value changes
  useEffect(() => {
    setSearchValue(externalSearchValue);
  }, [externalSearchValue]);

  // Apply filters first (no search here)
  const filteredWithoutSearch = useMemo(() => {
    let filtered = data;

    // Apply category filters first
    if (selectedArea === "formacion-general") {
      filtered = filtered.filter((course) => course.area && course.area !== "Ninguna");
    } else if (selectedArea !== "all") {
      filtered = filtered.filter((course) => course.area === selectedArea);
    }

    if (selectedCampus !== "all") {
      filtered = filtered.filter((course) => {
        const campusArray = course.campus || [];
        return campusArray.includes(selectedCampus);
      });
    }

    if (selectedSchool !== "all") {
      filtered = filtered.filter((course) => course.school === selectedSchool);
    }

    if (selectedFormat !== "all") {
      filtered = filtered.filter((course) => {
        if (Array.isArray(course.format)) {
          return course.format.includes(selectedFormat);
        }
        return course.format === selectedFormat;
      });
    }

    if (showRetirableOnly) {
      filtered = filtered.filter((course) => {
        const retirableArray = course.is_removable || [];
        return retirableArray.some((removable) => removable === true);
      });
    }

    if (showEnglishOnly) {
      filtered = filtered.filter((course) => {
        if (Array.isArray(course.is_english)) {
          return course.is_english.some((isEnglish) => isEnglish === true);
        }
        return course.is_english === true;
      });
    }

    if (selectedSemester !== "all") {
      filtered = filtered.filter((course) => course.last_semester === selectedSemester);
    }

    return filtered;
  }, [
    data,
    selectedArea,
    selectedCampus,
    selectedSchool,
    selectedFormat,
    selectedSemester,
    showRetirableOnly,
    showEnglishOnly,
  ]);

  // Worker-based Fuse search on the filtered dataset, with course defaults
  const workerSearch = useCourseSearchWorker({ data: filteredWithoutSearch, query: searchValue });

  // Final data: if there is a search term, use worker results; else, just filtered data
  const filteredData = useMemo(() => {
    if (searchValue && searchValue.trim() !== "") {
      return workerSearch.results;
    }
    return filteredWithoutSearch;
  }, [searchValue, workerSearch.results, filteredWithoutSearch]);

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

  const handleSearch = (normalizedValue: string) => {
    setSearchValue(normalizedValue);
  };

  const handleClearFilters = () => {
    setSelectedArea("all");
    setSelectedCampus("all");
    setSelectedSchool("all");
    setSelectedFormat("all");
    setSelectedSemester("all");
    setShowRetirableOnly(false);
    setShowEnglishOnly(false);
    setSearchValue("");
    workerSearch.setQuery("");
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="flex flex-col gap-4">
        <div className="w-full">
          <Search
            onSearch={handleSearch}
            placeholder="Buscar por nombre o sigla..."
            className="w-full"
            initialValue={externalSearchValue}
            isSearching={workerSearch.isSearching}
          />
        </div>

        {/* Results counter */}
        <div className="text-sm text-gray-600">
          Mostrando {filteredData.length} de {data.length} cursos
        </div>
        <div className="w-full">
          <CourseFilters
            courses={data} // Pass original data for filter options
            selectedArea={selectedArea}
            selectedSchool={selectedSchool}
            selectedCampus={selectedCampus}
            selectedFormat={selectedFormat}
            selectedSemester={selectedSemester}
            showRetirableOnly={showRetirableOnly}
            showEnglishOnly={showEnglishOnly}
            filtersOpen={filtersOpen}
            onAreaChange={setSelectedArea}
            onSchoolChange={setSelectedSchool}
            onCampusChange={setSelectedCampus}
            onFormatChange={setSelectedFormat}
            onSemesterChange={setSelectedSemester}
            onRetirableToggle={setShowRetirableOnly}
            onEnglishToggle={setShowEnglishOnly}
            onFiltersOpenChange={setFiltersOpen}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>

      {/* Course Filters Section */}

      {/* Tables Section */}
      <div className="w-full">
        <DesktopTable table={table} />
        <MovilTable table={table} />
      </div>
    </div>
  );
}
