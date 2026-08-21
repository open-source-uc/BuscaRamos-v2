import { Program, Semester } from "@/types/types";

interface RawProgram {
  id: string;
  name: string;
  school: string;
  level: string;
  campus: string;
  semesters: {
    number: number;
    courseCodes: string[];
  }[];
}

export function parseProgram(raw: RawProgram): Program {
  return {
    id: raw.id,
    name: raw.name,
    school: raw.school,
    level: raw.level,
    campus: raw.campus,
    semesters: raw.semesters.map(parseSemester),
  };
}

function parseSemester(raw: RawProgram["semesters"][number]): Semester {
  return {
    number: raw.number,
    courseCodes: [...raw.courseCodes],
  };
}
