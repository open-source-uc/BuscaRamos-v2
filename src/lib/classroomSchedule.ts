import {
  Campus,
  ClassroomSchedule,
  ClassroomSchedules,
  OccupiedStatus,
  UcModule,
} from "@/types/types";
import rawClassroomData from "@/data/horario_por_sala.json";

const classroomData = rawClassroomData as unknown as ClassroomSchedules;

async function getClassroomData(): Promise<ClassroomSchedules> {
  return classroomData;
}

async function getCampusData(campus: Campus) {
  const data = await getClassroomData();
  return data[campus];
}

export async function getClassroomSchedule(
  campus: Campus,
  classroom: string
): Promise<ClassroomSchedule> {
  const campusData = await getCampusData(campus);

  if (!campusData[classroom]) {
    throw new Error(`Classroom ${classroom} not found in campus ${campus}`);
  }

  return campusData[classroom];
}

export async function getFreeClassroomsPerModule(
  campus: Campus,
  module: UcModule
): Promise<string[]> {
  const campusData = await getCampusData(campus);

  const freeRooms: string[] = [];

  for (const [classroom, schedule] of Object.entries(campusData)) {
    if (schedule[module].length === 0) {
      freeRooms.push(classroom);
    }
  }

  return freeRooms;
}

export async function getAllClassroomsWithCampus(): Promise<
  Array<{ classroom: string; campus: Campus }>
> {
  const data = await getClassroomData();

  const classrooms: Array<{ classroom: string; campus: Campus }> = [];

  for (const [campus, rooms] of Object.entries(data)) {
    for (const classroom of Object.keys(rooms)) {
      classrooms.push({
        classroom,
        campus: campus as Campus,
      });
    }
  }

  return classrooms;
}

export async function getOccupiedStatus(
  campus: Campus,
  module: UcModule,
  classroom: string
): Promise<OccupiedStatus> {
  const schedule = await getClassroomSchedule(campus, classroom);

  return {
    Status: schedule[module].length > 0,
    Courses: schedule[module],
  };
}
