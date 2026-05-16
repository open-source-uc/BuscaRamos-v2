import { ReviewWithCourse } from "@/components/reviews/ReviewWithCourse";
import { authenticateUser } from "@/lib/auth/auth";
import { getUserReviews } from "@/lib/reviews";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Profile() {
  const user = await authenticateUser();

  if (!user) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="text-foreground/60 text-sm">Debes iniciar sesión para ver tu perfil.</p>
      </main>
    );
  }

  const reviews = await getUserReviews(user.userId, 10);

  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <main className="max-w-3xl mx-auto px-4 tablet:px-6 py-10 space-y-10">
      {/* Profile card */}
      <div className="border border-border rounded-xl p-6 tablet:p-8 flex flex-col tablet:flex-row gap-6 tablet:items-start bg-background">
        {/* Avatar */}
        <div
          className="shrink-0 w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold select-none"
          style={{ background: "oklch(0.22 0.01 250)", color: "oklch(0.95 0 0)" }}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <h1 className="text-xl font-semibold leading-tight">{user.username}</h1>
            {user.career && <p className="text-sm text-foreground/60 mt-0.5">{user.career.name}</p>}
          </div>

          {user.organizations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {user.organizations.map((org) => (
                <span
                  key={org.name}
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-border bg-background text-foreground/70"
                >
                  <span className="font-medium text-foreground">{org.display_name}</span>
                  <span className="text-foreground/40">·</span>
                  <span>{org.role}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Settings link */}
        <Button asChild variant="outline" size="sm" className="shrink-0 self-start">
          <Link href="https://auth.osuc.dev/" target="_blank" rel="noopener noreferrer">
            Configuración de cuenta
          </Link>
        </Button>
      </div>

      {/* Reviews section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/50">
            Mis reseñas
          </h2>
          <span className="text-xs text-foreground/40">{reviews.length}</span>
        </div>

        {reviews.length === 0 ? (
          <div className="border border-border border-dashed rounded-xl px-6 py-16 text-center space-y-2">
            <p className="text-sm font-medium text-foreground/50">Sin reseñas aún</p>
            <p className="text-xs text-foreground/35">Tus reseñas de cursos aparecerán aquí.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewWithCourse key={review.id} review={review} status editable hideLike />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
