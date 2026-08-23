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
  const [loadingClassrooms, setLoadingClassrooms] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadClassrooms() {
      try {
        const classrooms = await getAllClassroomsWithCampus();
        if (isActive) setAllClassroomsWithCampus(classrooms);
      } catch {
        if (isActive) setError("No se pudo cargar el listado de salas.");
      } finally {
        if (isActive) setLoadingClassrooms(false);
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
    setError(null);
    try {
      const schedule = await getClassroomSchedule(campus, classroomName.trim().toUpperCase());
      setResults(schedule);
    } catch {
      setResults(null);
      setError("No se pudo cargar el horario de la sala seleccionada.");
    } finally {
      setLoading(false);
    }
  }

  function clearSearch() {
    setQuery("");
    setSelectedCampus(null);
    setResults(null);
    setShowSuggestions(false);
    setError(null);
  }

  function selectSuggestion(classroom: string, campus: Campus) {
    setQuery(classroom);
    setSelectedCampus(campus);
    setShowSuggestions(false);
    handleSearch(classroom, campus);
  }

  return (
    <div className="border-border bg-card border">
      <div className="space-y-5 p-4 tablet:p-6">
        <div className="flex items-start gap-3 border-b border-border pb-4">
          <div className="bg-blue text-blue-foreground border-blue-border shrink-0 border p-2">
            <SearchIcon className="h-5 w-5 fill-current" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold">Buscar sala</h3>
            <p className="text-muted-foreground mt-1 text-sm leading-5">
              Escribe el nombre y selecciónalo de la lista.
            </p>
          </div>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Sala</span>
          <div className="flex flex-col gap-2 tablet:flex-row">
            <div className="relative min-w-0 flex-1">
              <input
                type="search"
                autoComplete="off"
                name="classroom"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedCampus(null);
                  setResults(null);
                  setError(null);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Sala, edificio o número…"
                className="border-border bg-background placeholder:text-muted-foreground/70 h-11 w-full rounded-none border px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              {showSuggestions && query.length > 0 && suggestions.length > 0 && (
                <ul className="border-border bg-background absolute top-full left-0 right-0 z-50 mt-1 max-h-48 list-none overflow-auto border shadow-lg">
                  {suggestions.slice(0, 10).map((item) => (
                    <li key={`${item.campus}-${item.classroom}`}>
                      <button
                        type="button"
                        onClick={() => selectSuggestion(item.classroom, item.campus)}
                        className="text-foreground hover:bg-accent/70 focus-visible:bg-accent/70 w-full px-4 py-2 text-left text-sm focus-visible:outline-none"
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
                  } else {
                    setError("Selecciona una sala de la lista de sugerencias.");
                  }
                } else {
                  handleSearch(query, selectedCampus);
                }
              }}
              disabled={!query || loading}
              className="bg-primary text-primary-foreground h-11 shrink-0 px-5 text-sm font-semibold transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Cargando…" : "Buscar"}
            </button>
            <button
              type="button"
              onClick={clearSearch}
              className="border-border bg-background h-11 shrink-0 border px-4 text-sm font-medium transition-colors hover:bg-accent/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Limpiar
            </button>
          </div>
        </label>

        {error && (
          <p className="text-red-foreground text-sm" aria-live="polite">
            {error}
          </p>
        )}

        {results && selectedCampus && (
          <div className="bg-muted px-3 py-2 text-xs text-muted-foreground">
            Resultados para <span className="font-medium">{query.toUpperCase()}</span> en{" "}
            <span className="font-medium">{selectedCampus}</span>
          </div>
        )}

        {results ? (
          <div className="space-y-4">
            <ModuleGrid schedule={results} />
          </div>
        ) : (
          !error && (
            <p className="border-border bg-muted/40 border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              {loadingClassrooms
                ? "Cargando el listado de salas…"
                : "Selecciona una sala para revisar sus módulos."}
            </p>
          )
        )}
      </div>
    </div>
  );
}
