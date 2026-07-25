import {
  Campus,
  ClassroomSchedule,
  ClassroomSchedules,
  OccupiedStatus,
  UcModule,
} from "@/types/types";
import rawClassroomData from "@/data/horario_por_sala.json";

const classroomData = rawClassroomData as unknown as ClassroomSchedules;

export async function getClassroomSchedule(
  campus: Campus,
  classroom: string
): Promise<ClassroomSchedule> {
  return await classroomData[campus][classroom];
}

export async function getFreeClassroomsPerModule(
  campus: Campus,
  module: UcModule
): Promise<string[]> {
  const classrooms = classroomData[campus];
  const freeRooms: string[] = [];

  for (const [classroom, schedule] of Object.entries(classrooms)) {
    if (schedule[module].length == 0) {
      freeRooms.push(classroom);
    }
  }

  return freeRooms;
}

export function getAllClassroomsWithCampus(): Array<{ classroom: string; campus: Campus }> {
  const classrooms: Array<{ classroom: string; campus: Campus }> = [];
  for (const [campus, rooms] of Object.entries(classroomData)) {
    for (const classroom of Object.keys(rooms)) {
      classrooms.push({ classroom, campus: campus as Campus });
    }
  }
  return classrooms;
}

export function getOccupiedStatus(
  campus: Campus,
  module: UcModule,
  classroom: string
): OccupiedStatus {
  if (!classroomData[campus][classroom]) {
    throw new Error(`Classroom ${classroom} not found in campus ${campus}`);
  }
  return {
    Status: classroomData[campus][classroom][module].length > 0,
    Courses: classroomData[campus][classroom][module],
  };
}
