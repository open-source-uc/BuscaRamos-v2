import { calculatePositivePercentage, calculateSentiment } from "@/lib/courseStats";
import { CourseScore } from "@/types/types";
import { Table } from "@tanstack/react-table";
import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import TableCourseCampuses from "./TableCourseCampuses";
import { AreaIcon, OpenInFullIcon, Sentiment } from "../icons";
import { Pill } from "../ui/pill";
import { Button } from "../ui/button";

interface MobileTableProps {
    table: Table<CourseScore>;
    itemsPerPage?: number;
}

export default function MobileTable({ table, itemsPerPage = 10 }: MobileTableProps) {

    return (
        <div className="desktop:hidden w-full pt-4">
            {table.getRowModel().rows?.length ? (
                <>
                    <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
                        {table.getRowModel().rows.map((row) => {
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
                                <a
                                    key={row.id}
                                    href={`/${course.sigle}`}
                                    className="flex flex-col h-full border-border hover:bg-muted/50 focus:bg-muted/50 focus:ring-ring cursor-pointer rounded-md border p-4 transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none w-full no-underline"
                                    aria-label={`Ver detalles del curso ${course.sigle} - ${course.name}`}
                                >
                                    {/* Header con sigla y créditos */}
                                    <div className="mb-2 flex items-start justify-between">
                                        <div className="text-foreground text-xs font-medium">{course.sigle}</div>
                                        <div className="text-muted-foreground text-xs">{course.credits} créditos</div>
                                    </div>

                                    {/* Nombre del curso */}
                                    <h3 className="text-foreground mb-3 text-lg leading-tight font-semibold wrap-break-word w-full overflow-hidden">
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
                                    <div className="text-muted-foreground mt-auto pt-4 flex flex-row-reverse items-center gap-1 text-xs">
                                        <OpenInFullIcon className="inline-block h-4 w-4" /> Presiona para ver detalles
                                    </div>
                                </a>
                            );
                        })}
                    </div>

                </>
            ) : (
                <div className="text-muted-foreground py-8 text-center">No se encontraron cursos.</div>
            )}
            <div className="flex items-center justify-end space-x-2 py-4 w-full">
                <div className="text-foreground-muted-dark flex-1 text-sm">
                    {table.getFilteredRowModel().rows.length} cursos encontrados
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Anterior
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Siguiente
                    </Button>
                </div>
            </div>
        </div>
    );
}
