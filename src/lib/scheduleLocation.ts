const CLASSROOM_PLACEHOLDERS = new Set(["", "(Por Asignar)", "Por Asignar"]);

export function formatScheduleLocation(campus?: string, classroom?: string): string {
  const normalizedCampus = campus?.trim() || "";
  const normalizedClassroom = classroom?.trim() || "";
  const hasClassroom = !CLASSROOM_PLACEHOLDERS.has(normalizedClassroom);

  if (normalizedCampus && hasClassroom) {
    return `${normalizedCampus} - ${normalizedClassroom}`;
  }

  if (hasClassroom) {
    return normalizedClassroom;
  }

  if (normalizedCampus) {
    return normalizedCampus;
  }

  return "Sin ubicacion";
}
