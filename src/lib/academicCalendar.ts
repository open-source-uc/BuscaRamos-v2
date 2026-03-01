/**
 * Utilidades para manejar el calendario académico usando configuración JSON
 */
import { CURRENT_SEMESTER } from "@/lib/currentSemester";
import type { semester } from "@/lib/icsHorario";
import { academicCalendar } from "@/lib/schedule/academicCalendar";

const stringToIcs = (dateString: string): [number, number, number] => {
  const [year, month, day] = dateString.split("-");
  return [parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10)];
};

type AcademicCalendar = typeof academicCalendar;
type AcademicSemesterKey = keyof AcademicCalendar;
type AcademicSemester = AcademicCalendar[AcademicSemesterKey];
type AcademicExcludedDate = AcademicSemester["excludedDates"][number];

const isAcademicSemesterKey = (semesterKey: string): semesterKey is AcademicSemesterKey =>
  semesterKey in academicCalendar;

if (!isAcademicSemesterKey(CURRENT_SEMESTER)) {
  throw new Error(`Missing academic calendar configuration for semester ${CURRENT_SEMESTER}`);
}

const semesterKey = CURRENT_SEMESTER;
const semesterConfig = academicCalendar[semesterKey];

const SEMESTER_START = new Date(...stringToIcs(semesterConfig.semesterStart));
const SEMESTER_END = new Date(...stringToIcs(semesterConfig.semesterEnd));

const EXCLUDED_DATES = semesterConfig.excludedDates.map(
  ({ date }: AcademicExcludedDate) => new Date(...stringToIcs(date))
);

export const ACTUAL_SEMESTER: semester = {
  name: semesterKey,
  start: SEMESTER_START,
  end: SEMESTER_END,
  excludedDates: EXCLUDED_DATES,
};
