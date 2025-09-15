import courseDescriptions from "@/lib/courseDescriptions";
import { getCourseReviews } from "../../actions/reviews";
import { Button } from "@/components/ui/button"; // 👈 import del botón de shadcn/ui
import Link from "next/link";
import ShareButton from "@/components/reviews/Share";
import ReportButton from "@/components/reviews/Report";

export const runtime = "edge";

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ sigle: string }>;
}) {
  const resolvedParams = await params;
  const course = courseDescriptions[resolvedParams.sigle];

  if (!course) {
    return <p>Curso no encontrado</p>;
  }

  const reviews = await getCourseReviews(resolvedParams.sigle, 100);

  return (
    <main className="max-w-4xl mx-auto p-8 space-y-8">
      {/* Información del curso */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">{course.sigle}</h1>
        <p className="text-lg leading-relaxed text-gray-700">
          {course.description}
        </p>
      </div>

      {/* Reseñas */}
      <div className="space-y-6">
        {/* 👇 Título + botón alineados con flex */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            Reseñas ({reviews.length})
          </h2>
  <Button asChild>
    <Link href={`/${course.sigle}/review`}>
      Reseñar curso
    </Link>
  </Button>
        </div>

        {reviews.length === 0 ? (
          <p className="text-gray-500">No hay reseñas para este curso.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm"
              >
                <div className="text-sm text-gray-600 mb-2">
                  Usuario: {review.user_id} - Id: {review.id}
                </div>
                <p className="text-gray-800">{review.comment}</p>
                <div className="flex item-center justify-start gap-2">
                <ShareButton title={"Reseña - " + course.name} path={"/review/" + review.id}></ShareButton>
                <ReportButton reviewId={review.id}></ReportButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
