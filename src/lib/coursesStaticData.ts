"use server";

import {
  COURSES_UNIFIED_URL,
  type CoursesUnifiedMap,
  type UnifiedCourse,
} from "@/types/coursesUnified";

export type CourseStaticData = UnifiedCourse & { description?: string };
const CACHE_TTL_MS = 30 * 60 * 1000;

let mapPromise: Promise<CoursesUnifiedMap> | null = null;
let loadedAt = 0;

function loadCoursesUnified(): Promise<CoursesUnifiedMap> {
  if (!mapPromise || Date.now() - loadedAt > CACHE_TTL_MS) {
    loadedAt = Date.now();
    mapPromise = fetch(COURSES_UNIFIED_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error fetching courses-unified.json: HTTP ${res.status}`);
        }
        return res.json() as Promise<CoursesUnifiedMap>;
      })
      .catch((error) => {
        // No cachear fallos: el próximo request reintenta
        mapPromise = null;
        throw error;
      });
  }
  return mapPromise;
}

const normalizeSigle = (sigle: string) => sigle.trim().toUpperCase();

export async function getCourseStaticData(sigle: string): Promise<CourseStaticData | null> {
  try {
    const map = await loadCoursesUnified();
    return map[normalizeSigle(sigle)] ?? null;
  } catch (error) {
    console.error(`Error loading course data for ${sigle}:`, error);
    return null;
  }
}
