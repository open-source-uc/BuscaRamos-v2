"use client";

import { useState, useEffect, useMemo, lazy, Suspense, useCallback, useRef } from "react";
import useSWR from "swr";
import dynamic from "next/dynamic";
import { useNDJSONStream } from "@/hooks/useNDJSONStream";
import {
  createScheduleMatrix,
  detectScheduleConflicts,
  TIME_SLOTS,
  TIME_RANGES,
  DAYS,
  convertCourseDataToSections,
  shuffleSections,
  getAvailableSections,
} from "@/lib/scheduleMatrix";
import {
  getSavedCourses,
  saveCourses,
  addCourseToSchedule,
  removeCourseFromSchedule,
  getSavedHiddenCourses,
  addHiddenCourse,
  removeHiddenCourse,
} from "@/lib/scheduleStorage";
import type { ScheduleMatrix, CourseSections, CourseScore } from "@/types/types.ts";
import { Pill } from "@/components/ui/pill";
import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { toast } from "sonner";
import {
  SearchIcon,
  SelectionIcon,
  CalendarIcon,
  CloseIcon,
  ShuffleIcon,
  AreaIcon,
  ChevronDownIcon,
  PlusIcon,
} from "@/components/icons/icons";
import { cn } from "@/lib/utils";
import { formatScheduleLocation } from "@/lib/scheduleLocation";
import { getClassTypeLong, getClassTypeColor } from "@/components/courses/schedules/ScheduleLegend";
import generateICSFromSchedule from "@/lib/generateICSFromSchedule";
import { Search } from "@/components/search/SearchInput";
import { useFuse } from "@/hooks/useFuse";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useCurrentSemester } from "@/context/semesterCtx";
import { CourseFilters } from "@/components/ui/CourseFilters";
import ScheduleModuleFilter from "@/components/courses/schedules/ScheduleModuleFilter";
import { applyCourseScoreFilters } from "@/lib/courseScoreFilters";
import { courseHasSectionWithinScheduleModules } from "@/lib/scheduleModuleFilter";
import SectionsCollapsible, {
  SEMESTERS,
  type ValidSemester,
} from "@/components/courses/schedules/SectionsCollapsible";
const ConflictResolver = dynamic(() => import("@/components/courses/schedules/ConflictResolver"), {
  ssr: false,
});
const ScheduleCombinations = lazy(
  () => import("@/components/courses/schedules/ScheduleCombinations")
);

// Course option interface (for ConflictResolver compatibility)
interface CourseOption {
  id: string;
  sigle: string;
  seccion: string;
  nombre: string;
  nrc: string;
  campus: string;
}

function createFallbackCourseScore(sigle: string, name: string, semester: string): CourseScore {
  return {
    sigle,
    name,
    credits: 0,
    school: "",
    last_semester: semester,
    likes: 0,
    dislikes: 0,
    superlikes: 0,
    votes_low_workload: 0,
    votes_medium_workload: 0,
    votes_high_workload: 0,
    votes_mandatory_attendance: 0,
    votes_optional_attendance: 0,
    avg_weekly_hours: 0,
    format: [],
    campus: [],
    is_removable: [],
    is_special: [],
    is_english: [],
    area: [],
    categories: [],
  };
}

const DAY_LABELS: Record<string, string> = {
  l: "Lu",
  m: "Ma",
  w: "Mi",
  j: "Ju",
  v: "Vi",
  s: "Sá",
};

function formatDays(schedule: Record<string, Array<string>>): string {
  const keys = Object.keys(schedule);
  if (!keys.length) return "Sin horario";
  const seen = new Set<string>();
  const days: string[] = [];
  for (const k of keys) {
    const d = DAY_LABELS[k[0]] ?? k[0].toUpperCase();
    if (!seen.has(d)) {
      seen.add(d);
      days.push(d);
    }
  }
  return days.join(" ");
}

