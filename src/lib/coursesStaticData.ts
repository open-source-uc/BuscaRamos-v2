"use server";

import { cache } from "react";
import { staticDataClient } from "./static-data-api/client";
import type { paths } from "./static-data-api/types";

type APICourseData = paths["/data/{sigle}"]["get"]["responses"][200]["content"]["application/json"];
export type ParsedMetaData = APICourseData["parsed_meta_data"];
export type CourseStaticData = APICourseData;

const normalizeSigle = (sigle: string) => sigle.trim().toUpperCase();

const fetchCourseData = cache(async (sigle: string): Promise<CourseStaticData | null> => {
  const normalizedSigle = normalizeSigle(sigle);

  try {
    const { data, error, response } = await staticDataClient.GET("/data/{sigle}", {
      params: { path: { sigle: normalizedSigle } },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok || error || !data) {
      console.error(
        `Error fetching course data for ${normalizedSigle}: HTTP ${response.status} ${response.statusText}`
      );
      return null;
    }

    if (!data.sigle || !data.name) {
      console.error(`Invalid API response for ${normalizedSigle}: missing required fields`);
      return null;
    }

    return data as APICourseData;
  } catch (error) {
    console.error(`Error fetching course data for ${normalizedSigle}:`, error);
    return null;
  }
});

export async function getCourseStaticData(sigle: string): Promise<CourseStaticData | null> {
  return fetchCourseData(sigle);
}
