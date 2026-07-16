"use client";

import { useState, useMemo } from "react";
import { useFuse } from "@/hooks/useFuse";
import { applyProgramFilters } from "@/lib/programFilters";

import { Search } from "@/components/search/SearchInput";
import { ProgramFilters } from "./ProgramFilters";
import ProgramCard from "./ProgramCard";
import { Program } from "@/types/types";

interface ProgramCurriculumProps {
  programs: Program[];
}

export default function ProgramCurriculum({ programs }: ProgramCurriculumProps) {
  const [searchValue, setSearchValue] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedCampus, setSelectedCampus] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredWithoutSearch = useMemo(() => {
    return applyProgramFilters(programs, {
      selectedSchool,
      selectedLevel,
      selectedCampus,
    });
  }, [programs, selectedSchool, selectedLevel, selectedCampus]);

  const programSearchKeys = useMemo(() => ["name", "school", "level", "campus"], []);

  const fuseSearch = useFuse({
    data: filteredWithoutSearch,
    query: searchValue,
    keys: programSearchKeys,
  });

  const filteredData = useMemo(() => {
    if (searchValue && searchValue.trim() !== "") {
      return fuseSearch.results;
    }
    return filteredWithoutSearch;
  }, [searchValue, fuseSearch.results, filteredWithoutSearch]);

  const handleSearch = (normalizedValue: string) => {
    setSearchValue(normalizedValue);
  };

  const handleClearFilters = () => {
    setSelectedCampus("all");
    setSelectedSchool("all");
    setSelectedLevel("all");
    setSearchValue("");
    fuseSearch.setQuery("");
  };

  return (
    <div className="space-y-6">
      <Search
        onSearch={handleSearch}
        placeholder="Buscar carrera..."
        initialValue={searchValue}
        isSearching={fuseSearch.isSearching}
      />

      <div className="text-sm text-gray-600">
        Mostrando {filteredData.length} de {programs.length} carreras
      </div>
      <ProgramFilters
        programs={programs}
        selectedSchool={selectedSchool}
        selectedLevel={selectedLevel}
        selectedCampus={selectedCampus}
        filtersOpen={filtersOpen}
        onSchoolChange={setSelectedSchool}
        onLevelChange={setSelectedLevel}
        onCampusChange={setSelectedCampus}
        onFiltersOpenChange={setFiltersOpen}
        onClearFilters={handleClearFilters}
      />

      <div className="space-y-2">
        {filteredData.map((program) => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </div>
    </div>
  );
}
