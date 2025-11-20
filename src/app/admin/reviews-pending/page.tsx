import { ClockIcon } from "@/components/icons";
import ChangeStatusForm from "@/components/reviews/FormChangeStatus";
import Review from "@/components/reviews/Review";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { getCourseStaticData } from "@/lib/coursesStaticData";
import { getReviewsByStatus } from "@/lib/reviews";

export const runtime = "edge";

export default async function PendingPage() {
  const reviews = await getReviewsByStatus(0, 100);

  // Obtener datos de cursos para todas las reseñas
  const reviewsWithCourses = await Promise.all(
    reviews.map(async (review) => {
      const course = await getCourseStaticData(review.course_sigle);
      return { review, course };
    })
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <section className="border border-border rounded-md px-6 py-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                href="/admin"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                ← Volver al Panel
              </Button>
            </div>
            <h1 className="text-3xl font-bold mb-2">Reseñas Pendientes</h1>
            <p className="text-muted-foreground">
              Revisa y modera las reseñas enviadas por los estudiantes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Pill variant="orange" icon={ClockIcon}>
              {reviews.length === 100 && "+"}
              {reviews.length} Pendientes
            </Pill>
          </div>
        </div>
      </section>
      <section className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-center text-muted-foreground">No hay reseñas por ver.</p>
        ) : (
          reviewsWithCourses.map(({ review, course }) => (
            <div key={review.id} className="flex flex-col gap-4 bg-yellow-50 p-4">
              <ChangeStatusForm review={review} />
              <Review
                key={review.id}
                review={review}
                editable
                hideLike
                course={course || undefined}
              />
            </div>
          ))
        )}
      </section>
    </div>
  );
}
