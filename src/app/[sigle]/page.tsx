import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourseReviews } from "../../actions/reviews";
import { getVotesOnReviewsInCourseByUserID } from "@/actions/user.reviews";
import { calculatePositivePercentage } from "@/lib/courseStats";
import { staticDataClient } from "@/lib/static-data-api/client";
import Review from "@/components/reviews/Review";
import MakeReviewButton from "@/components/reviews/MakeReviewButton";
import CourseDetailClient from "@/components/courses/CourseDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sigle: string }>;
}): Promise<Metadata> {
  const { sigle } = await params;
  const { data: course } = await staticDataClient.GET("/data/{sigle}", {
    params: { path: { sigle: sigle.toUpperCase() } },
  });

  if (!course) {
    return {
      title: "Curso no encontrado - BuscaRamos",
      description: "El curso solicitado no se encuentra en nuestro catálogo.",
    };
  }

  const positivePercentage = calculatePositivePercentage(
    course.likes,
    course.superlikes,
    course.dislikes
  );
  const totalReviews = course.likes + course.superlikes + course.dislikes;
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

export default async function CoursePage({ params }: { params: Promise<{ sigle: string }> }) {
  const { sigle } = await params;

  const [{ data: course }, reviews, userVotes] = await Promise.all([
    staticDataClient.GET("/data/{sigle}", {
      params: { path: { sigle: sigle.toUpperCase() } },
    }),
    getCourseReviews(sigle, 100),
    getVotesOnReviewsInCourseByUserID(sigle),
  ]);

  if (!course) notFound();

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <CourseDetailClient sigle={course.sigle} />
      <section>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Reseñas ({reviews.length})</h2>
            <MakeReviewButton sigle={course.sigle} />
          </div>
          {reviews.length === 0 ? (
            <p className="text-gray-500">No hay reseñas para este curso.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Review
                  key={review.id}
                  review={review}
                  initialVote={(userVotes as Record<number, 1 | -1>)[review.id] ?? null}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
