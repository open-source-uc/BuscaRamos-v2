"use server"

import { CourseReview } from "@/types/types"
import { getRequestContext } from "@cloudflare/next-on-pages"

const DB = () => getRequestContext().env.DB
const R2 = () => getRequestContext().env.R2

async function simpleRandomHash() {
    const randomData = crypto.getRandomValues(new Uint8Array(32));
    const hashBuffer = await crypto.subtle.digest('SHA-256', randomData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function generateReviewPath(courseId: string) {
	const timestamp = Date.now()
    const hash = await simpleRandomHash()
	return `reviews/${courseId}/${hash}-${timestamp}.md`
}

async function uploadMarkdownToR2(markdownContent: string, filePath: string) {
	try {
		const encoder = new TextEncoder()
		const uint8Array = encoder.encode(markdownContent)

		await R2().put(filePath, uint8Array, {
			httpMetadata: {
				contentType: 'text/markdown; charset=utf-8',
				contentDisposition: `attachment; filename="${filePath.split('/').pop()}"`,
			},
			customMetadata: {
				uploadedAt: new Date().toISOString(),
				contentLength: markdownContent.length.toString(),
			},
		})

		return true
	} catch (error) {
		console.error('Error uploading markdown to R2():', error)
		return false
	}
}

export async function getReviewBySigleAndUserId(course_sigle: string, userId: string) {
    const result = await DB().prepare(
    'SELECT id, user_id, course_sigle, like_dislike, workload_vote, attendance_type, weekly_hours, year_taken, semester_taken, comment_path, status, created_at, updated_at, votes FROM course_reviews WHERE user_id = ? AND course_sigle = ?'
    )
    .bind(userId, course_sigle)
    .first<CourseReview>()
    if (!result) return null

    return result
}

export async function createCourseReview(
    review: Omit<CourseReview, 'id' | 'created_at' | 'updated_at' | 'comment_path' | 'status' | 'votes'>, 
    comment: string | null) {
    let filePath = null
    if (comment && comment.length > 0) {
        filePath = await generateReviewPath(review.course_sigle)
        const uploadSuccess = await uploadMarkdownToR2(comment, filePath)
        if (!uploadSuccess)
            return {
                message: 'Error al subir el comentario. Intenta nuevamente más tarde.',
            }
        
    }
    
    const result = await DB().prepare(
        `INSERT OR REPLACE INTO course_reviews 
        (user_id, course_sigle, like_dislike, workload_vote, attendance_type, weekly_hours, year_taken, semester_taken, comment_path) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
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
        .run()

    return result
}

export async function getCourseReviewById(reviewId: number) {
    const result = await DB().prepare(
        'SELECT id, user_id, course_sigle, like_dislike, workload_vote, attendance_type, weekly_hours, year_taken, semester_taken, comment_path, status, created_at, updated_at, votes  FROM course_reviews WHERE id = ?'
    )
    .bind(reviewId)
    .first<CourseReview>()

    if (!result) return null

    return result
}

export async function deleteCourseReview(review: CourseReview) {
    if (review.comment_path) {
        await R2().delete(review.comment_path.toString())
    }
    await DB().prepare('DELETE FROM course_reviews WHERE id = ?').bind(review.id).run()
    return true

}

export async function updateStatusReview(reviewId: number, status: number) {
    await DB().prepare('UPDATE course_reviews SET status = ? WHERE id = ?').bind(status, reviewId).run()
}

export async function likeReview(reviewId: number, userId: string) {
    const review = await getCourseReviewById(reviewId)
    if (!review) return {
        userVote: null
    }

    // verificar si el usuario ya ha votado
    const existingVote = await DB().prepare(
        'SELECT * FROM user_vote_review WHERE review_id = ? AND user_id = ?'
    )
    .bind(reviewId, userId)
    .first<{
        vote: 1 | -1
    }>()

    const newVote = 1
    let voteDifference = 0;

    if (existingVote) {
        if (existingVote.vote === newVote) {
            // Si es el mismo voto, lo eliminamos
            voteDifference = -existingVote.vote // Revertir el voto existente
            
            await DB().batch([
                DB().prepare(`
                    DELETE FROM user_vote_review 
                    WHERE user_id = ? AND review_id = ?
                `).bind(userId, reviewId),
                
                DB().prepare(`
                    UPDATE course_reviews 
                    SET votes = votes + ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).bind(voteDifference, reviewId)
            ]);
            return {
                userVote: null
            };
        } else {
            // Si es un voto diferente, calculamos la diferencia
            voteDifference = newVote - existingVote.vote
        }
    } else {
        // Si no existe voto previo
        voteDifference = newVote
    }

    // Insertar o actualizar el voto
    await DB().batch([
        DB().prepare(`
            INSERT OR REPLACE INTO user_vote_review 
            (user_id, review_id, vote) 
            VALUES (?, ?, ?)
        `).bind(userId, reviewId, newVote),
        
        DB().prepare(`
            UPDATE course_reviews 
            SET votes = votes + ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).bind(voteDifference, reviewId)
    ]);

    return {
        userVote: 1
    }
}

export async function dislikeReview(reviewId: number, userId: string) {
    const review = await getCourseReviewById(reviewId)
    if (!review) return {
        userVote: null
    }

    // verificar si el usuario ya ha votado
    const existingVote = await DB().prepare(
        'SELECT * FROM user_vote_review WHERE review_id = ? AND user_id = ?'
    )
    .bind(reviewId, userId)
    .first<{
        vote: 1 | -1
    }>()

    const newVote = -1
    let voteDifference = 0; 

    if (existingVote) {
        if (existingVote.vote === newVote) {
            // Si es el mismo voto, lo eliminamos
            voteDifference = -existingVote.vote // Revertir el voto existente
            
            await DB().batch([
                DB().prepare(`
                    DELETE FROM user_vote_review 
                    WHERE user_id = ? AND review_id = ?
                `).bind(userId, reviewId),
                
                DB().prepare(`
                    UPDATE course_reviews 
                    SET votes = votes + ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).bind(voteDifference, reviewId)
            ]);
            return {
                userVote: null
            };
        } else {
            // Si es un voto diferente, calculamos la diferencia
            voteDifference = newVote - existingVote.vote
        }
    } else {
        // Si no existe voto previo
        voteDifference = newVote
    }

    // Insertar o actualizar el voto
    await DB().batch([
        DB().prepare(`
            INSERT OR REPLACE INTO user_vote_review 
            (user_id, review_id, vote) 
            VALUES (?, ?, ?)
        `).bind(userId, reviewId, newVote),
        
        DB().prepare(`
            UPDATE course_reviews 
            SET votes = votes + ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).bind(voteDifference, reviewId)
    ]);   
    return {
        userVote: -1
    }
}

export async function getVoteOnReviewByUserId(reviewId: number, userId: string) {
    const result = await DB().prepare(
        'SELECT vote FROM user_vote_review WHERE review_id = ? AND user_id = ?'
    )
    .bind(reviewId, userId)
    .first<{
        vote: 1 | -1
    }>()

    if (!result) return null

    return result.vote
}


export async function getVotesOnReviewsInCourseByUserID(sigle: string, userId: string) {
    const result = await DB().prepare(
        'SELECT user_vote_review.review_id AS review_id, vote FROM user_vote_review, course_reviews WHERE user_vote_review.review_id = course_reviews.id AND course_reviews.course_sigle = ? AND user_vote_review.user_id = ?'
    )
    .bind(sigle, userId)
    .all<{
        review_id: number,
        vote: 1 | -1
    }>()

    if (!result) return {}

    // Transformar el resultado a Record<id_review, voto>
    return result.results.reduce((acc, item) => {
        acc[item.review_id] = item.vote
        return acc
    }, {} as Record<number, 1 | -1>)
}

export async function getUserReviews(userId: string, limit: number = 40) {
    const results = await DB().prepare(
        'SELECT id, user_id, course_sigle, like_dislike, workload_vote, attendance_type, weekly_hours, year_taken, semester_taken, comment_path, status, created_at, updated_at, votes FROM course_reviews WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
    )
    .bind(userId, limit)
    .all<CourseReview>()

    return results.results
}

export const getCourseReviews = async (sigle: string, limit: number = 40) => {
    const result = await DB().prepare(
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

export async function getReviewContent(filePath: string | null) {
    if (!filePath) return null
    try {
        const object = await R2().get(filePath)
        if (!object) {
            return null
        }
        const text = await object.text()
        return text
    } catch (error) {
        console.error('Error al obtener el archivo de R2():', error)
        return null
    }
}

export async function updateCourseReview(
  reviewId: number,
  review: Omit<CourseReview, 'id' | 'created_at' | 'updated_at' | 'comment_path' | 'status' | 'votes'>,
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
         comment_path = ?
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

  return result;
}


export async function getVoteCountByReviewId(reviewId: number) {
    const result = await DB().prepare(
        'SELECT votes as count FROM course_reviews WHERE id = ?'
    )
    .bind(reviewId)
    .first<{
        count: number
    }>()

    if (!result) return 0  
    return result.count
}