import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { authenticateUser } from '@/lib/auth/auth'
import { hasPermission, OsucPermissions } from '@/lib/auth/permissions'

export async function middleware(request: NextRequest) {
  const user = await authenticateUser()
  console.log('Middleware - Admin - User:', user)

  if (!user) {
    // 🔀 Redirige a la página 404
    return NextResponse.redirect(new URL('/404', request.url))
  }

  if (!hasPermission(user, OsucPermissions.userIsRoot)) {
    return NextResponse.redirect(new URL('/404', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
