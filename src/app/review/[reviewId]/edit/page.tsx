import FormReviewUpdate from "@/components/reviews/FormReviewUpdate";
import courseDescriptions from "@/lib/CoursesData";
import { getCourseReviewById, getReviewContent } from "@/lib/reviews";
import z from "zod";

export const runtime = "edge";

const paramsSchema = z.object({
  reviewId: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "reviewId debe ser un número mayor a 0",
    }),
});

export default async function FindReview({ params }: { params: Promise<{ reviewId: string }> }) {
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
      <FormReviewUpdate
        sigle={review.course_sigle}
        initialValues={{
          ...review,
          comment,
        }}
        reviewId={review.id} // pasamos el ID, no la función
      />
    </main>
  );
}
