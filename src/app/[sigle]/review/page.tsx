import { createCourseReview } from "@/actions/user.reviews";
import FormReview from "@/components/reviews/FormReview";
import Trash from "@/components/reviews/TrashButton";
import { authenticateUser } from "@/lib/auth/auth";
import courseDescriptions from "@/lib/CoursesData";
import { getReviewBySigleAndUserId, getReviewContent } from "@/lib/reviews";
import { CourseReview } from "@/types/types";

export const runtime = "edge";

export default async function CatalogPage({ params }: { params: Promise<{ sigle: string }> }) {
  const resolvedParams = await params;
  const course = courseDescriptions[resolvedParams.sigle];

  if (!course) {
    return <p>Curso no encontrado</p>;
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
      <Trash review={review} />
      <FormReview sigle={course.sigle} initialValues={review} onSubmit={createCourseReview} />
    </main>
  );
}
