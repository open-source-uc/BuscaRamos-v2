"use client";

import { use, useState, Suspense } from "react";
import type { CourseStaticData } from "@/lib/coursesStaticData";
import { getCourseStaticDataClient } from "@/lib/coursesUnifiedClient";
import { Skeleton } from "@/components/ui/skeleton";
import Review from "./Review";
import { CourseReview } from "@/types/types";

function ReviewSkeleton() {
  return (
    <div className="relative bg-background border border-border flex flex-col gap-4 rounded-sm p-5 overflow-hidden w-full">
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-8 w-36 rounded-lg" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>
    </div>
  );
}

function ReviewContent({
  review,
  coursePromise,
  status,
  editable,
  hideLike,
}: {
  review: CourseReview;
  coursePromise: Promise<CourseStaticData | null>;
  status?: boolean;
  editable?: boolean;
  hideLike?: boolean;
}) {
  const course = use(coursePromise);
  return (
    <Review
      review={review}
      course={course ?? undefined}
      status={status}
      editable={editable}
      hideLike={hideLike}
    />
  );
}

export function ReviewWithCourse({
  review,
  status,
  editable,
  hideLike,
}: {
  review: CourseReview;
  status?: boolean;
  editable?: boolean;
  hideLike?: boolean;
}) {
  const [coursePromise] = useState(() => getCourseStaticDataClient(review.course_sigle));

  return (
    <Suspense fallback={<ReviewSkeleton />}>
      <ReviewContent
        review={review}
        coursePromise={coursePromise}
        status={status}
        editable={editable}
        hideLike={hideLike}
      />
    </Suspense>
  );
}
