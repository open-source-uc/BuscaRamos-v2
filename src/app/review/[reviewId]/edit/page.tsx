import FormReviewUpdate from "@/components/reviews/FormReviewUpdate";
import { getCourseStaticData } from "@/lib/coursesStaticData";
import { getCourseReviewById, getReviewContent } from "@/lib/reviews";
import { notFound } from "next/navigation";
import z from "zod";

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
    notFound();
  }

  const review = await getCourseReviewById(data.data.reviewId);
  if (!review) {
    notFound();
  }

  const comment = await getReviewContent(review.comment_path);
  const course = await getCourseStaticData(review.course_sigle);
  if (!course) {
    notFound();
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

export const runtime = "edge";
