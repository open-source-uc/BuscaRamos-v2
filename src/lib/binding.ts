"use server"

import { getRequestContext } from "@cloudflare/next-on-pages"

export const R2 = () => getRequestContext().env.R2
export const R2PUBLIC = () => getRequestContext().env.R2PUBLIC