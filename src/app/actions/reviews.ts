"use server";
import { getCourseReviewById, updateStatusReview } from '@/lib/reviews';
import * as reviews from '@/lib/reviews'

export const getCourseReviews = async (sigle: string, limit: number = 40) => {
	const result = await reviews.getCourseReviews(sigle, limit)

  return result
}

export const reportCourseReview = async (reviewId: number) => {
  const review = await getCourseReviewById(reviewId);
  if (!review) {
    return {
      message: 'La reseña no existe',
    }
  }

  if (review.status === 2) {
    return {
      message: 'Reseña reportada con éxito',
    }
  }

  if (review.status === 3) {
    return {
      message: 'La reseña ya ha sido ocultada',
    }
  }

  await updateStatusReview(reviewId, 2);

  return {
    message: 'Reseña reportada con éxito',
  }
}