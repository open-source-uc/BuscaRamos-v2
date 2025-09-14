"use server";
import { CourseReview } from '@/types/types';
import { getRequestContext } from '@cloudflare/next-on-pages'

export const getCourseReviews = async (sigle: string, limit: number = 40) => {
  const s = getRequestContext()
	const result = await s.env.DB.prepare(
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
      created_at,
      updated_at,
			votes
    FROM course_reviews 
    WHERE course_sigle = ? AND status != 3
    ORDER BY votes DESC, created_at DESC
    LIMIT ?
  `
	)
		.bind(sigle, limit)
		.all<CourseReview>()

	return result.results
}