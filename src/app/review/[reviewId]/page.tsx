import courseDescriptions from "@/lib/courseDescriptions";
import { getCourseReviewById, getReviewContent } from "@/lib/reviews";
import z from "zod";

export const runtime = "edge";

const paramsSchema = z.object({
  reviewId: z
    .string()                  // primero es string (viene de la URL)
    .transform((val) => parseInt(val, 10)) // lo convertimos a número
    .refine((val) => !isNaN(val) && val > 0, {
      message: "reviewId debe ser un número mayor a 0",
    }),
});

export default async function FindReview({
  params,
}: {
  params: Promise<{ reviewId: string }>;
}) {
    const resolvedParams = await params;
    const data = paramsSchema.safeParse(resolvedParams);
    if (!data.success) {
      return <p>ID de reseña inválido {data.error.message}</p>;
    }

    const review = await getCourseReviewById(data.data.reviewId);

    if (!review) {
      return <p>Reseña no encontrada</p>;
    }

    const comment = await getReviewContent(review.comment_path);
    const course = courseDescriptions[review.course_sigle];
    
    if (!course) {
    return <p>Curso no encontrado</p>;
    }
    
    return (
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">Reseña #{review.id}</h1>
        <p><strong>Curso:</strong> {course.name}</p>
        <p><strong>Estado:</strong> {review.status === 1 ? 'Visible' : review.status === 2 ? 'Reportada' : 'Oculta'}</p>
        <p><strong>Sigla:</strong> {review.course_sigle}</p>
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Comentario:</h2>
          <div className="prose max-w-none">
            {comment ? comment : <p>No hay comentario.</p>}
          </div>
        </div>
      </main>
    );
}