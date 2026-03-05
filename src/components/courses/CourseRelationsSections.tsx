"use client";

import type { CourseStaticData } from "@/lib/coursesStaticData";
import { useCourseNameMap } from "@/context/courseNameMapCtx";
import PrerequisitesSection from "@/components/courses/PrerequisitesSection";
import OpensCoursesSection from "@/components/courses/OpensCoursesSections";
import EquivCourses from "@/components/courses/EquivCourses";
import SectionsCollapsible from "@/components/courses/schedules/SectionsCollapsible";

export default function CourseRelationsSections({ course }: { course: CourseStaticData }) {
  const { loading } = useCourseNameMap();

  return (
    <>
      <PrerequisitesSection
        prerequisites={course.parsed_meta_data.prerequisites}
        hasPrerequisites={course.parsed_meta_data.has_prerequisites}
        restrictions={course.parsed_meta_data.restrictions}
        hasRestrictions={course.parsed_meta_data.has_restrictions}
        connector={course.parsed_meta_data.connector}
        className="mt-8"
        loading={loading}
      />
      <OpensCoursesSection
        unlocks={course.parsed_meta_data.unlocks}
        className="mt-8"
        loading={loading}
      />
      <EquivCourses
        equivalences={course.parsed_meta_data.equivalences}
        hasEquivalences={course.parsed_meta_data.has_equivalences}
        className="mt-8"
        loading={loading}
      />
      <SectionsCollapsible className="mt-8" courseSigle={course.sigle} />
    </>
  );
}
