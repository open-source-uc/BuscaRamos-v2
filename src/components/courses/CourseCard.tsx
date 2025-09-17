import { CourseScore } from "@/types/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { Sentiment } from "@/components/icons/sentiment";
import { calculateSentiment, calculatePositivePercentage } from "@/lib/courseStats";
import { IconButton } from "@/components/ui/icon-button";
import { StarIcon, BuildingIcon } from "@/components/icons";
import Link from "next/link";

interface CourseCardProps {
  course: CourseScore;
  showDetails?: boolean;
  onFavorite?: (sigle: string) => void;
  isFavorite?: boolean;
}

export function CourseCard({ 
  course, 
  showDetails = true, 
  onFavorite,
  isFavorite = false 
}: CourseCardProps) {
  const totalReviews = course.likes + course.superlikes + course.dislikes;
  const sentimentType = totalReviews > 0 
    ? calculateSentiment(course.likes, course.superlikes, course.dislikes)
    : "question";
  const positivePercentage = totalReviews > 0
    ? calculatePositivePercentage(course.likes, course.superlikes, course.dislikes)
    : 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight">
              <Link 
                href={`/${course.sigle}`}
                className="hover:text-primary transition-colors"
              >
                {course.sigle}
              </Link>
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {course.name}
            </CardDescription>
          </div>
          <CardAction>
            <div className="flex items-center gap-2">
              {onFavorite && (
                <IconButton
                  variant={isFavorite ? "default" : "ghost"}
                  size="icon-sm"
                  icon={StarIcon}
                  onClick={() => onFavorite(course.sigle)}
                  aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                />
              )}
              <Sentiment
                sentiment={sentimentType}
                size="sm"
                percentage={positivePercentage}
                reviewCount={totalReviews}
                ariaLabel={`${positivePercentage}% de reseñas positivas de ${totalReviews} total`}
              />
            </div>
          </CardAction>
        </div>
      </CardHeader>

      {showDetails && (
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Créditos</span>
            <span className="font-medium">{course.credits}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Escuela</span>
            <span className="font-medium text-right">{course.school}</span>
          </div>

          {course.campus && course.campus.length > 0 && (
            <div className="flex items-start justify-between text-sm">
              <span className="text-muted-foreground">Campus</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {course.campus.slice(0, 2).map((campus, index) => (
                  <Pill key={index} variant="blue" size="xs">
                    {campus}
                  </Pill>
                ))}
                {course.campus.length > 2 && (
                  <Pill variant="ghost_blue" size="xs">
                    +{course.campus.length - 2}
                  </Pill>
                )}
              </div>
            </div>
          )}

          {course.area && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Área FG</span>
              <Pill variant="pink" size="xs">{course.area}</Pill>
            </div>
          )}

          {course.format && course.format.length > 0 && (
            <div className="flex items-start justify-between text-sm">
              <span className="text-muted-foreground">Formato</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {course.format.slice(0, 2).map((format, index) => (
                  <Pill key={index} variant="green" size="xs">
                    {format}
                  </Pill>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <span className="text-muted-foreground">Último semestre</span>
            <span className="font-medium">{course.last_semester}</span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// Export compound components for different use cases
export function CourseCardCompact({ course, ...props }: CourseCardProps) {
  return <CourseCard course={course} showDetails={false} {...props} />;
}

export function CourseCardGrid({ courses, ...props }: { courses: CourseScore[] } & Omit<CourseCardProps, 'course'>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((course) => (
        <CourseCard key={course.sigle} course={course} {...props} />
      ))}
    </div>
  );
}