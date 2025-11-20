import { getRequestContext } from "@cloudflare/next-on-pages";

export const R2 = () => getRequestContext().env.R2;