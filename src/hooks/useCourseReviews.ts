"use client";

import useSWRInfinite from "swr/infinite";
import { useMemo } from "react";

import type { CourseReview } from "@/types/types";
import { useReviewMarkdowns } from "./useReviewMarkdowns";

interface ReviewsPage {
  reviews: CourseReview[];
  userVotes: Record<number, 1 | -1>;
  hasMore: boolean;
  nextOffset: number;
}

const fetcher = async (url: string): Promise<ReviewsPage> => {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("No se pudieron cargar las reseñas");
  }

  return response.json();
};

export function useCourseReviews(sigle: string) {
  const getKey = (pageIndex: number, previousPage: ReviewsPage | null) => {
    if (previousPage && !previousPage.hasMore) return null;

    const offset = pageIndex === 0 ? 0 : previousPage?.nextOffset;

    if (offset === undefined) return null;

    return `/api/courses/${encodeURIComponent(sigle)}/reviews?offset=${offset}`;
  };

  const swr = useSWRInfinite(getKey, fetcher, {
    revalidateFirstPage: false,
    revalidateOnFocus: false,
  });

  const pages = useMemo(() => swr.data ?? [], [swr.data]);

  const reviews = useMemo(() => {
    const seen = new Set<number>();

    return pages.flatMap((page) =>
      page.reviews.filter((review) => {
        if (seen.has(review.id)) return false;
        seen.add(review.id);
        return true;
      })
    );
  }, [pages]);

  const markdowns = useReviewMarkdowns(reviews);

  const userVotes = useMemo(
    () => Object.assign({}, ...pages.map((page) => page.userVotes)) as Record<number, 1 | -1>,
    [pages]
  );

  return {
    reviews,
    userVotes,
    markdowns: markdowns.data,
    markdownLoading: markdowns.isLoading,
    markdownError: markdowns.error,
    hasMore: pages.at(-1)?.hasMore ?? false,

    isLoading: swr.isLoading,
    isValidating: swr.isValidating,
    error: !!swr.error,

    loadMore: () => swr.setSize(swr.size + 1),
    retry: () => swr.mutate(),
  };
}
