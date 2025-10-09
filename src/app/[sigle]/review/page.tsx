import { createCourseReview } from "@/actions/user.reviews";
import FormReview from "@/components/reviews/FormReview";
import { authenticateUser } from "@/lib/auth/auth";
import { coursesStaticData } from "@/lib/coursesStaticData";
import { getReviewBySigleAndUserId, getReviewContent } from "@/lib/reviews";
import { CourseReview } from "@/types/types";
import { notFound } from "next/navigation";

export const runtime = "edge";

export default async function WriteReview({ params }: { params: Promise<{ sigle: string }> }) {
  const resolvedParams = await params;
  const course = coursesStaticData()[resolvedParams.sigle];

  if (!course) {
    notFound();
  }

  const user = await authenticateUser();
  let review: (CourseReview & { comment: string | null }) | undefined = undefined;
  if (user) {
    const r = (await getReviewBySigleAndUserId(course.sigle, user.userId)) ?? undefined;
    const comment = r ? await getReviewContent(r.comment_path) : null;
    if (r) {
      review = {
        ...r,
        comment,
      };
    }
  }

  return (
    <main>
      <FormReview sigle={course.sigle} initialValues={review} onSubmit={createCourseReview} />
    </main>
  );
}
