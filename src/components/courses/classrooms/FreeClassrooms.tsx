"use client";

import { DoorOpen, SearchIcon } from "lucide-react";
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
    <div className="border-border bg-card border p-4 tablet:p-6">
      <div className="mb-5 flex items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="text-base font-semibold">Disponibilidad</h3>
          <p className="text-muted-foreground mt-1 text-sm">Selecciona campus y módulo.</p>
        </div>
        <div className="bg-muted text-muted-foreground shrink-0 px-2.5 py-1 text-xs font-medium tabular-nums">
          {loading ? "Consultando…" : hasSearched ? `${filtered.length} salas` : "Listo"}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Campus
          <select
            name="campus"
            value={campus ?? ""}
            onChange={(e) => setCampus(e.target.value as Campus)}
            disabled={loadingCampuses || campuses.length === 0}
            className="border-border bg-background h-11 rounded-none border px-3 text-sm font-normal focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {loadingCampuses && <option value="">Cargando campus…</option>}
            {campuses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Módulo
          <select
            name="module"
            value={module}
            onChange={(e) => setModule(e.target.value)}
            className="border-border bg-background h-11 rounded-none border px-3 text-sm font-normal focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {allModuleOptions.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-2 tablet:flex-row">
        <input
          aria-label="Filtrar salas libres"
          autoComplete="off"
          name="room-filter"
          placeholder="Filtrar salas, ej. A1…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border-border bg-background h-11 min-w-0 flex-1 rounded-none border px-3 text-sm placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        <button
          type="button"
          onClick={() => campus && displayedFreeClassrooms(campus, module)}
          disabled={!campus || loading}
          className="bg-primary text-primary-foreground flex h-11 shrink-0 items-center justify-center gap-2 px-5 text-sm font-semibold transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SearchIcon aria-hidden="true" className="h-4 w-4" />
          {loading ? "Consultando…" : "Ver salas"}
        </button>
        <button
          type="button"
          onClick={clearSearch}
          className="border-border bg-background h-11 shrink-0 border px-4 text-sm font-medium transition-colors hover:bg-accent/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Limpiar
        </button>
      </div>

      {error && (
        <p className="text-red-foreground mt-4 text-sm" aria-live="polite">
          {error}
        </p>
      )}

      <div className="mt-5 grid gap-3" aria-busy={loading} aria-live="polite">
        {hasSearched && results.length === 0 && !loading && !error ? (
          <div className="border-border bg-muted/40 border border-dashed p-5 text-sm text-muted-foreground">
            No hay aulas libres para el módulo seleccionado.
          </div>
        ) : results.length > 0 && filtered.length === 0 ? (
          <div className="border-border bg-muted/40 border border-dashed p-5 text-sm text-muted-foreground">
            No hay salas que coincidan con el filtro.
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid auto-rows-fr grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((room) => (
              <div
                key={room}
                className="border-border bg-background flex min-w-0 items-center gap-3 border p-3 text-left text-sm"
              >
                <div className="bg-blue text-blue-foreground flex h-8 w-8 shrink-0 items-center justify-center">
                  <DoorOpen aria-hidden="true" className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="break-words font-semibold" translate="no">
                    {room}
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs">Disponible</div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
