import {
  COURSES_UNIFIED_URL,
  type CoursesUnifiedMap,
  type UnifiedCourse,
} from "@/types/coursesUnified";

/**
 * Loader de courses-unified.json para el navegador: descarga el mapa completo
 * una sola vez por sesión (además queda en caché HTTP con ETag) y las
 * búsquedas por sigla son O(1) sobre el objeto parseado.
 */

let mapPromise: Promise<CoursesUnifiedMap> | null = null;

export function loadCoursesUnified(): Promise<CoursesUnifiedMap> {
  if (!mapPromise) {
    mapPromise = fetch(COURSES_UNIFIED_URL, { cache: "force-cache" })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error fetching courses-unified.json: HTTP ${res.status}`);
        }
        return res.json() as Promise<CoursesUnifiedMap>;
      })
      .catch((error) => {
        // No cachear fallos: el próximo llamado reintenta
        mapPromise = null;
        throw error;
      });
  }
  return mapPromise;
}

export async function getCourseStaticDataClient(sigle: string): Promise<UnifiedCourse | null> {
  try {
    const map = await loadCoursesUnified();
    return map[sigle.trim().toUpperCase()] ?? null;
  } catch (error) {
    console.error(`Error loading course data for ${sigle}:`, error);
    return null;
  }
}
