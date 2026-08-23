import type {
  Campus,
  ClassroomSchedule,
  ClassroomSchedules,
  OccupiedStatus,
  UcModule,
} from "@/types/types";

const CLASSROOM_DATA_URL = "/api/classrooms";
let classroomDataPromise: Promise<ClassroomSchedules> | null = null;

type ClassroomDownloadResponse = {
  url: string;
};

function getClassroomData(): Promise<ClassroomSchedules> {
  classroomDataPromise ??= fetch(CLASSROOM_DATA_URL, { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to get classroom download URL: HTTP ${response.status}`);
      }

      return (await response.json()) as ClassroomDownloadResponse;
    })
    .then(async ({ url }) => {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Failed to download classroom data: HTTP ${response.status}`);
      }

      return (await response.json()) as ClassroomSchedules;
    })
    .catch((error) => {
      classroomDataPromise = null;
      throw error;
    });

  return classroomDataPromise;
}

async function getCampusData(campus: Campus) {
  const data = await getClassroomData();
  const campusData = data[campus];
  if (!campusData) {
    throw new Error(`Campus ${campus} not found in classroom data`);
  }

  return campusData;
}

export async function getAvailableCampuses(): Promise<Campus[]> {
  const data = await getClassroomData();
  return Object.keys(data) as Campus[];
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
    if ((schedule[module]?.length ?? 0) === 0) {
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
    Status: (schedule[module]?.length ?? 0) > 0,
    Courses: schedule[module] ?? [],
  };
}
