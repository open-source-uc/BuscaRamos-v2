"use server";

import { CourseReview } from "@/types/types";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const DB = () => getCloudflareContext().env.DB;
const R2 = () => getCloudflareContext().env.R2;

async function simpleRandomHash() {
  const randomData = crypto.getRandomValues(new Uint8Array(32));
  const hashBuffer = await crypto.subtle.digest("SHA-256", randomData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function generateReviewPath(courseId: string) {
  const timestamp = Date.now();
  const hash = await simpleRandomHash();
  return `reviews/${courseId}/${hash}-${timestamp}.md`;
}

async function uploadMarkdownToR2(markdownContent: string, filePath: string) {
  try {
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(markdownContent);

    await R2().put(filePath, uint8Array, {
      httpMetadata: {
        contentType: "text/markdown; charset=utf-8",
        contentDisposition: `attachment; filename="${filePath.split("/").pop()}"`,
      },
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        contentLength: markdownContent.length.toString(),
      },
    });

    return true;
  } catch (error) {
    console.error("Error uploading markdown to R2():", error);
    return false;
  }
}

export async function getReviewBySigleAndUserId(course_sigle: string, userId: string) {
  const result = await DB()
    .prepare(
      "SELECT id, user_id, course_sigle, like_dislike, workload_vote, attendance_type, weekly_hours, year_taken, semester_taken, comment_path, status, created_at, updated_at, votes FROM course_reviews WHERE user_id = ? AND course_sigle = ?"
    )
    .bind(userId, course_sigle)
    .first<CourseReview>();
  if (!result) return null;

  return result;
}

export async function createCourseReview(
  review: Omit<
    CourseReview,
    "id" | "created_at" | "updated_at" | "comment_path" | "status" | "votes"
  >,
  comment: string | null
) {
  let filePath = null;
  if (comment && comment.length > 0) {
    filePath = await generateReviewPath(review.course_sigle);
    const uploadSuccess = await uploadMarkdownToR2(comment, filePath);
    if (!uploadSuccess)
      return {
        message: "Error al subir el comentario. Intenta nuevamente más tarde.",
      };
  }

  const result = await DB()
    .prepare(
      `INSERT INTO course_reviews 
        (user_id, course_sigle, like_dislike, workload_vote, attendance_type, weekly_hours, year_taken, semester_taken, comment_path) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      review.user_id,
      review.course_sigle.toUpperCase(),
      review.like_dislike,
      review.workload_vote,
      review.attendance_type,
      review.weekly_hours,
      review.year_taken,
      review.semester_taken,
      filePath
    )
    .run();
  console.info("Created review with ID:", result.meta);
  return result;
}

export async function getCourseReviewById(reviewId: number) {
  const result = await DB()
    .prepare(
      "SELECT id, user_id, course_sigle, like_dislike, workload_vote, attendance_type, weekly_hours, year_taken, semester_taken, comment_path, status, created_at, updated_at, votes  FROM course_reviews WHERE id = ?"
    )
    .bind(reviewId)
    .first<CourseReview>();

  if (!result) return null;

  return result;
}

export async function deleteCourseReview(review: CourseReview) {
  if (review.comment_path) {
    await R2().delete(review.comment_path.toString());
  }
  await DB().prepare("DELETE FROM user_vote_review WHERE review_id = ?").bind(review.id).run();
  await DB().prepare("DELETE FROM course_reviews WHERE id = ?").bind(review.id).run();
  return true;
}

export async function updateStatusReview(reviewId: number, status: number) {
  await DB()
    .prepare("UPDATE course_reviews SET status = ? WHERE id = ?")
    .bind(status, reviewId)
    .run();
}

async function handleVote(reviewId: number, userId: string, newVote: 1 | -1) {
  const existing = await DB()
    .prepare("SELECT * FROM user_vote_review WHERE review_id = ? AND user_id = ?")
    .bind(reviewId, userId)
    .first<{ vote: number }>();

  let voteDiff: number = newVote;
  const queries = [];

  if (existing) {
    if (existing.vote === newVote) {
      voteDiff = -newVote;
      queries.push(
        DB()
          .prepare("DELETE FROM user_vote_review WHERE user_id = ? AND review_id = ?")
          .bind(userId, reviewId)
      );
    } else {
      voteDiff = newVote * 2;
      queries.push(
        DB()
          .prepare("UPDATE user_vote_review SET vote = ? WHERE user_id = ? AND review_id = ?")
          .bind(newVote, userId, reviewId)
      );
    }
  } else {
    queries.push(
      DB()
        .prepare("INSERT INTO user_vote_review (user_id, review_id, vote) VALUES (?, ?, ?)")
        .bind(userId, reviewId, newVote)
    );
  }

  queries.push(
    DB()
      .prepare(
        "UPDATE course_reviews SET votes = votes + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      )
      .bind(voteDiff, reviewId)
  );
  await DB().batch(queries);

  return { userVote: existing?.vote === newVote ? null : newVote };
}

export const likeReview = async (reviewId: number, userId: string) =>
  handleVote(reviewId, userId, 1);
export const dislikeReview = async (reviewId: number, userId: string) =>
  handleVote(reviewId, userId, -1);

export async function getVoteOnReviewByUserId(reviewId: number, userId: string) {
  const result = await DB()
    .prepare("SELECT vote FROM user_vote_review WHERE review_id = ? AND user_id = ?")
    .bind(reviewId, userId)
    .first<{
      vote: 1 | -1;
    }>();

  if (!result) return null;

  return result.vote;
}

export async function getVotesOnReviewsInCourseByUserID(sigle: string, userId: string) {
  const result = await DB()
    .prepare(
      "SELECT user_vote_review.review_id AS review_id, vote FROM user_vote_review, course_reviews WHERE user_vote_review.review_id = course_reviews.id AND course_reviews.course_sigle = ? AND user_vote_review.user_id = ?"
    )
    .bind(sigle, userId)
    .all<{
      review_id: number;
      vote: 1 | -1;
    }>();

  if (!result) return {};

  // Transformar el resultado a Record<id_review, voto>
  return result.results.reduce(
    (acc, item) => {
      acc[item.review_id] = item.vote;
      return acc;
    },
    {} as Record<number, 1 | -1>
  );
}

export async function getUserReviews(userId: string, limit: number = 40) {
  const results = await DB()
    .prepare(
      "SELECT id, user_id, course_sigle, like_dislike, workload_vote, attendance_type, weekly_hours, year_taken, semester_taken, comment_path, status, created_at, updated_at, votes FROM course_reviews WHERE user_id = ? ORDER BY created_at DESC LIMIT ?"
    )
    .bind(userId, limit)
    .all<CourseReview>();

  return results.results;
}

export const getCourseReviews = async (sigle: string, limit: number = 40) => {
  const result = await DB()
    .prepare(
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
    .all<CourseReview>();

  return result.results;
};

export async function getReviewContent(filePath: string | null) {
  if (!filePath) return null;
  try {
    const object = await R2().get(filePath);
    if (!object) {
      return null;
    }
    const text = await object.text();
    return text;
  } catch (error) {
    console.error("Error al obtener el archivo de R2():", error);
    return null;
  }
}

export async function updateCourseReview(
  reviewId: number,
  review: Omit<
    CourseReview,
    "id" | "created_at" | "updated_at" | "comment_path" | "status" | "votes"
  >,
  comment: string | null
) {
  let filePath: string | null = null;

  if (comment && comment.length > 0) {
    filePath = await generateReviewPath(review.course_sigle);
    const uploadSuccess = await uploadMarkdownToR2(comment, filePath);
    if (!uploadSuccess) {
      return {
        message: "Error al subir el comentario. Intenta nuevamente más tarde.",
      };
    }
  }

  const result = await DB()
    .prepare(
      `UPDATE course_reviews
        SET 
        course_sigle = ?,
        like_dislike = ?,
        workload_vote = ?,
        attendance_type = ?,
        weekly_hours = ?,
        year_taken = ?,
        semester_taken = ?,
        comment_path = ?,
        updated_at = CURRENT_TIMESTAMP,
        status = CASE 
            WHEN status = 1 THEN 0  -- Si estaba aprobado, vuelve a pending
            ELSE status             -- Mantiene el status actual
        END
    WHERE id = ?`
    )
    .bind(
      review.course_sigle.toUpperCase(),
      review.like_dislike,
      review.workload_vote,
      review.attendance_type,
      review.weekly_hours,
      review.year_taken,
      review.semester_taken,
      filePath, // si es null, lo pone en NULL en la DB
      reviewId
    )
    .run();

  console.log("Updated review with ID:", reviewId, result.meta);

  return result;
}

export async function getVoteCountByReviewId(reviewId: number) {
  const result = await DB()
    .prepare("SELECT votes as count FROM course_reviews WHERE id = ?")
    .bind(reviewId)
    .first<{
      count: number;
    }>();

  if (!result) return 0;
  return result.count;
}

export async function getReviewsByStatus(status: 0 | 1 | 2 | 3, limit: number = 40) {
  const result = await DB()
    .prepare(
      "SELECT id, user_id, course_sigle, like_dislike, workload_vote, attendance_type, weekly_hours, year_taken, semester_taken, comment_path, status, created_at, updated_at, votes FROM course_reviews WHERE status = ? ORDER BY created_at DESC LIMIT ?"
    )
    .bind(status, limit)
    .all<CourseReview>();

  return result.results;
}

export async function changeStatusReview(status: 0 | 1 | 2 | 3, reviewId: number) {
  await DB()
    .prepare(
      `
        UPDATE course_reviews
        SET status = ?
        WHERE id = ?
    `
    )
    .bind(status, reviewId)
    .run();
}
