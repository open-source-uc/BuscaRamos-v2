import { getCourseStaticData } from "@/lib/coursesStaticData";
import { Program } from "@/types/types";

export async function getProgramWithCourses(program: Program) {
  return Promise.all(
    program.semesters.map(async (semester) => ({
      ...semester,
      courses: await Promise.all(semester.courseCodes.map(getCourseStaticData)),
    }))
  );
}
