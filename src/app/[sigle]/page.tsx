import { getCourseReviews } from "../../actions/reviews";
import { AttendanceIcon, Sentiment, ThumbUpIcon, WorkloadIcon } from "@/components/icons";
import { getCourseStats, getPrerequisitesWithNamesFromStructure, getEquivalentsWithNames } from "@/lib/courses";
import {
  calculatePositivePercentage,
  calculateSentiment,
  formatWeeklyHours,
  getAttendanceLabel,
  getSentimentLabel,
  getWorkloadLabel,
} from "@/lib/courseStats";
import PrerequisitesSection from "@/components/courses/PrerequisitesSection";
import EquivCourses from "@/components/courses/EquivCourses";
import Review from "@/components/reviews/Review";
import CourseInformation from "@/components/ui/CourseInformation";
import { getVotesOnReviewsInCourseByUserID } from "@/actions/user.reviews";
import MakeReviewButton from "@/components/reviews/MakeReviewButton";
import type { Metadata } from "next";
import { getCourseStaticData } from "@/lib/coursesStaticData";
import { notFound } from "next/navigation";
import SectionsCollapsible from "@/components/courses/schedules/SectionsCollapsible";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sigle: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const course = await getCourseStaticData(resolvedParams.sigle);

  if (!course) {
    return {
      title: "Curso no encontrado - BuscaRamos",
      description: "El curso solicitado no se encuentra en nuestro catálogo.",
    };
  }

  const stats = await getCourseStats(resolvedParams.sigle);

  const positivePercentage = stats
    ? calculatePositivePercentage(stats.likes, stats.superlikes, stats.dislikes)
    : 0;
  const totalReviews = stats ? stats.likes + stats.superlikes + stats.dislikes : 0;

  const title = `${course.sigle} - ${course.name} | BuscaRamos`;
  const description = `${course.name} (${course.sigle}) - ${course.description ? course.description.substring(0, 120) + "..." : "Información del curso"} | ${totalReviews} reseñas de estudiantes | ${positivePercentage}% recomendación`;

  return {
    title,
    description,
    keywords: `${course.sigle}, ${course.name},curso, ramo, reseñas`,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://buscaramos.osuc.dev/${course.sigle}`,
      siteName: "BuscaRamos",
      images: [
        {
          url: "/images/opengraph.png",
          width: 1200,
          height: 630,
          alt: `${course.sigle} - ${course.name}`,
        },
      ],
      locale: "es_CL",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/opengraph.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: `https://buscaramos.osuc.dev/${course.sigle}`,
    },
  };
}

export default async function CatalogPage({ params }: { params: Promise<{ sigle: string }> }) {
  const resolvedParams = await params;
  const course = await getCourseStaticData(resolvedParams.sigle);

  if (!course) {
    notFound();
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
  const prerequisites = await getPrerequisitesWithNamesFromStructure(course.parsed_meta_data.prerequisites);
  const equivalents = await getEquivalentsWithNames(course.parsed_meta_data.equivalences);
  const userVotes = await getVotesOnReviewsInCourseByUserID(course.sigle);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Información del curso */}
      <CourseInformation
        course={course}
        description={course.description || undefined}
        information
      />
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
      <EquivCourses equivalents={equivalents} className="mt-8" />
      <SectionsCollapsible
        className="mt-8"
        courseSigle={course.sigle}
      />
      <section>

        <div className="space-y-6">
          {/* 👇 Título + botón alineados con flex */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Reseñas ({reviews.length})</h2>
            <MakeReviewButton sigle={course.sigle}></MakeReviewButton>
          </div>

          {reviews.length === 0 ? (
            <p className="text-gray-500">No hay reseñas para este curso.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Review
                  key={review.id}
                  review={review}
                  initialVote={userVotes[review.id] || null}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      {/* Reseñas */}
    </main>
  );
}
