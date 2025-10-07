"use client";

import { useState, useEffect, useMemo } from "react";
import { columns } from "./columns";
import Fuse from "fuse.js";

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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showRetirableOnly, setShowRetirableOnly] = useState(false);
  const [showEnglishOnly, setShowEnglishOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Update internal search when external search value changes
  useEffect(() => {
    setSearchValue(externalSearchValue);
  }, [externalSearchValue]);

  // Add debounced search effect
  useEffect(() => {
    if (searchValue !== externalSearchValue) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [searchValue, externalSearchValue]);

  // Combined filtering: first apply filters, then search
  const filteredData = useMemo(() => {
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

    if (selectedCategory !== "all") {
      filtered = filtered.filter((course) => {
        if (Array.isArray(course.categories)) {
          return course.categories.includes(selectedCategory);
        }
        return false;
      });
    }

    // Then apply search filter if there's a search term
    if (searchValue && searchValue.trim() !== "") {
      const fuseForFiltered = new Fuse(filtered, {
        keys: ["name", "sigle"],
        threshold: 0.3,
        ignoreLocation: true,
        includeScore: true,
        minMatchCharLength: 2,
      });

      const searchResults = fuseForFiltered.search(searchValue);
      return searchResults.map((result) => result.item);
    }

    return filtered;
  }, [
    data,
    searchValue,
    selectedArea,
    selectedCampus,
    selectedSchool,
    selectedFormat,
    selectedSemester,
    selectedCategory,
    showRetirableOnly,
    showEnglishOnly,
  ]);

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
            isSearching={isSearching}
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
            selectedCategory={selectedCategory}
            filtersOpen={filtersOpen}
            onAreaChange={setSelectedArea}
            onSchoolChange={setSelectedSchool}
            onCampusChange={setSelectedCampus}
            onFormatChange={setSelectedFormat}
            onSemesterChange={setSelectedSemester}
            onRetirableToggle={setShowRetirableOnly}
            onEnglishToggle={setShowEnglishOnly}
            onFiltersOpenChange={setFiltersOpen}
            onCategoryChange={setSelectedCategory}
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
