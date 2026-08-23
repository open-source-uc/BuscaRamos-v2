import { AwsClient } from "aws4fetch";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { authenticateUser } from "@/lib/auth/auth";

const CLASSROOM_DATA_KEY = "classrooms/horarios_por_sala_2026-2.json";
const CLASSROOM_DATA_BUCKET = "v2-ramos";
const SIGNED_URL_TTL_SECONDS = 60;

export const GET = async () => {
  const user = await authenticateUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { env } = getCloudflareContext();
  const accountId = env.R2_ACCOUNT_ID ?? process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = env.R2_ACCESS_KEY_ID ?? process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY ?? process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return new Response("Classroom download signing is not configured", { status: 500 });
  }

  const client = new AwsClient({
    accessKeyId,
    secretAccessKey,
    service: "s3",
    region: "auto",
  });
  const url = new URL(
    `https://${accountId}.r2.cloudflarestorage.com/${CLASSROOM_DATA_BUCKET}/${CLASSROOM_DATA_KEY}`
  );
  url.searchParams.set("X-Amz-Expires", String(SIGNED_URL_TTL_SECONDS));
  const signedRequest = await client.sign(new Request(url, { method: "GET" }), {
    aws: { signQuery: true },
  });

  return Response.json(
    { url: signedRequest.url },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    }
  );
};
