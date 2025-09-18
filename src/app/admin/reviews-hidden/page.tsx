import { ClockIcon } from "@/components/icons";
import ChangeStatusForm from "@/components/reviews/FormChangeStatus";
import Review from "@/components/reviews/Review";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { coursesStaticData } from "@/lib/coursesStaticData";
import { getReviewsByStatus } from "@/lib/reviews";

export const runtime = "edge";

export default async function PendingPage() {
  const reviews = await getReviewsByStatus(3, 100);
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
              {reviews.length} Ocultas
            </Pill>
          </div>
        </div>
      </section>
      <section className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-center text-muted-foreground">No hay reseñas por ver.</p>
        ) : (
          reviews.map((review) => (
            <div className="space-y-4 border-2 rounded-sm" key={review.id}>
              <ChangeStatusForm review_id={review.id} />
              <Review
                key={review.id}
                review={review}
                editable
                hideLike
                course={coursesStaticData()[review.course_sigle]}
              />
            </div>
          ))
        )}
      </section>
    </div>
  );
}
