"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { CourseReview } from "@/types/types";

export interface LatestReviewsPage {
  reviews: CourseReview[];
  hasMore: boolean;
}

const CACHE_TTL_SECONDS = 5 * 60;

/**
 * Returns approved reviews ordered by publication date. Each page is cached in
 * Workers KV so repeated visits do not run the same D1 query for five minutes.
 */
export async function getLatestReviewsPage(
  page: number,
  limit: number
): Promise<LatestReviewsPage> {
  const { env } = getCloudflareContext();
  const offset = (page - 1) * limit;
  const cacheKey = `reviews:latest:v1:page:${page}:limit:${limit}`;
  const cachedPage = await env.KV.get<LatestReviewsPage>(cacheKey, "json");

  if (cachedPage) {
    return cachedPage;
  }

  const result = await env.DB.prepare(
    `
      SELECT
        id,
        user_id,
        course_sigle,
        like_dislike,
        workload_vote,
        attendance_type,
        weekly_hours,
        year_taken,
        semester_taken,
        comment_path,
        status,
        created_at,
        updated_at,
        votes
      FROM course_reviews
      WHERE status = 1
      ORDER BY created_at DESC, id DESC
      LIMIT ? OFFSET ?
    `
  )
    .bind(limit + 1, offset)
    .all<CourseReview>();

  const pageData: LatestReviewsPage = {
    reviews: result.results.slice(0, limit),
    hasMore: result.results.length > limit,
  };

  await env.KV.put(cacheKey, JSON.stringify(pageData), {
    expirationTtl: CACHE_TTL_SECONDS,
  });

  return pageData;
}
