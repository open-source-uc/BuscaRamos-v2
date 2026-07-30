"use client";

import type { CourseReview } from "@/types/types";
import { ChevronDownIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import Review from "./Review";

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

interface CourseReviewsProps {
  reviews: CourseReview[];
  markdowns?: Map<number, string>;
  searchValue?: string;
  markdownLoading: boolean;
  markdownError: boolean;
  userVotes: Record<number, 1 | -1>;
  hasMore: boolean;
  isValidating: boolean;
  isLoading: boolean;
  error: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
}

export default function CourseReviews({
  reviews,
  markdowns,
  searchValue = "",
  markdownLoading,
  markdownError,
  userVotes,
  hasMore,
  isValidating,
  isLoading,
  error,
  onLoadMore,
  onRetry,
}: CourseReviewsProps) {
  if (isLoading && !reviews) {
    return <ReviewsSkeleton />;
  }

  if (error && reviews.length === 0) {
    return (
      <div className="border border-border border-dashed rounded-md px-6 py-10 text-center space-y-4">
        <p className="text-sm text-muted-foreground">No se pudieron cargar las reseñas.</p>
        <Button variant="outline" onClick={onRetry} loading={isValidating}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (reviews.length === 0) {
    if (searchValue?.trim()) {
      return (
        <div className="rounded-lg border border-border bg-accent px-6 py-10 text-center">
          <p className="font-medium">No se encontraron reseñas.</p>
          <p className="mt-1 text-sm text-muted-foreground">Prueba con otras palabras clave.</p>
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-border bg-accent px-6 py-10 text-center">
        <p className="font-medium">No encontramos reseñas para el curso.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Review
          key={review.id}
          review={review}
          searchValue={searchValue}
          markdown={markdowns?.get(review.id)}
          markdownLoading={markdownLoading}
          markdownError={markdownError}
          initialVote={userVotes[review.id] ?? null}
        />
      ))}

      {(hasMore || error) && (
        <div className="flex justify-center pt-2">
          <Button
            size="lg"
            icon={error ? undefined : ChevronDownIcon}
            className="w-full tablet:max-w-md font-semibold"
            onClick={onLoadMore}
            loading={isValidating}
            loadingText="Cargando más reseñas..."
          >
            {error ? "Reintentar" : "Ver más reseñas"}
          </Button>
        </div>
      )}
    </div>
  );
}
