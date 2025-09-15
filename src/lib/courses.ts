"use server"

import { getRequestContext } from "@cloudflare/next-on-pages"

const DB = () => getRequestContext().env.DB

export async function isCourseExisting(sigle: string) {
    const result = await DB().prepare(
    'SELECT sigle FROM course_summary WHERE sigle = ?'
    )
    .bind(sigle.toUpperCase())
    .first<{
        sigle: string
    }>()

    if (!result) return null
    
    return result
}