"use client";

import type { CourseStaticData } from "@/lib/coursesStaticData";
import type { ParsedEquivalents } from "@/lib/courseEquiv";
import type { ParsedPrerequisites, PrerequisiteGroup } from "@/lib/courseReq";
import type { ParsedRestrictions } from "@/lib/courseRestrictions";
import { useCourseNameMap } from "@/context/courseNameMapCtx";
import PrerequisitesSection from "@/components/courses/PrerequisitesSection";
import OpensCoursesSection from "@/components/courses/OpensCoursesSections";
import EquivCourses from "@/components/courses/EquivCourses";
import SectionsCollapsible from "@/components/courses/schedules/SectionsCollapsible";

type Unlocks = {
  as_prerequisite?: string[];
  as_corequisite?: string[];
};

function getCourseName(courseNameMap: Record<string, string>, sigle: string) {
  return courseNameMap[sigle.toUpperCase()];
}

function addNamesToPrerequisites(
  group: PrerequisiteGroup,
  courseNameMap: Record<string, string>
): PrerequisiteGroup {
  return {
    ...group,
    courses: group.courses.map((course) => ({
      ...course,
      name: getCourseName(courseNameMap, course.sigle),
    })),
    groups: group.groups?.map((subgroup) => addNamesToPrerequisites(subgroup, courseNameMap)),
  };
}

function buildPrerequisites(course: CourseStaticData, courseNameMap: Record<string, string>) {
  const structure = course.parsed_meta_data.prerequisites;

  const prerequisites: ParsedPrerequisites =
    course.parsed_meta_data.has_prerequisites && structure
      ? {
          hasPrerequisites: true,
          structure: addNamesToPrerequisites(structure, courseNameMap),
        }
      : { hasPrerequisites: false };

  const restrictions: ParsedRestrictions | undefined =
    course.parsed_meta_data.has_restrictions && course.parsed_meta_data.restrictions
      ? {
          hasRestrictions: true,
          structure: course.parsed_meta_data.restrictions,
        }
      : undefined;

  return { prerequisites, restrictions };
}

function buildEquivalents(course: CourseStaticData, courseNameMap: Record<string, string>) {
  const equivalenceSigles = course.parsed_meta_data.equivalences ?? [];

  const equivalents: ParsedEquivalents =
    course.parsed_meta_data.has_equivalences && equivalenceSigles.length > 0
      ? {
          hasEquivalents: true,
          structure: {
            type: "OR",
            courses: equivalenceSigles.map((sigle) => ({
              sigle,
              name: getCourseName(courseNameMap, sigle),
            })),
          },
        }
      : { hasEquivalents: false };

  return equivalents;
}

function buildUnlocks(course: CourseStaticData, courseNameMap: Record<string, string>) {
  const unlocks = course.parsed_meta_data.unlocks as Unlocks | undefined;
  const prerequisiteSigles = unlocks?.as_prerequisite ?? [];
  const corequisiteSigles = unlocks?.as_corequisite ?? [];

  return {
    as_prerequisite: prerequisiteSigles.map((sigle) => ({
      sigle,
      name: getCourseName(courseNameMap, sigle),
    })),
    as_corequisite: corequisiteSigles.map((sigle) => ({
      sigle,
      name: getCourseName(courseNameMap, sigle),
    })),
  };
}

export default function CourseRelationsSections({ course }: { course: CourseStaticData }) {
  const { courseNameMap, loading } = useCourseNameMap();
  const { prerequisites, restrictions } = buildPrerequisites(course, courseNameMap);
  const equivalents = buildEquivalents(course, courseNameMap);
  const unlocks = buildUnlocks(course, courseNameMap);

  return (
    <>
      <PrerequisitesSection
        prerequisites={prerequisites}
        restrictions={restrictions}
        connector={course.parsed_meta_data.connector}
        className="mt-8"
        loading={loading}
      />
      <OpensCoursesSection unlocks={unlocks} className="mt-8" loading={loading} />
      <EquivCourses equivalents={equivalents} className="mt-8" loading={loading} />
      <SectionsCollapsible className="mt-8" courseSigle={course.sigle} />
    </>
  );
}
