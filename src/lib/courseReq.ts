export interface PrerequisiteCourse {
  sigle: string;
  name?: string;
  isCoreq: boolean; // true if the course has (c) suffix
}

export interface PrerequisiteGroup {
  type: "AND" | "OR";
  courses: PrerequisiteCourse[];
  groups?: PrerequisiteGroup[];
}

export interface ParsedPrerequisites {
  hasPrerequisites: boolean;
  structure?: PrerequisiteGroup;
}
