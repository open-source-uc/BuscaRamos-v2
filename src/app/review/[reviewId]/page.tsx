import { getVoteOnReviewByUserId } from "@/actions/user.reviews";
import Review from "@/components/reviews/Review";
import CourseInformation from "@/components/ui/CourseInformation";
import courseDescriptions from "@/lib/CoursesData";
import { getCourseReviewById } from "@/lib/reviews";
import z from "zod";

export const runtime = "edge";

const paramsSchema = z.object({
  reviewId: z
    .string() // primero es string (viene de la URL)
    .transform((val) => parseInt(val, 10)) // lo convertimos a número
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

  const course = courseDescriptions[review.course_sigle];

  if (!course) {
    return <p>Curso no encontrado</p>;
  }

  course.name = "Reseña de: " + course.name;

  const vote = await getVoteOnReviewByUserId(review.id);

  return (
    <main className="p-4 space-y-6">
      <CourseInformation course={course} information />
      <Review review={review} initialVote={vote} />
    </main>
  );
}
