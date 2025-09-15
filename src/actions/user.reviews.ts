"use server"

import { authenticateUser} from "@/lib/auth/auth"
import { hasPermission, OsucPermissions } from "@/lib/auth/permissions"
import { isCourseExisting } from "@/lib/courses"
import { isFutureSemester } from "@/lib/currentSemester"
import * as reviews from "@/lib/reviews"
import { getRequestContext } from "@cloudflare/next-on-pages"
import z from "zod"

const R2 = getRequestContext().env.R2

const courseReviewSchema = z.object({
	course_sigle: z
		.string()
		.min(1, 'La sigla del curso es requerida')
		.max(20, 'La sigla del curso no puede exceder 20 caracteres'),

	like_dislike: z
		.number()
		.int('El voto debe ser un número entero')
		.min(0, 'El voto debe ser 0 (dislike), 1 (like) o 2 (superlike)')
		.max(2, 'El voto debe ser 0 (dislike), 1 (like) o 2 (superlike)'),

	workload_vote: z
		.number()
		.int('El voto de carga debe ser un número entero')
		.min(0, 'El voto debe ser 0 (bajo), 1 (medio) o 2 (alto)')
		.max(2, 'El voto debe ser 0 (bajo), 1 (medio) o 2 (alto)'),

	attendance_type: z
		.number()
		.int('El tipo de asistencia debe ser un número entero')
		.min(0, 'El tipo debe ser 0 (obligatoria) o 1 (opcional)')
		.max(1, 'El tipo debe ser 0 (obligatoria) o 1 (opcional)'),

	weekly_hours: z
		.number()
		.int('Las horas semanales deben ser un número entero')
		.min(0, 'Las horas semanales no pueden ser negativas')
		.max(168, 'No puede haber más de 168 horas en una semana'),

	year_taken: z.number().int('El año debe ser un número entero'),

	semester_taken: z
		.number()
		.int('El semestre debe ser un número entero')
		.min(1, 'El semestre debe ser 1, 2 o 3')
		.max(3, 'El semestre debe ser 1, 2 o 3'),

	comment: z.string().max(10000, 'El comentario no puede exceder 10,000 caracteres').optional(),
})

export const createCourseReview = async (formData: FormData) => {
    const min_year = new Date().getFullYear() - 6
    const max_year = new Date().getFullYear()

    const validate = courseReviewSchema.safeParse({
        course_sigle: formData.get('course_sigle'),
        like_dislike: Number(formData.get('like_dislike')),
        workload_vote: Number(formData.get('workload_vote')),
        attendance_type: Number(formData.get('attendance_type')),
        weekly_hours: Number(formData.get('weekly_hours')),
        year_taken: Number(formData.get('year_taken')),
        semester_taken: Number(formData.get('semester_taken')),
        comment: formData.get('comment')?.toString() || undefined,
    })

    if (validate.error) {
        return {
            message: validate.error.message,
        }
    }

    const data = validate.data
    if (data.year_taken < min_year || data.year_taken > max_year) 
       return {
            message: `El año debe estar entre ${min_year} y ${max_year}`,
        }
    
    if (isFutureSemester(data.year_taken, data.semester_taken))
        return {
            message: 'No puedes reseñar un curso en un semestre futuro',
        }
    const user = await authenticateUser()
    if (!user)
        return {
            message: 'Debes iniciar sesión para reseñar un curso',
        }
    
    if (!hasPermission(user, OsucPermissions.userCanEditAndCreateReview))
        return {
            message: 'No tienes permiso para reseñar cursos o editar reseñas',
        }
    
    const course = await isCourseExisting(data.course_sigle)

    if (!course) {
        return {
            message: 'El curso no existe',
        }
    }
    const review = await reviews.getReviewBySigleAndUserId(course.sigle, user.userId)
    if (review && review.comment_path) {
        await R2.delete(review.comment_path.toString())
        await reviews.deleteCourseReview(review.id)
    }

    await reviews.createCourseReview({
        user_id: user.userId,
        course_sigle: course.sigle,
        like_dislike: data.like_dislike,
        workload_vote: data.workload_vote,
        attendance_type: data.attendance_type,
        weekly_hours: data.weekly_hours,
        year_taken: data.year_taken,
        semester_taken: data.semester_taken,
    }, data.comment?.trim() || null)
    
    return {
        message: review ? 'Reseña actualizada con éxito' : 'Reseña creada con éxito',
    }
    
}

export const deleteCourseReview = async (reviewId: number) => {
    const user = await authenticateUser()
    if (!user)
        return {
            message: 'Debes iniciar sesión para eliminar una reseña',
        }
    
    const review = await reviews.getCourseReviewById(reviewId)
    if (!review) {
        return {
            message: 'La reseña no existe',
        }
    }

    if (review.user_id !== user.userId) {
        return {
            message: 'La reseña no te pertenece',
        }
    }

    if (!review) {
        return {
            message: 'La reseña no existe o no te pertenece',
        }
    }

    await reviews.deleteCourseReview(review.id)

    return {
        message: 'Reseña eliminada con éxito',
    }
}

export const interactWithCourseReview = async (action: 'up' | 'down', reviewId: number) => {

    const user = await authenticateUser()
    if (!user) {
        return {
            message: 'Debes iniciar sesión para votar una reseña',
        }
    }

    if (action == 'up') {
        await reviews.likeReview(reviewId, user.userId)
        return {
            message: 'Reseña votada positivamente',
        }
    }
    
    if (action == 'down') {
        await reviews.dislikeReview(reviewId, user.userId)
        return {
            message: 'Reseña votada negativamente',
        }
    }

    return {
        message: 'Acción no válida',
    }

}

export const getVoteCourseReview = async (reviewId: number) => {

    const user = await authenticateUser()
    if (!user) {
        return {
            message: 'Debes iniciar sesión para ver tu voto en una reseña',
        }
    }

    const vote = await reviews.getVoteReviewByUser(reviewId, user.userId)

    return {
        vote: vote,
    }

}

export const getUserReviews = async (limit: number = 40) => {
    const user = await authenticateUser()
    if (!user) {
        return {
            message: 'Debes iniciar sesión para ver tus reseñas',
        }
    }

    const result = await reviews.getUserReviews(user.userId, limit)

    return {
        reviews: result,
    }
}