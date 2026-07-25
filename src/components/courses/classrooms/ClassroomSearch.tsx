"use client";
import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { getClassroomSchedule } from "@/lib/classroomSchedule";
import ModuleGrid from "./ModuleGrid";
import type { ClassroomSchedule } from "@/types/types";

export function ClassroomSearch() {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ClassroomSchedule | null>(null);

  async function handleSearch(query: string) {
    setLoading(true);
    try {
      const schedule = await getClassroomSchedule("San Joaquin", query.toUpperCase());
      setResults(schedule);
    } catch (error) {
      console.error("Error fetching classroom schedule:", error);
    } finally {
      setLoading(false);
    }
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
              Escribe el nombre de una sala para verla en la estructura.
            </p>
          </div>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Sala</span>
          <div className="flex gap-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar sala, edificio o número"
              className="border-border bg-background placeholder:text-muted-foreground/70 focus-visible:ring-ring h-11 w-full rounded-xl border pl-4 pr-4 text-sm outline-none focus-visible:ring-2"
            />
            <button
              type="button"
              onClick={() => handleSearch(query)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              {loading ? "Cargando..." : "Buscar"}
            </button>
          </div>
        </label>

        <div className="space-y-4">
          <ModuleGrid schedule={results} />
        </div>
      </div>
    </div>
  );
}
