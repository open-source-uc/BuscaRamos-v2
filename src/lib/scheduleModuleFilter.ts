import { BLOCK_MAP } from "@/lib/scheduleMatrix";
import type { CourseSection } from "@/types/types";

export type ScheduleModuleKey = `${string}-${string}`;

export function buildScheduleModuleKey(day: string, time: string): ScheduleModuleKey {
  return `${day}-${time}`;
}

export function getScheduleModuleKeyFromBlockCode(blockCode: string): ScheduleModuleKey | null {
  const block = BLOCK_MAP[blockCode];
  if (!block) return null;
  return buildScheduleModuleKey(block.dia, block.hora);
}

export function sectionFitsScheduleModuleFilter(
  section: CourseSection | undefined,
  allowedModules: readonly string[]
): boolean {
  if (allowedModules.length === 0) return true;
  if (!section) return false;

  const scheduleBlocks = Object.keys(section.schedule || {});
  if (scheduleBlocks.length === 0) return false;

  const allowedModuleSet = new Set(allowedModules);
  return scheduleBlocks.every((blockCode) => {
    const moduleKey = getScheduleModuleKeyFromBlockCode(blockCode);
    return moduleKey !== null && allowedModuleSet.has(moduleKey);
  });
}

export function courseHasSectionWithinScheduleModules(
  sections: Record<string, CourseSection> | undefined,
  allowedModules: readonly string[]
): boolean {
  if (allowedModules.length === 0) return true;
  if (!sections) return false;

  return Object.values(sections).some((section) =>
    sectionFitsScheduleModuleFilter(section, allowedModules)
  );
}
