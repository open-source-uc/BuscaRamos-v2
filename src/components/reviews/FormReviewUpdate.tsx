"use client";

import { updateCourseReview } from "@/actions/user.reviews";
import FormReview from "@/components/reviews/FormReview";
import { CourseReview } from "@/types/types";

interface FormReviewClientProps {
  sigle: string;
  initialValues?: CourseReview & {
    comment: string | null;
  };
  reviewId: number;
}

export default function FormReviewUpdate({
  sigle,
  initialValues,
  reviewId,
}: FormReviewClientProps) {
  const handleSubmit = async (data: FormData) => {
    return await updateCourseReview(reviewId, data);
  };

  return <FormReview sigle={sigle} initialValues={initialValues} onSubmit={handleSubmit} />;
}
