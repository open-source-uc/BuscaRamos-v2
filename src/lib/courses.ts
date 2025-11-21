"use server";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { PrerequisiteGroup, ParsedPrerequisites } from "./courseReq";
import { ParsedEquivalents } from "./courseEquiv";
import { RestrictionGroup, ParsedRestrictions } from "./courseRestrictions";
import { CourseDB } from "@/types/types";
import { getCourseStaticData } from "./coursesStaticData";

const DB = () => getRequestContext().env.DB;

export async function isCourseExisting(sigle: string) {
  const result = await DB()
    .prepare("SELECT sigle FROM course_summary WHERE sigle = ?")
    .bind(sigle.toUpperCase())
    .first<{
      sigle: string;
    }>();

  if (!result) return null;

  return result;
}

export async function getCourseStats(sigle: string) {
  const result = await DB()
    .prepare(
      `
    SELECT 
      id,
      sigle,
      likes,
      dislikes,
      superlikes,
      votes_low_workload,
      votes_medium_workload,
      votes_high_workload,
      votes_mandatory_attendance,
      votes_optional_attendance,
      avg_weekly_hours,
      sort_index
    FROM course_summary 
    WHERE sigle = ?
  `
    )
    .bind(sigle.toUpperCase())
    .first<CourseDB>();

  return result;
}

/**
 * Obtiene las siglas de los cursos a partir de una estructura de prerrequisitos
 * @param group Grupo de prerrequisitos
 * @returns Array de siglas de cursos
 */
function extractSiglesFromStructure(group: PrerequisiteGroup): string[] {
  const sigles: string[] = [];

  if (group.courses) {
    sigles.push(...group.courses.map((course) => course.sigle));
  }

  if (group.groups) {
    for (const subGroup of group.groups) {
      sigles.push(...extractSiglesFromStructure(subGroup));
    }
  }

  return sigles;
}

const getCourseNames = async (sigles: string[]) => {
  const courseMap: Map<string, string> = new Map();

  await Promise.all(
    sigles.map(async (sigle) => {
      const course = await getCourseStaticData(sigle);
      // Si no hay nombre, usar "" para detectar que el curso no existe
      courseMap.set(sigle, course?.name || "");
    })
  );

  return courseMap;
};

function addNamesToStructure(
  group: PrerequisiteGroup,
  courseNames: Map<string, string>
): PrerequisiteGroup {
  const updatedGroup: PrerequisiteGroup = {
    ...group,
    courses: group.courses?.map((course) => ({
      ...course,
      name: courseNames.get(course.sigle),
      // Preservar isCoreq (puede venir como is_coreq de la API)
      isCoreq: course.isCoreq ?? (course as any).is_coreq ?? false,
    })),
    groups: group.groups?.map((subGroup) => addNamesToStructure(subGroup, courseNames)),
  };

  return updatedGroup;
}

/**
 * Obtiene prerrequisitos con nombres a partir de una estructura ya parseada
 */
export const getPrerequisitesWithNamesFromStructure = async (
  structure: PrerequisiteGroup | undefined
): Promise<ParsedPrerequisites> => {
  if (!structure) {
    return { hasPrerequisites: false };
  }

  const sigles = extractSiglesFromStructure(structure);
  const courseNames = await getCourseNames(sigles);
  const structureWithNames = addNamesToStructure(structure, courseNames);

  return {
    hasPrerequisites: true,
    structure: structureWithNames,
  };
};

/**
 * Obtiene restricciones parseadas a partir de una estructura de restricciones
 * Las restricciones no necesitan nombres de cursos, solo se parsean directamente
 */
export const getRestrictionsFromStructure = async (
  structure: RestrictionGroup | undefined
): Promise<ParsedRestrictions> => {
  if (!structure) {
    return { hasRestrictions: false };
  }

  return {
    hasRestrictions: true,
    structure: structure,
  };
};

/**
 * Obtiene equivalencias con nombres a partir de un array de siglas
 * Retorna la estructura ParsedEquivalents para compatibilidad con el componente EquivCourses
 */
export const getEquivalentsWithNames = async (
  equivalences: string[] | undefined
): Promise<ParsedEquivalents> => {
  if (!equivalences || equivalences.length === 0) {
    return { hasEquivalents: false };
  }

  const courseNames = await getCourseNames(equivalences);
  const coursesWithNames = equivalences.map((sigle) => ({
    sigle,
    name: courseNames.get(sigle),
  }));

  return {
    hasEquivalents: true,
    structure: {
      type: "OR",
      courses: coursesWithNames,
    },
  };
};

/**
 * Obtiene unlocks con nombres a partir de arrays de siglas
 * Retorna la estructura con objetos que contienen sigle y name
 */
export const getUnlocksWithNames = async (
  unlocks: { as_prerequisite: string[]; as_corequisite: string[] } | undefined
): Promise<{
  as_prerequisite: Array<{ sigle: string; name?: string }>;
  as_corequisite: Array<{ sigle: string; name?: string }>;
}> => {
  if (!unlocks) {
    return { as_prerequisite: [], as_corequisite: [] };
  }

  const allSigles = [...unlocks.as_prerequisite, ...unlocks.as_corequisite];
  const courseNames = await getCourseNames(allSigles);

  const prerequisitesWithNames = unlocks.as_prerequisite.map((sigle) => ({
    sigle,
    name: courseNames.get(sigle) || undefined,
  }));

  const corequisitesWithNames = unlocks.as_corequisite.map((sigle) => ({
    sigle,
    name: courseNames.get(sigle) || undefined,
  }));

  return {
    as_prerequisite: prerequisitesWithNames,
    as_corequisite: corequisitesWithNames,
  };
};
