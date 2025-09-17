"use server"

import { getRequestContext } from "@cloudflare/next-on-pages"
import { parsePrerequisites, PrerequisiteGroup } from "./courseReq"
import { CourseDB } from "@/types/types"
import coursesStaticData from "./coursesStaticData"

const DB = () => getRequestContext().env.DB

export async function isCourseExisting(sigle: string) {
    const result = await DB().prepare(
    'SELECT sigle FROM course_summary WHERE sigle = ?'
    )
    .bind(sigle.toUpperCase())
    .first<{
        sigle: string
    }>()

    if (!result) return null
    
    return result
}

export async function getCourseStats(sigle: string) {
    const result = await DB().prepare(
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
        .first<CourseDB>()

    return result
} 

/**
 * Obtiene las siglas de los cursos a partir de una estructura de prerrequisitos
 * @param group Grupo de prerrequisitos
 * @returns Array de siglas de cursos
 */
function extractSiglesFromStructure(group: PrerequisiteGroup): string[] {
	const sigles: string[] = []

	if (group.courses) {
		sigles.push(...group.courses.map((course) => course.sigle))
	}

	if (group.groups) {
		for (const subGroup of group.groups) {
			sigles.push(...extractSiglesFromStructure(subGroup))
		}
	}

	return sigles
}

const getCourseNames = (sigles: string[]) => {
  const courseMap: Map<string, string> = new Map();

  sigles.forEach((sigle) => {
    courseMap.set(sigle, coursesStaticData()[sigle]?.name || sigle);
  });

  return courseMap;
}

function addNamesToStructure(
	group: PrerequisiteGroup,
	courseNames: Map<string, string>
): PrerequisiteGroup {
	const updatedGroup: PrerequisiteGroup = {
		...group,
		courses: group.courses?.map((course) => ({
			...course,
			name: courseNames.get(course.sigle),
		})),
		groups: group.groups?.map((subGroup) => addNamesToStructure(subGroup, courseNames)),
	}

	return updatedGroup
}

export const getPrerequisitesWithNames = async (req: string) => {
	const parsed = parsePrerequisites(req)

	if (!parsed.hasPrerequisites || !parsed.structure) {
		return parsed
	}

	const sigles = extractSiglesFromStructure(parsed.structure)
	const courseNames = await getCourseNames(sigles)
	const structureWithNames = addNamesToStructure(parsed.structure, courseNames)

	return {
		...parsed,
		structure: structureWithNames,
	}
}
