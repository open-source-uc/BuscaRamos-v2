"use client";

import useSWR from "swr";
import { useState, useEffect, useTransition, useMemo } from "react";
import { staticDataClient } from "@/lib/static-data-api/client";
import type { paths } from "@/lib/static-data-api/types";
import type { CourseStaticData } from "@/lib/coursesStaticData";
import type { PrerequisiteGroup, ParsedPrerequisites } from "@/lib/courseReq";
import type { ParsedRestrictions, RestrictionGroup } from "@/lib/courseRestrictions";
import type { ParsedEquivalents } from "@/lib/courseEquiv";
import {
  calculatePositivePercentage,
  calculateSentiment,
  formatWeeklyHours,
  getAttendanceLabel,
  getSentimentLabel,
  getWorkloadLabel,
} from "@/lib/courseStats";
import { AttendanceIcon, Sentiment, ThumbUpIcon, WorkloadIcon } from "@/components/icons";
import CourseInformation from "@/components/ui/CourseInformation";
import PrerequisitesSection from "@/components/courses/PrerequisitesSection";
import EquivCourses from "@/components/courses/EquivCourses";
import OpensCoursesSection from "@/components/courses/OpensCoursesSections";
import SectionsCollapsible from "@/components/courses/schedules/SectionsCollapsible";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ────────────────────────────────────────────────────────────────────

type ApiCourse =
  paths["/data/{sigle}"]["get"]["responses"][200]["content"]["application/json"];
type ApiPrerequisiteGroup = NonNullable<ApiCourse["parsed_meta_data"]["prerequisites"]>;
type ApiPrerequisiteCourse = ApiPrerequisiteGroup["courses"][number];

type CourseStats = {
  likes: number;
  dislikes: number;
  superlikes: number;
  votes_low_workload: number;
  votes_medium_workload: number;
  votes_high_workload: number;
  votes_mandatory_attendance: number;
  votes_optional_attendance: number;
  avg_weekly_hours: number;
};

