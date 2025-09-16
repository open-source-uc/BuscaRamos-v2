import courseDescriptions from "@/lib/CoursesData";
import { getCourseReviews } from "../../actions/reviews";
import { Button } from "@/components/ui/button"; // 👈 import del botón de shadcn/ui
import Link from "next/link";
import { AttendanceIcon, Sentiment, ThumbUpIcon, WorkloadIcon } from "@/components/icons";
import { getCourseStats, getPrerequisitesWithNames } from "@/lib/courses";
import {
  calculatePositivePercentage,
  calculateSentiment,
  formatWeeklyHours,
  getAttendanceLabel,
  getSentimentLabel,
  getWorkloadLabel,
} from "@/lib/courseStats";
import PrerequisitesSection from "@/components/courses/PrerequisitesSection";
import Review from "@/components/reviews/Review";
import CourseInformation from "@/components/ui/CourseInformation";

export const runtime = "edge";

export default async function CatalogPage({ params }: { params: Promise<{ sigle: string }> }) {
  const resolvedParams = await params;
  const course = courseDescriptions[resolvedParams.sigle];

  if (!course) {
    return <p>Curso no encontrado</p>;
  }

  const c = await getCourseStats(resolvedParams.sigle);

  const reviews = await getCourseReviews(resolvedParams.sigle, 100);

  const sentiment = c ? calculateSentiment(c.likes, c.superlikes, c.dislikes) : "question";
  const positivePercentage = c ? calculatePositivePercentage(c.likes, c.superlikes, c.dislikes) : 0;
  const workloadLabel = c
    ? getWorkloadLabel(c.votes_low_workload, c.votes_medium_workload, c.votes_high_workload)
    : "Sin datos";
  const attendanceLabel = c
    ? getAttendanceLabel(c.votes_mandatory_attendance, c.votes_optional_attendance, 0)
    : "Sin datos";
  const weeklyHoursLabel = c ? formatWeeklyHours(c.avg_weekly_hours) : "Sin datos";
  const totalReviews = c ? c.likes + c.superlikes + c.dislikes : 0;
  const prerequisites = await getPrerequisitesWithNames(course.req);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Información del curso */}
      <CourseInformation course={course} description information />
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <div className="border border-border bg-accent rounded-md p-6">
          <div className="flex items-center gap-3 mb-3">
            <Sentiment sentiment={sentiment} size="default" />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Opinión General</h3>
              <p className="text-lg font-semibold">{getSentimentLabel(sentiment)}</p>
            </div>
          </div>
          {totalReviews > 0 && (
            <div className="text-sm text-muted-foreground">
              {positivePercentage}% positivas de {totalReviews} reseñas
            </div>
          )}
        </div>

        <div className="border border-border bg-accent rounded-md p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-light text-blue border border-blue/20 rounded-lg">
              <WorkloadIcon className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Nivel de Dificultad</h3>
              <p className="text-lg font-semibold">{workloadLabel}</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">{weeklyHoursLabel} semanales</div>
        </div>

        <div className="border border-border bg-accent rounded-md p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-light text-purple border border-purple/20 rounded-lg">
              <AttendanceIcon className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Asistencia</h3>
              <p className="text-lg font-semibold">{attendanceLabel}</p>
            </div>
          </div>
          {c && (
            <div className="text-sm text-muted-foreground">
              Basado en {c.votes_mandatory_attendance + c.votes_optional_attendance} votos
            </div>
          )}
        </div>

        <div className="border border-border bg-accent rounded-md p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-light text-green border border-green/20 rounded-lg">
              <ThumbUpIcon className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total Reseñas</h3>
              <p className="text-lg font-semibold">{totalReviews}</p>
            </div>
          </div>
          {c && (
            <div className="flex gap-2 text-sm">
              <span className="text-green">{c.likes + c.superlikes} ↑</span>
              <span className="text-red">{c.dislikes} ↓</span>
            </div>
          )}
        </div>
      </section>
      <PrerequisitesSection prerequisites={prerequisites} className="mt-8" />
      <section>
        <div className="space-y-6">
          {/* 👇 Título + botón alineados con flex */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Reseñas ({reviews.length})</h2>
            <Button asChild>
              <Link href={`/${course.sigle}/review`}>Reseñar curso</Link>
            </Button>
          </div>

          {reviews.length === 0 ? (
            <p className="text-gray-500">No hay reseñas para este curso.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Review key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </section>
      {/* Reseñas */}
    </main>
  );
}
