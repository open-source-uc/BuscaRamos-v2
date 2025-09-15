import courseDescriptions from "@/lib/CoursesData";
import { getCourseReviews } from "../../actions/reviews";
import { Button } from "@/components/ui/button"; // 👈 import del botón de shadcn/ui
import Link from "next/link";
import ShareButton from "@/components/reviews/Share";
import ReportButton from "@/components/reviews/Report";
import { Pill } from "@/components/ui/pill";
import { AreaIcon, AttendanceIcon, BuildingIcon, CheckIcon, CloseIcon, HourglassIcon, LanguageIcon, Sentiment, ThumbUpIcon, WorkloadIcon } from "@/components/icons";
import CourseCampuses from "@/components/courses/CourseCampuses";
import { getCourseStats, getPrerequisitesWithNames } from "@/lib/courses";
import { calculatePositivePercentage, calculateSentiment, formatWeeklyHours, getAttendanceLabel, getSentimentLabel, getWorkloadLabel } from "@/lib/courseStats";
import PrerequisitesSection from "@/components/courses/PrerequisitesSection";

export const runtime = "edge";

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ sigle: string }>;
}) {
  const resolvedParams = await params;
  const course = courseDescriptions[resolvedParams.sigle];

  if (!course) {
    return <p>Curso no encontrado</p>;
  }

  const c = await getCourseStats(resolvedParams.sigle)

  const reviews = await getCourseReviews(resolvedParams.sigle, 100);


const sentiment = c
    ? calculateSentiment(c.likes, c.superlikes, c.dislikes)
    : "question";
const positivePercentage = c
    ? calculatePositivePercentage(c.likes, c.superlikes, c.dislikes)
    : 0;
const workloadLabel = c
    ? getWorkloadLabel(
          c.votes_low_workload,
          c.votes_medium_workload,
          c.votes_high_workload,
      )
    : "Sin datos";
const attendanceLabel = c
    ? getAttendanceLabel(
          c.votes_mandatory_attendance,
          c.votes_optional_attendance,
          0,
      )
    : "Sin datos";
const weeklyHoursLabel = c
    ? formatWeeklyHours(c.avg_weekly_hours)
    : "Sin datos";
const totalReviews = c ? c.likes + c.superlikes + c.dislikes : 0;
const prerequisites = await getPrerequisitesWithNames(course.req);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Información del curso */}
        <section className="border border-border rounded-md bg-accent px-6 py-8">
            <p className="text-sm">{course.sigle}</p>

            <div className="pt-2 flex items-center justify-between">
                <h1 className="text-3xl font-bold mb-2 max-w-[75%]">{course.name}</h1>
                <Pill
                    variant="green"
                    size="xl"
                    icon={HourglassIcon}
                    className="hidden desktop:flex text-nowrap"
                >
                    {course.credits} Créditos
                </Pill>
            </div>
            <div>
                <p className="text-sm text-accent-foreground max-w-[75%]">{course.description}</p>
            </div>
            <div className="flex items-center flex-wrap gap-2 mt-8">
                <CourseCampuses campus={course.campus} lastSemester={course.last_semester}/>
                <Pill
                    variant="green"
                    icon={HourglassIcon}
                    className="desktop:hidden"
                >
                    {course.credits} Créditos
                </Pill>
                {
                   course.school &&
                         course.school !== "" && (
                            <Pill variant="orange" icon={BuildingIcon}>
                                <span>{ course.school}</span>
                            </Pill>
                        )
                }
                {
                    course.area &&
                        course.area !== "" && (
                            <Pill variant="pink" icon={AreaIcon}>
                                {course.area}
                            </Pill>
                        )
                }
                {
                    course.is_removable &&
                        course.is_removable.length > 0 && (
                            <Pill 
                                variant={course.is_removable.some(removable => removable) ? "green" : "red"} 
                                icon={course.is_removable.some(removable => removable) ? CheckIcon : CloseIcon}
                            >
                                {course.is_removable.some(removable => removable) ? "Retirable" : "No retirable"}
                            </Pill>
                        )
                }
                {
                    course.is_english &&
                        course.is_english.length > 0 && 
                        course.is_english.some(english => english) && (
                            <Pill variant="purple" icon={LanguageIcon}>
                                Se dicta en Inglés
                            </Pill>
                        )
                }
                
            </div>
        </section>
        <section
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8"
        >
            <div className="border border-border bg-accent rounded-md p-6">
                <div className="flex items-center gap-3 mb-3">
                    <Sentiment sentiment={sentiment} size="default" />
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Opinión General
                        </h3>
                        <p className="text-lg font-semibold">
                            {getSentimentLabel(sentiment)}
                        </p>
                    </div>
                </div>
                {
                    totalReviews > 0 && (
                        <div className="text-sm text-muted-foreground">
                            {positivePercentage}% positivas de {totalReviews}{" "}
                            reseñas
                        </div>
                    )
                }
            </div>

            <div className="border border-border bg-accent rounded-md p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div
                        className="p-2 bg-blue-light text-blue border border-blue/20 rounded-lg"
                    >
                        <WorkloadIcon className="h-5 w-5 fill-current" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                             Nivel de Dificultad
                        </h3>
                        <p className="text-lg font-semibold">{workloadLabel}</p>
                    </div>
                </div>
                <div className="text-sm text-muted-foreground">
                    {weeklyHoursLabel} semanales
                </div>
            </div>

            <div className="border border-border bg-accent rounded-md p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div
                        className="p-2 bg-purple-light text-purple border border-purple/20 rounded-lg"
                    >
                        <AttendanceIcon className="h-5 w-5 fill-current" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Asistencia
                        </h3>
                        <p className="text-lg font-semibold">{attendanceLabel}</p>
                    </div>
                </div>
                {
                    c && (
                        <div className="text-sm text-muted-foreground">
                            Basado en{" "}
                            {c.votes_mandatory_attendance +
                                c.votes_optional_attendance}{" "}
                            votos
                        </div>
                    )
                }
            </div>

            <div className="border border-border bg-accent rounded-md p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div
                        className="p-2 bg-green-light text-green border border-green/20 rounded-lg"
                    >
                        <ThumbUpIcon className="h-5 w-5 fill-current" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Total Reseñas
                        </h3>
                        <p className="text-lg font-semibold">{totalReviews}</p>
                    </div>
                </div>
                {
                    c && (
                        <div className="flex gap-2 text-sm">
                            <span className="text-green">
                                {c.likes + c.superlikes} ↑
                            </span>
                            <span className="text-red">{c.dislikes} ↓</span>
                        </div>
                    )
                }
            </div>
        </section>
        <PrerequisitesSection prerequisites={prerequisites} className="mt-8"/>

      {/* Reseñas */}
      <div className="space-y-6">
        {/* 👇 Título + botón alineados con flex */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            Reseñas ({reviews.length})
          </h2>
  <Button asChild>
    <Link href={`/${course.sigle}/review`}>
      Reseñar curso
    </Link>
  </Button>
        </div>

        {reviews.length === 0 ? (
          <p className="text-gray-500">No hay reseñas para este curso.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm"
              >
                <div className="text-sm text-gray-600 mb-2">
                  Usuario: {review.user_id} - Id: {review.id}
                </div>
                <p className="text-gray-800">{review.comment}</p>
                <div className="flex item-center justify-start gap-2">
                <ShareButton title={"Reseña - " + course.name} path={"/review/" + review.id}></ShareButton>
                <ReportButton reviewId={review.id}></ReportButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
