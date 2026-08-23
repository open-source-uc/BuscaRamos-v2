import { getCloudflareContext } from "@opennextjs/cloudflare";
import { authenticateUser } from "@/lib/auth/auth";

const CLASSROOM_DATA_KEY = "classrooms/horarios_por_sala_2026-2.json";

export const GET = async () => {
  const user = await authenticateUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { env } = getCloudflareContext();
  const object = await env.R2.get(CLASSROOM_DATA_KEY);

  if (!object) {
    return new Response("Classroom data not found", { status: 404 });
  }

  return new Response(object.body, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": object.httpMetadata?.contentType ?? "application/json",
    },
  });
};
