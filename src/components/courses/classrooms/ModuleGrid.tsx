"use client";
import { Check } from "lucide-react";
import React, { useState } from "react";
import type { ClassroomSchedule, UcModule, CourseAndSection } from "@/types/types";

const DAYS = [
  { label: "Lunes", compact: "Lun", short: "l" },
  { label: "Martes", compact: "Mar", short: "m" },
  { label: "Miércoles", compact: "Mié", short: "w" },
  { label: "Jueves", compact: "Jue", short: "j" },
  { label: "Viernes", compact: "Vie", short: "v" },
  { label: "Sábado", compact: "Sáb", short: "s" },
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

type Props = {
  schedule?: ClassroomSchedule | null;
};

export default function ModuleGrid({ schedule }: Props) {
  const [selectedDay, setSelectedDay] = useState<string>("l");

  const displayedDays = DAYS.filter((d) => d.short === selectedDay);
  const gridTemplate = `64px repeat(${displayedDays.length}, minmax(0,1fr))`;

  return (
    <div className="border-border bg-background min-w-0 border p-3 tablet:p-4">
      <div className="mb-4 border-b border-border pb-3">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-base font-semibold">Módulos</h3>
          <p className="text-muted-foreground text-xs">Selecciona un día</p>
        </div>
        <div className="-mx-3 mt-3 overflow-x-auto px-3 tablet:mx-0 tablet:px-0">
          <div className="flex min-w-max gap-1" role="tablist" aria-label="Día del horario">
            {DAYS.map((day) => {
              const isSelected = day.short === selectedDay;

              return (
                <button
                  key={day.short}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedDay(day.short)}
                  className={`h-10 px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <span className="tablet:hidden">{day.compact}</span>
                  <span className="hidden tablet:inline">{day.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="-mx-3 overflow-x-auto px-3 tablet:mx-0 tablet:px-0">
        <div className="inline-block min-w-full">
          <div className="grid gap-px bg-border" style={{ gridTemplateColumns: gridTemplate }}>
            <div className="py-2" />
            {displayedDays.map((d) => (
              <div
                key={d.short}
                className="flex items-center justify-center bg-muted px-2 py-2 text-sm font-semibold"
              >
                {d.label}
              </div>
            ))}

            {TIMES.map((time, i) => (
              <React.Fragment key={time}>
                <div className="flex items-center justify-center bg-muted px-2 py-2 text-xs font-medium text-muted-foreground">
                  {time}
                </div>

                {displayedDays.map((d) => {
                  const code = `${d.short}${i + 1}` as UcModule;
                  const items: CourseAndSection[] =
                    (schedule && (schedule[code] as CourseAndSection[])) || [];
                  return (
                    <div
                      key={code}
                      className={`min-h-[64px] w-full overflow-hidden px-2 py-2 text-left text-sm ${
                        items.length > 0 ? "bg-blue/40" : "bg-card"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold truncate">{code.toUpperCase()}</div>
                        <div className="text-muted-foreground text-[11px]">{time}</div>
                      </div>
                      <div className="mt-1 text-xs">
                        {items.length > 0 ? (
                          <ul className="max-h-24 list-disc overflow-auto pl-4 pr-2">
                            {items.map((it, idx) => (
                              <li
                                key={idx}
                                className="leading-tight break-words whitespace-normal"
                                title={String(Array.isArray(it) ? (it as unknown[]).join("-") : it)}
                              >
                                {Array.isArray(it) ? it.join("-") : String(it)}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-green-foreground flex items-center gap-1 text-xs font-medium">
                            <Check aria-hidden="true" className="h-3.5 w-3.5" />
                            Disponible
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
