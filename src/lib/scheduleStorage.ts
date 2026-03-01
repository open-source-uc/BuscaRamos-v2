/**
 * Utility functions for managing user schedule storage (semester-aware)
 */

const storageKey = (semester: string) => `scheduleCourses-${semester}`;

/**
 * Get saved courses from localStorage for a given semester
 */
export function getSavedCourses(semester: string): string[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = localStorage.getItem(storageKey(semester));
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Error loading saved courses:", error);
    return [];
  }
}

/**
 * Save courses to localStorage for a given semester
 */
export function saveCourses(courses: string[], semester: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(storageKey(semester), JSON.stringify(courses));
  } catch (error) {
    console.error("Error saving courses:", error);
  }
}

/**
 * Add a course to the saved schedule for a given semester
 */
export function addCourseToSchedule(courseId: string, semester: string): boolean {
  const currentCourses = getSavedCourses(semester);

  if (currentCourses.includes(courseId)) {
    return false; // Already exists
  }

  saveCourses([...currentCourses, courseId], semester);
  return true;
}

/**
 * Remove a course from the saved schedule for a given semester
 */
export function removeCourseFromSchedule(courseId: string, semester: string): boolean {
  const currentCourses = getSavedCourses(semester);
  const updatedCourses = currentCourses.filter((id) => id !== courseId);

  if (updatedCourses.length === currentCourses.length) {
    return false; // Course wasn't in the list
  }

  saveCourses(updatedCourses, semester);
  return true;
}

/**
 * Check if a course is already in the schedule for a given semester
 */
export function isCourseInSchedule(courseId: string, semester: string): boolean {
  return getSavedCourses(semester).includes(courseId);
}

/**
 * Clear all courses from the schedule for a given semester
 */
export function clearSchedule(semester: string): void {
  saveCourses([], semester);
}

/**
 * Get the total number of courses in the schedule for a given semester
 */
export function getScheduleCount(semester: string): number {
  return getSavedCourses(semester).length;
}

/**
 * Hidden courses storage functions (not semester-aware)
 */
const HIDDEN_COURSES_STORAGE_KEY = "scheduleHiddenCourses";

/**
 * Get saved hidden courses from localStorage
 */
export function getSavedHiddenCourses(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = localStorage.getItem(HIDDEN_COURSES_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Error loading saved hidden courses:", error);
    return [];
  }
}

/**
 * Save hidden courses to localStorage
 */
export function saveHiddenCourses(hiddenCourses: string[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(HIDDEN_COURSES_STORAGE_KEY, JSON.stringify(hiddenCourses));
  } catch (error) {
    console.error("Error saving hidden courses:", error);
  }
}

/**
 * Add a course to the hidden courses list
 */
export function addHiddenCourse(courseKey: string): boolean {
  const currentHidden = getSavedHiddenCourses();

  if (currentHidden.includes(courseKey)) {
    return false; // Already hidden
  }

  saveHiddenCourses([...currentHidden, courseKey]);
  return true;
}

/**
 * Remove a course from the hidden courses list
 */
export function removeHiddenCourse(courseKey: string): boolean {
  const currentHidden = getSavedHiddenCourses();
  const updatedHidden = currentHidden.filter((key) => key !== courseKey);

  if (updatedHidden.length === currentHidden.length) {
    return false; // Course wasn't in the list
  }

  saveHiddenCourses(updatedHidden);
  return true;
}

/**
 * Check if a course is hidden
 */
export function isCourseHidden(courseKey: string): boolean {
  return getSavedHiddenCourses().includes(courseKey);
}

/**
 * Clear all hidden courses
 */
export function clearHiddenCourses(): void {
  saveHiddenCourses([]);
}
