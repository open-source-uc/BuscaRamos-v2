"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Program } from "@/types/types";
import { Combobox, ComboboxOption } from "../ui/combobox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { ChevronDownIcon, ChevronUpIcon } from "../icons";
import { Button } from "../ui/button";

interface ProgramFiltersProps {
  programs: Program[];

  selectedSchool: string;
  selectedLevel: string;
  selectedCampus: string;

  filtersOpen: boolean;

  onSchoolChange: (value: string) => void;
  onLevelChange: (value: string) => void;
  onCampusChange: (value: string) => void;

  onFiltersOpenChange: (open: boolean) => void;
  onClearFilters: () => void;
}

export function ProgramFilters({
  programs,

  selectedSchool,
  selectedLevel,
  selectedCampus,

  filtersOpen,

  onSchoolChange,
  onLevelChange,
  onCampusChange,

  onFiltersOpenChange,
  onClearFilters,
}: ProgramFiltersProps) {
  const schools = useMemo(() => {
    return Array.from(new Set(programs.map((p) => p.school).filter(Boolean))).sort();
  }, [programs]);

  const levels = useMemo(() => {
    return Array.from(new Set(programs.map((p) => p.level).filter(Boolean))).sort();
  }, [programs]);

  const campuses = useMemo(() => {
    return Array.from(new Set(programs.map((p) => p.campus).filter(Boolean))).sort();
  }, [programs]);

  const schoolOptions: ComboboxOption[] = [
    {
      value: "all",
      label: "Todas las unidades académicas",
    },
    ...schools.map((s) => ({
      value: s,
      label: s,
    })),
  ];

  const levelOptions: ComboboxOption[] = [
    {
      value: "all",
      label: "Todos los niveles",
    },
    ...levels.map((l) => ({
      value: l,
      label: l,
    })),
  ];

  const campusOptions: ComboboxOption[] = [
    {
      value: "all",
      label: "Todos los campus",
    },
    ...campuses.map((c) => ({
      value: c,
      label: c,
    })),
  ];

  const activeFilters =
    Number(selectedSchool !== "all") +
    Number(selectedLevel !== "all") +
    Number(selectedCampus !== "all");

  return (
    <Collapsible open={filtersOpen} onOpenChange={onFiltersOpenChange}>
      <div className="bg-accent rounded-md">
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center justify-between px-4 py-2 border",
            filtersOpen ? "rounded-t-md" : "rounded-md"
          )}
        >
          <div className="flex gap-3 items-center">
            <h3 className="font-semibold">Filtros</h3>

            {activeFilters > 0 && (
              <span className="rounded-full border px-3 py-1 text-xs">{activeFilters}</span>
            )}
          </div>

          {filtersOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </CollapsibleTrigger>

        <CollapsibleContent className="border rounded-b-md">
          <div className="grid tablet:grid-cols-3 gap-4 p-6">
            <div>
              <label className="text-sm font-medium">Unidad Académica</label>

              <Combobox
                options={schoolOptions}
                value={selectedSchool}
                onValueChange={onSchoolChange}
                placeholder="Seleccionar unidad"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Nivel</label>

              <Combobox
                options={levelOptions}
                value={selectedLevel}
                onValueChange={onLevelChange}
                placeholder="Seleccionar nivel"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Campus</label>

              <Combobox
                options={campusOptions}
                value={selectedCampus}
                onValueChange={onCampusChange}
                placeholder="Seleccionar campus"
              />
            </div>
          </div>

          {activeFilters > 0 && (
            <div className="border-t p-4">
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                Limpiar filtros ({activeFilters})
              </Button>
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
