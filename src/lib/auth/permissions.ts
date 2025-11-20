import { AuthenticatedUser } from "./auth";

export enum OsucPermissions {
  userCanEditAndCreateReview = "publications@global",
  userIsRoot = "root@global",
  userCanCreateBlogs = "blogs@buscaramos",
}

export function hasPermission(user: AuthenticatedUser, permission: OsucPermissions): boolean {
  return user?.permissions?.includes(permission.valueOf()) || false;
}
