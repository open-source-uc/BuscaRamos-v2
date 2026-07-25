"use client";
import React, { useState } from "react";
import type { ClassroomSchedule, UcModule, CourseAndSection } from "@/types/types";

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

type Props = {
  schedule?: ClassroomSchedule | null;
};

export default function ModuleGrid({ schedule }: Props) {
  const [selectedDay, setSelectedDay] = useState<string>("l");

  const displayedDays = DAYS.filter((d) => d.short === selectedDay);
  const gridTemplate = `64px repeat(${displayedDays.length}, minmax(0,1fr))`;

  return (
    <div className="border-border rounded-2xl border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">Módulos</h3>
        <div>
          <label className="sr-only">Seleccionar día</label>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1 text-sm"
          >
            {DAYS.map((d) => (
              <option key={d.short} value={d.short}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-auto">
        <div className="inline-block min-w-full">
          <div className="grid gap-2" style={{ gridTemplateColumns: gridTemplate }}>
            <div className="py-2" />
            {displayedDays.map((d) => (
              <div
                key={d.short}
                className="flex items-center justify-center rounded-md bg-background/50 py-2 text-sm font-semibold"
              >
                {d.label}
              </div>
            ))}

            {TIMES.map((time, i) => (
              <React.Fragment key={time}>
                <div className="flex items-center justify-center rounded-md bg-muted-foreground/5 py-2 text-xs font-medium text-muted-foreground">
                  {time}
                </div>

                {displayedDays.map((d) => {
                  const code = `${d.short}${i + 1}` as UcModule;
                  const items: CourseAndSection[] =
                    (schedule && (schedule[code] as CourseAndSection[])) || [];
                  return (
                    <div
                      key={code}
                      className="min-h-[44px] w-full rounded-md border border-border bg-background px-2 py-2 text-left text-sm overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold truncate">{code.toUpperCase()}</div>
                        <div className="text-muted-foreground text-[11px]">{time}</div>
                      </div>
                      <div className="mt-1 text-xs">
                        {items.length > 0 ? (
                          <ul className="list-disc pl-4 max-h-24 overflow-auto pr-2">
                            {items.map((it, idx) => (
                              <li
                                key={idx}
                                className="leading-tight break-words whitespace-normal"
                                title={String(Array.isArray(it) ? (it as unknown[]).join("-") : it)}
                              >
                                {Array.isArray(it)
                                  ? (it as CourseAndSection[]).join("-")
                                  : String(it)}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-muted-foreground text-xs">Libre</div>
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
