import { authenticateUser } from "@/lib/auth/auth";
import { getCourseReviewsPage } from "@/lib/reviews";
import { NextResponse, type NextRequest } from "next/server";

const REVIEWS_PER_PAGE = 10;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sigle: string }> }
) {
  const { sigle: rawSigle } = await params;
  const sigle = rawSigle.trim().toUpperCase();
  const rawOffset = request.nextUrl.searchParams.get("offset") ?? "0";
  const offset = Number(rawOffset);

  if (!sigle || sigle.length > 32) {
    return NextResponse.json({ error: "Sigla inválida" }, { status: 400 });
  }

  if (!Number.isSafeInteger(offset) || offset < 0) {
    return NextResponse.json({ error: "Offset inválido" }, { status: 400 });
  }

  try {
    const user = await authenticateUser();
    const page = await getCourseReviewsPage(sigle, user?.userId ?? null, REVIEWS_PER_PAGE, offset);

    return NextResponse.json(page, {
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Error loading course reviews", {
      sigle,
      offset,
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({ error: "No se pudieron cargar las reseñas" }, { status: 500 });
  }
}
