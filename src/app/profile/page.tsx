export const runtime = "edge";

import Review from "@/components/reviews/Review";
import { authenticateUser } from "@/lib/auth/auth";
import { getUserReviews } from "@/lib/reviews";
import { getCourseStaticData } from "@/lib/coursesStaticData";
import Link from "next/link";

export default async function Profile() {
  const user = await authenticateUser();

  if (!user) {
    return <p className="text-center">Debes iniciar sesión para ver tu perfil.</p>;
  }

  const reviews = await getUserReviews(user.userId, 10);
  
  // Obtener datos de cursos para todas las reseñas
  const reviewsWithCourses = await Promise.all(
    reviews.map(async (review) => {
      const course = await getCourseStaticData(review.course_sigle);
      return { review, course };
    })
  );

  return (
    <main className="max-w-6xl mx-auto p-8 space-y-8">
      <div>
        <Link href="https://auth.osuc.dev/" className="underline">
          Ir a configuración de usuario
        </Link>
      </div>
      {reviews.length === 0 ? (
        <p className="text-gray-500">No hay reseñas para este curso.</p>
      ) : (
        <div className="space-y-4">
          {reviewsWithCourses.map(({ review, course }) => (
            <Review
              key={review.id}
              review={review}
              status
              editable
              course={course || undefined}
              hideLike
            />
          ))}
        </div>
      )}
    </main>
  );
}
