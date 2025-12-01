"use client";

import { ChevronDownIcon } from "@/components/icons/icons";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { XAxis, YAxis, CartesianGrid, Area, AreaChart, ReferenceLine } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CourseStaticData } from "@/lib/coursesStaticData";
import { useMemo } from "react";
import { milestones } from "../../lib/milestones";
import { isCurrentSemester } from "@/lib/currentSemester";

interface Props {
  course: CourseStaticData;
  className?: string;
}

// Función para formatear la fecha del timestamp
function formatTimestamp(timestamp: string): string {
  // Formato: "2025-11-01-15" -> "01 Nov 15:00"
  const parts = timestamp.split("-");
  if (parts.length !== 4) return timestamp;

  const month = parts[1];
  const day = parts[2];
  const hour = parts[3];

  const monthNames = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  const monthIndex = parseInt(month, 10) - 1;
  const monthName = monthIndex >= 0 && monthIndex < 12 ? monthNames[monthIndex] : month;
  const hourFormatted = hour.padStart(2, "0");

  return `${day} ${monthName} ${hourFormatted}:00`;
}

// Función para procesar los datos del historial de cupos
function processQuotaHistory(quotaHistory: CourseStaticData["quota_history"]): Array<{
  fecha: string;
  ocupados: number;
  total: number;
  porcentaje: number;
  timestamp: string;
  milestone?: string;
}> {
  if (!quotaHistory) return [];

  // Only use data from the current semester
  const allData: Array<{
    fecha: string;
    ocupados: number;
    total: number;
    porcentaje: number;
    timestamp: string;
    semestre: string;
  }> = [];

  const semKeys = Object.keys(quotaHistory || {});
  const currentSem = semKeys.find(isCurrentSemester);
  if (!currentSem) return [];

  const sections = (quotaHistory as any)[currentSem] as Record<string, any> | undefined;
  if (!sections) return [];

  // Iterar sobre cada timestamp/sección del semestre actual
  Object.entries(sections).forEach(([timestamp, section]) => {
    if (section && section.agg) {
      const ocupados = section.agg.ocupados;
      const total = section.agg.total;
      const porcentaje = total && total > 0 ? (ocupados / total) * 100 : 0;

      allData.push({
        fecha: formatTimestamp(timestamp),
        ocupados,
        total,
        timestamp: timestamp,
        semestre: currentSem,
        porcentaje,
      } as any);
    }
  });

  // Ordenar por timestamp (fecha más antigua primero)
  return allData
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .map(({ fecha, ocupados, total, timestamp, porcentaje }) => ({
      fecha,
      ocupados,
      total,
      timestamp,
      porcentaje,
      milestone: milestones[timestamp as keyof typeof milestones],
    }));
}

export default function QuotaHistorySection({ course, className = "" }: Props) {
  const quotaHistory = course.quota_history;

  const chartData = useMemo(() => {
    return processQuotaHistory(quotaHistory);
  }, [quotaHistory]);

  const minOcupados = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.min(...chartData.map((d) => d.ocupados));
  }, [chartData]);

  const totalCupos = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.max(...chartData.map((d) => d.total));
  }, [chartData]);

  // Obtener las fechas con milestones
  const milestonesData = useMemo(() => {
    return chartData
      .filter((d) => d.milestone)
      .map((d) => ({
        fecha: d.fecha,
        milestone: d.milestone!,
      }));
  }, [chartData]);

  // Use percentage scale (0-100) so a change is comparable across courses
  const yAxisDomain = useMemo(() => {
    return [0, 100];
  }, []);

  const chartConfig = {
    porcentaje: {
      label: "Cupos Ocupados (%):",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  // No mostrar si no hay quota_history, no hay semestres, o no hay datos procesados
  if (!quotaHistory || Object.keys(quotaHistory).length === 0 || chartData.length === 0) {
    return null;
  }

  return (
    <section className={`quota-history-section w-full ${className}`}>
      <div className="border-border w-full overflow-hidden rounded-md border">
        <Collapsible>
          <CollapsibleTrigger className="bg-accent hover:bg-muted/50 group focus:ring-primary flex w-full items-center justify-between px-6 py-4 text-left transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="bg-blue-light text-blue border-blue/20 flex-shrink-0 rounded-lg border p-2">
                <svg
                  className="h-5 w-5 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-foreground text-lg font-semibold">Historial de Cupos</h2>
                <p className="text-muted-foreground text-sm">
                  Evolución de cupos ocupados a lo largo del tiempo
                </p>
              </div>
            </div>
            <div className="ml-4 flex flex-shrink-0 items-center gap-2">
              <span className="text-muted-foreground tablet:inline hidden text-sm">Expandir</span>
              <ChevronDownIcon className="text-muted-foreground group-hover:text-foreground h-5 w-5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent className="border-border bg-accent data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-up-1 data-[state=open]:slide-down-1 w-full overflow-hidden border-t px-6 py-4">
            <div className="w-full overflow-hidden flex justify-center">
              <div className="w-full max-w-5xl">
                <div className="mb-4">
                  <h3 className="text-foreground mb-2 text-sm font-semibold">
                    Evolución de Cupos Ocupados
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    Total cupos disponibles: {totalCupos}
                  </p>
                </div>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <AreaChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 20,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <defs>
                      <linearGradient id="colorOcupados" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-porcentaje)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-porcentaje)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="fecha"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 11 }}
                      domain={yAxisDomain}
                      tickFormatter={(value) => `${Math.round(value)}%`}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, name, item) => {
                            const ocupados = item?.payload?.ocupados;
                            const total = item?.payload?.total;
                            const percent = typeof value === "number" ? value : 0;
                            return (
                              <>{`${percent.toFixed(1)}% (${ocupados?.toLocaleString()}/${total?.toLocaleString()})`}</>
                            );
                          }}
                          nameKey="porcentaje"
                        />
                      }
                    />
                    {milestonesData.map((milestone, index) => (
                      <ReferenceLine
                        key={`milestone-${index}`}
                        x={milestone.fecha}
                        stroke="oklch(0.257 0.3 54)"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        label={{
                          value: milestone.milestone,
                          position: "right",
                          fill: "oklch(0.257 0.3 54)",
                          fontSize: 11,
                          fontWeight: 600,
                          offset: 10,
                        }}
                      />
                    ))}
                    <Area
                      type="linear"
                      dataKey="porcentaje"
                      stroke="var(--color-porcentaje)"
                      strokeWidth={2.5}
                      fill="url(#colorOcupados)"
                      dot={{ fill: "var(--color-porcentaje)", r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: "var(--color-porcentaje)", strokeWidth: 2 }}
                      connectNulls={false}
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  );
}
