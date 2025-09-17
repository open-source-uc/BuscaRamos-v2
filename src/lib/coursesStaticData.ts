import json1 from "@/../data/cursos-simplificado.json" assert { type: "json" };
import json2 from "@/../data/cursos-descripciones.json" assert { type: "json" };

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
  last_semester: string;
}


interface CourseStaticDataJSON {
  [key: string]: CourseStaticData;
}

export const coursesStaticData = () => {
  return json1 as CourseStaticDataJSON;
}

export const courseDescriptions = () => {
  return json2 as { [key: string]: string };
}