"use client";

import { useEffect, useState } from "react";
import type { Campus, UcModule } from "@/types/types";
import { getAvailableCampuses, getFreeClassroomsPerModule } from "@/lib/classroomSchedule";

const DAYS = [
  { label: "Lunes", short: "l" },
  { label: "Martes", short: "m" },
  { label: "Miércoles", short: "w" },
  { label: "Jueves", short: "j" },
  { label: "Viernes", short: "v" },
  { label: "Sábado", short: "s" },
] as const;

const TIMES = [
  "08:20",
  "09:40",
  "11:00",
  "12:20",
  "14:50",
  "16:10",
  "17:30",
  "18:50",
  "20:10",
] as const;

export default function FreeClassrooms() {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [campus, setCampus] = useState<Campus | null>(null);
  const [module, setModule] = useState<string>(`${DAYS[0].short}1`);
  const [loading, setLoading] = useState(false);
  const [loadingCampuses, setLoadingCampuses] = useState(true);
  const [results, setResults] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    getAvailableCampuses()
      .then((availableCampuses) => {
        if (!isActive) return;
        setCampuses(availableCampuses);
        setCampus(availableCampuses[0] ?? null);
      })
      .catch(() => {
        if (isActive) setError("No se pudieron cargar los campus disponibles.");
      })
      .finally(() => {
        if (isActive) setLoadingCampuses(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const allModuleOptions = DAYS.flatMap((d) => {
    return TIMES.map((time, i) => ({
      code: `${d.short}${i + 1}`,
      label: `${d.label} ${i + 1} • ${time}`,
    }));
  });

  async function displayedFreeClassrooms(selectedCampus: Campus, selectedModule: string) {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const rooms = await getFreeClassroomsPerModule(selectedCampus, selectedModule as UcModule);
      setResults(rooms);
    } catch {
      setResults([]);
      setError("No se pudieron cargar las salas libres. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = results.filter((r) => r.toLowerCase().includes(query.toLowerCase()));

  function clearSearch() {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    setError(null);
  }

  return (
    <div className="border-border rounded-2xl border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Salas libres</h3>
          <p className="text-muted-foreground text-sm">
            Selecciona campus y módulo para ver las salas libres.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {loading ? "Cargando..." : `${filtered.length} mostradas`}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <select
          aria-label="Seleccionar campus"
          value={campus ?? ""}
          onChange={(e) => setCampus(e.target.value as Campus)}
          disabled={loadingCampuses || campuses.length === 0}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          {loadingCampuses && <option value="">Cargando campus...</option>}
          {campuses.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          aria-label="Seleccionar módulo"
          value={module}
          onChange={(e) => setModule(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          {allModuleOptions.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          placeholder="Filtrar aulas (ej. A1)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => campus && displayedFreeClassrooms(campus, module)}
          disabled={!campus || loading}
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
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

      {error && <p className="text-red-foreground mt-3 text-sm">{error}</p>}

      <div className="mt-4 grid gap-2">
        {hasSearched && results.length === 0 && !loading && !error ? (
          <div className="text-muted-foreground text-sm">
            No hay aulas libres para el módulo seleccionado.
          </div>
        ) : results.length > 0 ? (
          <div className="grid auto-rows-fr grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((room) => (
              <button
                key={room}
                type="button"
                className="rounded-lg border border-border p-3 text-sm text-left hover:bg-accent/70"
              >
                <div className="font-semibold">{room}</div>
                <div className="text-muted-foreground text-xs">Libre</div>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
