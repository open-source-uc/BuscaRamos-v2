import type { CourseScore } from "@/types/types";

export type CourseScoreFilters = {
  selectedArea: string;
  selectedSchool: string;
  selectedCampus: string;
  selectedFormat: string;
  selectedSemester: string;
  selectedCategory: string;
  showRetirableOnly: boolean;
  showEnglishOnly: boolean;
};

export function applyCourseScoreFilters(
  courses: CourseScore[],
  {
    selectedArea,
    selectedSchool,
    selectedCampus,
    selectedFormat,
    selectedSemester,
    selectedCategory,
    showRetirableOnly,
    showEnglishOnly,
  }: CourseScoreFilters
): CourseScore[] {
  let filtered = courses;

  if (selectedArea === "formacion-general") {
    filtered = filtered.filter(
      (course) =>
        Array.isArray(course.area) &&
        course.area.length > 0 &&
        course.area.some((area) => area.trim() !== "" && area !== "Ninguna")
    );
  } else if (selectedArea !== "all") {
    filtered = filtered.filter(
      (course) => Array.isArray(course.area) && course.area.includes(selectedArea)
    );
  }

  if (selectedCampus !== "all") {
    filtered = filtered.filter((course) => {
      const campusArray = course.campus || [];
      return campusArray.includes(selectedCampus);
    });
  }

  if (selectedSchool !== "all") {
    filtered = filtered.filter((course) => course.school === selectedSchool);
  }

  if (selectedFormat !== "all") {
    filtered = filtered.filter((course) => {
      if (Array.isArray(course.format)) {
        return course.format.includes(selectedFormat);
      }
      return course.format === selectedFormat;
    });
  }

  if (showRetirableOnly) {
    filtered = filtered.filter((course) => {
      const removableArray = course.is_removable || [];
      return removableArray.some((removable) => removable === true);
    });
  }

  if (showEnglishOnly) {
    filtered = filtered.filter((course) => {
      const englishArray = course.is_english || [];
      return Array.isArray(englishArray) && englishArray.some((isEnglish) => isEnglish === true);
    });
  }

  if (selectedSemester !== "all") {
    filtered = filtered.filter((course) => course.last_semester === selectedSemester);
  }

  if (selectedCategory !== "all") {
    filtered = filtered.filter((course) => {
      if (Array.isArray(course.categories)) {
        return course.categories.includes(selectedCategory);
      }
      return false;
    });
  }

  return filtered;
}
