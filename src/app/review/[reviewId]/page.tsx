import { getVoteOnReviewByUserId } from "@/actions/user.reviews";
import Review from "@/components/reviews/Review";
import CourseInformation from "@/components/ui/CourseInformation";
import { getCourseStaticData } from "@/lib/coursesStaticData";
import { getCourseReviewById, getReviewContent } from "@/lib/reviews";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import z from "zod";

export const runtime = "edge";

const paramsSchema = z.object({
  reviewId: z
    .string() // primero es string (viene de la URL)
    .transform((val) => parseInt(val, 10)) // lo convertimos a número
    .refine((val) => !isNaN(val) && val > 0, {
      message: "reviewId debe ser un númer|o mayor a 0",
    }),
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ reviewId: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const data = paramsSchema.safeParse(resolvedParams);

  if (!data.success) {
    return {
      title: "Reseña no encontrada - BuscaRamos",
      description: "La reseña solicitada no se encuentra disponible.",
    };
  }

  const review = await getCourseReviewById(data.data.reviewId);

  if (!review) {
    return {
      title: "Reseña no encontrada - BuscaRamos",
      description: "La reseña solicitada no se encuentra disponible.",
    };
  }

  const course = await getCourseStaticData(review.course_sigle);

  if (!course) {
    return {
      title: "Curso no encontrado - BuscaRamos",
      description: "El curso asociado a esta reseña no se encuentra disponible.",
    };
  }

  // Get review sentiment emoji
  const getSentimentText = (likeDislike: number) => {
    switch (likeDislike) {
      case 1:
        return "👍 Recomendada";
      case 2:
        return "❤️ Muy recomendada";
      case 0:
        return "👎 No recomendada";
      default:
        return "📝";
    }
  };

  const sentimentText = getSentimentText(review.like_dislike);
  // For now, we'll use a generic description since comment content needs to be fetched separately
  const reviewSnippet = await getReviewContent(review.comment_path);

  const title = `${sentimentText} | ${course.sigle} - ${course.name} | BuscaRamos`;
  const description = reviewSnippet ?? "Reseña no disponible";

  return {
    title,
    description,
    keywords: `reseña, ${course.sigle}, ${course.name}, opinión estudiante.`,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://buscaramos.com/review/${review.id}`,
      siteName: "BuscaRamos",
      images: [
        {
          url: "/images/opengraph.png",
          width: 1200,
          height: 630,
          alt: `Reseña de ${course.sigle} - ${course.name}`,
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
      canonical: `https://buscaramos.com/review/${review.id}`,
    },
  };
}

export default async function FindReview({ params }: { params: Promise<{ reviewId: string }> }) {
  const resolvedParams = await params;
  const data = paramsSchema.safeParse(resolvedParams);
  if (!data.success) {
    notFound();
  }

  const review = await getCourseReviewById(data.data.reviewId);

  if (!review) {
    notFound();
  }

  const course = await getCourseStaticData(review.course_sigle);

  if (!course) {
    notFound();
  }

  const vote = await getVoteOnReviewByUserId(review.id);

  return (
    <main className="p-4 space-y-6">
      <CourseInformation course={course} information />
      <Review review={review} initialVote={vote} />
    </main>
  );
}
