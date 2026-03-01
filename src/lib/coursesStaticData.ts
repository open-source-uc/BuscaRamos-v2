"use server";

import { PrerequisiteGroup } from "./courseReq";
import { RestrictionGroup } from "./courseRestrictions";

const API_BASE_URL = "https://buscaramos-v2-static-data.osuc.workers.dev";

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

function convertRestrictionGroup(group: any): RestrictionGroup {
  return {
    type: group.type === "AND" ? "AND" : "OR",
    restrictions:
      group.restrictions?.map((restriction: any) => ({
        type: restriction.type || "",
        operator: restriction.operator || "",
        value: restriction.value || "",
        raw: restriction.raw || "",
      })) || [],
    groups: group.groups?.map((subGroup: any) => convertRestrictionGroup(subGroup)),
  };
}

export interface ParsedMetaData {
  has_prerequisites: boolean;
  has_restrictions: boolean;
  has_equivalences: boolean;
  unlocks_courses: boolean;
  prerequisites?: PrerequisiteGroup;
  restrictions?: RestrictionGroup;
  connector?: string;
  equivalences?: string[];
  unlocks?: Record<string, any>;
}

export interface QuotaHistoryAgg {
  total: number;
  disponibles: number;
  ocupados: number;
}

export interface QuotaHistorySection {
  agg: QuotaHistoryAgg;
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
  quota_history?: Record<string, Record<string, QuotaHistorySection>>;
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
    restrictions?: RestrictionGroup;
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
  quota_history?: Record<string, Record<string, QuotaHistorySection>>;
}

const courseDataCache = new Map<string, CourseStaticData>();

async function fetchCourseData(sigle: string, retries = 2): Promise<CourseStaticData | null> {
  if (courseDataCache.has(sigle)) {
    return courseDataCache.get(sigle)!;
  }

  const url = `${API_BASE_URL}/data/${sigle}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        if (attempt < retries && response.status >= 500) {
          console.warn(
            `Error ${response.status} fetching ${sigle}, retrying... (attempt ${attempt + 1}/${retries + 1})`
          );
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiData: APICourseData = await response.json();

      if (!apiData.sigle || !apiData.name) {
        throw new Error("Invalid API response: missing required fields");
      }

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
            ? convertRestrictionGroup(apiData.parsed_meta_data.restrictions)
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

      courseDataCache.set(sigle, courseData);
      return courseData;
    } catch (error: any) {
      if (error.name === "AbortError" && attempt < retries) {
        console.warn(
          `Timeout fetching ${sigle}, retrying... (attempt ${attempt + 1}/${retries + 1})`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }

      if ((error.message?.includes("fetch failed") || error.cause) && attempt < retries) {
        console.warn(
          `Network error fetching ${sigle}, retrying... (attempt ${attempt + 1}/${retries + 1})`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }

      const errorMessage = error.message || String(error);
      const errorDetails = error.cause ? ` (cause: ${error.cause})` : "";
      console.error(
        `Error fetching course data for ${sigle} after ${attempt + 1} attempt(s): ${errorMessage}${errorDetails}`
      );

      return null;
    }
  }

  return null;
}

export async function getCourseStaticData(sigle: string): Promise<CourseStaticData | null> {
  return fetchCourseData(sigle);
}
