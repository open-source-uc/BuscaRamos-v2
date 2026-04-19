import { getCloudflareContext } from "@opennextjs/cloudflare";

export const R2 = () => getCloudflareContext().env.R2;
export const R2PUBLIC = () => getCloudflareContext().env.R2PUBLIC;
