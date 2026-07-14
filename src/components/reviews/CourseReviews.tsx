"use client";

import useSWRInfinite from "swr/infinite";

import type { CourseReview } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Review from "./Review";

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
  return response.json() as Promise<ReviewsPage>;
};

function ReviewsSkeleton() {
  return (
    <div className="space-y-4" aria-label="Cargando reseñas" aria-busy="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="border border-border rounded-sm p-5 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-20 w-10" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-7 w-36" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CourseReviews({ sigle }: { sigle: string }) {
  const getKey = (pageIndex: number, previousPage: ReviewsPage | null) => {
    if (previousPage && !previousPage.hasMore) return null;
    const offset = pageIndex === 0 ? 0 : previousPage?.nextOffset;
    if (offset === undefined) return null;
    return `/api/courses/${encodeURIComponent(sigle)}/reviews?offset=${offset}`;
  };

  const { data, error, isLoading, isValidating, size, setSize, mutate } =
    useSWRInfinite<ReviewsPage>(getKey, fetcher, {
      revalidateFirstPage: false,
      revalidateOnFocus: false,
    });

  if (isLoading && !data) {
    return <ReviewsSkeleton />;
  }

  const pages = data ?? [];
  const seen = new Set<number>();
  const reviews = pages.flatMap((page) =>
    page.reviews.filter((review) => {
      if (seen.has(review.id)) return false;
      seen.add(review.id);
      return true;
    })
  );
  const userVotes = Object.assign({}, ...pages.map((page) => page.userVotes)) as Record<
    number,
    1 | -1
  >;
  const lastPage = pages.at(-1);
  const isLoadingMore = isValidating && size > pages.length;

  if (error && reviews.length === 0) {
    return (
      <div className="border border-border border-dashed rounded-md px-6 py-10 text-center space-y-4">
        <p className="text-sm text-muted-foreground">No se pudieron cargar las reseñas.</p>
        <Button variant="outline" onClick={() => void mutate()} loading={isValidating}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return <p className="text-gray-500">No hay reseñas para este curso.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Review key={review.id} review={review} initialVote={userVotes[review.id] ?? null} />
      ))}

      {(lastPage?.hasMore || error) && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => (error ? void mutate() : void setSize(size + 1))}
            loading={isLoadingMore}
            loadingText="Cargando..."
          >
            {error ? "Reintentar" : "Ver más"}
          </Button>
        </div>
      )}
    </div>
  );
}
