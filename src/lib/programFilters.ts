import type { Program } from "@/types/types";

export type ProgramFilters = {
  selectedSchool: string;
  selectedLevel: string;
  selectedCampus: string;
};

export function applyProgramFilters(
  programs: Program[],
  { selectedSchool, selectedLevel, selectedCampus }: ProgramFilters
): Program[] {
  let filtered = programs;

  if (selectedSchool !== "all") {
    filtered = filtered.filter((program) => program.school === selectedSchool);
  }

  if (selectedLevel !== "all") {
    filtered = filtered.filter((program) => program.level === selectedLevel);
  }

  if (selectedCampus !== "all") {
    filtered = filtered.filter((program) => program.campus === selectedCampus);
  }

  return filtered;
}
