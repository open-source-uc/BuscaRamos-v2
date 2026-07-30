"use client";

import useSWR from "swr";
import type { CourseReview } from "@/types/types";

async function fetchMarkdowns(reviews: CourseReview[]) {
  const entries = await Promise.all(
    reviews.map(async (review) => {
      if (!review.comment_path) {
        return [review.id, ""] as const;
      }

      const res = await fetch(`/api/reviews?path=${encodeURIComponent(review.comment_path)}`);

      if (!res.ok) {
        throw new Error(`Error cargando review ${review.id}`);
      }

      return [review.id, await res.text()] as const;
    })
  );

  return new Map(entries);
}

export function useReviewMarkdowns(reviews: CourseReview[]) {
  return useSWR(
    reviews.length === 0 ? null : ["review-markdowns", reviews.map((r) => r.comment_path)],
    () => fetchMarkdowns(reviews),
    {
      revalidateOnFocus: false,
    }
  );
}
