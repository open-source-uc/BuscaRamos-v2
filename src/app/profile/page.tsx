export const runtime = "edge";

import { authenticateUser } from "@/lib/auth/auth";
import { getReviewContent, getUserReviews } from "@/lib/reviews";

export default async function Profile() {
    const user = await authenticateUser()

    if (!user) {
        return <p className="text-center">Debes iniciar sesión para ver tu perfil.</p>
    }

    const r = await getUserReviews(user.userId, 10)
    const reviews = await Promise.all(r.map(async (review) => {
        const comment = await getReviewContent(review.comment_path) ?? undefined;
        return {
            ...review,
            comment
        }
    }))

    return (
        <main className="max-w-4xl mx-auto p-8 space-y-8">
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
              </div>
            ))}
          </div>
        )}
        </main>
    )
}