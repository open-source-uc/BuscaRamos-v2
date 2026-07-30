"use client";

import { useMemo, useState } from "react";
import CourseReviews from "./CourseReviews";
import MakeReviewButton from "./MakeReviewButton";
import { Search } from "@/components/search/SearchInput";
import { CourseStaticData } from "@/lib/coursesStaticData";
import { useCourseReviews } from "@/hooks/useCourseReviews";
import { useFuse } from "@/hooks/useFuse";

interface CourseReviewsSectionProps {
  course: CourseStaticData;
  totalReviews: number;
}

export default function CourseReviewsSection({ course, totalReviews }: CourseReviewsSectionProps) {
  const [searchValue, setSearchValue] = useState("");

  const {
    reviews,
    markdowns,
    userVotes,
    hasMore,
    isLoading,
    isValidating,
    error,
    markdownLoading,
    markdownError,
    loadMore,
    retry,
  } = useCourseReviews(course.sigle);

  const reviewsWithMarkdown = useMemo(() => {
    return reviews.map((review) => ({
      ...review,
      comment: markdowns?.get(review.id) ?? "",
    }));
  }, [reviews, markdowns]);

  const fuseSearch = useFuse({
    data: reviewsWithMarkdown,
    query: searchValue,
    keys: ["comment"],
  });

  const filteredReviews = useMemo(() => {
    if (searchValue.trim() !== "") {
      return fuseSearch.results;
    }

    return reviews;
  }, [searchValue, fuseSearch.results, reviews]);

  const handleSearch = (normalizedValue: string) => {
    setSearchValue(normalizedValue);
  };

  return (
    <section>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Reseñas ({totalReviews})</h2>
          <MakeReviewButton sigle={course.sigle} />
        </div>
        <Search
          onSearch={handleSearch}
          placeholder="Busca por palabras claves..."
          initialValue={searchValue}
        />
        <CourseReviews
          reviews={filteredReviews}
          markdowns={markdowns}
          userVotes={userVotes}
          hasMore={hasMore}
          isLoading={isLoading}
          isValidating={isValidating}
          error={error}
          markdownLoading={markdownLoading}
          markdownError={markdownError}
          onLoadMore={loadMore}
          onRetry={retry}
        />
      </div>
    </section>
  );
}
