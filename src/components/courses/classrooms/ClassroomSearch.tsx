"use client";
import { SearchIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getClassroomSchedule, getAllClassroomsWithCampus } from "@/lib/classroomSchedule";
import ModuleGrid from "./ModuleGrid";
import type { ClassroomSchedule, Campus } from "@/types/types";

type ClassroomOption = {
  classroom: string;
  campus: Campus;
};

export function ClassroomSearch() {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);
  const [results, setResults] = useState<ClassroomSchedule | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allClassroomsWithCampus, setAllClassroomsWithCampus] = useState<ClassroomOption[]>([]);

  useEffect(() => {
    let isActive = true;

    async function loadClassrooms() {
      const classrooms = await getAllClassroomsWithCampus();
      if (isActive) {
        setAllClassroomsWithCampus(classrooms);
      }
    }

    void loadClassrooms();

    return () => {
      isActive = false;
    };
  }, []);

  const suggestions = useMemo(() => {
    if (!query) {
      return [];
    }

    const normalizedQuery = query.toLowerCase();
    return allClassroomsWithCampus.filter((item) =>
      item.classroom.toLowerCase().includes(normalizedQuery)
    );
  }, [allClassroomsWithCampus, query]);

  async function handleSearch(classroomName: string, campus: Campus) {
    setLoading(true);
    try {
      const schedule = await getClassroomSchedule(campus, classroomName.trim().toUpperCase());
      setResults(schedule);
    } catch (error) {
      console.error("Error fetching classroom schedule:", error);
    } finally {
      setLoading(false);
    }
  }

  function clearSearch() {
    setQuery("");
    setSelectedCampus(null);
    setResults(null);
    setShowSuggestions(false);
  }

  function selectSuggestion(classroom: string, campus: Campus) {
    setQuery(classroom);
    setSelectedCampus(campus);
    setShowSuggestions(false);
    handleSearch(classroom, campus);
  }

  return (
    <div className="border-border rounded-2xl border bg-accent shadow-sm">
      <div className="space-y-4 p-4 tablet:p-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-light text-blue border-blue/20 rounded-lg border p-2 shrink-0">
            <SearchIcon className="h-5 w-5 fill-current" />
          </div>
          <div>
            <h2 className="text-base font-semibold tablet:text-lg">Buscar sala</h2>
            <p className="text-muted-foreground text-xs tablet:text-sm">
              Escribe el nombre de una sala para ver las clases que se dictan en ella por módulo.
            </p>
          </div>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Sala</span>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Buscar sala, edificio o número"
                className="border-border bg-background placeholder:text-muted-foreground/70 focus-visible:ring-ring h-11 w-full rounded-xl border pl-4 pr-4 text-sm outline-none focus-visible:ring-2"
              />
              {showSuggestions && query.length > 0 && suggestions.length > 0 && (
                <ul className="border-border bg-background absolute top-full left-0 right-0 z-50 mt-1 list-none border rounded-lg shadow-lg max-h-48 overflow-auto">
                  {suggestions.slice(0, 10).map((item) => (
                    <li key={`${item.campus}-${item.classroom}`}>
                      <button
                        type="button"
                        onClick={() => selectSuggestion(item.classroom, item.campus)}
                        className="text-foreground hover:bg-accent/70 w-full px-4 py-2 text-left text-sm"
                      >
                        <div className="font-medium">{item.classroom}</div>
                        <div className="text-xs text-muted-foreground">{item.campus}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                if (!selectedCampus) {
                  const firstMatch = allClassroomsWithCampus.find(
                    (item) => item.classroom.toUpperCase() === query.trim().toUpperCase()
                  );

                  if (firstMatch) {
                    setSelectedCampus(firstMatch.campus);
                    handleSearch(query, firstMatch.campus);
                  }
                } else {
                  handleSearch(query, selectedCampus);
                }
              }}
              disabled={!query || loading}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? "Cargando..." : "Buscar"}
            </button>
            <button
              type="button"
              onClick={clearSearch}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent/70"
            >
              Limpiar
            </button>
          </div>
        </label>

        {results && selectedCampus && (
          <div className="text-muted-foreground text-xs">
            Resultados para <span className="font-medium">{query.toUpperCase()}</span> en{" "}
            <span className="font-medium">{selectedCampus}</span>
          </div>
        )}

        <div className="space-y-4">
          <ModuleGrid schedule={results} />
        </div>
      </div>
    </div>
  );
}