type CourseCore = {
  course: CourseStaticData;
  stats: CourseStats;
  // All sigles that need name resolution
  allSigles: string[];
  // Raw API structures (built without names, used to rebuild with names)
  rawPrereqStructure: unknown | null;
  equivSigles: string[];
  unlockPreSigles: string[];
  unlockCoSigles: string[];
  // Flags
  hasPrerequisites: boolean;
  rawRestrictions: unknown | null;
  hasRestrictions: boolean;
  hasEquivalences: boolean;
  connector?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractSigles(group: unknown): string[] {
  const g = group as { courses?: ApiPrerequisiteCourse[]; groups?: unknown[] };
  return [
    ...(g.courses?.map((c) => c.sigle) ?? []),
    ...(g.groups?.flatMap((sub) => extractSigles(sub)) ?? []),
  ];
}

function buildPrereqGroup(group: unknown, names: Map<string, string | undefined>): PrerequisiteGroup {
  const g = group as { type: "AND" | "OR"; courses?: ApiPrerequisiteCourse[]; groups?: unknown[] };
  return {
    type: g.type,
    courses: (g.courses ?? []).map((c) => ({
      sigle: c.sigle,
      isCoreq: c.is_coreq,
      name: names.get(c.sigle),
    })),
    groups: g.groups?.map((sub) => buildPrereqGroup(sub, names)),
  };
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function fetchCourseCore(sigle: string): Promise<CourseCore> {
  const { data: apiData, response } = await staticDataClient.GET("/data/{sigle}", {
    params: { path: { sigle } },
  });

  if (!apiData || !response.ok) {
    throw new Error(
      response.status === 404 ? "Curso no encontrado" : "Error al cargar los datos del curso"
    );
  }

  const meta = apiData.parsed_meta_data;

  const prereqSigles = meta.prerequisites ? extractSigles(meta.prerequisites) : [];
  const equivSigles = meta.equivalences ?? [];
  const unlockPreSigles = meta.unlocks?.as_prerequisite ?? [];
  const unlockCoSigles = meta.unlocks?.as_corequisite ?? [];
  const allSigles = [
    ...new Set([...prereqSigles, ...equivSigles, ...unlockPreSigles, ...unlockCoSigles]),
  ];

  const course: CourseStaticData = {
    sigle: apiData.sigle,
    name: apiData.name,
    credits: apiData.credits,
    school: apiData.school,
    area: apiData.area,
    categories: apiData.categories,
    format: apiData.format,
    campus: apiData.campus,
    is_removable: apiData.is_removable,
    is_special: apiData.is_special,
    is_english: apiData.is_english,
    description: apiData.description ?? "",
    last_semester: apiData.last_semester,
    parsed_meta_data: {
      has_prerequisites: meta.has_prerequisites,
      has_restrictions: meta.has_restrictions,
      has_equivalences: meta.has_equivalences,
      unlocks_courses: meta.unlocks_courses,
      connector: meta.connector,
      equivalences: meta.equivalences,
      unlocks: meta.unlocks,
    },
    quota_history: (apiData as Record<string, unknown>).quota_history as CourseStaticData["quota_history"],
  };

  return {
    course,
    stats: {
      likes: apiData.likes,
      dislikes: apiData.dislikes,
      superlikes: apiData.superlikes,
      votes_low_workload: apiData.votes_low_workload,
      votes_medium_workload: apiData.votes_medium_workload,
      votes_high_workload: apiData.votes_high_workload,
      votes_mandatory_attendance: apiData.votes_mandatory_attendance,
      votes_optional_attendance: apiData.votes_optional_attendance,
      avg_weekly_hours: apiData.avg_weekly_hours ?? 0,
    },
    allSigles,
    rawPrereqStructure: meta.prerequisites ?? null,
    equivSigles,
    unlockPreSigles,
    unlockCoSigles,
    hasPrerequisites: meta.has_prerequisites,
    rawRestrictions: meta.restrictions ?? null,
    hasRestrictions: meta.has_restrictions,
    hasEquivalences: meta.has_equivalences,
    connector: meta.connector,
  };
}

async function fetchNames(sigles: string[]): Promise<Map<string, string | undefined>> {
  const entries = await Promise.all(
    sigles.map(async (s) => {
      const { data } = await staticDataClient.GET("/data/{sigle}", {
        params: { path: { sigle: s } },
      });
      return [s, data?.name] as const;
    })
  );
  return new Map(entries);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CourseDetailSkeleton() {
  return (
    <>
      <Skeleton className="h-32 w-full rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-md" />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="mt-8 h-16 w-full rounded-md" />
      ))}
    </>
  );
}

