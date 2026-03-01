import { redirect } from "next/navigation"
import { ReactNode } from "react"

import { authenticateUser } from "@/lib/auth/auth"
import { hasPermission, OsucPermissions } from "@/lib/auth/permissions"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const user = await authenticateUser()

  if (!user) {
    redirect("/404")
  }

  if (!hasPermission(user, OsucPermissions.userIsRoot)) {
    redirect("/404")
  }

  return <>{children}</>
}