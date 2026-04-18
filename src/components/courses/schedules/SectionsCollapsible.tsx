"use client";
import { useState } from "react";
import useSWR from "swr";
import {
  CalendarIcon,
  ChevronDownIcon,
  PlusIcon,
  BuildingIcon,
  LinkIcon,
  CategoryIcon,
  AttendanceIcon,
  CheckIcon,
  CloseIcon,
  LanguageIcon,
  StarIcon,
  AreaIcon,
} from "@/components/icons/icons";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Pill } from "@/components/ui/pill";
import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { toast } from "sonner";
import type { ScheduleMatrix, CourseSections } from "@/types/types";
import {
  createScheduleMatrix,
  TIME_SLOTS,
  DAYS,
  convertCourseDataToSections,
} from "@/lib/scheduleMatrix";
import { addCourseToSchedule, isCourseInSchedule } from "@/lib/scheduleStorage";
import {
  ScheduleLegend,
  getClassTypeColor,
  getClassTypeShort,
} from "@/components/courses/schedules/ScheduleLegend";
import { useCurrentSemester } from "@/context/semesterCtx";
import { staticDataClient } from "@/lib/static-data-api/client";
import QuotaHistorySection, { type QuotaTimeline } from "@/components/courses/QuotaHistorySection";
import { sectionFitsScheduleModuleFilter } from "@/lib/scheduleModuleFilter";

// Semestres válidos extraídos del tipo generado para /data/quota/{sigle}
export const SEMESTERS = ["2026-1", "2025-2", "2025-1", "2024-3", "2024-2", "2024-1"] as const;
export type ValidSemester = (typeof SEMESTERS)[number];

