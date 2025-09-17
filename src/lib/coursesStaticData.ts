import json from "@/data/cursos-simplificado.json" assert { type: "json" };

export interface CourseStaticData {
  sigle: string;
  name: string;
  credits: number;
  req: string;
  conn: string;
  restr: string;
  equiv: string;
  school: string;
  area: string;
  categories: string[];
  format: string[];
  campus: string[];
  is_removable: boolean[];
  is_special: boolean[];
  is_english: boolean[];
  description: string;
  last_semester: string;
}

interface CourseStaticDataJSON {
  [key: string]: CourseStaticData;
}

export default function coursesStaticData(): CourseStaticDataJSON {
  return json as CourseStaticDataJSON;
}