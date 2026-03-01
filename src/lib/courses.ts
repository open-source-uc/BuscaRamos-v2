"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ParsedEquivalents } from "./courseEquiv";
import { PrerequisiteGroup, ParsedPrerequisites } from "./courseReq";
import { RestrictionGroup, ParsedRestrictions } from "./courseRestrictions";
import { getCourseStaticData } from "./coursesStaticData";
import { CourseDB } from "@/types/types";

const DB = () => getCloudflareContext().env.DB;

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
      courseMap.set(sigle, course?.name || "");
    })
  );

  return courseMap;
};

function addNamesToStructure(
  group: PrerequisiteGroup,
  courseNames: Map<string, string>
): PrerequisiteGroup {
  return {
    ...group,
    courses: group.courses?.map((course) => ({
      ...course,
      name: courseNames.get(course.sigle),
      isCoreq: course.isCoreq ?? (course as { is_coreq?: boolean }).is_coreq ?? false,
    })),
    groups: group.groups?.map((subGroup) => addNamesToStructure(subGroup, courseNames)),
  };
}

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

export const getRestrictionsFromStructure = async (
  structure: RestrictionGroup | undefined
): Promise<ParsedRestrictions> => {
  if (!structure) {
    return { hasRestrictions: false };
  }

  return {
    hasRestrictions: true,
    structure,
  };
};

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

  return {
    as_prerequisite: unlocks.as_prerequisite.map((sigle) => ({
      sigle,
      name: courseNames.get(sigle) || undefined,
    })),
    as_corequisite: unlocks.as_corequisite.map((sigle) => ({
      sigle,
      name: courseNames.get(sigle) || undefined,
    })),
  };
};
