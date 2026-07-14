import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Review from "@/components/reviews/Review";
import { Button } from "@/components/ui/button";
import { getCourseStaticData } from "@/lib/coursesStaticData";
import { getLatestReviewsPage } from "@/lib/latestReviews";
import { ROUTES } from "@/lib/routes";

const REVIEWS_PER_PAGE = 10;
const MAX_PAGE = 1_000;

export const metadata: Metadata = {
  title: "Últimas reseñas",
  description: "Revisa las opiniones más recientes sobre cursos de la UC.",
  alternates: {
    canonical: ROUTES.REVIEWS,
  },
};

function parsePage(value: string | string[] | undefined) {
  if (value === undefined) return 1;
  if (Array.isArray(value) || !/^\d+$/.test(value)) return null;

  const page = Number(value);
  if (!Number.isSafeInteger(page) || page < 1 || page > MAX_PAGE) return null;

  return page;
}

function pageHref(page: number) {
  return page === 1 ? ROUTES.REVIEWS : `${ROUTES.REVIEWS}?page=${page}`;
}

function formatCreatedAt(createdAt: string) {
  const normalizedDate = createdAt.includes("T") ? createdAt : `${createdAt.replace(" ", "T")}Z`;

  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeZone: "America/Santiago",
  }).format(new Date(normalizedDate));
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { page: rawPage } = await searchParams;
  const page = parsePage(rawPage);

  if (page === null) notFound();

  const latestReviews = await getLatestReviewsPage(page, REVIEWS_PER_PAGE);

  if (page > 1 && latestReviews.reviews.length === 0) notFound();

  const reviewsWithCourses = await Promise.all(
    latestReviews.reviews.map(async (review) => ({
      review,
      course: await getCourseStaticData(review.course_sigle),
    }))
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 tablet:px-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tablet:text-4xl">Últimas reseñas</h1>
        <p className="text-muted-foreground max-w-2xl">
          Conoce las experiencias más recientes de estudiantes en cursos de la UC.
        </p>
      </header>

      {reviewsWithCourses.length === 0 ? (
        <section className="border-border bg-background rounded-md border p-8 text-center">
          <h2 className="text-xl font-semibold">Aún no hay reseñas publicadas</h2>
          <p className="text-muted-foreground mt-2">
            Cuando se publique una reseña, aparecerá en esta página.
          </p>
        </section>
      ) : (
        <section className="flex flex-col gap-6" aria-label="Reseñas recientes">
          {reviewsWithCourses.map(({ review, course }) => (
            <article key={review.id} className="space-y-2">
              <p className="text-muted-foreground text-right text-xs">
                Publicada el{" "}
                <time dateTime={review.created_at}>{formatCreatedAt(review.created_at)}</time>
              </p>
              <Review review={review} course={course ?? undefined} />
            </article>
          ))}
        </section>
      )}

      {(page > 1 || latestReviews.hasMore) && (
        <nav
          className="border-border flex items-center justify-between gap-4 border-t pt-6"
          aria-label="Paginación de reseñas"
        >
          <Button
            variant="outline"
            href={page > 1 ? pageHref(page - 1) : undefined}
            disabled={page === 1}
            rel="prev"
          >
            ← Anterior
          </Button>

          <span className="text-muted-foreground text-sm">Página {page}</span>

          <Button
            variant="outline"
            href={latestReviews.hasMore ? pageHref(page + 1) : undefined}
            disabled={!latestReviews.hasMore}
            rel="next"
          >
            Siguiente →
          </Button>
        </nav>
      )}

      <p className="text-muted-foreground text-center text-xs">
        La lista se actualiza aproximadamente cada 5 minutos.
      </p>
    </main>
  );
}
