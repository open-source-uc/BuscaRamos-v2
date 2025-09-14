export const runtime = "edge";
import courseDescriptions from "@/lib/courseDescriptions";
import { getCourseReviews } from "../actions/reviews";
type Params = Promise<{ sigle: string }>

export default async function CatalogPage({ params }: { params: Params }) {
  const resolvedParams = await params;
  const course = courseDescriptions[resolvedParams.sigle];
  const reviews = await getCourseReviews(resolvedParams.sigle, 100);
  return (
    <main className="flex justify-center items-start p-8 min-h-screen">
      <div className="max-w-3xl w-full flex flex-col space-y-6">
        <h1 className="text-4xl font-bold">{course.sigle}</h1>
        <p className="text-lg leading-relaxed">{course.description}</p>
      </div>
      {reviews.length > 0 && (
        reviews.map((review) => (
          <div key={review.id} className="max-w-3xl w-full flex flex-col space-y-4 mt-8 p-4 border rounded-lg shadow-sm">
            <div className="flex items-center space-x-4">
              <span className="font-mono text-sm text-gray-500">Año: {review.year_taken} - Semestre: {review.semester_taken}</span>
              <span className="font-mono text-sm text-gray-500">Votos: {review.votes}</span>
            </div>
            <div className="text-sm">
              <p><strong>Tipo de asistencia:</strong> {review.attendance_type}</p>
              <p><strong>Horas semanales:</strong> {review.weekly_hours}</p>
              <p><strong>Carga de trabajo:</strong> {review.workload_vote}</p>
              <p><strong>Opinión:</strong> {review.comment_path}</p>
            </div>
          </div>
        ))
      )}
      
    </main>
  );
}