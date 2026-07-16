"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { authenticateUser } from "@/lib/auth/auth";
import { hasPermission, OsucPermissions } from "@/lib/auth/permissions";
import { regenerateCoursesScoreNdjson } from "@/lib/coursesScore";

export async function regenerateCoursesCatalog(): Promise<{
  message: string;
  success?: boolean;
}> {
  const user = await authenticateUser();

  if (!user) {
    return { message: "Debes iniciar sesión para regenerar el catálogo" };
  }

  if (!hasPermission(user, OsucPermissions.userIsRoot)) {
    return { message: "No tienes permiso para regenerar el catálogo" };
  }

  try {
    const { processed, skipped } = await regenerateCoursesScoreNdjson(getCloudflareContext().env);
    return {
      message: `Catálogo regenerado: ${processed} cursos procesados, ${skipped} omitidos`,
      success: true,
    };
  } catch (error) {
    console.error("Error regenerating courses catalog:", error);
    return { message: "Error al regenerar el catálogo" };
  }
}