// Schedule grid component (main calendar view) — always uses class-type coloring
function ScheduleGrid({
  matrix,
  selectedCourses,
  courseSectionsData,
  courseOptions,
  hiddenCourses = [],
  onApplySuggestions,
  onHiddenCoursesChange,
}: {
  matrix: ScheduleMatrix;
  selectedCourses: string[];
  courseSectionsData: CourseSections;
  courseOptions: CourseOption[];
  hiddenCourses?: string[];
  onApplySuggestions: (newCourses: string[]) => void;
  onHiddenCoursesChange: (hiddenCourses: string[]) => void;
}) {
  const conflicts = detectScheduleConflicts(matrix);
  const hasConflicts = conflicts.length > 0;
  const gridColumns =
    "grid-cols-[56px_repeat(6,96px)] tablet:grid-cols-[74px_repeat(6,minmax(110px,1fr))]";
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [mobileScale, setMobileScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;

    if (!container || !content) return;

    const measureScale = () => {
      if (window.innerWidth >= 768) {
        setMobileScale(1);
        setScaledHeight(null);
        return;
      }

      const containerWidth = container.clientWidth;
      const contentWidth = content.scrollWidth;
      const contentHeight = content.scrollHeight;

      if (!containerWidth || !contentWidth || !contentHeight) return;

      const nextScale = Math.min(1, containerWidth / contentWidth);
      setMobileScale(nextScale);
      setScaledHeight(contentHeight * nextScale);
    };

    measureScale();

    const resizeObserver = new ResizeObserver(measureScale);
    resizeObserver.observe(container);
    resizeObserver.observe(content);
    window.addEventListener("resize", measureScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measureScale);
    };
  }, [matrix]);

  return (
    <div className="bg-background border-border overflow-hidden rounded-lg border">
      <div ref={containerRef} className="overflow-hidden tablet:overflow-x-auto">
        <div style={scaledHeight ? { height: `${scaledHeight}px` } : undefined}>
          <div
            ref={contentRef}
            className="min-w-158 origin-top-left tablet:min-w-0"
            style={mobileScale < 1 ? { transform: `scale(${mobileScale})` } : undefined}
          >
            {/* Header */}
            <div className={cn("bg-accent border-border grid border-b", gridColumns)}>
              <div className="text-accent-foreground px-2 py-2 text-center text-[11px] font-semibold tablet:px-3 tablet:py-3 tablet:text-sm">
                Horario
              </div>
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="text-accent-foreground px-1 py-2 text-center text-[11px] font-semibold tablet:px-3 tablet:py-3 tablet:text-sm"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Time slots */}
            {TIME_SLOTS.map((time, timeIndex) => (
              <div key={time}>
                <div
                  className={cn(
                    "border-border hover:bg-muted/25 grid border-b transition-colors",
                    gridColumns
                  )}
                >
                  <div className="text-muted-foreground bg-muted/25 flex items-center px-2 py-2 text-[10px] font-semibold tablet:px-3 tablet:py-3 tablet:text-sm gap-2">
                    <h3 className="text-sm">{timeIndex + 1}</h3>
                    <h3 className="text-center">
                      {time} <br />
                      {TIME_RANGES[time as keyof typeof TIME_RANGES]}
                    </h3>
                  </div>

                  {DAYS.map((day, dayIndex) => {
                    const classes = matrix[timeIndex][dayIndex];
                    const hasConflict = classes.length > 1;

                    return (
                      <div
                        key={`${day}-${timeIndex}`}
                        className={cn(
                          "tablet:min-h-18.5 flex min-h-14.5 flex-col items-center justify-center gap-1 px-1 py-1.5 tablet:gap-1.5 tablet:px-2 tablet:py-2",
                          hasConflict && "bg-red-light border-red/20"
                        )}
                      >
                        {classes.map((classInfo, index) => {
                          const colorVariant = getClassTypeColor(classInfo.type);
                          const scheduleLocation = formatScheduleLocation(
                            classInfo.campus,
                            classInfo.classroom
                          );
                          const courseIsHidden = hiddenCourses.includes(
                            `${classInfo.courseId}-${classInfo.section}-${day}-${time}`
                          );
                          if (courseIsHidden)
                            return (
                              <div
                                key={`${classInfo.courseId}-${classInfo.section}-${index}`}
                                onClick={() => {
                                  removeHiddenCourse(
                                    `${classInfo.courseId}-${classInfo.section}-${day}-${time}`
                                  );
                                  onHiddenCoursesChange(getSavedHiddenCourses());
                                }}
                                className="w-full hover:cursor-pointer"
                                title="Excluido del export — clic para incluir"
                              >
                                <Pill
                                  size="xs"
                                  className="bg-muted border-border text-muted-foreground line-through decoration-muted-foreground/60 tablet:text-[11px] w-full min-w-0 justify-center px-1 py-0.5 text-[9px] opacity-60"
                                >
                                  <div className="min-w-0 text-center leading-tight">
                                    <div className="font-medium tracking-tight">
                                      {classInfo.courseId}-{classInfo.section}
                                    </div>
                                    <div className="tablet:text-[10px] text-[8px] opacity-80">
                                      {getClassTypeLong(classInfo.type)}
                                    </div>
                                    <div className="tablet:text-[10px] text-[8px] opacity-80">
                                      {scheduleLocation}
                                    </div>
                                  </div>
                                </Pill>
                              </div>
                            );

                          return (
                            <div
                              key={`${classInfo.courseId}-${classInfo.section}-${index}`}
                              onClick={() => {
                                addHiddenCourse(
                                  `${classInfo.courseId}-${classInfo.section}-${day}-${time}`
                                );
                                onHiddenCoursesChange(getSavedHiddenCourses());
                              }}
                              className="w-full hover:cursor-pointer"
                            >
                              <Pill
                                variant={colorVariant}
                                size="xs"
                                className="tablet:text-[11px] w-full min-w-0 justify-center px-1 py-0.5 text-[9px]"
                              >
                                <div className="min-w-0 text-center leading-tight">
                                  <div className="font-medium tracking-tight">
                                    {classInfo.courseId}-{classInfo.section}
                                  </div>
                                  <div className="tablet:text-[10px] text-[8px] opacity-80">
                                    {getClassTypeLong(classInfo.type)}
                                  </div>
                                  <div className="tablet:text-[10px] text-[8px] opacity-80">
                                    {scheduleLocation}
                                  </div>
                                </div>
                              </Pill>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                {time === "12:20" && (
                  <div className={cn("border-border grid border-b", gridColumns)}>
                    <div className="bg-muted/25 hover:bg-muted/50 text-muted-foreground tracking-[50px] pl-12.5 col-span-7 flex items-center justify-center py-4 text-center text-sm tablet:text-xl font-semibold">
                      ALMUERZO
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {hasConflicts && (
        <div className="bg-red-light/20 border-red/20 border-t p-4">
          <div className="tablet:flex-row tablet:items-center tablet:gap-3 flex flex-col justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="bg-red h-2 w-2 rounded-full"></div>
              <div>
                <span className="text-red text-sm font-medium">
                  Conflictos detectados: {conflicts.length}
                </span>
                <p className="text-red/80 mt-1 text-xs">
                  Hay {conflicts.length} conflicto{conflicts.length > 1 ? "s" : ""} de horario en tu
                  selección
                </p>
              </div>
            </div>
            <Suspense fallback={<div className="bg-muted h-8 w-32 animate-pulse rounded"></div>}>
              <ConflictResolver
                selectedCourses={selectedCourses}
                courseSections={courseSectionsData}
                courseOptions={courseOptions}
                onApplySuggestions={onApplySuggestions}
                hasConflicts={hasConflicts}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}

// Main component
export default function ScheduleCreator() {
  const currentSemester = useCurrentSemester();
  const defaultSemester =
    (SEMESTERS.find((s) => s <= currentSemester) as ValidSemester | undefined) ?? SEMESTERS[0];

  const [selectedSemester, setSelectedSemester] = useState<ValidSemester>(defaultSemester);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [hiddenCourses, setHiddenCourses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOFGFinder, setShowOFGFinder] = useState(false);
  const [ofgSelectedArea, setOfgSelectedArea] = useState("");
  const [selectedAreaFilter, setSelectedAreaFilter] = useState("all");
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState("all");
  const [selectedCampusFilter, setSelectedCampusFilter] = useState("all");
  const [selectedFormatFilter, setSelectedFormatFilter] = useState("all");
  const [selectedLastSemesterFilter, setSelectedLastSemesterFilter] = useState("all");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [showRetirableOnly, setShowRetirableOnly] = useState(false);
  const [showEnglishOnly, setShowEnglishOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedScheduleModules, setSelectedScheduleModules] = useState<string[]>([]);

  // Fetch all course data for the selected semester
  const { data: semesterData, isLoading } = useSWR(
    `semester-all:${selectedSemester}`,
    async () => {
      const res = await fetch(`https://public.osuc.dev/${selectedSemester}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<Record<string, any>>;
    },
    { revalidateOnFocus: false }
  );
  const { data: courseScoreData } = useNDJSONStream<CourseScore>(
    "https://public.osuc.dev/courses-score.ndjson"
  );

  const courseSectionsData = useMemo(
    () => (semesterData ? convertCourseDataToSections(semesterData) : {}),
    [semesterData]
  );

  const filterableCourses = useMemo<CourseScore[]>(() => {
    if (!semesterData) return [];

    const semesterEntries = Object.entries(semesterData);
    const courseScoresBySigle = new Map(courseScoreData.map((course) => [course.sigle, course]));

    return semesterEntries.map(([sigle, data]) => {
      const courseScore = courseScoresBySigle.get(sigle);
      if (courseScore) return courseScore;

      const courseName =
        typeof data === "object" && data !== null && "name" in data && typeof data.name === "string"
          ? data.name
          : sigle;

      return createFallbackCourseScore(sigle, courseName, selectedSemester);
    });
  }, [courseScoreData, selectedSemester, semesterData]);

  const filteredCoursesWithoutSearch = useMemo(() => {
    const baseFilteredCourses = applyCourseScoreFilters(filterableCourses, {
      selectedArea: selectedAreaFilter,
      selectedSchool: selectedSchoolFilter,
      selectedCampus: selectedCampusFilter,
      selectedFormat: selectedFormatFilter,
      selectedSemester: selectedLastSemesterFilter,
      selectedCategory: selectedCategoryFilter,
      showRetirableOnly,
      showEnglishOnly,
    });

    return baseFilteredCourses.filter((course) =>
      courseHasSectionWithinScheduleModules(
        courseSectionsData[course.sigle],
        selectedScheduleModules
      )
    );
  }, [
    courseSectionsData,
    filterableCourses,
    selectedAreaFilter,
    selectedCampusFilter,
    selectedCategoryFilter,
    selectedFormatFilter,
    selectedLastSemesterFilter,
    selectedSchoolFilter,
    selectedScheduleModules,
    showEnglishOnly,
    showRetirableOnly,
  ]);

  // Course options for ConflictResolver (per-section)
  const courseOptions = useMemo<CourseOption[]>(
    () =>
      Object.entries(courseSectionsData).flatMap(([sigle, sections]) =>
        Object.entries(sections).map(([section, data]) => ({
          id: `${sigle}-${section}`,
          sigle,
          seccion: section,
          nombre: (data as any).name || "Sin nombre",
          nrc: (data as any).nrc || "N/A",
          campus: (data as any).campus || "Sin campus",
        }))
      ),
    [courseSectionsData]
  );

  // Hydrate state from storage after mount
  useEffect(() => {
    setSelectedCourses(getSavedCourses(selectedSemester));
    setHiddenCourses(getSavedHiddenCourses());
  }, []);

  // When semester changes, load courses for the new semester
  useEffect(() => {
    setSelectedCourses(getSavedCourses(selectedSemester));
  }, [selectedSemester]);

  // Fuzzy search over all courses for this semester
  const fuseResult = useFuse<CourseScore>({
    data: filteredCoursesWithoutSearch,
    query: searchTerm,
  });

  const hasActiveSearchFilters =
    selectedAreaFilter !== "all" ||
    selectedSchoolFilter !== "all" ||
    selectedCampusFilter !== "all" ||
    selectedFormatFilter !== "all" ||
    selectedLastSemesterFilter !== "all" ||
    selectedCategoryFilter !== "all" ||
    showRetirableOnly ||
    showEnglishOnly ||
    selectedScheduleModules.length > 0;
  const hasSearchTerm = searchTerm.trim() !== "";
  const shouldShowSearchResults = hasSearchTerm || hasActiveSearchFilters;
  const totalSearchResults = hasSearchTerm ? fuseResult.results : filteredCoursesWithoutSearch;
  const searchResults = hasSearchTerm
    ? totalSearchResults.slice(0, 5)
    : totalSearchResults.slice(0, 20);

  const scheduleMatrix = useMemo(
    () => createScheduleMatrix(courseSectionsData, selectedCourses),
    [courseSectionsData, selectedCourses]
  );

  const hasShufflableCourses = selectedCourses.some((c) => {
    const lastDash = c.lastIndexOf("-");
    return getAvailableSections(c.substring(0, lastDash), courseSectionsData).length > 1;
  });

  const availableClassTypes = useMemo(
    () => Array.from(new Set(scheduleMatrix.flat(2).map((b) => b.type))).filter(Boolean),
    [scheduleMatrix]
  );

  // OFG Finder: unique areas from semester section data
  const availableAreas = useMemo(() => {
    const areas = new Set<string>();
    for (const sections of Object.values(courseSectionsData)) {
      for (const sectionData of Object.values(sections)) {
        const area = (sectionData as any).area;
        if (area?.trim()) areas.add(area.trim());
      }
    }
    return Array.from(areas).sort();
  }, [courseSectionsData]);

  // OFG Finder: non-conflicting sections for the selected area
  type OFGSection = {
    sigle: string;
    name: string;
    sectionId: string;
    courseId: string;
    sectionData: any;
  };
  const ofgResults = useMemo<OFGSection[]>(() => {
    if (!ofgSelectedArea) return [];
    const baseConflicts = detectScheduleConflicts(scheduleMatrix).length;
    const results: OFGSection[] = [];
    for (const [sigle, sections] of Object.entries(courseSectionsData)) {
      const courseName = (semesterData?.[sigle] as any)?.name || sigle;
      for (const [sectionId, rawData] of Object.entries(sections)) {
        const s = rawData as any;
        if (s.area?.trim() !== ofgSelectedArea) continue;
        const courseId = `${sigle}-${sectionId}`;
        if (selectedCourses.includes(courseId)) continue;
        const testMatrix = createScheduleMatrix(courseSectionsData, [...selectedCourses, courseId]);
        if (detectScheduleConflicts(testMatrix).length === baseConflicts) {
          results.push({ sigle, name: courseName, sectionId, courseId, sectionData: s });
        }
      }
    }
    return results;
  }, [ofgSelectedArea, courseSectionsData, semesterData, selectedCourses, scheduleMatrix]);

  // Group OFG results by course
  const ofgByCourse = useMemo(() => {
    const map = new Map<string, { name: string; sections: OFGSection[] }>();
    for (const r of ofgResults) {
      if (!map.has(r.sigle)) map.set(r.sigle, { name: r.name, sections: [] });
      map.get(r.sigle)!.sections.push(r);
    }
    return Array.from(map.entries()).map(([sigle, d]) => ({ sigle, ...d }));
  }, [ofgResults]);

  const handleCourseAdded = useCallback(() => {
    setSelectedCourses(getSavedCourses(selectedSemester));
  }, [selectedSemester]);

  const handleClearSearchFilters = () => {
    setSelectedAreaFilter("all");
    setSelectedSchoolFilter("all");
    setSelectedCampusFilter("all");
    setSelectedFormatFilter("all");
    setSelectedLastSemesterFilter("all");
    setSelectedCategoryFilter("all");
    setShowRetirableOnly(false);
    setShowEnglishOnly(false);
    setSelectedScheduleModules([]);
    setSearchTerm("");
  };

  const handleCourseRemove = (courseId: string) => {
    if (removeCourseFromSchedule(courseId, selectedSemester)) {
      setSelectedCourses(getSavedCourses(selectedSemester));
      toast.success(`${courseId} eliminado de tu horario`);
    }
  };

  const handleApplySuggestions = (newCourses: string[]) => {
    setSelectedCourses(newCourses);
    saveCourses(newCourses, selectedSemester);
    toast.info("Conflictos resueltos - se han aplicado los cambios de sección");
  };

  const handleOFGAdd = (courseId: string) => {
    if (addCourseToSchedule(courseId, selectedSemester)) {
      setSelectedCourses(getSavedCourses(selectedSemester));
      toast.success(`${courseId} agregado a tu horario`);
    }
  };

  const handleShuffleSections = async () => {
    if (selectedCourses.length === 0) return;

    const shufflable = selectedCourses.filter((c) => {
      const lastDash = c.lastIndexOf("-");
      return getAvailableSections(c.substring(0, lastDash), courseSectionsData).length > 1;
    });

    if (shufflable.length === 0) {
      toast.info("No hay cursos con secciones alternativas para mezclar");
      return;
    }

    setIsShuffling(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const shuffledCourses = shuffleSections(selectedCourses, courseSectionsData);
      const hasChanges = shuffledCourses.some((c, i) => c !== selectedCourses[i]);

      if (hasChanges) {
        setSelectedCourses(shuffledCourses);
        saveCourses(shuffledCourses, selectedSemester);
        const changedCount = shuffledCourses.filter((c, i) => c !== selectedCourses[i]).length;
        const oldConflicts = detectScheduleConflicts(
          createScheduleMatrix(courseSectionsData, selectedCourses)
        ).length;
        const newConflicts = detectScheduleConflicts(
          createScheduleMatrix(courseSectionsData, shuffledCourses)
        ).length;
        if (newConflicts === 0 && oldConflicts > 0) {
          toast.success(`¡Perfecto! ${changedCount} curso(s) cambiaron y no hay conflictos`);
        } else {
          toast.success(`Secciones mezcladas: ${changedCount} curso(s) cambiaron de sección`);
        }
      } else {
        toast.info("Las secciones aleatorias coincidieron con las actuales");
      }
    } finally {
      setIsShuffling(false);
    }
  };

  const getCourseInfo = (courseId: string) => {
    const lastDash = courseId.lastIndexOf("-");
    const sigle = courseId.substring(0, lastDash);
    const section = courseId.substring(lastDash + 1);
    const sectionData = courseSectionsData[sigle]?.[section] as any;
    return {
      sigle,
      seccion: section,
      nombre: sectionData?.name || sigle,
      nrc: sectionData?.nrc || "N/A",
      campus: sectionData?.campus || "Sin campus",
    };
  };

  const semesterOptions: ComboboxOption[] = SEMESTERS.map((s) => ({
    value: s,
    label: s === currentSemester ? `${s} (actual)` : s,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      {/* Semester selector */}
      <div className="border-border bg-accent flex flex-col gap-4 rounded-lg border p-4 tablet:flex-row tablet:items-center tablet:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="bg-orange-light text-orange border-orange/20 rounded-lg border p-2 shrink-0">
            <CalendarIcon className="h-5 w-5 fill-current" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold">Semestre</h2>
            <p className="text-muted-foreground text-sm hidden tablet:block">
              Los cursos no se mezclan entre semestres
            </p>
          </div>
        </div>
        <Combobox
          options={semesterOptions}
          value={selectedSemester}
          onValueChange={(v) => {
            if (v) setSelectedSemester(v as ValidSemester);
          }}
          placeholder="Seleccionar semestre"
          searchPlaceholder="Buscar semestre..."
          emptyMessage="No se encontraron semestres."
          buttonClassName="h-9 w-full text-sm tablet:w-40"
          aria-label="Seleccionar semestre"
        />
      </div>

      {/* Course Search */}
      <div className="border-border rounded-lg border bg-accent">
        <div className="p-4 tablet:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-blue-light text-blue border-blue/20 rounded-lg border p-2 shrink-0">
              <SearchIcon className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base tablet:text-lg font-semibold">Buscar curso</h2>
              <p className="text-muted-foreground text-xs tablet:text-sm">
                Busca y despliega las secciones para agregarlas a tu horario
              </p>
            </div>
          </div>

          <Search
            onSearch={setSearchTerm}
            placeholder="Buscar curso (ej: IIC2214, Matemáticas)"
            initialValue={searchTerm}
            value={searchTerm}
            useFuzzySearch={true}
            isSearching={fuseResult.isSearching}
          />

          <div className="mt-4">
            <CourseFilters
              courses={filterableCourses}
              selectedArea={selectedAreaFilter}
              selectedSchool={selectedSchoolFilter}
              selectedCampus={selectedCampusFilter}
              selectedFormat={selectedFormatFilter}
              selectedSemester={selectedLastSemesterFilter}
              showRetirableOnly={showRetirableOnly}
              showEnglishOnly={showEnglishOnly}
              selectedCategory={selectedCategoryFilter}
              filtersOpen={filtersOpen}
              onAreaChange={setSelectedAreaFilter}
              onSchoolChange={setSelectedSchoolFilter}
              onCampusChange={setSelectedCampusFilter}
              onFormatChange={setSelectedFormatFilter}
              onSemesterChange={setSelectedLastSemesterFilter}
              onRetirableToggle={setShowRetirableOnly}
              onEnglishToggle={setShowEnglishOnly}
              onFiltersOpenChange={setFiltersOpen}
              onCategoryChange={setSelectedCategoryFilter}
              onClearFilters={handleClearSearchFilters}
              additionalActiveFiltersCount={selectedScheduleModules.length > 0 ? 1 : 0}
            >
              <ScheduleModuleFilter
                selectedModules={selectedScheduleModules}
                onChange={setSelectedScheduleModules}
              />
            </CourseFilters>
          </div>

          {/* Search status */}
          {isLoading && shouldShowSearchResults && (
            <p className="text-muted-foreground mt-3 text-sm">Cargando cursos...</p>
          )}
          {!isLoading &&
            shouldShowSearchResults &&
            searchResults.length === 0 &&
            !fuseResult.isSearching && (
              <p className="text-muted-foreground mt-3 text-sm">No se encontraron cursos</p>
            )}
        </div>

        {/* Search results — outside the padding to go full-width */}
        {shouldShowSearchResults && searchResults.length > 0 && (
          <div className="border-border border-t">
            <div className="border-border bg-background/55 border-b px-4 py-2 text-xs text-muted-foreground tablet:px-6">
              Mostrando {searchResults.length} de {totalSearchResults.length} curso
              {totalSearchResults.length !== 1 ? "s" : ""}
            </div>
            <div className="max-h-[70vh] overflow-y-auto overscroll-contain">
              {searchResults.map(({ sigle, name }, idx) => (
                <div
                  key={sigle}
                  className={cn(
                    "px-4 tablet:px-6 py-3",
                    idx < searchResults.length - 1 && "border-border border-b"
                  )}
                >
                  {/* Course header row */}
                  <div className="mb-2 flex items-baseline gap-2">
                    <span className="text-sm font-semibold">{sigle}</span>
                    <span className="text-muted-foreground text-xs truncate">{name}</span>
                  </div>
                  <SectionsCollapsible
                    courseSigle={sigle}
                    externalSemester={selectedSemester}
                    onCourseAdded={handleCourseAdded}
                    defaultSectionsOpen={false}
                    allowedScheduleModules={selectedScheduleModules}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* OFG Finder */}
      <div className="border-border overflow-hidden rounded-lg border bg-accent">
        <button
          onClick={() => setShowOFGFinder(!showOFGFinder)}
          className="hover:bg-muted/30 flex w-full items-center justify-between p-4 text-left transition-colors tablet:p-5"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-pink-light text-pink border-pink/20 shrink-0 rounded-lg border p-2">
              <AreaIcon className="h-5 w-5 fill-current" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold tablet:text-lg">Buscar OFG sin tope</h2>
              <p className="text-muted-foreground text-xs tablet:text-sm">
                Encuentra opciones de formación general que no choquen con tu horario
              </p>
            </div>
          </div>
          <ChevronDownIcon
            className={cn(
              "text-muted-foreground ml-4 h-5 w-5 shrink-0 transition-transform duration-200",
              showOFGFinder && "rotate-180"
            )}
          />
        </button>

        {showOFGFinder && (
          <div className="border-border border-t p-4 tablet:p-5">
            {/* Area selector */}
            <div className="mb-4">
              <p className="text-muted-foreground mb-2 text-xs font-medium">
                Selecciona un área de formación general
              </p>
              <Combobox
                options={availableAreas.map((a) => ({ value: a, label: a }))}
                value={ofgSelectedArea}
                onValueChange={(v) => setOfgSelectedArea(v || "")}
                placeholder="Seleccionar área…"
                searchPlaceholder="Buscar área…"
                emptyMessage={isLoading ? "Cargando…" : "No se encontraron áreas."}
                buttonClassName="w-full max-w-xs h-9 text-sm"
                aria-label="Área de formación general"
              />
            </div>

            {/* Results */}
            {ofgSelectedArea && ofgResults.length === 0 && (
              <p className="text-muted-foreground py-4 text-sm">
                No hay secciones disponibles sin tope para esta área.
              </p>
            )}

            {ofgByCourse.length > 0 && (
              <div className="space-y-3">
                <p className="text-muted-foreground text-xs">
                  {ofgResults.length} sección{ofgResults.length !== 1 ? "es" : ""} ·{" "}
                  {ofgByCourse.length} curso{ofgByCourse.length !== 1 ? "s" : ""}
                </p>
                {ofgByCourse.map(({ sigle, name, sections }) => (
                  <div
                    key={sigle}
                    className="bg-background border-border rounded-lg border p-3 tablet:p-4"
                  >
                    <div className="mb-2.5 flex items-baseline gap-2">
                      <span className="text-sm font-semibold">{sigle}</span>
                      <span className="text-muted-foreground truncate text-xs">{name}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sections.map(({ sectionId, sectionData, courseId }) => (
                        <div
                          key={sectionId}
                          className="bg-accent border-border flex items-center gap-3 rounded-md border px-3 py-2"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-medium">Sección {sectionId}</div>
                            <div className="text-muted-foreground text-[11px]">
                              {formatDays(sectionData.schedule || {})} ·{" "}
                              {sectionData.campus || "Sin campus"}
                            </div>
                            <div className="text-muted-foreground text-[11px]">
                              NRC {sectionData.nrc || "—"} · {sectionData.format || ""}
                            </div>
                          </div>
                          <Button
                            variant="ghost_blue"
                            size="xs"
                            icon={PlusIcon}
                            onClick={() => handleOFGAdd(courseId)}
                          >
                            Agregar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Courses */}
      {selectedCourses.length > 0 && (
        <div className="border-border rounded-lg border bg-accent p-4 tablet:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-green-light text-green border-green/20 rounded-lg border p-2 shrink-0">
                <SelectionIcon className="h-5 w-5 fill-current" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base tablet:text-lg font-semibold">Cursos seleccionados</h2>
                <p className="text-muted-foreground text-xs tablet:text-sm">
                  {selectedCourses.length} curso{selectedCourses.length > 1 ? "s" : ""} · semestre{" "}
                  {selectedSemester}
                </p>
              </div>
            </div>
            {hasShufflableCourses && (
              <Button
                onClick={handleShuffleSections}
                variant="ghost_border"
                size="icon"
                disabled={isShuffling}
                title="Mezclar secciones al azar"
                className={cn(isShuffling && "animate-pulse")}
              >
                <ShuffleIcon
                  className={cn("text-muted-foreground h-5 w-5", isShuffling && "animate-spin")}
                />
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedCourses.map((courseId) => {
              const info = getCourseInfo(courseId);
              return (
                <div
                  key={courseId}
                  className="bg-background border-border flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="font-medium">
                      {info.sigle} — Sección {info.seccion}
                    </span>
                    <span className="text-muted-foreground text-xs">{info.nombre}</span>
                    <span className="text-muted-foreground text-xs">
                      NRC {info.nrc} · {info.campus}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCourseRemove(courseId)}
                    className="hover:bg-muted flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors"
                    aria-label={`Eliminar ${courseId}`}
                  >
                    <CloseIcon className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Schedule Grid */}
      <div className="border-border overflow-hidden rounded-lg border bg-accent">
        <div className="border-border border-b px-4 tablet:px-6 py-4">
          <div className="flex flex-col tablet:flex-row gap-3 items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-orange-light text-orange border-orange/20 rounded-lg border p-2">
                <CalendarIcon className="h-5 w-5 fill-current" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Tu Horario</h2>
                <p className="text-muted-foreground text-sm">Semestre {selectedSemester}</p>
              </div>
            </div>
            {selectedCourses.length > 0 && availableClassTypes.length > 0 && (
              <DropdownMenu
                trigger={
                  <>
                    <CalendarIcon className="h-5 w-5" />
                    Exportar a .ics
                  </>
                }
              >
                <DropdownMenuItem
                  onClick={() => generateICSFromSchedule({ matrix: scheduleMatrix, hiddenCourses })}
                >
                  Exportar todo
                </DropdownMenuItem>
                {availableClassTypes.map((type) => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() =>
                      generateICSFromSchedule({
                        matrix: scheduleMatrix,
                        hiddenCourses,
                        filterType: type,
                      })
                    }
                  >
                    Exportar {getClassTypeLong(type)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="p-4 tablet:p-6">
          {selectedCourses.length > 0 ? (
            <ScheduleGrid
              matrix={scheduleMatrix}
              selectedCourses={selectedCourses}
              courseSectionsData={courseSectionsData}
              courseOptions={courseOptions}
              hiddenCourses={hiddenCourses}
              onApplySuggestions={handleApplySuggestions}
              onHiddenCoursesChange={setHiddenCourses}
            />
          ) : (
            <div className="py-12 text-center">
              <CalendarIcon className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-40" />
              <p className="text-muted-foreground mb-1 text-base font-medium">
                Aún no hay cursos seleccionados
              </p>
              <p className="text-muted-foreground text-sm">
                Busca un curso arriba y agrega secciones a tu horario
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Combinations */}
      <Suspense
        fallback={
          <div className="border-border rounded-lg border p-6">
            <div className="flex animate-pulse items-center gap-3">
              <div className="bg-muted h-12 w-12 rounded-lg"></div>
              <div className="space-y-2">
                <div className="bg-muted h-4 w-48 rounded"></div>
                <div className="bg-muted h-3 w-64 rounded"></div>
              </div>
            </div>
          </div>
        }
      >
        <ScheduleCombinations
          selectedCourses={selectedCourses}
          courseSections={courseSectionsData}
          onApplyCombination={handleApplySuggestions}
        />
      </Suspense>
    </div>
  );
}
