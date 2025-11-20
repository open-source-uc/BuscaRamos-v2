import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { CourseDB } from '@/types/types'
import { R2PUBLIC } from '@/lib/binding'
import { getCourseStaticData } from '@/lib/coursesStaticData'
export const runtime = 'edge'

export async function createCoursesNDJSON_v1(
	courses: CourseDB[], 
): Promise<string> {
	let result = ''
	let first = true
	for (const course of courses) {
		const data = await getCourseStaticData(course.sigle)
		if(!data) continue
		if (!first) result += '\n'
		result += JSON.stringify({ ...course, ...data })
		first = false
	}

	return result
}



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
		const courses = await getCourseSummaries()
		const ndjson = await createCoursesNDJSON_v1(courses)

		await R2PUBLIC().put("courses-score.ndjson", ndjson, {
			httpMetadata: {
				contentType: 'application/x-ndjson; charset=utf-8',
			}
		})
		

		return new Response("Updated", {
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