import Link from "next/link";
import type { ComponentType } from "react";

import {
  ArrowUpRightIcon,
  CheckIcon,
  ClockIcon,
  EyeIcon,
  FlagIcon,
  StarIcon,
  ThumbDownIcon,
  ThumbUpIcon,
  UsersIcon,
} from "@/components/icons";
import RegenerateCatalogButton from "@/components/admin/RegenerateCatalogButton";
import { Pill } from "@/components/ui/pill";
import { getRecentReviews, getReviewCountsByStatus } from "@/lib/reviews";
import { CourseReview } from "@/types/types";

const STATUS_PILL: Record<
  number,
  { label: string; variant: "orange" | "green" | "red" | "purple" }
> = {
  0: { label: "Pendiente", variant: "orange" },
  1: { label: "Aprobada", variant: "green" },
  2: { label: "Reportada", variant: "red" },
  3: { label: "Oculta", variant: "purple" },
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatCard({
  href,
  label,
  count,
  detail,
  icon: Icon,
  accent,
}: {
  href?: string;
  label: string;
  count: number;
  detail: string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 shrink-0 ${accent}`} />
      </div>
      <p className="mt-2 text-3xl font-bold tabular-nums">{count}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </>
  );

  if (!href) {
    return <div className="border-border rounded-md border p-5">{body}</div>;
  }

  return (
    <Link
      href={href}
      className="border-border hover:bg-accent group relative rounded-md border p-5 transition-colors"
    >
      <ArrowUpRightIcon className="absolute top-4 right-4 h-4 w-4 fill-current opacity-0 transition-opacity group-hover:opacity-60" />
      {body}
    </Link>
  );
}

function RecommendationPill({ review }: { review: CourseReview }) {
  if (review.like_dislike === 2) {
    return (
      <Pill variant="green" size="xs" icon={StarIcon}>
        Lo super recomienda
      </Pill>
    );
  }
  if (review.like_dislike === 1) {
    return (
      <Pill variant="blue" size="xs" icon={ThumbUpIcon}>
        Lo recomienda
      </Pill>
    );
  }
  return (
    <Pill variant="red" size="xs" icon={ThumbDownIcon}>
      No lo recomienda
    </Pill>
  );
}

export default async function AdminPage() {
  // Aqui no hay proteccion de login pues esta en el layout de /admin
  const [counts, recentReviews] = await Promise.all([
    getReviewCountsByStatus(),
    getRecentReviews(8),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Cabecera */}
      <section className="border-border mb-8 rounded-md border px-6 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Panel de Administración</h1>
            <p className="text-muted-foreground">
              Gestiona reseñas, monitorea la actividad del sistema y revisa métricas importantes
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Pill variant="blue" icon={UsersIcon}>
              Administrador
            </Pill>
            <Pill variant="ghost_blue">{counts.total} reseñas en total</Pill>
          </div>
        </div>
      </section>

      {/* Métricas por estado */}
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 desktop:grid-cols-4">
        <StatCard
          href="/admin/reviews-pending"
          label="Pendientes"
          count={counts.pending}
          detail="Esperando moderación"
          icon={ClockIcon}
          accent="fill-orange"
        />
        <StatCard
          href="/admin/reviews-reported"
          label="Reportadas"
          count={counts.reported}
          detail="Reportadas por la comunidad"
          icon={FlagIcon}
          accent="fill-red"
        />
        <StatCard
          href="/admin/reviews-hidden"
          label="Ocultas"
          count={counts.hidden}
          detail="No visibles en la plataforma"
          icon={EyeIcon}
          accent="fill-purple"
        />
        <StatCard
          label="Aprobadas"
          count={counts.approved}
          detail="Visibles en la plataforma"
          icon={CheckIcon}
          accent="fill-green"
        />
      </section>

      {/* Mantenimiento */}
      <section className="border-border mb-8 rounded-md border px-6 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Catálogo de cursos</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Regenera courses-score.ndjson (se actualiza automáticamente cada 8 horas)
            </p>
          </div>
          <RegenerateCatalogButton />
        </div>
      </section>

      {/* Actividad Reciente */}
      <section className="border-border rounded-md border">
        <div className="border-border border-b px-6 py-4">
          <h2 className="text-xl font-semibold">Actividad Reciente</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Últimas reseñas enviadas por los estudiantes
          </p>
        </div>

        {recentReviews.length === 0 ? (
          <p className="text-muted-foreground px-6 py-12 text-center text-sm">
            Aún no hay reseñas en la plataforma.
          </p>
        ) : (
          <ul className="divide-border divide-y">
            {recentReviews.map((review) => {
              const status = STATUS_PILL[review.status] ?? STATUS_PILL[0];
              return (
                <li key={review.id}>
                  <Link
                    href={`/review/${review.id}`}
                    className="hover:bg-accent flex flex-col gap-2 px-6 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="font-semibold">{review.course_sigle}</span>
                      <RecommendationPill review={review} />
                      <Pill variant={status.variant} size="xs">
                        {status.label}
                      </Pill>
                    </div>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {formatDate(review.created_at)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
