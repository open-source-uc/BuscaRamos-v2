"use server";

import { PrerequisiteGroup, PrerequisiteCourse } from "./courseReq";

const API_BASE_URL = "https://buscaramos-v2-static-data.osuc.workers.dev";

/**
 * Convierte un PrerequisiteGroup de la API (con is_coreq) al formato esperado (con isCoreq)
 */
function convertPrerequisiteGroup(group: any): PrerequisiteGroup {
  return {
    type: group.type,
    courses: group.courses?.map((course: any) => ({
      sigle: course.sigle,
      isCoreq: course.is_coreq ?? course.isCoreq ?? false,
    })),
    groups: group.groups?.map((subGroup: any) => convertPrerequisiteGroup(subGroup)),
  };
}

export interface ParsedMetaData {
  has_prerequisites: boolean;
  has_restrictions: boolean;
  has_equivalences: boolean;
  unlocks_courses: boolean;
  prerequisites?: PrerequisiteGroup;
  restrictions?: PrerequisiteGroup;
  connector?: string;
  equivalences?: string[];
  unlocks?: Record<string, any>;
}

export interface QuotaHistoryEntry {
  semester: string;
  agg: {
    total: number;
    disponibles: number;
    ocupados: number;
  };
}

export interface CourseStaticData {
  sigle: string;
  name: string;
  credits: number;
  parsed_meta_data: ParsedMetaData;
  school: string;
  area: string[];
  categories: string[];
  format: string[];
  campus: string[];
  is_removable: boolean[];
  is_special: boolean[];
  is_english: boolean[];
  description: string;
  last_semester: string;
  quota_history?: Record<string, QuotaHistoryEntry>;
}

interface APICourseData {
  sigle: string;
  name: string;
  credits: number;
  parsed_meta_data: {
    has_prerequisites: boolean;
    has_restrictions: boolean;
    has_equivalences: boolean;
    unlocks_courses: boolean;
    prerequisites?: PrerequisiteGroup;
    restrictions?: PrerequisiteGroup;
    connector?: string;
    equivalences?: string[];
    unlocks?: Record<string, any>;
  };
  school: string;
  area: string[];
  categories: string[];
  format: string[];
  campus: string[];
  is_removable: boolean[];
  is_special: boolean[];
  is_english: boolean[];
  description: string;
  last_semester: string;
  quota_history?: Record<string, QuotaHistoryEntry>;
}

// Cache para almacenar datos de cursos
const courseDataCache = new Map<string, CourseStaticData>();

/**
 * Obtiene los datos estáticos de un curso desde la API con timeout y retry
 */
async function fetchCourseData(sigle: string, retries = 2): Promise<CourseStaticData | null> {
  // Verificar cache
  if (courseDataCache.has(sigle)) {
    return courseDataCache.get(sigle)!;
  }

  const url = `${API_BASE_URL}/data/${sigle}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Crear un AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          // Curso no encontrado, no es un error
          return null;
        }
        // Para otros errores HTTP, intentar retry si quedan intentos
        if (attempt < retries && response.status >= 500) {
          console.warn(
            `Error ${response.status} fetching ${sigle}, retrying... (attempt ${attempt + 1}/${retries + 1})`
          );
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1))); // Backoff exponencial
          continue;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiData: APICourseData = await response.json();

      // Validar que los datos sean válidos
      if (!apiData.sigle || !apiData.name) {
        throw new Error("Invalid API response: missing required fields");
      }

      // Mapear datos de la API, convirtiendo is_coreq a isCoreq en prerequisites y restrictions
      const courseData: CourseStaticData = {
        sigle: apiData.sigle,
        name: apiData.name,
        credits: apiData.credits,
        parsed_meta_data: {
          has_prerequisites: apiData.parsed_meta_data.has_prerequisites,
          has_restrictions: apiData.parsed_meta_data.has_restrictions,
          has_equivalences: apiData.parsed_meta_data.has_equivalences,
          unlocks_courses: apiData.parsed_meta_data.unlocks_courses,
          prerequisites: apiData.parsed_meta_data.prerequisites
            ? convertPrerequisiteGroup(apiData.parsed_meta_data.prerequisites)
            : undefined,
          restrictions: apiData.parsed_meta_data.restrictions
            ? convertPrerequisiteGroup(apiData.parsed_meta_data.restrictions)
            : undefined,
          connector: apiData.parsed_meta_data.connector,
          equivalences: apiData.parsed_meta_data.equivalences,
          unlocks: apiData.parsed_meta_data.unlocks,
        },
        school: apiData.school,
        area: apiData.area || [],
        categories: apiData.categories || [],
        format: apiData.format || [],
        campus: apiData.campus || [],
        is_removable: apiData.is_removable || [],
        is_special: apiData.is_special || [],
        is_english: apiData.is_english || [],
        description: apiData.description || "",
        last_semester: apiData.last_semester,
        quota_history: apiData.quota_history,
      };

      // Guardar en cache solo si fue exitoso
      courseDataCache.set(sigle, courseData);
      return courseData;
    } catch (error: any) {
      // Si es un abort (timeout), intentar retry
      if (error.name === "AbortError" && attempt < retries) {
        console.warn(
          `Timeout fetching ${sigle}, retrying... (attempt ${attempt + 1}/${retries + 1})`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }

      // Si es un error de red y quedan intentos, retry
      if ((error.message?.includes("fetch failed") || error.cause) && attempt < retries) {
        console.warn(
          `Network error fetching ${sigle}, retrying... (attempt ${attempt + 1}/${retries + 1})`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }

      // Último intento falló o no hay más intentos
      const errorMessage = error.message || String(error);
      const errorDetails = error.cause ? ` (cause: ${error.cause})` : "";
      console.error(
        `Error fetching course data for ${sigle} after ${attempt + 1} attempt(s): ${errorMessage}${errorDetails}`
      );

      // No cachear errores para permitir reintentos en el futuro
      return null;
    }
  }

  return null;
}

/**
 * Obtiene los datos estáticos de un curso específico
 */
export async function getCourseStaticData(sigle: string): Promise<CourseStaticData | null> {
  return await fetchCourseData(sigle);
}
