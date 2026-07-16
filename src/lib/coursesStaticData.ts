"use server";

import { coursesUnified, type UnifiedCourse, type ParsedMetaData } from "./courses-unified";

export type { ParsedMetaData };
export type CourseStaticData = UnifiedCourse & { description?: string };

const normalizeSigle = (sigle: string) => sigle.trim().toUpperCase();

export async function getCourseStaticData(sigle: string): Promise<CourseStaticData | null> {
  return coursesUnified[normalizeSigle(sigle)] ?? null;
}
