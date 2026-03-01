"use client";

import { DAYS, TIME_SLOTS } from "@/lib/scheduleMatrix";
import { buildScheduleModuleKey } from "@/lib/scheduleModuleFilter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DAY_LABELS: Record<string, string> = {
  L: "Lun",
  M: "Mar",
  W: "Mié",
  J: "Jue",
  V: "Vie",
  S: "Sáb",
};

interface ScheduleModuleFilterProps {
  selectedModules: string[];
  onChange: (modules: string[]) => void;
}

export default function ScheduleModuleFilter({
  selectedModules,
  onChange,
}: ScheduleModuleFilterProps) {
  const selectedModuleSet = new Set(selectedModules);

  const toggleModule = (day: string, time: string) => {
    const moduleKey = buildScheduleModuleKey(day, time);
    if (selectedModuleSet.has(moduleKey)) {
      onChange(selectedModules.filter((selectedModule) => selectedModule !== moduleKey));
      return;
    }

    onChange([...selectedModules, moduleKey]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 tablet:flex-row tablet:items-start tablet:justify-between">
        <div>
          <h4 className="text-foreground text-sm font-semibold">Filtro por horario</h4>
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            Muestra cursos con al menos una sección cuyos módulos estén completamente dentro de la
            selección.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedModules.length > 0 && (
            <div className="bg-primary/10 text-primary border-primary/15 rounded-full border px-3 py-1 text-xs font-medium">
              {selectedModules.length} modulo{selectedModules.length !== 1 ? "s" : ""}
            </div>
          )}
          {selectedModules.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange([])}
              className="text-muted-foreground hover:text-foreground"
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>

      <div className="border-border from-background to-accent/60 rounded-2xl border bg-gradient-to-br p-3 shadow-sm">
        <div className="mb-2 grid grid-cols-[44px_repeat(6,minmax(0,1fr))] gap-1.5 tablet:grid-cols-[60px_repeat(6,minmax(0,1fr))] tablet:gap-2">
          <div />
          {DAYS.map((day) => (
            <div
              key={day}
              className="text-muted-foreground flex h-8 items-center justify-center rounded-xl text-[11px] font-semibold tablet:h-9 tablet:text-xs"
            >
              {DAY_LABELS[day] ?? day}
            </div>
          ))}
        </div>

        <div className="space-y-1.5 tablet:space-y-2">
          {TIME_SLOTS.map((time) => (
            <div
              key={time}
              className="grid grid-cols-[44px_repeat(6,minmax(0,1fr))] gap-1.5 tablet:grid-cols-[60px_repeat(6,minmax(0,1fr))] tablet:gap-2"
            >
              <div className="text-muted-foreground flex h-10 items-center justify-end rounded-xl px-1 text-[10px] font-semibold tablet:h-11 tablet:px-2 tablet:text-xs">
                {time}
              </div>
              {DAYS.map((day) => {
                const moduleKey = buildScheduleModuleKey(day, time);
                const isSelected = selectedModuleSet.has(moduleKey);
                return (
                  <button
                    key={moduleKey}
                    type="button"
                    onClick={() => toggleModule(day, time)}
                    className={cn(
                      "border-border bg-background/75 hover:border-primary/40 hover:bg-primary/6 relative flex h-10 items-center justify-center rounded-xl border transition-colors active:scale-100 tablet:h-11",
                      isSelected &&
                        "border-primary/30 bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
                    )}
                    aria-pressed={isSelected}
                    aria-label={`${DAY_LABELS[day] ?? day} ${time}`}
                  >
                    <span
                      className={cn(
                        "border-border/80 h-2.5 w-2.5 rounded-full border bg-transparent transition-colors tablet:h-3 tablet:w-3",
                        isSelected && "border-primary-foreground bg-primary-foreground"
                      )}
                    />
                    {isSelected && (
                      <span className="pointer-events-none absolute inset-[3px] rounded-[10px] ring-1 ring-white/18" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selectedModules.length > 0 && (
        <p className="text-muted-foreground text-xs leading-relaxed">
          Se permiten secciones que usen solo esos bloques. No es necesario que ocupen todos los
          modulos marcados.
        </p>
      )}
    </div>
  );
}