function CourseDetailError({ sigle, onRetry }: { sigle: string; onRetry: () => void }) {
  return (
    <div className="border border-destructive/30 bg-destructive/5 rounded-md p-6">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-red-light text-red border border-red/20 rounded-lg flex-shrink-0">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-foreground">
            No se pudo cargar el curso {sigle}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Hubo un problema al obtener los datos. Puede ser un error temporal.
          </p>
          <button
            onClick={onRetry}
            className="mt-3 text-sm font-medium text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CourseDetailClient({ sigle }: { sigle: string }) {
  const { data: core, error, isLoading, mutate } = useSWR(sigle, fetchCourseCore);
  const [names, setNames] = useState<Map<string, string | undefined>>(new Map());
  const [namesLoading, setNamesLoading] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!core || core.allSigles.length === 0) {
      setNamesLoading(false);
      return;
    }
    setNamesLoading(true);
    fetchNames(core.allSigles).then((resolved) => {
      startTransition(() => {
        setNames(resolved);
        setNamesLoading(false);
      });
    });
  }, [core]);

  const prerequisites = useMemo<ParsedPrerequisites>(() => {
    if (!core?.hasPrerequisites || !core.rawPrereqStructure) return { hasPrerequisites: false };
    return {
      hasPrerequisites: true,
      structure: buildPrereqGroup(core.rawPrereqStructure, names),
    };
  }, [core, names]);

  const restrictions = useMemo<ParsedRestrictions>(() => {
    if (!core?.hasRestrictions || !core.rawRestrictions) return { hasRestrictions: false };
    return { hasRestrictions: true, structure: core.rawRestrictions as RestrictionGroup };
  }, [core]);

  const equivalents = useMemo<ParsedEquivalents>(() => {
    if (!core?.hasEquivalences || core.equivSigles.length === 0) return { hasEquivalents: false };
    return {
      hasEquivalents: true,
      structure: {
        type: "OR",
        courses: core.equivSigles.map((s) => ({ sigle: s, name: names.get(s) })),
      },
    };
  }, [core, names]);

  const unlocks = useMemo(() => {
    if (!core) return { as_prerequisite: [], as_corequisite: [] };
    return {
      as_prerequisite: core.unlockPreSigles.map((s) => ({ sigle: s, name: names.get(s) ?? undefined })),
      as_corequisite: core.unlockCoSigles.map((s) => ({ sigle: s, name: names.get(s) ?? undefined })),
    };
  }, [core, names]);

  if (isLoading) return <CourseDetailSkeleton />;
  if (error) return <CourseDetailError sigle={sigle} onRetry={() => mutate()} />;
  if (!core) return null;

  const { course, stats } = core;
  const sentiment = calculateSentiment(stats.likes, stats.superlikes, stats.dislikes);
  const positivePercentage = calculatePositivePercentage(stats.likes, stats.superlikes, stats.dislikes);
  const workloadLabel = getWorkloadLabel(stats.votes_low_workload, stats.votes_medium_workload, stats.votes_high_workload);
  const attendanceLabel = getAttendanceLabel(stats.votes_mandatory_attendance, stats.votes_optional_attendance, 0);
  const weeklyHoursLabel = formatWeeklyHours(stats.avg_weekly_hours);
  const totalReviews = stats.likes + stats.superlikes + stats.dislikes;

  return (
    <>
      <CourseInformation course={course} description={course.description || undefined} information />

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <div className="border border-border bg-accent rounded-md p-6">
          <div className="flex items-center gap-3 mb-3">
            <Sentiment sentiment={sentiment} size="default" />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Opinión General</h3>
              <p className="text-lg font-semibold">{getSentimentLabel(sentiment)}</p>
            </div>
          </div>
          {totalReviews > 0 && (
            <div className="text-sm text-muted-foreground">
              {positivePercentage}% positivas de {totalReviews} reseñas
            </div>
          )}
        </div>

        <div className="border border-border bg-accent rounded-md p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-light text-blue border border-blue/20 rounded-lg">
              <WorkloadIcon className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Nivel de Dificultad</h3>
              <p className="text-lg font-semibold">{workloadLabel}</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">{weeklyHoursLabel} semanales</div>
        </div>

        <div className="border border-border bg-accent rounded-md p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-light text-purple border border-purple/20 rounded-lg">
              <AttendanceIcon className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Asistencia</h3>
              <p className="text-lg font-semibold">{attendanceLabel}</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Basado en {stats.votes_mandatory_attendance + stats.votes_optional_attendance} votos
          </div>
        </div>

        <div className="border border-border bg-accent rounded-md p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-light text-green border border-green/20 rounded-lg">
              <ThumbUpIcon className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total Reseñas</h3>
              <p className="text-lg font-semibold">{totalReviews}</p>
            </div>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="text-green">{stats.likes + stats.superlikes} ↑</span>
            <span className="text-red">{stats.dislikes} ↓</span>
          </div>
        </div>
      </section>

      <PrerequisitesSection
        prerequisites={prerequisites}
        restrictions={restrictions.hasRestrictions ? restrictions : undefined}
        connector={course.parsed_meta_data.connector}
        className="mt-8"
        loading={namesLoading}
      />
      <OpensCoursesSection unlocks={unlocks} className="mt-8" loading={namesLoading} />
      <EquivCourses equivalents={equivalents} className="mt-8" loading={namesLoading} />
      <SectionsCollapsible className="mt-8" courseSigle={course.sigle} />
    </>
  );
}
