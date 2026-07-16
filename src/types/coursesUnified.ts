/**
 * Tipos de courses-unified.json (https://public.osuc.dev/courses-unified.json),
 * generado por scripts/generate-unified-banner.py. El objeto es un mapa por
 * sigla para búsqueda O(1) una vez parseado.
 */

export interface CourseRef {
  sigle: string;
  is_coreq: boolean;
}

export interface PrerequisiteGroup {
  type: "AND" | "OR";
  courses: CourseRef[];
  groups: PrerequisiteGroup[];
}

export interface Restriction {
  type: string;
  operator: string;
  value: string;
  raw: string;
}

export interface RestrictionGroup {
  type: "AND" | "OR";
  restrictions: Restriction[];
  groups: RestrictionGroup[];
}

export interface ParsedMetaData {
  has_prerequisites: boolean;
  has_restrictions: boolean;
  has_equivalences: boolean;
  unlocks_courses: boolean;
  prerequisites?: PrerequisiteGroup;
  restrictions?: RestrictionGroup;
  equivalences?: string[];
  connector?: string;
  unlocks?: { as_prerequisite: string[]; as_corequisite: string[] };
}

export interface UnifiedCourse {
  sigle: string;
  name: string;
  credits: number;
  parsed_meta_data: ParsedMetaData;
  school: string;
  area: string[];
  categories: string[];
  format: string[];
  campus: string[];
  /** por seccion del semestre mas reciente; null = desconocido */
  is_removable: (boolean | null)[];
  is_special: (boolean | null)[];
  is_english: (boolean | null)[];
  last_semester: string;
  semesters: string[];
}

export type CoursesUnifiedMap = Record<string, UnifiedCourse>;

export const COURSES_UNIFIED_URL = "https://public.osuc.dev/courses-unified.json";
