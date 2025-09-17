import { NextRequest, NextResponse } from 'next/server'
import CourseStaticInfo, { CourseStaticData } from '@/lib/CoursesData'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { CourseDB } from '@/types/types'
export const runtime = 'edge'

export async function GET(request: NextRequest) {
	const API_SECRET = process.env.API_SECRET
	
	if (!API_SECRET) {
		return NextResponse.json(
			{ error: 'Internal Server Error: API_SECRET' },
			{ status: 500 }
		)
	}

	const authHeader = request.headers.get('Authorization')

	if (!authHeader || authHeader !== `Bearer ${API_SECRET}`) {
		return NextResponse.json(
			{ error: 'Unauthorized' },
			{ status: 401 }
		)
	}

	try {
		// Necesitarás adaptar esto a tu configuración de base de datos
		// Ejemplo usando tu ORM/cliente de DB preferido
		const result = await getCourseSummaries() // Implementa esta función

		async function* generateCourses() {
			for (const course of result) {
				// Reemplaza getEntry con tu método para obtener datos estáticos
				const courseData =  CourseStaticInfo[course.sigle] 
				
				if (!courseData) {
					continue
				}

				const staticInfo: CourseDB & CourseStaticData = {
                    ...course,
                    ...courseData   
                }

				yield JSON.stringify(staticInfo) + '\n'
			}
		}

		const encoder = new TextEncoder()
		
		const stream = new ReadableStream({
			async start(controller) {
				try {
					for await (const line of generateCourses()) {
						controller.enqueue(encoder.encode(line))
					}
					controller.close()
				} catch (error) {
					console.error('Error in stream:', error)
					controller.error(error)
				}
			},
		})

		return new Response(stream, {
			status: 200,
			headers: {
				'Content-Type': 'application/x-ndjson; charset=utf-8',
			},
		})
	} catch (error) {
		console.error('Error in GET handler:', error)
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}

// Funciones auxiliares que necesitarás implementar según tu setup
async function getCourseSummaries(): Promise<CourseDB[]> {
	const DB = getRequestContext().env.DB
    const result = await DB.prepare(
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
        FROM course_summary ORDER BY sort_index DESC, id
    `
    ).all<CourseDB>()

    return result.results
}
