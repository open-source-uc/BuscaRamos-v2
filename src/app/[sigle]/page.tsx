import courseDescriptions from "@/lib/courseDescriptions";
import { getCourseReviews } from "../actions/reviews";

export const runtime = "edge";

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ sigle: string }>;
}) {
  const resolvedParams = await params; // ⚡ esto es lo nuevo en Next 15
  const course = courseDescriptions[resolvedParams.sigle];

  if (!course) {
    return <p>Curso no encontrado</p>;
  }

  const reviews = await getCourseReviews(resolvedParams.sigle, 100);

  return (
    <main className="flex justify-center items-start p-8 min-h-screen">
      <div className="max-w-3xl w-full flex flex-col space-y-6">
        <h1 className="text-4xl font-bold">{course.sigle}</h1>
        <p className="text-lg leading-relaxed">{course.description}</p>
      </div>
      <div className="max-w-3xl w-full flex flex-col space-y-4 mt-10">
        <h2 className="text-2xl font-semibold">Reseñas</h2>
        {reviews.length === 0 ? (
          <p>No hay reseñas para este curso.</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review.id} className="border p-4 rounded-lg shadow-sm">
                <p className="mt-2">{review.user_id}</p>
                <p>{review.comment_path}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
