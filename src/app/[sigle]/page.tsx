import courseDescriptions from "@/lib/courseDescriptions";
import { getCourseReviews } from "../actions/reviews";

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
        <p className="text-lg leading-relaxed text-gray-700">{course.description}</p>
      </div>

      {/* Reseñas */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Reseñas ({reviews.length})</h2>
        
        {reviews.length === 0 ? (
          <p className="text-gray-500">No hay reseñas para este curso.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm">
                <div className="text-sm text-gray-600 mb-2">
                  Usuario: {review.user_id}
                </div>
                <p className="text-gray-800">{review.comment_path}</p>
                {review.votes && (
                  <div className="mt-2 text-xs text-gray-500">
                    👍 {review.votes} votos
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}