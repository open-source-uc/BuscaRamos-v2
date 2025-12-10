import { calculatePositivePercentage, calculateSentiment } from "@/lib/courseStats";
import { CourseScore } from "@/types/types";
import { Table } from "@tanstack/react-table";
import { useEffect, useRef, useCallback, useState } from "react";
import TableCourseCampuses from "./TableCourseCampuses";
import { AreaIcon, OpenInFullIcon, Sentiment } from "../icons";
import { Pill } from "../ui/pill";

interface MovilTableProps {
  table: Table<CourseScore>;
  itemsPerPage?: number;
}

export default function MovilTable({ table, itemsPerPage = 10 }: MovilTableProps) {
  const [displayedItems, setDisplayedItems] = useState(itemsPerPage);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const allRows = table.getFilteredRowModel().rows;
  const visibleRows = allRows.slice(0, displayedItems);
  const hasMore = displayedItems < allRows.length;

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    // Simulate loading delay (remove in production if not needed)
    setTimeout(() => {
      setDisplayedItems((prev) => Math.min(prev + itemsPerPage, allRows.length));
      setIsLoading(false);
    }, 300);
  }, [isLoading, hasMore, itemsPerPage, allRows.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "20px",
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore, hasMore, isLoading]);

  // Reset displayed items when table data changes (e.g., filtering)
  useEffect(() => {
    setDisplayedItems(itemsPerPage);
  }, [table.getFilteredRowModel().rows.length, itemsPerPage]);

  return (
    <div className="desktop:hidden w-full pt-4">
      {visibleRows?.length ? (
        <>
          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
            {visibleRows.map((row) => {
              const course = row.original;
              const totalReviews = course.likes + course.superlikes + course.dislikes;
              const sentimentType = calculateSentiment(
                course.likes,
                course.superlikes,
                course.dislikes
              );
              const positivePercentage = calculatePositivePercentage(
                course.likes,
                course.superlikes,
                course.dislikes
              );

            return (
              /* Versión para móvil */
              <div
                key={row.id}
                className="border-border hover:bg-muted/50 cursor-pointer rounded-md border p-4 transition-colors w-full relative"
              >
                <a
                  href={`/${course.sigle}`}
                  className="absolute inset-0 z-10 rounded-md"
                  aria-label={`Ver detalles del curso ${course.sigle} - ${course.name}`}
                >
                  <span className="sr-only">Ver detalles de {course.sigle} - {course.name}</span>
                </a>
                  {/* Header con sigla y créditos */}
                  <div className="mb-2 flex items-start justify-between">
                    <div className="text-foreground text-xs font-medium">{course.sigle}</div>
                    <div className="text-muted-foreground text-xs">{course.credits} créditos</div>
                  </div>

                  {/* Nombre del curso */}
                  <h3 className="text-foreground mb-3 text-lg leading-tight font-semibold break-words w-full overflow-hidden">
                    {course.name}
                  </h3>

                  <div className="flex flex-col gap-2">
                    {/* Campus */}
                    <div className="flex items-center">
                      <TableCourseCampuses
                        variant="with-icon"
                        campus={course.campus || []}
                        lastSemester={course.last_semester}
                      />
                    </div>

                    {/* Área de Formación General */}
                    {Array.isArray(course.area) &&
                      course.area.length > 0 &&
                      course.area.some((a) => a && String(a).trim() !== "") && (
                        <div className="flex items-center">
                          <Pill variant="pink" size="sm" icon={AreaIcon}>
                            {course.area.filter((a) => a && String(a).trim() !== "").join(", ")}
                          </Pill>
                        </div>
                      )}
                    {/* Reseñas con componente Sentiment */}
                    <div className="flex items-center justify-between">
                      {totalReviews === 0 ? (
                        <Sentiment sentiment="question" size="xs" />
                      ) : (
                        <Sentiment
                          sentiment={sentimentType}
                          size="xs"
                          percentage={positivePercentage}
                          reviewCount={totalReviews}
                          ariaLabel={`${positivePercentage}% de reseñas positivas de ${totalReviews} total`}
                        />
                      )}
                    </div>
                  </div>
                  <div className="text-muted-foreground mt-4 flex flex-row-reverse items-center gap-1 text-xs">
                    <OpenInFullIcon className="inline-block h-4 w-4" /> Presiona para ver detalles
                  </div>
                </div>
              );
            })}
          </div>

          {/* Loading indicator and intersection observer target */}
          {hasMore && (
            <div ref={observerTarget} className="py-4 text-center">
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"></div>
                  <span className="text-muted-foreground text-sm">Cargando más cursos...</span>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">
                  Mostrando {displayedItems} de {allRows.length} cursos
                </div>
              )}
            </div>
          )}

          {/* Show completion message when all items are loaded */}
          {!hasMore && allRows.length > itemsPerPage && (
            <div className="py-4 text-center">
              <div className="text-muted-foreground text-sm">
                Todos los {allRows.length} cursos han sido cargados
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-muted-foreground py-8 text-center">No se encontraron cursos.</div>
      )}
    </div>
  );
}
