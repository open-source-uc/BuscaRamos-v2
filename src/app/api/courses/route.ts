import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import { regenerateCoursesScoreNdjson } from "@/lib/coursesScore";

export async function GET(request: NextRequest) {
  const API_SECRET = process.env.API_SECRET;

  if (!API_SECRET) {
    return NextResponse.json({ error: "Internal Server Error: API_SECRET" }, { status: 500 });
  }

  const authHeader = request.headers.get("Authorization");

  if (!authHeader || authHeader !== `Bearer ${API_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { processed, skipped } = await regenerateCoursesScoreNdjson(getCloudflareContext().env);
    return NextResponse.json({ message: "Updated", processed, skipped });
  } catch (error) {
    console.error("Error in GET handler:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
