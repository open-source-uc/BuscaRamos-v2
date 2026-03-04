"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type CourseNameMap = Record<string, string>;

type CourseNameMapContextValue = {
  courseNameMap: CourseNameMap;
  loading: boolean;
};

const COURSE_NAME_MAP_URL = "https://public.osuc.dev/course-name-map.json";

const CourseNameMapContext = createContext<CourseNameMapContextValue>({
  courseNameMap: {},
  loading: true,
});

export function CourseNameMapProvider({ children }: { children: ReactNode }) {
  const [courseNameMap, setCourseNameMap] = useState<CourseNameMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCourseNameMap() {
      try {
        const response = await fetch(COURSE_NAME_MAP_URL, {
          cache: "force-cache",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = (await response.json()) as Record<string, string>;
        const normalizedMap: CourseNameMap = {};

        for (const [sigle, name] of Object.entries(data)) {
          normalizedMap[sigle.toUpperCase()] = name;
        }

        setCourseNameMap(normalizedMap);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error loading course name map", error);
        }
      } finally {
        setLoading(false);
      }
    }

    loadCourseNameMap();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <CourseNameMapContext.Provider value={{ courseNameMap, loading }}>
      {children}
    </CourseNameMapContext.Provider>
  );
}

export function useCourseNameMap() {
  return useContext(CourseNameMapContext);
}
