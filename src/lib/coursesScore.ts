import type { CoursesUnifiedMap } from "@/types/coursesUnified";
import type { CourseScore } from "@/types/types";

/**
 * Regenera courses-score.ndjson en R2PUBLIC cruzando course_summary (D1)
 * con courses-unified.json (leído del mismo bucket R2PUBLIC). Lo invocan
 * la ruta /api/courses (que a su vez llama el cron cada 8h) y la acción
 * manual del panel admin.
 */

type CourseSummaryRow = {
  id: number;
  sigle: string;
  superlikes: number;
  likes: number;
  dislikes: number;
  votes_low_workload: number;
  votes_medium_workload: number;
  votes_high_workload: number;
  votes_mandatory_attendance: number;
  votes_optional_attendance: number;
  avg_weekly_hours: number | null;
  sort_index: number;
};

const UNIFIED_KEY = "courses-unified.json";
const NDJSON_KEY = "courses-score.ndjson";

async function getCourseSummaries(db: D1Database): Promise<CourseSummaryRow[]> {
  const result = await db
    .prepare(
      `
      SELECT
      id,
      sigle,
      superlikes,
      likes,
      dislikes,
      votes_low_workload,
      votes_medium_workload,
      votes_high_workload,
      votes_mandatory_attendance,
      votes_optional_attendance,
      avg_weekly_hours,
      sort_index
      FROM course_summary
      ORDER BY sort_index DESC, id
    `
    )
    .all<CourseSummaryRow>();

  return result.results ?? [];
}

function createCoursesScoreNdjson(
  summaries: CourseSummaryRow[],
  staticCourses: CoursesUnifiedMap
): {
  ndjson: string;
  processed: number;
  skipped: number;
} {
  const lines: string[] = [];
  let skipped = 0;

  for (const summary of summaries) {
    const staticData = staticCourses[summary.sigle.trim().toUpperCase()];

    if (!staticData) {
      console.warn(`Course data not found for ${summary.sigle}, skipping...`);
      skipped++;
      continue;
    }

    const courseScore: CourseScore = {
      sigle: staticData.sigle,
      name: staticData.name,
      credits: staticData.credits,
      school: staticData.school,
      last_semester: staticData.last_semester,
      likes: summary.likes,
      dislikes: summary.dislikes,
      superlikes: summary.superlikes,
      votes_low_workload: summary.votes_low_workload,
      votes_medium_workload: summary.votes_medium_workload,
      votes_high_workload: summary.votes_high_workload,
      votes_mandatory_attendance: summary.votes_mandatory_attendance,
      votes_optional_attendance: summary.votes_optional_attendance,
      avg_weekly_hours: summary.avg_weekly_hours ?? 1,
      format: staticData.format,
      campus: staticData.campus,
      is_removable: staticData.is_removable,
      is_special: staticData.is_special,
      is_english: staticData.is_english,
      area: staticData.area,
      categories: staticData.categories,
    };

    lines.push(JSON.stringify(courseScore));
  }

  return { ndjson: lines.join("\n"), processed: lines.length, skipped };
}

export async function regenerateCoursesScoreNdjson(
  env: CloudflareEnv
): Promise<{ processed: number; skipped: number }> {
  const unifiedObject = await env.R2PUBLIC.get(UNIFIED_KEY);
  if (!unifiedObject) {
    throw new Error(`${UNIFIED_KEY} not found in R2PUBLIC`);
  }

  const [staticCourses, summaries] = await Promise.all([
    unifiedObject.json<CoursesUnifiedMap>(),
    getCourseSummaries(env.DB),
  ]);

  const { ndjson, processed, skipped } = createCoursesScoreNdjson(summaries, staticCourses);

  if (processed === 0) {
    throw new Error("No courses processed, aborting NDJSON upload");
  }

  await env.R2PUBLIC.put(NDJSON_KEY, ndjson, {
    httpMetadata: {
      contentType: "application/x-ndjson; charset=utf-8",
    },
  });

  console.log(`${NDJSON_KEY} regenerated: ${processed} processed, ${skipped} skipped`);
  return { processed, skipped };
}
