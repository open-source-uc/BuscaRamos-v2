import { UsersIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
export const runtime = "edge";

export default async function AdminPage() {
  // Aqui no hay proteccion de login pues esta en el middleware
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <section className="border-border mb-8 rounded-md border px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Panel de Administración</h1>
            <p className="text-muted-foreground">
              Gestiona reseñas, monitorea la actividad del sistema y revisa métricas importantes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Pill variant="blue" icon={UsersIcon}>
              {" "}
              Administrador{" "}
            </Pill>
          </div>
        </div>
      </section>
      <section className="border-border rounded-md border">
        <div className="border-border border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Actividad Reciente</h2>
            <div className="flex gap-2">
              <Button variant="outline" href="/admin/reviews-pending" size="sm">
                Ver Pendientes
              </Button>
              <Button variant="outline" href="/admin/reviews-reported" size="sm">
                Ver Reportadas
              </Button>
              <Button variant="outline" href="/admin/reviews-hidden" size="sm">
                {" "}
                Ver Ocultas{" "}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