async function fetchSemesterSections(semester: string, sigle: string): Promise<CourseSections> {
  const res = await fetch(`https://public.osuc.dev/${semester}.json`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as Record<string, { sections?: unknown }>;
  const courseData = data[sigle];
  return courseData?.sections ? convertCourseDataToSections({ [sigle]: courseData }) : {};
}

async function fetchQuotaTimeline(semester: ValidSemester, sigle: string): Promise<QuotaTimeline> {
  const { data } = await staticDataClient.GET("/data/quota/{sigle}", {
    params: { path: { sigle }, query: { semester } },
  });
  return (data?.quota ?? {}) as QuotaTimeline;
}

function ScheduleGrid({
  matrix,
  sectionId,
  courseSigle,
  semester,
  onAddToSchedule,
  sectionData,
}: {
  matrix: ScheduleMatrix;
  sectionId: string;
  courseSigle: string;
  semester: string;
  onAddToSchedule: (courseId: string, success: boolean) => void;
  sectionData?: any;
}) {
  const courseId = `${courseSigle}-${sectionId}`;
  const isInSchedule =
    typeof window !== "undefined" ? isCourseInSchedule(courseId, semester) : false;

  const nrc = sectionData?.nrc || "Sin NRC";
  const campus = sectionData?.campus || "Sin campus";
  const category = sectionData?.category || "";
  const area = sectionData?.area || "";
  const format = sectionData?.format || "Sin formato";
  const isRemovable = sectionData?.is_removable ?? false;
  const isEnglish = sectionData?.is_english ?? false;
  const isSpecial = sectionData?.is_special ?? false;

  const handleAddToSchedule = () => {
    const success = addCourseToSchedule(courseId, semester);
    onAddToSchedule(courseId, success);
  };

  const hasSaturdayClasses = TIME_SLOTS.some(
    (_, timeIndex) => matrix[timeIndex] && matrix[timeIndex][5] && matrix[timeIndex][5].length > 0
  );
  const displayDays = hasSaturdayClasses ? DAYS : DAYS.slice(0, 5);

  return (
    <div className="bg-background border-border tablet:p-4 rounded-lg border p-2">
      <div className="tablet:mb-3 mb-2 flex items-center justify-between">
        <h3 className="tablet:text-base text-sm font-semibold">Sección {sectionId}</h3>
        <Button
          variant={isInSchedule ? "outline" : "ghost_blue"}
          size="xs"
          onClick={handleAddToSchedule}
          disabled={isInSchedule}
          icon={PlusIcon}
        >
          {isInSchedule ? "En mi horario" : "Agregar"}
        </Button>
      </div>

      <div className="mt-2 tablet:mt-3 overflow-x-auto">
        <div className="min-w-55">
          <div
            className="tablet:gap-1 tablet:mb-1.5 mb-0.5 grid gap-0.5"
            style={{ gridTemplateColumns: `28px repeat(${displayDays.length}, 1fr)` }}
          >
            <div className="w-7 tablet:w-10"></div>
            {displayDays.map((day) => (
              <div
                key={day}
                className="text-muted-foreground px-0.5 py-0.5 text-center text-[9px] tablet:text-[10px] font-medium"
              >
                {day}
              </div>
            ))}
          </div>

          {TIME_SLOTS.map((time, timeIndex) => {
            const hasClassFromThisTimeOnwards = TIME_SLOTS.slice(timeIndex).some((_, futureIndex) =>
              displayDays.some((day) => {
                const dayIndex = DAYS.indexOf(day);
                return (
                  matrix[timeIndex + futureIndex] &&
                  matrix[timeIndex + futureIndex][dayIndex] &&
                  matrix[timeIndex + futureIndex][dayIndex].length > 0
                );
              })
            );

            if (timeIndex === 0 || hasClassFromThisTimeOnwards) {
              return (
                <div
                  key={time}
                  className="tablet:gap-1 mb-0.5 grid gap-0.5"
                  style={{ gridTemplateColumns: `28px repeat(${displayDays.length}, 1fr)` }}
                >
                  <div className="text-muted-foreground w-7 tablet:w-10 px-0.5 py-0.5 text-right text-[8px] tablet:text-[10px] leading-tight">
                    {time.slice(0, 5)}
                  </div>
                  {displayDays.map((day) => {
                    const dayIndex = DAYS.indexOf(day);
                    const classes = matrix[timeIndex][dayIndex];
                    const hasClass = classes.length > 0;
                    const classInfo = hasClass ? classes[0] : null;
                    return (
                      <div
                        key={`${day}-${timeIndex}`}
                        className="tablet:min-h-7 flex min-h-5 items-center justify-center px-0.5 py-0.5"
                      >
                        {hasClass && classInfo && (
                          <Pill
                            variant={getClassTypeColor(classInfo.type)}
                            size="xs"
                            className="min-w-0 px-0.5 py-0.5 text-[8px] tablet:text-[9px] leading-none"
                          >
                            {getClassTypeShort(classInfo.type)}
                          </Pill>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>

      <div className="border-border tablet:mt-3 tablet:pt-3 mt-2 border-t pt-2">
        <div className="flex flex-wrap items-center gap-1 tablet:gap-2">
          <Pill variant="blue" icon={BuildingIcon} size="xs">
            {campus}
          </Pill>
          <Pill variant="green" icon={LinkIcon} size="xs">
            NRC {nrc}
          </Pill>
          {category && category.trim() !== "" && (
            <Pill variant="purple" icon={CategoryIcon} size="xs">
              {category}
            </Pill>
          )}
          {area && area.trim() !== "" && (
            <Pill variant="pink" icon={AreaIcon} size="xs">
              {area}
            </Pill>
          )}
          <Pill variant="orange" icon={AttendanceIcon} size="xs">
            {format}
          </Pill>
          <Pill
            variant={isRemovable ? "green" : "red"}
            icon={isRemovable ? CheckIcon : CloseIcon}
            size="xs"
          >
            {isRemovable ? "Retirable" : "No retirable"}
          </Pill>
          {isEnglish && (
            <Pill variant="purple" icon={LanguageIcon} size="xs">
              En Inglés
            </Pill>
          )}
          {isSpecial && (
            <Pill variant="yellow" icon={StarIcon} size="xs">
              Especial
            </Pill>
          )}
        </div>
      </div>
    </div>
  );
}

interface SectionsCollapsibleProps {
  courseSigle: string;
  className?: string;
  /** If provided, overrides internal semester state and hides the semester selector */
  externalSemester?: ValidSemester;
  /** Called when a section is successfully added to the schedule */
  onCourseAdded?: (courseId: string) => void;
  /** Whether to render the sections collapsible open by default */
  defaultSectionsOpen?: boolean;
  /** If provided, only sections whose blocks are contained in these modules will be shown */
  allowedScheduleModules?: readonly string[];
}

export default function SectionsCollapsible({
  courseSigle,
  className = "",
  externalSemester,
  onCourseAdded,
  defaultSectionsOpen = false,
  allowedScheduleModules = [],
}: SectionsCollapsibleProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const currentSemester = useCurrentSemester();

  const defaultSemester =
    (SEMESTERS.find((s) => s <= currentSemester) as ValidSemester | undefined) ?? SEMESTERS[0];
  const [selectedSemester, setSelectedSemester] = useState<ValidSemester>(defaultSemester);

  const effectiveSemester = externalSemester ?? selectedSemester;

  const {
    data: sectionsData,
    isLoading: isPending,
    error,
  } = useSWR(
    `sections:${effectiveSemester}:${courseSigle}`,
    () => fetchSemesterSections(effectiveSemester, courseSigle),
    { revalidateOnFocus: false }
  );

  const { data: quotaTimeline } = useSWR(
    !externalSemester ? `quota:${effectiveSemester}:${courseSigle}` : null,
    () => fetchQuotaTimeline(effectiveSemester as ValidSemester, courseSigle),
    { revalidateOnFocus: false }
  );

  const courseSectionsData = sectionsData ?? {};
  const sections = courseSectionsData[courseSigle] || {};
  const sectionIds = Object.keys(sections);
  const visibleSectionIds = sectionIds.filter((sectionId) =>
    sectionFitsScheduleModuleFilter(sections[sectionId], allowedScheduleModules)
  );

  const getClassTypesInSections = (): string[] => {
    const classTypes = new Set<string>();
    visibleSectionIds.forEach((sectionId) => {
      const section = sections[sectionId];
      if (section.schedule) {
        Object.values(section.schedule).forEach((timeSlot) => {
          if (Array.isArray(timeSlot) && timeSlot.length > 0) classTypes.add(timeSlot[0]);
        });
      }
    });
    return Array.from(classTypes).sort();
  };

  const availableClassTypes = getClassTypesInSections();

  const handleAddToSchedule = (courseId: string, success: boolean) => {
    if (success) {
      toast.success(`${courseId} agregado a tu horario`);
      onCourseAdded?.(courseId);
    } else {
      toast.info(`${courseId} ya está en tu horario`);
    }
    setRefreshKey((prev) => prev + 1);
  };

  const semesterLabel = (s: ValidSemester) => (s === currentSemester ? `${s} (actual)` : s);

  const semesterOptions: ComboboxOption[] = SEMESTERS.map((s) => ({
    value: s,
    label: semesterLabel(s),
  }));

  const semesterSelect = (
    <Combobox
      options={semesterOptions}
      value={selectedSemester}
      onValueChange={(v) => {
        if (v) setSelectedSemester(v as ValidSemester);
      }}
      placeholder="Seleccionar semestre"
      searchPlaceholder="Buscar semestre..."
      emptyMessage="No se encontraron semestres."
      buttonClassName="h-8 w-full text-xs tablet:w-36"
      aria-label="Seleccionar semestre"
    />
  );

  return (
    <section className={className}>
      {/* Encabezado compartido con selector de semestre — oculto cuando el semestre es externo */}
      {!externalSemester && (
        <div className="bg-accent border-border mb-3 flex flex-col gap-3 rounded-md border px-4 py-3 tablet:flex-row tablet:items-center tablet:justify-between tablet:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-orange-light text-orange border-orange/20 shrink-0 rounded-lg border p-2">
              <CalendarIcon className="h-5 w-5 fill-current" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold">Oferta académica</h2>
              <p className="text-muted-foreground text-xs">Semestre {effectiveSemester}</p>
            </div>
          </div>
          {semesterSelect}
        </div>
      )}

      {/* Collapsible de secciones */}
      <div className="bg-accent border-border overflow-hidden rounded-md border">
        <Collapsible defaultOpen={defaultSectionsOpen}>
          <CollapsibleTrigger className="hover:bg-muted/50 group focus:ring-primary flex w-full items-center justify-between px-6 py-4 text-left transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold">Secciones</h2>
                <p className="text-muted-foreground text-sm">
                  {isPending
                    ? "Cargando..."
                    : visibleSectionIds.length > 0
                      ? `${visibleSectionIds.length} sección${visibleSectionIds.length !== 1 ? "es" : ""} disponible${visibleSectionIds.length !== 1 ? "s" : ""}`
                      : "No hay secciones para este semestre"}
                </p>
              </div>
            </div>
            <div className="ml-4 flex shrink-0 items-center gap-2">
              {externalSemester && (
                <span className="text-muted-foreground text-xs">{effectiveSemester}</span>
              )}
              <span className="text-muted-foreground tablet:inline hidden text-sm">Expandir</span>
              <ChevronDownIcon className="text-muted-foreground group-hover:text-foreground h-5 w-5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent className="border-border bg-accent data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-up-1 data-[state=open]:slide-down-1 w-full overflow-hidden border-t px-6 py-4">
            {isPending ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Cargando secciones...</p>
              </div>
            ) : error ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Error al cargar las secciones.</p>
              </div>
            ) : visibleSectionIds.length > 0 ? (
              <div className="tablet:grid-cols-2 grid grid-cols-1 gap-3">
                {visibleSectionIds.map((sectionId) => {
                  const scheduleMatrix = createScheduleMatrix(courseSectionsData, [
                    `${courseSigle}-${sectionId}`,
                  ]);
                  return (
                    <ScheduleGrid
                      key={`${sectionId}-${refreshKey}`}
                      matrix={scheduleMatrix}
                      sectionId={sectionId}
                      courseSigle={courseSigle}
                      semester={effectiveSemester}
                      onAddToSchedule={handleAddToSchedule}
                      sectionData={sections[sectionId]}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  {allowedScheduleModules.length > 0
                    ? "No hay secciones disponibles que calcen con el filtro de horario."
                    : "No hay secciones disponibles para este semestre."}
                </p>
              </div>
            )}

            {availableClassTypes.length > 0 && (
              <div className="border-border mt-6 border-t pt-4">
                <ScheduleLegend
                  classTypes={availableClassTypes}
                  compact={true}
                  useShortNames={false}
                  className="text-xs"
                />
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Historial de cupos — solo cuando no está controlado externamente */}
      {!externalSemester && <QuotaHistorySection quotaTimeline={quotaTimeline} className="mt-3" />}
    </section>
  );
}
