import type { Metadata } from "next";
import { Building2, Clock3, MapPin } from "lucide-react";
import { redirect } from "next/navigation";
import { ClassroomSearch } from "@/components/courses/classrooms/ClassroomSearch";
import FreeClassrooms from "@/components/courses/classrooms/FreeClassrooms";
import { authenticateUser } from "@/lib/auth/auth";
import { BASE_URL, ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Salas",
  description: "Consulta salas libres y revisa su ocupación por módulo.",
};

export default async function ClassroomsPage() {
  const user = process.env.NODE_ENV === "development" ? true : await authenticateUser();

  if (!user) {
    redirect(`https://auth.osuc.dev?ref=${encodeURIComponent(`${BASE_URL}${ROUTES.CLASSROOMS}`)}`);
  }

  return (
    <main className="bg-background min-h-screen overflow-x-hidden">
      <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-4 tablet:px-6 tablet:py-10 lg:px-8 lg:py-14">
        <header className="border-border relative overflow-hidden border-y py-7 tablet:py-10">
          <div className="bg-blue border-blue-border absolute -top-20 -right-20 h-44 w-44 rounded-full border tablet:-right-16 tablet:h-64 tablet:w-64" />
          <div className="relative grid gap-7 tablet:grid-cols-[minmax(0,1fr)_14rem] tablet:items-end lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8">
            <div className="max-w-3xl">
              <h1 className="text-pretty text-4xl font-bold tracking-[-0.035em] tablet:text-5xl lg:text-6xl">
                Encuentra una sala antes de llegar.
              </h1>
              <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-7 tablet:text-lg">
                Consulta disponibilidad por campus y módulo, o revisa el horario completo de una
                sala.
              </p>
            </div>
            <div className="border-border bg-card relative grid max-w-md gap-3 border p-4 shadow-sm tablet:max-w-none tablet:self-end">
              <div className="bg-blue text-blue-foreground border-blue-border flex h-10 w-10 items-center justify-center border">
                <Building2 aria-hidden="true" className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold">Planifica por bloque</p>
              <p className="text-muted-foreground text-sm leading-5">
                La disponibilidad se calcula según el módulo y campus que selecciones.
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-8 py-8 tablet:gap-10 tablet:py-10 lg:grid-cols-12 lg:gap-12 lg:py-14">
          <div className="space-y-5 lg:col-span-7">
            <div className="flex items-start gap-3">
              <div className="bg-blue text-blue-foreground border-blue-border mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border">
                <MapPin aria-hidden="true" className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-semibold tracking-tight tablet:text-2xl">
                  Salas libres
                </h2>
                <p className="text-muted-foreground mt-1 text-sm leading-6">
                  Elige dónde y cuándo necesitas estudiar. Filtra los resultados cuando aparezcan.
                </p>
              </div>
            </div>
            <FreeClassrooms />
          </div>

          <div className="space-y-5 lg:col-span-5">
            <div className="flex items-start gap-3">
              <div className="bg-blue text-blue-foreground border-blue-border mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border">
                <Clock3 aria-hidden="true" className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-semibold tracking-tight tablet:text-2xl">
                  Horario de una sala
                </h2>
                <p className="text-muted-foreground mt-1 text-sm leading-6">
                  Busca una sala específica para revisar qué módulos están ocupados.
                </p>
              </div>
            </div>
            <ClassroomSearch />
          </div>
        </section>
      </div>
    </main>
  );
}
